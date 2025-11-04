import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure directories exist
const uploadsDir = join(__dirname, '../uploads');
const dataDir = join(__dirname, '../data');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Serve frontend static files in production
const frontendDist = join(__dirname, '../../frontend/dist');
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

// Get all contestants
app.get('/api/contestants', (req, res) => {
  try {
    const contestants = db.prepare('SELECT * FROM contestants ORDER BY created_at DESC').all();
    res.json(contestants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get contestants for voting (exclude already viewed)
app.get('/api/contestants/vote', (req, res) => {
  try {
    const session = req.query.session;
    if (!session) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    const contestants = db.prepare(`
      SELECT c.* FROM contestants c
      WHERE c.id NOT IN (
        SELECT contestant_id FROM views WHERE voter_session = ?
      )
      ORDER BY RANDOM()
    `).all(session);

    res.json(contestants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new contestant(s) - supports single or multiple files
app.post('/api/contestants', (req, res) => {
  upload.array('images', 50)(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'One or more files too large. Maximum size is 10MB per file.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum is 50 files at once.' });
      }
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      const name = req.body.name || 'Contestant';
      const contestants = [];
      const stmt = db.prepare('INSERT INTO contestants (name, image_path) VALUES (?, ?)');

      // Insert each file as a separate contestant
      for (const file of req.files) {
        const imagePath = `/uploads/${file.filename}`;
        const result = stmt.run(name, imagePath);
        const contestant = db.prepare('SELECT * FROM contestants WHERE id = ?').get(result.lastInsertRowid);
        contestants.push(contestant);
      }

      res.status(201).json({
        success: true,
        count: contestants.length,
        contestants
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});

// Record that a contestant was viewed (swiped in any direction)
app.post('/api/view', (req, res) => {
  try {
    const { contestant_id, session } = req.body;

    if (!contestant_id || !session) {
      return res.status(400).json({ error: 'Contestant ID and session are required' });
    }

    // Record the view (so they don't see this contestant again)
    const viewStmt = db.prepare('INSERT OR IGNORE INTO views (contestant_id, voter_session) VALUES (?, ?)');
    viewStmt.run(contestant_id, session);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote for a contestant (swipe right)
app.post('/api/vote', (req, res) => {
  try {
    const { contestant_id, session } = req.body;

    if (!contestant_id || !session) {
      return res.status(400).json({ error: 'Contestant ID and session are required' });
    }

    // Check if already voted
    const existingVote = db.prepare(
      'SELECT * FROM votes WHERE contestant_id = ? AND voter_session = ?'
    ).get(contestant_id, session);

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted for this contestant' });
    }

    // Add vote
    const voteStmt = db.prepare('INSERT INTO votes (contestant_id, voter_session) VALUES (?, ?)');
    voteStmt.run(contestant_id, session);

    // Increment contestant vote count
    const updateStmt = db.prepare('UPDATE contestants SET votes = votes + 1 WHERE id = ?');
    updateStmt.run(contestant_id);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top 3 winners
app.get('/api/results', (req, res) => {
  try {
    const winners = db.prepare(`
      SELECT * FROM contestants
      ORDER BY votes DESC
      LIMIT 3
    `).all();

    res.json(winners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get voting stats
app.get('/api/stats', (req, res) => {
  try {
    const totalContestants = db.prepare('SELECT COUNT(*) as count FROM contestants').get();
    const totalVotes = db.prepare('SELECT COUNT(*) as count FROM votes').get();
    const uniqueVoters = db.prepare('SELECT COUNT(DISTINCT voter_session) as count FROM votes').get();

    res.json({
      total_contestants: totalContestants.count,
      total_votes: totalVotes.count,
      unique_voters: uniqueVoters.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete contestant (admin)
app.delete('/api/contestants/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated votes first
    db.prepare('DELETE FROM votes WHERE contestant_id = ?').run(id);

    // Delete contestant
    const stmt = db.prepare('DELETE FROM contestants WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contestant not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset all votes (admin) - keeps contestants but clears all votes and views
app.post('/api/reset-votes', (req, res) => {
  try {
    // Delete all votes and views
    db.prepare('DELETE FROM votes').run();
    db.prepare('DELETE FROM views').run();

    // Reset all contestant vote counts
    db.prepare('UPDATE contestants SET votes = 0').run();

    res.json({ success: true, message: 'All votes have been reset' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
  const frontendDist = join(__dirname, '../../frontend/dist');
  if (existsSync(frontendDist)) {
    res.sendFile(join(frontendDist, 'index.html'));
  } else {
    res.status(404).send('Frontend not built. Run: npm run build:frontend');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
