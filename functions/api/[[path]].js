const SESSION_COOKIE = "mca_session";
const STATE_COOKIE = "mca_oauth_state";
const SESSION_DAYS = 30;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function redirect(location, headers = {}) {
  return new Response(null, { status: 302, headers: { location, ...headers } });
}

function parseCookies(request) {
  const raw = request.headers.get("cookie") || "";
  const out = {};
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

function cookie(name, value, options = {}) {
  const bits = [name + "=" + encodeURIComponent(value), "Path=/", "SameSite=Lax"];
  if (options.httpOnly !== false) bits.push("HttpOnly");
  if (options.secure !== false) bits.push("Secure");
  if (options.maxAge != null) bits.push("Max-Age=" + options.maxAge);
  return bits.join("; ");
}

function randomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function requireBinding(env, name) {
  if (!env[name]) throw new Error("Missing required Cloudflare binding: " + name);
  return env[name];
}

async function currentUser(env, request) {
  if (!env.DB) return null;
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;
  const hash = await sha256Hex(token);
  const row = await env.DB.prepare(
    `SELECT u.id,u.email,u.name,u.avatar_url,u.membership_status,u.is_admin,u.is_president,s.expires_at
     FROM sessions s
     JOIN users u ON u.id=s.user_id
     WHERE s.token_hash=? AND datetime(s.expires_at) > datetime('now')`
  ).bind(hash).first();
  if (!row) return null;
  const leader = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM trip_leaders tl
     JOIN trips t ON t.id=tl.trip_id
     WHERE tl.user_id=? AND t.status='published'`
  ).bind(row.id).first();
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    membership_status: row.membership_status,
    is_admin: !!row.is_admin,
    is_president: !!row.is_president,
    is_trip_leader: Number(leader?.count || 0) > 0
  };
}

function cleanName(value) {
  return String(value || "").trim().slice(0, 120) || "MCA Member";
}

function intId(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function canManageTrip(env, user, tripId) {
  if (user.is_admin || user.is_president) return true;
  const row = await env.DB.prepare(
    "SELECT 1 AS ok FROM trip_leaders WHERE trip_id=? AND user_id=?"
  ).bind(tripId, user.id).first();
  return !!row;
}

async function handleLogin(context) {
  const { env, request } = context;
  requireBinding(env, "DB");
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return json({ error: "Google sign-in is not configured yet." }, 503);
  }
  const url = new URL(request.url);
  const state = randomToken();
  const redirectUri = url.origin + "/api/auth/callback";
  const auth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  auth.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "openid email profile");
  auth.searchParams.set("state", state);
  auth.searchParams.set("prompt", "select_account");
  return redirect(auth.toString(), {
    "set-cookie": cookie(STATE_COOKIE, state, { maxAge: 600 })
  });
}

async function handleCallback(context) {
  const { env, request } = context;
  requireBinding(env, "DB");
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookies = parseCookies(request);
  if (!code || !state || !cookies[STATE_COOKIE] || state !== cookies[STATE_COOKIE]) {
    return json({ error: "Invalid OAuth state." }, 400);
  }

  const redirectUri = url.origin + "/api/auth/callback";
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });
  if (!tokenResponse.ok) return json({ error: "Google sign-in failed during token exchange." }, 502);
  const tokens = await tokenResponse.json();

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: "Bearer " + tokens.access_token }
  });
  if (!profileResponse.ok) return json({ error: "Could not read Google profile." }, 502);
  const profile = await profileResponse.json();
  if (!profile.email || profile.email_verified === false) {
    return json({ error: "A verified email address is required." }, 403);
  }

  const email = String(profile.email).trim().toLowerCase();
  const presidentEmail = String(env.PRESIDENT_EMAIL || "").trim().toLowerCase();
  const adminEmails = String(env.ADMIN_EMAILS || "")
    .split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
  const isPresident = presidentEmail && email === presidentEmail ? 1 : 0;
  const isAdmin = isPresident || adminEmails.includes(email) ? 1 : 0;

  await env.DB.prepare(
    `INSERT INTO users (email,name,avatar_url,is_admin,is_president)
     VALUES (?,?,?,?,?)
     ON CONFLICT(email) DO UPDATE SET
       name=excluded.name,
       avatar_url=excluded.avatar_url,
       is_admin=CASE WHEN excluded.is_admin=1 THEN 1 ELSE users.is_admin END,
       is_president=excluded.is_president,
       updated_at=CURRENT_TIMESTAMP`
  ).bind(email, cleanName(profile.name), profile.picture || null, isAdmin, isPresident).run();

  const user = await env.DB.prepare("SELECT id FROM users WHERE email=?").bind(email).first();
  const token = randomToken(40);
  const tokenHash = await sha256Hex(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();

  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')"),
    env.DB.prepare("INSERT INTO sessions (token_hash,user_id,expires_at) VALUES (?,?,?)")
      .bind(tokenHash, user.id, expiresAt)
  ]);

  return redirect("/portal/", {
    "set-cookie": cookie(SESSION_COOKIE, token, { maxAge: SESSION_DAYS * 86400 })
  });
}

async function handleLogout(context) {
  const { env, request } = context;
  if (env.DB) {
    const token = parseCookies(request)[SESSION_COOKIE];
    if (token) {
      const hash = await sha256Hex(token);
      await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(hash).run();
    }
  }
  return new Response(null, {
    status: 204,
    headers: { "set-cookie": cookie(SESSION_COOKIE, "", { maxAge: 0 }) }
  });
}

async function handleMe(env, user) {
  const support = await env.DB.prepare(
    `SELECT COALESCE(SUM(amount_cents),0) AS cents
     FROM support_records
     WHERE user_id=? AND date(contribution_date) >= date('2026-07-01')
       AND date(contribution_date) < date('2027-07-01')`
  ).bind(user.id).first();
  return json({ user, annual_support_cents: Number(support?.cents || 0) });
}

async function listTrips(env, user) {
  const trips = await env.DB.prepare(
    `SELECT t.*,
      (SELECT COUNT(*) FROM trip_participants tp WHERE tp.trip_id=t.id) AS roster_count,
      (SELECT status FROM trip_applications ta WHERE ta.trip_id=t.id AND ta.user_id=?) AS my_application_status
     FROM trips t
     WHERE t.status='published'
     ORDER BY CASE WHEN t.starts_at IS NULL THEN 1 ELSE 0 END, t.starts_at, t.title`
  ).bind(user.id).all();

  const leaders = await env.DB.prepare(
    `SELECT tl.trip_id,u.id AS user_id,u.name,u.membership_status
     FROM trip_leaders tl JOIN users u ON u.id=tl.user_id
     ORDER BY u.name`
  ).all();

  const byTrip = {};
  for (const l of leaders.results || []) (byTrip[l.trip_id] ||= []).push(l);
  return json({ trips: (trips.results || []).map(t => ({ ...t, leaders: byTrip[t.id] || [] })) });
}

async function tripDetail(env, user, tripId) {
  const trip = await env.DB.prepare(
    `SELECT t.*,
      (SELECT status FROM trip_applications ta WHERE ta.trip_id=t.id AND ta.user_id=?) AS my_application_status
     FROM trips t WHERE t.id=? AND t.status!='draft'`
  ).bind(user.id, tripId).first();
  if (!trip) return json({ error: "Trip not found." }, 404);

  const [leaders, roster, gear] = await env.DB.batch([
    env.DB.prepare(
      "SELECT u.id,u.name,u.membership_status FROM trip_leaders tl JOIN users u ON u.id=tl.user_id WHERE tl.trip_id=? ORDER BY u.name"
    ).bind(tripId),
    env.DB.prepare(
      "SELECT u.id,u.name,u.membership_status FROM trip_participants tp JOIN users u ON u.id=tp.user_id WHERE tp.trip_id=? ORDER BY u.name"
    ).bind(tripId),
    env.DB.prepare(
      `SELECT gi.id,gi.asset_code,gi.name,u.name AS holder
       FROM gear_checkouts gc
       JOIN gear_items gi ON gi.id=gc.gear_item_id
       JOIN users u ON u.id=gc.user_id
       WHERE gc.trip_id=? AND gc.returned_at IS NULL
       ORDER BY gi.name`
    ).bind(tripId)
  ]);

  return json({
    trip,
    leaders: leaders.results || [],
    roster: roster.results || [],
    gear: gear.results || []
  });
}

async function applyToTrip(env, user, tripId, request) {
  const trip = await env.DB.prepare("SELECT * FROM trips WHERE id=? AND status='published'").bind(tripId).first();
  if (!trip) return json({ error: "Trip not found." }, 404);
  if (!trip.application_open) return json({ error: "Applications are closed." }, 409);
  const now = new Date();
  if (trip.application_opens_at && now < new Date(trip.application_opens_at)) return json({ error: "Applications are not open yet." }, 409);
  if (trip.application_closes_at && now > new Date(trip.application_closes_at)) return json({ error: "Applications are closed." }, 409);

  const existing = await env.DB.prepare(
    "SELECT id,status FROM trip_applications WHERE trip_id=? AND user_id=?"
  ).bind(tripId, user.id).first();
  if (existing && ["accepted","waitlisted","declined"].includes(existing.status)) {
    return json({ error: "This application already has a final decision." }, 409);
  }

  let body = {};
  try { body = await request.json(); } catch {}
  const answers = JSON.stringify(body.answers && typeof body.answers === "object" ? body.answers : {});

  await env.DB.prepare(
    `INSERT INTO trip_applications (trip_id,user_id,answers_json,status)
     VALUES (?,?,?,'submitted')
     ON CONFLICT(trip_id,user_id) DO UPDATE SET
       answers_json=excluded.answers_json,
       status='submitted',
       leader_recommendation=NULL,
       leader_reviewed_by=NULL,
       leader_reviewed_at=NULL,
       president_decision=NULL,
       president_reviewed_by=NULL,
       president_reviewed_at=NULL,
       updated_at=CURRENT_TIMESTAMP`
  ).bind(tripId, user.id, answers).run();

  return json({ ok: true, status: "submitted" }, 201);
}

async function myApplications(env, user) {
  const rows = await env.DB.prepare(
    `SELECT ta.id,ta.status,ta.leader_recommendation,ta.president_decision,ta.submitted_at,ta.updated_at,
            t.id AS trip_id,t.slug,t.title,t.starts_at,t.ends_at
     FROM trip_applications ta JOIN trips t ON t.id=ta.trip_id
     WHERE ta.user_id=? ORDER BY ta.submitted_at DESC`
  ).bind(user.id).all();
  return json({ applications: rows.results || [] });
}

async function listGear(env) {
  const rows = await env.DB.prepare(
    `SELECT gi.id,gi.asset_code,gi.name,gi.category,gi.manufacturer,gi.model,gi.notes,
            gc.id AS checkout_id,gc.user_id,gc.trip_id,gc.checked_out_at,gc.due_at,
            u.name AS holder,t.title AS trip_title
     FROM gear_items gi
     LEFT JOIN gear_checkouts gc ON gc.gear_item_id=gi.id AND gc.returned_at IS NULL
     LEFT JOIN users u ON u.id=gc.user_id
     LEFT JOIN trips t ON t.id=gc.trip_id
     WHERE gi.active=1
     ORDER BY gi.category,gi.name`
  ).all();
  return json({ gear: rows.results || [] });
}

async function grantStatus(env, user) {
  const settings = await env.DB.prepare(
    "SELECT key,value FROM portal_settings WHERE key IN ('grant_name','grant_cycle','grant_deadline')"
  ).all();
  const settingMap = Object.fromEntries((settings.results || []).map(x => [x.key,x.value]));
  const latest = await env.DB.prepare(
    "SELECT id,cycle,original_file_name,file_size,status,submitted_at,updated_at FROM grant_applications WHERE user_id=? ORDER BY submitted_at DESC LIMIT 1"
  ).bind(user.id).first();
  return json({ settings: settingMap, application: latest || null });
}

async function submitGrant(env, user, request) {
  if (!env.GRANT_FILES) return json({ error: "Grant file storage is not configured yet." }, 503);
  const settings = await env.DB.prepare(
    "SELECT key,value FROM portal_settings WHERE key IN ('grant_cycle','grant_deadline')"
  ).all();
  const m = Object.fromEntries((settings.results || []).map(x => [x.key,x.value]));
  const deadline = m.grant_deadline || "2027-03-29";
  const end = new Date(deadline + "T23:59:59-07:00");
  if (new Date() > end) return json({ error: "The grant application period has closed." }, 409);

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file.arrayBuffer !== "function") return json({ error: "A PDF file is required." }, 400);
  if (file.size > 15 * 1024 * 1024) return json({ error: "PDF must be 15 MB or smaller." }, 413);
  const data = await file.arrayBuffer();
  const head = new TextDecoder().decode(data.slice(0, 4));
  if (head !== "%PDF") return json({ error: "The uploaded file must be a valid PDF." }, 400);

  const safe = String(file.name || "application.pdf").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 100);
  const key = `grant/${m.grant_cycle || "2026-27"}/user-${user.id}/${Date.now()}-${randomToken(6)}-${safe}`;
  await env.GRANT_FILES.put(key, data, {
    httpMetadata: { contentType: "application/pdf" },
    customMetadata: { user_id: String(user.id) }
  });

  await env.DB.prepare(
    `INSERT INTO grant_applications (user_id,cycle,r2_key,original_file_name,file_size,status)
     VALUES (?,?,?,?,?,'submitted')`
  ).bind(user.id, m.grant_cycle || "2026-27", key, file.name || "application.pdf", file.size).run();

  return json({ ok: true, status: "submitted" }, 201);
}

async function adminMembers(env, user) {
  if (!user.is_admin && !user.is_president) return json({ error: "Admin access required." }, 403);
  const rows = await env.DB.prepare(
    `SELECT u.id,u.email,u.name,u.avatar_url,u.membership_status,u.is_admin,u.is_president,u.created_at,
      (SELECT COUNT(*) FROM trip_leaders tl WHERE tl.user_id=u.id) AS trip_leader_count
     FROM users u ORDER BY u.name`
  ).all();
  return json({ members: rows.results || [] });
}

async function setMembershipStatus(env, user, memberId, request) {
  if (!user.is_president) return json({ error: "Only the President can change Distinguished Member status." }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  const status = body.membership_status;
  if (!["member","distinguished"].includes(status)) return json({ error: "Invalid membership status." }, 400);
  const result = await env.DB.prepare(
    "UPDATE users SET membership_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?"
  ).bind(status, memberId).run();
  return json({ ok: true, membership_status: status, changed: result.meta?.changes || 0 });
}

async function leaderApplications(env, user, tripId) {
  if (!(await canManageTrip(env, user, tripId))) return json({ error: "Trip leader access required." }, 403);
  const rows = await env.DB.prepare(
    `SELECT ta.id,ta.status,ta.answers_json,ta.leader_recommendation,ta.president_decision,ta.submitted_at,
            u.id AS user_id,u.name,u.email,u.membership_status
     FROM trip_applications ta JOIN users u ON u.id=ta.user_id
     WHERE ta.trip_id=? ORDER BY ta.submitted_at`
  ).bind(tripId).all();
  return json({ applications: rows.results || [] });
}

async function recommendApplication(env, user, applicationId, request) {
  const app = await env.DB.prepare("SELECT id,trip_id FROM trip_applications WHERE id=?").bind(applicationId).first();
  if (!app) return json({ error: "Application not found." }, 404);
  if (!(await canManageTrip(env, user, app.trip_id))) return json({ error: "Trip leader access required." }, 403);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!["accept","waitlist","decline"].includes(body.recommendation)) return json({ error: "Invalid recommendation." }, 400);
  await env.DB.prepare(
    `UPDATE trip_applications
     SET leader_recommendation=?,leader_reviewed_by=?,leader_reviewed_at=CURRENT_TIMESTAMP,
         status='under_review',updated_at=CURRENT_TIMESTAMP
     WHERE id=?`
  ).bind(body.recommendation, user.id, applicationId).run();
  return json({ ok: true });
}

async function presidentApplications(env, user) {
  if (!user.is_president) return json({ error: "President access required." }, 403);
  const rows = await env.DB.prepare(
    `SELECT ta.id,ta.status,ta.leader_recommendation,ta.president_decision,ta.submitted_at,
            t.id AS trip_id,t.title AS trip_title,t.starts_at,
            u.id AS user_id,u.name AS applicant_name,u.email AS applicant_email,u.membership_status
     FROM trip_applications ta
     JOIN trips t ON t.id=ta.trip_id
     JOIN users u ON u.id=ta.user_id
     WHERE ta.status IN ('submitted','under_review','waitlisted')
       AND ta.president_decision IS NULL
     ORDER BY ta.submitted_at`
  ).all();
  return json({ applications: rows.results || [] });
}

async function presidentDecision(env, user, applicationId, request) {
  if (!user.is_president) return json({ error: "President access required." }, 403);
  const app = await env.DB.prepare(
    "SELECT id,trip_id,user_id FROM trip_applications WHERE id=?"
  ).bind(applicationId).first();
  if (!app) return json({ error: "Application not found." }, 404);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  if (!["accepted","waitlisted","declined"].includes(body.decision)) return json({ error: "Invalid decision." }, 400);

  const statements = [
    env.DB.prepare(
      `UPDATE trip_applications
       SET president_decision=?,president_reviewed_by=?,president_reviewed_at=CURRENT_TIMESTAMP,
           status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).bind(body.decision, user.id, body.decision, applicationId)
  ];
  if (body.decision === "accepted") {
    statements.push(
      env.DB.prepare(
        "INSERT OR IGNORE INTO trip_participants (trip_id,user_id,application_id) VALUES (?,?,?)"
      ).bind(app.trip_id, app.user_id, app.id)
    );
  } else {
    statements.push(
      env.DB.prepare("DELETE FROM trip_participants WHERE trip_id=? AND user_id=?")
        .bind(app.trip_id, app.user_id)
    );
  }
  await env.DB.batch(statements);
  return json({ ok: true, status: body.decision });
}

