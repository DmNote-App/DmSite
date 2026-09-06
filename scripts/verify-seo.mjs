#!/usr/bin/env node
// SEO 검증 스크립트
// 사용법: node scripts/verify-seo.mjs http://127.0.0.1:4173 [--timeout=15000]
// 사이트맵의 대표 URL(https://dmnote.app)을 검증 origin으로 바꿔 요청하고
// 메타데이터, 리다이렉트, 404 계약을 점검한다. Node 18 이상 내장 기능만 쓴다

const PROD_ORIGIN = "https://dmnote.app";
const LOCALES = ["ko", "en"];
const MIN_SITEMAP_URLS = 80;
const MIN_DOCS_PER_LOCALE = 39;
const MAX_CONCURRENCY = 4;
const MAX_IMAGE_FETCHES = 24;
const DEFAULT_TIMEOUT_MS = 15000;
const USER_AGENT = "dmnote-seo-verify/1.0";
const OG_IMAGE_SIZE = { width: 256, height: 256 };
const HANGUL_RE = /[ㄱ-ㆎ가-힣]/;

const HOME_KO = {
  title: "DM NOTE - Custom Key Viewer",
  h1: "Custom Key Viewer",
  description: "실시간 입력 표시와 자유로운 커스터마이징을 지원하는 키뷰어입니다.",
};
const HOME_EN = {
  description: "A key viewer with real-time input display and full customization.",
};

const REDIRECT_CASES = [
  { path: "/ko/", status: 308, target: "/" },
  {
    path: "/ko/docs/api-reference/index/",
    status: 308,
    target: "/ko/docs/api-reference/",
  },
  {
    path: "/en/docs/api-reference/index/",
    status: 308,
    target: "/en/docs/api-reference/",
  },
  {
    path: "/docs/guide/installation/",
    status: 307,
    target: "/ko/docs/guide/installation/",
    acceptLanguage: "ko",
  },
  {
    path: "/docs/guide/installation/",
    status: 307,
    target: "/en/docs/guide/installation/",
    acceptLanguage: "en",
  },
  {
    path: "/docs/guide/installation/",
    status: 307,
    target: "/en/docs/guide/installation/",
    acceptLanguage: "ko",
    cookie: "NEXT_LOCALE=en",
  },
  {
    path: "/docs/guide/installation/",
    status: 307,
    target: "/ko/docs/guide/installation/",
    acceptLanguage: "en",
    cookie: "NEXT_LOCALE=ko",
  },
  {
    path: "/docs/guide/installation/?from=seo",
    status: 307,
    target: "/en/docs/guide/installation/?from=seo",
    acceptLanguage: "en",
    cookie: "NEXT_LOCALE=invalid",
  },
  { path: "/ko/?from=seo", status: 308, target: "/?from=seo" },
];

const NOT_FOUND_PATHS = [
  "/en/docs/not-a-real-document/",
  "/fr/docs/",
  "/definitely-not-a-page/",
];

// ---------- 결과 수집 ----------

class Report {
  constructor() {
    this.failures = [];
    this.warnings = [];
    this.checks = 0;
  }

  scope(name) {
    const report = this;
    return {
      expect(condition, message) {
        report.checks += 1;
        if (!condition) report.failures.push({ scope: name, message });
        return Boolean(condition);
      },
      fail(message) {
        report.checks += 1;
        report.failures.push({ scope: name, message });
      },
      warn(message) {
        report.warnings.push({ scope: name, message });
      },
    };
  }
}

// ---------- 문자열 유틸 ----------

// 자주 쓰는 이름 참조의 코드 포인트
const NAMED_ENTITY_CODES = {
  amp: 0x26,
  lt: 0x3c,
  gt: 0x3e,
  quot: 0x22,
  apos: 0x27,
  nbsp: 0xa0,
  copy: 0xa9,
  reg: 0xae,
  trade: 0x2122,
  hellip: 0x2026,
  mdash: 0x2014,
  ndash: 0x2013,
  laquo: 0xab,
  raquo: 0xbb,
  middot: 0xb7,
  bull: 0x2022,
  lsquo: 0x2018,
  rsquo: 0x2019,
  ldquo: 0x201c,
  rdquo: 0x201d,
};

