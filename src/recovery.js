const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const CORTEX_PATH = path.join(process.env.HOME, 'universal_env/apps/myai/data/memory/cortex.db');
const EONS_PATH = path.join(process.env.HOME, 'universal_env/apps/myai/data/memory/eons.db');

const FACTS = [
    ['myName', 'John', 'user_defined'],
    ['projectName', 'CIWU Enhanced AI v2.0', 'system'],
    ['projectFullName', 'Central Intelligent Web-Wide Universe', 'system'],
    ['architecture', '5-module decentralized AI on Android Termux', 'system'],
    ['hostDevice', 'Motorola moto g play 2024', 'device'],
    ['hostOS', 'Android 14', 'device'],
    ['tabletDevice', 'SCORE 7T Android 10 tablet', 'device'],
    ['tabletChipset', 'MediaTek MT8168', 'device'],
    ['universalEnvPath', '~/universal_env/', 'system'],
    ['backupCount', '59 APKs backed up via Swift Backup', 'backup'],
    ['backupLocation', '/storage/emulated/0/SwiftBackup/accounts/8690a48a4fcc72f1/backups/apps/local/', 'backup'],
    ['backupSize', '4.9GB total backup data', 'backup'],
    ['swiftBackupAccountId', '8690a48a4fcc72f1', 'backup'],
    ['checkpointVersion', '1.0 - creates tar.gz checkpoints', 'system'],
    ['magiskStatus', 'v30.7 Manager only - root engine N/A - deferred', 'system'],
    ['shellSetup', 'Termux with universal_env structure, .bashrc aliases configured', 'system'],
    ['scriptsCreated', 'health-check, full-backup, checkpoint, verify-integration, cleanup-old-backups, version-check, setup-automation, startup, swift-backup-trigger, kill-shelter, app-import', 'system'],
    ['modulesActive', 'CORTEX, CODEX, VORTEX, ZORTEX, EONS', 'system'],
    ['apiKey', 'Not configured - using local processing only', 'config'],
    ['networkPort', '3000', 'config'],
    ['apiVersion', '1.0.0', 'system'],
    ['appsInstalled', '58+ apps: Termux, Termux:API, Acode, Shelter, SD Maid 2/SE, SuperFreezZ, ClassyShark3xodus, Obtainium, WireGuard, Tuta Mail, Material Files, Swift Backup, Magisk, F-Droid, De-Bloater, Activity Launcher, ADBungFu, UpgradeAll', 'system'],
];

const RELATIONS = [
    ['bitcoin', 'is', 'cryptocurrency'],
    ['Termux', 'is', 'Android_terminal'],
    ['universal_env', 'is', 'command_center'],
    ['AI', 'is', 'artificial_intelligence'],
    ['Motorola', 'runs', 'Android_14'],
    ['Motorola', 'is', 'command_center_host'],
    ['tablet', 'runs', 'Android_10'],
    ['tablet', 'is', 'target_device'],
    ['CIWU', 'has_module', 'CORTEX'],
    ['CIWU', 'has_module', 'CODEX'],
    ['CIWU', 'has_module', 'VORTEX'],
    ['CIWU', 'has_module', 'ZORTEX'],
    ['CIWU', 'has_module', 'EONS'],
    ['CORTEX', 'handles', 'persistent_memory'],
    ['CODEX', 'handles', 'code_analysis'],
    ['VORTEX', 'handles', 'web_retrieval'],
    ['ZORTEX', 'handles', 'system_analysis'],
    ['EONS', 'handles', 'knowledge_graph'],
    ['swift_backup', 'backed_up', '59_APKs'],
    ['universal_env', 'contains', 'apps_data_config_scripts_volumes'],
    ['Magisk', 'status', 'incomplete_root_engine_NA'],
    ['checkpoint.sh', 'creates', 'tar_gz_snapshots'],
    ['myName', 'is', 'John'],
    ['Motorola', 'has_storage', '21G_free'],
    ['universal_env', 'has_directory', 'apps'],
    ['universal_env', 'has_directory', 'data'],
    ['universal_env', 'has_directory', 'config'],
    ['universal_env', 'has_directory', 'scripts'],
    ['universal_env', 'has_directory', 'volumes'],
];

const CONVERSATIONS = [
    ['system', 'CIWU Enhanced AI v2.0 initialized - 5 modules active'],
    ['user', 'help'],
    ['assistant', '[Displayed all available commands]'],
    ['user', 'remember myName as John'],
    ['assistant', 'OK Remembered: myName = John'],
    ['user', 'recall myName'],
    ['assistant', 'Recalled: myName = John'],
    ['user', 'learn bitcoin is cryptocurrency'],
    ['assistant', 'OK Learned: bitcoin --is--> cryptocurrency'],
    ['user', 'query bitcoin'],
    ['assistant', 'EONS KNOWLEDGE: bitcoin -> cryptocurrency (is, weight: 1)'],
    ['user', 'stats'],
    ['assistant', 'CORTEX: 25 messages, 2 sessions, 2 facts | EONS: 6 entities, 3 relations'],
    ['user', 'health'],
    ['assistant', 'System health report with Zortex analysis'],
    ['user', 'learn Termux is Android_terminal'],
    ['assistant', 'OK Learned: Termux --is--> Android_terminal'],
    ['user', 'learn universal_env is command_center'],
    ['assistant', 'OK Learned: universal_env --is--> command_center'],
    ['user', 'learn AI is artificial_intelligence'],
    ['assistant', 'OK Learned: AI --is--> artificial_intelligence'],
    ['user', 'Zortex recovery initiated'],
    ['assistant', 'Rebuilding all lost data after db reset'],
];

