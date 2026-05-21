const { getGmailClient } = require('../gmail/gmailClient');

/**
 * Reads the full content of an email.
 * @param {Object} user - Authenticated user
 * @param {Object} args - { messageId }
 */
async function readEmail(user, args = {}) {
  const gmail = getGmailClient(user);
  const { messageId } = args;

  if (!messageId) throw new Error('readEmail: messageId is required');

  const msgRes = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
    format: 'full',
  });

  const payload = msgRes.data.payload;
  const headers = payload.headers;
  const get = (name) => headers.find((h) => h.name === name)?.value || '';

  let body = '';
  const extractBody = (parts) => {
    for (const part of parts || []) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
        return;
      }
      if (part.parts) extractBody(part.parts);
    }
  };

  if (payload.body?.data) {
    body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
  } else {
    extractBody(payload.parts);
  }

  return {
    tool: 'readEmail',
    id: msgRes.data.id,
    subject: get('Subject'),
    from: get('From'),
    to: get('To'),
    date: get('Date'),
    body: body.trim(),
  };
}

module.exports = readEmail;
