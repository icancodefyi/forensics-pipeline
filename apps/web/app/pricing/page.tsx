import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "Pricing — Sniffer",
  description:
    "Free for survivors. SaaS for professionals. Sniffer's freemium model keeps the mission intact while building a sustainable business.",
};

const TIERS = [
  {
    name: "Survivor",
    tagline: "For individuals seeking help",
    price: "₹0",
    cadence: "forever",
    cta: "Start now",
    href: "/leak?demo=1",
    highlight: false,
    features: [
      "Scan across 91 monitored domains",
      "Visual match results with confidence scores",
      "Direct takedown contacts per domain",
      "Downloadable PDF evidence report",
      "Anonymous submissions — no account needed",
      "Email magic-link case saving",
    ],
    footnote: "Always free. No account, no card, no data stored.",
  },
  {
    name: "Professional",
    tagline: "For lawyers & paralegals handling NCII cases",
    price: "₹499",
    cadence: "per month",
    cta: "Choose Professional",
    href: "/leak?demo=1",
    highlight: true,
    features: [
      "Everything in Survivor, plus:",
      "Auto-generated DMCA & IT Act takedown notices",
      "Legal packet builder (PDF, court-ready)",
      "Bulk takedown across all matched domains in one click",
      "Priority scanning — results in under 30 seconds",
      "Case management dashboard — track up to 50 active matters",
      "Email & WhatsApp delivery of reports to clients",
    ],
    footnote: "One case pays for the whole year. Cancel anytime.",
  },
  {
    name: "Enterprise",
    tagline: "For NGOs, helplines & law firms at scale",
    price: "₹9,999",
    cadence: "per month",
    cta: "Contact us",
    href: "/leak?demo=1",
    highlight: false,
    features: [
      "Everything in Professional, plus:",
      "Unlimited active cases & bulk CSV upload",
      "REST API access — integrate into your existing systems",
      "White-label reports with your organisation's branding",
      "Dedicated account manager & priority support",
      "On-site training & SOP documentation",
      "SLA: 99.9% uptime, sub-15s scan latency",
    ],
    footnote: "Used by cybercrime cells, women's helplines & legal aid clinics.",
  },
];

const UNIT_ECONOMICS = [
  { label: "Free users", count: "800", revenue: "₹0" },
  { label: "Professional", count: "150", revenue: "₹74,850" },
  { label: "Enterprise", count: "50", revenue: "₹4,99,950" },
];

const COST_ITEMS = [
  { item: "VPS (4 vCPU, 8GB RAM)", cost: "₹2,500/mo" },
  { item: "MongoDB Atlas (M10 cluster)", cost: "₹1,500/mo" },
  { item: "Logo.dev API", cost: "₹750/mo" },
  { item: "Email (SMTP relay)", cost: "₹250/mo" },
];

