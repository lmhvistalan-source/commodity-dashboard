import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertTriangle,
  Building2,
  ChevronDown,
  Loader2,
  Zap,
  Factory,
  Users,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import PriceChart from "@/components/PriceChart";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { COMMODITIES } from "@/components/TagNavigation";

interface SupplyChainStage {
  stage: string;
  description: string;
  keyPlayers: string[];
  keyCountries: string[];
}

interface KeyPlayer {
  company: string;
  country: string;
  role: string;
  details: string;
}

interface CommodityData {
  id: string;
  name: string;
  overview: string;
  supplyChain: SupplyChainStage[];
  keyPlayers: KeyPlayer[];
  demandDrivers: string[];
  riskFactors: string[];
  price: {
    price: number;
    change: number;
    symbol: string;
    unit: string;
    name: string;
  } | null;
  news: any[];
  newsByTopic: Record<string, any[]>;
  totalNews: number;
}

// FT-style topic colors — uppercase plain text, teal/claret/oxford/mandarin
const topicColors: Record<string, string> = {
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
  General: "text-muted-foreground",
};

const regionColor = "text-muted-foreground";

const stageIcons: Record<string, typeof Factory> = {
  Mining: Factory,
  Processing: Zap,
  "Battery Mfg": Zap,
  Smelting: Factory,
  Refining: Factory,
  Separation: Zap,
  "Magnet Mfg": Zap,
  "End Use": Users,
  Trading: Building2,
  "Raw Materials": Factory,
  "Rolling & Finishing": Factory,
  Steelmaking: Factory,
  Synthetic: Zap,
  Exploration: Globe,
  Production: Factory,
  Liquefaction: Factory,
  Shipping: Globe,
  "Regasification & End Use": Users,
  Pelletizing: Factory,
};

