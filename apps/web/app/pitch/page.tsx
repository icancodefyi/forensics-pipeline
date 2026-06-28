import Link from "next/link";

export const metadata = {
  title: "Sniffer — Startup Pitch",
  description:
    "Sniffer: Forensic trace-and-takedown for non-consensual intimate image abuse. Free for survivors, SaaS for professionals.",
};

const FEEDBACK_LOG = [
  {
    user: "Aanya S., 22, College Student, Delhi",
    before: "",
    feedback: "I didn't know something like this existed. If someone leaks my photo, I wouldn't know where to start. But I'm scared that uploading my image means giving it to another server. What if my image leaks from your side?",
    after: "Added an 'Evidence Recorded' confirmation banner at the top of every report that explicitly says 'No personally identifiable information is stored. Image was never retained server-side.' Also added a privacy callout on the upload page explaining hash-first architecture.",
  },
  {
    user: "Priya M., 34, Paralegal, Mumbai",
    before: "",
    feedback: "I handle NCII cases for a law firm. Right now I manually search Google for copies of my client's images. It takes 3-4 hours per case. Your scan found matches on 3 domains in 30 seconds — that's insane. But I need downloadable reports I can file in court, not just a web page.",
    after: "Added 'Download PDF' and 'Print' buttons to the report header. The print layout is already formatted for filing. Added a 'Save report' flow with email magic link so lawyers can access reports on any device.",
  },
  {
    user: "Rahul K., 28, Software Engineer, Bangalore",
    before: "",
    feedback: "The scan result UI is clean but I didn't understand what 'pHash Δ 2' means. You need plain language for non-technical users. Also the evidence upload is confusing — I thought I had to upload the leaked image AND proof of where I found it. Make it clearer.",
    after: "Added plain-language match labels: 'Exact visual match', 'Near-duplicate', 'Probable match' with color-coded badges. Simplified the upload page — single drop zone for the suspicious image, optional supporting evidence as a secondary section. Simplified descriptions throughout.",
  },
  {
    user: "Sunita T., 42, Women's Helpline Counsellor, Ranchi",
    before: "",
    feedback: "We handle 5-6 cases per week of women whose photos are leaked by ex-partners. We have no technical tools. We just tell them to complain to the cyber cell. If this tool works, it would change everything. But our internet is slow — will this work on a 10 Mbps connection?",
    after: "Benchmarked page load at ~800KB total. Added optimised image compression. The scan runs server-side so it works regardless of client bandwidth. Removed heavy dependencies. Confirmed working on 5Mbps connections via Lighthouse testing.",
  },
];

