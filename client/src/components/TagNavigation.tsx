import { Globe, BarChart3 } from "lucide-react";

export type Region = "all" | "north-america" | "south-america" | "europe" | "asia" | "africa";
export type CommodityTag =
  | "all"
  | "lithium" | "nickel" | "cobalt" | "copper" | "aluminum" | "graphite" | "rare-earths"
  | "iron-ore" | "steel" | "gold" | "uranium" | "vanadium" | "antimony"
  | "oil" | "gas";

export interface RegionInfo {
  id: Region;
  label: string;
  newsKeywords: string[];
}

export interface CommodityInfo {
  id: CommodityTag;
  label: string;
  symbol: string; // Yahoo Finance symbol, "" for news-only
  unit: string;
  newsKeywords: string[];
}

export const REGIONS: RegionInfo[] = [
  { id: "all", label: "All Regions", newsKeywords: [] },
  { id: "north-america", label: "North America", newsKeywords: ["US", "USA", "United States", "Canada", "Mexico", "American", "Canadian", "Permian", "Gulf of Mexico", "Alberta"] },
  { id: "south-america", label: "South America", newsKeywords: ["Brazil", "Chile", "Peru", "Argentina", "Colombia", "Latin America", "Brazilian", "Chilean", "Peruvian", "Vale", "SQM", "Atacama"] },
  { id: "europe", label: "Europe", newsKeywords: ["Europe", "European", "UK", "Britain", "Germany", "Russia", "Norway", "EU", "London", "North Sea", "Shell", "BP", "Glencore"] },
  { id: "asia", label: "Asia", newsKeywords: ["China", "Chinese", "India", "Indian", "Japan", "Japanese", "Australia", "Australian", "Indonesia", "BHP", "Rio Tinto", "OPEC", "Saudi", "Middle East"] },
  { id: "africa", label: "Africa", newsKeywords: ["Africa", "African", "Congo", "DRC", "South Africa", "Ghana", "Tanzania", "Zambia", "Nigeria", "Angola", "platinum", "cobalt"] },
];

const ALL_COMMODITIES_LIST: CommodityInfo[] = [
  { id: "lithium", label: "Lithium", symbol: "LIT", unit: "USD", newsKeywords: ["lithium", "battery", "EV", "electric vehicle", "livent"] },
  { id: "nickel", label: "Nickel", symbol: "JJN", unit: "USD", newsKeywords: ["nickel"] },
  { id: "cobalt", label: "Cobalt", symbol: "", unit: "", newsKeywords: ["cobalt"] },
  { id: "copper", label: "Copper", symbol: "HG=F", unit: "USD/lb", newsKeywords: ["copper"] },
  { id: "aluminum", label: "Aluminum", symbol: "ALI=F", unit: "USD/t", newsKeywords: ["aluminum", "aluminium", "bauxite"] },
  { id: "graphite", label: "Graphite", symbol: "", unit: "", newsKeywords: ["graphite", "anode", "battery material"] },
  { id: "rare-earths", label: "Rare Earths", symbol: "REMX", unit: "USD", newsKeywords: ["rare earth", "REE", "neodymium", "praseodymium", "dysprosium", "cerium"] },
  { id: "iron-ore", label: "Iron Ore", symbol: "VALE", unit: "USD", newsKeywords: ["iron ore", "iron"] },
  { id: "steel", label: "Steel", symbol: "", unit: "", newsKeywords: ["steel", "blast furnace", "steelmaking", "hot rolled", "rebar"] },
  { id: "gold", label: "Gold", symbol: "GC=F", unit: "USD/oz", newsKeywords: ["gold", "bullion", "precious metal"] },
  { id: "uranium", label: "Uranium", symbol: "URA", unit: "USD", newsKeywords: ["uranium", "nuclear", "yellowcake", "U3O8"] },
  { id: "vanadium", label: "Vanadium", symbol: "", unit: "", newsKeywords: ["vanadium", "vanadium redox", "V2O5"] },
  { id: "antimony", label: "Antimony", symbol: "", unit: "", newsKeywords: ["antimony"] },
  { id: "oil", label: "Oil", symbol: "BZ=F", unit: "USD/bbl", newsKeywords: ["oil", "crude", "brent", "WTI", "petroleum", "OPEC", "barrel"] },
  { id: "gas", label: "Gas", symbol: "NG=F", unit: "USD/MMBtu", newsKeywords: ["natural gas", "henry hub", "gas price", "LNG", "liquefied natural gas"] },
];

// Flat list with "all" prepended — used by other components for lookups
export const COMMODITIES: CommodityInfo[] = [
  { id: "all", label: "All Commodities", symbol: "", unit: "", newsKeywords: [] },
  ...ALL_COMMODITIES_LIST,
];

interface TagNavigationProps {
  activeRegion: Region;
  activeCommodity: CommodityTag;
  onRegionChange: (region: Region) => void;
  onCommodityChange: (commodity: CommodityTag) => void;
}

export default function TagNavigation({
  activeRegion,
  activeCommodity,
  onRegionChange,
  onCommodityChange,
}: TagNavigationProps) {
  return (
    <nav className="bg-background">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* Combined navigation row */}
        <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide border-b border-border">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              data-testid={`region-tag-${region.id}`}
              onClick={() => onRegionChange(region.id)}
              className={`shrink-0 px-3 py-2.5 text-[12px] font-semibold transition-colors border-b-2 -mb-px ${
                activeRegion === region.id
                  ? "border-[hsl(var(--ft-claret))] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {region.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border mx-1 shrink-0" />
          {COMMODITIES.filter(c => c.id !== "all").map((commodity) => (
            <button
              key={commodity.id}
              data-testid={`commodity-tag-${commodity.id}`}
              onClick={() => onCommodityChange(commodity.id)}
              className={`shrink-0 px-2.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                activeCommodity === commodity.id
                  ? "border-[hsl(var(--ft-claret))] text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {commodity.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