const COMPARISONS = [
  {
    competitor: "TMG (Takedown Management Group)",
    model: "Service fee per case",
    price: "$499 / case",
   扫描: "No scanning — manual investigation",
    takedown: "DMCA only",
    india: "No India presence",
    us: "Scan + takedown in one flow",
  },
  {
    competitor: "StopNCII.org (UK Government, Meta)",
    model: "Free, government-funded",
    price: "₹0",
    扫描: "Hash submission to Meta only",
    takedown: "Meta platforms only",
    india: "Not available in India",
    us: "91 domains across 16 networks, India-first",
  },
  {
    competitor: "Manual lawyer / paralegal",
    model: "Hourly billing",
    price: "₹5,000 – 15,000 / case",
    扫描: "Manually searching Google",
    takedown: "Draft notices by hand",
    india: "Available but slow",
    us: "Automated, instant, 99% cheaper",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-white border-b border-[#e8e4de] pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-5">
            Pricing
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium leading-[1.1] tracking-tight text-[#0a0a0a] mb-6" style={{ maxWidth: "720px", margin: "0 auto 1.5rem" }}>
            Free for survivors.<br />SaaS for the people who help them.
          </h1>
          <p className="text-[16px] leading-[1.75] text-[#6b7280]" style={{ maxWidth: "560px", margin: "0 auto" }}>
            Sniffer never charges a victim. We charge the professionals who use our automation to handle 50+ cases a month — because their time is worth more than ₹499.
          </p>
        </div>
      </section>

      {/* ── Pricing Tiers ── */}
      <section className="py-20 bg-[#fafaf8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border bg-white overflow-hidden transition-all ${
                  tier.highlight
                    ? "border-[#0a0a0a] shadow-[0_8px_40px_-12px_rgba(15,23,42,0.15)] lg:-mt-4 lg:mb-4"
                    : "border-[#e8e4de] hover:border-[#9ca3af]"
                }`}
              >
                {tier.highlight && (
                  <div className="bg-[#0a0a0a] px-6 py-2.5 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Tier name + tagline */}
                  <div className="mb-6">
                    <h3 className="text-[19px] font-semibold tracking-tight text-[#0a0a0a] mb-1">
                      {tier.name}
                    </h3>
                    <p className="text-[12.5px] text-[#6b7280]">{tier.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6 flex items-baseline gap-2">
                    <span className="font-serif text-[42px] font-medium tracking-tight text-[#0a0a0a] leading-none">
                      {tier.price}
                    </span>
                    <span className="text-[12.5px] text-[#9ca3af]">/ {tier.cadence}</span>
                  </div>

                  {/* CTA */}
                  <Link
                    href={tier.href}
                    className={`block w-full text-center py-3 rounded-full text-[13px] font-medium transition-colors mb-7 ${
                      tier.highlight
                        ? "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                        : "bg-white border border-[#e8e4de] text-[#0a0a0a] hover:border-[#0a0a0a]"
                    }`}
                  >
                    {tier.cta}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`shrink-0 mt-0.5 ${i === 0 && f.endsWith(":") ? "opacity-0" : "opacity-100"}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tier.highlight ? "#0a0a0a" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </span>
                        <span className={`text-[12.5px] leading-relaxed ${i === 0 && f.endsWith(":") ? "font-semibold text-[#0a0a0a]" : "text-[#374151]"}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Footnote */}
                  <p className="mt-6 pt-5 border-t border-[#e8e4de] text-[11px] text-[#9ca3af] italic">
                    {tier.footnote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Unit Economics ── */}
      <section className="py-20 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Unit Economics
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3" style={{ maxWidth: "520px" }}>
            1,000 active users. Here&apos;s the math.
          </h2>
          <p className="text-[14px] leading-[1.7] text-[#6b7280] mb-12" style={{ maxWidth: "500px" }}>
            SaaS is about margins, not vanity metrics. Sniffer runs on commodity infra with no per-user cost — so the marginal profit per paying user is nearly 100%.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Revenue breakdown */}
            <div>
              <div className="rounded-2xl border border-[#e8e4de] bg-[#fafaf8] overflow-hidden">
                <div className="border-b border-[#e8e4de] px-6 py-4 flex items-center justify-between">
                  <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#a8a29e]">
                    Monthly Revenue @ 1,000 users
                  </p>
                  <span className="font-mono text-[11px] text-[#9ca3af]">Assumption</span>
                </div>
                <div className="divide-y divide-[#e8e4de]">
                  {UNIT_ECONOMICS.map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-medium text-[#0a0a0a]">{row.label}</span>
                        <span className="font-mono text-[10px] text-[#9ca3af] bg-white border border-[#e8e4de] rounded px-1.5 py-0.5">{row.count} users</span>
                      </div>
                      <span className="font-mono text-[14px] font-semibold text-[#0a0a0a] tabular-nums">{row.revenue}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-6 py-5 bg-[#0a0a0a]">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">Total MRR</span>
                    <span className="font-mono text-[18px] font-bold text-white tabular-nums">₹5,74,850</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost breakdown */}
            <div>
              <div className="rounded-2xl border border-[#e8e4de] bg-[#fafaf8] overflow-hidden">
                <div className="border-b border-[#e8e4de] px-6 py-4 flex items-center justify-between">
                  <p className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#a8a29e]">
                    Monthly Infra Cost
                  </p>
                  <span className="font-mono text-[11px] text-[#9ca3af]">Fixed</span>
                </div>
                <div className="divide-y divide-[#e8e4de]">
                  {COST_ITEMS.map((row) => (
                    <div key={row.item} className="flex items-center justify-between px-6 py-4">
                      <span className="text-[13px] text-[#374151]">{row.item}</span>
                      <span className="font-mono text-[14px] text-[#6b7280] tabular-nums">{row.cost}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-6 py-5 bg-white">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9ca3af]">Total Cost</span>
                    <span className="font-mono text-[18px] font-bold text-[#374151] tabular-nums">₹5,000</span>
                  </div>
                </div>

                <div className="px-6 py-5 bg-emerald-50 border-t border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700">Gross Margin</span>
                  </div>
                  <p className="text-[22px] font-bold text-emerald-900 tabular-nums">99.1%</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    ₹5,74,850 revenue − ₹5,000 infra = ₹5,69,850 profit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Competitor Analysis ── */}
      <section className="py-20 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Competitive Landscape
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-3" style={{ maxWidth: "520px" }}>
            No one does scan + takedown in one flow.
          </h2>
          <p className="text-[14px] leading-[1.7] text-[#6b7280] mb-12" style={{ maxWidth: "500px" }}>
            Existing solutions are either manual (expensive lawyers), partial (Meta-only), or offshore (no India presence). Sniffer is the only tool that scans 91 domains and generates takedown packets in under 60 seconds.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-[#e8e4de] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e8e4de] bg-[#fafaf8]">
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">Solution</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">Model</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">Price</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">Scanning</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">Takedown</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e]">India?</th>
                  <th className="text-left px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-[#a8a29e] fill-emerald-600">Sniffer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e4de]">
                {COMPARISONS.map((row) => (
                  <tr key={row.competitor} className="hover:bg-[#fafaf8] transition-colors">
                    <td className="px-6 py-4 text-[12.5px] font-semibold text-[#0a0a0a]">{row.competitor}</td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280]">{row.model}</td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280] font-mono">{row.price}</td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280]">{row.扫描}</td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280]">{row.takedown}</td>
                    <td className="px-6 py-4 text-[12px] text-[#6b7280]">{row.india}</td>
                    <td className="px-6 py-4 text-[12px] font-medium text-emerald-700">{row.us}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Market Size ── */}
      <section className="py-20 bg-white border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Market
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-12" style={{ maxWidth: "480px" }}>
            The problem is bigger than anyone admits.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { stat: "62M", label: "Indians consume online porn regularly", source: "IAMAI Digital India Report, 2024" },
              { stat: "1 in 4", label: "Women aged 18–30 report image-based abuse", source: "Internet Democracy Project, India" },
              { stat: "Zero", label: "Free & instant domain-scan tools available in India", source: "Our research, 2 years" },
            ].map((item) => (
              <div key={item.stat} className="rounded-xl border border-[#e8e4de] bg-[#fafaf8] px-6 py-7">
                <p className="font-serif text-[44px] font-medium tracking-tight text-[#0a0a0a] leading-none mb-3">{item.stat}</p>
                <p className="text-[14px] font-medium text-[#374151] mb-2 leading-snug">{item.label}</p>
                <p className="font-mono text-[10px] text-[#9ca3af]">{item.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roadmap ── */}
      <section className="py-20 bg-[#fafaf8] border-t border-[#e8e4de]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#a8a29e] mb-3">
            Roadmap
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal leading-tight tracking-tight text-[#0a0a0a] mb-12" style={{ maxWidth: "480px" }}>
            From 10 users to 10,000. Here&apos;s the plan.
          </h2>

          <div className="space-y-0">
            {[
              { phase: "Q1 2026", title: "MVP & Legal Pilot", desc: "10 survivor cases via NGO partners. Validate takedown success rate. Hand-hold first users.", color: "#6366f1", bg: "#eef2ff" },
              { phase: "Q2 2026", title: "Self-Serve Onboarding", desc: "Frictionless upload → report flow. 100 free users. First paying law firm. Ranchi / Bangalore pilot.", color: "#0ea5e9", bg: "#f0f9ff" },
              { phase: "Q3 2026", title: "Pro Tier Launch", desc: "Auto-takedown packets, case dashboard. 1,000 users, 150 pro. Partner with 3 women's helplines.", color: "#f59e0b", bg: "#fffbeb" },
              { phase: "Q4 2026", title: "Enterprise & API", desc: "REST API for NGOs. White-label reports. 5,000 users, 50 enterprise. Pan-India coverage. 500 domains.", color: "#22c55e", bg: "#f0fdf4" },
              { phase: "2027", title: "Video & Deepfake Detection", desc: "pHash for video frames. Real-time deepfake face-match. 10,000 users. Series A ready.", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((step, i) => (
              <div
                key={step.phase}
                className="grid grid-cols-1 lg:grid-cols-[120px_1fr] gap-0 border-t border-[#e8e4de] py-8 last:border-b"
              >
                <div className="flex lg:flex-col items-center lg:items-start gap-3 lg:gap-0 mb-3 lg:mb-0">
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.2em] px-2 py-1 rounded"
                    style={{ color: step.color, background: step.bg, border: `1px solid ${step.color}22` }}
                  >
                    {step.phase}
                  </span>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[#0a0a0a] mb-1.5 leading-snug">{step.title}</h3>
                  <p className="text-[13px] text-[#6b7280] leading-[1.7]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-[#0a0a0a] border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col items-center text-center">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[#4b4742] mb-5">
            Start Today
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-normal leading-[1.1] tracking-tight text-white mb-6" style={{ maxWidth: "560px" }}>
            Justice shouldn&apos;t depend<br />on being famous.
          </h2>
          <p className="text-[15px] text-[#6b7280] leading-[1.7] mb-10" style={{ maxWidth: "400px" }}>
            Scan 91 domains. Get your evidence. Take it down. Free, anonymous, under 60 seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/leak?demo=1"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0a0a0a] text-[14px] font-semibold hover:opacity-85 transition-opacity"
            >
              Start an Investigation
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center px-7 py-3.5 rounded-full border border-[#2a2a2a] text-[#9ca3af] text-[14px] font-medium hover:border-[#4b4742] hover:text-white transition-colors"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}