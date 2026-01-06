const fetch = require('node-fetch');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

async function sendMessage(chatId, text) {
  const url = `${TELEGRAM_API}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}

function handleUpdate(update) {
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text;

  console.log('💬 Mensaje:', text);

  sendMessage(chatId, '👋 Te leí');
}

module.exports = {
  handleUpdate
};
