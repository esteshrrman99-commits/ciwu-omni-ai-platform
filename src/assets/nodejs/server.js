require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Detect if running in mobile (Termux/Android)
const IS_MOBILE = process.platform === 'linux' && os.userInfo().username === 'u0_a'; // Termux pattern

// Determine DB path: use internal storage if mobile, else default
const DB_DIR = IS_MOBILE 
  ? path.join(process.env.PREFIX || '/data/data/com.termux/files/home', 'ciwu-data')
  : path.join(__dirname, '..', process.env.DB_PATH || 'data/memory');

const CORTEX_PATH = path.join(DB_DIR, 'cortex.db');
const EONS_PATH = path.join(DB_DIR, 'eons.db');

let dbCortex, dbEons;

// Initialize Databases
(async () => {
  const SQL = await initSqlJs();
  
  // Ensure directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log(`📁 Created data directory: ${DB_DIR}`);
  }

  // Load Cortex
  if (fs.existsSync(CORTEX_PATH)) {
    const buffer = fs.readFileSync(CORTEX_PATH);
    dbCortex = new SQL.Database(buffer);
    console.log('✅ Cortex DB loaded from:', CORTEX_PATH);
  } else {
    dbCortex = new SQL.Database();
    dbCortex.run(`CREATE TABLE IF NOT EXISTS knowledge (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity TEXT NOT NULL,
      relation TEXT NOT NULL,
      value TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // Save initial empty DB
    fs.writeFileSync(CORTEX_PATH, dbCortex.export());
    console.log('🆕 Created new Cortex DB at:', CORTEX_PATH);
  }

  // Load Eons
  if (fs.existsSync(EONS_PATH)) {
    const buffer = fs.readFileSync(EONS_PATH);
    dbEons = new SQL.Database(buffer);
    console.log('✅ Eons DB loaded from:', EONS_PATH);
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
    fs.writeFileSync(EONS_PATH, dbEons.export());
    console.log('🆕 Created new Eons DB at:', EONS_PATH);
  }

  // Log stats
  const eCount = dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0;
  const rCount = dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0;
  const kCount = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  console.log(`🧬 Knowledge Core Online: ${eCount} entities, ${rCount} relations, ${kCount} facts.`);
})();

// API Routes
app.get('/api/stats', (req, res) => {
  if (!dbCortex || !dbEons) return res.json({ error: 'DB not ready' });
  const entities = dbEons.exec('SELECT COUNT(DISTINCT name) FROM entities')[0]?.values[0]?.[0] || 0;
  const relations = dbEons.exec('SELECT COUNT(DISTINCT id) FROM relations')[0]?.values[0]?.[0] || 0;
  const knowledge = dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0;
  res.json({ entities, relations, knowledge, timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const lowerMsg = message.toLowerCase();
  let response = "Processing through CIWU OMNI neural core...";

  if (lowerMsg.includes('stats')) {
    const stats = {
      entities: dbEons.exec('SELECT COUNT(*) FROM entities')[0]?.values[0]?.[0] || 0,
      relations: dbEons.exec('SELECT COUNT(*) FROM relations')[0]?.values[0]?.[0] || 0,
      knowledge: dbCortex.exec('SELECT COUNT(*) FROM knowledge')[0]?.values[0]?.[0] || 0
    };
    response = `🧠 KNOWLEDGE STATE: ${stats.entities} entities, ${stats.relations} relations, ${stats.knowledge} facts stored in permanent cortex.`;
  } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    response = "Greetings. I am CIWU OMNI v2.0. My purpose is to protect your lineage. How may I serve you?";
  } else if (lowerMsg.includes('save') || lowerMsg.includes('backup')) {
    try {
      const cBuf = dbCortex.export();
      const eBuf = dbEons.export();
      fs.writeFileSync(CORTEX_PATH, cBuf);
      fs.writeFileSync(EONS_PATH, eBuf);
      response = "💾 DATABASE PERMANENTLY SAVED. All data locked in eternal storage.";
    } catch (err) {
      response = `⚠️ SAVE FAILED: ${err.message}`;
    }
  }

  res.json({ response });
});

// Auto-save heartbeat every 5 minutes
setInterval(() => {
  if (dbCortex && dbEons) {
    try {
      const cBuf = dbCortex.export();
      const eBuf = dbEons.export();
      fs.writeFileSync(CORTEX_PATH, cBuf);
      fs.writeFileSync(EONS_PATH, eBuf);
      console.log('💾 Auto-saved databases to:', DB_DIR);
    } catch (err) {
      console.error('⚠️ Auto-save failed:', err.message);
    }
  }
}, 300000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🌐 CIWU OMNI v2.0 MOBILE SERVER RUNNING ON PORT ${PORT}`);
  console.log(`🔒 Localhost only. Accessible only on this device.`);
  console.log(`🛡️ Database path: ${DB_DIR}`);
});
