import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { newsArticles as fallbackArticles, type NewsArticle } from "@/data/commodityData";
import { ExternalLink, Loader2, ChevronDown } from "lucide-react";
import type { Region, CommodityTag } from "./TagNavigation";
import { REGIONS, COMMODITIES } from "./TagNavigation";

type CategoryFilter = "all" | "metals" | "oil";

const categoryLabels: Record<CategoryFilter, string> = {
  all: "All",
  metals: "Metals & Mining",
  oil: "Oil & Gas",
};

// FT-style topic colors
const topicColorMap: Record<string, string> = {
  "Capital Project": "text-[hsl(var(--ft-oxford))]",
  "M&A": "text-[hsl(var(--ft-claret))]",
  Policy: "text-[hsl(var(--ft-claret))]",
  "Supply Chain": "text-[hsl(var(--ft-mandarin))]",
  Exploration: "text-[hsl(var(--primary))]",
  Production: "text-[hsl(var(--primary))]",
  Market: "text-[hsl(var(--ft-oxford))]",
  ESG: "text-[hsl(var(--primary))]",
  Technology: "text-[hsl(var(--ft-oxford))]",
  Financials: "text-[hsl(var(--ft-mandarin))]",
};

const commodityColorMap: Record<string, string> = {
  Lithium: "text-[hsl(var(--primary))]", Nickel: "text-[hsl(var(--primary))]",
  Cobalt: "text-[hsl(var(--ft-oxford))]", Copper: "text-[hsl(var(--ft-mandarin))]",
  Aluminum: "text-[hsl(var(--primary))]", Graphite: "text-muted-foreground",
  "Rare Earths": "text-[hsl(var(--ft-oxford))]", "Iron Ore": "text-[hsl(var(--ft-claret))]",
  Steel: "text-muted-foreground", Gold: "text-[hsl(var(--ft-mandarin))]",
  Uranium: "text-[hsl(var(--primary))]", Vanadium: "text-[hsl(var(--ft-oxford))]",
  Antimony: "text-[hsl(var(--ft-claret))]", Oil: "text-[hsl(var(--ft-claret))]",
  Gas: "text-[hsl(var(--ft-oxford))]", Commodity: "text-muted-foreground",
};

const regionIdToLabel: Record<string, string> = {
  "north-america": "N. America", "south-america": "S. America",
  "europe": "Europe", "asia": "Asia-Pacific", "africa": "Africa",
};

const commodityLabelToId: Record<string, string> = {
  Lithium: "lithium", Nickel: "nickel", Cobalt: "cobalt", Copper: "copper",
  Aluminum: "aluminum", Graphite: "graphite", "Rare Earths": "rare-earths",
  "Iron Ore": "iron-ore", Steel: "steel", Gold: "gold", Uranium: "uranium",
  Vanadium: "vanadium", Antimony: "antimony", Oil: "oil", Gas: "gas",
};

interface NewsFeedProps {
  searchQuery: string;
  activeRegion?: Region;
  activeCommodity?: CommodityTag;
  onCommodityClick?: (id: string) => void;
}

interface EnrichedArticle extends NewsArticle {
  url?: string;
  region?: string[];
  topic?: string;
  tags?: string[];
}

