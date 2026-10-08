ALTER TABLE member_profiles ADD COLUMN about_me TEXT;
ALTER TABLE member_profiles ADD COLUMN show_in_directory INTEGER NOT NULL DEFAULT 0;
ALTER TABLE member_profiles ADD COLUMN share_email INTEGER NOT NULL DEFAULT 0;
ALTER TABLE member_profiles ADD COLUMN share_phone INTEGER NOT NULL DEFAULT 0;