// XML/HTML 공통 entity 해제. 숫자 참조와 자주 쓰는 이름 참조를 처리한다
function decodeEntities(text) {
  if (!text || !text.includes("&")) return text;
  return text.replace(
    /&(#x[0-9a-f]+|#[0-9]+|[a-z][a-z0-9]*);/gi,
    (match, body) => {
      let code;
      if (body[0] === "#") {
        const hex = body[1] === "x" || body[1] === "X";
        code = hex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      } else {
        code = NAMED_ENTITY_CODES[body.toLowerCase()];
      }
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    },
  );
}

function normalizeWs(text) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function clip(text, max = 120) {
  const value = normalizeWs(text);
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

function unique(values) {
  return [...new Set(values)];
}

function primaryLang(value) {
  return normalizeWs(value).toLowerCase().split(/[-_]/)[0];
}

// ---------- HTML 파싱 ----------

// 속성 순서와 따옴표 종류에 관계없이 이름/값 쌍을 읽는다
function parseAttributes(raw) {
  const attrs = {};
  const re =
    /([^\s"'<>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;
  while ((match = re.exec(raw))) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (!(name in attrs)) attrs[name] = decodeEntities(value);
  }
  return attrs;
}

// 시작 태그를 찾아 속성과 태그 끝 위치를 돌려준다. 따옴표 안의 > 는 무시한다
function scanTags(html, tagName) {
  const found = [];
  const open = new RegExp(`<${tagName}(?=[\\s/>])`, "gi");
  let match;
  while ((match = open.exec(html))) {
    const attrStart = match.index + match[0].length;
    let i = attrStart;
    let quote = null;
    while (i < html.length) {
      const ch = html[i];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ">") {
        break;
      }
      i += 1;
    }
    found.push({ attrs: parseAttributes(html.slice(attrStart, i)), end: i + 1 });
    open.lastIndex = i + 1;
  }
  return found;
}

// 시작 태그부터 닫는 태그까지의 텍스트만 뽑는다. 내부 태그는 공백으로 바꾼다
function innerTexts(html, tagName) {
  return scanTags(html, tagName).map((tag) => {
    const close = new RegExp(`</${tagName}\\s*>`, "gi");
    close.lastIndex = tag.end;
    const closing = close.exec(html);
    const raw = closing ? html.slice(tag.end, closing.index) : "";
    return normalizeWs(decodeEntities(raw.replace(/<[^>]*>/g, " ")));
  });
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = parseAttributes(match[1]);
    if (normalizeWs(attrs.type).toLowerCase() === "application/ld+json") {
      blocks.push(match[2]);
    }
  }
  return blocks;
}

// 주석, 스크립트, 스타일, svg 안의 가짜 태그가 검사에 섞이지 않게 걷어낸다
function stripBlocks(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg\s*>/gi, " ")
    .replace(/<template\b[^>]*>[\s\S]*?<\/template\s*>/gi, " ");
}

function parsePage(html) {
  const jsonLd = extractJsonLd(html);
  const doc = stripBlocks(html);
  return {
    jsonLd,
    htmlTags: scanTags(doc, "html"),
    metas: scanTags(doc, "meta").map((tag) => tag.attrs),
    links: scanTags(doc, "link").map((tag) => tag.attrs),
    anchors: scanTags(doc, "a").map((tag) => tag.attrs),
    titles: innerTexts(doc, "title"),
    h1s: innerTexts(doc, "h1"),
  };
}

// name 또는 property가 key인 meta의 content 목록
function metaValues(metas, key) {
  const wanted = key.toLowerCase();
  return metas
    .filter(
      (meta) =>
        normalizeWs(meta.name).toLowerCase() === wanted ||
        normalizeWs(meta.property).toLowerCase() === wanted,
    )
    .map((meta) => normalizeWs(meta.content));
}

function relTokens(link) {
  return normalizeWs(link.rel).toLowerCase().split(" ").filter(Boolean);
}

function linkHrefs(links, relToken) {
  return links
    .filter((link) => relTokens(link).includes(relToken))
    .map((link) => normalizeWs(link.href));
}

function robotsTokens(value) {
  return normalizeWs(value)
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
}

function hasNoindex(headers, metas) {
  const headerTokens = robotsTokens(headers.get("x-robots-tag") ?? "");
  if (headerTokens.includes("noindex") || headerTokens.includes("none")) {
    return true;
  }
  const contents = [
    ...metaValues(metas, "robots"),
    ...metaValues(metas, "googlebot"),
  ];
  return contents.some((content) => {
    const tokens = robotsTokens(content);
    return tokens.includes("noindex") || tokens.includes("none");
  });
}

// 최상위 노드와 @graph 항목의 @type을 모은다
function collectJsonLdTypes(blocks, scope) {
  const types = new Set();
  blocks.forEach((raw, index) => {
    let data;
    try {
      data = JSON.parse(raw.trim());
    } catch (error) {
      scope.fail(`JSON-LD ${index + 1}번 파싱 실패: ${error.message}`);
      return;
    }
    const nodes = [];
    const visit = (node) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
      } else if (node && typeof node === "object") {
        nodes.push(node);
        if (Array.isArray(node["@graph"])) node["@graph"].forEach(visit);
      }
    };
    visit(data);
    for (const node of nodes) {
      const type = node["@type"];
      if (typeof type === "string") types.add(type);
      else if (Array.isArray(type)) {
        type.forEach((t) => typeof t === "string" && types.add(t));
      }
    }
  });
  return types;
}

