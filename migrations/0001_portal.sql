PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  membership_status TEXT NOT NULL DEFAULT 'member'
    CHECK (membership_status IN ('member','distinguished')),
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0,1)),
  is_president INTEGER NOT NULL DEFAULT 0 CHECK (is_president IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT,
  starts_at TEXT,
  ends_at TEXT,
  location TEXT,
  difficulty TEXT,
  capacity INTEGER,
  description TEXT,
  application_open INTEGER NOT NULL DEFAULT 1 CHECK (application_open IN (0,1)),
  application_opens_at TEXT,
  application_closes_at TEXT,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft','published','cancelled','completed')),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_leaders (
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (trip_id,user_id)
);

CREATE TABLE IF NOT EXISTS trip_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','accepted','waitlisted','declined','withdrawn')),
  leader_recommendation TEXT
    CHECK (leader_recommendation IS NULL OR leader_recommendation IN ('accept','waitlist','decline')),
  leader_reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  leader_reviewed_at TEXT,
  president_decision TEXT
    CHECK (president_decision IS NULL OR president_decision IN ('accepted','waitlisted','declined')),
  president_reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  president_reviewed_at TEXT,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (trip_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_trip_applications_trip ON trip_applications(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_applications_user ON trip_applications(user_id);

CREATE TABLE IF NOT EXISTS trip_participants (
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  application_id INTEGER REFERENCES trip_applications(id) ON DELETE SET NULL,
  accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (trip_id,user_id)
);

CREATE TABLE IF NOT EXISTS gear_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  asset_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  manufacturer TEXT,
  model TEXT,
  notes TEXT,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gear_checkouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gear_item_id INTEGER NOT NULL REFERENCES gear_items(id) ON DELETE RESTRICT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  trip_id INTEGER REFERENCES trips(id) ON DELETE SET NULL,
  checked_out_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  checked_out_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at TEXT,
  returned_at TEXT,
  returned_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_gear_checkouts_open ON gear_checkouts(gear_item_id,returned_at);

CREATE TABLE IF NOT EXISTS grant_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cycle TEXT NOT NULL,
  r2_key TEXT NOT NULL UNIQUE,
  original_file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','awarded','not_selected','withdrawn')),
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_grant_user_cycle ON grant_applications(user_id,cycle);

CREATE TABLE IF NOT EXISTS support_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  amount_cents INTEGER NOT NULL,
  contribution_date TEXT,
  source TEXT NOT NULL DEFAULT 'asu_foundation',
  external_reference TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portal_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO portal_settings (key,value) VALUES
  ('grant_name','MCA Adventure & Stewardship Grant'),
  ('grant_cycle','2026-27'),
  ('grant_deadline','2027-03-29'),
  ('foundation_giving_url',''),
  ('expedition_circle_min_cents','50000');
