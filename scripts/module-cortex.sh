#!/bin/bash
cd ~/universal_env/apps/myai
echo "🧠 Expanding knowledge base..."
node -e "
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/memory/eons.db'));
  const newKnow = [['JavaScript','is','programming_language'],['React','is','javascript_library'],['NodeJS','is','runtime_environment'],['Docker','is','containerization_platform'],['TensorFlow','is','machine_learning_framework']];
  let added = 0;
  for(const [s,p,o] of newKnow) {
    try {
      db.run('INSERT OR IGNORE INTO entities (name,type) VALUES (?,?)',[s,'concept']);
      db.run('INSERT OR IGNORE INTO entities (name,type) VALUES (?,?)',[o,'concept']);
      let sid = db.exec(\"SELECT id FROM entities WHERE name='\"+s+\"'\")[0].values[0][0];
      let oid = db.exec(\"SELECT id FROM entities WHERE name='\"+o+\"'\")[0].values[0][0];
      if(sid && oid) { db.run('INSERT OR IGNORE INTO relations (subject_id,predicate,object_id) VALUES (?,?,?)',[sid,p,oid]); added++; }
    } catch(e) {}
  }
  const c = db.exec('SELECT COUNT(*) FROM entities')[0].values[0][0];
  const r = db.exec('SELECT COUNT(*) FROM relations')[0].values[0][0];
  console.log('✅ Added '+added+' relations. Total: '+c+' entities, '+r+' relations.');
  db.close();
})();
"