// ---------- PNG ----------

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function hasPngSignature(bytes) {
  if (bytes.length < PNG_SIGNATURE.length) return false;
  return PNG_SIGNATURE.every((byte, i) => bytes[i] === byte);
}

function readPngSize(bytes) {
  if (bytes.length < 24) return null;
  const chunkType = String.fromCharCode(...bytes.subarray(12, 16));
  if (chunkType !== "IHDR") return null;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

// ---------- 네트워크 ----------

function describeError(error, timeout) {
  if (error?.name === "TimeoutError" || error?.name === "AbortError") {
    return `타임아웃 ${timeout}ms 초과`;
  }
  const cause = error?.cause;
  if (cause?.code) return cause.code;
  return error?.message || String(error);
}

function toLocal(url, localOrigin) {
  if (url === PROD_ORIGIN || url.startsWith(`${PROD_ORIGIN}/`)) {
    return localOrigin + url.slice(PROD_ORIGIN.length);
  }
  if (url === localOrigin || url.startsWith(`${localOrigin}/`)) return url;
  return null;
}

function buildHeaders(extra = {}) {
  return {
    "user-agent": USER_AGENT,
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    ...extra,
  };
}

// 리다이렉트를 따라가지 않고 본문을 텍스트로 읽는다
async function fetchText(url, ctx, headers = {}) {
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: buildHeaders(headers),
      signal: AbortSignal.timeout(ctx.timeout),
    });
    const body = await res.text();
    return { ok: true, status: res.status, headers: res.headers, body };
  } catch (error) {
    return { ok: false, error: describeError(error, ctx.timeout) };
  }
}

async function fetchBytes(url, ctx) {
  try {
    const res = await fetch(url, {
      redirect: "manual",
      headers: buildHeaders({ accept: "image/png,image/*;q=0.8,*/*;q=0.5" }),
      signal: AbortSignal.timeout(ctx.timeout),
    });
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { ok: true, status: res.status, headers: res.headers, bytes };
  } catch (error) {
    return { ok: false, error: describeError(error, ctx.timeout) };
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index], index);
    }
  };
  const size = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

// ---------- 사이트맵 ----------

function parseSitemap(xml) {
  const locs = [];
  const re = /<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/gi;
  let match;
  while ((match = re.exec(xml))) {
    const raw = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
    locs.push(decodeEntities(raw).trim());
  }
  return { isIndex: /<sitemapindex\b/i.test(xml), locs };
}

async function loadSitemapLocs(ctx) {
  const scope = ctx.report.scope(`${PROD_ORIGIN}/sitemap.xml`);
  const res = await fetchText(`${ctx.localOrigin}/sitemap.xml`, ctx);
  if (!res.ok) {
    scope.fail(`요청 실패: ${res.error}`);
    return null;
  }
  if (!scope.expect(res.status === 200, `상태 ${res.status}, 기대 200`)) {
    return null;
  }
  const contentType = res.headers.get("content-type") ?? "";
  scope.expect(/xml/i.test(contentType), `Content-Type "${contentType}", XML 기대`);

  const parsed = parseSitemap(res.body);
  if (!parsed.isIndex) {
    scope.expect(/<urlset\b/i.test(res.body), "urlset 요소 없음");
    return parsed.locs;
  }

  // 사이트맵 인덱스면 같은 origin의 하위 사이트맵만 읽는다
  const nested = await mapLimit(parsed.locs, MAX_CONCURRENCY, async (child) => {
    const local = toLocal(child, ctx.localOrigin);
    if (!local) {
      scope.fail(`외부 하위 사이트맵은 읽지 않음: ${child}`);
      return [];
    }
    const childRes = await fetchText(local, ctx);
    if (!childRes.ok || childRes.status !== 200) {
      const why = childRes.ok ? `상태 ${childRes.status}` : childRes.error;
      scope.fail(`하위 사이트맵 ${child} 실패: ${why}`);
      return [];
    }
    return parseSitemap(childRes.body).locs;
  });
  return nested.flat();
}