function NewsCard({ article, onCommodityClick, isLead }: { article: EnrichedArticle; onCommodityClick?: (id: string) => void; isLead?: boolean }) {
  const displayTags = article.tags && article.tags.length > 0 ? article.tags : [article.tag];

  const content = (
    <div
      data-testid={`news-card-${article.id}`}
      className={`flex flex-col ${isLead ? "gap-2 pb-5" : "gap-1.5 py-4"} border-b border-border last:border-b-0`}
    >
      {/* Topic + commodity labels */}
      <div className="flex items-center gap-2 flex-wrap">
        {article.topic && (
          <span className={`text-[11px] font-bold uppercase tracking-wider ${topicColorMap[article.topic] || "text-muted-foreground"}`}>
            {article.topic}
          </span>
        )}
        {displayTags.map((tag) => {
          const color = commodityColorMap[tag] || "text-muted-foreground";
          const routeId = commodityLabelToId[tag];
          if (routeId && onCommodityClick) {
            return (
              <button
                key={tag}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCommodityClick(routeId); }}
                className={`text-[11px] font-semibold uppercase tracking-wide ${color} hover:underline cursor-pointer`}
              >
                {tag}
              </button>
            );
          }
          return (
            <span key={tag} className={`text-[11px] font-semibold uppercase tracking-wide ${color}`}>{tag}</span>
          );
        })}
        {article.region && article.region.length > 0 && article.region.map((r) => (
          <span key={r} className="text-[11px] text-muted-foreground">{r}</span>
        ))}
      </div>

      {/* Headline */}
      <h3 className={`font-display ${isLead ? "text-xl leading-tight" : "text-[15px] leading-snug"} font-bold text-foreground group-hover:text-[hsl(var(--ft-claret))] transition-colors`}>
        {article.headline}
      </h3>

      {/* Summary */}
      {article.summary && (
        <p className={`text-[13px] leading-relaxed text-muted-foreground ${isLead ? "line-clamp-3" : "line-clamp-2"}`}>
          {article.summary}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between mt-0.5">
        <span className="text-[11px] text-muted-foreground/60">
          {article.source} · {article.date}
        </span>
        {article.url && (
          <ExternalLink className="h-3 w-3 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );

  if (article.url) {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block hover:bg-muted/20 -mx-3 px-3 transition-colors"
      >
        {content}
      </a>
    );
  }
  return content;
}

const PAGE_SIZE = 25;

export default function NewsFeed({ searchQuery, activeRegion = "all", activeCommodity = "all", onCommodityClick }: NewsFeedProps) {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { data: newsResponse, isLoading } = useQuery<{
    success: boolean;
    data: EnrichedArticle[];
  }>({
    queryKey: ["/api/news"],
    staleTime: 25 * 60 * 1000,
  });

  const articles: EnrichedArticle[] =
    newsResponse?.success && newsResponse.data?.length > 0
      ? newsResponse.data
      : fallbackArticles;

  const isLive = newsResponse?.success === true && newsResponse.data?.length > 0;
  const totalArticles = articles.length;
  const uniqueSources = new Set(articles.map(a => a.source)).size;

  const filtered = articles.filter((article) => {
    const matchesCategory = category === "all" || article.category === category;
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || article.headline.toLowerCase().includes(query) || article.summary.toLowerCase().includes(query);

    let matchesRegion = true;
    if (activeRegion !== "all") {
      const articleRegions = article.region || [];
      const regionLabel = regionIdToLabel[activeRegion];
      if (articleRegions.length > 0 && regionLabel) {
        matchesRegion = articleRegions.includes(regionLabel);
      } else if (articleRegions.length > 0) {
        matchesRegion = articleRegions.includes(activeRegion);
      } else {
        const regionInfo = REGIONS.find(r => r.id === activeRegion);
        if (regionInfo) {
          const text = (article.headline + " " + article.summary).toLowerCase();
          matchesRegion = regionInfo.newsKeywords.some(kw => text.includes(kw.toLowerCase()));
        }
      }
    }

    let matchesCommodity = true;
    if (activeCommodity !== "all") {
      const commodityInfo = COMMODITIES.find(c => c.id === activeCommodity);
      if (commodityInfo) {
        const text = (article.headline + " " + article.summary).toLowerCase();
        matchesCommodity = commodityInfo.newsKeywords.some(kw => text.includes(kw.toLowerCase()));
      }
    }

    return matchesCategory && matchesSearch && matchesRegion && matchesCommodity;
  });

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const remaining = filtered.length - visibleCount;

  const handleCategoryChange = (key: CategoryFilter) => {
    setCategory(key);
    setVisibleCount(PAGE_SIZE);
  };

  const activeFilters: string[] = [];
  if (activeRegion !== "all") {
    const r = REGIONS.find(r => r.id === activeRegion);
    if (r) activeFilters.push(r.label);
  }
  if (activeCommodity !== "all") {
    const c = COMMODITIES.find(c => c.id === activeCommodity);
    if (c) activeFilters.push(c.label);
  }

  return (
    <div className="flex flex-col">
      {/* Section header with rule */}
      <div className="flex items-baseline justify-between border-b-2 border-foreground pb-1 mb-4">
        <h2 className="font-display text-lg font-bold text-foreground tracking-tight">Market News</h2>
        <div className="flex items-baseline gap-2">
          {isLive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Live</span>
          )}
          <span className="text-[11px] text-muted-foreground">{totalArticles} articles · {uniqueSources} sources</span>
        </div>
      </div>

      {/* Category tabs — FT underline */}
      <div className="flex gap-0 border-b border-border mb-4">
        {(Object.keys(categoryLabels) as CategoryFilter[]).map((key) => (
          <button
            key={key}
            data-testid={`news-filter-${key}`}
            onClick={() => handleCategoryChange(key)}
            className={`px-4 py-2 text-[12px] font-semibold transition-colors border-b-2 -mb-px ${
              category === key
                ? "border-[hsl(var(--ft-claret))] text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {categoryLabels[key]}
          </button>
        ))}
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-3 text-[11px] text-muted-foreground">
          Filtered: {activeFilters.join(" + ")} — {filtered.length} results
        </div>
      )}

      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No articles found{activeFilters.length > 0 ? ` for ${activeFilters.join(" + ")}` : ""}
          </p>
        ) : (
          <>
            {displayed.map((article, i) => (
              <NewsCard
                key={article.id}
                article={article}
                onCommodityClick={onCommodityClick}
                isLead={i === 0}
              />
            ))}
            {hasMore && (
              <button
                data-testid="load-more-news"
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="mt-4 flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-muted-foreground transition-colors hover:text-foreground border-t border-border"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Load {Math.min(remaining, PAGE_SIZE)} more ({remaining} remaining)
              </button>
            )}
            {!hasMore && filtered.length > PAGE_SIZE && (
              <div className="mt-3 text-center text-[11px] text-muted-foreground/50">
                All {filtered.length} articles shown
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
