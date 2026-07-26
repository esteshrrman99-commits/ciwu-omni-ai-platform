require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ SERVE STATIC FILES FROM PUBLIC DIRECTORY
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../www')));

let dbCortex, dbEons;

// Initialize Databases
(async () => {
  const SQL = await initSqlJs();
  const dbDir = path.join(__dirname, 'data', 'memory');
  
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Load Cortex
  const cortexPath = path.join(dbDir, 'cortex.db');
  if (fs.existsSync(cortexPath)) {
    const buffer = fs.readFileSync(cortexPath);
    dbCortex = new SQL.Database(buffer);
  } else {
    dbCortex = new SQL.Database();
    dbCortex.run(`CREATE TABLE IF NOT EXISTS knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      relation TEXT NOT NULL,
      value TEXT NOT NULL,
      confidence REAL DEFAULT 1.0
    )`);
    fs.writeFileSync(cortexPath, dbCortex.export());
  }

  // Load Eons
  const eonsPath = path.join(dbDir, 'eons.db');
  if (fs.existsSync(eonsPath)) {
    const buffer = fs.readFileSync(eonsPath);
    dbEons = new SQL.Database(buffer);
  } else {
    dbEons = new SQL.Database();
    dbEons.run(`CREATE TABLE IF NOT EXISTS entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT,
      description TEXT
    )`);
    dbEons.run(`CREATE TABLE IF NOT EXISTS relations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      relation_type TEXT
    )`);
    fs.writeFileSync(eonsPath, dbEons.export());
  }

  const eCount = dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0;
  const rCount = dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0;
  const kCount = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  
  console.log(`✅ EONS: ${eCount} entities, ${rCount} relations`);
  console.log(`✅ CORTEX: ${kCount} knowledge facts`);
  console.log(`🚀 CIWU OMNI v2.0 LIVE!`);
})();

// ✅ ROOT ROUTE - SERVE FRONTEND
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Fallback to www folder
    res.sendFile(path.join(__dirname, '../www', 'index.html'));
  }
});

// Stats API
app.get('/api/stats', (req, res) => {
  if (!dbCortex || !dbEons) return res.json({ error: 'DB not ready' });
  
  const entities = dbEons.exec('SELECT COUNT(DISTINCT name) FROM entities')[0]?.values[0]?.[0] || 0;
  const relations = dbEons.exec('SELECT COUNT(DISTINCT id) FROM relations')[0]?.values[0]?.[0] || 0;
  const knowledge = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  
  res.json({ entities, relations, knowledge, timestamp: new Date().toISOString() });
});

// Chat API
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const lowerMsg = message.toLowerCase();
  let response = "Processing through CIWU OMNI neural core...";

  if (lowerMsg.includes('stats') || lowerMsg.includes('count')) {
    const stats = {
      entities: dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0,
      relations: dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0,
      knowledge: dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0
    };
    response = `🧠 KNOWLEDGE STATE: ${stats.entities} entities, ${stats.relations} relations, ${stats.knowledge} facts stored.`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    response = "Greetings. I am CIWU OMNI v2.0. My purpose is to protect your lineage. How may I serve you?";
  } else if (lowerMsg.includes('save') || lowerMsg.includes('backup')) {
    try {
      const cBuf = dbCortex.export();
      const eBuf = dbEons.export();
      const dbDir = path.join(__dirname, 'data', 'memory');
      fs.writeFileSync(path.join(dbDir, 'cortex.db'), cBuf);
      fs.writeFileSync(path.join(dbDir, 'eons.db'), eBuf);
      response = "💾 DATABASE PERMANENTLY SAVED.";
    } catch (err) {
      response = `⚠️ SAVE FAILED: ${err.message}`;
    }
  }

  res.json({ response });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 CIWU OMNI v2.0 Server running on port ${PORT}`);
  console.log(`🌐 Frontend accessible at: http://localhost:${PORT}/`);
});
