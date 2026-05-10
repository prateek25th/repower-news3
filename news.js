// api/news.js — Vercel Serverless Function
// Runs on Vercel's server. GEMINI_API_KEY is a secret env variable.
// Users never see the key. No CORS issues — same domain as frontend.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ── Prompts ────────────────────────────────────────────────────────────────

function getIndustryPrompt(today) {
  return `You are editor of REPower News. Today is ${today}.

Generate 8 renewable energy INDUSTRY & BUSINESS news articles from the last 7 days.
Cover a DIVERSE mix — NOT just tenders:
- Leadership changes (CEO/MD/Chairman appointments in RE companies)
- Government statements (what India ministers said about RE sector)
- New regulations (MNRE circulars, CERC/SERC orders, policy notifications)
- Newspaper headlines about major RE developments
- Company earnings, fundraising, IPOs, partnerships
- International RE deals and climate finance agreements
- Capacity additions and records broken
- Grid and transmission infrastructure updates
- Manufacturing news (PLI scheme, import duties, production milestones)
- Green bonds and sustainability financing

India entities: Adani Green Energy, NTPC Renewable, ReNew Power, Tata Power Solar, Greenko, Torrent Power, JSW Energy, Waaree Energies, Premier Energies, Vikram Solar, SECI, MNRE, IREDA, CERC, Hero Future Energies, Avaada Energy.
Global entities: Orsted, Vestas, Siemens Gamesa, Shell Renewables, BP, Equinor, RWE, Enel Green Power, NextEra Energy, Iberdrola.
Mix: 5 India + 3 global articles. All different topics and companies.

Return ONLY a valid JSON array. Each object must have EXACTLY these keys:
headline, summary, source, searchQuery, category, region, validity, validityReason, timeAgo

Rules:
- headline: compelling headline, max 12 words
- summary: 80-90 words. Start with entity name. Include specific figures (MW/GW, ₹crore/$billion), location, timeline, significance.
- source: one of: Economic Times|Business Standard|Livemint|Financial Express|The Hindu|Times of India|Business Line|Solar Quarter|Mercom India|PV Magazine|NDTV|Hindustan Times|Reuters|Bloomberg|AP News|Down To Earth|Deccan Herald
- searchQuery: 6-8 words + "2025" for Google News search
- category: one of: Solar Tender|Wind Auction|Green Finance|Project Commission|Policy Update|Leadership Change|Regulation|Market Analysis|Company Results|International Deal|Grid Infrastructure|Manufacturing|Rooftop Solar|Energy Storage|Offshore Wind
- region: India or Global or Europe or US or Middle East
- validity: 8
- validityReason: short reason e.g. "Industry publication cited"
- timeAgo: "1h ago" to "6 days ago"

JSON array only. No markdown. No explanation. Start with [ and end with ]`;
}

function getTechPrompt(today) {
  return `You are editor of REPower News. Today is ${today}.

Generate 8 renewable energy TECHNOLOGY & INNOVATION news articles from the last 7 days.
Pick 8 completely different topics from:
perovskite solar cells, tandem solar cells, solid-state batteries, sodium-ion batteries, green hydrogen electrolyzers, floating offshore wind, iron-air long-duration storage, AI grid management, building-integrated PV, agrivoltaics, wave energy converters, vehicle-to-grid, virtual power plants, compressed air energy storage, green ammonia, bifacial solar records, offshore wind size records, battery recycling, gravity storage, tidal stream energy, EV second-life batteries, solar desalination.

Key institutions: NREL, MIT, IIT Delhi/Bombay, Fraunhofer ISE, Tesla Energy, QuantumScape, Northvolt, Form Energy, Nel Hydrogen, ITM Power, LONGi Solar, Siemens Energy, Canadian Solar, First Solar.

Return ONLY a valid JSON array. Each object must have EXACTLY these keys:
headline, summary, source, searchQuery, category, region, validity, validityReason, timeAgo

Rules:
- headline: technology headline, max 12 words
- summary: 80-90 words. Start with institution/company name. Include specific metrics: efficiency %, cost per kWh, % improvement, commercialisation timeline, real-world significance.
- source: one of: CleanTechnica|Electrek|PV Magazine|IRENA|IEA|Solar Power World|Green Tech Media|Bloomberg NEF|MIT Technology Review|Nature Energy|Science Daily|Wood Mackenzie|Canary Media|RE World|Renewable Energy World
- searchQuery: 6-8 words + "2025" for Google News search
- category: one of: Solar Tech|Battery Innovation|Green Hydrogen|Offshore Wind Tech|Grid Technology|EV Technology|Energy Storage|Carbon Tech|Smart Grid|Agrivoltaics|Wave Energy|Building Solar|Tidal Energy|Green Ammonia
- region: Global or Europe or US or India or Asia
- validity: 8
- validityReason: "Research institution cited"
- timeAgo: "1h ago" to "6 days ago"

JSON array only. No markdown. No explanation. Start with [ and end with ]`;
}

