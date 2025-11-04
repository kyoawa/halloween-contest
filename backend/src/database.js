import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '../data/contest.db'));

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS contestants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_path TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contestant_id INTEGER NOT NULL,
    voter_session TEXT NOT NULL,
    voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contestant_id) REFERENCES contestants(id),
    UNIQUE(contestant_id, voter_session)
  );

  CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(voter_session);
  CREATE INDEX IF NOT EXISTS idx_contestants_votes ON contestants(votes DESC);
`);

export default db;
