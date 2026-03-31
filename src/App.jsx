import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Color Constants ──────────────────────────────────────────────────────────
const ORANGE = '#F97316'
const ORANGE_HOVER = '#FB923C'
const DARK_BG = '#141414'
const DARK_SURFACE = '#1f1f1f'
const DARK_BORDER = '#2d2d2d'

// ─── Icons ────────────────────────────────────────────────────────────────────

function CheckIcon({ className = '', style = {} }) {
  return (
    <svg className={className} style={style} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
    </svg>
  )
}

function ArrowRightIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronDownIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  )
}

function MenuIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function XIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// ─── Spotlight Cursor ─────────────────────────────────────────────────────────

function SpotlightCursor() {
  const [pos, setPos] = useState({ x: -9999, y: -9999 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const handleMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY })
      const el = document.elementFromPoint(e.clientX, e.clientY)
      const darkSection = el?.closest('[data-dark-section]')
      setVisible(!!darkSection)
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      style={{
        background: `radial-gradient(circle 320px at ${pos.x}px ${pos.y}px, rgba(249,115,22,0.10), transparent 70%)`,
      }}
    />
  )
}

// ─── Scroll Fade-in Hook ──────────────────────────────────────────────────────

function useFadeIn() {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    const targets = container.querySelectorAll('.fade-in-on-scroll')
    if (!targets.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return ref
}

// ─── Animated Counter Hook ────────────────────────────────────────────────────

function useCounter(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const fired = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
          fired.current = true
          observer.disconnect()

          const start = performance.now()
          const tick = (now) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setValue(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return { value, ref }
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navLinks = [
  { label: 'What We Do', href: '#what-we-do' },
  { label: 'SEO vs GEO', href: '#seo-vs-geo' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-sm border-b shadow-xl shadow-black/30'
          : 'bg-transparent'
      }`}
      style={scrolled ? { backgroundColor: 'rgba(20,20,20,0.95)', borderColor: DARK_BORDER } : {}}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#" className="flex items-center">
          <img src="/searchlight-logo.png" alt="SearchLight Digital" className="h-16 w-auto" />
        </a>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href={`mailto:searchlightdigitalai@gmail.com?subject=Free SEO Analysis Request`}
            className="px-4 py-2 rounded-md text-white text-sm font-medium transition-colors duration-200"
            style={{ backgroundColor: ORANGE }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Get Free SEO Analysis
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t px-6 py-5 flex flex-col gap-4"
          style={{ backgroundColor: DARK_BG, borderColor: DARK_BORDER }}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:searchlightdigitalai@gmail.com?subject=Free SEO Analysis Request`}
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-4 py-3 rounded-md text-white text-sm font-medium text-center"
            style={{ backgroundColor: ORANGE }}
          >
            Get Free SEO Analysis
          </a>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const fadeRef = useFadeIn()

  return (
    <section
      id="hero"
      data-dark-section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: DARK_BG }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(249,115,22,0.10) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, ${DARK_BG} 100%)`,
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.07)' }}
      />

      <div ref={fadeRef} className="relative max-w-6xl mx-auto px-6 py-32 w-full flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 max-w-xl fade-in-on-scroll">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{
              border: `1px solid rgba(249,115,22,0.3)`,
              background: 'rgba(249,115,22,0.08)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ORANGE }} />
            <span className="text-slate-400 text-xs font-medium tracking-widest uppercase">
              Search and AI Visibility Agency
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.1] tracking-tight mb-4">
            Illuminate Your Visibility. Dominate Your Reach.
          </h1>

          <p className="text-lg font-semibold mb-5" style={{ color: ORANGE }}>
            See how your business shows up in search and AI — and what to do about it.
          </p>

          <p className="text-slate-400 text-base leading-relaxed mb-5">
            SearchLight Digital helps businesses understand how they appear in traditional search
            engines and AI-generated answers — through expert analysis, structured reporting,
            and hands-on implementation.
          </p>

          <p className="text-slate-600 text-sm font-medium mb-10 border-l-2 pl-4" style={{ borderColor: DARK_BORDER }}>
            We surface real visibility opportunities — then help you act on them.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`mailto:searchlightdigitalai@gmail.com?subject=Free SEO Analysis Request`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-md text-white font-medium text-sm transition-colors duration-200"
              style={{ backgroundColor: ORANGE }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = ORANGE)}
            >
              Get Free SEO Analysis
              <ArrowRightIcon className="w-4 h-4" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-md border text-slate-300 hover:text-white font-medium text-sm transition-colors duration-200"
              style={{ borderColor: DARK_BORDER }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#64748b')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
            >
              See GEO Report — $500
            </a>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md lg:max-w-none lg:flex-none lg:w-[440px] fade-in-on-scroll" style={{ transitionDelay: '100ms' }}>
          <div
            className="rounded-xl overflow-hidden shadow-2xl shadow-black/40"
            style={{ border: `1px solid ${DARK_BORDER}`, backgroundColor: DARK_SURFACE }}
          >
            <div
              className="flex items-center gap-1.5 px-4 py-3"
              style={{ borderBottom: `1px solid ${DARK_BORDER}`, backgroundColor: DARK_BG }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_BORDER }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_BORDER }} />
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: DARK_BORDER }} />
              <span className="ml-3 text-slate-500 text-xs font-mono tracking-wide">
                searchlight — visibility-analysis
              </span>
            </div>

            <div className="p-6 font-mono text-sm space-y-4">
              <div className="text-slate-600 text-xs">// Visibility analysis — sample output</div>

              <div className="space-y-2.5">
                {[
                  { key: 'domain_authority', value: 'reviewed' },
                  { key: 'keyword_visibility', value: 'analyzed' },
                  { key: 'ai_citation_presence', value: 'measured' },
                  { key: 'brand_entity_clarity', value: 'evaluated' },
                  { key: 'competitor_comparison', value: 'complete' },
                ].map((row) => (
                  <div key={row.key} className="flex items-center gap-3">
                    <span className="text-base leading-none" style={{ color: ORANGE }}>✓</span>
                    <span className="text-slate-300">{row.key}</span>
                    <span className="text-slate-700 mx-1">—</span>
                    <span className="text-slate-500">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4 space-y-3" style={{ borderTop: `1px solid ${DARK_BORDER}` }}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">next_steps generated</span>
                  <span className="font-semibold font-mono" style={{ color: ORANGE }}>5 / 5</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: DARK_BORDER }}>
                  <div
                    className="h-full w-full rounded-full"
                    style={{ background: `linear-gradient(to right, #c2410c, ${ORANGE})` }}
                  />
                </div>
                <div className="text-slate-600 text-xs pt-1">Report ready for delivery.</div>
              </div>
            </div>
          </div>

          <p className="text-slate-700 text-xs text-center mt-4 font-mono">
            Illustrative output — real reports contain structured findings
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Strip ──────────────────────────────────────────────────────────────

function StatCounter({ target, suffix = '', label }) {
  const { value, ref } = useCounter(target)
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
        {value}{suffix}
      </div>
      <div className="text-slate-400 text-sm font-medium">{label}</div>
    </div>
  )
}

function StatsStrip() {
  return (
    <section
      data-dark-section
      className="py-16 border-t border-b"
      style={{ backgroundColor: DARK_SURFACE, borderColor: DARK_BORDER }}
    >
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
        <StatCounter target={500} suffix="+" label="Businesses Analyzed" />
        <StatCounter target={2} label="Visibility Dimensions" />
        <StatCounter target={5} label="Custom Next Steps Per Report" />
      </div>
    </section>
  )
}

// ─── What We Do ───────────────────────────────────────────────────────────────

const whatWeDoItems = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Visibility Evaluation',
    body: 'We evaluate your digital presence across both traditional search and AI answer environments — giving you a clear picture of where you stand and where gaps exist.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: 'Expert-Driven Analysis',
    body: 'We use structured, methodical review to examine your search presence and AI representation — no guesswork, no surface-level observations, just systematic analysis.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Practical Recommendations',
    body: 'Every engagement ends with specific, actionable steps. We identify weaknesses, missed opportunities, and clear actions to improve how your business is discovered.',
  },
]

