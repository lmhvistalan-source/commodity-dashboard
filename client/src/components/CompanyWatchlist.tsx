import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChevronDown, ChevronRight, Plus, Settings, ExternalLink } from "lucide-react";
import WatchlistManager from "./WatchlistManager";

interface WatchlistArticle {
  id: string;
  headline: string;
  source: string;
  date: string;
  url: string;
  topic?: string;
}

interface WatchlistCompanyNews {
  id: string;
  name: string;
  ticker?: string;
  sector: string;
  articles: WatchlistArticle[];
  articleCount: number;
}

interface WatchlistCompany {
  id: string;
  name: string;
  ticker?: string;
  sector: string;
}

function getInitials(name: string): string {
  return name
    .split(/[\s\-]+/)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

// Assign a stable color based on company name
const AVATAR_COLORS = [
  { bg: "hsl(190, 45%, 92%)", text: "hsl(190, 65%, 28%)" },   // teal
  { bg: "hsl(215, 40%, 92%)", text: "hsl(215, 55%, 35%)" },   // navy
  { bg: "hsl(345, 35%, 93%)", text: "hsl(345, 60%, 38%)" },   // claret
  { bg: "hsl(25, 50%, 93%)", text: "hsl(25, 70%, 35%)" },     // copper
  { bg: "hsl(260, 25%, 93%)", text: "hsl(260, 35%, 40%)" },   // plum
  { bg: "hsl(140, 25%, 92%)", text: "hsl(140, 35%, 32%)" },   // sage
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHrs < 1) return "just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CompanyCard({ company }: { company: WatchlistCompanyNews }) {
  const [expanded, setExpanded] = useState(false);
  const color = getAvatarColor(company.name);
  const latestArticle = company.articles[0];

  return (
    <div
      data-testid={`watchlist-company-${company.id}`}
      className="group"
    >
      {/* Company header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-2.5 py-2.5 px-0 text-left hover:bg-muted/30 rounded transition-colors"
        data-testid={`watchlist-toggle-${company.id}`}
      >
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {getInitials(company.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-semibold text-foreground leading-tight truncate">
              {company.name}
            </span>
            {company.ticker && (
              <span className="text-[9px] text-muted-foreground/60 font-medium">
                {company.ticker}
              </span>
            )}
          </div>
          {/* Latest headline preview */}
          {latestArticle && (
            <p className="text-[10.5px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
              {latestArticle.headline}
            </p>
          )}
        </div>

        {/* Article count + expand */}
        <div className="flex items-center gap-1 shrink-0 mt-1">
          <span className="text-[9px] font-semibold text-muted-foreground/70 tabular-nums">
            {company.articleCount}
          </span>
          {expanded ? (
            <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
          ) : (
            <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          )}
        </div>
      </button>

      {/* Expanded article list */}
      {expanded && (
        <div className="ml-9 mb-2 space-y-0.5">
          {company.articles.map(article => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link flex items-start gap-1.5 py-1.5 text-left hover:bg-muted/20 rounded px-1 -mx-1 transition-colors"
              data-testid={`watchlist-article-${article.id}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[10.5px] text-foreground/85 leading-snug line-clamp-2 group-hover/link:text-[hsl(var(--primary))] transition-colors">
                  {article.headline}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] text-muted-foreground/60">{article.source}</span>
                  <span className="text-[8px] text-muted-foreground/40">·</span>
                  <span className="text-[9px] text-muted-foreground/50">{timeAgo(article.date)}</span>
                </div>
              </div>
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground/30 shrink-0 mt-1 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyWatchlist() {
  const [showManager, setShowManager] = useState(false);

  // Fetch watchlist companies with matched news
  const { data: newsResponse, isLoading: newsLoading } = useQuery<{
    success: boolean;
    data: WatchlistCompanyNews[];
  }>({
    queryKey: ["/api/watchlist/news"],
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });

  // Also fetch the full watchlist (including companies with no news)
  const { data: watchlistResponse } = useQuery<{
    success: boolean;
    data: WatchlistCompany[];
  }>({
    queryKey: ["/api/watchlist"],
  });

  const companiesWithNews = newsResponse?.data || [];
  const allCompanies = watchlistResponse?.data || [];
  const totalTracked = allCompanies.length;

  // Companies without news (show at bottom, collapsed)
  const idsWithNews = new Set(companiesWithNews.map(c => c.id));
  const companiesNoNews = allCompanies.filter(c => !idsWithNews.has(c.id));

  return (
    <>
      <div className="mt-5" data-testid="company-watchlist">
        {/* Section header */}
        <div className="flex items-center justify-between border-b border-border pb-2 mb-1">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Watchlist
          </h2>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            data-testid="watchlist-manage-btn"
            title="Manage watchlist"
          >
            <Settings className="w-3 h-3" />
            <span>Manage</span>
          </button>
        </div>

        {/* Tracked count */}
        <div className="flex items-center justify-between py-1.5 mb-0.5">
          <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">
            {totalTracked} companies tracked
          </span>
          {companiesWithNews.length > 0 && (
            <span className="text-[9px] text-muted-foreground/50">
              {companiesWithNews.length} with recent news
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {newsLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2.5 py-2">
                <div className="w-7 h-7 rounded bg-muted/60" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-muted/60 rounded" />
                  <div className="h-2.5 w-full bg-muted/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Companies with news */}
        {!newsLoading && companiesWithNews.length > 0 && (
          <div className="divide-y divide-border/50">
            {companiesWithNews.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}

        {/* Companies without news */}
        {!newsLoading && companiesNoNews.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30">
            <p className="text-[9px] text-muted-foreground/40 mb-1.5">No recent mentions</p>
            <div className="flex flex-wrap gap-1">
              {companiesNoNews.map(company => {
                const color = getAvatarColor(company.name);
                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-1 py-0.5 px-1.5 rounded bg-muted/20"
                    title={company.name}
                  >
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-bold"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {getInitials(company.name)}
                    </div>
                    <span className="text-[9px] text-muted-foreground/50">{company.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!newsLoading && totalTracked === 0 && (
          <button
            onClick={() => setShowManager(true)}
            className="w-full py-6 flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded border border-dashed border-border/50 hover:border-border"
            data-testid="watchlist-empty-add"
          >
            <Plus className="w-5 h-5" />
            <span className="text-[11px]">Add companies to track</span>
          </button>
        )}
      </div>

      {/* Manager modal */}
      {showManager && (
        <WatchlistManager
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
}