function getLearnPrompt() {
  const topics = [
    'How solar PV panels generate electricity using the photoelectric effect',
    'How wind turbines produce power through aerodynamics and generators',
    'How lithium-ion battery storage works and its grid applications',
    'How the electricity grid balances supply and demand in real time',
    'Green hydrogen production through water electrolysis explained',
    'How offshore wind farms are built and connected to shore',
    'What is a Power Purchase Agreement and how it works in India',
    'How electric vehicles work including motors and regenerative braking',
    'Perovskite solar cells — why they may replace silicon panels',
    'Agrivoltaics — combining solar panels with farming for dual benefit',
    'Vehicle-to-grid technology — EVs stabilising the power grid',
    'How pumped hydro storage works as the world oldest battery',
    'Net metering — how rooftop solar owners earn from surplus power',
    'Capacity factor — why a 100MW solar plant produces less than 100MW',
    'India ISTS waiver and how it made renewable energy cheaper',
    'Solid-state batteries — safer and more energy dense than lithium-ion',
    'Floating solar farms on reservoirs and their water-saving advantages',
    'The duck curve — why solar power creates a grid challenge at sunset',
    'Green steel — using hydrogen to replace coal in blast furnaces',
    'India National Green Hydrogen Mission targets and 2030 roadmap',
  ];
  // Pick 6 random topics
  const chosen = topics.sort(() => Math.random() - 0.5).slice(0, 6);

  return `You are a renewable energy educator. Create 6 educational learning cards.

Topics (one card per topic):
${chosen.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return ONLY a valid JSON array. Each object must have EXACTLY these flat string fields (no nested objects, no arrays inside):
title, category, difficulty, intro, c1_title, c1_text, c2_title, c2_text, c3_title, c3_text, stat1, stat2, stat3, stat4, readUrl, readLabel

Rules:
- title: clear educational title, max 10 words
- category: Solar Energy|Wind Energy|Battery Storage|Grid & Systems|Hydrogen|EV & Transport|Ocean Energy|Energy Policy
- difficulty: Beginner or Intermediate or Advanced
- intro: 65-70 word engaging introduction explaining why this matters
- c1_title: first concept title starting with an emoji
- c1_text: 55 word explanation with a helpful analogy
- c2_title: second concept title starting with an emoji
- c2_text: 55 word explanation building on the first concept
- c3_title: third concept title starting with an emoji
- c3_text: 55 word explanation with India-specific data or policy context
- stat1 to stat4: short factual stats with numbers e.g. "India: 90 GW solar installed 2024"
- readUrl: real authoritative URL from irena.org, iea.org, mnre.gov.in, or nrel.gov
- readLabel: short label e.g. "Explore at IRENA"

All field values must be plain strings. JSON array only. No markdown. No extra text. Start with [ end with ]`;
}

// ── Main handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // CORS headers (in case needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  if (req.method === 'GET' && req.query.health) {
    return res.status(200).json({
      status: 'ok',
      hasKey: !!process.env.GEMINI_API_KEY,
      model: 'gemini-2.5-flash',
      timestamp: new Date().toISOString(),
    });
  }

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY not set in Vercel environment variables. Go to Vercel dashboard → Settings → Environment Variables.',
    });
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  // Helper: call Gemini and parse JSON response
  async function callGemini(prompt, maxTokens = 4096) {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON from response
    const attempts = [
      () => JSON.parse(text.trim()),
      () => JSON.parse(text.replace(/```json|```/g, '').trim()),
      () => { const m = text.match(/\[[\s\S]*\]/); if (m) return JSON.parse(m[0]); throw new Error('no array'); },
    ];
    for (const fn of attempts) {
      try { return fn(); } catch {}
    }
    throw new Error(`Could not parse Gemini response. Raw: ${text.slice(0, 200)}`);
  }

  try {
    // Make 3 separate calls (industry, tech, learn) with small delays
    // This is more reliable than one huge combined call
    const [industry, tech, learn] = await Promise.all([
      callGemini(getIndustryPrompt(today), 4096),
      callGemini(getTechPrompt(today), 4096),
      callGemini(getLearnPrompt(), 4096),
    ]);

    return res.status(200).json({
      industry: Array.isArray(industry) ? industry : [],
      tech:     Array.isArray(tech)     ? tech     : [],
      learn:    Array.isArray(learn)    ? learn     : [],
      generatedAt: new Date().toISOString(),
      today,
    });

  } catch (err) {
    console.error('API error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
