require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let db;

// Initialize DB
(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(__dirname, '..', process.env.DB_PATH || 'data/memory/cortex.db');
  
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
    db.run(`CREATE TABLE knowledge (id INTEGER PRIMARY KEY, entity TEXT, relation TEXT, value TEXT, confidence REAL)`);
    // Save empty DB
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, db.export());
  }
  console.log('🚀 Database loaded successfully.');
})();

// API Routes
app.get('/api/stats', (req, res) => {
  if (!db) return res.json({ error: 'DB not ready' });
  const entities = db.exec('SELECT COUNT(DISTINCT entity) FROM knowledge')[0]?.values[0]?.[0] || 0;
  const relations = db.exec('SELECT COUNT(DISTINCT relation) FROM knowledge')[0]?.values[0]?.[0] || 0;
  const knowledge = db.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  res.json({ entities, relations, knowledge });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });
  
  // Simple keyword matching for demo (replace with real AI logic)
  const lowerMsg = message.toLowerCase();
  let response = "I am processing your query through the CIWU OMNI neural core.";
  
  if (lowerMsg.includes('stats') || lowerMsg.includes('count')) {
    const stats = await new Promise(resolve => {
      if (!db) resolve({ error: 'DB not ready' });
      else resolve({
        entities: db.exec('SELECT COUNT(DISTINCT entity) FROM knowledge')[0]?.values[0]?.[0] || 0,
        relations: db.exec('SELECT COUNT(DISTINCT relation) FROM knowledge')[0]?.values[0]?.[0] || 0,
        knowledge: db.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0
      });
    });
    response = `Current Knowledge State: ${stats.entities} entities, ${stats.relations} relations, ${stats.knowledge} facts.`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    response = "Greetings. The CIWU OMNI v2.0 system is operational. How may I assist you today?";
  }

  res.json({ response });
});

// Root Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 CIWU OMNI v2.0 Server running on port ${PORT}`);
});
