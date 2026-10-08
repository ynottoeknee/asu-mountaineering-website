# MCA Member Portal — one-time production setup

The portal code, API, database schema, Google sign-in flow, trip applications, rosters, gear tracking, President decisions, Distinguished Member controls, grant PDF upload, and Foundation-link wiring are in the repository.

The remaining setup is account-level configuration in Cloudflare and Google. No credentials should be committed to GitHub.

## 1. Cloudflare D1

Create a D1 database for the portal, then bind it to the Pages project with the binding name:

```
DB
```

Apply these SQL files in order:

1. `migrations/0001_portal.sql`
2. `migrations/0002_seed_current_trips.sql`
3. `migrations/0003_profile_and_unique_rentals.sql`

The first migration creates members, sessions, trips, applications, rosters, gear, grant submissions, supporter records, and settings.

The second migration creates the current Joshua Tree, Four Peaks Traverse, and Cactus to Clouds trip records.

The third migration adds separate member profile details and a database constraint that prevents the same physical gear item from having more than one active rental. The API also prepares these additions on first use so the portal can finish setup when the migration has not yet been applied.

## 2. Cloudflare R2

Create a private R2 bucket for grant applications and bind it to the Pages project as:

```
GRANT_FILES
```

The website accepts one PDF per submission request, validates that it is a PDF, limits the file to 15 MB, stores the file privately in R2, and stores only its private object key and application metadata in D1.

## 3. Google sign-in

Create a Google OAuth 2.0 Web Application.

Use this production redirect URI:

```
https://asumountaineering.org/api/auth/callback
```

Add these environment variables/secrets to the Cloudflare Pages project:

```
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
PRESIDENT_EMAIL
```

Optional additional administrators can be comma-separated:

```
ADMIN_EMAILS
```

Do not put OAuth secrets in the repository.

When a person signs in for the first time, a Member account is created automatically. The email matching `PRESIDENT_EMAIL` receives President/Admin permissions. The President can grant or remove Distinguished Member status from the Admin page. Trip Leader access is determined by assignment in `trip_leaders`, not by a separate login.

## 4. ASU Foundation giving link

When the MCA ASU Foundation giving page exists, update the D1 setting:

```sql
UPDATE portal_settings
SET value='PASTE_APPROVED_ASU_FOUNDATION_GIVING_URL_HERE',
    updated_at=CURRENT_TIMESTAMP
WHERE key='foundation_giving_url';
```

The public Support page and logged-in Support Your Club page will automatically enable their donation buttons when this setting has a URL.

Expedition Circle begins at $500 in annual support.

## 5. Grant

Current configuration:

- Program: MCA Adventure & Stewardship Grant
- Cycle: 2026–27
- Deadline: March 29, 2027
- Submission format: one PDF

These are stored in `portal_settings`. The prompt can be added later without changing the account or storage architecture.

## 6. Security model

- Passwords are never stored by MCA.
- Google handles identity verification.
- MCA sessions use random server-side session tokens stored as SHA-256 hashes in D1.
- Session cookies are Secure, HttpOnly, and SameSite=Lax.
- Member data APIs require a signed-in session.
- Trip rosters are available to signed-in members.
- Trip application review requires Trip Leader/Admin access.
- Final trip decisions require President access.
- Distinguished Member changes require President access.
- Grant PDFs are private R2 objects and are not publicly addressable.
- Public website donation controls receive only the approved Foundation URL from the public settings endpoint.

## 7. Current live application workflow

Member:

```
Google sign-in
→ Member account
→ Trips
→ Apply
→ Application submitted
```

Trip Leader:

```
Assigned trip
→ Manage Trips
→ Review applications
→ Recommend Accept / Waitlist / Decline
```

President:

```
Admin
→ President Review
→ Accept / Waitlist / Decline
→ Accepted member automatically appears on trip roster
```

Gear:

```
Admin creates inventory item
→ item becomes visible to members
→ checkout API assigns item to member + trip
→ active holder appears in member-visible inventory
→ return creates permanent checkout history
```

Grant:

```
Member chooses PDF
→ secure upload
→ private R2 object
→ D1 application record
```

