PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS shows (
  id               INTEGER PRIMARY KEY,         -- j-archive game_id
  show_number      INTEGER,
  air_date         TEXT,
  title            TEXT
);

CREATE TABLE IF NOT EXISTS rounds (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  show_id          INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  name             TEXT NOT NULL CHECK (name IN ('jeopardy','double','final')),
  UNIQUE (show_id, name)
);

CREATE TABLE IF NOT EXISTS categories (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id         INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  position         INTEGER NOT NULL,            -- 0..5 (Final uses 0)
  name             TEXT NOT NULL,
  comments         TEXT,
  UNIQUE (round_id, position)
);

CREATE TABLE IF NOT EXISTS clues (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id         INTEGER NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  category_id      INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  row_index        INTEGER,                     -- 0..4 (Final uses 0)
  value            INTEGER,                     -- dollars; NULL for Final
  is_daily_double  INTEGER NOT NULL DEFAULT 0,  -- 0/1
  question         TEXT NOT NULL,
  answer           TEXT NOT NULL,
  media            TEXT,
  UNIQUE (round_id, category_id, row_index)
);

CREATE INDEX IF NOT EXISTS idx_rounds_show ON rounds(show_id);
CREATE INDEX IF NOT EXISTS idx_categories_round ON categories(round_id);
CREATE INDEX IF NOT EXISTS idx_clues_cat_row ON clues(category_id, row_index);
CREATE INDEX IF NOT EXISTS idx_clues_round_value ON clues(round_id, value);
