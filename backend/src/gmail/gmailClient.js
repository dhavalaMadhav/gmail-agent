const { google } = require('googleapis');

/**
 * Creates an authenticated Gmail API client for a user.
 * @param {Object} user - Mongoose User document with accessToken + refreshToken
 * @returns {import('googleapis').gmail_v1.Gmail}
 */
function getGmailClient(user) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  // Auto-refresh token and persist back to DB
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      user.accessToken = tokens.access_token;
      await user.save();
    }
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

module.exports = { getGmailClient };
