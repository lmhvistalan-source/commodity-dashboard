import { useQuery } from "@tanstack/react-query";
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
      <div className="mb-8">
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
    <section className="mb-8">
      {/* Section header */}
      <div className="flex items-baseline justify-between border-b border-border pb-2 mb-5">
        <h2 className="font-display text-base font-bold text-foreground">
          Intelligence Brief
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          {brief.totalArticles24h} in 24h · {brief.totalArticles} total
        </span>
      </div>

      {/* Two-column editorial layout instead of symmetric 3-col dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-8">

        {/* Left: Top Signals + Activity Spikes */}
        <div className="space-y-6">
          {/* Top Signals */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Top signals</h3>
            <div className="space-y-0">
              {brief.topSignals.map((signal) => (
                <button
                  key={signal.commodity}
                  onClick={() => onCommodityClick?.(commodityToId(signal.commodity))}
                  className="w-full flex items-baseline justify-between py-2 border-b border-border/50 last:border-b-0 hover:bg-muted/20 -mx-2 px-2 transition-colors text-left group"
                  data-testid={`signal-${signal.commodity}`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {signal.commodity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {signal.dominantTopic}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {signal.articleCount} {signal.articleCount === 1 ? 'article' : 'articles'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Activity Spikes */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground mb-3">Activity spikes</h3>
            {brief.anomalies.length > 0 ? (
              <div className="space-y-0">
                {brief.anomalies.map((anomaly) => (
                  <button
                    key={anomaly.commodity}
                    onClick={() => onCommodityClick?.(commodityToId(anomaly.commodity))}
                    className="w-full flex items-baseline justify-between py-2 border-b border-border/50 last:border-b-0 hover:bg-muted/20 -mx-2 px-2 transition-colors text-left"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-[13px] font-semibold text-foreground">
                        {anomaly.commodity}
                      </span>
                      <span className="text-xs font-semibold text-[hsl(var(--ft-claret))] tabular-nums">
                        {anomaly.spike}× avg
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {anomaly.articleCount}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground/60 py-1">No unusual activity</p>
            )}

            {/* Trending inline */}
            {brief.trendingTopics.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <span className="text-[11px] text-muted-foreground">Trending: </span>
                {brief.trendingTopics.map((t, i) => (
                  <span key={t.topic} className="text-[11px] text-foreground">
                    {t.topic}{i < brief.trendingTopics.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Key Headlines */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-3">Key headlines</h3>
          <div className="space-y-0">
            {brief.keyHeadlines.map((h, i) => (
              <a
                key={i}
                href={h.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group border-b border-border/50 last:border-b-0 py-3 first:pt-0 hover:bg-muted/20 -mx-2 px-2 transition-colors"
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {h.commodity}
                  </span>
                  {h.topic && (
                    <span className="text-[11px] text-muted-foreground/60">
                      {h.topic}
                    </span>
                  )}
                </div>
                <h4 className="font-serif text-[14px] font-semibold leading-snug text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                  {h.headline}
                </h4>
                <span className="text-[11px] text-muted-foreground/50 mt-1 block">
                  {h.source}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
