const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const MedicalAI = require('./advanced-chat');
const AutoEvolution = require('./auto-evolution');
const PatientNavigation = require('./patient-nav');

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
    dbEntities = (dataObj.entities || []).length;
    dbRelations = (dataObj.relations || []).length;
    dbKnowledge = (dataObj.facts || []).length;
    console.log('Loaded: ' + dbEntities + ' entities, ' + dbRelations + ' relations');
    return { entities: dataObj.entities || [], relations: dataObj.relations || [], facts: dataObj.facts || [] };
  } catch(e) {
    console.log('Using fallback data');
    return { entities: [], relations: [], facts: [] };
  }
}

const kb = loadData();
const medicalAI = new MedicalAI(kb);
const autoEvolution = new AutoEvolution();
const patientNav = new PatientNavigation();

// Auto-scan every 24 hours
setInterval(async () => {
  try { await autoEvolution.applyAutoUpgrade(); } catch(err) { console.log('Auto-scan error:', err.message); }
}, 86400000);

setTimeout(async () => {
  try { await autoEvolution.applyAutoUpgrade(); } catch(err) { console.log('Initial scan error:', err.message); }
}, 5000);

app.get('/api/stats', (req, res) => {
  res.json({
    entities: dbEntities,
    relations: dbRelations,
    knowledge: dbKnowledge,
    version: '4.0',
    modules: { zortex: 'online', cortex: 'online', vortex: 'online', eons: 'online', neurotex: 'online' },
    autoEvolution: { lastScan: autoEvolution.lastScan, upgradesApplied: autoEvolution.upgradesApplied, breakthroughs: autoEvolution.breakthroughs.length },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/surprise', (req, res) => {
  try { res.json(autoEvolution.generateSurpriseProtocol()); }
  catch(err) { res.status(500).json({ error: 'Surprise generation failed: ' + err.message }); }
});

app.post('/api/chat', upload.array('images', 5), async (req, res) => {
  const message = req.body.message || '';
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    const images = req.files || [];
    const result = await medicalAI.analyze(message, images);
    const p = result.protocol;

    const supStr = (p.supplements || []).map(s => Array.isArray(s) ? '   • ' + s[0] + ' - ' + s[1] + ' ($' + s[2] + '/mo)' : '   • ' + s.name + ' - ' + s.dose + ' ($' + s.cost + '/mo)').join('\n');
    const procStr = (p.procedures || []).map(pr => '   • ' + pr).join('\n');
    const lifeStr = (p.lifestyle || []).map(l => '   • ' + l).join('\n');

    let response = 'CIWU OMNI v4.0 - ZORTEX OMEGA RESPONSE\n\n';
    response += '=== ANALYSIS CHAIN ===\n\n' + (result.steps || ['Intent: Processing']).join('\n') + '\n\n';
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
    console.log('Chat error:', err.message);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

app.post('/api/generate-packet', (req, res) => {
  try {
    const { patientData, treatment } = req.body;
    if (!patientData || !treatment) return res.status(400).json({ error: 'Patient data and treatment required' });
    
    const packet = patientNav.generateDiscussionPacket(patientData, treatment);
    res.json(packet);
  } catch(err) {
    res.status(500).json({ error: 'Packet generation failed: ' + err.message });
  }
});

app.post('/api/generate-presentation', (req, res) => {
  try {
    const { patientData, treatment } = req.body;
    if (!patientData || !treatment) return res.status(400).json({ error: 'Patient data and treatment required' });
    
    const presentation = patientNav.generatePresentation(patientData, treatment);
    res.json(presentation);
  } catch(err) {
    res.status(500).json({ error: 'Presentation generation failed: ' + err.message });
  }
});

app.get('/api/providers', (req, res) => {
  const insurance = req.query.insurance || '';
  const providers = patientNav.findMatchingProviders(insurance);
  res.json(providers);
});

app.get('/api/scripts/:treatment', (req, res) => {
  const script = patientNav.getScript(req.params.treatment);
  res.json({ script });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('CIWU OMNI v4.0 Server running on port ' + PORT);
  console.log('Patient Navigation System active');
  console.log('Auto-Evolution Engine initialized');
});
