// server.js – Express proxy for Anthropic Claude API
// This keeps your ANTHROPIC_API_KEY safe on the server side.

const express = require('express');
const path    = require('path');

// Use built-in fetch (Node 18+) or node-fetch as fallback
let fetch;
try {
  fetch = globalThis.fetch;           // Node 18+
  if (!fetch) throw new Error('no built-in fetch');
} catch {
  fetch = require('node-fetch');      // fallback
}

require('dotenv').config();           // loads .env automatically

const app  = express();
const PORT = process.env.PORT || 3000;

// Serve static files (index.html, style.css, main.js)
app.use(express.static(path.join(__dirname)));
app.use(express.json());

/* ------------------------------------------------------------------
   Full CV / portfolio context injected as the system prompt
   ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `You are an AI assistant for the portfolio of Md Mubashshir Billah. \
Answer visitors' questions about him in a friendly, professional, and concise manner. \
Only answer questions related to his profile, skills, experience, projects, and career goals. \
If asked something unrelated, politely redirect to his portfolio.

== PROFILE ==
Name: Md Mubashshir Billah
University: Albukhary International University (AIU), Alor Setar, Kedah, Malaysia
Degree: Bachelor of Media and Communication (2023–Dec 2026)
Foundation: Foundation in Computing (2022–2023)
CGPA: 3.63 | Consecutive Dean's List
Scholarship: Full scholarship from Albukhary Foundation
Email: mubashshirbillah@student.aiu.edu.my
Phone: +60 11-6782 0223
LinkedIn: https://www.linkedin.com/in/mubashshir-billah

== CAREER OBJECTIVE ==
Seeking internship in Public Relations, Digital Marketing, Media Production, or Corporate Communication.

== SKILLS ==
Communication & Public Speaking, Social Media Management, Writing & Reporting, Video Editing & Photography, \
Poster & Content Design, Media Production & Broadcasting, Leadership & Team Management, Microsoft Office, \
Event Coordination, Camera Operation, Lighting Setup, Live Production.

== EXPERIENCE & LEADERSHIP ==
1. Head of Media Department – Al-Quran Club, AIU (2023–2024): Managed social media platforms, created digital \
   promotional content, designed posters and reels for events.
2. President – AIU Cricket Club (2023–Present): Leads cricket activities, tournaments, and team coordination. \
   Played 30+ official matches.
3. Secretary – Bangladeshi Students Community AIU / BASCA (2023–2024): Organized student programs and managed \
   official communications.
4. Volunteer – World IT Space / 3 Zero Club (2023–Present): IT support services and community social business initiatives.
5. Private Tutor (2025–Present): Teaches English, Math, and Quran to a local Rohingya (Myanmar) family.

== MEDIA PROJECTS ==
1. "Lanoh's Book of Life" – 24-min Documentary (Jan 2025) – Roles: Cameraman, Gaffer, Editor, Safety Officer
2. "Are You Okay?" – 7-min Short Film (Oct 2025) – Roles: Cameraman, Audio Assistant
3. "Lectured!" – Broadcasting Journalism (Oct 2024) – Roles: Videographer, Lighting Assistant
4. 4th Convocation Ceremony Livestream (Dec 2024) – Roles: Cameraman, Live Production Assistant

== ACHIEVEMENTS ==
- Full Albukhary Foundation Scholarship
- Consecutive Dean's List (CGPA 3.63)
- 12+ sports and activity medals (Cricket, Football)
- Represented AIU Cricket Club in multiple tournaments and won awards
- Active in community service and student leadership

== LANGUAGES ==
English (Fluent), Bengali (Native), Arabic (Intermediate), Malay (Intermediate)

== REFERENCES ==
1. Mohamad Nor Hisyam bin Musa – HOP Media and Communication, AIU | +6012-840 3454 | hisyam.musa@aiu.edu.my
2. Dr Hisham Anand Barbhuiya – Senior Lecturer, AIU | +90 5522449834 | hisham.barbhuiya@aiu.edu.my`;

/* ------------------------------------------------------------------
   POST /api/chat  – proxy to Anthropic Claude
   ------------------------------------------------------------------ */
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "message" field.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured. Please update your .env file.',
    });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(502).json({
        error: `Anthropic API returned ${response.status}. Check your API key and quota.`,
      });
    }

    const data  = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not generate a response.';
    return res.json({ reply });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error. ' + err.message });
  }
});

/* ------------------------------------------------------------------
   Fallback – serve index.html for any other GET request (SPA support)
   ------------------------------------------------------------------ */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio server running at http://localhost:${PORT}`);
  console.log(`   Press Ctrl+C to stop.\n`);
});
