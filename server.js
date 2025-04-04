// filepath: c:\Users\benjo\desktop\veldon\startup\server.js
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://nodlev76:<db_password>@databasestorer.ucimyi8.mongodb.net/?retryWrites=true&w=majority&appName=databasestorer";

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");


        const config = require('./dbConfig.json');

        const url = `mongodb+sr://${config.userName}:${config.password}@${config.hostname}`;

        const db = client.db('rental');
        const collection = db.collection('house');

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);

