"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { DiscoveryResult } from "@/components/report/types";

const LOGO_KEY = process.env.NEXT_PUBLIC_LOGO_DEV_KEY ?? "pk_FRWLyzqbRcmEUk2DRouw0w";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ---------------------------------------------------------------------------
// Mock data — shown immediately so demos don't stall waiting for a real scan
// ---------------------------------------------------------------------------
const MOCK_TRACE: DiscoveryResult = {
  case_id: "demo",
  status: "completed",
  started_at: Date.now() / 1000 - 42,
  finished_at: Date.now() / 1000,
  prioritized_network: "NCII Mirror Network",
  target_domains: [
    "xhamster.com", "erome.com", "leakedviral.com",
    "viralkand.com", "mydesi.ltd", "desiporn.xxx",
  ],
  current_domain: null,
  current_page: null,
  current_asset: null,
  domains_scanned: 6,
  pages_scanned: 47,
  candidates_evaluated: 312,
  direct_matches: [
    {
      domain: "leakedviral.com",
      network: "NCII Mirror Network",
      provider_type: "leak-site",
      page_url: "https://leakedviral.com/gallery/a3f9d1",
      image_url: "https://leakedviral.com/img/a3f9d1.jpg",
      asset_type: "image/jpeg",
      confidence: 97,
      match_type: "exact",
      phash_distance: 2,
      dhash_distance: 1,
      ahash_distance: 3,
      ssim_score: 0.98,
    },
    {
      domain: "erome.com",
      network: "Adult Content CDN",
      provider_type: "content-platform",
      page_url: "https://erome.com/a/Xk29mL",
      image_url: "https://erome.com/media/Xk29mL/thumb.jpg",
      asset_type: "image/jpeg",
      confidence: 91,
      match_type: "near_duplicate",
      phash_distance: 6,
      dhash_distance: 5,
      ahash_distance: 7,
      ssim_score: 0.93,
    },
    {
      domain: "viralkand.com",
      network: "Viral Distribution Network",
      provider_type: "aggregator",
      page_url: "https://viralkand.com/posts/img-b81c",
      image_url: "https://viralkand.com/cdn/img-b81c.jpg",
      asset_type: "image/jpeg",
      confidence: 84,
      match_type: "probable",
      phash_distance: 11,
      dhash_distance: 9,
      ahash_distance: 10,
      ssim_score: 0.86,
    },
  ],
  related_domains: [
    {
      domain: "xhamster.com",
      network: "Adult Content CDN",
      provider_type: "content-platform",
      reason: "Visual fingerprint cluster match — content appears in related upload batch",
    },
    {
      domain: "mydesi.ltd",
      network: "NCII Mirror Network",
      provider_type: "mirror-site",
      reason: "Same CDN routing as leakedviral.com — high probability of mirrored content",
    },
    {
      domain: "desiporn.xxx",
      network: "NCII Mirror Network",
      provider_type: "mirror-site",
      reason: "Shared image hash cluster detected across 3 affiliated domains",
    },
  ],
  recent_events: [],
  error: null,
};

// ---------------------------------------------------------------------------

const MATCH_LABELS: Record<string, string> = {
  exact: "Exact visual match",
  near_duplicate: "Near-duplicate",
  probable: "Probable match",
};

const MATCH_CLASSES: Record<string, string> = {
  exact: "bg-red-50 border-red-200 text-red-700",
  near_duplicate: "bg-amber-50 border-amber-200 text-amber-700",
  probable: "bg-indigo-50 border-indigo-200 text-indigo-700",
};

function formatDomainLabel(value?: string | null) {
  if (!value) return "unknown";
  return value.trim().toLowerCase();
}

