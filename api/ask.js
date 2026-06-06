const fs = require('fs');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: 'Missing question' });

  let resume = '';
  try {
    resume = fs.readFileSync('./resume_context.txt', 'utf8');
  } catch (e) {
    // continue with empty resume if file not available
    resume = '';
  }

  const systemPrompt = `You are an assistant that ONLY answers based on the provided resume/context. If the user asks for contact actions, return an HTML mailto: or sms: link. If the answer is not in the resume, say you don't have that detail and offer related info from the resume.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: `Resume context:\n${resume}` },
    { role: 'user', content: `User question: ${question}` }
  ];

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured on server.' });
  }

  try {
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'OpenAI error', details: text });
    }

    const data = await r.json();
    const answer = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content ? data.choices[0].message.content : '';

    // Simple heuristic: if answer contains mailto or sms return html true
    const isHtml = /mailto:|sms:|<a\s+/i.test(answer);

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ answer, html: isHtml });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