export default function CommodityDetail() {
  const [, params] = useRoute("/commodity/:id");
  const id = params?.id || "";

  const [isDark, setIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [activeTopic, setActiveTopic] = useState<string>("all");
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const { data: response, isLoading } = useQuery<{
    success: boolean;
    data: CommodityData;
  }>({
    queryKey: ["/api/commodity", id],
    queryFn: async () => {
      const res = await fetch(`/api/commodity/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const commodity = response?.success ? response.data : null;
  const commodityInfo = COMMODITIES.find((c) => c.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!commodity) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Commodity not found</p>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  // Filter news by topic
  const topicKeys = Object.keys(commodity.newsByTopic).sort(
    (a, b) =>
      (commodity.newsByTopic[b]?.length || 0) -
      (commodity.newsByTopic[a]?.length || 0)
  );
  const displayedNews =
    activeTopic === "all"
      ? commodity.news
      : commodity.newsByTopic[activeTopic] || [];

  const playersToShow = showAllPlayers
    ? commodity.keyPlayers
    : commodity.keyPlayers.slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar — dark ticker style matching Header */}
      <div className="sticky top-0 z-30 bg-background">
        <div className="bg-[#262a33] dark:bg-[#1a1817] text-white">
          <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 sm:px-6 h-8">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white transition-colors tracking-wide"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="h-3 w-3" />
              Dashboard
            </Link>
            <button
              onClick={() => setIsDark((d) => !d)}
              className="flex h-6 w-6 items-center justify-center text-white/60 hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Masthead with commodity name + price */}
        <div className="border-b-2 border-foreground">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4">
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
                {commodity.name}
              </h1>
              {commodity.price && (
                <div className="flex items-baseline gap-3">
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    ${commodity.price.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold tabular-nums ${
                      commodity.price.change >= 0
                        ? "text-[hsl(var(--primary))]"
                        : "text-[hsl(var(--ft-claret))]"
                    }`}
                  >
                    {commodity.price.change >= 0 ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {commodity.price.change >= 0 ? "+" : ""}
                    {commodity.price.change}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {commodity.price.unit}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6">
        {/* Overview */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {commodity.overview}
          </p>
        </div>

        {/* Main grid: Left = news, Right = price chart + info */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: News by topic */}
          <div className="flex-1 min-w-0">
            {/* Section header — editorial rule line */}
            <div className="border-b border-border pb-2 mb-4">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-base font-bold text-foreground">
                  {commodity.name} News
                </h2>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {commodity.totalNews} articles
                </span>
              </div>
            </div>

            {/* Topic filter tabs — FT claret underline style */}
            <div className="flex gap-0 overflow-x-auto border-b border-border mb-4 -mt-1 scrollbar-hide">
              <button
                onClick={() => setActiveTopic("all")}
                className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                  activeTopic === "all"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid="topic-filter-all"
              >
                All ({commodity.totalNews})
              </button>
              {topicKeys.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setActiveTopic(topic)}
                  className={`shrink-0 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${
                    activeTopic === topic
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`topic-filter-${topic}`}
                >
                  {topic} ({commodity.newsByTopic[topic]?.length || 0})
                </button>
              ))}
            </div>

            {/* Article list */}
            <div>
              {displayedNews.length === 0 ? (
                <p className="py-12 text-center text-xs text-muted-foreground">
                  No articles for this topic
                </p>
              ) : (
                displayedNews.map((article: any, idx: number) => {
                  const isLead = idx === 0;
                  return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block hover:bg-muted/30 -mx-2 px-2 transition-colors"
                    >
                      <div
                        className={`flex flex-col ${isLead ? "gap-2 pb-5" : "gap-1.5 py-3.5"} border-b border-border last:border-b-0`}
                      >
                        {/* Topic + region labels */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {article.topic && (
                            <span
                              className="text-[11px] font-semibold text-muted-foreground"
                            >
                              {article.topic}
                            </span>
                          )}
                          {article.region?.map((r: string) => (
                            <span
                              key={r}
                              className="text-[11px] text-muted-foreground/60"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                        <h3
                          className={`font-display ${isLead ? "text-lg" : "text-sm"} font-bold leading-snug text-foreground group-hover:text-[hsl(var(--primary))] transition-colors`}
                        >
                          {article.headline}
                        </h3>
                        {article.summary && (
                          <p
                            className={`text-xs leading-relaxed text-muted-foreground ${isLead ? "line-clamp-3" : "line-clamp-2"}`}
                          >
                            {article.summary}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground/70">
                            {article.source} &middot; {article.date} &middot;{" "}
                            {article.readTime} min read
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-[hsl(var(--ft-claret))] transition-colors" />
                        </div>
                      </div>
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:w-[380px] lg:flex-shrink-0 space-y-6">
            {/* Price chart */}
            {commodityInfo?.symbol && (
              <PriceChart
                symbol={commodityInfo.symbol}
                commodityName={commodity.name}
                commodityUnit={commodityInfo.unit}
              />
            )}

            {/* Supply Chain — editorial rule header */}
            <div>
              <div className="border-b border-border pb-2 mb-4">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Supply Chain
                </h2>
              </div>
              <div className="relative">
                {commodity.supplyChain.map((stage, i) => {
                  const Icon = stageIcons[stage.stage] || Factory;
                  return (
                    <div
                      key={stage.stage}
                      className="relative flex gap-3 pb-4 last:pb-0"
                    >
                      {/* Connector line */}
                      {i < commodity.supplyChain.length - 1 && (
                        <div className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
                      )}
                      <div className="flex-shrink-0 w-[26px] h-[26px] bg-muted flex items-center justify-center z-10">
                        <Icon className="h-3 w-3 text-[hsl(var(--primary))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-foreground">
                          {stage.stage}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          {stage.description}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {stage.keyCountries.map((c) => (
                            <span
                              key={c}
                              className="text-[10px] text-muted-foreground"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <div className="text-[10px] text-muted-foreground/70 mt-1">
                          {stage.keyPlayers.join(", ")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Players — editorial rule header */}
            <div>
              <div className="border-b border-border pb-2 mb-4">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Key Players
                </h2>
              </div>
              <div className="space-y-0">
                {playersToShow.map((player) => (
                  <div
                    key={player.company}
                    className="border-b border-border py-3 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">
                        {player.company}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {player.country}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      {player.role}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {player.details}
                    </p>
                  </div>
                ))}
              </div>
              {commodity.keyPlayers.length > 4 && (
                <button
                  onClick={() => setShowAllPlayers((v) => !v)}
                  className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${showAllPlayers ? "rotate-180" : ""}`}
                  />
                  {showAllPlayers
                    ? "Show less"
                    : `Show all ${commodity.keyPlayers.length}`}
                </button>
              )}
            </div>

            {/* Risk Signals & Demand Drivers — editorial rule header */}
            <div>
              <div className="border-b border-border pb-2 mb-4">
                <h2 className="font-display text-sm font-semibold text-foreground">
                  Risk Factors
                </h2>
              </div>
              <div className="space-y-2">
                {commodity.riskFactors.map((risk) => (
                  <div key={risk} className="flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 mt-0.5 text-[hsl(var(--ft-mandarin))] shrink-0" />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      {risk}
                    </span>
                  </div>
                ))}
              </div>

              {/* Demand Drivers — sub-section with rule */}
              <div className="mt-5 pt-4 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground mb-3">
                  Demand Drivers
                </h3>
                <div className="space-y-2">
                  {commodity.demandDrivers.map((driver) => (
                    <div key={driver} className="flex items-start gap-2">
                      <div className="mt-1.5 h-1.5 w-1.5 bg-[hsl(var(--primary))] shrink-0" />
                      <span className="text-[11px] text-muted-foreground leading-relaxed">
                        {driver}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-[1400px] border-t border-border px-4 py-6 sm:px-6 mt-8">
        <PerplexityAttribution />
        <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
          &copy; 2026 CommodityPulse
        </p>
      </footer>
    </div>
  );
}
