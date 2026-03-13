import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Yahoo Finance symbols for commodities
const COMMODITY_SYMBOLS: Record<string, { symbol: string; name: string; unit: string }> = {
  lithium: { symbol: "LIT", name: "Lithium (LIT)", unit: "USD" },
  nickel: { symbol: "JJN", name: "Nickel (JJN)", unit: "USD" },
  copper: { symbol: "HG=F", name: "Copper", unit: "USD/lb" },
  aluminum: { symbol: "ALI=F", name: "Aluminum", unit: "USD/t" },
  rareearths: { symbol: "REMX", name: "Rare Earths (REMX)", unit: "USD" },
  iron: { symbol: "VALE", name: "Iron Ore (VALE)", unit: "USD" },
  gold: { symbol: "GC=F", name: "Gold", unit: "USD/oz" },
  uranium: { symbol: "URA", name: "Uranium (URA)", unit: "USD" },
  oil: { symbol: "BZ=F", name: "Brent Crude", unit: "USD/bbl" },
  natgas: { symbol: "NG=F", name: "Natural Gas", unit: "USD/MMBtu" },
};

// Extended symbols for chart API (when user clicks a commodity tag)
const CHART_SYMBOLS: Record<string, { symbol: string; name: string; unit: string }> = {
  "LIT": { symbol: "LIT", name: "Lithium (LIT)", unit: "USD" },
  "JJN": { symbol: "JJN", name: "Nickel (JJN)", unit: "USD" },
  "HG=F": { symbol: "HG=F", name: "Copper", unit: "USD/lb" },
  "ALI=F": { symbol: "ALI=F", name: "Aluminum", unit: "USD/t" },
  "REMX": { symbol: "REMX", name: "Rare Earths (REMX)", unit: "USD" },
  "VALE": { symbol: "VALE", name: "Iron Ore (VALE)", unit: "USD" },
  "GC=F": { symbol: "GC=F", name: "Gold", unit: "USD/oz" },
  "URA": { symbol: "URA", name: "Uranium (URA)", unit: "USD" },
  "BZ=F": { symbol: "BZ=F", name: "Brent Crude", unit: "USD/bbl" },
  "NG=F": { symbol: "NG=F", name: "Natural Gas", unit: "USD/MMBtu" },
};

// In-memory cache
let priceCache: { data: any; timestamp: number } | null = null;
let newsCache: { data: any; timestamp: number } | null = null;
let chartCache: Record<string, { data: any; timestamp: number }> = {};

const PRICE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const NEWS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const CHART_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function getYahoo() {
  const { default: YahooFinance } = await import("yahoo-finance2");
  const yf = new YahooFinance();
  return yf;
}

async function fetchCommodityPrices() {
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL) {
    return priceCache.data;
  }

  try {
    const yahooFinance = await getYahoo();

    const symbols = Object.values(COMMODITY_SYMBOLS).map((c) => c.symbol);
    const quotes = await yahooFinance.quote(symbols);

    const results = Object.entries(COMMODITY_SYMBOLS).map(([id, config]) => {
      const quote = Array.isArray(quotes)
        ? quotes.find((q: any) => q.symbol === config.symbol)
        : null;

      if (quote) {
        const price = quote.regularMarketPrice || 0;
        const change = quote.regularMarketChangePercent || 0;
        const prevClose = quote.regularMarketPreviousClose || price;

        return {
          id,
          name: config.name,
          price,
          change: Math.round(change * 100) / 100,
          unit: config.unit,
          sparklineData: generateSparklineFromPrice(price, change),
        };
      }

      return null;
    });

    const validResults = results.filter(Boolean);

    if (validResults.length > 0) {
      priceCache = { data: validResults, timestamp: Date.now() };
      return validResults;
    }

    throw new Error("No valid quotes returned");
  } catch (err) {
    console.error("Yahoo Finance error:", err);
    if (priceCache) return priceCache.data;
    return null;
  }
}

function generateSparklineFromPrice(currentPrice: number, changePercent: number): number[] {
  const points: number[] = [];
  const startPrice = currentPrice / (1 + changePercent / 100);
  const step = (currentPrice - startPrice) / 19;

  for (let i = 0; i < 20; i++) {
    const noise = (Math.random() - 0.5) * currentPrice * 0.005;
    points.push(startPrice + step * i + noise);
  }
  points[19] = currentPrice;
  return points;
}

