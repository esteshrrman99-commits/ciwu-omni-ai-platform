const express = require('express');

const ciwuWorkbenchReadonly =
  require('./routes/ciwu-workbench-readonly');
const ciwuM3CodingRouter = require('./routes/ciwu-m3-coding-engine');
const ciwuM18Router = require('./routes/ciwu-m18-engine');
const ciwuM13Router = require('./routes/ciwu-m13-engine');
const ciwuM12Router = require('./routes/ciwu-m12-engine');
const ciwuM11Router = require('./routes/ciwu-m11-engine');
const ciwuM10Router = require('./routes/ciwu-m10-engine');
const ciwuM9Router = require('./routes/ciwu-m9-engine');
const ciwuM8Router = require('./routes/ciwu-m8-engine');
const ciwuM7Router = require('./routes/ciwu-m7-engine');
const ciwuM6Router = require('./routes/ciwu-m6-engine');
const ciwuM5Router = require('./routes/ciwu-m5-engine');
const ciwuM4Router = require('./routes/ciwu-m4-engine');
const ciwuEvidenceEngineRouter = require('./routes/ciwu-evidence-engine');
const ciwuProductEngineRouter = require('./routes/ciwu-product-engine');
const ciwuCommerceRouter = require('./routes/ciwu-commerce');
const abijahChatRouter = require('./routes/chat-abijah');
const eonsModelsRouter = require('./routes/eons-models');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const MedicalAI = require('./advanced-chat');
const AutoEvolution = require('./auto-evolution');
const PatientNavigation = require('./patient-nav');
const VideoDiagnostic = require('./video-diagnostic');
const QuantumCore = require('./quantum-core');
const RealVisionEngine = require('./real-vision-engine');
const LiveMedicalDB = require('./live-medical-db');
const AuthVault = require('./auth-vault');
const ciwuSovereignApi = require('./sovereign/routes/api');
const app = express();
app.use('/api/sovereign', ciwuSovereignApi);
app.use('/api/m3', ciwuM3CodingRouter);
app.use('/api/m18', ciwuM18Router);

app.use('/api/m13', ciwuM13Router);

app.use('/api/m12', ciwuM12Router);

app.use('/api/m11', ciwuM11Router);

app.use('/api/m10', ciwuM10Router);

app.use('/api/m9', ciwuM9Router);

app.use('/api/m8', ciwuM8Router);

app.use('/api/m7', ciwuM7Router);

app.use('/api/m6', ciwuM6Router);

app.use('/api/m5', ciwuM5Router);

app.use('/api/m4', ciwuM4Router);

app.use('/api/evidence-engine', ciwuEvidenceEngineRouter);

app.use('/api/product-engine', ciwuProductEngineRouter);

app.use('/api/commerce', ciwuCommerceRouter);



const eonsClinicalEvidenceRouter =
  require('./routes/eons-clinical-evidence');

const eonsProductionTruthRouter =
  require('./routes/eons-production-truth');

const eonsIntelligenceRouter = require('./routes/eons-intelligence');
const eonsEvidenceRouter = require('./routes/eons-evidence');

app.use('/api/eons/intelligence', eonsIntelligenceRouter);

app.use(
  '/api/eons/production-truth',
  eonsProductionTruthRouter
);

app.use(
  '/api/eons/clinical-evidence',
  eonsClinicalEvidenceRouter
);


