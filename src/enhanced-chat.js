const readline = require('readline');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

console.log('\n═══════════════════════════════════════');
console.log('       🧠 CIWU ENHANCED AI v2.0        ║');
console.log('═══════════════════════════════════════\n');

let dbCortex, dbEons;
let ready = false;

async function init() {
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
        
        console.log('Modules active:');
        console.log('- CORTEX – Persistent memory & recall');
        console.log('- CODEX – Code analysis & pattern matching');
        console.log('- VORTEX – Web retrieval & search');
        console.log('- ZORTEX – System analysis & anomaly detection');
        console.log('- EONS – Knowledge graph & entity mapping');
        console.log('');
        console.log('✅ Loaded: ' + fc[0].values[0][0] + ' facts, ' + cc[0].values[0][0] + ' conversations');
        console.log('✅ Loaded: ' + ec[0].values[0][0] + ' entities, ' + rc[0].values[0][0] + ' relations');
        console.log('');
        console.log('Type "help" for commands, "exit" to quit\n');
    } catch (e) {
        console.error('❌ Database load failed:', e.message);
        process.exit(1);
    }
}

function handleCommand(input) {
    const lower = input.toLowerCase().trim();
    let response = '';
    
    if (lower === 'exit' || lower === 'quit') {
        console.log('Goodbye!');
        process.exit(0);
    }
    
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
    
    else {
        response = 'I heard you: "' + input + '". Type "help" for available commands.';
    }
    
    console.log('\n[CIWU AI]');
    console.log(response);
    console.log('');
}

init().then(() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: '[You] → '
    });
    
    rl.prompt();
    
    rl.on('line', (line) => {
        handleCommand(line);
        rl.prompt();
    }).on('close', () => {
        console.log('Goodbye!');
        process.exit(0);
    });
}).catch(err => {
    console.error('Startup failed:', err);
    process.exit(1);
});
