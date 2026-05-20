const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        
        const collection = mongoose.connection.collection('batches');
        const indices = await collection.indexes();
        console.log("Current indices:", indices.map(i => i.name));
        
        for (const index of indices) {
            if (index.name !== '_id_' && index.name !== 'batchId_1') {
                console.log(`Dropping index: ${index.name}`);
                await collection.dropIndex(index.name);
            }
        }
        
        console.log("Remaining indices:", (await collection.indexes()).map(i => i.name));
        console.log("Indices fixed!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing indices:", err.message);
        process.exit(1);
    }
}

fixIndices();