// 사이트맵 URL을 홈/문서로 분류하고 허용되지 않는 형태를 걸러낸다
function classifySitemapUrl(loc) {
  const invalid = (reason) => ({ kind: "invalid", reason });
  let url;
  try {
    url = new URL(loc);
  } catch {
    return invalid("URL 파싱 실패");
  }
  if (url.origin !== PROD_ORIGIN) return invalid("production origin 아님");
  if (url.search || url.hash) return invalid("쿼리 또는 해시 포함");

  const path = url.pathname;
  if (path === "/") return { kind: "home", lang: "ko" };
  if (path === "/en/") return { kind: "home", lang: "en" };
  if (path === "/ko/" || path === "/ko") return invalid("/ko/ 홈 별칭");
  if (path === "/en") return invalid("trailing slash 없음");
  if (path === "/docs" || path.startsWith("/docs/")) {
    return invalid("언어 없는 문서 URL");
  }

  const match = path.match(/^\/(ko|en)\/docs(?:\/(.*))?$/);
  if (!match) return invalid("허용되지 않는 경로");
  if (match[2] === undefined || !path.endsWith("/")) {
    return invalid("trailing slash 없음");
  }
  const docPath = match[2];
  const segments = docPath.split("/").filter(Boolean);
  if (segments.includes("index")) return invalid("index 별칭");
  return { kind: "doc", lang: match[1], docPath };
}

function alternatesFor(entry) {
  if (entry.kind === "home") {
    return { ko: `${PROD_ORIGIN}/`, en: `${PROD_ORIGIN}/en/` };
  }
  return {
    ko: `${PROD_ORIGIN}/ko/docs/${entry.docPath}`,
    en: `${PROD_ORIGIN}/en/docs/${entry.docPath}`,
  };
}

function buildEntries(locs, report) {
  const scope = report.scope(`${PROD_ORIGIN}/sitemap.xml`);
  const seen = new Set();
  const entries = [];
  const homes = new Set();
  const docs = { ko: new Set(), en: new Set() };

  for (const loc of locs) {
    if (seen.has(loc)) {
      scope.fail(`중복 URL: ${loc}`);
      continue;
    }
    seen.add(loc);
    const info = classifySitemapUrl(loc);
    if (info.kind === "invalid") {
      scope.fail(`${info.reason}: ${loc}`);
      continue;
    }
    if (info.kind === "home") homes.add(info.lang);
    else docs[info.lang].add(info.docPath);
    const entry = { prodUrl: loc, ...info };
    entry.alternates = alternatesFor(entry);
    entries.push(entry);
  }

  for (const lang of LOCALES) {
    scope.expect(homes.has(lang), `${lang} 홈 URL 없음`);
    scope.expect(
      docs[lang].size >= MIN_DOCS_PER_LOCALE,
      `${lang} 문서 ${docs[lang].size}개, 최소 ${MIN_DOCS_PER_LOCALE}개 기대`,
    );
  }
  scope.expect(
    seen.size >= MIN_SITEMAP_URLS,
    `URL ${seen.size}개, 최소 ${MIN_SITEMAP_URLS}개 기대`,
  );
  for (const docPath of docs.ko) {
    if (!docs.en.has(docPath)) scope.fail(`en 대응 문서 없음: /ko/docs/${docPath}`);
  }
  for (const docPath of docs.en) {
    if (!docs.ko.has(docPath)) scope.fail(`ko 대응 문서 없음: /en/docs/${docPath}`);
  }

  return {
    entries,
    counts: {
      total: seen.size,
      homes: homes.size,
      ko: docs.ko.size,
      en: docs.en.size,
    },
  };
}

// ---------- 페이지 검사 ----------

// 정확히 하나여야 하는 태그를 확인하고 첫 값을 돌려준다
function expectSingle(scope, label, values) {
  if (values.length === 0) {
    scope.fail(`${label} 없음`);
    return { value: "", present: false };
  }
  if (values.length > 1) scope.fail(`${label} ${values.length}개 중복`);
  else scope.expect(true, "");
  return { value: values[0], present: true };
}

function checkAnchors(scope, anchors, entry, ctx) {
  const problems = new Map();
  for (const anchor of anchors) {
    const href = normalizeWs(anchor.href);
    if (!href || href.startsWith("#")) continue;
    if (/^(mailto|tel|javascript|data):/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, entry.prodUrl);
    } catch {
      continue;
    }
    if (url.origin !== PROD_ORIGIN && url.origin !== ctx.localOrigin) continue;

    const path = url.pathname;
    let problem = null;
    let severity = entry.kind === "doc" ? "fail" : "warn";
    if (path === "/docs" || path.startsWith("/docs/")) {
      problem = "언어 없는 문서 링크";
    } else if (/^\/(ko|en)\/docs\/(?:.*\/)?index\/?$/.test(path)) {
      problem = "index 별칭 링크";
    } else if (path === "/ko/" || path === "/ko") {
      problem = "/ko/ 홈 별칭 링크";
      severity = "warn";
    }
    if (!problem) continue;
    const key = `${severity} ${problem}: ${href}`;
    const found = problems.get(key) ?? {
      severity,
      message: `${problem}: ${href}`,
      count: 0,
    };
    found.count += 1;
    problems.set(key, found);
  }

  for (const { severity, message, count } of problems.values()) {
    const text = count > 1 ? `${message} (${count}회)` : message;
    if (severity === "fail") scope.fail(text);
    else scope.warn(text);
  }
}

