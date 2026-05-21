const { getGmailClient } = require('../gmail/gmailClient');

/**
 * Encodes a raw email string to base64url format.
 */
function encodeEmail(to, from, subject, body) {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ].join('\r\n');

  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email via Gmail API.
 * @param {Object} user - Authenticated user
 * @param {Object} args - { to, subject, body }
 */
async function sendEmail(user, args = {}) {
  const gmail = getGmailClient(user);
  const { to, subject, body } = args;

  if (!to || !subject || !body) {
    throw new Error('sendEmail: to, subject, and body are required');
  }

  const raw = encodeEmail(to, user.email, subject, body);

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return {
    tool: 'sendEmail',
    success: true,
    messageId: res.data.id,
    to,
    subject,
  };
}

module.exports = sendEmail;
