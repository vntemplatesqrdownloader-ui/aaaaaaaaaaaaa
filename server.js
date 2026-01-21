const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const AWS_API = 'http://3.107.212.83:8000';
const HF_API_TOKEN = process.env.HF_API_TOKEN || '';

app.get('/', (req, res) => {
  res.json({ status: 'Backend running', version: '1.0' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(`${AWS_API}/generate-text`, { message });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
      { inputs: prompt },
      { 
        headers: { 'Authorization': `Bearer ${HF_API_TOKEN}` },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );
    
    const base64 = Buffer.from(response.data).toString('base64');
    res.json({ 
      image: `data:image/png;base64,${base64}`,
      status: 'success' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});