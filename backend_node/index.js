const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

// Connect to Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/product', require('./src/routes/product'));
app.use('/api/alert', require('./src/routes/alert'));
app.use('/api/blockchain', require('./src/routes/blockchain'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api/admin', require('./src/routes/admin'));

app.get('/', (req, res) => res.send('TraceChain API Running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
