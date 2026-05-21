const { getGmailClient } = require('../gmail/gmailClient');

/**
 * Replies to an existing email thread.
 * @param {Object} user - Authenticated user
 * @param {Object} args - { messageId, threadId, to, subject, body }
 */
async function replyEmail(user, args = {}) {
  const gmail = getGmailClient(user);
  const { messageId, threadId, to, subject, body } = args;

  if (!messageId || !threadId || !to || !body) {
    throw new Error(
      'replyEmail: messageId, threadId, to, and body are required'
    );
  }

  const reSubject = subject?.startsWith('Re:') ? subject : `Re: ${subject}`;

  const emailLines = [
    `From: ${user.email}`,
    `To: ${to}`,
    `Subject: ${reSubject}`,
    `In-Reply-To: ${messageId}`,
    `References: ${messageId}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];

  const raw = Buffer.from(emailLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw, threadId },
  });

  return {
    tool: 'replyEmail',
    success: true,
    messageId: res.data.id,
    threadId,
    to,
  };
}

module.exports = replyEmail;
