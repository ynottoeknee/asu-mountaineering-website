CREATE TABLE IF NOT EXISTS member_profiles (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT,
  experience_summary TEXT,
  primary_interests TEXT,
  transportation TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gear_checkouts_one_open_item
  ON gear_checkouts(gear_item_id)
  WHERE returned_at IS NULL;
