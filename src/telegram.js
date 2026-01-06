const fetch = require('node-fetch');
const {
  detectIntent,
  parseDateFromText,
  parseTimeRangeFromText,
  extractTitle,
} = require('./parser');
const { createEvent } = require('./calendar');

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

async function sendMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  console.log('🔑 Telegram token cargado:', !!process.env.TELEGRAM_TOKEN);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('❌ Error enviando mensaje a Telegram:', data);
  } else {
    console.log('📤 Mensaje enviado a Telegram');
  }
}

async function handleUpdate(update) {
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id;
  const text = update.message.text;

  console.log('💬 Mensaje:', text);

  const intent = detectIntent(text);

  if (intent === 'create_event') {
    const date = parseDateFromText(text);
    const timeRange = parseTimeRangeFromText(text);
    const titleRaw = extractTitle(text);
    const title = capitalizeTitle(titleRaw);

    if (!date) {
      sendMessage(chatId, '📅 ¿Para qué día? Ej: mañana / 21/1');
      return;
    }

    if (!timeRange) {
      sendMessage(chatId, '⏰ ¿En qué horario? Ej: de 10 a 11');
      return;
    }

    const start = new Date(date);
    start.setHours(timeRange.startHour, 0, 0, 0);

    const end = new Date(date);
    end.setHours(timeRange.endHour, 0, 0, 0);

    try {
      await createEvent({ title, start, end });
      console.log('✅ Evento creado');
    } catch (err) {
      console.error('❌ Error creando evento:', err);
      await sendMessage(
        chatId,
        '❌ Hubo un error creando el evento. Mirá la consola.'
      );
      return;
    }

    await sendMessage(
      chatId,
      `Listo 🙌\n\n📌 ${title}\n📅 ${start.toLocaleDateString('es-AR')}\n🕒 ${
        timeRange.startHour
      }:00–${timeRange.endHour}:00`
    );

    return;
  }

  if (intent === 'list_events') {
    sendMessage(chatId, '📅 Entendí que querés ver tu agenda');
    return;
  }

  sendMessage(
    chatId,
    'No te entendí 😅\n\nProbá:\n- Agendá reunión mañana\n- ¿Qué tengo hoy?'
  );
}

function capitalizeTitle(text) {
  const lowercaseWords = [
    'con',
    'de',
    'y',
    'a',
    'el',
    'la',
    'los',
    'las',
    'del',
  ];

  return text
    .split(' ')
    .map((word, index) => {
      if (index !== 0 && lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function capitalizeFirst(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

module.exports = {
  handleUpdate,
};