async function fetchChartData(symbol: string, range: string) {
  const cacheKey = `${symbol}-${range}`;
  if (chartCache[cacheKey] && Date.now() - chartCache[cacheKey].timestamp < CHART_CACHE_TTL) {
    return chartCache[cacheKey].data;
  }

  try {
    const yahooFinance = await getYahoo();

    let period1: string;
    let interval: "1d" | "1wk" | "1mo" | "5m" | "1h";
    const now = new Date();

    switch (range) {
      case "1D":
        period1 = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "5m";
        break;
      case "1W":
        period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "1h";
        break;
      case "1M":
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "1d";
        break;
      case "3M":
        period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "1d";
        break;
      case "1Y":
        period1 = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "1wk";
        break;
      default:
        period1 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
        interval = "1d";
    }

    const result = await yahooFinance.chart(symbol, {
      period1,
      interval,
    });

    if (result && result.quotes && result.quotes.length > 0) {
      const chartData = result.quotes
        .filter((q: any) => q.close != null)
        .map((q: any) => {
          const d = new Date(q.date);
          let label: string;
          if (range === "1D") {
            label = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
          } else if (range === "1W") {
            label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          } else if (range === "1Y") {
            label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          } else {
            label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }
          return {
            date: label,
            price: Math.round(q.close * 100) / 100,
          };
        });

      chartCache[cacheKey] = { data: chartData, timestamp: Date.now() };
      return chartData;
    }

    throw new Error("No chart data returned");
  } catch (err) {
    console.error("Chart data error:", err);
    if (chartCache[cacheKey]) return chartCache[cacheKey].data;
    return null;
  }
}

// ===== Multi-source news aggregation =====
interface RawArticle {
  title: string;
  description: string;
  url: string;
  pubDate: Date;
  source: string;
}

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/** Parse RSS XML into articles (handles CDATA and plain text) */
function parseRSSItems(xml: string, defaultSource: string, maxItems = 50): RawArticle[] {
  const items: RawArticle[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null && items.length < maxItems) {
    const block = match[1];

    const title =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1] ||
      block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "";
    const desc =
      block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1] ||
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || "";
    const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]?.trim() || "";
    const pubDateStr = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "";
    const sourceTag = block.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1]?.trim();

    if (!title.trim()) continue;

    const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();
    // Skip articles older than 2 weeks
    if (Date.now() - pubDate.getTime() > TWO_WEEKS_MS) continue;

    const cleanTitle = title.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    let cleanDesc = desc.replace(/<[^>]+>/g, "").replace(/&#\d+;/g, "").replace(/&[a-z]+;/g, " ").trim();
    // Remove Google News redirect URLs and leaked HTML fragments
    cleanDesc = cleanDesc.replace(/a\s+href="[^"]*"[^>]*/gi, "").trim();
    cleanDesc = cleanDesc.replace(/https?:\/\/news\.google\.com\/rss\/articles\/\S+/gi, "").trim();
    cleanDesc = cleanDesc.replace(/target="_blank"/gi, "").trim();
    cleanDesc = cleanDesc.replace(/font\s+color="[^"]*"/gi, "").trim();
    cleanDesc = cleanDesc.replace(/\/font/gi, "").trim();
    cleanDesc = cleanDesc.replace(/\/a/gi, "").trim();
    // Remove  , nbsp patterns
    cleanDesc = cleanDesc.replace(/\s*nbsp;?\s*/gi, " ").trim();
    // Remove leftover fragments that start with raw html-like patterns
    cleanDesc = cleanDesc.replace(/^[\s\/a-z]+(?:target|href|font|color)[^"]*"[^"]*"\s*/i, "").trim();
    // If description is mostly URL garbage, skip it
    if (cleanDesc.length < 20 || /^(https?:|a href)/i.test(cleanDesc)) cleanDesc = "";
    cleanDesc = cleanDesc.substring(0, 250);

    items.push({
      title: cleanTitle,
      description: cleanDesc,
      url: link,
      pubDate,
      source: sourceTag || defaultSource,
    });
  }
  return items;
}

/** Fetch a single RSS feed with timeout */
async function fetchRSS(url: string, defaultSource: string, maxItems = 50): Promise<RawArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return [];
    const xml = await response.text();
    return parseRSSItems(xml, defaultSource, maxItems);
  } catch {
    return [];
  }
}

