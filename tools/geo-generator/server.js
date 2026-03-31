import express from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { load } from 'cheerio'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SYSTEM_PROMPT = readFileSync(
  join(__dirname, '../../docs/prompts/deep-geo-analyzer-system-prompt.md'),
  'utf-8'
)

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const app = express()

app.use(express.static(__dirname))

// ─── Web scraper ─────────────────────────────────────────────────────────────

async function fetchPage(url) {
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IndexForge-GEO/1.0; +https://indexforgellm.com)',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })
    if (!resp.ok) return null
    return await resp.text()
  } catch {
    return null
  }
}

function extractSignals(html, url) {
  const $ = load(html)

  // Schema markup
  const schemas = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try { schemas.push(JSON.parse($(el).html())) } catch {}
  })

  // Social/external links
  const socials = new Set()
  $('a[href]').each((_, el) => {
    const h = $(el).attr('href') || ''
    if (/linkedin\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|youtube\.com/i.test(h)) {
      socials.add(h)
    }
  })

  // OG tags
  const og = []
  $('meta[property^="og:"]').each((_, el) =>
    og.push(`${$(el).attr('property')}="${$(el).attr('content')}"`)
  )

  // Headings
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get()
  const h2s = $('h2').slice(0, 15).map((_, el) => $(el).text().trim()).get()
  const h3s = $('h3').slice(0, 12).map((_, el) => $(el).text().trim()).get()

  // Main text content
  const body = $('body').clone()
  body.find('script, style, nav, footer, header').remove()
  const text = body.text().replace(/\s+/g, ' ').trim().slice(0, 4000)

  // Footer (for NAP, copyright, social)
  const footer = $('footer').text().replace(/\s+/g, ' ').trim().slice(0, 500)

  const lines = [
    `URL: ${url}`,
    `Title: ${$('title').text().trim() || '(none)'}`,
    `Meta Description: ${$('meta[name="description"]').attr('content') || '(none)'}`,
    `OG Tags: ${og.join(', ') || '(none)'}`,
    `H1: ${h1s.join(' | ') || '(none)'}`,
    `H2s: ${h2s.join(' · ') || '(none)'}`,
    `H3s: ${h3s.join(' · ') || '(none)'}`,
    `Social Links: ${[...socials].join(', ') || '(none)'}`,
    `Footer Text: ${footer || '(none)'}`,
    `JSON-LD Schemas: ${schemas.length
      ? schemas.map(s => `@type=${s['@type'] || '?'} → ${JSON.stringify(s).slice(0, 400)}`).join('\n  ')
      : '(none)'}`,
    `\nPage Content (excerpt):\n${text}`,
  ]

  return lines.join('\n')
}

// ─── Pages to crawl ──────────────────────────────────────────────────────────

const PAGES = [
  { label: 'Homepage',  paths: [''] },
  { label: 'About',     paths: ['/about', '/about-us', '/our-story', '/team'] },
  { label: 'Services',  paths: ['/services', '/solutions', '/what-we-do'] },
  { label: 'Blog',      paths: ['/blog', '/resources', '/insights', '/articles'] },
  { label: 'Contact',   paths: ['/contact', '/contact-us', '/get-in-touch'] },
]

// ─── SSE generate endpoint ────────────────────────────────────────────────────

app.get('/generate', async (req, res) => {
  let baseUrl = (req.query.url || '').trim().replace(/\/+$/, '')
  if (!baseUrl) return res.status(400).send('URL required')
  if (!/^https?:\/\//i.test(baseUrl)) baseUrl = 'https://' + baseUrl

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const send = (type, payload = {}) =>
    res.write(`data: ${JSON.stringify({ type, ...payload })}\n\n`)

  // Phase 1 — Crawl
  const sections = []
  for (const page of PAGES) {
    send('status', { msg: `Fetching ${page.label}…` })
    let found = false
    for (const path of page.paths) {
      const html = await fetchPage(baseUrl + path)
      if (html) {
        const signals = extractSignals(html, baseUrl + path)
        sections.push(`${'═'.repeat(56)}\n${page.label.toUpperCase()}\n${'═'.repeat(56)}\n${signals}`)
        found = true
        break
      }
    }
    if (!found) {
      sections.push(
        `${'═'.repeat(56)}\n${page.label.toUpperCase()}\n${'═'.repeat(56)}\n` +
        `PAGE NOT ACCESSIBLE — note the gap and apply score penalties per rubric.`
      )
    }
  }

  // Phase 2 — Claude
  send('status', { msg: 'Scoring and generating report with Claude…' })

  const userMessage =
    `Website to analyze: ${baseUrl}\n\n` +
    `NOTE: The pages below have been pre-fetched for you. ` +
    `Use this data exclusively — do not attempt to browse. ` +
    `Score all 6 dimensions and generate the complete HTML report.\n\n` +
    sections.join('\n\n')

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        send('chunk', { text: event.delta.text })
      }
    }

    send('done', {})
  } catch (err) {
    send('error', { msg: err.message })
  }

  res.end()
})

const PORT = process.env.GEO_PORT || 3001
app.listen(PORT, () => {
  console.log(`\n  GEO Report Generator`)
  console.log(`  → http://localhost:${PORT}\n`)
})
