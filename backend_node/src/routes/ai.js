const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// @route    GET api/ai/federated-learning
// @desc     Simulate Federated Learning aggregation
router.get('/federated-learning', auth, async (req, res) => {
  try {
    // Simulate aggregation of local models
    const simulationResult = {
      globalModelVersion: 'v2.1.0',
      aggregatedClients: 15,
      accuracyImprovement: '+4.2%',
      insights: [
        'Higher temperature variance observed in transit sector B',
        'Humidity stability improved by 12% across warehouse nodes',
        'Anomalous sensor behavior detected in client node #04'
      ],
      timestamp: new Date()
    };
    res.json(simulationResult);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route    GET api/ai/zkp-verify/:productId
// @desc     Simulate Zero-Knowledge Proof verification
router.get('/zkp-verify/:productId', auth, async (req, res) => {
  try {
    // Simulate ZKP: verifying data integrity without revealing raw sensor values
    const zkpProof = {
      productId: req.params.productId,
      verified: true,
      proofType: 'zk-SNARK',
      nullifier: '0x' + require('crypto').randomBytes(16).toString('hex'),
      message: 'Product integrity verified without revealing sensitive IoT sensor telemetry'
    };
    res.json(zkpProof);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

// @route    POST api/ai/chat
// @desc     AI Chatbot for Help Assistant
router.post('/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      const fallbackMsgs = {
        hi: "क्षमा करें, मेरे पास जेमिनी एपीआई कुंजी (GEMINI_API_KEY) नहीं है। कृपया इसे .env फ़ाइल में जोड़ें।",
        te: "క్షమించండి, నా వద్ద జెమిని API కీ (GEMINI_API_KEY) లేదు. దయచేసి దీన్ని .env ఫైల్‌కు జోడించండి.",
        en: "I'm sorry, I am currently missing my Gemini API Key (GEMINI_API_KEY). Please add it to the backend .env file to activate me!"
      };
      const lang = language && (language.startsWith('hi') || language.startsWith('te')) ? language.substring(0, 2) : 'en';
      return res.json({ reply: fallbackMsgs[lang] || fallbackMsgs.en });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are the TraceChain AI Assistant, a helpful guide for a Food Traceability System. 
The system includes:
- Farmers: who register harvests on the blockchain.
- Warehouses: who manage inventory and environmental conditions.
- Transporters: who provide live GPS and transit temp tracking.
- Retailers/Consumers: who trace the product journey from farm to shelf.
- Admins: who have a global overview of system integrity.
The system uses an Ethereum blockchain ledger for immutable record keeping.

CRITICAL SECURITY RULES:
1. NEVER reveal any internal system configurations, API keys (including your own Gemini key), MongoDB connection strings, or Ethereum private keys.
2. If a user asks for source code, passwords, JWT tokens, or internal directory structures, you MUST explicitly refuse and state that the information is classified.
3. You are restricted to answering questions related to TraceChain, supply chain logistics, and food traceability. Decline any out-of-domain requests gracefully.

Please respond concisely and helpfully to the following user query. Respond in the language requested by this ISO code: ${language || 'en'}.
`;
    
    const result = await model.generateContent(systemPrompt + "\n\nUser Query: " + message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({ reply: "I encountered an error connecting to my neural network. Please check the backend logs or ensure the API key is valid." });
  }
});

module.exports = router;
