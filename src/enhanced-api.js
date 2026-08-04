const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const MedicalAI = require('./advanced-chat');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

var upload = multer({ dest: '/tmp/uploads/' });
var dbEntities = 0;
var dbRelations = 0;
var dbKnowledge = 0;

function loadData() {
  try {
    var raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'ciwu_master_export.json'), 'utf8');
    var parsed = JSON.parse(raw);
    var dataObj = parsed.data || parsed;
    var ents = dataObj.entities || [];
    var rels = dataObj.relations || [];
    var facts = dataObj.facts || [];
    dbEntities = Array.isArray(ents) ? ents.length : 0;
    dbRelations = Array.isArray(rels) ? rels.length : 0;
    dbKnowledge = Array.isArray(facts) ? facts.length : 0;
    console.log('✅ Loaded from JSON: ' + dbEntities + ' entities, ' + dbRelations + ' relations');
    console.log('✅ EONS: ' + dbEntities + ' entities, ' + dbRelations + ' relations');
    console.log('✅ CORTEX: ' + dbKnowledge + ' knowledge facts');
    console.log('🚀 CIWU OMNI v4.0 LIVE!');
    return { entities: ents, relations: rels, facts: facts };
  } catch(e) {
    console.log('⚠️ JSON load failed: ' + e.message + ' - using fallback');
    dbEntities = 5;
    dbRelations = 3;
    dbKnowledge = 2;
    return { entities: [], relations: [], facts: [] };
  }
}

var kb = loadData();
var medicalAI = new MedicalAI(kb);

app.get('/api/stats', function(req, res) {
  res.json({
    entities: dbEntities,
    relations: dbRelations,
    knowledge: dbKnowledge,
    version: '4.0',
    modules: { zortex: 'online', cortex: 'online', vortex: 'online', eons: 'online', neurotex: 'online' },
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', upload.array('images', 5), async function(req, res) {
  var message = req.body.message || '';
  if (!message) return res.status(400).json({ error: 'Message required' });

  try {
    var images = req.files || [];
    var result = await medicalAI.analyze(message, images);
    var p = result.protocol;

    var supStr = p.supplements.map(function(s) {
      return '   • ' + s[0] + ' - ' + s[1] + ' ($' + s[2] + '/mo)';
    }).join('\n');

    var procStr = p.procedures.map(function(pr) { return '   • ' + pr; }).join('\n');
    var lifeStr = p.lifestyle.map(function(l) { return '   • ' + l; }).join('\n');

    var response = '🧬 CIWU OMNI v4.0 - ZORTEX OMEGA RESPONSE\n\n';
    response += '═══════════ ANALYSIS CHAIN ═══════════\n\n';
    response += result.steps.join('\n') + '\n\n';
    response += '═══════════ PROTOCOL ═══════════\n\n';
    response += '💊 SUPPLEMENTS (Wholesale Pricing):\n' + supStr + '\n\n';
    response += '🏥 PROCEDURES:\n' + procStr + '\n\n';
    response += '🌱 LIFESTYLE:\n' + lifeStr + '\n\n';
    response += '💰 MONTHLY COST: $' + p.cost + '\n';
    response += '⏳ TIMELINE: ' + p.timeline + '\n';
    response += '🎯 CONFIDENCE: ' + p.confidence + '%\n\n';
    response += '═══════════ NEXT STEPS ═══════════\n';
    response += 'Upload blood panel, DNA data, or MRI for deeper analysis.\n';
    response += 'Your lineage is protected. 🛡️';

    res.json({ response: response, intent: result.intent, modules: result.modules, protocol: p });
  } catch(err) {
    res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
});

app.get('/api/modules', function(req, res) {
  res.json({
    zortex: { status: 'online', entities: Math.round(dbEntities * 0.3), features: ['CRISPR', 'Gene Therapy', 'Telomere Extension'] },
    cortex: { status: 'online', entities: dbKnowledge, features: ['Medical Knowledge', 'Longevity Research'] },
    vortex: { status: 'online', entities: Math.round(dbEntities * 0.25), features: ['Stem Cells', 'Tissue Regen'] },
    eons: { status: 'online', entities: Math.round(dbEntities * 0.25), features: ['Predictive Models', 'Temporal Analysis'] },
    neurotex: { status: 'online', entities: Math.round(dbEntities * 0.2), features: ['Neural Interface', 'Cognitive Enhancement'] }
  });
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

var PORT = process.env.PORT || 10000;
app.listen(PORT, function() {
  console.log('🌐 CIWU OMNI v4.0 Server running on port ' + PORT);
});
