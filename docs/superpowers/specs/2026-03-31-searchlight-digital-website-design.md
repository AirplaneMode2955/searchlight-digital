# SearchLight Digital Website Redesign
**Date:** 2026-03-31  
**Approach:** Rewrite `src/App.jsx` in place — single file, React + Vite + Tailwind

---

## Overview

Rebrand the existing IndexForge LLM single-page marketing site to **SearchLight Digital**. Same services (SEO/GEO analysis, consulting), updated name, logo, colors, copy, a new Full Service section, and rich interactivity (spotlight cursor, scroll animations, number counters).

---

## 1. Branding & Colors

| Token | Value |
|---|---|
| Primary accent | `#F97316` (orange) |
| Accent hover | `#FB923C` |
| Dark background | `#141414` (charcoal) |
| Dark surface | `#1f1f1f` |
| Dark border | `#2d2d2d` |
| Light background | `#ffffff` |
| Light surface | `#f8f8f8` |
| Light border | `#e5e5e5` |
| Body text (light sections) | `#64748b` (slate-500) |
| Body text (dark sections) | `#a1a1aa` |

**Logo files (already in repo):**
- Full wordmark: `SearchLight Logo.png` — copy to `public/searchlight-logo.png`
- Icon only: `SearchLight Logo only.png` — copy to `public/searchlight-icon.png`
- Used in: Nav, Final CTA, Footer

**Email:** `searchlightdigitalai@gmail.com`  
**Brand name in copy:** `SearchLight Digital`

---

## 2. Page Sections (in order)

### Nav
- Logo: `searchlight-logo.png`, height `h-16`
- Same scroll-blur behavior (bg becomes `#141414/95` on scroll)
- CTA button: orange (`#F97316`)
- CTA label: "Get Free SEO Analysis"
- Mobile drawer: same pattern, charcoal background

### Hero
- Dark charcoal background (`#141414`)
- Dot grid: orange tint (`rgba(249,115,22,0.10)`)
- Glow blob: orange (`rgba(249,115,22,0.07)`)
- Spotlight cursor active in this section
- Headline: "Illuminate Your Visibility. Dominate Your Reach."
- Subheadline (orange): "See how your business shows up in search and AI — and what to do about it."
- Body copy updated to reference SearchLight Digital
- Terminal mock: title bar reads `searchlight — visibility-analysis`
- Two CTAs: "Get Free SEO Analysis" (orange) + "See GEO Report — $500" (outline)

### Stats Strip (new — between Hero and What We Do)
- Dark charcoal background
- 3 animated counters that trigger on scroll into view:
  - `500+` — Businesses Analyzed
  - `2` — Visibility Dimensions (SEO + GEO)
  - `5` — Custom Next Steps Per Report
- Counter animates 0→final value over 1.5s with ease-out

### What We Do
- White background
- Orange icon backgrounds
- Same 3 cards: Visibility Evaluation, Code-Driven Analysis, Practical Recommendations
- Cards fade up on scroll (staggered 50ms per card)

### SEO vs GEO
- Light gray background (`#f8f8f8`)
- GEO card: orange border accent
- Color swap only, copy unchanged

### Services
- White background
- Same two offerings: Free SEO Analysis + $500 GEO Report
- Orange accents on GEO Report card
- Cards fade in on scroll

### Full Service (new section)
- Dark charcoal background
- Headline: "We Don't Just Tell You What to Fix — We Fix It."
- Subhead: "For businesses that want more than a report, SearchLight Digital offers hands-on implementation and ongoing monitoring of your online presence."
- Two columns:
  - **Implementation**: "We take the findings from your report and make the changes needed — technical fixes, content improvements, schema, entity signals, and more."
  - **Monitoring**: "We keep a continuous eye on your search and AI visibility, tracking changes and adjusting strategy as the landscape evolves."
- Single CTA: "Contact for Pricing" → `mailto:searchlightdigitalai@gmail.com?subject=Full Service Inquiry`
- Spotlight cursor active in this section

### How It Works
- Dark charcoal background
- Same 4 steps, copy updated to reference SearchLight Digital
- Step numbers in orange
- Cards fade up on scroll

### 5 Custom Next Steps
- White background
- Orange numbered badges
- Same 5 items, hover border glow → orange

### Why It Matters
- Light gray background
- Same 3 points
- Orange left-border accent on cards

### Why SearchLight Digital
- White background
- Section label: "Why SearchLight Digital"
- Headline: "Focused. Technical. Direct."
- Same 6 reason cards, copy updated to reference SearchLight Digital
- Orange border glow on hover

### Pricing
- Dark charcoal background
- Same two tiers: Free SEO Analysis + $500 GEO Report (one-time)
- Orange accent on GEO Report card
- Cards fade in on scroll

### FAQ
- Light gray background
- Same 7 existing questions, brand names updated to SearchLight Digital
- Add 2 new entries:
  - "Do you offer implementation services?" → yes, Full Service offering, contact for pricing
  - "What does monitoring include?" → ongoing visibility tracking, adjustments as search/AI landscape changes
- Accordion: smooth `max-height` transition instead of instant toggle

### Final CTA
- Dark charcoal background
- Logo centered above headline
- Headline: "Illuminate Your Visibility."
- Subhead (orange): "Dominate Your Reach."
- Same two CTAs

### Footer
- Dark charcoal, same layout
- New logo, new email link

---

## 3. Animations & Interactivity

### Spotlight Cursor
- `mousemove` listener on `document`
- Renders a `div` with `pointer-events-none`, `position:fixed`, `z-index:9999`
- Style: `radial-gradient(circle 300px at {x}px {y}px, rgba(249,115,22,0.10), transparent)`
- Applied as `background` on a full-viewport overlay div
- Active only on dark sections; hidden on light sections via scroll position check
- Disabled on touch devices (`window.matchMedia('(hover: none)')`)

### Scroll Fade-ins
- Single `IntersectionObserver` instance, `threshold: 0.15`
- Target class: `fade-in-on-scroll`
- Initial state: `opacity:0; transform:translateY(20px)`
- Triggered state: `opacity:1; transform:translateY(0); transition: 0.5s ease`
- Grid children get staggered `transition-delay`: `0ms, 50ms, 100ms, ...` via inline style

### Animated Counters
- `useEffect` + `IntersectionObserver` on the Stats Strip
- On entry: `requestAnimationFrame` loop, ease-out timing function
- Duration: 1500ms
- Values: 500, 2, 5 (with `+` suffix on 500)
- Fires once (observer disconnects after trigger)

### FAQ Accordion
- Replace instant show/hide with `max-height` transition
- Closed: `max-height: 0; overflow: hidden`
- Open: `max-height: 500px; transition: max-height 0.3s ease`

### Micro-interactions
- All hover border glows: `border-color` transition 200ms → orange
- CTA buttons: `background-color` transition 200ms
- Nav CTA: orange fill

---

## 4. File Changes

| Action | File |
|---|---|
| Rewrite | `src/App.jsx` |
| Update | `package.json` (rename project to `searchlight-digital`) |
| Copy logo | `SearchLight Logo.png` → `public/searchlight-logo.png` |
| Copy icon | `SearchLight Logo only.png` → `public/searchlight-icon.png` |
| No change | `src/index.css`, `tailwind.config.js`, `vite.config.js` |

---

## 5. Out of Scope

- No routing (still a single page)
- No backend changes
- No new npm packages
- No changes to `tools/` directory
