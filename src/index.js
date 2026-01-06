const express = require('express');
const { handleUpdate } = require('./telegram');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  handleUpdate(req.body);
  res.send('ok');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server escuchando en puerto ${PORT}`);
});
