const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://snapshiksha_db:364133@cluster0.whihmus.mongodb.net/?retryWrites=true&w=majority';

async function listDbs() {
  try {
    console.log('Connecting to MongoDB cluster...');
    const client = await mongoose.createConnection(MONGO_URI).asPromise();
    const admin = client.db.admin();
    
    console.log('--- List of Databases ---');
    const dbs = await admin.listDatabases();
    for (const db of dbs.databases) {
      console.log(`- ${db.name}`);
      const dbInstance = client.useDb(db.name);
      const collections = await dbInstance.db.listCollections().toArray();
      for (const coll of collections) {
        const count = await dbInstance.collection(coll.name).countDocuments();
        console.log(`  └─ ${coll.name}: ${count} docs`);
      }
    }
    
    console.log('\n--- Done ---');
    process.exit(0);
  } catch (err) {
    console.error('Failed to list databases:', err);
    process.exit(1);
  }
}

listDbs();
