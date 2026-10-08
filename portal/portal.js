(() => {
  const titles = {
    dashboard: 'Dashboard',
    trips: 'Trips',
    applications: 'My Applications',
    gear: 'Gear',
    grant: 'Grant',
    membership: 'Membership',
    support: 'Support MCA',
    profile: 'Profile',
    leader: 'Manage Trips',
    admin: 'Admin'
  };

  const state = {
    user: null,
    trips: {},
    selectedTrip: null
  };

  const tripData = {
    'joshua-tree': {
      title: 'Joshua Tree',
      type: 'Rock climbing',
      meta: 'October 12–13, 2026',
      date: 'Oct. 12–13',
      leaders: 'To be assigned',
      difficulty: 'Intermediate',
      capacity: 'Participant limit set by trip leaders',
      applicationStatus: 'Applications open',
      applicationClass: 'status-open',
      applicationCopy: 'Every participant applies. Trip leaders review applications and the President participates in final decisions.',
      applyLabel: 'Start application',
      roster: [],
      gear: []
    },
    'four-peaks': {
      title: 'Four Peaks Traverse',
      type: 'Mountaineering / hiking',
      meta: 'October 31, 2026',
      date: 'Oct. 31',
      leaders: 'To be assigned',
      difficulty: 'Strenuous',
      capacity: 'Participant limit set by trip leaders',
      applicationStatus: 'Applications open',
      applicationClass: 'status-open',
      applicationCopy: 'Every participant applies. Trip leaders review applications and the President participates in final decisions.',
      applyLabel: 'Start application',
      roster: [],
      gear: []
    },
    'cactus-to-clouds': {
      title: 'Cactus to Clouds',
      type: 'Endurance objective',
      meta: 'November 7–8, 2026',
      date: 'Nov. 7–8',
      leaders: 'To be assigned',
      difficulty: 'Very strenuous',
      capacity: 'Participant limit set by trip leaders',
      applicationStatus: 'Applications open',
      applicationClass: 'status-open',
      applicationCopy: 'Every participant applies. Leaders can use trip-specific questions to assess preparation and fit.',
      applyLabel: 'Start application',
      roster: [],
      gear: []
    },
    'sierras': {
      title: 'Spring Sierra Week',
      type: 'Ice · ski mountaineering · technical climbing',
      meta: 'Spring Break 2027',
      date: 'Spring Break',
      leaders: 'To be assigned',
      difficulty: 'Variable by objective',
      capacity: 'Objective-dependent',
      applicationStatus: 'Planning',
      applicationClass: '',
      applicationCopy: 'This objective is still being planned and is not published for applications yet.',
      applyLabel: 'Not open yet',
      roster: [],
      gear: []
    }
  };

  function api(path, options) {
    return fetch('/api/' + path.replace(/^\//, ''), Object.assign({
      credentials: 'same-origin',
      headers: { 'accept': 'application/json' }
    }, options || {}));
  }

  async function apiJson(path, options) {
    const response = await api(path, options);
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(data.error || ('Request failed (' + response.status + ')'));
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDate(value, fallback) {
    if (!value) return fallback || 'TBD';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return fallback || value;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== 2026 ? 'numeric' : undefined });
  }

  function initials(name) {
    return String(name || 'MCA').split(/\s+/).filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'MCA';
  }

  function applicationPresentation(status, open) {
    if (status === 'accepted') return { text: 'Accepted', cls: 'status-success', label: 'Application accepted', disabled: true };
    if (status === 'waitlisted') return { text: 'Waitlisted', cls: 'status-review', label: 'Waitlisted', disabled: true };
    if (status === 'declined') return { text: 'Not selected', cls: 'status-closed', label: 'Decision made', disabled: true };
    if (status === 'submitted' || status === 'under_review') return { text: status === 'under_review' ? 'Under review' : 'Submitted', cls: 'status-review', label: 'Application submitted', disabled: true };
    if (!open) return { text: 'Closed', cls: 'status-closed', label: 'Applications closed', disabled: true };
    return { text: 'Applications open', cls: 'status-open', label: 'Start application', disabled: false };
  }

  function showView(view, updateHash) {
    if (updateHash === undefined) updateHash = true;
    if (!titles[view]) view = 'dashboard';

    document.querySelectorAll('[data-view-panel]').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.viewPanel === view);
    });
    document.querySelectorAll('.portal-nav-link[data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
    });

    const title = document.querySelector('[data-view-title]');
    if (title) title.textContent = titles[view];
    if (updateHash) history.replaceState(null, '', '#' + view);
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.body.classList.remove('menu-open');
    if (view !== 'trips') closeTripDetail();
  }

  function hydrateIdentity(data) {
    state.user = data.user;
    const user = data.user;
    const firstName = (user.name || 'member').split(/\s+/)[0];

    document.querySelectorAll('[data-member-name]').forEach(el => el.textContent = user.name || 'Member');
    document.querySelectorAll('[data-member-first-name]').forEach(el => el.textContent = firstName);
    document.querySelectorAll('[data-member-initials]').forEach(el => el.textContent = initials(user.name));
    document.querySelectorAll('[data-member-status]').forEach(el => el.textContent = user.membership_status === 'distinguished' ? 'Distinguished Member' : 'Member');
    document.querySelectorAll('[data-member-email]').forEach(el => el.value = user.email || '');
    document.querySelectorAll('[data-membership-name]').forEach(el => el.textContent = user.name || 'Member');

    const membershipPill = document.querySelector('[data-membership-pill]');
    if (membershipPill) {
      membershipPill.textContent = user.membership_status === 'distinguished' ? 'Distinguished Member' : 'Member';
      membershipPill.className = 'status-pill' + (user.membership_status === 'distinguished' ? ' status-distinguished' : '');
    }

    const pills = document.querySelector('[data-role-pills]');
    if (pills) {
      const values = [user.membership_status === 'distinguished' ? ['Distinguished Member','status-distinguished'] : ['Member','']];
      if (user.is_trip_leader) values.push(['Trip Leader','']);
      if (user.is_president) values.push(['President','']);
      else if (user.is_admin) values.push(['Admin','']);
      pills.innerHTML = values.map(v => '<span class="status-pill ' + v[1] + '">' + escapeHtml(v[0]) + '</span>').join('');
    }

    const leaderNav = document.querySelector('[data-trip-leader-nav]');
    const adminNav = document.querySelector('[data-admin-nav]');
    if (leaderNav) leaderNav.hidden = !user.is_trip_leader;
    if (adminNav) adminNav.hidden = !(user.is_admin || user.is_president);

    const support = Number(data.annual_support_cents || 0) / 100;
    document.querySelectorAll('.support-summary > strong').forEach(el => el.textContent = '$' + support.toLocaleString());
  }

  async function initializeAuth() {
    const gate = document.querySelector('[data-auth-gate]');
    const message = document.querySelector('[data-auth-message]');
    const login = document.querySelector('[data-auth-login]');

    try {
      const data = await apiJson('me');
      hydrateIdentity(data);
      document.body.classList.remove('portal-auth-loading', 'portal-auth-error');
      document.body.classList.add('portal-authenticated');
      if (gate) gate.hidden = true;
      await Promise.allSettled([syncTrips(), syncGear(), syncGrant(), syncApplications(), syncAdmin()]);
    } catch (error) {
      document.body.classList.remove('portal-auth-loading');
      document.body.classList.add('portal-auth-error');
      if (message) {
        if (error.status === 401) message.textContent = 'Use your Google account to open the MCA member portal.';
        else if (error.status === 503) message.textContent = 'The portal code is live, but the Cloudflare database and Google sign-in still need their one-time configuration.';
        else message.textContent = 'The member portal could not connect. Please try again.';
      }
      if (login) login.hidden = error.status === 503;
    }
  }

  async function syncTrips() {
    const data = await apiJson('trips');
    const trips = data.trips || [];
    trips.forEach(t => {
      const base = tripData[t.slug] || {
        title: t.title,
        type: t.category || 'MCA trip',
        meta: formatDate(t.starts_at),
        date: formatDate(t.starts_at),
        leaders: 'To be assigned',
        difficulty: t.difficulty || 'TBD',
        capacity: t.capacity ? String(t.capacity) + ' participants' : 'Set by trip leaders',
        applicationCopy: 'Every participant applies through the MCA member portal.',
        roster: [],
        gear: []
      };
      const present = applicationPresentation(t.my_application_status, !!t.application_open);
      Object.assign(base, {
        id: t.id,
        slug: t.slug,
        title: t.title,
        type: t.category || base.type,
        date: formatDate(t.starts_at, base.date),
        meta: t.starts_at ? formatDate(t.starts_at) : base.meta,
        difficulty: t.difficulty || base.difficulty,
        capacity: t.capacity ? String(t.capacity) + ' participants' : base.capacity,
        leaders: (t.leaders || []).length ? t.leaders.map(l => l.name).join(' · ') : 'To be assigned',
        rosterCount: Number(t.roster_count || 0),
        myApplicationStatus: t.my_application_status,
        applicationStatus: present.text,
        applicationClass: present.cls,
        applyLabel: present.label,
        applyDisabled: present.disabled,
        applicationOpen: !!t.application_open
      });
      tripData[t.slug] = base;
      state.trips[t.slug] = base;
    });

    renderTripsTable(trips);
  }

  function renderTripsTable(trips) {
    const tbody = document.querySelector('[data-view-panel="trips"] .table-card tbody');
    if (!tbody) return;
    if (!trips.length) {
      tbody.innerHTML = '<tr><td colspan="6">No published trips yet.</td></tr>';
      return;
    }
    tbody.innerHTML = trips.map(t => {
      const present = applicationPresentation(t.my_application_status, !!t.application_open);
      const leaders = (t.leaders || []).length ? t.leaders.map(l => escapeHtml(l.name)).join(' · ') : 'TBD';
      const status = t.my_application_status ? '<span class="status-pill ' + present.cls + '">' + escapeHtml(present.text) + '</span>' : 'Not applied';
      return '<tr data-trip-row data-filter="' + (t.my_application_status === 'accepted' ? 'mine' : (t.application_open ? 'open' : 'all')) + '">' +
        '<td><strong>' + escapeHtml(t.title) + '</strong><small>' + escapeHtml(t.category || 'MCA trip') + '</small></td>' +
        '<td>' + escapeHtml(formatDate(t.starts_at)) + '</td>' +
        '<td>' + leaders + '</td>' +
        '<td><span class="status-pill ' + (t.application_open ? 'status-open' : 'status-closed') + '">' + (t.application_open ? 'Open' : 'Closed') + '</span></td>' +
        '<td>' + status + '</td>' +
        '<td><button class="table-action" type="button" data-trip="' + escapeHtml(t.slug) + '">' + (t.my_application_status ? 'View' : (t.application_open ? 'Apply' : 'View')) + '</button></td>' +
        '</tr>';
    }).join('');
    tbody.querySelectorAll('[data-trip]').forEach(button => button.addEventListener('click', () => openTripDetail(button.dataset.trip)));
  }

  async function openTripDetail(slug) {
    const trip = tripData[slug];
    if (!trip) return;
    state.selectedTrip = trip;

    showView('trips');
    const detail = document.querySelector('[data-trip-detail]');
    if (!detail) return;
    const table = document.querySelector('[data-view-panel="trips"] .table-card');
    const toolbar = document.querySelector('[data-view-panel="trips"] .toolbar');
    if (table) table.hidden = true;
    if (toolbar) toolbar.hidden = true;
    detail.hidden = false;

    if (trip.id) {
      try {
        const data = await apiJson('trips/' + trip.id);
        trip.roster = (data.roster || []).map(m => [m.name, m.membership_status === 'distinguished' ? 'Distinguished Member' : 'Member']);
        trip.gear = (data.gear || []).map(g => [g.asset_code + ' · ' + g.name, g.holder]);
        trip.leaders = (data.leaders || []).length ? data.leaders.map(l => l.name).join(' · ') : 'To be assigned';
        trip.myApplicationStatus = data.trip.my_application_status;
        const p = applicationPresentation(data.trip.my_application_status, !!data.trip.application_open);
        trip.applicationStatus = p.text;
        trip.applicationClass = p.cls;
        trip.applyLabel = p.label;
        trip.applyDisabled = p.disabled;
      } catch {}
    }

    detail.querySelector('[data-trip-type]').textContent = trip.type;
    detail.querySelector('[data-trip-title]').textContent = trip.title;
    detail.querySelector('[data-trip-meta]').textContent = trip.meta;
    detail.querySelector('[data-trip-date]').textContent = trip.date;
    detail.querySelector('[data-trip-leaders]').textContent = trip.leaders;
    detail.querySelector('[data-trip-difficulty]').textContent = trip.difficulty;
    detail.querySelector('[data-trip-capacity]').textContent = trip.capacity;
    detail.querySelector('[data-trip-application-copy]').textContent = trip.applicationCopy;

    const status = detail.querySelector('[data-trip-application-status]');
    status.textContent = trip.applicationStatus;
    status.className = 'status-pill ' + (trip.applicationClass || '');

    const apply = detail.querySelector('[data-apply-trip]');
    apply.textContent = trip.applyLabel;
    apply.disabled = !!trip.applyDisabled || !trip.id;
    apply.dataset.tripSlug = slug;

    const form = detail.querySelector('[data-trip-application-form]');
    if (form) {
      form.hidden = true;
      form.reset();
      form.dataset.tripId = trip.id || '';
    }

    const roster = detail.querySelector('[data-trip-roster]');
    roster.innerHTML = trip.roster.length ? trip.roster.map(pair => {
      const name = pair[0], role = pair[1];
      return '<div class="member-row"><span class="member-avatar">' + escapeHtml(initials(name)) + '</span><div><strong>' + escapeHtml(name) + '</strong><span>' + escapeHtml(role) + '</span></div></div>';
    }).join('') : '<p>No accepted participants are listed yet.</p>';

    detail.querySelector('[data-roster-count]').textContent = trip.roster.length + ' listed';

    const gear = detail.querySelector('[data-trip-gear]');
    gear.innerHTML = trip.gear.length ? trip.gear.map(pair => '<div><strong>' + escapeHtml(pair[0]) + '</strong><span>' + escapeHtml(pair[1]) + '</span></div>').join('') : '<p>No club gear has been assigned to this trip yet.</p>';

    detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeTripDetail() {
    const detail = document.querySelector('[data-trip-detail]');
    const table = document.querySelector('[data-view-panel="trips"] .table-card');
    const toolbar = document.querySelector('[data-view-panel="trips"] .toolbar');
    if (detail) detail.hidden = true;
    if (table) table.hidden = false;
    if (toolbar) toolbar.hidden = false;
    state.selectedTrip = null;
  }

  function renderLeaderTrips(trips) {
    const wrap = document.querySelector('[data-leader-trips]');
    if (!wrap || !state.user || !state.user.is_trip_leader) return;
    const mine = (trips || []).filter(t => (t.leaders || []).some(l => Number(l.user_id) === Number(state.user.id)));
    if (!mine.length) {
      wrap.innerHTML = '<section class="portal-card"><p>No published trips are currently assigned to you.</p></section>';
      return;
    }
    wrap.innerHTML = mine.map(t =>
      '<section class="portal-card leader-live-card">' +
        '<div class="card-header"><div><p class="card-kicker">Assigned trip</p><h2>' + escapeHtml(t.title) + '</h2></div>' +
        '<button class="secondary-button" type="button" data-load-leader-apps="' + t.id + '">Review applications</button></div>' +
        '<div data-leader-apps-for="' + t.id + '"><p>Load applications to review participant requests.</p></div>' +
      '</section>'
    ).join('');

    wrap.querySelectorAll('[data-load-leader-apps]').forEach(button => {
      button.addEventListener('click', async () => {
        const tripId = Number(button.dataset.loadLeaderApps);
        const target = wrap.querySelector('[data-leader-apps-for="' + tripId + '"]');
        button.disabled = true;
        if (target) target.innerHTML = '<p>Loading applications…</p>';
        try {
          const data = await apiJson('leader/trips/' + tripId + '/applications');
          const apps = data.applications || [];
          if (!target) return;
          if (!apps.length) {
            target.innerHTML = '<p>No applications have been submitted for this trip yet.</p>';
            return;
          }
          target.innerHTML = '<div class="table-scroll"><table><thead><tr><th>Applicant</th><th>Status</th><th>Submitted</th><th>Recommendation</th></tr></thead><tbody>' +
            apps.map(a =>
              '<tr><td><strong>' + escapeHtml(a.name) + '</strong><small>' + escapeHtml(a.membership_status === 'distinguished' ? 'Distinguished Member' : 'Member') + '</small></td>' +
              '<td>' + escapeHtml(a.status.replace('_',' ')) + '</td>' +
              '<td>' + escapeHtml(formatDate(a.submitted_at)) + '</td>' +
              '<td><select data-recommend-app="' + a.id + '">' +
                '<option value="">Choose…</option>' +
                '<option value="accept"' + (a.leader_recommendation === 'accept' ? ' selected' : '') + '>Recommend accept</option>' +
                '<option value="waitlist"' + (a.leader_recommendation === 'waitlist' ? ' selected' : '') + '>Recommend waitlist</option>' +
                '<option value="decline"' + (a.leader_recommendation === 'decline' ? ' selected' : '') + '>Recommend decline</option>' +
              '</select></td></tr>'
            ).join('') +
            '</tbody></table></div>';

          target.querySelectorAll('[data-recommend-app]').forEach(select => {
            select.addEventListener('change', async () => {
              if (!select.value) return;
              select.disabled = true;
              try {
                await apiJson('leader/applications/' + select.dataset.recommendApp + '/recommend', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json', 'accept': 'application/json' },
                  body: JSON.stringify({ recommendation: select.value })
                });
                await syncAdmin();
              } catch (error) {
                alert(error.message);
              } finally {
                select.disabled = false;
              }
            });
          });
        } catch (error) {
          if (target) target.innerHTML = '<p>' + escapeHtml(error.message) + '</p>';
        } finally {
          button.disabled = false;
        }
      });
    });
  }

  async function syncApplications() {
    const data = await apiJson('applications');
    const tbody = document.querySelector('[data-view-panel="applications"] tbody');
    if (!tbody) return;
    const rows = data.applications || [];
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5">You have not submitted any trip applications yet.</td></tr>';
      return;
    }
    tbody.innerHTML = rows.map(a => {
      const p = applicationPresentation(a.status, true);
      return '<tr><td><strong>' + escapeHtml(a.title) + '</strong></td>' +
        '<td>' + escapeHtml(formatDate(a.submitted_at)) + '</td>' +
        '<td><span class="status-pill ' + p.cls + '">' + escapeHtml(p.text) + '</span></td>' +
        '<td>' + escapeHtml(a.president_decision || '—') + '</td>' +
        '<td><button class="table-action" type="button" data-trip="' + escapeHtml(a.slug) + '">View trip</button></td></tr>';
    }).join('');
    tbody.querySelectorAll('[data-trip]').forEach(button => button.addEventListener('click', () => openTripDetail(button.dataset.trip)));
  }

  async function syncGear() {
    const data = await apiJson('gear');
    const tbody = document.querySelector('[data-gear-table]');
    if (!tbody) return;
    const gear = data.gear || [];
    if (!gear.length) {
      tbody.innerHTML = '<tr><td colspan="6">No gear has been added to the portal inventory yet.</td></tr>';
      return;
    }
    tbody.innerHTML = gear.map(g => {
      const out = !!g.checkout_id;
      return '<tr><td><strong>' + escapeHtml(g.asset_code + ' · ' + g.name) + '</strong></td>' +
        '<td>' + escapeHtml(g.category || '—') + '</td>' +
        '<td><span class="status-pill ' + (out ? 'status-out' : 'status-available') + '">' + (out ? 'Checked out' : 'Available') + '</span></td>' +
        '<td>' + escapeHtml(g.holder || '—') + '</td>' +
        '<td>' + escapeHtml(g.trip_title || '—') + '</td>' +
        '<td>' + escapeHtml(g.due_at ? formatDate(g.due_at) : '—') + '</td></tr>';
    }).join('');
  }

  async function syncGrant() {
    const data = await apiJson('grant');
    const app = data.application;
    const panel = document.querySelector('[data-view-panel="grant"]');
    if (!panel) return;
    const side = panel.querySelector('.grant-layout aside');
    if (side && app) {
      const h2 = side.querySelector('h2');
      if (h2) h2.textContent = app.status.replace('_', ' ');
      const dds = side.querySelectorAll('dd');
      if (dds[0]) dds[0].textContent = app.status.replace('_', ' ');
      if (dds[1]) dds[1].textContent = 'Mar. 29, 2027';
      if (dds[2]) dds[2].textContent = app.original_file_name;
    }
  }

  async function syncAdmin() {
    if (!state.user || !(state.user.is_admin || state.user.is_president)) return;
    try {
      const data = await apiJson('admin/members');
      const tbody = document.querySelector('[data-admin-members]');
      if (!tbody) return;
      const members = data.members || [];
      tbody.innerHTML = members.length ? members.map(m => {
        const statusClass = m.membership_status === 'distinguished' ? 'status-distinguished' : '';
        const roles = [];
        if (m.is_president) roles.push('President');
        else if (m.is_admin) roles.push('Admin');
        if (Number(m.trip_leader_count || 0) > 0) roles.push('Trip Leader');
        return '<tr><td><strong>' + escapeHtml(m.name) + '</strong><small>' + escapeHtml(m.email) + '</small></td>' +
          '<td><span class="status-pill ' + statusClass + '">' + escapeHtml(m.membership_status === 'distinguished' ? 'Distinguished' : 'Member') + '</span></td>' +
          '<td>' + escapeHtml(roles.join(' · ') || '—') + '</td>' +
          '<td>' + (state.user.is_president ? '<button class="table-action" type="button" data-member-status-toggle="' + m.id + '" data-current-status="' + m.membership_status + '">' + (m.membership_status === 'distinguished' ? 'Set Member' : 'Make Distinguished') + '</button>' : '—') + '</td></tr>';
      }).join('') : '<tr><td colspan="4">No member accounts yet.</td></tr>';

      if (state.user.is_president) {
        try {
          const queue = await apiJson('president/applications');
          const box = document.querySelector('[data-admin-trip-decisions]');
          if (box) {
            const apps = queue.applications || [];
            box.innerHTML = apps.length ? apps.map(a =>
              '<article class="compact-row"><div><strong>' + escapeHtml(a.trip_title + ' · ' + a.applicant_name) + '</strong><span>Leader recommendation: ' + escapeHtml(a.leader_recommendation || 'pending') + '</span></div>' +
              '<div class="decision-actions">' +
                '<button class="small-button" type="button" data-president-decision="' + a.id + '" data-decision="accepted">Accept</button>' +
                '<button class="small-button" type="button" data-president-decision="' + a.id + '" data-decision="waitlisted">Waitlist</button>' +
                '<button class="small-button" type="button" data-president-decision="' + a.id + '" data-decision="declined">Decline</button>' +
              '</div></article>'
            ).join('') : '<p>No applications are waiting for Presidential review.</p>';

            box.querySelectorAll('[data-president-decision]').forEach(button => {
              button.addEventListener('click', async () => {
                const label = button.dataset.decision;
                if (!confirm('Set this application to ' + label + '?')) return;
                button.disabled = true;
                try {
                  await apiJson('president/applications/' + button.dataset.presidentDecision + '/decision', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json', 'accept': 'application/json' },
                    body: JSON.stringify({ decision: label })
                  });
                  await Promise.allSettled([syncAdmin(), syncTrips()]);
                } catch (error) {
                  alert(error.message);
                  button.disabled = false;
                }
              });
            });
          }
        } catch {}
      }

      tbody.querySelectorAll('[data-member-status-toggle]').forEach(button => {
        button.addEventListener('click', async () => {
          const next = button.dataset.currentStatus === 'distinguished' ? 'member' : 'distinguished';
          button.disabled = true;
          try {
            await apiJson('admin/members/' + button.dataset.memberStatusToggle + '/status', {
              method: 'POST',
              headers: { 'content-type': 'application/json', 'accept': 'application/json' },
              body: JSON.stringify({ membership_status: next })
            });
            await syncAdmin();
          } catch (error) {
            alert(error.message);
            button.disabled = false;
          }
        });
      });
    } catch {}
  }

  document.querySelectorAll('[data-view]').forEach(button => {
    button.addEventListener('click', event => {
      const target = event.currentTarget.dataset.view;
      if (target) showView(target);
    });
  });

  document.querySelectorAll('[data-trip]').forEach(button => {
    button.addEventListener('click', () => openTripDetail(button.dataset.trip));
  });

  const closeTrip = document.querySelector('[data-close-trip]');
  if (closeTrip) closeTrip.addEventListener('click', closeTripDetail);

  const applyTrip = document.querySelector('[data-apply-trip]');
  const tripApplicationForm = document.querySelector('[data-trip-application-form]');
  if (applyTrip && tripApplicationForm) {
    applyTrip.addEventListener('click', () => {
      if (applyTrip.disabled) return;
      tripApplicationForm.hidden = false;
      applyTrip.hidden = true;
      tripApplicationForm.querySelector('textarea')?.focus();
    });

    document.querySelector('[data-cancel-trip-application]')?.addEventListener('click', () => {
      tripApplicationForm.hidden = true;
      applyTrip.hidden = false;
    });

    tripApplicationForm.addEventListener('submit', async event => {
      event.preventDefault();
      const tripId = Number(tripApplicationForm.dataset.tripId);
      const status = tripApplicationForm.querySelector('[data-trip-application-status-message]');
      const submit = tripApplicationForm.querySelector('button[type="submit"]');
      if (!tripId) {
        if (status) status.textContent = 'This trip is not connected to the live database yet.';
        return;
      }
      submit.disabled = true;
      if (status) status.textContent = 'Submitting…';
      const form = new FormData(tripApplicationForm);
      const answers = {};
      for (const [key, value] of form.entries()) answers[key] = value;
      try {
        await apiJson('trips/' + tripId + '/apply', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'accept': 'application/json' },
          body: JSON.stringify({ answers })
        });
        if (status) status.textContent = 'Application submitted.';
        const slug = applyTrip.dataset.tripSlug;
        if (tripData[slug]) {
          tripData[slug].myApplicationStatus = 'submitted';
          tripData[slug].applicationStatus = 'Submitted';
          tripData[slug].applicationClass = 'status-review';
          tripData[slug].applyLabel = 'Application submitted';
          tripData[slug].applyDisabled = true;
        }
        applyTrip.textContent = 'Application submitted';
        applyTrip.disabled = true;
        applyTrip.hidden = false;
        tripApplicationForm.hidden = true;
        await Promise.allSettled([syncTrips(), syncApplications()]);
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });
  }

  document.querySelectorAll('[data-trip-filter]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-trip-filter]').forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.tripFilter;
      document.querySelectorAll('[data-trip-row]').forEach(row => {
        row.hidden = filter !== 'all' && row.dataset.filter !== filter;
      });
    });
  });

  const tripSearch = document.querySelector('[data-trip-search]');
  if (tripSearch) {
    tripSearch.addEventListener('input', () => {
      const q = tripSearch.value.trim().toLowerCase();
      document.querySelectorAll('[data-trip-row]').forEach(row => {
        row.hidden = !!q && !row.textContent.toLowerCase().includes(q);
      });
    });
  }

  const gearSearch = document.querySelector('[data-gear-search]');
  if (gearSearch) {
    gearSearch.addEventListener('input', () => {
      const q = gearSearch.value.trim().toLowerCase();
      document.querySelectorAll('[data-gear-table] tr').forEach(row => {
        row.hidden = !!q && !row.textContent.toLowerCase().includes(q);
      });
    });
  }

  const grantFile = document.querySelector('[data-grant-file]');
  const grantStatus = document.querySelector('[data-grant-status]');
  const grantSubmit = document.querySelector('[data-grant-submit]');
  if (grantFile && grantStatus && grantSubmit) {
    grantFile.addEventListener('change', () => {
      const file = grantFile.files && grantFile.files[0];
      if (!file) {
        grantStatus.textContent = 'No file selected.';
        grantSubmit.disabled = true;
        return;
      }
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        grantStatus.textContent = 'Please select a PDF.';
        grantSubmit.disabled = true;
        return;
      }
      grantStatus.textContent = file.name + ' selected.';
      grantSubmit.disabled = false;
    });

    grantSubmit.addEventListener('click', async () => {
      const file = grantFile.files && grantFile.files[0];
      if (!file) return;
      grantSubmit.disabled = true;
      grantStatus.textContent = 'Uploading securely…';
      const body = new FormData();
      body.append('file', file);
      try {
        const response = await api('grant/apply', { method: 'POST', body });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Grant upload failed.');
        grantStatus.textContent = 'Application submitted successfully.';
        grantFile.value = '';
        await syncGrant();
      } catch (error) {
        grantStatus.textContent = error.message;
        grantSubmit.disabled = false;
      }
    });
  }

  document.querySelectorAll('[data-support-amount]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-support-amount]').forEach(b => b.classList.toggle('active', b === button));
      const custom = document.querySelector('[data-support-custom]');
      if (custom) custom.value = '';
    });
  });
  const customSupport = document.querySelector('[data-support-custom]');
  if (customSupport) customSupport.addEventListener('input', () => {
    document.querySelectorAll('[data-support-amount]').forEach(b => b.classList.remove('active'));
  });

  const adminGearForm = document.querySelector('[data-admin-gear-form]');
  if (adminGearForm) {
    adminGearForm.addEventListener('submit', async event => {
      event.preventDefault();
      const status = adminGearForm.querySelector('[data-admin-gear-status]');
      const submit = adminGearForm.querySelector('button[type="submit"]');
      const body = Object.fromEntries(new FormData(adminGearForm).entries());
      submit.disabled = true;
      if (status) status.textContent = 'Adding item…';
      try {
        await apiJson('admin/gear', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'accept': 'application/json' },
          body: JSON.stringify(body)
        });
        adminGearForm.reset();
        if (status) status.textContent = 'Gear item added.';
        await syncGear();
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });
  }

  const adminTripForm = document.querySelector('[data-admin-trip-form]');
  if (adminTripForm) {
    adminTripForm.addEventListener('submit', async event => {
      event.preventDefault();
      const status = adminTripForm.querySelector('[data-admin-trip-status]');
      const submit = adminTripForm.querySelector('button[type="submit"]');
      const body = Object.fromEntries(new FormData(adminTripForm).entries());
      if (body.starts_at) body.starts_at = new Date(body.starts_at).toISOString();
      if (body.capacity === '') delete body.capacity;
      submit.disabled = true;
      if (status) status.textContent = 'Creating trip…';
      try {
        await apiJson('admin/trips', {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'accept': 'application/json' },
          body: JSON.stringify(body)
        });
        adminTripForm.reset();
        if (status) status.textContent = 'Trip created.';
        await syncTrips();
      } catch (error) {
        if (status) status.textContent = error.message;
      } finally {
        submit.disabled = false;
      }
    });
  }

  const profileForm = document.querySelector('[data-profile-form]');
  if (profileForm) {
    profileForm.addEventListener('submit', event => {
      event.preventDefault();
      const status = profileForm.querySelector('[data-profile-status]');
      if (status) status.textContent = 'Basic profile editing will save here once the editable profile fields are connected to the API.';
    });
  }

  document.querySelectorAll('[data-leader-tab]').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.leaderTab;
      document.querySelectorAll('[data-leader-tab]').forEach(b => b.classList.toggle('active', b === button));
      document.querySelectorAll('[data-leader-panel]').forEach(panel => {
        panel.hidden = panel.dataset.leaderPanel !== tab;
      });
    });
  });

  const menuToggle = document.querySelector('[data-menu-toggle]');
  if (menuToggle) menuToggle.addEventListener('click', () => document.body.classList.toggle('menu-open'));

  const accountToggle = document.querySelector('[data-account-toggle]');
  const accountMenu = document.querySelector('[data-account-menu]');
  if (accountToggle && accountMenu) {
    accountToggle.addEventListener('click', event => {
      event.stopPropagation();
      accountMenu.hidden = !accountMenu.hidden;
      accountToggle.setAttribute('aria-expanded', String(!accountMenu.hidden));
    });
    document.addEventListener('click', event => {
      if (!accountMenu.hidden && !accountMenu.contains(event.target)) {
        accountMenu.hidden = true;
        accountToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const logout = document.querySelector('[data-logout]');
  if (logout) logout.addEventListener('click', async () => {
    try { await api('auth/logout', { method: 'POST' }); } catch {}
    location.href = '/portal/';
  });

  window.addEventListener('hashchange', () => {
    const view = location.hash.replace('#', '');
    if (titles[view]) showView(view, false);
  });

  const initial = location.hash.replace('#', '');
  showView(titles[initial] ? initial : 'dashboard', false);
  initializeAuth();
})();
