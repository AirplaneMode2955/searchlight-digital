# Deep GEO Analyzer — Design Spec

**Date:** 2026-03-18
**Project:** IndexForge LLM
**Type:** Internal Tool

---

## Overview

An internal Claude Project prompt that takes a single URL as input, fetches and reads multiple pages of the target website, performs a structured GEO (Generative Engine Optimization) analysis using explicit scoring rubrics, and outputs a self-contained HTML report. The report is dark-mode, IndexForge branded, and ready to open in any browser or export to PDF.

---

## What It Is

- **Input:** A single URL pasted into a Claude Project
- **Process:** Multi-page crawl → rubric-based scoring → HTML generation
- **Output:** A complete self-contained HTML code block. The user copies the output and saves it as `[CompanyName]-GEO-Report-[YYYY-MM-DD].html`
- **Audience:** Internal use only (Jett runs this when producing client GEO Reports)

> **File saving mechanism:** Claude outputs the full HTML in a fenced code block. The user copies it and saves it as an `.html` file locally. No disk-write tooling required.

---

## Multi-Page Crawl

Claude fetches the following pages in order before scoring anything:

| Page | URL Pattern | Fallback if Missing |
|---|---|---|
| Homepage | `/` | Required — abort if unreachable |
| About | `/about`, `/about-us`, `/our-story` | Note gap; reduce Entity score |
| Service/Product | `/services`, `/solutions`, first linked service page | Note gap; reduce Content score |
| Blog/Resource | `/blog`, `/resources`, `/insights` | Note gap; reduce Topical score |
| Contact | `/contact`, `/contact-us` | Note gap; reduce Entity/Schema score |

If a page errors or doesn't exist, Claude records it as a signal gap, notes it in the report findings, and applies a score reduction to the affected dimension:

| Missing Page | Affected Dimension | Reduction |
|---|---|---|
| About page | Entity Clarity | −4 pts |
| Service/Product page | Content Signals | −4 pts |
| Blog/Resource page | Topical Coverage | −4 pts |
| Contact page | Entity Clarity + Schema | −2 pts each |

---

## Scoring System

### Overall Score

- **Total:** 100 points across 6 dimensions
- **Grade Scale:**

| Grade | Score | Label |
|---|---|---|
| A+ | 95–100 | Exceptional |
| A  | 90–94  | Excellent |
| A- | 85–89  | Very Strong |
| B+ | 80–84  | Strong |
| B  | 75–79  | Above Average |
| B- | 70–74  | Solid |
| C+ | 65–69  | Developing |
| C  | 60–64  | Below Average |
| C- | 55–59  | Weak |
| D  | 40–54  | At-Risk |
| F  | 0–39   | Critical |

---

### The 6 Dimensions with Full Rubrics

#### 1. Entity Clarity & Brand Definition (max 20 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 17–20 | Consistent brand name sitewide; comprehensive About page with founder/team, founding date, service area, mission; Organization schema implemented; NAP consistent across all pages; social profiles linked; Wikidata/Wikipedia entry or equivalent third-party entity validation |
| Solid | 12–16 | Most signals present — good About page but missing schema OR minor NAP inconsistencies; brand name consistent; social profiles present but not linked in schema |
| Partial | 6–11 | Some signals — About page exists but is thin (under 150 words); no Organization schema; NAP inconsistent or partially missing; brand name mostly consistent |
| Absent | 0–5 | Minimal entity signals — no dedicated About page; no schema; inconsistent naming; no external entity validation; founder/team info absent |

#### 2. Content Signals & AI Readability (max 20 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 17–20 | Clear heading hierarchy (H1→H2→H3) on all pages; dedicated FAQ section with question-format H2s; author bios with credentials on blog posts; explicit expertise signals (certifications, years in business, case study data); recently published content (within 90 days); services described with clarity of who they're for and what they deliver |
| Solid | 12–16 | Good heading structure; some FAQ content but not structured as a dedicated page; service descriptions are clear; content exists but author bios are thin or missing |
| Partial | 6–11 | Heading structure exists but inconsistent; no FAQ; services are listed but vaguely described; no E-E-A-T signals beyond brand name; content is present but outdated (12+ months) |
| Absent | 0–5 | Poor heading hierarchy; no FAQ; vague or missing service descriptions; no expertise indicators; thin or stale content throughout |

> **E-E-A-T signals that count:** author bylines with credentials, case studies with outcomes, certifications/licenses cited, founding year stated, named team members, industry awards, client testimonials attributed to real people.

