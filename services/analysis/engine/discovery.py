from __future__ import annotations

import asyncio
import csv
import io
from pathlib import Path
import time
from typing import Callable, Iterable, Optional
from urllib.parse import urljoin, urlparse

import httpx
import imagehash
from bs4 import BeautifulSoup
from PIL import Image, UnidentifiedImageError

from .keypoints import compute_match_rate
from .models import DiscoveryMatch, DiscoveryRelatedDomain, DiscoveryResult

DATASET_PATH = Path(__file__).resolve().parents[2] / "intelligence" / "data" / "dataset.csv"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/123.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;"
        "q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8"
    ),
}
IMAGE_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
}
CONTENT_LINK_KEYWORDS = (
    "video",
    "watch",
    "clip",
    "mms",
    "gallery",
    "post",
    "scene",
    "episode",
)
DEMO_TARGET_DOMAINS = [
    "auntymaza.watch", "auntymaza.baby", "auntymaza.video",
    "antarvasna3.com", "antarvasnabf.com", "desikahani2.net",
    "desimms2.site", "desisex.site", "desitales2.com",
    "indianpornsites.net", "mydesixxx3.com", "thekamababa.com",
    "xxxvideoindian2.com", "mydesi.ltd", "mydesi.rent",
]
MAX_PAGES_PER_DOMAIN = 10
MAX_ASSETS_PER_PAGE = 24
MAX_IMAGE_BYTES = 3 * 1024 * 1024
DEMO_DISCOVERY_MODE = False
DEMO_MATCH_URLS = [
    "https://mydesi.ltd/exclusive-young-cute-slim-mallu-girl-teasing-nipples-2/",
    "https://fsiblog.pro/exclusive-young-cute-slim-mallu-girl-teasing-nipples-2/",
]
HTTP_TIMEOUT = 12
MAX_CONCURRENT = 12


def run_discovery_scan(
    case_id: str,
    suspicious_bytes: bytes,
    origin_domain: Optional[str] = None,
    progress_cb: Optional[Callable[[dict], None]] = None,
) -> DiscoveryResult:
    started_at = time.time()
    rows = _load_dataset_rows()

    if DEMO_DISCOVERY_MODE:
        return _build_demo_discovery_result(
            case_id=case_id,
            started_at=started_at,
            suspicious_bytes=suspicious_bytes,
            rows=rows,
        )

    try:
        result = asyncio.run(
            _async_discovery_scan(
                case_id=case_id,
                suspicious_bytes=suspicious_bytes,
                origin_domain=origin_domain,
                rows=rows,
                progress_cb=progress_cb,
            )
        )
        return result
    except Exception as exc:
        return DiscoveryResult(
            case_id=case_id,
            status="failed",
            started_at=started_at,
            finished_at=time.time(),
            direct_matches=[],
            related_domains=[],
            error=str(exc),
        )


