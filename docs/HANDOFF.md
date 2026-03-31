# PROJECT HANDOFF

**Project:** IndexForge LLM — Deep GEO Analyzer
**Date:** 2026-03-18
**Spec location:** `docs/superpowers/specs/2026-03-18-deep-geo-analyzer-design.md`

---

## Product Summary

IndexForge LLM is a solo-operated SEO/GEO analysis service. The owner (Jett) manually runs audits for clients and delivers reports. The **Deep GEO Analyzer** is an internal tool — a Claude Project configured with a custom system prompt — that automates the most labor-intensive part of the GEO Report workflow.

The tool takes a single company URL as input. Claude fetches up to 5 pages of that website, scores it across 6 GEO dimensions using explicit point rubrics, calculates separate scores for 5 LLM platforms (ChatGPT, Claude, Perplexity, Gemini, Grok), and outputs a complete self-contained dark-mode HTML dashboard. Jett copies the HTML output, saves it as a `.html` file, and delivers it to the client.

This replaces a looser, less structured Claude Project prompt that Jett was previously using. The upgrade adds: a 100-point rubric scoring system with letter grades, per-LLM scores with platform-specific adjustment logic, interactive Chart.js visualizations (radar, bar, donut), a query performance table, and a 5-step improvement plan with explicit quick win / big picture categorization.

---

## Core User Journey

1. Jett opens the Claude Project configured with the Deep GEO Analyzer system prompt
2. Jett pastes in the client's company URL (nothing else required)
3. Claude fetches up to 5 pages: homepage, about, service/product page, blog/resource, contact
4. Claude scores the site across 6 dimensions using rubric bands, sums to an overall score, assigns a letter grade
5. Claude calculates per-LLM scores for ChatGPT, Claude, Perplexity, Gemini, and Grok using platform-specific penalty/bonus formulas
6. Claude generates 12 representative queries across 4 categories (Branded, Category, Competitor, Problem/Solution) with visibility and sentiment estimates
7. Claude identifies 3–5 competitors and estimates their GEO scores
8. Claude identifies 3 quick-win steps and 2 big-picture improvement steps
9. Claude outputs a complete self-contained HTML file in a code block
10. Jett copies the HTML, saves it as `[CompanyName]-GEO-Report-[YYYY-MM-DD].html`, opens it in the browser, and delivers it to the client

The client sees: an overall GEO score + letter grade, individual LLM platform scores, a radar chart of dimension performance, a competitor comparison bar chart, a query performance table, a sentiment donut chart, dimension score bars, and the 5-step improvement plan — all in dark mode with IndexForge brand colors.

---

## Current Build Status

**Existing and working:**
- IndexForge LLM marketing website (`src/App.jsx`) — React + Vite + Tailwind, fully built, serving at localhost. Includes Nav, Hero, WhatWeDo, SEOvsGEO, Services, HowItWorks, FiveNextSteps, WhyItMatters, WhyIndexForge, Pricing, FAQ, FinalCTA, Footer sections.
- An existing GEO Report Claude Project prompt (prior version, light mode, 4 LLMs, less structured) — used to produce `TheInsuranceCenter-GEO-Report-2026-03-16.html` which lives at `C:/Users/Insurance/Desktop/Marketing Reports/`. That file is the reference for output quality and section structure.

**Built (2026-03-18):**
- `docs/prompts/geo-report-template.html` — The Layer 3 HTML template with all 84 placeholder comments, complete CSS, Chart.js single-polygon radar, competitor bar, sentiment donut, and html2pdf export. Open directly in a browser to inspect structure.
- `docs/prompts/deep-geo-analyzer-system-prompt.md` — The complete 3-layer system prompt ready to paste into a Claude Project. Layer 1 (role), Layer 2 (all 6 rubrics, per-LLM formula, grade scale, query rules, improvement plan criteria, color logic, normalization math), Layer 3 (full HTML template embedded).
- `docs/prompts/geo-report-demo.html` — A fully filled-in demo report using Acme Consulting Group as sample data. Open in browser to verify layout, charts, and plan card depth before running a live test.

**Placeholder consistency:** All 84 placeholders verified identical between template file and system prompt embedded template.

**The implementation task is:** paste the system prompt into a Claude Project and do a live test run.

---

## Current Focus

We just completed the full design spec for the Deep GEO Analyzer through a structured brainstorming session. The spec passed a 3-round automated review. The next session should begin implementation: writing the Claude Project system prompt (all 3 layers) and the accompanying HTML output template.

---

## Tech Stack