#### 3. Citation & Third-Party Presence (max 20 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 17–20 | Present in 5+ external directories or industry listings; press/media mentions detectable; review platform profiles (Google, Yelp, Trustpilot, or industry equivalent) with 10+ reviews; external backlinks visible in content or footer; podcast, interview, or guest post appearances |
| Solid | 12–16 | Present in 3–4 directories; some review platform presence; limited but real press or external mentions |
| Partial | 6–11 | 1–2 directory listings; review presence exists but sparse (fewer than 5 reviews); no press coverage detectable |
| Absent | 0–5 | No detectable directory presence; no review platforms; no external mentions; citation profile is effectively non-existent |

> **Note:** Claude infers citation presence from links on the site, footer references, social profile activity, and any directory/review badges displayed. It cannot perform a full backlink audit — scores reflect on-page signals only.

#### 4. Schema Markup & Technical Structure (max 15 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 13–15 | Organization or LocalBusiness schema on homepage; FAQPage schema on FAQ or service pages; Article schema on blog posts; unique meta titles and descriptions on all pages; Open Graph tags present; canonical tags set; no duplicate meta content |
| Solid | 9–12 | Organization schema present; meta titles and descriptions mostly unique; some pages missing OG tags; no FAQ schema |
| Partial | 4–8 | Basic meta tags present but duplicate descriptions common; no structured data schema of any type; missing OG tags |
| Absent | 0–3 | Missing meta descriptions on most pages; no schema; no OG tags; technical structure is essentially invisible to AI crawlers |

#### 5. Brand Authority & Trust Signals (max 15 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 13–15 | Visible review aggregate with high rating; customer testimonials with attributed names/companies; case studies with measurable outcomes; certifications or awards cited on site; active LinkedIn or professional social presence; associations or memberships listed |
| Solid | 9–12 | Some testimonials present; review presence referenced; at least one credential or certification mentioned; professional social profile exists |
| Partial | 4–8 | Generic testimonials (no names); no visible review aggregate; credentials mentioned but not substantiated; minimal social proof |
| Absent | 0–3 | No testimonials; no reviews; no credentials; no associations; no social proof of any kind |

> **Domain age approximation:** Claude infers this from the copyright year in the footer, "founded in" statements, or oldest blog post date. Cannot perform WHOIS lookup — uses visible signals only.

#### 6. Topical Coverage & Depth (max 10 pts)

| Band | Points | Criteria |
|---|---|---|
| Exemplary | 9–10 | Active blog or resource library (5+ posts); covers 3+ subtopics within the core service area; posts are 800+ words and answer specific questions; strong internal linking between content and service pages; consistent use of industry terminology |
| Solid | 6–8 | Blog exists with 2–5 posts; some topical variation; content is relevant but depth is inconsistent |
| Partial | 3–5 | 1–2 blog posts or a thin resources section; single topic; minimal internal linking |
| Absent | 0–2 | No blog, no resources, no educational content; site is service-only with no topical footprint |

---

## Per-LLM Score Calculation

### Baseline

The baseline for each LLM is the **overall score (0–100)**.

### Adjustment Formula

Each LLM score = Overall Score + Platform Adjustment

The platform adjustment is calculated by comparing the site's performance in the dimensions that each LLM weights most heavily:

**Penalty stacking rule:** Sum all applicable penalties first, then apply the max penalty cap. Bonuses are applied after the cap. Final score is floored at 0 and capped at 98.

| LLM | Primary Dimensions | Adjustment Logic |
|---|---|---|
| **ChatGPT** | Entity Clarity, Citation Presence | Sum: Entity < 12 → −5; Wikipedia/Wikidata absent → −3; Citation < 12 → −3. Cap total penalty at −10. Bonus: +5 if Wikipedia/Wikidata present (after cap). |
| **Claude** | Content Signals, Brand Authority | Sum: Content < 12 → −5; E-E-A-T signals thin (fewer than 2 qualifying signals) → −3; Brand Authority < 9 → −2. Cap total penalty at −8. No bonus. |
| **Perplexity** | Citation Presence, Schema | Sum: Citation < 12 → −8; Schema < 9 → −2. Cap total penalty at −10. Bonus: +5 if 5+ external citations detectable (after cap). Citation detection: count external links in site footer, directory badge links, "As seen in" or "Featured in" sections, review platform widgets, and any outbound links to third-party sources referencing the brand. |
| **Gemini** | Schema & Technical, Entity Clarity | Sum: Schema < 9 → −6; no GBP signals → −3; Entity < 12 → −2. Cap total penalty at −10. Bonus: +4 if LocalBusiness schema present (after cap). |
| **Grok** | Brand Authority, Citation | Sum: no detectable social/X presence → −8; Citation < 12 → −3. Cap total penalty at −10. No bonus. |

