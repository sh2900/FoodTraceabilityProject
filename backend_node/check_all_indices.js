const mongoose = require('mongoose');
require('dotenv').config();

async function checkAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            const indices = await db.collection(col.name).indexes();
            console.log(`Collection: ${col.name}, Indices:`, indices.map(i => i.name));
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkAll();