**Marketing website (existing, not the focus):**
- React 18 + Vite + Tailwind CSS
- Single-file component architecture (`src/App.jsx`)
- No backend, no database — static site

**GEO Analyzer tool (what we're building):**
- **Runtime:** Claude Project (claude.ai) with a custom system prompt
- **Input:** URL pasted by Jett into the chat
- **Web fetching:** Claude's built-in web fetch tool
- **Output:** Self-contained HTML file
- **Charts:** Chart.js via CDN (`https://cdn.jsdelivr.net/npm/chart.js`)
- **PDF export:** html2pdf.js via CDN (`https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`)
- **No backend, no database, no build step** — the entire "tool" is the Claude Project system prompt

---

## System Architecture

**Frontend (marketing site):** Single `src/App.jsx` file, all components inline. Vite dev server. No routing. Deployed statically.

**GEO Analyzer architecture:**

```
User (Jett)
    │ pastes URL
    ▼
Claude Project (with system prompt)
    │
    ├─ Layer 1: Role definition
    ├─ Layer 2: Rubrics + scoring formulas + output rules
    └─ Layer 3: Fixed HTML template with placeholder comments
    │
    ▼
Claude fetches pages (built-in web tool)
    │ homepage → about → service page → blog → contact
    ▼
Claude scores 6 dimensions against rubrics
    │ produces dimension scores (0–100 total)
    ▼
Claude calculates per-LLM adjustments
    │ produces 5 LLM scores (ChatGPT, Claude, Perplexity, Gemini, Grok)
    ▼
Claude generates query table, competitor estimates, improvement steps
    ▼
Claude fills HTML template with all data
    ▼
Claude outputs full HTML in code block
    │
    ▼
Jett copies → saves as .html → opens in browser → delivers to client
```

**No async jobs, no queues, no database, no API calls.** Everything happens in a single Claude conversation turn.

---

## Important Files and Folders

| Path | Purpose |
|---|---|
| `src/App.jsx` | Full marketing website — all sections in one file |
| `src/index.css` | Global styles |
| `src/main.jsx` | React entry point |
| `vite.config.js` | Vite config |
| `tailwind.config.js` | Tailwind config |
| `docs/superpowers/specs/2026-03-18-deep-geo-analyzer-design.md` | **The complete design spec** — the single source of truth for the GEO Analyzer. Read this before touching anything. |
| `docs/HANDOFF.md` | This file |
| `C:/Users/Insurance/Desktop/Marketing Reports/TheInsuranceCenter-GEO-Report-2026-03-16.html` | **Reference report** — the existing GEO report output that the new tool is modeled after. Study this for section structure, chart usage, plan card format, and writing style. |
| `.superpowers/brainstorm/` | Visual companion mockup files from the design session — includes `report-mockup-v2.html` which is the approved dark-mode HTML mockup |

---

## GEO Audit Framework

**What GEO means in this product:**
Generative Engine Optimization — how well a company's website is positioned to appear in AI-generated answers from tools like ChatGPT, Claude, Perplexity, Gemini, and Grok. Unlike traditional SEO (which targets search engine rankings), GEO targets the signals AI systems use to decide whether to cite, mention, or recommend a brand.

**The 6 scored dimensions (100 pts total):**

| Dimension | Max | What's measured |
|---|---|---|
| Entity Clarity & Brand Definition | 20 | Brand name consistency, About page depth, Organization schema, NAP, Wikidata/Wikipedia presence |
| Content Signals & AI Readability | 20 | Heading hierarchy, FAQ sections, E-E-A-T signals, author bios, content freshness, service clarity |
| Citation & Third-Party Presence | 20 | Directory listings, press mentions, review platforms, external backlinks (inferred from on-page signals) |
| Schema Markup & Technical Structure | 15 | FAQ/Organization/LocalBusiness/Article schema, meta quality, OG tags, canonicals |
| Brand Authority & Trust Signals | 15 | Reviews, testimonials, case studies, certifications, awards, social proof |
| Topical Coverage & Depth | 10 | Blog presence, topic breadth, content depth, internal linking |

**Each dimension uses a 4-band rubric:** Exemplary / Solid / Partial / Absent — with explicit point ranges and criteria for each band. See the spec for full rubric tables.

**Per-LLM scores:**
Each of 5 platforms gets its own score derived from the overall score using platform-specific penalty/bonus adjustments based on which signals each LLM is known to weight most heavily. Scores are floored at 0 and capped at 98.

**Recommendations:**
5 improvement steps ordered by dimension score (lowest first). Steps 1–3 are "Quick Wins" (implementable in <4 hours, specific and actionable). Steps 4–5 are "Big Picture" (sustained effort, addresses Partial/Absent dimensions). Each step includes: a finding (what the rubric found), and 2–3 bulleted action items.

**Report sections:**
1. Header — brand, company, date, PDF button
2. Executive Summary — 3 KPI cards + summary paragraph
3. Platform-by-Platform — 5 LLM score cards
4. Charts — radar (6 dimension scores) + competitor bar chart
5. Query Performance Table — 12 queries × 4 categories
6. Dimension Scores + Sentiment Donut
7. 5-Step Improvement Plan
8. Methodology boilerplate
9. Footer

---

## Inputs and Processing

**Input:** One URL string (e.g., `https://acmeconsulting.com`)

**Pages fetched (in order):**
1. Homepage (`/`) — required, abort if unreachable
2. About (`/about`, `/about-us`, `/our-story`) — missing = −4 pts Entity
3. Service/Product page (first linked service or `/services`) — missing = −4 pts Content
4. Blog/Resource (`/blog`, `/resources`, `/insights`) — missing = −4 pts Topical
5. Contact (`/contact`, `/contact-us`) — missing = −2 pts Entity, −2 pts Schema

**Extracted per page:** heading hierarchy, FAQ presence, schema types, meta content, OG tags, author info, founding/team signals, social links, directory badges, review widgets, contact/NAP info, content freshness signals, internal linking patterns.

**Scored:** 6 dimensions → summed to 100-pt overall → grade assigned → 5 per-LLM adjustments applied.

**Generated:** 12 queries (3 Branded, 4 Category, 2–3 Competitor, 3 Problem/Solution), visibility + sentiment + priority per query, 3–5 competitor estimates, 3 quick-win + 2 big-picture steps, summary paragraph.

**Returned:** Complete self-contained HTML file in a code block. No other output.

---

## Existing Decisions

All of these are locked — do not revisit without user direction:

1. **Tool type:** Claude Project system prompt, not a web app or API
2. **Output format:** Self-contained HTML file (user copies and saves locally)
3. **Approach:** Option B — multi-page crawl with explicit rubric scoring (vs. single-page or two-phase)
4. **LLMs scored:** ChatGPT, Claude, Perplexity, Gemini, Grok (5 total)
5. **Dimensions:** 6 dimensions totaling 100 points (as specified above)
6. **Per-LLM scores:** Derived from overall score via platform-specific adjustment formula (not independent scoring)
7. **Report layout:** Dashboard grid (Layout B from mockup session) — headline score + LLMs in banner row, 2-col middle, full-width steps
8. **Visual style:** Dark mode, IndexForge brand colors (`#020617` bg, `#3a8fd4` accent), dot grid background
9. **Charts:** Chart.js via CDN — radar (single polygon, 6 dimension axes), horizontal competitor bar, sentiment donut (68% cutout)
10. **Radar chart:** Single company polygon only (not per-LLM) — axes are the 6 dimensions, values normalized to 0–100
11. **PDF export:** html2pdf.js CDN, portrait A4, `#020617` background preserved, button hidden in print
12. **Improvement plan:** 3 quick wins (green) + 2 big picture (blue), priority by lowest-scoring dimensions
13. **Competitor scores:** Estimated (not fetched), floor 40–60 if insufficient signals, max 95
14. **Query table:** 12 queries, visibility 🟢🟡🔴, sentiment ↑→○↓, priority High/Medium/Low
15. **Sentiment donut:** Aggregated across all 12 queries, featured stat = Positive %
16. **File naming:** `[CompanyName]-GEO-Report-[YYYY-MM-DD].html`

---

## Constraints / Requirements

- **Internal tool only** — not customer-facing, no auth, no hosting required
- **No backend** — entire tool is the Claude Project prompt; no APIs, no databases, no queues
- **Single conversation turn** — Claude fetches, scores, and outputs in one response
- **Self-contained HTML** — no local asset references, all CSS inline, charts via CDN only
- **IndexForge brand colors must be exact** — colors are part of client deliverable identity
- **Scores are always inferred, never live** — the Methodology section must state this clearly
- **Output only HTML** — Claude's response should be only the HTML code block, no surrounding commentary
- **The existing reference report** (`TheInsuranceCenter-GEO-Report-2026-03-16.html`) is the quality benchmark for writing style and plan card depth — match that level of specificity
- **Do not change the marketing website** (`src/App.jsx`) — that is a separate concern

---

## Known Issues / Gaps

1. **Layer 3 (HTML template) doesn't exist yet** — the spec fully describes what it should contain but the actual template HTML has not been written. This is the main deliverable.
2. **The system prompt (Layers 1–2) hasn't been written yet** — the spec contains all the content; it needs to be composed into the final prompt text.
3. **No test run has been done** — the tool has never been run against a real URL. First test run will reveal whether Claude can faithfully follow the template.
4. **Competitor score estimation is inherently fuzzy** — Claude has no live access to competitors' sites unless it fetches them (not specified). Scores will be reasonable estimates based on training data, not audits.
5. **Citation detection is on-page only** — Claude cannot run a full backlink audit. Citation scores reflect signals visible on the crawled pages only. This is stated in the report methodology but is a real limitation.
6. **GBP signals require inference** — Claude cannot check Google Business Profile directly; it infers from embedded maps, address footers, and review widgets.
7. **Per-LLM adjustment formula uses judgment** — the penalty/bonus rules are guidelines, not a strict calculator. Output scores may vary slightly between runs for the same site.

---

## Immediate Next Steps

In priority order:

1. ~~**Write the HTML report template (Layer 3)**~~ ✅ Done — `docs/prompts/geo-report-template.html`

2. ~~**Write Layer 1 + Layer 2 of the system prompt**~~ ✅ Done — embedded in `docs/prompts/deep-geo-analyzer-system-prompt.md`

3. ~~**Assemble the complete Claude Project system prompt**~~ ✅ Done — `docs/prompts/deep-geo-analyzer-system-prompt.md` (ready to paste)

4. **Visual check** — open `docs/prompts/geo-report-demo.html` in a browser. Verify all sections render, charts draw, bars animate, and the plan cards look correct. Fix anything before the live test.

5. **Test run** — paste `docs/prompts/deep-geo-analyzer-system-prompt.md` into a new Claude Project system prompt. Run against `indexforgellm.com` or a known client URL. Evaluate: score accuracy, HTML validity, chart rendering, plan writing depth, and that the output contains only the HTML code block with no surrounding commentary.

6. **Iterate on the template** — based on the test run output, adjust placeholder handling, score coloring thresholds, chart sizing, or plan depth. Update both the template file and the embedded version in the system prompt.

---

## Fresh Session Prompt

Use this to restart the work in a new Claude Code session:

---

> I'm building the **Deep GEO Analyzer** — an internal tool for IndexForge LLM (my GEO analysis service). It's a Claude Project system prompt that takes a company URL, crawls the site, scores it across 6 GEO dimensions, and outputs a self-contained dark-mode HTML report.
>
> **The full design spec is already complete and approved.** Read it first before doing anything else:
> `docs/superpowers/specs/2026-03-18-deep-geo-analyzer-design.md`
>
> Also study these two reference files to understand the expected output quality and visual style:
> - `.superpowers/brainstorm/1129-1773887486/report-mockup-v2.html` — the approved dark-mode HTML mockup we built during design
> - `C:/Users/Insurance/Desktop/Marketing Reports/TheInsuranceCenter-GEO-Report-2026-03-16.html` — the existing reference report (light mode, prior version) showing the level of writing depth and plan card specificity we want to match or exceed
>
> **What's already decided (do not revisit):**
> - Tool type: Claude Project system prompt (not a web app)
> - Output: self-contained HTML file user copies and saves locally
> - 6 scoring dimensions totaling 100 pts with 4-band rubrics (see spec)
> - 5 LLMs scored: ChatGPT, Claude, Perplexity, Gemini, Grok
> - Per-LLM scores derived via penalty/bonus formula from overall score
> - Dark mode, IndexForge brand (#020617 bg, #3a8fd4 accent)
> - Radar chart: single polygon (company's 6 dimension scores normalized to 0–100)
> - Layout: dashboard grid with banner score row, 2-col middle, full-width steps
> - 3 Quick Win steps (green) + 2 Big Picture steps (blue) in improvement plan
> - Charts via Chart.js CDN, PDF via html2pdf.js CDN
>
> **What needs to be built:**
> 1. The HTML output template (Layer 3 of the prompt) — complete self-contained HTML with all CSS, Chart.js init code, and placeholder comments where Claude inserts data
> 2. The system prompt text (Layers 1–2) — role definition + all rubrics/formulas composed into prompt text
> 3. Assembled final Claude Project system prompt ready to paste
>
> Start with the HTML template. Do not touch `src/App.jsx` — that's the marketing website and is separate.