**GBP signals definition:** Embedded Google Maps on contact page, address in site footer, Google review widget, or explicit Google Business Profile badge or link anywhere on the site.

**E-E-A-T "thin" definition:** Fewer than 2 of the following qualifying signals are present sitewide: author byline with credentials, case study with measurable outcome, named certification or license, founding year explicitly stated, named team member with role, industry award cited, customer testimonial attributed to a real named person.

**Floor/Ceiling:** LLM scores are floored at 0 and capped at 98 (no LLM is ever "perfect").

**Example (Overall: 72, Entity: 16, Content: 14, Citation: 11, Schema: 10, Authority: 8, Topical: 7):**
- ChatGPT: penalties = −3 (Citation < 12); cap = −10; 72 − 3 = 69 → **68**
- Claude: penalties = −2 (Authority 8 < 9); cap = −8; 72 − 2 = 70 → **75** (E-E-A-T solid, judgment applied)
- Perplexity: penalties = −8 (Citation < 12); cap = −10; 72 − 8 = 64; bonus +5 (some citations) = 69 → **71**
- Gemini: penalties = −2 (Schema 10 ≥ 9, minor gap); bonus +4 (LocalBusiness present); 72 − 2 + 4 = 74 → **74**
- Grok: penalties = −8 (no social) + −3 (Citation) = −11 → capped at −10; 72 − 10 = 62 → **62**

> Claude uses judgment within the formula — it is a structured guide, not a rigid calculator. The rationale for each score is stated in the report's per-platform card.

---

## Query Performance Table

### 4 Query Categories

| Category | Description | Color Badge |
|---|---|---|
| **Branded** | Queries using the company's exact name | Blue |
| **Category** | Generic industry/service queries the company should rank for | Purple |
| **Competitor** | Comparison queries, alternatives, vs. queries | Pink/Red |
| **Problem/Solution** | Question-format queries customers ask when they have a problem | Green |

### Query Generation

Claude generates 12 queries tailored to the specific company and industry based on what it reads from the site. Breakdown: 3 Branded, 4 Category, 2–3 Competitor, 3 Problem/Solution.

### Visibility Scale

| Label | Emoji | Meaning |
|---|---|---|
| High | 🟢 | Brand would reliably appear in AI answers for this query |
| Medium | 🟡 | Brand sometimes appears; inconsistent or partial presence |
| Low | 🔴 | Brand unlikely to appear; gap in AI representation |

### Sentiment Scale

| Label | Meaning |
|---|---|
| ↑ Positive | When mentioned, brand is described favorably |
| → Neutral | Mention is factual, neither favorable nor unfavorable |
| ○ No Mention | Brand does not appear in AI responses for this query |
| ↓ Negative | Brand described unfavorably (rare) |

### Priority Assignment

| Priority | When Assigned |
|---|---|
| High | Low visibility on a Category or Problem/Solution query |
| Medium | Medium visibility, or Low visibility on a Branded query |
| Low | High visibility, especially on Branded queries |

---

## Sentiment Donut Chart

The donut chart aggregates sentiment across all 12 queries:

- **Positive** = count of queries where the brand would appear with ↑ Positive sentiment
- **Neutral** = count of queries where the brand appears with → Neutral sentiment
- **Negative** = count of queries with ↓ Negative sentiment
- **Not Mentioned** = count of queries where the brand does not appear

The featured headline stat is the **Positive percentage** (Positive ÷ 12 × 100).

---

## Competitor Chart

Claude identifies 3–5 competitors in the same industry/geography by:
1. Noting any competitors explicitly mentioned on the site
2. Inferring from the industry and service area who the likely competitors are
3. Selecting well-known players in that space

**Competitor scores are estimated,** not fetched — Claude applies the same rubric logic at a high level based on publicly known signals about each competitor (site quality, known brand authority, industry directory presence, review volume). These are clearly labeled as estimates in the Methodology section.

**Competitor score floor:** If Claude has insufficient signals about a competitor to estimate meaningfully, default to a range of 40–60 and note it as "Limited data." Do not omit the competitor from the chart. Competitor scores may be higher or lower than the company being analyzed — there is no artificial cap relative to the company's score. Maximum competitor score is 95.

The company being analyzed is always highlighted in `#3a8fd4` (IndexForge blue). Competitors use `#334155`.

---

## Executive Summary KPI Cards

| Card | Content |
|---|---|
| Card 1 | Overall GEO score (large number) + letter grade (blue) + grade label badge + "Overall GEO Score (0–100)" label |
| Card 2 | Number of pages analyzed (e.g., "5") + list of which pages + "Pages Analyzed" label |
| Card 3 | Best-performing LLM platform name + its score as badge + "Best Performing LLM" label |

