const express = require('express');
const { getGmailClient } = require('./gmailClient');
const router = express.Router();

// Middleware: require auth
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

// GET /gmail/messages?maxResults=10&labelIds=INBOX&q=
router.get('/messages', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.user);
    const { maxResults = 10, labelIds = 'INBOX', q = '' } = req.query;

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: parseInt(maxResults),
      labelIds: labelIds.split(','),
      q,
    });

    const messages = listRes.data.messages || [];

    // Fetch metadata for each message
    const detailed = await Promise.all(
      messages.map(async (msg) => {
        const msgRes = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });
        const headers = msgRes.data.payload.headers;
        const get = (name) =>
          headers.find((h) => h.name === name)?.value || '';
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: msgRes.data.snippet,
          subject: get('Subject'),
          from: get('From'),
          to: get('To'),
          date: get('Date'),
          labelIds: msgRes.data.labelIds,
        };
      })
    );

    res.json({ messages: detailed });
  } catch (err) {
    console.error('Gmail list error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /gmail/messages/:id
router.get('/messages/:id', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.user);
    const msgRes = await gmail.users.messages.get({
      userId: 'me',
      id: req.params.id,
      format: 'full',
    });

    const payload = msgRes.data.payload;
    const headers = payload.headers;
    const get = (name) => headers.find((h) => h.name === name)?.value || '';

    // Extract body
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

    res.json({
      id: msgRes.data.id,
      threadId: msgRes.data.threadId,
      subject: get('Subject'),
      from: get('From'),
      to: get('To'),
      date: get('Date'),
      body,
      labelIds: msgRes.data.labelIds,
    });
  } catch (err) {
    console.error('Gmail read error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /gmail/messages/:id/read
router.post('/messages/:id/read', requireAuth, async (req, res) => {
  try {
    const gmail = getGmailClient(req.user);
    await gmail.users.messages.batchModify({
      userId: 'me',
      ids: [req.params.id],
      resource: {
        removeLabelIds: ['UNREAD'],
      },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Gmail mark read error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
