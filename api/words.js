const { kv } = require('@vercel/kv');

// Words API for Vercel – stores data in KV
module.exports = async function handler(req, res) {
  const key = 'wordsByTopic';
  
  if (req.method === 'GET') {
    try {
      const data = await kv.get(key);
      return res.status(200).json(data ?? null);
    } catch (err) {
      console.error('KV get error', err);
      return res.status(500).json({ error: 'Failed to read words list' });
    }
  }
  
  if (req.method === 'POST' || req.method === 'PUT') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Body must be JSON object' });
    }

    try {
      await kv.set(key, body);
      return res.status(200).json({ status: 'ok' });
    } catch (err) {
      console.error('KV set error', err);
      return res.status(500).json({ error: 'Failed to save words list' });
    }
  }
  
  res.setHeader('Allow', ['GET', 'POST', 'PUT']);
  return res.status(405).end();
} 