function checkImageRefs(scope, label, values) {
  const absolute = [];
  for (const value of values) {
    if (!/^https?:\/\//i.test(value)) {
      scope.fail(`${label} 절대 URL 아님: "${clip(value)}"`);
      continue;
    }
    absolute.push(value);
  }
  return absolute;
}

function checkSiteShell(page, html, scope) {
  scope.expect(html.includes("GTM-K8GL2GC9"), "GTM 태그 없음");
  scope.expect(
    metaValues(page.metas, "naver-site-verification").length === 1,
    "네이버 소유 확인 태그 없음 또는 중복",
  );
  scope.expect(
    page.links.some((link) => relTokens(link).includes("stylesheet")),
    "공통 스타일시트 없음",
  );
}

async function checkPage(entry, ctx, headers = {}) {
  const suffix = Object.keys(headers).length ? " (다른 언어 설정)" : "";
  const scope = ctx.report.scope(entry.prodUrl + suffix);
  const empty = { images: [] };
  const res = await fetchText(toLocal(entry.prodUrl, ctx.localOrigin), ctx, headers);
  if (!res.ok) {
    scope.fail(`요청 실패: ${res.error}`);
    return empty;
  }
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location") ?? "없음";
    scope.fail(`리다이렉트 ${res.status}, Location ${location}`);
    return empty;
  }
  if (!scope.expect(res.status === 200, `상태 ${res.status}, 기대 200`)) {
    return empty;
  }
  const contentType = res.headers.get("content-type") ?? "";
  scope.expect(
    /text\/html/i.test(contentType),
    `Content-Type "${contentType}", text/html 기대`,
  );

  const page = parsePage(res.body);
  checkSiteShell(page, res.body, scope);
  scope.expect(
    page.links.some((link) => relTokens(link).includes("preload") && link.as === "font"),
    "공통 폰트 preload 없음",
  );

  // html lang
  scope.expect(page.htmlTags.length === 1, `html 태그 ${page.htmlTags.length}개`);
  const lang = normalizeWs(page.htmlTags[0]?.attrs.lang);
  scope.expect(
    primaryLang(lang) === entry.lang,
    `html lang "${lang}", 기대 ${entry.lang}`,
  );

  // title, description, canonical
  const title = expectSingle(scope, "title", page.titles);
  if (title.present) {
    scope.expect(title.value.length > 0, "title 비어 있음");
    scope.expect(
      title.value.toLowerCase().includes("dm note"),
      `title에 DM NOTE 없음: "${clip(title.value)}"`,
    );
  }

  const description = expectSingle(
    scope,
    "description 메타",
    metaValues(page.metas, "description"),
  );
  if (description.present) {
    scope.expect(description.value.length > 0, "description 비어 있음");
  }

  const canonical = expectSingle(
    scope,
    "canonical 링크",
    linkHrefs(page.links, "canonical"),
  );
  if (canonical.present) {
    scope.expect(
      canonical.value === entry.prodUrl,
      `canonical "${canonical.value}", 기대 ${entry.prodUrl}`,
    );
  }

  // hreflang
  const alternates = page.links.filter(
    (link) => relTokens(link).includes("alternate") && link.hreflang !== undefined,
  );
  for (const locale of LOCALES) {
    const tags = alternates.filter(
      (link) => normalizeWs(link.hreflang).toLowerCase() === locale,
    );
    const hrefs = unique(tags.map((link) => normalizeWs(link.href)));
    const expected = entry.alternates[locale];
    if (hrefs.length === 0) {
      scope.fail(`hreflang ${locale} 링크 없음`);
    } else if (hrefs.length > 1) {
      scope.fail(`hreflang ${locale} 값이 서로 다름: ${hrefs.join(", ")}`);
    } else {
      if (tags.length > 1) scope.warn(`hreflang ${locale} 링크 ${tags.length}개 중복`);
      scope.expect(
        hrefs[0] === expected,
        `hreflang ${locale} "${hrefs[0]}", 기대 ${expected}`,
      );
    }
  }

  const defaultLanguage = expectSingle(
    scope,
    "hreflang x-default",
    alternates.filter((link) => link.hreflang === "x-default").map((link) => link.href),
  );
  if (defaultLanguage.present) {
    scope.expect(
      defaultLanguage.value === entry.alternates.ko,
      `x-default "${defaultLanguage.value}", 기대 ${entry.alternates.ko}`,
    );
  }

  // Open Graph
  const og = {};
  for (const key of ["title", "description", "url", "site_name", "type", "locale"]) {
    og[key] = expectSingle(scope, `og:${key}`, metaValues(page.metas, `og:${key}`));
    if (og[key].present) {
      scope.expect(og[key].value.length > 0, `og:${key} 비어 있음`);
    }
  }
  const ogImages = metaValues(page.metas, "og:image");
  scope.expect(
    ogImages.length === 1 && ogImages[0] === `${PROD_ORIGIN}/share-logo.png`,
    "og:image는 사이트 로고 하나여야 함",
  );
  if (og.url.present) {
    const expectedUrl = canonical.present ? canonical.value : entry.prodUrl;
    scope.expect(
      og.url.value === expectedUrl,
      `og:url "${og.url.value}"이 canonical과 다름`,
    );
  }
  if (og.title.present && title.present) {
    scope.expect(
      og.title.value === title.value,
      `og:title "${clip(og.title.value)}"이 title과 다름`,
    );
  }
  if (og.description.present && description.present) {
    scope.expect(
      og.description.value === description.value,
      `og:description "${clip(og.description.value)}"이 description과 다름`,
    );
  }
  if (og.locale.present) {
    scope.expect(
      primaryLang(og.locale.value) === entry.lang,
      `og:locale "${og.locale.value}", 언어 ${entry.lang} 기대`,
    );
  }

  // Twitter
  const twitterCard = expectSingle(
    scope,
    "twitter:card",
    metaValues(page.metas, "twitter:card"),
  );
  if (twitterCard.present) {
    scope.expect(
      twitterCard.value === "summary",
      `twitter:card "${twitterCard.value}", summary 기대`,
    );
  }
  const twitterTitle = expectSingle(
    scope,
    "twitter:title",
    metaValues(page.metas, "twitter:title"),
  );
  if (twitterTitle.present && title.present) {
    scope.expect(
      twitterTitle.value === title.value,
      `twitter:title "${clip(twitterTitle.value)}"이 title과 다름`,
    );
  }
  const twitterDescription = expectSingle(
    scope,
    "twitter:description",
    metaValues(page.metas, "twitter:description"),
  );
  if (twitterDescription.present && description.present) {
    scope.expect(
      twitterDescription.value === description.value,
      `twitter:description "${clip(twitterDescription.value)}"이 description과 다름`,
    );
  }
  const twitterImages = metaValues(page.metas, "twitter:image");
  scope.expect(
    twitterImages.length === 1 && twitterImages[0] === `${PROD_ORIGIN}/share-logo.png`,
    "twitter:image는 사이트 로고 하나여야 함",
  );

  const images = [
    ...checkImageRefs(scope, "og:image", ogImages),
    ...checkImageRefs(scope, "twitter:image", twitterImages),
  ];

  // 내부 링크
  checkAnchors(scope, page.anchors, entry, ctx);

  // JSON-LD
  const types = collectJsonLdTypes(page.jsonLd, scope);
  if (entry.kind === "home") {
    scope.expect(types.has("SoftwareApplication"), "JSON-LD SoftwareApplication 없음");
    scope.expect(types.has("WebSite"), "JSON-LD WebSite 없음");
  } else {
    scope.expect(types.has("BreadcrumbList"), "JSON-LD BreadcrumbList 없음");
    scope.expect(
      !types.has("SoftwareApplication"),
      "문서에 JSON-LD SoftwareApplication 있음",
    );
  }

  // 홈 전용
  if (entry.kind === "home" && entry.lang === "ko") {
    if (title.present) {
      scope.expect(
        title.value.includes(HOME_KO.title),
        `title "${clip(title.value)}"에 "${HOME_KO.title}" 없음`,
      );
    }
    if (description.present) {
      scope.expect(
        description.value.includes(HOME_KO.description),
        `description에 한국어 소개 문장 없음: "${clip(description.value)}"`,
      );
    }
    const h1Text = clip(page.h1s.join(" | ")) || "H1 없음";
    scope.expect(
      page.h1s.some((h1) => h1.includes(HOME_KO.h1)),
      `H1에 "${HOME_KO.h1}" 없음: "${h1Text}"`,
    );
  }
  if (entry.kind === "home" && entry.lang === "en" && description.present) {
    scope.expect(
      description.value.includes(HOME_EN.description),
      `description에 영어 소개 문장 없음: "${clip(description.value)}"`,
    );
    scope.expect(
      !HANGUL_RE.test(description.value),
      `영어 홈 description에 한글 포함: "${clip(description.value)}"`,
    );
  }

  return { images };
}

