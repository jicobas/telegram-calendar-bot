const express = require('express');
require('dotenv').config();

const app = express();

const { handleUpdate } = require('./telegram');

app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    await handleUpdate(req.body);
  } catch (err) {
    console.error('❌ Error en handleUpdate:', err);
  }
  res.sendStatus(200); // Telegram SIEMPRE necesita 200
});

app.get('/', (req, res) => {
  res.send('OK');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en puerto ${PORT}`);
});
