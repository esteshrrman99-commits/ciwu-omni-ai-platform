const { MongoClient } = require('mongodb');
const config = require('./env');

let dbInstance = null;

async function connectDB() {
  if (!config.mongodb.uri) {
    console.log('⚠️ MongoDB URI not set. Using in-memory storage.');
    return null;
  }
  
  if (dbInstance) return dbInstance;
  
  try {
    const client = new MongoClient(config.mongodb.uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    
    await client.connect();
    dbInstance = client.db('ciwu_omni');
    
    console.log('✅ MongoDB Connected: ciwu_omni database');
    
    // Create indexes
    await dbInstance.collection('users').createIndex({ username: 1 }, { unique: true });
    await dbInstance.collection('patients').createIndex({ userId: 1 });
    await dbInstance.collection('protocols').createIndex({ patientId: 1, createdAt: -1 });
    await dbInstance.collection('breakthroughs').createIndex({ category: 1, impact: -1 });
    await dbInstance.collection('evolution_log').createIndex({ timestamp: -1 });
    
    return dbInstance;
  } catch(err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('⚠️ Falling back to in-memory storage');
    return null;
  }
}

function getDB() {
  return dbInstance;
}

module.exports = { connectDB, getDB };