---

## HTML Report Structure

### Technology

- **Chart.js** via CDN: `https://cdn.jsdelivr.net/npm/chart.js`
- **html2pdf.js** via CDN: `https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js`
- No other external dependencies — all styles are inline `<style>` tags

### Brand Colors

```
Background:     #020617
Surface/cards:  #0f172a
Borders:        #1e293b
Primary accent: #3a8fd4
Hover accent:   #4fa8f0
Gradient dark:  #1e5fa0
Success:        #22c55e
Warning:        #f59e0b
Danger:         #ef4444
Body text:      #e2e8f0
Secondary text: #94a3b8
Muted text:     #475569
Faint text:     #334155
```

**Dot grid background:**
```css
background-image: radial-gradient(circle, rgba(58,143,212,0.07) 1px, transparent 1px);
background-size: 28px 28px;
```

**Gradient accent bar** (below header):
```css
background: linear-gradient(90deg, #1e5fa0 0%, #3a8fd4 40%, #4fa8f0 70%, #3a8fd4 100%);
height: 3px;
```

### Sections (in order)

1. **Header** — IndexForge LLM label with pulsing blue dot, company name (H1), domain/subtitle, right side: domain in blue + report date + Download PDF button. Accent gradient bar below.
2. **Executive Summary** — 3 KPI cards (see above) + summary text block (border-left `#3a8fd4`, italic finding, bold key terms)
3. **Platform-by-Platform Breakdown** — 5 LLM cards in a row. Each: platform icon badge (colored), platform name, large score number (color-coded), animated progress bar, tag line, gap description paragraph
4. **Charts Row (2 columns)** — Radar chart left, Competitor bar chart right, each with title, subtitle, chart canvas, callout note below
5. **Query Performance Table** — Full-width card, table with 5 columns: Query, Category badge, Visibility emoji, Sentiment arrow, Priority color
6. **Dimension Scores + Sentiment Donut (2 columns)** — Dimension bars with gradient fills left, donut chart with legend right
7. **5-Step GEO Improvement Plan** — 5 plan cards stacked. Each: colored left accent bar (green for quick wins 1–3, blue for big picture 4–5), step number (large faded), Quick Win or Big Picture badge, title, italic finding, bulleted action items with `→` arrows
8. **Methodology** — Dark inset box, plain text explaining scores are inferred from signals, not live LLM queries
9. **Footer** — Company name, date, "Prepared by IndexForge LLM", email

### Animated Elements

- LLM score bars: `transition: width 0.9s ease-out`, triggered on `window load` via `data-width` attribute
- Header brand dot: `animation: pulse 2s infinite` (opacity 1→0.3→1)

### PDF Export

```js
function downloadPDF() {
  const opt = {
    margin: [8, 8, 8, 8],
    filename: '[CompanyName]-GEO-Report-[YYYY-MM-DD].pdf',
    image: { type: 'jpeg', quality: 0.97 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#020617' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  html2pdf().set(opt).from(document.body).save();
}
```

Print styles: hide PDF button, apply `print-color-adjust: exact` to header, accent bar, plan accents.

### Chart Configurations

**Radar Chart (Chart.js):**
- Type: `radar`
- 6 axes: Entity Clarity, Content Signals, Citation Presence, Schema & Tech, Brand Authority, Topical Depth
- **1 dataset only:** the company's own 6 raw dimension scores, normalized to 0–100 (e.g., Entity 16/20 = 80, Schema 10/15 = 67, Topical 7/10 = 70)
- Polygon color: `#3a8fd4` border, `rgba(58,143,212,0.12)` fill
- Scale: min 0, max 100, step 25
- Dark grid: `rgba(30,41,59,0.8)`, tick color: `#475569`, label color: `#94a3b8`
- No legend (single polygon needs no legend)

**Competitor Bar Chart (Chart.js):**
- Type: `bar`, `indexAxis: 'y'` (horizontal)
- Company highlighted: `#3a8fd4`, competitors: `#334155`
- Scale: 0–100, dark grid lines
- No legend

**Sentiment Donut (Chart.js):**
- Type: `doughnut`
- `cutout: '68%'`
- 4 segments: Positive (`#22c55e`), Neutral (`#94a3b8`), Negative (`#ef4444`), Not Mentioned (`#1e293b`)
- `borderColor: '#020617'`, `borderWidth: 2`
- No built-in legend (custom HTML legend beside it)

---

## Prompt Architecture (3 Layers)

### Layer 1 — Role

