const mongoose = require('mongoose');
require('dotenv').config();

async function cleanAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            console.log(`Cleaning collection: ${col.name}`);
            try {
                await db.collection(col.name).dropIndexes();
                console.log(`  Dropped all indices for ${col.name}`);
            } catch (e) {
                console.log(`  No indices to drop or collection empty for ${col.name}`);
            }
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanAll();