async def _async_discovery_scan(
    case_id: str,
    suspicious_bytes: bytes,
    origin_domain: Optional[str],
    rows: list[dict[str, str]],
    progress_cb: Optional[Callable[[dict], None]],
) -> DiscoveryResult:
    started_at = time.time()
    prioritized_network = _find_network(origin_domain, rows) if origin_domain else None
    domains = _select_domains(rows)

    target_hashes = _compute_hashes(suspicious_bytes)
    direct_matches: list[DiscoveryMatch] = []
    matched_keys: set[tuple[str, str]] = set()
    events: list[dict] = []

    def emit_event(event_type: str, message: str, **kwargs):
        event = {
            "timestamp": time.time(),
            "type": event_type,
            "message": message,
            **kwargs,
        }
        events.append(event)
        if progress_cb:
            progress_cb({"event": event})

    limits = httpx.Limits(
        max_connections=MAX_CONCURRENT,
        max_keepalive_connections=5,
    )
    async with httpx.AsyncClient(
        headers=HEADERS,
        timeout=httpx.Timeout(HTTP_TIMEOUT),
        follow_redirects=True,
        limits=limits,
    ) as client:
        sem = asyncio.Semaphore(MAX_CONCURRENT)

        # Phase 1: Discover pages on all domains concurrently
        emit_event("info", "Discovering content pages across target domains...")
        page_discovery_tasks = [
            _discover_pages(sem, client, f"https://{row['domain']}", row["domain"])
            for row in domains
        ]
        page_results = await asyncio.gather(*page_discovery_tasks, return_exceptions=True)

        all_pages: list[tuple[dict[str, str], str]] = []
        for row, result in zip(domains, page_results):
            domain = row["domain"]
            if isinstance(result, Exception):
                emit_event("info", f"Scanning homepage only for {domain}", domain=domain)
                all_pages.append((row, f"https://{domain}"))
            else:
                emit_event("info", f"Found {len(result)} pages on {domain}", domain=domain)
                for page_url in result:
                    all_pages.append((row, page_url))

        # Phase 2: Scan all pages concurrently
        emit_event("info", f"Scanning {len(all_pages)} pages across all domains...")
        pages_scanned = 0
        candidates_evaluated = 0
        domains_scanned: set[str] = set()

        scan_tasks = [
            _scan_page(sem, client, page_url, row, suspicious_bytes, target_hashes)
            for row, page_url in all_pages
        ]

        # Process in chunks to stream progress
        chunk_size = max(1, len(scan_tasks) // 5)
        for i in range(0, len(scan_tasks), chunk_size):
            chunk = scan_tasks[i : i + chunk_size]
            chunk_results = await asyncio.gather(*chunk, return_exceptions=True)

            for result in chunk_results:
                if isinstance(result, Exception) or result is None:
                    continue
                page_matches, p_scanned, c_evaluated = result
                pages_scanned += p_scanned
                candidates_evaluated += c_evaluated

                for match in page_matches:
                    dedupe_key = (match.domain, match.image_url)
                    if dedupe_key in matched_keys:
                        continue
                    matched_keys.add(dedupe_key)
                    direct_matches.append(match)
                    domains_scanned.add(match.domain)

                    emit_event(
                        "match",
                        f"Found {match.match_type} match on {match.domain} ({match.confidence}%)",
                        domain=match.domain,
                        page_url=match.page_url,
                        image_url=match.image_url,
                        asset_type=match.asset_type,
                        match_type=match.match_type,
                        confidence=match.confidence,
                    )

            if progress_cb:
                progress_cb({
                    "pages_scanned": pages_scanned,
                    "candidates_evaluated": candidates_evaluated,
                    "events": events[-5:],
                })

    direct_matches.sort(key=lambda m: m.confidence, reverse=True)
    top_matches = direct_matches[:12]
    related_domains = _expand_related_domains(top_matches, rows)

    emit_event("info", f"Done. Found {len(top_matches)} matches across {len(domains_scanned)} domains.")

    return DiscoveryResult(
        case_id=case_id,
        status="completed",
        started_at=started_at,
        finished_at=time.time(),
        prioritized_network=prioritized_network,
        target_domains=[row["domain"] for row in domains],
        domains_scanned=len(domains_scanned),
        pages_scanned=pages_scanned,
        candidates_evaluated=candidates_evaluated,
        direct_matches=[m.model_dump() for m in top_matches],
        related_domains=[item.model_dump() for item in related_domains[:12]],
        recent_events=events,
    )


# ── Async helpers ─────────────────────────────────────────────────────────

async def _discover_pages(
    sem: asyncio.Semaphore,
    client: httpx.AsyncClient,
    domain_base: str,
    domain: str,
) -> list[str]:
    html = await _fetch_html(sem, client, domain_base)
    if not html:
        return [domain_base]

    pages = [domain_base]
    soup = BeautifulSoup(html, "html.parser")
    seen = {domain_base}
    base_host = urlparse(domain_base).netloc

    for anchor in soup.find_all("a", href=True):
        href = anchor.get("href", "")
        absolute = urljoin(domain_base, href)
        parsed = urlparse(absolute)
        if parsed.scheme not in {"http", "https"}:
            continue
        if parsed.netloc != base_host:
            continue
        candidate = absolute.split("#", 1)[0]
        if any(keyword in candidate.lower() for keyword in CONTENT_LINK_KEYWORDS) and candidate not in seen:
            pages.append(candidate)
            seen.add(candidate)
        if len(pages) >= MAX_PAGES_PER_DOMAIN:
            break

    return pages


async def _fetch_html(sem: asyncio.Semaphore, client: httpx.AsyncClient, url: str) -> Optional[str]:
    async with sem:
        try:
            response = await client.get(url)
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "text/html" not in content_type:
                return None
            return response.text
        except (httpx.HTTPError, httpx.TimeoutException):
            return None


async def _fetch_image(
    client: httpx.AsyncClient, url: str, sem: asyncio.Semaphore, referer: str = ""
) -> Optional[bytes]:
    async with sem:
        try:
            headers = dict(IMAGE_HEADERS)
            if referer:
                headers["Referer"] = referer
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            content_type = response.headers.get("content-type", "")
            if "image" not in content_type:
                return None
            if len(response.content) > MAX_IMAGE_BYTES:
                return None
            return response.content
        except (httpx.HTTPError, httpx.TimeoutException):
            return None


async def _scan_page(
    sem: asyncio.Semaphore,
    client: httpx.AsyncClient,
    page_url: str,
    row: dict[str, str],
    suspicious_bytes: bytes,
    target_hashes: dict,
) -> Optional[tuple[list[DiscoveryMatch], int, int]]:
    html = await _fetch_html(sem, client, page_url)
    if not html:
        return None

    domain = row["domain"]
    network = row.get("network") or None
    provider_type = row.get("provider_type") or None

    asset_urls = _extract_asset_urls(html, page_url)
    if not asset_urls:
        return ([], 1, 0)

    image_tasks = [
        _fetch_image(client, asset_url, sem, referer=page_url)
        for asset_url, _, _ in asset_urls[:MAX_ASSETS_PER_PAGE]
    ]
    image_results = await asyncio.gather(*image_tasks, return_exceptions=True)

    matches: list[DiscoveryMatch] = []
    for (asset_url, asset_type, video_page_url), image_bytes in zip(
        asset_urls[:MAX_ASSETS_PER_PAGE], image_results
    ):
        if image_bytes is None or isinstance(image_bytes, Exception):
            continue

        match = _match_candidate(
            suspicious_bytes=suspicious_bytes,
            target_hashes=target_hashes,
            candidate_bytes=image_bytes,
            domain=domain,
            network=network,
            provider_type=provider_type,
            page_url=video_page_url or page_url,
            image_url=asset_url,
            asset_type=asset_type,
        )
        if match:
            matches.append(match)

    return (matches, 1, len(asset_urls))


# ── Matching pipeline (3-tier) ────────────────────────────────────────────

def _compute_hashes(image_bytes: bytes) -> dict[str, imagehash.ImageHash]:
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return {
        "phash": imagehash.phash(image),
        "dhash": imagehash.dhash(image),
        "ahash": imagehash.average_hash(image),
    }


def _histogram_correlation(img1_bytes: bytes, img2_bytes: bytes) -> float:
    try:
        img1 = (
            Image.open(io.BytesIO(img1_bytes))
            .convert("RGB")
            .resize((256, 256))
        )
        img2 = (
            Image.open(io.BytesIO(img2_bytes))
            .convert("RGB")
            .resize((256, 256))
        )
        h1 = img1.histogram()
        h2 = img2.histogram()

        import numpy as np
        h1 = np.array(h1, dtype=np.float64)
        h2 = np.array(h2, dtype=np.float64)
        h1 = h1 / h1.sum()
        h2 = h2 / h2.sum()

        mean1 = h1.mean()
        mean2 = h2.mean()
        num = ((h1 - mean1) * (h2 - mean2)).sum()
        den = np.sqrt(((h1 - mean1) ** 2).sum() * ((h2 - mean2) ** 2).sum())
        if den == 0:
            return 0.0
        return max(0.0, round(float(num / den), 4))
    except Exception:
        return 0.0


def _match_candidate(
    suspicious_bytes: bytes,
    target_hashes: dict[str, imagehash.ImageHash],
    candidate_bytes: bytes,
    domain: str,
    network: Optional[str],
    provider_type: Optional[str],
    page_url: str,
    image_url: str,
    asset_type: str,
) -> Optional[DiscoveryMatch]:
    try:
        candidate_hashes = _compute_hashes(candidate_bytes)
    except (UnidentifiedImageError, OSError, ValueError):
        return None

    phash_distance = int(target_hashes["phash"] - candidate_hashes["phash"])
    dhash_distance = int(target_hashes["dhash"] - candidate_hashes["dhash"])
    ahash_distance = int(target_hashes["ahash"] - candidate_hashes["ahash"])
    avg_distance = (phash_distance + dhash_distance + ahash_distance) / 3

    # ── Tier 1: Perceptual hashing (instant, handles resize/compress) ──
    if avg_distance <= 4:
        hash_score = max(0.0, 1.0 - avg_distance / 16.0)
        confidence = round(hash_score * 100, 1)
        return DiscoveryMatch(
            domain=domain,
            network=network,
            provider_type=provider_type,
            page_url=page_url,
            image_url=image_url,
            asset_type=asset_type,
            confidence=min(confidence, 99.0),
            match_type="exact",
            phash_distance=phash_distance,
            dhash_distance=dhash_distance,
            ahash_distance=ahash_distance,
            ssim_score=0.0,
        )

    # ── Tier 2: ORB keypoint matching (~30ms, handles crops/watermarks) ──
    keypoint_matches, keypoint_match_rate = compute_match_rate(
        suspicious_bytes, candidate_bytes
    )

    if keypoint_match_rate >= 0.35:
        confidence = round(65.0 + min(keypoint_match_rate, 1.0) * 25.0, 1)
        return DiscoveryMatch(
            domain=domain,
            network=network,
            provider_type=provider_type,
            page_url=page_url,
            image_url=image_url,
            asset_type=asset_type,
            confidence=min(confidence, 95.0),
            match_type="structural",
            phash_distance=phash_distance,
            dhash_distance=dhash_distance,
            ahash_distance=ahash_distance,
            ssim_score=0.0,
            keypoint_matches=keypoint_matches,
            keypoint_match_rate=round(keypoint_match_rate, 4),
        )

    if keypoint_match_rate >= 0.20:
        hist_corr = _histogram_correlation(suspicious_bytes, candidate_bytes)
        confidence = round(40.0 + (keypoint_match_rate * 30.0) + (hist_corr * 15.0), 1)
        return DiscoveryMatch(
            domain=domain,
            network=network,
            provider_type=provider_type,
            page_url=page_url,
            image_url=image_url,
            asset_type=asset_type,
            confidence=min(confidence, 85.0),
            match_type="probable",
            phash_distance=phash_distance,
            dhash_distance=dhash_distance,
            ahash_distance=ahash_distance,
            ssim_score=0.0,
            keypoint_matches=keypoint_matches,
            keypoint_match_rate=round(keypoint_match_rate, 4),
            hist_correlation=round(hist_corr, 4),
        )

    return None


# ── Sync helpers (unchanged) ──────────────────────────────────────────────

def _build_demo_discovery_result(
    case_id: str,
    started_at: float,
    suspicious_bytes: Optional[bytes],
    rows: list[dict[str, str]],
) -> DiscoveryResult:
    import hashlib

    now = time.time()
    row_by_domain = {row.get("domain", "").lower(): row for row in rows}

    def meta(domain: str) -> tuple[Optional[str], Optional[str]]:
        record = row_by_domain.get(domain.lower())
        if not record:
            return None, None
        network = (record.get("network") or "").strip() or None
        provider_type = (record.get("provider_type") or "").strip() or None
        return network, provider_type

    # Determine match variant based on image hash
    demo_image_md5 = "b29cd9b87c7d40a5d150ce0d5498f94c"
    uploaded_md5 = hashlib.md5(suspicious_bytes).hexdigest() if suspicious_bytes else ""
    is_demo_image = uploaded_md5 == demo_image_md5

    # Cross-domain matches (all 3 use same CDN: files.ltdcdn.org)
    ltd_domains = [
        ("mydesi.ltd", "https://mydesi.ltd/hot-mallu-wife-hard-fucking-married-day/",
         "https://files.ltdcdn.org/upload/photos/2026/06/VPR5Dd5cNuexuJRsWkqi_24_187b1d093f0506dfd9bcfe9c59004907_image.jpg"),
        ("desii49.com", "https://desii49.com/hot-mallu-wife-hard-fucking-married-day/",
         "https://files.ltdcdn.org/upload/photos/2026/06/VPR5Dd5cNuexuJRsWkqi_24_187b1d093f0506dfd9bcfe9c59004907_image.jpg"),
        ("viralkand.app", "https://www.viralkand.app/hot-mallu-wife-hard-fucking-married-day/",
         "https://files.ltdcdn.org/upload/photos/2026/06/VPR5Dd5cNuexuJRsWkqi_24_187b1d093f0506dfd9bcfe9c59004907_image.jpg"),
    ]

    if is_demo_image:
        # Original image → exact matches on all 3 LtdNetwork domains
        match_type = "exact"
        confidence = 99.0
        phash = 0
        dhash = 0
        ahash = 0
        orb_rate = 0.0
        hist_corr = 0.0
    else:
        # Edited variant → ORB + histogram catches it
        match_type = "probable"
        confidence = 87.0
        phash = 22
        dhash = 18
        ahash = 15
        orb_rate = 0.35
        hist_corr = 0.72

    direct_matches = []
    for domain, page_url, image_url in ltd_domains:
        net, prov = meta(domain)
        direct_matches.append(
            DiscoveryMatch(
                domain=domain,
                network=net or "LtdNetwork",
                provider_type=prov or "external_cdn",
                page_url=page_url,
                image_url=image_url,
                asset_type="thumbnail",
                confidence=confidence,
                match_type=match_type,
                phash_distance=phash,
                dhash_distance=dhash,
                ahash_distance=ahash,
                ssim_score=0.0,
                keypoint_matches=38 if not is_demo_image else 0,
                keypoint_match_rate=round(orb_rate, 4),
                hist_correlation=round(hist_corr, 4),
            ).model_dump()
        )

    related_domains = [
        DiscoveryRelatedDomain(
            domain="mydesi.rent",
            network="LtdNetwork",
            provider_type="embedded_player",
            reason="Same LtdNetwork content-sharing group; likely additional mirror.",
        ).model_dump(),
        DiscoveryRelatedDomain(
            domain="mydesi2.bond",
            network="LtdNetwork",
            provider_type="api_stream",
            reason="Same operator; uses beacon.min.js streaming.",
        ).model_dump(),
    ]

    recent_events = [
        {
            "timestamp": started_at + 0.2,
            "type": "domain",
            "message": "Scanning mydesi.ltd...",
            "domain": "mydesi.ltd",
        },
        {
            "timestamp": started_at + 0.4,
            "type": "match",
            "message": f"Found {match_type} match on mydesi.ltd ({confidence}%)",
            "domain": "mydesi.ltd",
            "page_url": ltd_domains[0][1],
            "asset_type": "thumbnail",
            "match_type": match_type,
            "confidence": confidence,
        },
        {
            "timestamp": started_at + 0.6,
            "type": "domain",
            "message": "Scanning desii49.com...",
            "domain": "desii49.com",
        },
        {
            "timestamp": started_at + 0.8,
            "type": "match",
            "message": f"Found {match_type} match on desii49.com ({confidence}%)",
            "domain": "desii49.com",
            "page_url": ltd_domains[1][1],
            "asset_type": "thumbnail",
            "match_type": match_type,
            "confidence": confidence,
        },
        {
            "timestamp": started_at + 1.0,
            "type": "domain",
            "message": "Scanning viralkand.app...",
            "domain": "viralkand.app",
        },
        {
            "timestamp": started_at + 1.2,
            "type": "match",
            "message": f"Found {match_type} match on viralkand.app ({confidence}%)",
            "domain": "viralkand.app",
            "page_url": ltd_domains[2][1],
            "asset_type": "thumbnail",
            "match_type": match_type,
            "confidence": confidence,
        },
        {
            "timestamp": now,
            "type": "info",
            "message": f"Scan complete. Found {len(direct_matches)} matches across 3 LtdNetwork domains.",
        },
    ]

    return DiscoveryResult(
        case_id=case_id,
        status="completed",
        started_at=started_at,
        finished_at=now,
        prioritized_network="LtdNetwork",
        target_domains=[d[0] for d in ltd_domains],
        domains_scanned=3,
        pages_scanned=3,
        candidates_evaluated=9,
        direct_matches=direct_matches,
        related_domains=related_domains,
        recent_events=recent_events,
    )


def _load_dataset_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    try:
        with open(DATASET_PATH, newline="", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                domain = (row.get("domain") or "").strip().lower()
                if not domain:
                    continue
                provider_type = (row.get("provider_type") or "").strip().lower()
                if provider_type == "unknown":
                    continue
                if domain.endswith(".edu"):
                    continue
                rows.append({k: (v or "").strip() for k, v in row.items()})
    except FileNotFoundError:
        return []
    return rows


def _find_network(origin_domain: Optional[str], rows: Iterable[dict[str, str]]) -> Optional[str]:
    if not origin_domain:
        return None

    clean_domain = origin_domain.strip().lower()
    for row in rows:
        if row.get("domain", "").lower() == clean_domain:
            network = row.get("network") or ""
            return network if network and network != "UnknownNetwork" else None
    return None


def _select_domains(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    if DEMO_DISCOVERY_MODE:
        selected: list[dict[str, str]] = []
        by_domain = {row.get("domain", ""): row for row in rows}
        for domain in DEMO_TARGET_DOMAINS:
            row = by_domain.get(domain)
            if row is not None:
                selected.append(row)
                continue
            selected.append(
                {
                    "domain": domain,
                    "network": "DemoScope",
                    "provider_type": "manual_target",
                }
            )
        return selected
    # Real mode: use all domains from the dataset
    return rows[:]


def _extract_asset_urls(
    html: str, page_url: str
) -> list[tuple[str, str, Optional[str]]]:
    """
    Extract image URLs from a page.
    Returns list of (image_url, asset_type, video_page_url).
    If the image is inside an <a> tag, video_page_url is the anchor href.
    """
    soup = BeautifulSoup(html, "html.parser")
    assets: list[tuple[str, str, Optional[str]]] = []
    seen: set[str] = set()

    def add_asset(
        raw_url: Optional[str],
        asset_type: str,
        video_url: Optional[str] = None,
    ) -> None:
        if not raw_url:
            return
        full_url = urljoin(page_url, raw_url.strip())
        parsed = urlparse(full_url)
        if parsed.scheme not in {"http", "https"}:
            return
        if full_url in seen:
            return
        seen.add(full_url)
        full_video = urljoin(page_url, video_url.strip()) if video_url else page_url
        assets.append((full_url, asset_type, full_video))

    for tag in soup.find_all("meta"):
        prop = (tag.get("property") or tag.get("name") or "").lower()
        if prop in {"og:image", "twitter:image"}:
            add_asset(tag.get("content"), "meta_preview")

    for anchor in soup.find_all("a", href=True):
        parent_href = anchor.get("href", "")
        inner_img = anchor.find("img", src=True)
        if inner_img:
            add_asset(inner_img.get("src"), "thumbnail", parent_href)
            if len(assets) >= MAX_ASSETS_PER_PAGE:
                return assets
        inner_img_data = anchor.find("img", {"data-src": True})
        if inner_img_data:
            add_asset(inner_img_data.get("data-src"), "thumbnail", parent_href)
            if len(assets) >= MAX_ASSETS_PER_PAGE:
                return assets

    for image in soup.find_all("img", src=True):
        add_asset(image.get("src"), "thumbnail")
        if len(assets) >= MAX_ASSETS_PER_PAGE:
            return assets

    for image in soup.find_all("img", {"data-src": True}):
        add_asset(image.get("data-src"), "thumbnail")
        if len(assets) >= MAX_ASSETS_PER_PAGE:
            return assets

    for video in soup.find_all("video"):
        add_asset(video.get("poster"), "poster")
        if len(assets) >= MAX_ASSETS_PER_PAGE:
            return assets

    for anchor in soup.find_all("a", href=True):
        href = anchor.get("href", "")
        if any(href.lower().endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".webp")):
            add_asset(href, "thumbnail")
            if len(assets) >= MAX_ASSETS_PER_PAGE:
                return assets

    return assets


def _expand_related_domains(
    matches: list[DiscoveryMatch],
    rows: list[dict[str, str]],
) -> list[DiscoveryRelatedDomain]:
    related: list[DiscoveryRelatedDomain] = []
    seen: set[str] = {match.domain for match in matches}
    matched_networks = {
        match.network
        for match in matches
        if match.network and match.network != "UnknownNetwork"
    }

    for network in matched_networks:
        for row in rows:
            domain = row.get("domain", "")
            if row.get("network") != network or domain in seen:
                continue
            seen.add(domain)
            related.append(
                DiscoveryRelatedDomain(
                    domain=domain,
                    network=network,
                    provider_type=row.get("provider_type") or None,
                    reason="Same network as a visually matched domain; likely mirror or sister site.",
                )
            )

    return related