# SearchLight Digital

Marketing website and internal tooling for **SearchLight Digital** — a solo-operated GEO (Generative Engine Optimization) analysis service. Helps businesses understand and improve how they appear in AI-generated answers from ChatGPT, Claude, Perplexity, Gemini, and Grok.

---

## What's in this repo

### 1. Marketing Website (`src/App.jsx`)

A single-page React marketing site built with Vite + Tailwind CSS. All sections live in one file as self-contained components. Includes a spotlight cursor effect, scroll fade-ins, animated counters, and a dark-mode design.

**Sections:** Nav, Hero, What We Do, SEO vs GEO, Services, How It Works, Five Next Steps, Why It Matters, Why SearchLight, Pricing, FAQ, Final CTA, Footer.

**Run locally:**
```bash
npm install
npm run dev
```

## Tech Stack

| Layer | Stack |
|---|---|
| Marketing site | React 18, Vite, Tailwind CSS 3 |
| GEO server | Node.js, Express, Anthropic SDK, Cheerio |
| Report output | Self-contained HTML, Chart.js (CDN), html2pdf.js (CDN) |

---

## GEO Scoring Framework

Reports score websites across **6 dimensions (100 pts total)**:

| Dimension | Max pts |
|---|---|
| Entity Clarity & Brand Definition | 20 |
| Content Signals & AI Readability | 20 |
| Citation & Third-Party Presence | 20 |
| Schema Markup & Technical Structure | 15 |
| Brand Authority & Trust Signals | 15 |
| Topical Coverage & Depth | 10 |

Each dimension uses a 4-band rubric (Exemplary / Solid / Partial / Absent). The overall score drives per-LLM score adjustments based on each platform's known ranking signals.

---

## Setup

```bash
# Install dependencies
npm install

# Copy .env.example and add your Anthropic API key
cp .env.example .env
```

`.env` variables:
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GEO_PORT=3001   # optional, defaults to 3001
```

---

## Project Structure

```
src/
  App.jsx           # Full marketing website (all sections)
  main.jsx          # React entry point
  index.css         # Global styles

tools/
  geo-generator/
    server.js       # Express + Claude API server
    index.html      # Generator UI

docs/
  prompts/
    deep-geo-analyzer-system-prompt.md   # Claude Project system prompt
    geo-report-template.html             # HTML output template
    geo-report-demo.html                 # Demo report
  HANDOFF.md        # Project context and decisions log

public/
  searchlight-logo.png
  searchlight-icon.png

Marketing Materials/   # Brand slide assets
```
