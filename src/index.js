const express = require('express');
const { handleUpdate } = require('./telegram');

require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  await handleUpdate(req.body);
  res.send('ok');
});

const { handleOAuthCallback } = require('./calendar');

app.get('/oauth2callback', async (req, res) => {
  try {
    await handleOAuthCallback(req.query.code);
    res.send('✅ Autorización completada. Podés volver a Telegram.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Error durante la autorización');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en puerto ${PORT}`);
});
