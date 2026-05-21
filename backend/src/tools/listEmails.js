const { getGmailClient } = require('../gmail/gmailClient');

/**
 * Lists emails from the user's inbox.
 * @param {Object} user - Authenticated user
 * @param {Object} args - { maxResults, labelIds, q }
 */
async function listEmails(user, args = {}) {
  const gmail = getGmailClient(user);
  const { maxResults = 5, labelIds = ['INBOX'], q = '' } = args;

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    labelIds,
    q,
  });

  const messages = listRes.data.messages || [];

  const results = await Promise.all(
    messages.map(async (msg) => {
      const msgRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['From', 'Subject', 'Date'],
      });
      const headers = msgRes.data.payload.headers;
      const get = (name) => headers.find((h) => h.name === name)?.value || '';
      return {
        id: msg.id,
        subject: get('Subject'),
        from: get('From'),
        date: get('Date'),
        snippet: msgRes.data.snippet,
      };
    })
  );

  return { tool: 'listEmails', count: results.length, emails: results };
}

module.exports = listEmails;