// ---------- 이미지 검사 ----------

async function checkImage(url, ctx) {
  const scope = ctx.report.scope(url);
  const local = toLocal(url, ctx.localOrigin);
  if (!local) {
    scope.fail("production origin이 아닌 이미지 주소, 요청하지 않음");
    return;
  }
  const res = await fetchBytes(local, ctx);
  if (!res.ok) {
    scope.fail(`요청 실패: ${res.error}`);
    return;
  }
  if (!scope.expect(res.status === 200, `상태 ${res.status}, 기대 200`)) return;
  const contentType = res.headers.get("content-type") ?? "";
  scope.expect(
    /^image\/png\b/i.test(contentType.trim()),
    `Content-Type "${contentType}", image/png 기대`,
  );
  if (!scope.expect(hasPngSignature(res.bytes), "PNG 시그니처 아님")) return;
  const size = readPngSize(res.bytes);
  if (!scope.expect(size !== null, "PNG IHDR 청크 없음")) return;
  scope.expect(
    size.width === OG_IMAGE_SIZE.width && size.height === OG_IMAGE_SIZE.height,
    `크기 ${size.width}x${size.height}, 기대 ${OG_IMAGE_SIZE.width}x${OG_IMAGE_SIZE.height}`,
  );
}

// ---------- 리다이렉트와 404 ----------