function WhatWeDo() {
  const fadeRef = useFadeIn()
  return (
    <section id="what-we-do" className="bg-white py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>What We Do</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">Structured analysis. Practical output.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">We help business owners and operators understand exactly where they stand online — in both traditional search and the growing landscape of AI-generated answers — and what to do about it.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {whatWeDoItems.map((item, i) => (
            <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-7 transition-all duration-200 fade-in-on-scroll" style={{ transitionDelay: `${i * 60}ms` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.backgroundColor = '#fff8f5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc' }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(249,115,22,0.08)', color: ORANGE }}>{item.icon}</div>
              <h3 className="text-slate-900 font-semibold text-lg mb-2.5">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SEO vs GEO ───────────────────────────────────────────────────────────────

function SEOvsGEO() {
  const fadeRef = useFadeIn()
  return (
    <section id="seo-vs-geo" className="bg-slate-50 py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>SEO vs GEO</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">Two kinds of visibility. Both matter.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">Search has evolved. Customers now find information through traditional search engines and through AI tools that synthesize and summarize answers on their behalf.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          <div className="rounded-xl border border-slate-200 bg-white p-8 fade-in-on-scroll">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Traditional</p>
                <h3 className="text-slate-900 font-bold text-xl">SEO</h3>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Search Engine Optimization is how your business appears in traditional search results — Google, Bing, and other search engines. It covers rankings, search presence, organic traffic, and how discoverable your site is to users actively searching for your products or services.</p>
            <ul className="space-y-2.5">
              {['Keyword rankings and search presence','Website structure and technical health','Content relevance and authority signals','Backlink profile and domain credibility','Search result visibility and click-through'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600"><CheckIcon className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white p-8 relative overflow-hidden fade-in-on-scroll" style={{ border: '1px solid rgba(249,115,22,0.3)', transitionDelay: '60ms' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(249,115,22,0.05)' }} />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.08)' }}>
                <svg className="w-4 h-4" style={{ color: ORANGE }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: ORANGE }}>Emerging</p>
                <h3 className="text-slate-900 font-bold text-xl">GEO</h3>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">Generative Engine Optimization is how your business appears in AI-generated responses. When someone asks an AI tool a question, it synthesizes an answer from what it knows — and how your business is represented in those environments is now as important as your search rankings.</p>
            <ul className="space-y-2.5">
              {['AI-generated answer presence and citations','How your brand is described and summarized','Entity clarity and brand signal strength','Representation accuracy in AI responses','Discoverability in generative search environments'].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600"><CheckIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: ORANGE }} />{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-8 py-6 text-center">
          <p className="text-slate-600 text-base leading-relaxed max-w-3xl mx-auto">Businesses that only optimize for traditional search are leaving visibility on the table. As more people use AI tools to research, compare, and decide — your GEO presence directly affects whether your business gets mentioned, cited, or recommended at all.</p>
        </div>
      </div>
    </section>
  )
}

// ─── Services ─────────────────────────────────────────────────────────────────

function Services() {
  const fadeRef = useFadeIn()
  return (
    <section id="services" className="bg-white py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Services</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">Two focused offerings.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">Everything SearchLight Digital offers is built around giving you a clear picture of your visibility and concrete steps to improve it.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 p-8 flex flex-col fade-in-on-scroll">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-1">No cost</p>
                <h3 className="text-slate-900 font-bold text-2xl">SEO Analysis</h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-sm font-semibold">Free</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">A no-cost, high-level review of your current search visibility. You'll get a clear read on your strengths, your weaknesses, and where you may be missing opportunities — with simple, direct recommendations.</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['Search visibility review','High-level strengths and weaknesses','Top missed opportunities','Simple recommendations'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600"><CheckIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />{item}</li>
              ))}
            </ul>
            <a href="mailto:searchlightdigitalai@gmail.com?subject=Free SEO Analysis Request" className="inline-flex items-center justify-center w-full px-5 py-3 rounded-md border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium text-sm transition-all duration-200">Request Free Analysis</a>
          </div>
          <div className="rounded-xl p-8 flex flex-col relative overflow-hidden fade-in-on-scroll" style={{ border: '1px solid rgba(249,115,22,0.35)', background: 'linear-gradient(160deg, rgba(249,115,22,0.06) 0%, white 60%)', transitionDelay: '60ms' }}>
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(249,115,22,0.06)' }} />
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: ORANGE }}>Paid Report</p>
                <h3 className="text-slate-900 font-bold text-2xl">GEO Report</h3>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(249,115,22,0.12)', color: '#ea6c00' }}>$500</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">A focused, technical diagnostic for businesses that want to understand and improve how they show up in AI-driven search. Structured findings, competitive context, and a clear path forward — delivered as a premium, standalone report.</p>
            <ul className="space-y-2.5 mb-8 flex-1">
              {['AI visibility review','Brand discoverability analysis','Competitor comparison overview','Structured findings','5 custom next steps'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600"><CheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: ORANGE }} />{item}</li>
              ))}
            </ul>
            <a href="mailto:searchlightdigitalai@gmail.com?subject=GEO Report Request" className="inline-flex items-center justify-center w-full px-5 py-3 rounded-md text-white font-medium text-sm transition-colors duration-200" style={{ backgroundColor: ORANGE }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = ORANGE)}>Request GEO Report</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Full Service ─────────────────────────────────────────────────────────────

