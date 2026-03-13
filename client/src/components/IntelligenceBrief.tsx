import { useQuery } from "@tanstack/react-query";
import { TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Signal {
  commodity: string;
  articleCount: number;
  dominantTopic: string;
  topicCount: number;
}

interface Anomaly {
  commodity: string;
  articleCount: number;
  avgCount: number;
  spike: number;
}

interface TrendingTopic {
  topic: string;
  count: number;
}

interface KeyHeadline {
  headline: string;
  commodity: string;
  topic: string;
  source: string;
  url: string;
}

interface IntelBrief {
  generatedAt: string;
  period: string;
  totalArticles24h: number;
  totalArticles: number;
  topSignals: Signal[];
  anomalies: Anomaly[];
  trendingTopics: TrendingTopic[];
  keyHeadlines: KeyHeadline[];
}

// Signal bar
function SignalBar({ strength }: { strength: number }) {
  const bars = 5;
  const filled = Math.min(bars, Math.max(1, Math.round(strength)));
  return (
    <div className="flex items-end gap-px h-3">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-sm ${
            i < filled
              ? strength >= 4
                ? "bg-[hsl(var(--ft-claret))]"
                : strength >= 3
                ? "bg-[hsl(var(--ft-mandarin))]"
                : "bg-[hsl(var(--primary))]"
              : "bg-border"
          }`}
          style={{ height: `${40 + i * 15}%` }}
        />
      ))}
    </div>
  );
}

// FT color tokens for commodities and topics
const commodityColor = (name: string) => {
  const map: Record<string, string> = {
    Gold: "text-[hsl(var(--ft-mandarin))]", Oil: "text-[hsl(var(--ft-claret))]",
    Copper: "text-[hsl(var(--ft-mandarin))]", Nickel: "text-[hsl(var(--primary))]",
    Gas: "text-[hsl(var(--ft-oxford))]", Lithium: "text-[hsl(var(--primary))]",
    Cobalt: "text-[hsl(var(--ft-oxford))]", Aluminum: "text-[hsl(var(--primary))]",
    "Rare Earths": "text-[hsl(var(--ft-oxford))]", "Iron Ore": "text-[hsl(var(--ft-claret))]",
    Steel: "text-muted-foreground", Uranium: "text-[hsl(var(--primary))]",
    Vanadium: "text-[hsl(var(--ft-oxford))]", Antimony: "text-[hsl(var(--ft-claret))]",
    Graphite: "text-muted-foreground",
  };
  return map[name] || "text-muted-foreground";
};

const topicColor = (topic: string) => {
  const map: Record<string, string> = {
    "Capital Project": "text-[hsl(var(--ft-oxford))]", "M&A": "text-[hsl(var(--ft-claret))]",
    Policy: "text-[hsl(var(--ft-claret))]", "Supply Chain": "text-[hsl(var(--ft-mandarin))]",
    Exploration: "text-[hsl(var(--primary))]", Production: "text-[hsl(var(--primary))]",
    Market: "text-[hsl(var(--ft-oxford))]", ESG: "text-[hsl(var(--primary))]",
    Technology: "text-[hsl(var(--ft-oxford))]", Financials: "text-[hsl(var(--ft-mandarin))]",
  };
  return map[topic] || "text-muted-foreground";
};

interface IntelligenceBriefProps {
  onCommodityClick?: (id: string) => void;
}

export default function IntelligenceBrief({ onCommodityClick }: IntelligenceBriefProps) {
  const { data: response, isLoading } = useQuery<{ success: boolean; data: IntelBrief }>({
    queryKey: ["/api/intel"],
    staleTime: 10 * 60 * 1000,
    refetchInterval: 15 * 60 * 1000,
  });

  const brief = response?.success ? response.data : null;

  if (isLoading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!brief) return null;

  const commodityToId = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace("(", "").replace(")", "");

  return (
    <section className="mb-6">
      {/* Section header — FT editorial style with rule line */}
      <div className="flex items-baseline justify-between border-b-2 border-foreground pb-1 mb-4">
        <h2 className="font-display text-lg font-bold text-foreground tracking-tight">
          Intelligence Brief
        </h2>
        <div className="flex items-baseline gap-3 text-[11px] text-muted-foreground">
          <span className="uppercase tracking-wider font-semibold text-[hsl(var(--ft-claret))]">{brief.period}</span>
          <span>{brief.totalArticles24h} in 24h &middot; {brief.totalArticles} total</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Signals */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Top Signals</span>
          </div>
          <div className="space-y-2">
            {brief.topSignals.map((signal) => (
              <button
                key={signal.commodity}
                onClick={() => onCommodityClick?.(commodityToId(signal.commodity))}
                className="w-full flex items-center gap-2.5 py-1.5 hover:bg-muted/30 -mx-1.5 px-1.5 transition-colors text-left group"
                data-testid={`signal-${signal.commodity}`}
              >
                <SignalBar strength={Math.min(5, Math.ceil(signal.articleCount / 3))} />
                <span className={`text-[11px] font-bold uppercase tracking-wide ${commodityColor(signal.commodity)}`}>
                  {signal.commodity}
                </span>
                <span className={`text-[11px] ${topicColor(signal.dominantTopic)}`}>
                  {signal.dominantTopic}
                </span>
                <span className="ml-auto text-[11px] text-muted-foreground tabular-nums font-medium">
                  {signal.articleCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Activity Spikes + Trending */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--ft-mandarin))]" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Activity Spikes</span>
          </div>
          {brief.anomalies.length > 0 ? (
            <div className="space-y-2">
              {brief.anomalies.map((anomaly) => (
                <button
                  key={anomaly.commodity}
                  onClick={() => onCommodityClick?.(commodityToId(anomaly.commodity))}
                  className="w-full flex items-center gap-2.5 py-1.5 hover:bg-muted/30 -mx-1.5 px-1.5 transition-colors text-left"
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wide ${commodityColor(anomaly.commodity)}`}>
                    {anomaly.commodity}
                  </span>
                  <span className="text-[11px] text-[hsl(var(--ft-claret))] font-bold tabular-nums">
                    {anomaly.spike}x
                  </span>
                  <span className="text-[11px] text-muted-foreground">vs avg</span>
                  <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">{anomaly.articleCount}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60 py-2">No unusual spikes</p>
          )}

          <div className="mt-4 pt-3 border-t border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Trending</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
              {brief.trendingTopics.map((t) => (
                <span key={t.topic} className="text-[11px] text-foreground font-medium">
                  {t.topic} <span className="text-muted-foreground/50 tabular-nums text-[10px]">{t.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Headlines */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">Key Headlines</span>
          </div>
          <div className="space-y-3">
            {brief.keyHeadlines.map((h, i) => (
              <a
                key={i}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div className="flex items-baseline gap-2">
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${commodityColor(h.commodity)}`}>
                    {h.commodity}
                  </span>
                </div>
                <h3 className="font-serif text-[13px] font-semibold leading-snug text-foreground group-hover:text-[hsl(var(--ft-claret))] transition-colors mt-0.5">
                  {h.headline}
                </h3>
                <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {h.source}{h.topic ? ` · ${h.topic}` : ""}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
