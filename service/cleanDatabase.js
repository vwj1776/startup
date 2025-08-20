const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

async function cleanDatabase() {
    try {
        console.log('🔌 Connecting to database...');
        
        const uri = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}/?retryWrites=true&w=majority&appName=databasestorer`;
        const client = new MongoClient(uri);
        
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        // Get the default database (usually the cluster name or "test")
        const db = client.db(); // This will use the default database
        
        const collections = await db.listCollections().toArray();
        console.log('📋 Current collections:', collections.map(c => c.name));
        
        // Drop the ChatChunk collection (airforce_chunks)
        const collectionExists = collections.some(c => c.name === 'airforce_chunks');
        
        if (collectionExists) {
            console.log('🗑️  Dropping airforce_chunks collection...');
            await db.collection('airforce_chunks').drop();
            console.log('✅ Successfully dropped airforce_chunks collection');
            
            // Check collection count after deletion
            const result = await db.collection('airforce_chunks').countDocuments();
            console.log(`📊 Documents remaining in airforce_chunks: ${result}`);
        } else {
            console.log('ℹ️  airforce_chunks collection does not exist');
        }
        
        // Show remaining collections
        const remainingCollections = await db.listCollections().toArray();
        console.log('📋 Remaining collections:', remainingCollections.map(c => c.name));
        
        await client.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error cleaning database:', error);
        process.exit(1);
    }
}

cleanDatabase();
