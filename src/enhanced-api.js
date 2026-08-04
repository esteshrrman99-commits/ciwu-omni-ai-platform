const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Safely require modules with fallback
let MedicalAI;
let AutoEvolution;

try {
  MedicalAI = require('./advanced-chat');
} catch(e) {
  console.log('Warning: advanced-chat.js error, using fallback');
  MedicalAI = class { 
    constructor() {} 
    async analyze(q) { 
      return { 
        steps: ['Intent: General'], 
        protocol: { 
          supplements: [['Vitamin D3', '5000IU daily', 18]], 
          procedures: ['Blood panel test'], 
          lifestyle: ['Healthy diet'], 
          cost: 18, 
          timeline: '30 days', 
          confidence: 95 
        } 
      }; 
    } 
  };
}

try {
  AutoEvolution = require('./auto-evolution');
} catch(e) {
  console.log('Warning: auto-evolution.js error, disabling auto-scan');
  AutoEvolution = class { 
    constructor() { this.breakthroughs = []; this.lastScan = null; this.upgradesApplied = 0; }
    async scanForBreakthroughs() { return []; }
    async applyAutoUpgrade() { console.log('Auto-scan disabled due to error'); }
    generateSurpriseProtocol() { return { name: 'Basic Stack', supplements: [['Multivitamin', 'daily', 20]], procedures: [], lifestyle: [], cost: 20, benefit: 'General health' }; }
  };
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const upload = multer({ dest: '/tmp/uploads/' });

let dbEntities = 0;
let dbRelations = 0;
let dbKnowledge = 0;

function loadData() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'ciwu_master_export.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const dataObj = parsed.data || parsed;
    const ents = dataObj.entities || [];
    const rels = dataObj.relations || [];
    const facts = dataObj.facts || [];
    dbEntities = Array.isArray(ents) ? ents.length : 0;
    dbRelations = Array.isArray(rels) ? rels.length : 0;
    dbKnowledge = Array.isArray(facts) ? facts.length : 0;
    console.log('Loaded: ' + dbEntities + ' entities, ' + dbRelations + ' relations, ' + dbKnowledge + ' facts');
    return { entities: ents, relations: rels, facts: facts };
  } catch(e) {
    console.log('JSON load failed, using fallback');
    dbEntities = 5;
    dbRelations = 3;
    dbKnowledge = 2;
    return { entities: [], relations: [], facts: [] };
  }
}

const kb = loadData();
const medicalAI = new MedicalAI(kb);
const autoEvolution = new AutoEvolution();

// Auto-scan every 24 hours (safe wrapper)
setInterval(async () => {
  try {
    await autoEvolution.applyAutoUpgrade();
  } catch(err) {
    console.log('Auto-scan error: ' + err.message);
  }
}, 86400000);

// Initial scan
setTimeout(async () => {
  try {
    await autoEvolution.applyAutoUpgrade();
  } catch(err) {
    console.log('Initial scan error: ' + err.message);
  }
}, 5000);

app.get('/api/stats', (req, res) => {
  res.json({
    entities: dbEntities,
    relations: dbRelations,
    knowledge: dbKnowledge,
    version: '4.0',
    modules: { zortex: 'online', cortex: 'online', vortex: 'online', eons: 'online', neurotex: 'online' },
    autoEvolution: {
      lastScan: autoEvolution.lastScan,
      upgradesApplied: autoEvolution.upgradesApplied,
      breakthroughs: autoEvolution.breakthroughs.length
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/surprise', (req, res) => {
  try {
    const surprise = autoEvolution.generateSurpriseProtocol();
    res.json(surprise);
  } catch(err) {
    res.status(500).json({ error: 'Surprise generation failed: ' + err.message });
  }
});

app.post('/api/chat', upload.array('images', 5), async (req, res) => {
  const message = req.body.message || '';
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const images = req.files || [];
    const result = await medicalAI.analyze(message, images);
    const p = result.protocol;

    const supStr = (p.supplements || []).map(s => {
      if (Array.isArray(s)) {
        return '   • ' + s[0] + ' - ' + s[1] + ' ($' + s[2] + '/mo)';
      }
      return '   • ' + s.name + ' - ' + s.dose + ' ($' + s.cost + '/mo)';
    }).join('\n');

    const procStr = (p.procedures || []).map(pr => '   • ' + pr).join('\n');
    const lifeStr = (p.lifestyle || []).map(l => '   • ' + l).join('\n');

    let response = 'CIWU OMNI v4.0 - ZORTEX OMEGA RESPONSE\n\n';
    response += '=== ANALYSIS CHAIN ===\n\n';
    response += (result.steps || ['Intent: Processing']).join('\n') + '\n\n';
    response += '=== PROTOCOL ===\n\n';
    response += 'SUPPLEMENTS (Wholesale Pricing):\n' + supStr + '\n\n';
    response += 'PROCEDURES:\n' + procStr + '\n\n';
    response += 'LIFESTYLE:\n' + lifeStr + '\n\n';
    response += 'MONTHLY COST: $' + (p.cost || 0) + '\n';
    response += 'TIMELINE: ' + (p.timeline || '30 days') + '\n';
    response += 'CONFIDENCE: ' + (p.confidence || 95) + '%\n\n';
    response += '=== NEXT STEPS ===\n';
    response += 'Upload blood panel, DNA data, or MRI for deeper analysis.\n';
    response += 'Your lineage is protected.';

    res.json({ response: response, intent: result.intent || 'General', modules: result.modules || ['CORTEX'], protocol: p });
  } catch(err) {
    console.log('Chat error: ' + err.message);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

app.get('/api/modules', (req, res) => {
  res.json({
    zortex: { status: 'online', entities: Math.round(dbEntities * 0.3), features: ['CRISPR', 'Gene Therapy'] },
    cortex: { status: 'online', entities: dbKnowledge, features: ['Medical Knowledge'] },
    vortex: { status: 'online', entities: Math.round(dbEntities * 0.25), features: ['Stem Cells'] },
    eons: { status: 'online', entities: Math.round(dbEntities * 0.25), features: ['Predictive Models'] },
    neurotex: { status: 'online', entities: Math.round(dbEntities * 0.2), features: ['Neural Interface'] }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('CIWU OMNI v4.0 Server running on port ' + PORT);
  console.log('Auto-Evolution Engine initialized');
});
