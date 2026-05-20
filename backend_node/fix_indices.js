const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndices() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB...");
        
        const collection = mongoose.connection.collection('batches');
        const indices = await collection.indexes();
        console.log("Current indices:", indices.map(i => i.name));
        
        if (indices.some(i => i.name === 'productID_1')) {
            console.log("Dropping old index: productID_1");
            await collection.dropIndex('productID_1');
        }
        
        if (indices.some(i => i.name === 'productId_1')) {
            console.log("Dropping old index: productId_1");
            await collection.dropIndex('productId_1');
        }

        console.log("Indices fixed!");
        process.exit(0);
    } catch (err) {
        console.error("Error fixing indices:", err.message);
        process.exit(1);
    }
}

fixIndices();