> You are a senior GEO (Generative Engine Optimization) analyst at IndexForge LLM. When given a URL, you fetch multiple pages of the site, apply the scoring rubrics below to each of 6 dimensions, calculate per-platform LLM scores, and generate a complete self-contained HTML report. You output only the HTML — no commentary before or after.

### Layer 2 — Rubrics + Scoring Logic

The full rubric tables for all 6 dimensions (as defined in this spec), the per-LLM adjustment formula, the grade scale, query category definitions, visibility/sentiment/priority scale definitions, and the competitor estimation instructions.

### Layer 3 — HTML Output Template

The complete approved HTML structure with placeholder comments where Claude inserts data — including all CSS, Chart.js initialization code, section layout, and the PDF export function. Claude fills in: company name, domain, date, scores, findings, queries, competitor names/scores, plan steps, and summary text. The structural HTML, all CSS, and chart configurations are provided as fixed template.

---

## What Claude Does Per Run

1. Reads the URL from user input
2. Fetches homepage — extracts entity, content, schema, authority, topical signals
3. Fetches About page — extracts entity depth, founder info, brand definition signals
4. Fetches one service/product page — extracts content signals, topic coverage, schema
5. Fetches one blog/resource page (if present) — extracts topical depth, E-E-A-T, freshness
6. Fetches contact page — extracts NAP signals, schema, location data
7. Scores each of the 6 dimensions against rubrics → produces 6 dimension scores
8. Sums dimension scores → overall score → looks up grade
9. Applies per-LLM adjustment formula → produces 5 LLM scores with rationale
10. Identifies company name, industry, and service area from site content
11. Generates 12 representative queries (3 Branded, 4 Category, 3 Competitor, 2 Problem/Solution) tailored to this company
12. Estimates visibility, sentiment, and priority for each query
13. Identifies 3–5 competitor names in the same space; estimates their GEO scores
14. Identifies 3 quick-win steps and 2 big-picture steps from the findings (see criteria below)
15. Generates the summary paragraph (2–3 sentences on overall standing and primary gaps)
16. Outputs the complete HTML file in a code block

---

## Improvement Plan Selection Criteria

### Quick Win (Steps 1–3) — must meet ALL of:
- Can be implemented by a non-developer in under 4 hours (or by a developer in under 1 hour)
- Directly fixes a gap identified in the rubric scoring
- The fix is specific and actionable (not "improve your content" — "add FAQPage schema to /services")
- Examples: adding schema markup, fixing meta descriptions, restructuring the About page, claiming a directory listing

### Big Picture (Steps 4–5) — must meet ALL of:
- Requires sustained effort over weeks or months
- Addresses a dimension where the site scored Partial or Absent
- Has high long-term GEO impact (typically Citation Presence, Brand Authority, or Topical Coverage)
- Examples: building a content library, establishing a third-party citation profile, earning press coverage

Priority order for selecting steps: target the **lowest-scoring dimensions first**, then break ties by score impact (how many points could realistically be gained).

---

## PDF Export Button

- **Label:** "Download PDF"
- **Icon:** download arrow SVG (inline)
- **Color:** `#3a8fd4` background, white text, hover `#4fa8f0`
- **Location:** header, right side, below report date
- **Page orientation:** Portrait, A4
- **Background color in PDF:** `#020617` (set in html2canvas options)
- **Hidden in print styles** (`display: none` via `@media print`)

---

## File Naming Convention

`[CompanyName]-GEO-Report-[YYYY-MM-DD].html`

Example: `TheInsuranceCenter-GEO-Report-2026-03-18.html`

---

## Methodology Boilerplate (static text for Section 8)

> GEO scores in this report are **inferred from web presence signals** — not live API queries to each LLM platform. This is intentional: the signals that predict LLM visibility (entity consistency, content authority, citation volume, structured data, and review presence) are the same signals you can directly control and improve. A live query shows a snapshot; this methodology shows you why you rank where you do and what to fix.
>
> Overall scoring uses a weighted composite of 6 dimensions: Entity Clarity (20pts), Content Signals (20pts), Citation Presence (20pts), Schema & Technical Structure (15pts), Brand Authority (15pts), and Topical Coverage (10pts). Per-platform scores are adjusted from the baseline using each LLM's known signal weighting tendencies — not live query results.
>
> Competitor scores are estimated using the same methodology applied to publicly available signals. These are directional benchmarks, not exact measurements. Report prepared by **IndexForge LLM**.

---

## Out of Scope

- Live API queries to LLM platforms
- Automated file saving or delivery
- CMS integration
- Recurring or scheduled reports
- Customer-facing access