async function recover() {
    console.log('========================================');
    console.log('  ZORTEX DATA RECOVERY SYSTEM v1.0');
    console.log('  Rebuilding ALL lost memory');
    console.log('========================================');
    console.log('');

    const SQL = await initSqlJs();

    // === CORTEX ===
    console.log('--- CORTEX MEMORY ---');
    const cortex = new SQL.Database();
    cortex.run('CREATE TABLE conversations (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, session_id TEXT)');
    cortex.run('CREATE TABLE knowledge (id INTEGER PRIMARY KEY AUTOINCREMENT, entity TEXT, relation TEXT, value TEXT, confidence REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');
    cortex.run('CREATE TABLE memory_facts (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE, value TEXT, category TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');

    let fc = 0;
    for (const f of FACTS) {
        cortex.run('INSERT OR REPLACE INTO memory_facts (key, value, category) VALUES (?, ?, ?)', f);
        fc++;
        console.log('  OK: ' + f[0] + ' = ' + f[1].substring(0, 50));
    }

    let cc = 0;
    for (const c of CONVERSATIONS) {
        cortex.run('INSERT INTO conversations (role, content, session_id) VALUES (?, ?, ?)', [c[0], c[1], 'recovery']);
        cc++;
    }

    fs.mkdirSync(path.dirname(CORTEX_PATH), {recursive: true});
    fs.writeFileSync(CORTEX_PATH, Buffer.from(cortex.export()));
    console.log('  CORTEX saved: ' + fc + ' facts, ' + cc + ' conversations');

    // === EONS ===
    console.log('');
    console.log('--- EONS KNOWLEDGE GRAPH ---');
    const eons = new SQL.Database();
    eons.run('CREATE TABLE entities (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, type TEXT, description TEXT, first_seen DATETIME DEFAULT CURRENT_TIMESTAMP, last_updated DATETIME DEFAULT CURRENT_TIMESTAMP)');
    eons.run('CREATE TABLE relations (id INTEGER PRIMARY KEY AUTOINCREMENT, subject_id INTEGER, predicate TEXT, object_id INTEGER, weight REAL, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)');

    let rc = 0;
    for (const r of RELATIONS) {
        eons.run('INSERT OR IGNORE INTO entities (name, type) VALUES (?, ?)', [r[0], 'concept']);
        eons.run('INSERT OR IGNORE INTO entities (name, type) VALUES (?, ?)', [r[2], 'concept']);

        var sId = null, oId = null;
        var sr = eons.exec("SELECT id FROM entities WHERE name='" + r[0] + "'");
        if (sr.length > 0 && sr[0].values.length > 0) sId = sr[0].values[0][0];
        var orb = eons.exec("SELECT id FROM entities WHERE name='" + r[2] + "'");
        if (orb.length > 0 && orb[0].values.length > 0) oId = orb[0].values[0][0];

        if (sId && oId) {
            eons.run('INSERT INTO relations (subject_id, predicate, object_id, weight) VALUES (?, ?, ?, ?)', [sId, r[1], oId, 1.0]);
            rc++;
            console.log('  OK: ' + r[0] + ' --' + r[1] + '--> ' + r[2]);
        }
    }

    fs.mkdirSync(path.dirname(EONS_PATH), {recursive: true});
    fs.writeFileSync(EONS_PATH, Buffer.from(eons.export()));
    console.log('  EONS saved: ' + rc + ' relations');

    // === VERIFY ===
    console.log('');
    console.log('--- VERIFICATION ---');
    var cf = fs.readFileSync(CORTEX_PATH);
    var ef = fs.readFileSync(EONS_PATH);
    var cv = new SQL.Database(cf);
    var ev = new SQL.Database(ef);

    var fcv = cv.exec('SELECT COUNT(*) FROM memory_facts');
    var ecv = ev.exec('SELECT COUNT(*) FROM entities');
    var rcv = ev.exec('SELECT COUNT(*) FROM relations');

    console.log('  CORTEX facts: ' + fcv[0].values[0][0]);
    console.log('  EONS entities: ' + ecv[0].values[0][0]);
    console.log('  EONS relations: ' + rcv[0].values[0][0]);
    console.log('  CORTEX DB size: ' + fs.statSync(CORTEX_PATH).size + ' bytes');
    console.log('  EONS DB size: ' + fs.statSync(EONS_PATH).size + ' bytes');

    console.log('');
    console.log('========================================');
    console.log('  RECOVERY COMPLETE!');
    console.log('  Restart with: ./ciwu-start.sh');
    console.log('========================================');

    process.exit(0);
}

recover().catch(function(err) {
    console.error('FAILED:', err.message);
    process.exit(1);
});
