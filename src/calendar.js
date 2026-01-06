const { google } = require('googleapis');
const path = require('path');

const credentials = require('./credentials.json');

const oauthConfig = credentials.installed || credentials.web;
if (!oauthConfig) {
  throw new Error('Missing OAuth credentials: expected "installed" or "web" in credentials.json');
}
const { client_id, client_secret, redirect_uris } = oauthConfig;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

// 🔐 TOKEN guardado localmente
const fs = require('fs');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function handleOAuthCallback(code) {
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('✅ Token guardado en token.json');
}

function getAccessToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    return Promise.resolve();
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });

  console.log('👉 Autorizá esta app visitando esta URL:\n', authUrl);
  throw new Error('NEEDS_AUTH');
}

async function createEvent({ title, start, end }) {
  await getAccessToken();

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
