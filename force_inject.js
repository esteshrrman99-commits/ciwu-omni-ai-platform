const fs = require('fs');
const path = require('path');
const exportPath = path.join(process.env.HOME, 'universal_env/data/ciwu_master_export.json');
const outputPath = path.join(__dirname, 'src/enhanced-api.js');

console.log('📦 Loading master export...');
const masterData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
console.log('   Entities:', masterData.stats.entities);
console.log('   Relations:', masterData.stats.relations);
console.log('   Facts:', masterData.data.facts.length);

console.log('\n📝 Reading enhanced-api.js...');
let apiCode = fs.readFileSync(outputPath, 'utf8');

// Clear existing embedded data (remove old arrays)
apiCode = apiCode.replace(/\/\/ ⚡ FULL.*?const embeddedEntities = \[[\s\S]*?\];/gs, '');
apiCode = apiCode.replace(/\/\/ ⚡ FULL.*?const embeddedRelations = \[[\s\S]*?\];/gs, '');
apiCode = apiCode.replace(/\/\/ ⚡ FULL.*?const embeddedKnowledge = \[[\s\S]*?\];/gs, '');

// Inject ENTITIES
console.log('⚡ Injecting entities...');
const entityInsert = `// ⚡ FULL ${masterData.stats.entities} ENTITIES EMBEDDED FROM MASTER EXPORT ⚡
const embeddedEntities = ${JSON.stringify(masterData.data.entities, null, 2)};`;

apiCode = apiCode.replace(/let dbCortex, dbEons;/, entityInsert + '\n\nlet dbCortex, dbEons;');

// Inject RELATIONS
console.log('⚡ Injecting relations...');
const relationInsert = `// ⚡ FULL ${masterData.stats.relations} RELATIONS EMBEDDED ⚡
const embeddedRelations = ${JSON.stringify(masterData.data.relations, null, 2)};`;

apiCode = apiCode.replace(/let dbCortex, dbEons;/, relationInsert + '\n\nlet dbCortex, dbEons;');

// Inject KNOWLEDGE
console.log('⚡ Injecting knowledge...');
const knowledgeData = masterData.data.facts.map(f => [f.key, 'is', f.value]);
const knowledgeInsert = `// ⚡ FULL ${knowledgeData.length} KNOWLEDGE FACTS EMBEDDED ⚡
const embeddedKnowledge = ${JSON.stringify(knowledgeData, null, 2)};`;

apiCode = apiCode.replace(/let dbCortex, dbEons;/, knowledgeInsert + '\n\nlet dbCortex, dbEons;');

// Write back
console.log('✍️ Writing updated file...');
fs.writeFileSync(outputPath, apiCode);

console.log('\n✅ SUCCESS! Injected:');
console.log('   •', masterData.stats.entities, 'entities');
console.log('   •', masterData.stats.relations, 'relations');
console.log('   •', knowledgeData.length, 'facts');
console.log('\n🚀 Ready to push! Run:');
console.log('   git add src/enhanced-api.js');
console.log('   git commit -m "DEPLOY: 1763 entities injected"');
console.log('   git push origin main');