async function checkoutGear(env, user, gearId, request) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid JSON." }, 400); }
  const memberId = intId(body.user_id);
  const tripId = body.trip_id == null ? null : intId(body.trip_id);
  if (!memberId) return json({ error: "A member is required." }, 400);
  if (tripId && !(await canManageTrip(env, user, tripId))) return json({ error: "Trip leader or admin access required." }, 403);
  if (!tripId && !user.is_admin && !user.is_president) return json({ error: "Admin access required for non-trip checkout." }, 403);

  const existing = await env.DB.prepare(
    "SELECT id FROM gear_checkouts WHERE gear_item_id=? AND returned_at IS NULL"
  ).bind(gearId).first();
  if (existing) return json({ error: "That item is already checked out." }, 409);

  await env.DB.prepare(
    `INSERT INTO gear_checkouts (gear_item_id,user_id,trip_id,checked_out_by,due_at,notes)
     VALUES (?,?,?,?,?,?)`
  ).bind(gearId, memberId, tripId, user.id, body.due_at || null, String(body.notes || "").slice(0, 500) || null).run();
  return json({ ok: true }, 201);
}

async function returnGear(env, user, checkoutId) {
  if (!user.is_admin && !user.is_president) return json({ error: "Admin access required." }, 403);
  const result = await env.DB.prepare(
    "UPDATE gear_checkouts SET returned_at=CURRENT_TIMESTAMP,returned_by=? WHERE id=? AND returned_at IS NULL"
  ).bind(user.id, checkoutId).run();
  if (!result.meta?.changes) return json({ error: "Open checkout not found." }, 404);
  return json({ ok: true });
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const parts = path.split("/").filter(Boolean);
  const method = request.method.toUpperCase();

  try {
    if (method === "GET" && path === "auth/login") return handleLogin(context);
    if (method === "GET" && path === "auth/callback") return handleCallback(context);
    if (method === "POST" && path === "auth/logout") return handleLogout(context);

    if (!env.DB) return json({ error: "Portal database is not configured yet." }, 503);
    const user = await currentUser(env, request);
    if (!user) return json({ error: "Authentication required.", login_url: "/api/auth/login" }, 401);

    if (method === "GET" && path === "me") return handleMe(env, user);
    if (method === "GET" && path === "trips") return listTrips(env, user);
    if (method === "GET" && parts[0] === "trips" && parts.length === 2) {
      const tripId = intId(parts[1]);
      return tripId ? tripDetail(env, user, tripId) : json({ error: "Invalid trip id." }, 400);
    }
    if (method === "POST" && parts[0] === "trips" && parts[2] === "apply") {
      const tripId = intId(parts[1]);
      return tripId ? applyToTrip(env, user, tripId, request) : json({ error: "Invalid trip id." }, 400);
    }
    if (method === "GET" && path === "applications") return myApplications(env, user);
    if (method === "GET" && path === "gear") return listGear(env);
    if (method === "GET" && path === "grant") return grantStatus(env, user);
    if (method === "POST" && path === "grant/apply") return submitGrant(env, user, request);

    if (method === "GET" && path === "admin/members") return adminMembers(env, user);
    if (method === "POST" && parts[0] === "admin" && parts[1] === "members" && parts[3] === "status") {
      const memberId = intId(parts[2]);
      return memberId ? setMembershipStatus(env, user, memberId, request) : json({ error: "Invalid member id." }, 400);
    }

    if (method === "GET" && parts[0] === "leader" && parts[1] === "trips" && parts[3] === "applications") {
      const tripId = intId(parts[2]);
      return tripId ? leaderApplications(env, user, tripId) : json({ error: "Invalid trip id." }, 400);
    }
    if (method === "POST" && parts[0] === "leader" && parts[1] === "applications" && parts[3] === "recommend") {
      const appId = intId(parts[2]);
      return appId ? recommendApplication(env, user, appId, request) : json({ error: "Invalid application id." }, 400);
    }
    if (method === "GET" && path === "president/applications") return presidentApplications(env, user);
    if (method === "POST" && parts[0] === "president" && parts[1] === "applications" && parts[3] === "decision") {
      const appId = intId(parts[2]);
      return appId ? presidentDecision(env, user, appId, request) : json({ error: "Invalid application id." }, 400);
    }

    if (method === "POST" && parts[0] === "gear" && parts[2] === "checkout") {
      const gearId = intId(parts[1]);
      return gearId ? checkoutGear(env, user, gearId, request) : json({ error: "Invalid gear id." }, 400);
    }
    if (method === "POST" && parts[0] === "gear" && parts[1] === "checkouts" && parts[3] === "return") {
      const checkoutId = intId(parts[2]);
      return checkoutId ? returnGear(env, user, checkoutId) : json({ error: "Invalid checkout id." }, 400);
    }

    return json({ error: "Not found." }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: "Portal request failed.", detail: String(error?.message || error) }, 500);
  }
}
