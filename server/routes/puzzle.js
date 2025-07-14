const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.get('/generate-puzzle', async (req, res) => {
  try {
    const prompt = `Create a short, clever riddle or puzzle for a GPS-based bounty hunting game. Return only the riddle.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
    });

    const puzzle = completion.choices[0].message.content.trim();
    res.json({ puzzle });
  } catch (err) {
    console.error('AI puzzle generation error:', err.message);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

module.exports = router;