/** Deduplicate by normalized headline (lowercase, stripped) */
function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchCommodityNews() {
  if (newsCache && Date.now() - newsCache.timestamp < NEWS_CACHE_TTL) {
    return newsCache.data;
  }

  try {
    // Fetch from ALL sources in parallel — maximize coverage
    const feedPromises = [
      // ============================================================
      // 🪨 METALS & MINING (Direct RSS feeds)
      // ============================================================
      // 4. MINING.COM — flagship global mining news
      fetchRSS("https://www.mining.com/feed/", "Mining.com", 40),
      // Mining.com commodity-specific feeds
      fetchRSS("https://www.mining.com/commodity/gold/feed/", "Mining.com", 30),
      fetchRSS("https://www.mining.com/commodity/copper/feed/", "Mining.com", 30),
      fetchRSS("https://www.mining.com/commodity/lithium/feed/", "Mining.com", 25),
      fetchRSS("https://www.mining.com/commodity/silver/feed/", "Mining.com", 25),
      fetchRSS("https://www.mining.com/commodity/nickel/feed/", "Mining.com", 20),
      fetchRSS("https://www.mining.com/commodity/iron-ore/feed/", "Mining.com", 20),
      fetchRSS("https://www.mining.com/commodity/coal/feed/", "Mining.com", 20),
      fetchRSS("https://www.mining.com/commodity/zinc/feed/", "Mining.com", 15),
      fetchRSS("https://www.mining.com/commodity/cobalt/feed/", "Mining.com", 15),
      fetchRSS("https://www.mining.com/commodity/platinum/feed/", "Mining.com", 15),
      fetchRSS("https://www.mining.com/commodity/uranium/feed/", "Mining.com", 15),
      fetchRSS("https://www.mining.com/commodity/aluminum/feed/", "Mining.com", 15),
      fetchRSS("https://www.mining.com/commodity/palladium/feed/", "Mining.com", 10),
      fetchRSS("https://www.mining.com/commodity/potash/feed/", "Mining.com", 10),

      // 5. The Northern Miner — deep mining industry news
      fetchRSS("https://www.northernminer.com/feed/", "The Northern Miner", 25),

      // 6. Mining Weekly — headlines and industry trends
      fetchRSS("https://m.miningweekly.com/page/home/feed", "Mining Weekly", 20),

      // 8. Kitco — precious metals news + pricing
      fetchRSS("https://www.kitco.com/news/category/mining/rss", "Kitco", 20),

      // 11. Canadian Mining Journal
      fetchRSS("https://www.canadianminingjournal.com/feed/", "Canadian Mining Journal", 20),

      // GoldSeek — precious metals
      fetchRSS("https://news.goldseek.com/newsRSS.xml", "GoldSeek", 15),

      // ============================================================
      // 🛢️ OIL & GAS (Direct RSS feeds)
      // ============================================================
      // OilPrice.com — oil & energy
      fetchRSS("https://oilprice.com/rss/main", "OilPrice.com", 30),

      // 12. World Oil — upstream, drilling, exploration
      fetchRSS("https://www.worldoil.com/rss?feed=news", "World Oil", 25),

      // 13. RigZone — daily oil & gas industry news
      fetchRSS("https://www.rigzone.com/news/rss/rigzone_latest.aspx", "RigZone", 25),
      fetchRSS("https://www.rigzone.com/news/rss/rigzone_original.aspx", "RigZone", 15),

      // ============================================================
      // 🔥 BROAD & FINANCIAL — via Google News (Reuters, Bloomberg, S&P Global, FT, etc.)
      // ============================================================
      // 1 & 2. Reuters Energy & Commodities
      fetchRSS("https://news.google.com/rss/search?q=site:reuters.com+commodities+OR+energy+OR+metals&hl=en-US&gl=US&ceid=US:en", "Reuters (via Google News)", 20),
      fetchRSS("https://news.google.com/rss/search?q=site:reuters.com+oil+OR+gold+OR+copper+OR+mining&hl=en-US&gl=US&ceid=US:en", "Reuters (via Google News)", 15),

      // 3. Bloomberg Commodities
      fetchRSS("https://news.google.com/rss/search?q=site:bloomberg.com+commodity+OR+metals+OR+oil+OR+mining&hl=en-US&gl=US&ceid=US:en", "Bloomberg (via Google News)", 20),

      // S&P Global Commodity & Energy News
      fetchRSS("https://news.google.com/rss/search?q=site:spglobal.com+commodity+OR+energy+OR+metals+OR+mining&hl=en-US&gl=US&ceid=US:en", "S&P Global (via Google News)", 15),

      // Financial Times / The Economist geopolitics
      fetchRSS("https://news.google.com/rss/search?q=site:ft.com+commodity+OR+mining+OR+oil+OR+metals&hl=en-US&gl=US&ceid=US:en", "FT (via Google News)", 10),

      // Trading Economics commodity data
      fetchRSS("https://news.google.com/rss/search?q=site:tradingeconomics.com+commodity+OR+gold+OR+oil&hl=en-US&gl=US&ceid=US:en", "Trading Economics (via Google News)", 10),

      // ============================================================
      // 🌍 GEOPOLITICS & SUPPLY CHAIN — via Google News
      // ============================================================
      // 17. CSIS / Think Tank critical minerals
      fetchRSS("https://news.google.com/rss/search?q=critical+minerals+geopolitics+supply+chain&hl=en-US&gl=US&ceid=US:en", "Google News", 15),

      // 18. IEA / EIA energy outlook
      fetchRSS("https://news.google.com/rss/search?q=IEA+OR+EIA+energy+outlook+oil+supply&hl=en-US&gl=US&ceid=US:en", "Google News", 10),

      // ============================================================
      // 📈 COMMODITY-SPECIFIC — via Google News (broader coverage)
      // ============================================================
      // Precious metals
      fetchRSS("https://news.google.com/rss/search?q=gold+price+market+forecast&hl=en-US&gl=US&ceid=US:en", "Google News", 20),
      fetchRSS("https://news.google.com/rss/search?q=silver+price+precious+metals+market&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=platinum+palladium+price+market&hl=en-US&gl=US&ceid=US:en", "Google News", 10),
      // Energy
      fetchRSS("https://news.google.com/rss/search?q=crude+oil+brent+WTI+price+market&hl=en-US&gl=US&ceid=US:en", "Google News", 20),
      fetchRSS("https://news.google.com/rss/search?q=natural+gas+LNG+energy+price&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=OPEC+oil+production+supply+cut&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      // Base metals & industrial
      fetchRSS("https://news.google.com/rss/search?q=copper+price+mining+demand&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=lithium+battery+EV+mining+price&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=iron+ore+steel+commodity+price&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=nickel+zinc+aluminum+metal+price&hl=en-US&gl=US&ceid=US:en", "Google News", 10),
      fetchRSS("https://news.google.com/rss/search?q=coal+uranium+commodity+energy&hl=en-US&gl=US&ceid=US:en", "Google News", 10),
      fetchRSS("https://news.google.com/rss/search?q=cobalt+rare+earths+critical+minerals&hl=en-US&gl=US&ceid=US:en", "Google News", 10),
      // Broader market
      fetchRSS("https://news.google.com/rss/search?q=commodity+market+news+today&hl=en-US&gl=US&ceid=US:en", "Google News", 20),
      fetchRSS("https://news.google.com/rss/search?q=commodity+prices+global+trade+tariff&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=mining+industry+news+deals&hl=en-US&gl=US&ceid=US:en", "Google News", 15),
      fetchRSS("https://news.google.com/rss/search?q=commodity+ETF+futures+trading&hl=en-US&gl=US&ceid=US:en", "Google News", 10),

      // ============================================================
      // 🔎 SUBSCRIPTION SITES — via Google News proxy (7, 9, 10, 14, 15)
      // ============================================================
      // 7. Mining Journal
      fetchRSS("https://news.google.com/rss/search?q=site:mining-journal.com&hl=en-US&gl=US&ceid=US:en", "Mining Journal (via Google News)", 10),
      // 9. Fastmarkets
      fetchRSS("https://news.google.com/rss/search?q=site:fastmarkets.com+metals+OR+mining&hl=en-US&gl=US&ceid=US:en", "Fastmarkets (via Google News)", 10),
      // 10. Argus Media
      fetchRSS("https://news.google.com/rss/search?q=site:argusmedia.com+commodity+OR+metals&hl=en-US&gl=US&ceid=US:en", "Argus Media (via Google News)", 10),
      // 14. Oil & Gas Journal
      fetchRSS("https://news.google.com/rss/search?q=site:ogj.com+oil+OR+gas+OR+energy&hl=en-US&gl=US&ceid=US:en", "Oil & Gas Journal (via Google News)", 10),
    ];

    const results = await Promise.all(feedPromises);
    let allRaw = results.flat();

    // Deduplicate
    allRaw = deduplicateArticles(allRaw);

    // Sort by date descending (newest first)
    allRaw.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

    // Keep top 300 articles
    allRaw = allRaw.slice(0, 300);

    if (allRaw.length === 0) {
      throw new Error("No articles from any source");
    }

    const articles = allRaw.map((a, i) => {
      const text = a.title + " " + a.description;
      const tags = detectTags(text);
      return {
        id: i + 1,
        category: detectCategory(text),
        tag: tags[0], // primary tag for backward compat
        tags, // all commodity tags
        topic: detectTopic(text),
        region: detectRegion(text),
        source: a.source,
        date: a.pubDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        rawDate: a.pubDate.toISOString(),
        headline: a.title,
        summary: a.description,
        readTime: Math.max(2, Math.min(8, Math.round(a.description.length / 80))),
        url: a.url,
      };
    });

    newsCache = { data: articles, timestamp: Date.now() };
    console.log(`News: aggregated ${articles.length} unique articles from ${new Set(articles.map(a => a.source)).size} sources (${results.reduce((s, r) => s + r.length, 0)} raw, ${results.flat().length - articles.length} deduped/filtered)`);
    return articles;
  } catch (err) {
    console.error("News aggregation error:", err);
    if (newsCache) return newsCache.data;
    return null;
  }
}

function detectCategory(text: string): "metals" | "oil" {
  const lower = text.toLowerCase();
  if (
    lower.includes("oil") ||
    lower.includes("crude") ||
    lower.includes("gas") ||
    lower.includes("opec") ||
    lower.includes("energy") ||
    lower.includes("shell") ||
    lower.includes("exxon") ||
    lower.includes("pipeline") ||
    lower.includes("refinery")
  ) {
    return "oil";
  }
  return "metals";
}

/** Detect ALL commodity tags mentioned in text (multi-tag support) */
function detectTags(text: string): string[] {
  const lower = text.toLowerCase();
  const tags: string[] = [];

  if (lower.includes("lithium") || lower.includes("battery metal")) tags.push("Lithium");
  if (lower.includes("nickel")) tags.push("Nickel");
  if (lower.includes("cobalt")) tags.push("Cobalt");
  if (lower.includes("copper")) tags.push("Copper");
  if (lower.includes("aluminum") || lower.includes("aluminium") || lower.includes("bauxite")) tags.push("Aluminum");
  if (lower.includes("graphite") || lower.includes("anode material")) tags.push("Graphite");
  if (lower.includes("rare earth") || lower.includes("neodymium") || lower.includes("praseodymium") || lower.includes("dysprosium")) tags.push("Rare Earths");
  if (lower.includes("iron ore")) tags.push("Iron Ore");
  if (lower.includes("steel") || lower.includes("blast furnace") || lower.includes("steelmaking") || lower.includes("hot rolled") || lower.includes("rebar")) tags.push("Steel");
  if (lower.includes("gold") || lower.includes("bullion") || lower.includes("silver") || lower.includes("platinum") || lower.includes("palladium")) tags.push("Gold");
  if (lower.includes("uranium") || lower.includes("nuclear") || lower.includes("yellowcake")) tags.push("Uranium");
  if (lower.includes("vanadium")) tags.push("Vanadium");
  if (lower.includes("antimony")) tags.push("Antimony");
  if (lower.includes("crude") || lower.includes("oil price") || lower.includes("brent") || lower.includes("wti") || lower.includes("opec")) tags.push("Oil");
  if (lower.includes("natural gas") || lower.includes("henry hub") || lower.includes("lng") || lower.includes("liquefied natural gas")) tags.push("Gas");

  // Deduplicate
  return [...new Set(tags)].length > 0 ? [...new Set(tags)] : ["Commodity"];
}

function detectRegion(text: string): string[] {
  const lower = text.toLowerCase();
  const regions: string[] = [];
  
  const naKeywords = ["us ", "usa", "united states", "canada", "mexico", "american", "canadian", "permian", "gulf of mexico", "alberta", "texas", "alaska", "appalachian", "bakken", "north dakota", "colorado", "wyoming", "new mexico", "louisiana", "ontario", "quebec", "british columbia", "saskatchewan"];
  const saKeywords = ["brazil", "chile", "peru", "argentina", "colombia", "latin america", "brazilian", "chilean", "atacama", "sqm", "bolivia", "guyana", "suriname", "ecuador", "venezuela", "petrobras", "codelco"];
  const euKeywords = ["europe", "european", "uk ", "britain", "british", "germany", "german", "russia", "russian", "norway", "norwegian", " eu ", "london", "north sea", "shell", " bp ", "france", "french", "spain", "italy", "poland", "sweden", "finland", "ukraine", "netherlands", "glencore", "anglo american"];
  const asKeywords = ["china", "chinese", "india", "indian", "japan", "japanese", "australia", "australian", "indonesia", "indonesian", "bhp", "rio tinto", "opec", "saudi", "middle east", "uae", "qatar", "korea", "vietnam", "philippines", "malaysia", "thailand", "mongolia", "kazakhstan", "uzbekistan", "pilbara", "western australia"];
  const afKeywords = ["africa", "african", "congo", "drc", "south africa", "ghana", "tanzania", "zambia", "nigeria", "angola", "mozambique", "namibia", "zimbabwe", "mali", "burkina faso", "ivory coast", "senegal", "ethiopia", "kenya", "botswana", "gabon"];

  if (naKeywords.some(k => lower.includes(k))) regions.push("N. America");
  if (saKeywords.some(k => lower.includes(k))) regions.push("S. America");
  if (euKeywords.some(k => lower.includes(k))) regions.push("Europe");
  if (asKeywords.some(k => lower.includes(k))) regions.push("Asia-Pacific");
  if (afKeywords.some(k => lower.includes(k))) regions.push("Africa");

  return regions;
}

/** Detect the business topic / event type of an article */
function detectTopic(text: string): string {
  const lower = text.toLowerCase();

  // Capital Projects & Investment
  if (lower.includes("capex") || lower.includes("capital project") || lower.includes("construction") || lower.includes("expansion") || lower.includes("greenfield") || lower.includes("brownfield") || lower.includes("new plant") || lower.includes("investment in") || lower.includes("$") && (lower.includes("billion") || lower.includes("million")) && (lower.includes("build") || lower.includes("project") || lower.includes("develop") || lower.includes("expand"))) return "Capital Project";

  // M&A
  if (lower.includes("acquisition") || lower.includes("acquire") || lower.includes("merger") || lower.includes("merge") || lower.includes("takeover") || lower.includes("buyout") || lower.includes("bid for") || lower.includes("hostile bid") || lower.includes("joint venture") || lower.includes(" jv ") || lower.includes("divest") || lower.includes("spin off") || lower.includes("spin-off")) return "M&A";

  // Policy & Regulation
  if (lower.includes("tariff") || lower.includes("sanction") || lower.includes("ban") || lower.includes("regulation") || lower.includes("regulatory") || lower.includes("policy") || lower.includes("government") || lower.includes("legislation") || lower.includes("subsid") || lower.includes("tax credit") || lower.includes("embargo") || lower.includes("export control") || lower.includes("import duty") || lower.includes("trade war") || lower.includes("geopoliti") || lower.includes("critical mineral") && lower.includes("strateg")) return "Policy";

  // Supply Chain & Disruption
  if (lower.includes("supply chain") || lower.includes("shortage") || lower.includes("disruption") || lower.includes("bottleneck") || lower.includes("logistics") || lower.includes("shipping") || lower.includes("port") || lower.includes("stockpile") || lower.includes("inventory") || lower.includes("supply deficit") || lower.includes("supply surplus") || lower.includes("force majeure") || lower.includes("outage")) return "Supply Chain";

  // Exploration & Discovery
  if (lower.includes("exploration") || lower.includes("discovery") || lower.includes("drill") || lower.includes("assay") || lower.includes("resource estimate") || lower.includes("mineral resource") || lower.includes("feasibility") || lower.includes("pre-feasibility") || lower.includes("deposit") || lower.includes("prospect") || lower.includes("geological") || lower.includes("seismic")) return "Exploration";

  // Production & Operations
  if (lower.includes("production") || lower.includes("output") || lower.includes("capacity") || lower.includes("ramp up") || lower.includes("ramp-up") || lower.includes("commissioning") || lower.includes("first ore") || lower.includes("first oil") || lower.includes("throughput") || lower.includes("operational") || lower.includes("shutdown") || lower.includes("restart") || lower.includes("curtail")) return "Production";

  // Market & Pricing
  if (lower.includes("price") || lower.includes("rally") || lower.includes("slump") || lower.includes("surge") || lower.includes("decline") || lower.includes("forecast") || lower.includes("outlook") || lower.includes("demand") || lower.includes("supply") || lower.includes("market") || lower.includes("trade") || lower.includes("futures") || lower.includes("spot price") || lower.includes("benchmark")) return "Market";

  // ESG & Sustainability
  if (lower.includes("esg") || lower.includes("carbon") || lower.includes("emission") || lower.includes("climate") || lower.includes("sustainab") || lower.includes("green") || lower.includes("environment") || lower.includes("renewable") || lower.includes("recycle") || lower.includes("circular economy") || lower.includes("decarboni")) return "ESG";

  // Technology & Innovation
  if (lower.includes("technolog") || lower.includes("innovation") || lower.includes("patent") || lower.includes("process") || lower.includes("automat") || lower.includes("ai ") || lower.includes("artificial intelligence") || lower.includes("digital") || lower.includes("battery tech") || lower.includes("solid state") || lower.includes("direct lithium")) return "Technology";

  // Earnings & Financials
  if (lower.includes("earnings") || lower.includes("revenue") || lower.includes("profit") || lower.includes("loss") || lower.includes("quarter") || lower.includes("annual report") || lower.includes("dividend") || lower.includes("shares") || lower.includes("ipo") || lower.includes("stock")) return "Financials";

  return "";
}

// ===== Intelligence Brief computation =====
function computeIntelBrief(articles: any[]) {
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const threeDayMs = 3 * oneDayMs;

  // Articles from last 24h vs last 3 days
  const recentArticles = articles.filter(a => {
    const d = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    return now - d < oneDayMs;
  });
  const threeDayArticles = articles.filter(a => {
    const d = a.rawDate ? new Date(a.rawDate).getTime() : 0;
    return now - d < threeDayMs;
  });

  // Count articles per commodity (using tags array)
  const commodityCounts: Record<string, number> = {};
  const commodityCounts3d: Record<string, number> = {};
  for (const a of recentArticles) {
    for (const t of (a.tags || [a.tag])) {
      if (t && t !== "Commodity") commodityCounts[t] = (commodityCounts[t] || 0) + 1;
    }
  }
  for (const a of threeDayArticles) {
    for (const t of (a.tags || [a.tag])) {
      if (t && t !== "Commodity") commodityCounts3d[t] = (commodityCounts3d[t] || 0) + 1;
    }
  }

  // Count articles per topic
  const topicCounts: Record<string, number> = {};
  for (const a of recentArticles) {
    if (a.topic) topicCounts[a.topic] = (topicCounts[a.topic] || 0) + 1;
  }

  // Top signals: commodities with most articles in 24h
  const topSignals = Object.entries(commodityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([commodity, count]) => {
      // Find the dominant topic for this commodity
      const topicForCommodity: Record<string, number> = {};
      for (const a of recentArticles) {
        if ((a.tags || [a.tag]).includes(commodity) && a.topic) {
          topicForCommodity[a.topic] = (topicForCommodity[a.topic] || 0) + 1;
        }
      }
      const dominantTopic = Object.entries(topicForCommodity).sort((a, b) => b[1] - a[1])[0];
      return {
        commodity,
        articleCount: count,
        dominantTopic: dominantTopic ? dominantTopic[0] : "Market",
        topicCount: dominantTopic ? dominantTopic[1] : 0,
      };
    });

  // Anomaly detection: commodities with unusual activity (>2x their average)
  const avgPerCommodity3d: Record<string, number> = {};
  for (const [k, v] of Object.entries(commodityCounts3d)) {
    avgPerCommodity3d[k] = v / 3; // daily average over 3 days
  }
  const anomalies = Object.entries(commodityCounts)
    .filter(([k, v]) => {
      const avg = avgPerCommodity3d[k] || 1;
      return v > avg * 1.8 && v >= 3; // 80% above average and at least 3 articles
    })
    .map(([commodity, count]) => ({
      commodity,
      articleCount: count,
      avgCount: Math.round((avgPerCommodity3d[commodity] || 1) * 10) / 10,
      spike: Math.round((count / (avgPerCommodity3d[commodity] || 1)) * 100) / 100,
    }))
    .sort((a, b) => b.spike - a.spike)
    .slice(0, 4);

  // Trending topics
  const trendingTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  // Key headlines — most significant articles from last 24h
  const keyHeadlines = recentArticles
    .filter(a => a.tags && a.tags.length > 0 && a.tags[0] !== "Commodity")
    .slice(0, 5)
    .map((a: any) => ({
      headline: a.headline,
      commodity: a.tags?.[0] || a.tag,
      topic: a.topic || "",
      source: a.source,
      url: a.url,
    }));

  return {
    generatedAt: new Date().toISOString(),
    period: "24h",
    totalArticles24h: recentArticles.length,
    totalArticles: articles.length,
    topSignals,
    anomalies,
    trendingTopics,
    keyHeadlines,
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // GET /api/prices - real-time commodity prices
  app.get("/api/prices", async (_req, res) => {
    try {
      const prices = await fetchCommodityPrices();
      if (prices) {
        res.json({ success: true, data: prices, timestamp: Date.now() });
      } else {
        res.status(503).json({ success: false, error: "Price data unavailable" });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // GET /api/chart?range=1M&symbol=GC=F - commodity price chart data
  app.get("/api/chart", async (req, res) => {
    try {
      const range = (req.query.range as string) || "1M";
      const symbol = (req.query.symbol as string) || "GC=F";
      const validRanges = ["1D", "1W", "1M", "3M", "1Y"];
      if (!validRanges.includes(range)) {
        return res.status(400).json({ success: false, error: "Invalid range" });
      }

      // Validate symbol is in our known list
      const info = CHART_SYMBOLS[symbol];
      const chartData = await fetchChartData(symbol, range);
      if (chartData) {
        res.json({
          success: true,
          data: chartData,
          meta: info ? { name: info.name, unit: info.unit } : { name: symbol, unit: "" },
          timestamp: Date.now(),
        });
      } else {
        res.status(503).json({ success: false, error: "Chart data unavailable" });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // GET /api/news - commodity news
  app.get("/api/news", async (_req, res) => {
    try {
      const news = await fetchCommodityNews();
      if (news) {
        res.json({ success: true, data: news, timestamp: Date.now() });
      } else {
        res.status(503).json({ success: false, error: "News data unavailable" });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // GET /api/intel - intelligence brief (daily signals, anomalies, trending)
  app.get("/api/intel", async (_req, res) => {
    try {
      const news = await fetchCommodityNews();
      if (news && news.length > 0) {
        const brief = computeIntelBrief(news);
        res.json({ success: true, data: brief, timestamp: Date.now() });
      } else {
        res.status(503).json({ success: false, error: "Intel data unavailable" });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // GET /api/commodity/:id - commodity detail (intel data + filtered news)
  app.get("/api/commodity/:id", async (req, res) => {
    try {
      const { COMMODITY_INTEL } = await import("../shared/commodityIntel");
      const id = req.params.id;
      const intel = COMMODITY_INTEL[id];
      if (!intel) {
        return res.status(404).json({ success: false, error: "Commodity not found" });
      }

      // Get price data if available
      const symConfig = COMMODITY_SYMBOLS[id === "iron-ore" ? "iron" : id === "natgas" || id === "gas" ? "natgas" : id];
      let priceData = null;
      if (symConfig) {
        try {
          const yahooFinance = await getYahoo();
          const quotes = await yahooFinance.quote([symConfig.symbol]);
          const quote = Array.isArray(quotes) ? quotes[0] : quotes;
          if (quote) {
            priceData = {
              price: quote.regularMarketPrice || 0,
              change: Math.round((quote.regularMarketChangePercent || 0) * 100) / 100,
              symbol: symConfig.symbol,
              unit: symConfig.unit,
              name: symConfig.name,
            };
          }
        } catch {}
      }

      // Get news filtered to this commodity
      const allNews = await fetchCommodityNews();
      const commodityLabel = intel.name;
      const filteredNews = (allNews || []).filter((a: any) => {
        const tags = a.tags || [a.tag];
        return tags.includes(commodityLabel);
      }).slice(0, 50);

      // Group news by topic
      const newsByTopic: Record<string, any[]> = {};
      for (const a of filteredNews) {
        const topic = a.topic || "General";
        if (!newsByTopic[topic]) newsByTopic[topic] = [];
        newsByTopic[topic].push(a);
      }

      res.json({
        success: true,
        data: {
          ...intel,
          price: priceData,
          news: filteredNews,
          newsByTopic,
          totalNews: filteredNews.length,
        },
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Commodity detail error:", err);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  return httpServer;
}
