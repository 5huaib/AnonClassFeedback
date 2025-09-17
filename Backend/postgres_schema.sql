CREATE TABLE IF NOT EXISTS class_sessions (
  class_id TEXT PRIMARY KEY,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id SERIAL PRIMARY KEY,
  class_id TEXT REFERENCES class_sessions(class_id),
  name TEXT NOT NULL
);