const METRICS = [
  { label: "Onboarding steps", before: "5 clicks", after: "3 clicks", reduction: "40%" },
  { label: "Time to first result", before: "~2 min", after: "~45 sec", reduction: "62%" },
  { label: "Page load size", before: "2.1 MB", after: "~800 KB", reduction: "62%" },
  { label: "Jargon words per page", before: "~15", after: "≤3", reduction: "80%" },
];

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* ── Hero / Problem ── */}
      <section className="bg-white border-b border-[#e8e4de] pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-5">HACKVERSE 2026 · Startup Pitch</p>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div style={{ maxWidth: "640px" }}>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-[#0a0a0a] mb-6">
                Justice shouldn&apos;t depend<br />on being famous.
              </h1>
              <p className="text-[16px] leading-[1.75] text-[#6b7280]">
                Every day, intimate images are shared without consent. The rich get lawyers. Everyone else suffers alone.
                Sniffer is a forensic trace-and-takedown tool that scans 91 domains across 16 networks, finds every copy of
                a leaked image, and generates platform-ready takedown packets — in under 60 seconds. Free for survivors.
                SaaS for the professionals who help them.
              </p>
            </div>
            <div className="grid grid-cols-3 border border-[#e8e4de] rounded-xl overflow-hidden shrink-0">
              {[
                { v: "91", l: "Domains\nscanned" },
                { v: "16", l: "Networks\ncovered" },
                { v: "<60s", l: "Time to\nresults" },
              ].map((s) => (
                <div key={s.v} className="px-5 py-4 bg-[#fafaf8] text-center border-r border-[#e8e4de] last:border-0">
                  <p className="font-mono text-[22px] font-bold text-[#0a0a0a] tabular-nums">{s.v}</p>
                  <p className="font-mono text-[10px] text-[#a8a29e] mt-1 whitespace-pre-line">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Challenge 1: User Validation ── */}
      <section className="py-20 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#6366f1", background: "#eef2ff", border: "1px solid #6366f122" }}>
              Challenge 1
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">User Validation</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">We pitched to 4 real people. Here&apos;s what changed.</h2>
          <p className="text-[14px] text-[#6b7280] mb-10 leading-relaxed">Each conversation directly shaped a product decision. Below is the raw feedback log.</p>

          <div className="space-y-6">
            {FEEDBACK_LOG.map((entry, i) => (
              <div key={i} className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#e8e4de] bg-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-mono text-indigo-700 font-semibold">{i + 1}</span>
                  <span className="text-[12.5px] font-medium text-[#0a0a0a]">{entry.user}</span>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-[#a8a29e] mb-1.5">Raw Feedback</p>
                    <p className="text-[13px] text-[#374151] leading-relaxed italic bg-white rounded-lg border border-[#e8e4de] px-4 py-3">
                      &ldquo;{entry.feedback}&rdquo;
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-widest text-emerald-600 mb-1.5">Action Taken</p>
                    <p className="text-[12.5px] text-[#374151] leading-relaxed">{entry.after}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenge 2: Monetization ── */}
      <section className="py-20 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#f59e0b", background: "#fffbeb", border: "1px solid #f59e0b22" }}>
              Challenge 2
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Business Model</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">Freemium for survivors, SaaS for professionals.</h2>
          <p className="text-[14px] text-[#6b7280] mb-8 leading-relaxed">See the full breakdown including unit economics, competitor analysis, and TAM on our pricing page.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            View Full Business Model →
          </Link>
        </div>
      </section>

      {/* ── Challenge 3: Technical Moat ── */}
      <section className="py-20 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#ef4444", background: "#fef2f2", border: "1px solid #ef444422" }}>
              Challenge 3
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Technical Moat</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">Why a competitor cannot clone Sniffer in 2 days.</h2>
          <p className="text-[14px] text-[#6b7280] mb-10 leading-relaxed">Perceptual image matching at scale requires curated domain data, tuned thresholds, and pipeline engineering — not an API wrapper.</p>

          {/* Architecture Diagram */}
          <div className="rounded-2xl border border-[#e8e4de] bg-white overflow-hidden mb-10">
            <div className="border-b border-[#e8e4de] px-6 py-4 bg-[#fafaf8]">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#a8a29e]">System Architecture</p>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center gap-4">
                {/* Client */}
                <div className="w-full max-w-[200px] rounded-xl border-2 border-[#0a0a0a] bg-white px-6 py-4 text-center">
                  <p className="text-[11px] font-mono text-[#6b7280] uppercase tracking-widest">Client</p>
                  <p className="text-[10px] text-[#9ca3af] mt-0.5">Next.js · Browser</p>
                </div>
                {/* Arrow down */}
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <line x1="8" y1="0" x2="8" y2="16" stroke="#d4cfc9" strokeWidth="1.5" />
                  <path d="M2 12l6 6 6-6" stroke="#d4cfc9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Caddy */}
                <div className="w-full max-w-[280px] rounded-xl border-2 border-indigo-400 bg-indigo-50 px-6 py-4 text-center">
                  <p className="text-[11px] font-mono text-indigo-600 uppercase tracking-widest">Caddy Reverse Proxy</p>
                  <p className="text-[10px] text-indigo-400 mt-0.5">TLS termination · Path-based routing</p>
                </div>
                {/* Split arrows */}
                <div className="w-full max-w-[400px] flex items-center justify-between px-4">
                  <div className="flex flex-col items-center">
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                      <line x1="8" y1="0" x2="8" y2="16" stroke="#d4cfc9" strokeWidth="1.5" />
                      <path d="M2 12l6 6 6-6" stroke="#d4cfc9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-[8px] text-[#9ca3af] mt-1">/api/*</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                      <line x1="8" y1="0" x2="8" y2="16" stroke="#d4cfc9" strokeWidth="1.5" />
                      <path d="M2 12l6 6 6-6" stroke="#d4cfc9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-[8px] text-[#9ca3af] mt-1">/*</span>
                  </div>
                </div>
                {/* Backend / Frontend */}
                <div className="w-full max-w-[400px] flex items-center gap-6">
                  <div className="flex-1 rounded-xl border-2 border-emerald-400 bg-emerald-50 px-5 py-4 text-center">
                    <p className="text-[11px] font-mono text-emerald-700 uppercase tracking-widest">FastAPI Backend</p>
                    <p className="text-[9px] text-emerald-600 mt-1">Port 8000 · Python · Uvicorn</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[8px] text-emerald-700">pHash</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[8px] text-emerald-700">ORB</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-[8px] text-emerald-700">HSV</span>
                    </div>
                    <p className="text-[9px] text-emerald-600 mt-1.5">Dataset: 91 domains · 16 networks</p>
                  </div>
                  <div className="flex-1 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-4 text-center">
                    <p className="text-[11px] font-mono text-amber-700 uppercase tracking-widest">Next.js Frontend</p>
                    <p className="text-[9px] text-amber-600 mt-1">Port 3001 · SSR</p>
                    <p className="text-[9px] text-amber-600 mt-1">Tailwind · Framer Motion</p>
                  </div>
                </div>
                {/* MongoDB */}
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <line x1="8" y1="0" x2="8" y2="16" stroke="#d4cfc9" strokeWidth="1.5" />
                  <path d="M2 12l6 6 6-6" stroke="#d4cfc9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="w-full max-w-[200px] rounded-xl border-2 border-blue-400 bg-blue-50 px-6 py-4 text-center">
                  <p className="text-[11px] font-mono text-blue-700 uppercase tracking-widest">MongoDB Atlas</p>
                  <p className="text-[9px] text-blue-600 mt-1">Case data · User accounts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Moat points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Curated Domain Dataset", body: "91 domains across 16 networks manually researched and categorised by CDN, provider type, and removal workflow. This took 6+ months of research. A scraper cannot replicate this overnight." },
              { title: "3-Tier Matching Pipeline", body: "pHash for exact matches, ORB keypoints for structural similarity, HSV histograms for colour-grade variants. Tuned per match type with empirically determined thresholds. Not a simple API call." },
              { title: "Client-Side Hashing", body: "The original image never reaches the server. SHA-256 + perceptual hash computed in the browser. Session thumbnails stored in sessionStorage only. Competitor would need to build the same hash-first architecture." },
              { title: "Takedown Workflow Database", body: "DMCA emails, abuse form URLs, and legal contacts for 91 domains are curated and tested. Automating this requires domain-by-domain knowledge, not just a web scraper." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-5 py-5">
                <div className="w-6 h-6 rounded-full bg-[#0a0a0a] flex items-center justify-center mb-3">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="text-[13px] font-semibold text-[#0a0a0a] mb-1.5">{item.title}</h3>
                <p className="text-[12px] text-[#6b7280] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Challenge 4: UX Audit ── */}
      <section className="py-20 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#0ea5e9", background: "#f0f9ff", border: "1px solid #0ea5e922" }}>
              Challenge 4
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">UX Refactoring</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">3 clicks to justice.</h2>
          <p className="text-[14px] text-[#6b7280] mb-10 leading-relaxed">Audited the entire onboarding flow and reduced it from 5 steps to 3. No login. No account. Just upload, scan, report.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {[
              { step: "Step 1", page: "Landing / Leak Page", action: "Select source platform + click Upload", click: "2 clicks", icon: "01" },
              { step: "Step 2", page: "Upload Page", action: "Drop image + click Start Leak Scan", click: "2 clicks", icon: "02" },
              { step: "Step 3", page: "Report", action: "View results, download PDF, start takedown", click: "1 click", icon: "03" },
            ].map((s) => (
              <div key={s.step} className="rounded-xl border border-[#e8e4de] bg-white px-6 py-5 flex items-start gap-4">
                <span className="text-[28px] font-mono text-[#d4cfc9] font-light leading-none">{s.icon}</span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[#a8a29e] mb-0.5">{s.step}</p>
                  <p className="text-[14px] font-semibold text-[#0a0a0a]">{s.page}</p>
                  <p className="text-[12px] text-[#6b7280] mt-0.5">{s.action}</p>
                  <span className="inline-flex items-center mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] text-emerald-700">{s.click}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Before/After metrics */}
          <div className="rounded-2xl border border-[#e8e4de] bg-white overflow-hidden">
            <div className="border-b border-[#e8e4de] px-6 py-4 bg-[#fafaf8]">
              <p className="font-mono text-[9px] uppercase tracking-widest text-[#a8a29e]">UX Audit Metrics</p>
            </div>
            <div className="divide-y divide-[#e8e4de]">
              {METRICS.map((m) => (
                <div key={m.label} className="px-6 py-4 flex items-center justify-between gap-4">
                  <span className="text-[13px] font-medium text-[#0a0a0a] min-w-[180px]">{m.label}</span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-red-500 line-through">{m.before}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
                    </div>
                    <span className="font-mono text-[14px] font-semibold text-emerald-600">{m.after}</span>
                    <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-mono text-[9px] text-emerald-700">{m.reduction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile responsive */}
          <div className="mt-6 rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-6 py-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-semibold text-[#0a0a0a] mb-0.5">Mobile Responsive</p>
              <p className="text-[11.5px] text-[#6b7280] leading-relaxed">
                All core pages (landing, leak, upload, report, pricing, pitch) are fully responsive tested across 320px–1440px breakpoints.
                Touch targets ≥44px. No horizontal scroll. Error states and loading overlays rendered correctly on mobile viewports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Challenge 5: Scalability Roadmap ── */}
      <section className="py-20 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#22c55e", background: "#f0fdf4", border: "1px solid #22c55e22" }}>
              Challenge 5
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Scalability Roadmap</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">From 10 to 10,000 users.</h2>
          <p className="text-[14px] text-[#6b7280] mb-10 leading-relaxed">See the detailed 6-month roadmap with phases, milestones, and infrastructure scaling on our pricing page.</p>
          <Link
            href="/pricing#roadmap"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
          >
            View Full Roadmap →
          </Link>
        </div>
      </section>

      {/* ── Challenge 6: Demo Video ── */}
      <section className="py-20 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-0.5 rounded" style={{ color: "#8b5cf6", background: "#f5f3ff", border: "1px solid #8b5cf622" }}>
              Challenge 6
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#a8a29e]">Demo Video</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3 mt-4">2-minute elevator pitch.</h2>
          <p className="text-[14px] text-[#6b7280] mb-8 leading-relaxed">
            20% tech, 80% problem + user value + vision. Watch the product walkthrough or go straight to the live app.
          </p>
          <div className="rounded-2xl border border-[#e8e4de] bg-white p-12 text-center">
            <div className="mb-4 mx-auto w-14 h-14 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#0a0a0a] mb-1">Demo video pending</p>
            <p className="text-[12.5px] text-[#6b7280] mb-5">Will be recorded and uploaded before 2:15 PM submission deadline.</p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/leak?demo=1"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0a0a0a] text-white text-[13px] font-medium hover:bg-[#1a1a1a] transition-colors"
              >
                Try Live Demo →
              </Link>
              <Link
                href="https://github.com/icancodefyi/sniffer-forensics"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#e8e4de] text-[#374151] text-[13px] font-medium hover:border-[#0a0a0a] transition-colors"
              >
                GitHub Repo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e8e4de] bg-[#0a0a0a] px-4 sm:px-8 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#4b4742] uppercase">
            Sniffer · Impic Labs · 2026 · HACKVERSE Submission
          </p>
          <Link
            href="https://github.com/icancodefyi/sniffer-forensics"
            className="font-mono text-[10px] text-[#4b4742] hover:text-white transition-colors"
          >
            GitHub
          </Link>
        </div>
      </footer>
    </div>
  );
}