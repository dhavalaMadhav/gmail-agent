const { getGmailClient } = require('../gmail/gmailClient');

/**
 * Searches emails using Gmail query syntax.
 * @param {Object} user - Authenticated user
 * @param {Object} args - { query, maxResults }
 */
async function searchEmails(user, args = {}) {
  const gmail = getGmailClient(user);
  const { query, maxResults = 5 } = args;

  if (!query) throw new Error('searchEmails: query is required');

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    q: query,
    maxResults,
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

  return {
    tool: 'searchEmails',
    query,
    count: results.length,
    emails: results,
  };
}

module.exports = searchEmails;
