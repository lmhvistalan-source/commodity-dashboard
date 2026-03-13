import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import TagNavigation, { type Region, type CommodityTag, COMMODITIES } from "@/components/TagNavigation";
import KpiCard from "@/components/KpiCard";
import PriceChart from "@/components/PriceChart";
import NewsFeed from "@/components/NewsFeed";
import IntelligenceBrief from "@/components/IntelligenceBrief";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { commodities as fallbackCommodities } from "@/data/commodityData";
import type { Commodity } from "@/data/commodityData";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [activeRegion, setActiveRegion] = useState<Region>("all");
  const [activeCommodity, setActiveCommodity] = useState<CommodityTag>("all");

  const handleCommodityClick = (id: string) => {
    setLocation(`/commodity/${id}`);
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Fetch real-time prices
  const { data: priceResponse, isLoading: pricesLoading } = useQuery<{
    success: boolean;
    data: Commodity[];
    timestamp: number;
  }>({
    queryKey: ["/api/prices"],
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });

  const displayCommodities =
    priceResponse?.success && priceResponse.data
      ? priceResponse.data
      : fallbackCommodities;

  const isLive = priceResponse?.success === true;

  // Get the active commodity info for chart
  const activeCommodityInfo = COMMODITIES.find(c => c.id === activeCommodity);
  const chartSymbol = activeCommodityInfo?.symbol || "GC=F";
  const chartName = activeCommodityInfo?.label || "Gold";
  const chartUnit = activeCommodityInfo?.unit || "USD/oz";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={isDark}
        onToggleDark={() => setIsDark((d) => !d)}
        isLive={isLive}
      />

      {/* Tag Navigation */}
      <TagNavigation
        activeRegion={activeRegion}
        activeCommodity={activeCommodity}
        onRegionChange={setActiveRegion}
        onCommodityChange={setActiveCommodity}
      />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        {/* Intelligence Brief */}
        <IntelligenceBrief onCommodityClick={handleCommodityClick} />

        {/* Mobile: market data on top */}
        <div className="lg:hidden mb-6">
          <div className="border-b-2 border-foreground pb-1 mb-3">
            <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Markets Data</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            {displayCommodities.map((c) => (
              <KpiCard key={c.id} commodity={c} isLoading={pricesLoading} />
            ))}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* News: primary content */}
          <div className="flex-1 min-w-0">
            <NewsFeed
              searchQuery={searchQuery}
              activeRegion={activeRegion}
              activeCommodity={activeCommodity}
              onCommodityClick={handleCommodityClick}
            />
          </div>

          {/* Sidebar: market data + chart */}
          <div className="hidden lg:block lg:w-[340px] lg:flex-shrink-0">
            <div className="sticky top-[120px]">
              {/* Markets Data header */}
              <div className="border-b-2 border-foreground pb-1 mb-1">
                <h2 className="font-display text-sm font-bold text-foreground uppercase tracking-wider">Markets Data</h2>
              </div>
              <div className="mb-5">
                {displayCommodities.map((c) => (
                  <KpiCard key={c.id} commodity={c} isLoading={pricesLoading} />
                ))}
              </div>

              {/* Price Chart */}
              <PriceChart
                symbol={activeCommodity !== "all" ? chartSymbol : "GC=F"}
                commodityName={activeCommodity !== "all" ? chartName : "Gold"}
                commodityUnit={activeCommodity !== "all" ? chartUnit : "USD/oz"}
              />
            </div>
          </div>
        </div>

        {/* Chart below news on mobile */}
        <div className="mt-6 lg:hidden">
          <PriceChart
            symbol={activeCommodity !== "all" ? chartSymbol : "GC=F"}
            commodityName={activeCommodity !== "all" ? chartName : "Gold"}
            commodityUnit={activeCommodity !== "all" ? chartUnit : "USD/oz"}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-[1400px] border-t border-border px-4 py-6 sm:px-6 mt-8">
        <PerplexityAttribution />
        <p className="text-center text-[11px] text-muted-foreground/50 mt-2">
          &copy; 2026 CommodityPulse. {isLive ? "Live data via Yahoo Finance (15 min delay)." : "Market data is simulated."}
        </p>
      </footer>
    </div>
  );
}