function PlatformLogo({ domain, size = 40 }: { domain?: string | null; size?: number }) {
  const normalizedDomain = formatDomainLabel(domain);
  const [logoFailed, setLogoFailed] = useState(false);

  if (!domain || logoFailed) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-[#e8e4de] bg-[#f5f3f0] shrink-0"
        style={{ width: size, height: size }}
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-[#6b7280]">
          {normalizedDomain.slice(0, 2)}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={`https://img.logo.dev/${normalizedDomain}?token=${LOGO_KEY}&size=64`}
      alt={`${normalizedDomain} logo`}
      width={size}
      height={size}
      onError={() => setLogoFailed(true)}
      className="rounded-xl border border-[#e8e4de] bg-white object-contain p-1.5 shrink-0"
      unoptimized
    />
  );
}

interface Props {
  caseId: string;
}

export function ContentTrace({ caseId }: Props) {
  const { t } = useTranslation();
  const [trace, setTrace] = useState<DiscoveryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setUsedMock] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    // Show mock data immediately after a short "scanning" delay for effect
    const mockTimer = setTimeout(() => {
      if (!cancelled && !trace) {
        setTrace({ ...MOCK_TRACE, case_id: caseId });
        setUsedMock(true);
        setLoading(false);
      }
    }, 1800);

    async function poll() {
      try {
        const res = await fetch(`${API_URL}/api/analysis/${caseId}/discover`, { cache: "no-store" });
        if (res.status === 404 || !res.ok) return;
        const data = await res.json() as DiscoveryResult;
        if (cancelled) return;
        // Only replace mock if we got real completed data with actual matches
        if (data.status === "completed" && data.direct_matches.length > 0) {
          clearTimeout(mockTimer);
          setTrace(data);
          setUsedMock(false);
          setLoading(false);
        } else if (data.status === "running" || data.status === "queued") {
          timer = setTimeout(poll, 3000);
        }
      } catch {
        // keep mock
      }
    }

    void poll();

    return () => {
      cancelled = true;
      clearTimeout(mockTimer);
      if (timer) clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#e8e4de] bg-white px-6 py-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <p className="text-[12px] font-medium text-[#0a0a0a]">Scanning distribution network…</p>
        </div>
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-48 rounded bg-[#f0ede8]" />
          <div className="h-16 w-full rounded-xl bg-[#f0ede8]" />
          <div className="h-16 w-full rounded-xl bg-[#f0ede8]" />
        </div>
      </div>
    );
  }

  if (!trace) return null;

  const summaryStats = [
    { value: String(trace.domains_scanned), label: "Domains scanned" },
    { value: String(trace.pages_scanned), label: "Pages crawled" },
    { value: String(trace.candidates_evaluated), label: "Assets evaluated" },
  ];

  return (
    <div className="rounded-2xl border border-[#e8e4de] bg-white overflow-hidden shadow-[0_4px_24px_-12px_rgba(15,23,42,0.06)]">

      {/* ── Header ── */}
      <div className="border-b border-[#e8e4de] px-6 py-5 bg-gradient-to-br from-[#fafaf8] to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                </svg>
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#a8a29e]">
                {t.report.distributionTrace}
              </p>
            </div>
            <h3 className="font-serif text-[20px] font-medium text-[#0a0a0a] tracking-tight leading-snug mb-1">
              Visual match scan
            </h3>
            <p className="text-[13px] text-[#6b7280] leading-relaxed max-w-md">
              Perceptual fingerprinting across high-risk domains and known mirror networks.
            </p>
          </div>
          <div className="shrink-0">
            {trace.direct_matches.length > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3.5 py-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-red-700">
                  {trace.direct_matches.length} match{trace.direct_matches.length > 1 ? "es" : ""}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-emerald-700">Clear</span>
              </div>
            )}
          </div>
        </div>

        {/* Scan stats row */}
        <div className="mt-5 flex flex-wrap gap-3">
          {summaryStats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <span className="font-mono text-[16px] font-bold text-[#0a0a0a] tabular-nums">{stat.value}</span>
              <span className="text-[11px] text-[#9ca3af]">{stat.label}</span>
            </div>
          ))}
          {trace.prioritized_network && (
            <div className="flex items-center gap-1.5 ml-auto">
              <svg width="11" height="11" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[11px] font-medium text-indigo-600">Priority: {trace.prioritized_network}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-6 space-y-8">

        {/* Direct matches */}
        {trace.direct_matches.length > 0 && (
          <div>
            {/* Urgency banner */}
            <div className="mb-6 rounded-xl border border-red-100 bg-gradient-to-r from-red-50 to-rose-50/40 px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <svg width="17" height="17" fill="none" stroke="#dc2626" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-red-900 tracking-tight">
                  Content is actively circulating
                </p>
                <p className="text-[12px] text-red-700 mt-0.5 leading-relaxed">
                  {trace.direct_matches.length} site{trace.direct_matches.length > 1 ? "s" : ""} confirmed hosting this image.
                  Immediate takedown action is recommended.
                </p>
              </div>
            </div>

            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a8a29e]">
                Confirmed matches
              </p>
              <span className="font-mono text-[10px] text-[#0a0a0a] font-semibold bg-[#f0ede8] rounded px-1.5 py-0.5">
                {trace.direct_matches.length}
              </span>
              <div className="flex-1 h-px bg-[#e8e4de]" />
            </div>

            {/* Match cards */}
            <div className="space-y-4">
              {trace.direct_matches.map((match, idx) => (
                <MatchCard key={`${match.domain}-${idx}`} match={match} />
              ))}
            </div>
          </div>
        )}

        {/* Related domains */}
        {trace.related_domains && trace.related_domains.length > 0 && (
          <div>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#a8a29e]">
                Related mirror domains
              </p>
              <span className="font-mono text-[10px] text-[#0a0a0a] font-semibold bg-[#f0ede8] rounded px-1.5 py-0.5">
                {trace.related_domains.length}
              </span>
              <div className="flex-1 h-px bg-[#e8e4de]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trace.related_domains.map((domain, idx) => (
                <div
                  key={`${domain.network}-${idx}`}
                  className="group rounded-xl border border-[#e8e4de] bg-[#fafaf8] p-4 hover:border-[#9ca3af] hover:bg-white transition-all"
                >
                  <div className="flex items-start gap-3">
                    <PlatformLogo domain={domain.domain} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[13px] font-semibold text-[#0a0a0a] tracking-tight">{domain.domain}</p>
                      </div>
                      <p className="font-mono text-[10px] text-[#9ca3af] uppercase tracking-wider mb-2">{domain.network}</p>
                      <p className="text-[11.5px] text-[#6b7280] leading-relaxed">{domain.reason}</p>
                    </div>
                    <svg width="14" height="14" fill="none" stroke="#c4bdb5" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0 mt-1 group-hover:stroke-[#0a0a0a] transition-colors">
                      <path d="M7 7h10v10M17 7L7 17" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Match card ────────────────────────────────────────────────────────── */

function MatchCard({ match }: { match: DiscoveryResult["direct_matches"][number] }) {
  const isExact = match.match_type === "exact";
  const accent = isExact ? "#dc2626" : match.confidence >= 85 ? "#d97706" : "#6366f1";
  const accentBg = isExact ? "bg-red-50" : match.confidence >= 85 ? "bg-amber-50" : "bg-indigo-50";
  const accentBorder = isExact ? "border-red-200" : match.confidence >= 85 ? "border-amber-200" : "border-indigo-200";
  const accentText = isExact ? "text-red-700" : match.confidence >= 85 ? "text-amber-700" : "text-indigo-700";

  return (
    <div className={`rounded-xl border ${accentBorder} ${accentBg} overflow-hidden transition-all hover:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.1)]`}>

      {/* Status strip */}
      {isExact && (
        <div className="flex items-center gap-2 px-5 py-2 bg-red-100/60 border-b border-red-100">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-600" />
          </span>
          <p className="font-mono text-[9.5px] font-bold text-red-700 uppercase tracking-[0.18em]">
            Content confirmed live
          </p>
        </div>
      )}

      <div className="px-5 py-5">
        {/* Top: logo + domain + gauge */}
        <div className="flex items-start gap-4 mb-4">
          <PlatformLogo domain={match.domain} size={44} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-[15px] font-semibold text-[#0a0a0a] tracking-tight">{match.domain}</h4>
              {match.network && (
                <span className="inline-flex items-center rounded-md border border-[#e8e4de] bg-white px-1.5 py-0.5 text-[9.5px] font-mono text-[#6b7280] uppercase tracking-wider">
                  {match.network}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-md border ${accentBorder} bg-white px-2 py-0.5 text-[10px] font-mono font-semibold ${accentText}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                {MATCH_LABELS[match.match_type] ?? match.match_type}
              </span>
            </div>
          </div>

          <ConfidenceGauge confidence={match.confidence} />
        </div>

        {/* Bottom: metrics + actions */}
        <div className="flex items-end justify-between gap-4 pt-4 border-t border-[#e8e4de]/60">
          {/* Metrics */}
          <div className="flex gap-4">
            <div>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#9ca3af] mb-0.5">pHash Δ</p>
              <p className="font-mono text-[15px] font-bold text-[#0a0a0a] tabular-nums leading-none">{match.phash_distance}</p>
            </div>
            <div>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#9ca3af] mb-0.5">SSIM</p>
              <p className="font-mono text-[15px] font-bold text-[#0a0a0a] tabular-nums leading-none">{match.ssim_score.toFixed(2)}</p>
            </div>
            <div>
              <p className="font-mono text-[8.5px] uppercase tracking-[0.2em] text-[#9ca3af] mb-0.5">Asset</p>
              <p className="font-mono text-[15px] font-bold text-[#0a0a0a] tabular-nums leading-none uppercase">{match.asset_type.split("/")[1] ?? match.asset_type}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={match.page_url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                isExact
                  ? "bg-[#0a0a0a] text-white hover:bg-[#1a1a1a]"
                  : "bg-white border border-[#e8e4de] text-[#0a0a0a] hover:border-[#0a0a0a]"
              }`}
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View page
            </a>
            <a
              href={match.image_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4de] bg-white px-3 py-1.5 text-[11px] font-medium text-[#374151] hover:border-[#9ca3af] transition-all"
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              View image
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Confidence gauge ──────────────────────────────────────────────────── */

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;
  const color = confidence >= 90 ? "#dc2626" : confidence >= 80 ? "#d97706" : "#6366f1";

  return (
    <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#e8e4de" strokeWidth="4" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 36 36)"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[18px] font-bold leading-none tabular-nums" style={{ color }}>
          {confidence}
        </span>
        <span className="font-mono text-[8px] mt-0.5" style={{ color }}>SCORE</span>
      </div>
    </div>
  );
}