app.use('/api/eons/evidence', eonsEvidenceRouter);
const m3GovernanceRouter = require("./routes/m3-governance");
app.use(express.json({ limit: '50mb' }));
app.use('/api/abijah', abijahChatRouter);
app.use('/api/eons-models', eonsModelsRouter);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
const uploadDir = path.join(__dirname, '..', '.runtime', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 100 * 1024 * 1024 }
});
let dbEntities = 0, dbRelations = 0, dbKnowledge = 0;
function loadData() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'ciwu_master_export.json'), 'utf8');
    const parsed = JSON.parse(raw);
    const dataObj = parsed.data || parsed;
    dbEntities = (dataObj.entities || []).length;
    dbRelations = (dataObj.relations || []).length;
    dbKnowledge = (dataObj.facts || []).length;
  } catch(e) { }
  return { entities: [], relations: [], facts: [] };
}
const kb = loadData();
const medicalAI = new MedicalAI(kb);
const autoEvolution = new AutoEvolution();
const patientNav = new PatientNavigation();
const videoDiag = new VideoDiagnostic();
const quantumCore = new QuantumCore();
const realVision = new RealVisionEngine();
const liveDb = new LiveMedicalDB();
const authVault = new AuthVault();
// Initialize quantum breakthroughs on startup
(async () => {
  try {
    await quantumCore.discoverBreakthroughs();
    console.log(`🔮 Quantum breakthroughs cached: ${quantumCore.breakthroughCache.length}`);
  } catch(err) {
    console.log('Quantum init error:', err.message);
  }
})();
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, authVault.secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authVault.register(username, password);
    res.json(result);
  } catch(err) { res.status(400).json({ error: err.message }); }
});
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authVault.login(username, password);
    res.json(result);
  } catch(err) { res.status(401).json({ error: err.message }); }
});
app.post('/api/save-profile', authenticateToken, (req, res) => {
  try {
    authVault.encryptProfile(req.user.userId, req.body.profileData);
    res.json({ message: 'Profile saved securely.' });
  } catch(err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const profile = authVault.decryptProfile(req.user.userId);
    res.json(profile || {});
  } catch(err) { res.status(500).json({ error: err.message }); }
});
// --- QUANTUM ROUTES (RESTORED) ---
app.get('/api/quantum-surprise', (req, res) => {
  try { 
    const surprise = quantumCore.generate100xSurprise();
    res.json(surprise);
  }
  catch(err) { res.status(500).json({ error: 'Quantum surprise failed: ' + err.message }); }
});
app.get('/api/quantum-breakthroughs', async (req, res) => {
  try {
    const breakthroughs = await quantumCore.discoverBreakthroughs();
    res.json(breakthroughs);
  } catch(err) {
    res.status(500).json({ error: 'Breakthrough discovery failed: ' + err.message });
  }
});
app.post('/api/quantum-analyze', async (req, res) => {
  try {
    const { patientData, conditions } = req.body;
    if (!patientData || !conditions) return res.status(400).json({ error: 'Patient data and conditions required' });
    
    const superposition = await quantumCore.createSuperposition(patientData, conditions);
    const entanglement = await quantumCore.entangleModules(['zortex', 'cortex', 'vortex', 'eons', 'neurotex']);
    const blockchainRecord = quantumCore.addToBlockchain(patientData.id || 'anonymous', superposition.collapsedReality.protocol);
    
    res.json({
      superposition,
      entanglement,
      blockchain: blockchainRecord,
      quantumStatus: quantumCore.getQuantumStatus()
    });
  } catch(err) {
    console.log('Quantum analysis error:', err.message);
    res.status(500).json({ error: 'Quantum analysis failed: ' + err.message });
  }
});
// --- LIVE MEDICAL DB ROUTES (RESTORED) ---
app.get('/api/research/:query', async (req, res) => {
  try {
    const articles = await liveDb.searchPubMed(req.params.query);
    const trials = await liveDb.getClinicalTrials(req.params.query);
    res.json({ articles, trials });
  } catch(err) { 
    console.error('Research API error:', err.message);
    res.status(500).json({ error: 'Research failed: ' + err.message, articles: [], trials: [] }); 
  }
});
// --- VIDEO & VISION ROUTES ---
app.post('/api/analyze-video', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Video file required' });
  try {
    const result = await videoDiag.analyzeVideo(req.file);
    res.json(result);
  } catch(err) {
    console.log('Video analysis error:', err.message);
    res.status(500).json({ error: 'Video analysis failed: ' + err.message });
  }
});
app.post('/api/analyze-video-real', upload.single('video'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Video required' });
  try {
    const result = await realVision.analyzeVideoFrame(req.file.path);
    res.json(result);
  } catch(err) { res.status(500).json({ error: err.message }); }
});
// --- CHAT & AI ROUTES ---
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
    let response = 'CIWU OMNI v5.0-STABLE - ZORTEX OMEGA RESPONSE\n\n';
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
    response += 'Use the platform privacy controls when sharing sensitive health information.';
    res.json({ response: response, intent: result.intent || 'General', modules: result.modules || ['CORTEX'], protocol: p });
  } catch(err) {
    console.log('Chat error:', err.message);
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});
// --- PATIENT NAVIGATION ROUTES ---
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
// --- STATS & UTILS ---
app.get('/api/stats', (req, res) => {
  res.json({
    entities: dbEntities, relations: dbRelations, knowledge: dbKnowledge,
    version: '5.0-STABLE',
    modules: { zortex: 'online', cortex: 'online', vortex: 'online', eons: 'online', neurotex: 'online', vision: 'lightweight-ready', auth: 'zero-knowledge' },
    autoEvolution: { lastScan: autoEvolution.lastScan, upgradesApplied: autoEvolution.upgradesApplied, breakthroughs: autoEvolution.breakthroughs.length },
    quantum: quantumCore.getQuantumStatus(),
    timestamp: new Date().toISOString()
  });
});
app.get('/api/surprise', (req, res) => {
  try { res.json(autoEvolution.generateSurpriseProtocol()); }
  catch(err) { res.status(500).json({ error: 'Surprise generation failed: ' + err.message }); }
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});
const PORT = process.env.PORT || 10000;
app.use(
  '/api/workbench',
  ciwuWorkbenchReadonly
);

app.listen(PORT, () => {
});

/*
 * EONS OMNIMODEL FRONTIER ROUTE
 * Installed by install-eons-cortex.sh
 *
 * The route is intentionally isolated so the existing
 * CIWU backend remains intact.
 */
try {
  const eonsResearchRouter =
    require('./eons-research-api');

  if (typeof app !== 'undefined' && app.use) {
    app.use('/api/eons', eonsResearchRouter);
    app.use('/api/m3', m3GovernanceRouter);
    console.log('✓ EONS CORTEX research API mounted at /api/eons');
  }
} catch (e) {
  console.warn(
    'EONS route could not be mounted automatically:',
    e.message
  );
}