async function checkRedirect(testCase, ctx) {
  const languageLabel = testCase.acceptLanguage
    ? `${testCase.path} (Accept-Language: ${testCase.acceptLanguage})`
    : testCase.path;
  const label = languageLabel + (testCase.cookie ? ` (Cookie: ${testCase.cookie})` : "");
  const scope = ctx.report.scope(label);
  const requestUrl = ctx.localOrigin + testCase.path;
  const headers = testCase.acceptLanguage
    ? { "accept-language": testCase.acceptLanguage }
    : {};
  if (testCase.cookie) headers.cookie = testCase.cookie;
  const res = await fetchText(requestUrl, ctx, headers);
  if (!res.ok) {
    scope.fail(`요청 실패: ${res.error}`);
    return;
  }
  scope.expect(
    res.status === testCase.status,
    `상태 ${res.status}, 기대 ${testCase.status}`,
  );
  if (testCase.status === 307) {
    const cacheControl = res.headers.get("cache-control") ?? "";
    const directives = cacheControl.toLowerCase().split(",").map((value) => value.trim());
    scope.expect(
      directives.includes("private") && directives.includes("no-store"),
      `언어 감지 리다이렉트 캐시 설정 "${cacheControl}", private, no-store 기대`,
    );
  }
  const location = res.headers.get("location");
  if (!location) {
    scope.fail("Location 헤더 없음");
    return;
  }
  let target;
  try {
    target = new URL(location, requestUrl);
  } catch {
    scope.fail(`Location 파싱 실패: ${location}`);
    return;
  }
  const originOk =
    target.origin === ctx.localOrigin || target.origin === PROD_ORIGIN;
  const pathOk = target.pathname + target.search === testCase.target;
  scope.expect(
    originOk && pathOk,
    `Location "${location}", 기대 경로 ${testCase.target}`,
  );
}

async function checkNotFound(path, ctx) {
  const scope = ctx.report.scope(path);
  const res = await fetchText(ctx.localOrigin + path, ctx);
  if (!res.ok) {
    scope.fail(`요청 실패: ${res.error}`);
    return;
  }
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location") ?? "없음";
    scope.fail(`리다이렉트 ${res.status}, Location ${location}, 기대 404`);
    return;
  }
  scope.expect(res.status === 404, `상태 ${res.status}, 기대 404`);
  const page = parsePage(res.body);
  scope.expect(hasNoindex(res.headers, page.metas), "noindex 없음");
  scope.expect(linkHrefs(page.links, "canonical").length === 0, "404에 canonical 있음");
  scope.expect(
    page.links.filter((link) => link.hreflang !== undefined).length === 0,
    "404에 hreflang 있음",
  );
  scope.expect(metaValues(page.metas, "og:url").length === 0, "404에 og:url 있음");
  checkSiteShell(page, res.body, scope);
}

// ---------- 출력 ----------

function printGroup(title, items) {
  console.log(`${title} (${items.length}개):`);
  const byScope = new Map();
  for (const item of items) {
    if (!byScope.has(item.scope)) byScope.set(item.scope, []);
    byScope.get(item.scope).push(item.message);
  }
  for (const [scope, messages] of byScope) {
    console.log(`- ${scope}`);
    for (const message of messages) console.log(`    ${message}`);
  }
}

