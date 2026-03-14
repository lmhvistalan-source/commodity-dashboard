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
      <span className="text-[11px] text-white/70">{shortName}</span>
      <span className={`text-[11px] font-medium tabular-nums ${
        isPositive ? "text-[#4ec9b0]" : "text-[#f48771]"
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
      {/* Market ticker bar */}
      <div className="bg-[#1c2a3a] dark:bg-[#141c28]">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between px-4 sm:px-6 h-7">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {tickerItems.length > 0 ? (
              tickerItems.map((c) => (
                <TickerItem key={c.id} name={c.name} price={c.price} change={c.change} />
              ))
            ) : (
              <span className="text-[11px] text-white/30">Loading markets...</span>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <button
              data-testid="dark-mode-toggle"
              aria-label="Toggle dark mode"
              onClick={onToggleDark}
              className="flex h-5 w-5 items-center justify-center text-white/40 hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex-1" />
          <h1
            className="font-display text-[28px] sm:text-[34px] font-bold tracking-[0.01em] text-foreground text-center select-none"
          >
            <span className="text-[hsl(var(--ft-oxford))]">Commodity</span><span className="text-foreground">Pulse</span>
          </h1>
          <div className="flex-1 flex justify-end">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
              <input
                data-testid="search-input"
                type="search"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 w-40 rounded-none border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground sm:w-48 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
