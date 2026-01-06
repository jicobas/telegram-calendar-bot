const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'token.json');

function getOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } =
    process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Missing Google OAuth env vars');
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
  }

  return oAuth2Client;
}

async function handleOAuthCallback(code) {
  const oAuth2Client = getOAuthClient();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('✅ Token guardado en token.json');
}

async function createEvent({ title, start, end }) {
  const auth = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  await calendar.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: title,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });
}

module.exports = {
  createEvent,
  handleOAuthCallback,
};