function FullService() {
  const fadeRef = useFadeIn()
  return (
    <section id="full-service" data-dark-section className="py-24" style={{ backgroundColor: DARK_BG }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Full Service</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">We Don't Just Tell You What to Fix — We Fix It.</h2>
          <p className="text-slate-400 text-lg leading-relaxed">For businesses that want more than a report, SearchLight Digital offers hands-on implementation and ongoing monitoring of your online presence.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl p-8 fade-in-on-scroll" style={{ backgroundColor: DARK_SURFACE, border: `1px solid ${DARK_BORDER}` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(249,115,22,0.10)', color: ORANGE }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Implementation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">We take the findings from your report and make the changes needed — technical fixes, content improvements, schema markup, entity signals, and more. You get the expertise without needing to manage it yourself.</p>
          </div>
          <div className="rounded-xl p-8 fade-in-on-scroll" style={{ backgroundColor: DARK_SURFACE, border: `1px solid ${DARK_BORDER}`, transitionDelay: '60ms' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5" style={{ backgroundColor: 'rgba(249,115,22,0.10)', color: ORANGE }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-xl mb-3">Monitoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">We keep a continuous eye on your search and AI visibility, tracking changes and adjusting strategy as the landscape evolves. Stay ahead of algorithm shifts and changes in how AI tools represent your industry.</p>
          </div>
        </div>
        <div className="text-center">
          <a href="mailto:searchlightdigitalai@gmail.com?subject=Full Service Inquiry" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md text-white font-medium transition-colors duration-200" style={{ backgroundColor: ORANGE }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = ORANGE)}
          >
            Contact for Pricing
            <ArrowRightIcon className="w-4 h-4" />
          </a>
          <p className="text-slate-600 text-sm mt-3">Custom pricing based on scope and ongoing needs.</p>
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const processSteps = [
  { number: '01', title: 'Submit company details', body: 'Share basic information about your business — your website, industry, and any context that helps us understand your goals and competitive environment.' },
  { number: '02', title: 'We analyze your visibility', body: 'Using structured, expert review, we examine how your business appears across traditional search and AI-generated answer environments — including gaps and competitor positioning.' },
  { number: '03', title: 'We identify weak points and opportunities', body: "We work through the findings systematically: where you're underrepresented, where competitors have an edge, and where the clearest opportunities to improve exist." },
  { number: '04', title: 'You receive your report', body: 'You receive a structured report with findings across every area analyzed — plus 5 custom next steps tailored to your business and specific visibility gaps.' },
]

function HowItWorks() {
  const fadeRef = useFadeIn()
  return (
    <section id="how-it-works" data-dark-section className="py-24" style={{ backgroundColor: DARK_SURFACE }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>How It Works</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">A straightforward process.</h2>
          <p className="text-slate-400 text-lg leading-relaxed">From submission to delivery, the process is designed to be clear and low-friction on your end.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {processSteps.map((step, i) => (
            <div key={step.number} className="rounded-xl p-6 transition-all duration-200 fade-in-on-scroll" style={{ backgroundColor: DARK_BG, border: `1px solid ${DARK_BORDER}`, transitionDelay: `${i * 60}ms` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
            >
              <div className="font-mono text-xs font-bold mb-4" style={{ color: 'rgba(249,115,22,0.5)' }}>{step.number}</div>
              <h3 className="text-white font-semibold text-base mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Five Next Steps ──────────────────────────────────────────────────────────

const nextStepsItems = [
  { label: 'Content clarity', desc: 'Improve how your content communicates who you are, what you do, and who you serve — so AI systems can accurately represent you.' },
  { label: 'Brand and entity signals', desc: 'Strengthen the signals that help search engines and AI systems recognize and understand your business as a distinct, credible entity.' },
  { label: 'Site structure and discoverability', desc: 'Address structural issues that limit how your pages are crawled, indexed, and understood — in both search and AI contexts.' },
  { label: 'Visibility gap closure', desc: 'Target specific gaps where your business is absent or underrepresented in search results or AI-generated answers.' },
  { label: 'AI representation improvement', desc: 'Take concrete steps to increase the likelihood that your business is accurately cited, surfaced, and represented in future AI-generated answers.' },
]

function FiveNextSteps() {
  const fadeRef = useFadeIn()
  return (
    <section id="next-steps" className="bg-white py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="fade-in-on-scroll">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Included in Every GEO Report</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-6">5 custom next steps — not a checklist.</h2>
            <p className="text-slate-500 text-base leading-relaxed mb-4">Every GEO Report includes 5 custom next steps based on your current visibility gaps, content structure, brand signals, and discoverability opportunities.</p>
            <p className="text-slate-500 text-base leading-relaxed mb-8">The report does not stop at observations. These next steps are built directly from the findings in your report — not pulled from a generic template.</p>
            <div className="space-y-2">
              {['Specific to your business','Strategic in scope','Tailored to your findings','Action-oriented','Built to move visibility forward'].map((tag) => (
                <div key={tag} className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: ORANGE }} />
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <div ref={fadeRef} className="space-y-3">
            {nextStepsItems.map((item, i) => (
              <div key={item.label} className="flex gap-4 p-5 rounded-xl border border-slate-200 bg-slate-50 transition-all duration-200 fade-in-on-scroll" style={{ transitionDelay: `${i * 50}ms` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; e.currentTarget.style.backgroundColor = '#fff8f5' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '#f8fafc' }}
              >
                <div className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: ORANGE }}>{i + 1}</div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm mb-1">{item.label}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Why It Matters ───────────────────────────────────────────────────────────

const whyMattersPoints = [
  { title: 'Search behavior has shifted', body: "Customers no longer rely solely on traditional search engines to find what they're looking for. They ask AI tools for recommendations, comparisons, summaries, and answers — and those tools respond with synthesized content, not a list of links." },
  { title: "If you're not in the answer, you're not in the consideration set", body: "When an AI tool generates a response about your category or service area, it draws on what it knows about the players in that space. If your business is absent, unclear, or misrepresented, you lose visibility before the customer ever reaches your website." },
  { title: 'Strong digital presence now means both', body: "Traditional search visibility remains important. But it's no longer sufficient on its own. Businesses that want to stay discoverable need to understand and actively manage both their search presence and their AI answer presence." },
]

function WhyItMatters() {
  const fadeRef = useFadeIn()
  return (
    <section id="why-it-matters" className="bg-slate-50 py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Why It Matters</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">The way people find businesses has changed.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">Understanding your visibility in this environment is no longer optional — it's a core part of staying relevant and discoverable.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {whyMattersPoints.map((point, i) => (
            <div key={point.title} className="bg-white rounded-xl border border-slate-200 p-7 hover:border-slate-300 transition-colors duration-200 fade-in-on-scroll" style={{ transitionDelay: `${i * 60}ms` }}>
              <div className="w-1 h-8 rounded-full mb-5" style={{ backgroundColor: ORANGE }} />
              <h3 className="text-slate-900 font-semibold text-base mb-3">{point.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{point.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Why SearchLight Digital ──────────────────────────────────────────────────

const whyUsReasons = [
  { title: 'Specialized, not generalist', body: "SearchLight Digital focuses exclusively on SEO and GEO analysis and implementation. This is not a full-service agency — it's a focused practice built around one specific problem: your online visibility." },
  { title: 'Expert analysis, not guesswork', body: 'Visibility analysis is done through structured, methodical review — not high-level observation or generic checklists. The findings are grounded in actual data and expert examination.' },
  { title: 'Clear, readable deliverables', body: "Reports are structured for clarity. You get a real understanding of what was found and why it matters — not a wall of jargon or an overwhelming document." },
  { title: 'Practical output that moves forward', body: 'Every engagement ends with specific, actionable steps — not vague suggestions. The goal is always to give you something you can act on immediately.' },
  { title: 'End-to-end capability', body: "From the initial report through implementation and ongoing monitoring, SearchLight Digital can handle the full lifecycle of your visibility improvement — no handoffs to other vendors." },
  { title: 'Built for businesses that want clarity', body: "If you want to understand exactly where your business stands and what to do next — without the noise — SearchLight Digital is the right fit." },
]

function WhySearchLight() {
  const fadeRef = useFadeIn()
  return (
    <section id="why-us" className="bg-white py-24 border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Why SearchLight Digital</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">Focused. Technical. Direct.</h2>
          <p className="text-slate-500 text-lg leading-relaxed">SearchLight Digital is built for businesses that want a clear, honest look at their visibility — and a practical path to improving it.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyUsReasons.map((reason, i) => (
            <div key={reason.title} className="p-6 rounded-xl border border-slate-200 transition-all duration-200 fade-in-on-scroll" style={{ transitionDelay: `${i * 50}ms` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'; e.currentTarget.style.backgroundColor = '#fff8f5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.backgroundColor = '' }}
            >
              <h3 className="text-slate-900 font-semibold text-base mb-2.5">{reason.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{reason.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

function Pricing() {
  const fadeRef = useFadeIn()
  return (
    <section id="pricing" data-dark-section className="py-24" style={{ backgroundColor: DARK_BG }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5">Simple, transparent pricing.</h2>
          <p className="text-slate-400 text-lg leading-relaxed">Two clear options. No retainers, no packages, no hidden fees.</p>
        </div>
        <div ref={fadeRef} className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-4xl mx-auto mb-8">
          <div className="rounded-xl p-8 flex flex-col fade-in-on-scroll" style={{ border: `1px solid ${DARK_BORDER}`, backgroundColor: DARK_SURFACE }}>
            <div className="mb-8">
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-2">Get started</p>
              <h3 className="text-white font-bold text-2xl mb-4">Free SEO Analysis</h3>
              <div className="flex items-baseline gap-1"><span className="text-4xl font-bold text-white">Free</span></div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['Search visibility review','High-level strengths and weaknesses','Top missed opportunities','Simple recommendations'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-400"><CheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: DARK_BORDER }} />{item}</li>
              ))}
            </ul>
            <a href="mailto:searchlightdigitalai@gmail.com?subject=Free SEO Analysis Request" className="inline-flex items-center justify-center w-full px-5 py-3 rounded-md text-slate-300 hover:text-white font-medium text-sm transition-all duration-200" style={{ border: `1px solid ${DARK_BORDER}` }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = ORANGE)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = DARK_BORDER)}
            >Request Free Analysis</a>
          </div>
          <div className="rounded-xl p-8 flex flex-col relative overflow-hidden fade-in-on-scroll" style={{ border: '1px solid rgba(249,115,22,0.4)', background: `linear-gradient(160deg, rgba(249,115,22,0.12) 0%, ${DARK_SURFACE} 55%)`, transitionDelay: '60ms' }}>
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(249,115,22,0.07)' }} />
            <div className="mb-8">
              <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: ORANGE }}>Recommended</p>
              <h3 className="text-white font-bold text-2xl mb-4">GEO Report</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-slate-500 text-xl">$</span>
                <span className="text-4xl font-bold text-white">500</span>
                <span className="text-slate-500 text-sm ml-1">one-time</span>
              </div>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {['AI visibility review','Brand discoverability analysis','Competitor comparison overview','Structured findings','5 custom next steps'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-300"><CheckIcon className="w-4 h-4 flex-shrink-0" style={{ color: ORANGE }} />{item}</li>
              ))}
            </ul>
            <a href="mailto:searchlightdigitalai@gmail.com?subject=GEO Report Request" className="inline-flex items-center justify-center w-full px-5 py-3 rounded-md text-white font-medium text-sm transition-colors duration-200" style={{ backgroundColor: ORANGE }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = ORANGE_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = ORANGE)}
            >Request GEO Report</a>
          </div>
        </div>
        <p className="text-center text-slate-500 text-sm max-w-lg mx-auto">The GEO Report is a focused, high-value diagnostic for businesses that want to understand and improve how they appear in AI-driven search.</p>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqData = [
  { q: 'What is GEO?', a: "GEO stands for Generative Engine Optimization. It refers to how your business appears in AI-generated responses — when someone asks an AI tool a question and it synthesizes an answer. GEO is about ensuring your business is accurately represented, cited, and visible in those environments." },
  { q: 'How is GEO different from SEO?', a: "SEO focuses on visibility in traditional search engines like Google — rankings, organic traffic, and search presence. GEO focuses on visibility in AI-generated answers — how you're described, cited, or omitted when AI tools respond to relevant queries. Both matter, and both require different analysis approaches." },
  { q: 'Who is this for?', a: "SearchLight Digital works best for business owners and operators who want a clear, honest picture of their online visibility and practical guidance on what to do about it. You don't need a large marketing team or a technical background to benefit from the analysis." },
  { q: 'What do I receive in the GEO Report?', a: "You receive a structured report that includes: a current AI and search visibility snapshot, a brand presence and discoverability review, a competitor comparison overview, content and entity clarity observations, risk and opportunity highlights, and 5 custom next steps tailored to your business." },
  { q: 'What are the 5 custom next steps?', a: "These are specific, strategic recommendations built directly from the findings in your report. They're tailored to your business's visibility gaps, content structure, brand signals, and discoverability opportunities — not pulled from a generic template." },
  { q: 'How long does the report take?', a: "Turnaround time is typically 5–7 business days from the time you submit your company details. If your timeline is more urgent, reach out and we'll discuss options." },
  { q: 'Do you offer ongoing support after the report?', a: "The GEO Report is a standalone deliverable — a diagnostic, not a retainer. If you want to discuss the findings or explore next steps in more detail, that's available after delivery. For ongoing work, see our Full Service offering." },
  { q: 'Do you offer implementation services?', a: "Yes. Beyond reports, SearchLight Digital offers hands-on implementation — we make the changes identified in your analysis ourselves. This includes technical fixes, content improvements, schema markup, entity signals, and more. Contact us for pricing." },
  { q: 'What does monitoring include?', a: "Our monitoring service tracks your search and AI visibility on an ongoing basis, watching for changes in how your business is represented, shifts in competitor positioning, and algorithm or AI model updates that affect your discoverability. We adjust strategy as the landscape evolves." },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between gap-4 py-5 text-left group">
        <span className="text-slate-900 font-medium text-base transition-colors duration-200" style={open ? { color: ORANGE } : {}}>{q}</span>
        <ChevronDownIcon className={`w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: open ? '400px' : '0px' }}>
        <div className="pb-5 pr-8">
          <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

function FAQ() {
  return (
    <section id="faq" className="bg-slate-50 py-24 border-b border-slate-100">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: ORANGE }}>FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Common questions.</h2>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 px-6 md:px-8">
          {faqData.map((item) => (
            <FAQItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>
    </section>
  )
}
