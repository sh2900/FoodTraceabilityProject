const mongoose = require('mongoose');
const User = require('./src/models/User');
const Batch = require('./src/models/Batch');
const { storeOnBlockchain } = require('./src/utils/blockchain');
require('dotenv').config();

const seedDemoBatch = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Batch Seeding...');
    
    // Clear existing batches
    await Batch.deleteMany({});
    console.log('Cleared existing batches.');

    const farmer = await User.findOne({ role: 'farmer' });
    if (!farmer) {
      console.error('No farmer found. Run npm run seed first.');
      process.exit(1);
    }

    const batchId = "DEMO-BATCH-2026";
    
    // 1. Initialize
    console.log('Pushing initialization to Blockchain...');
    const tx1 = await storeOnBlockchain(batchId, "INIT-HASH-123");

    const batch = new Batch({
      batchId: batchId,
      productName: "Organic Strawberries",
      quantity: 500,
      farmerID: farmer._id,
      currentStage: "warehouse", // Set to warehouse so it shows up in warehouse dashboard
      temperature: 4,
      humidity: 60,
      location: { lat: 17.3850, lng: 78.4867 }, // Hyderabad
      status: "Safe",
      specifications: { tempMin: 2, tempMax: 8 },
      history: [
        {
          stage: "farmer",
          location: { lat: 17.3850, lng: 78.4867 },
          status: "Harvested",
          actor: farmer._id,
          temperature: 4,
          humidity: 60,
          blockchainHash: tx1
        }
      ],
      blockchainRecords: [
        {
          batchId,
          stage: "farmer",
          timestamp: new Date(),
          hash: tx1
        }
      ]
    });

    // 2. Add an update (Simulating Warehouse)
    console.log('Simulating Warehouse Update...');
    const warehouse = await User.findOne({ role: 'warehouse' });
    const tx2 = await storeOnBlockchain(batchId, "WAREHOUSE-HASH-456");
    
    batch.history.push({
      stage: "warehouse",
      location: { lat: 17.4448, lng: 78.3498 }, // Gachibowli
      status: "Stored",
      actor: warehouse._id,
      temperature: 6, // Warning threshold is > 5
      humidity: 65,
      blockchainHash: tx2
    });

    batch.blockchainRecords.push({
      batchId,
      stage: "warehouse",
      timestamp: new Date(),
      hash: tx2
    });

    batch.status = "Warning"; // 6 is between 5 and 8
    batch.location = { lat: 17.4448, lng: 78.3498 };
    batch.temperature = 6;

    await batch.save();
    console.log(`Demo Batch Created! ID: ${batchId}`);
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDemoBatch();
