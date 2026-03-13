import { Search, Moon, Sun } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Commodity } from "@/data/commodityData";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  isLive?: boolean;
}

// Select key indices to show in the ticker bar
const TICKER_SYMBOLS = ["Gold", "Brent Crude", "Copper", "Nickel", "Lithium", "Natural Gas", "Aluminum", "Uranium"];

function TickerItem({ name, price, change }: { name: string; price: number; change: number }) {
  const isPositive = change >= 0;
  const shortName = name.replace(" (LIT)", "").replace(" (JJN)", "").replace(" (REMX)", "").replace(" (VALE)", "").replace(" (URA)", "");
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <span className="text-[11px] text-white/80 font-medium">{shortName}</span>
      <span className={`text-[11px] font-semibold tabular-nums px-1 py-0.5 rounded-sm ${
        isPositive ? "bg-[#0d7680]/80 text-white" : "bg-[#cc0000]/80 text-white"
      }`}>
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </span>
    </div>
  );
}

export default function Header({
  searchQuery,
  onSearchChange,
  isDark,
  onToggleDark,
  isLive,
}: HeaderProps) {
  // Fetch prices for the ticker
  const { data: priceResponse } = useQuery<{
    success: boolean;
    data: Commodity[];
  }>({
    queryKey: ["/api/prices"],
    staleTime: 4 * 60 * 1000,
  });

  const tickerItems = priceResponse?.success
    ? priceResponse.data.filter((c) => TICKER_SYMBOLS.includes(c.name))
    : [];

  return (
    <header className="sticky top-0 z-20">
      {/* Market ticker bar — dark slate, real data */}
      <div className="bg-[#262a33] dark:bg-[#1c1b19]">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 sm:px-6 h-8">
          <div className="flex items-center gap-5 overflow-x-auto scrollbar-hide">
            {tickerItems.length > 0 ? (
              tickerItems.map((c) => (
                <TickerItem key={c.id} name={c.name} price={c.price} change={c.change} />
              ))
            ) : (
              <span className="text-[11px] text-white/50 font-medium tracking-wide">MARKETS</span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {isLive && (
              <span className="text-[10px] text-white/40 font-medium">Live</span>
            )}
            <button
              data-testid="dark-mode-toggle"
              aria-label="Toggle dark mode"
              onClick={onToggleDark}
              className="flex h-5 w-5 items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Masthead — large centered title, FT style */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex-1" />
          <h1
            className="font-display text-3xl sm:text-4xl font-black tracking-tight text-foreground text-center select-none"
          >
            CommodityPulse
          </h1>
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                data-testid="search-input"
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-40 rounded-none border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground sm:w-52 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