function printSummary(report, stats) {
  console.log("");
  console.log(
    `사이트맵: URL ${stats.total}개 (홈 ${stats.homes}, ko 문서 ${stats.ko}, en 문서 ${stats.en})`,
  );
  console.log(
    `요청: 페이지 ${stats.pages}개, 이미지 ${stats.images}개, 리다이렉트 ${stats.redirects}건, 언어 고정 ${stats.localeChecks}건, 404 ${stats.notFound}건`,
  );
  console.log(
    `검사 항목 ${report.checks}개, 실패 ${report.failures.length}개, 경고 ${report.warnings.length}개`,
  );
  if (report.failures.length) {
    console.log("");
    printGroup("실패 목록", report.failures);
  }
  if (report.warnings.length) {
    console.log("");
    printGroup("경고 목록", report.warnings);
  }
  console.log("");
  console.log(report.failures.length ? "결과: 실패" : "결과: 통과");
}

// ---------- 진입점 ----------

function usage() {
  console.error(
    "사용법: node scripts/verify-seo.mjs <검증 origin> [--timeout=ms]\n예시: node scripts/verify-seo.mjs http://127.0.0.1:4173",
  );
}

function parseArgs(argv) {
  let origin = null;
  let timeout = DEFAULT_TIMEOUT_MS;
  for (const arg of argv) {
    if (arg.startsWith("--timeout=")) {
      timeout = Number(arg.slice("--timeout=".length));
    } else if (arg.startsWith("--")) {
      console.error(`알 수 없는 옵션: ${arg}`);
      return null;
    } else if (origin === null) {
      origin = arg;
    } else {
      console.error(`인자가 너무 많음: ${arg}`);
      return null;
    }
  }
  if (!origin) return null;
  if (!Number.isInteger(timeout) || timeout <= 0) {
    console.error("--timeout 값은 양의 정수(ms)여야 함");
    return null;
  }
  let url;
  try {
    url = new URL(origin);
  } catch {
    console.error(`origin 파싱 실패: ${origin}`);
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) {
    console.error("origin은 http 또는 https여야 함");
    return null;
  }
  return { localOrigin: url.origin, timeout };
}

async function main() {
  if (typeof fetch !== "function" || typeof AbortSignal?.timeout !== "function") {
    console.error("Node 18 이상이 필요함");
    process.exit(1);
  }
  const args = parseArgs(process.argv.slice(2));
  if (!args) {
    usage();
    process.exit(1);
  }

  const report = new Report();
  const ctx = { ...args, report };
  const stats = {
    total: 0,
    homes: 0,
    ko: 0,
    en: 0,
    pages: 0,
    images: 0,
    redirects: 0,
    localeChecks: 0,
    notFound: 0,
  };
  console.log(
    `SEO 검증 시작: ${ctx.localOrigin} (대표 URL origin ${PROD_ORIGIN}, timeout ${ctx.timeout}ms)`,
  );

  const locs = await loadSitemapLocs(ctx);
  if (locs) {
    const { entries, counts } = buildEntries(locs, report);
    Object.assign(stats, counts);

    const results = await mapLimit(entries, MAX_CONCURRENCY, (entry) =>
      checkPage(entry, ctx),
    );
    stats.pages = entries.length;

    const homes = entries.filter((entry) => entry.kind === "home");
    await mapLimit(homes, MAX_CONCURRENCY, (entry) => {
      const preference = entry.lang === "ko" ? "en" : "ko";
      return checkPage(entry, ctx, {
        "accept-language": preference,
        cookie: `NEXT_LOCALE=${preference}`,
      });
    });
    stats.localeChecks = homes.length;

    // 같은 이미지는 한 번만 요청한다
    const imageUrls = unique(results.flatMap((result) => result.images)).sort();
    const targets = imageUrls.slice(0, MAX_IMAGE_FETCHES);
    if (imageUrls.length > targets.length) {
      report
        .scope("이미지")
        .warn(`고유 이미지 ${imageUrls.length}개 중 ${targets.length}개만 확인`);
    }
    if (imageUrls.length === 0) {
      report.scope("이미지").fail("확인할 OG 이미지 주소가 없음");
    }
    await mapLimit(targets, MAX_CONCURRENCY, (url) => checkImage(url, ctx));
    stats.images = targets.length;
  }

  await mapLimit(REDIRECT_CASES, MAX_CONCURRENCY, (testCase) =>
    checkRedirect(testCase, ctx),
  );
  stats.redirects = REDIRECT_CASES.length;

  await mapLimit(NOT_FOUND_PATHS, MAX_CONCURRENCY, (path) =>
    checkNotFound(path, ctx),
  );
  stats.notFound = NOT_FOUND_PATHS.length;

  printSummary(report, stats);
  process.exitCode = report.failures.length ? 1 : 0;
}

main().catch((error) => {
  console.error(`검증 스크립트 오류: ${error?.stack ?? error}`);
  process.exit(1);
});
