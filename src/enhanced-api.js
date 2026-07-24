const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let dbCortex, dbEons;
let ready = false;

async function init() {
    console.log('🧠 CIWU OMNI v2.0 - Simplified Server Starting...');
    
    const SQL = await initSqlJs();
    
    const CORTEX_PATH = path.join(process.env.HOME, 'universal_env/apps/myai/data/memory/cortex.db');
    const EONS_PATH = path.join(process.env.HOME, 'universal_env/apps/myai/data/memory/eons.db');
    
    try {
        dbCortex = new SQL.Database(fs.readFileSync(CORTEX_PATH));
        dbEons = new SQL.Database(fs.readFileSync(EONS_PATH));
        ready = true;
        
        const ec = dbEons.exec('SELECT COUNT(*) FROM entities');
        const rc = dbEons.exec('SELECT COUNT(*) FROM relations');
        const fc = dbCortex.exec('SELECT COUNT(*) FROM memory_facts');
        const cc = dbCortex.exec('SELECT COUNT(*) FROM conversations');
        
        console.log('✅ CORTEX: ' + fc[0].values[0][0] + ' facts, ' + cc[0].values[0][0] + ' conversations');
        console.log('✅ EONS: ' + ec[0].values[0][0] + ' entities, ' + rc[0].values[0][0] + ' relations');
        console.log('🚀 CIWU OMNI v2.0 LIVE on port 10000');
        console.log('🌐 Visit: http://localhost:10000');
        console.log('✅ Health check: /api/health');
    } catch (e) {
        console.error('❌ Database load failed:', e.message);
        process.exit(1);
    }
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CIWU OMNI v2.0 is alive!',
        timestamp: new Date().toISOString(),
        ready: ready
    });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.json({ error: 'No message provided' });
    }
    
    if (!ready) {
        return res.json({
            status: 'OK',
            message: 'CIWU OMNI v2.0 is alive!',
            timestamp: new Date().toISOString(),
            response: 'I heard you: "' + message + '". My advanced AI modules are loading. Try again in a moment.'
        });
    }
    
    const lower = message.toLowerCase().trim();
    let response = '';
    
    // Help
    if (lower === 'help') {
        response = `AVAILABLE COMMANDS:

CORTEX (Memory):
  remember <key> as <value>  - Store a fact
  recall <key>               - Retrieve a fact
  memory                     - Memory statistics

EONS (Knowledge Graph):
  learn <subj> <pred> <obj>  - Add knowledge
  query <entity>             - Query knowledge
  graph                      - Show knowledge graph

SYSTEM:
  stats                      - Full statistics
  health                     - System health
  exit                       - Quit`;
    }
    
    // Recall
    else if (lower.startsWith('recall ')) {
        const key = lower.replace('recall ', '').trim();
        try {
            const result = dbCortex.exec("SELECT value FROM memory_facts WHERE key='" + key + "'");
            if (result.length > 0 && result[0].values.length > 0) {
                response = 'Recalled: ' + key + ' = ' + result[0].values[0][0];
            } else {
                response = 'No fact found for: ' + key;
            }
        } catch (e) {
            response = 'Error: ' + e.message;
        }
    }
    
    // Stats
    else if (lower === 'stats') {
        try {
            const ec = dbEons.exec('SELECT COUNT(*) FROM entities');
            const rc = dbEons.exec('SELECT COUNT(*) FROM relations');
            const fc = dbCortex.exec('SELECT COUNT(*) FROM memory_facts');
            const cc = dbCortex.exec('SELECT COUNT(*) FROM conversations');
            
            response = `SYSTEM STATISTICS:

CORTEX MEMORY:
  Facts: ${fc[0].values[0][0]}
  Conversations: ${cc[0].values[0][0]}

EONS KNOWLEDGE:
  Entities: ${ec[0].values[0][0]}
  Relations: ${rc[0].values[0][0]}`;
        } catch (e) {
            response = 'Error: ' + e.message;
        }
    }
    
    // Query
    else if (lower.startsWith('query ')) {
        const entity = lower.replace('query ', '').trim();
        try {
            const result = dbEons.exec(`
                SELECT e2.name, r.predicate 
                FROM relations r 
                JOIN entities e1 ON r.subject_id = e1.id 
                JOIN entities e2 ON r.object_id = e2.id 
                WHERE e1.name='${entity}'
            `);
            
            if (result.length > 0 && result[0].values.length > 0) {
                response = 'EONS KNOWLEDGE: ' + entity + '\n';
                for (const row of result[0].values) {
                    response += '  → ' + row[0] + ' (' + row[1] + ')\n';
                }
            } else {
                response = 'No knowledge found for: ' + entity;
            }
        } catch (e) {
            response = 'Error: ' + e.message;
        }
    }
    
    // Graph
    else if (lower === 'graph') {
        try {
            const result = dbEons.exec(`
                SELECT e1.name, r.predicate, e2.name 
                FROM relations r 
                JOIN entities e1 ON r.subject_id = e1.id 
                JOIN entities e2 ON r.object_id = e2.id 
                LIMIT 20
            `);
            
            if (result.length > 0 && result[0].values.length > 0) {
                response = 'EONS KNOWLEDGE GRAPH (top 20):\n';
                for (const row of result[0].values) {
                    response += '  ' + row[0] + ' --' + row[1] + '--> ' + row[2] + '\n';
                }
            } else {
                response = 'Knowledge graph is empty.';
            }
        } catch (e) {
            response = 'Error: ' + e.message;
        }
    }
    
    // Default
    else {
        response = 'I heard you: "' + message + '". Type "help" for available commands.';
    }
    
    res.json({
        status: 'OK',
        message: 'CIWU OMNI v2.0 is alive!',
        timestamp: new Date().toISOString(),
        response: response
    });
});

init().then(() => {
    app.listen(10000, () => {
        console.log('✅ Your service is live 🎉');
        console.log('');
        console.log('////////////////////////////////////////');
        console.log('Available at your primary URL');
        console.log('http://localhost:10000');
        console.log('////////////////////////////////////////');
    });
}).catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
});
