import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { X, Plus, Trash2, Building2, Search } from "lucide-react";

interface WatchlistCompany {
  id: string;
  name: string;
  ticker?: string;
  sector: string;
}

const SECTOR_OPTIONS = [
  "Mining",
  "Oil & Gas",
  "Gold",
  "Lithium",
  "Trading",
  "Steel",
  "Uranium",
  "Rare Earths",
  "Other",
];

// Suggested companies for quick add
const SUGGESTED_COMPANIES: { name: string; ticker: string; sector: string }[] = [
  { name: "Teck Resources", ticker: "TECK", sector: "Mining" },
  { name: "Lithium Americas", ticker: "LAC", sector: "Lithium" },
  { name: "Fortescue", ticker: "FMG", sector: "Mining" },
  { name: "SQM", ticker: "SQM", sector: "Lithium" },
  { name: "Southern Copper", ticker: "SCCO", sector: "Mining" },
  { name: "Cameco", ticker: "CCJ", sector: "Uranium" },
  { name: "First Quantum", ticker: "FM", sector: "Mining" },
  { name: "Pan American Silver", ticker: "PAAS", sector: "Mining" },
  { name: "Antofagasta", ticker: "ANTO", sector: "Mining" },
  { name: "Pilbara Minerals", ticker: "PLS", sector: "Lithium" },
  { name: "Chevron", ticker: "CVX", sector: "Oil & Gas" },
  { name: "Shell", ticker: "SHEL", sector: "Oil & Gas" },
  { name: "BP", ticker: "BP", sector: "Oil & Gas" },
  { name: "TotalEnergies", ticker: "TTE", sector: "Oil & Gas" },
  { name: "Ivanhoe Mines", ticker: "IVN", sector: "Mining" },
  { name: "Lundin Mining", ticker: "LUN", sector: "Mining" },
  { name: "NexGen Energy", ticker: "NXE", sector: "Uranium" },
  { name: "MP Materials", ticker: "MP", sector: "Rare Earths" },
  { name: "Nucor", ticker: "NUE", sector: "Steel" },
  { name: "ArcelorMittal", ticker: "MT", sector: "Steel" },
];

interface WatchlistManagerProps {
  onClose: () => void;
}

export default function WatchlistManager({ onClose }: WatchlistManagerProps) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [sector, setSector] = useState("Mining");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: watchlistResponse, isLoading } = useQuery<{
    success: boolean;
    data: WatchlistCompany[];
  }>({
    queryKey: ["/api/watchlist"],
  });

  const companies = watchlistResponse?.data || [];
  const watchlistIds = new Set(companies.map(c => c.id));

  const addMutation = useMutation({
    mutationFn: async (company: { name: string; ticker?: string; sector: string }) => {
      const res = await apiRequest("POST", "/api/watchlist", company);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/news"] });
      setName("");
      setTicker("");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/watchlist/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist/news"] });
    },
  });

  const handleAdd = () => {
    if (!name.trim()) return;
    addMutation.mutate({
      name: name.trim(),
      ticker: ticker.trim() || undefined,
      sector,
    });
  };

  const handleQuickAdd = (company: { name: string; ticker: string; sector: string }) => {
    addMutation.mutate(company);
  };

  // Filter suggestions that aren't already in watchlist
  const availableSuggestions = SUGGESTED_COMPANIES.filter(s => {
    const id = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    return !watchlistIds.has(id);
  }).filter(s =>
    searchFilter
      ? s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.ticker.toLowerCase().includes(searchFilter.toLowerCase())
      : true
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" data-testid="watchlist-manager">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-[420px] max-w-[95vw] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">
              Manage watchlist
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Track companies and get matched news alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="watchlist-manager-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Add form */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium block mb-2">
              Add a company
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Company name"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="flex-1 h-8 px-2.5 text-[12px] bg-muted/30 border border-border rounded text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]/50"
                data-testid="watchlist-input-name"
              />
              <input
                type="text"
                placeholder="Ticker"
                value={ticker}
                onChange={e => setTicker(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="w-16 h-8 px-2 text-[12px] bg-muted/30 border border-border rounded text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/30 focus:border-[hsl(var(--primary))]/50"
                data-testid="watchlist-input-ticker"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="flex-1 h-8 px-2 text-[12px] bg-muted/30 border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/30"
                data-testid="watchlist-select-sector"
              >
                {SECTOR_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={handleAdd}
                disabled={!name.trim() || addMutation.isPending}
                className="h-8 px-3 text-[11px] font-semibold bg-[hsl(var(--primary))] text-white rounded hover:bg-[hsl(var(--primary))]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                data-testid="watchlist-add-btn"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>
          </div>

          {/* Current watchlist */}
          <div>
            <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium block mb-2">
              Current watchlist ({companies.length})
            </label>
            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-8 bg-muted/40 rounded" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 py-3 text-center">
                No companies in your watchlist
              </p>
            ) : (
              <div className="space-y-0.5">
                {companies.map(company => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/20 group transition-colors"
                    data-testid={`watchlist-item-${company.id}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[12px] font-medium text-foreground truncate block">
                          {company.name}
                        </span>
                        <span className="text-[9px] text-muted-foreground/50">
                          {company.ticker && `${company.ticker} \u00b7 `}{company.sector}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMutation.mutate(company.id)}
                      disabled={removeMutation.isPending}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-[hsl(var(--destructive))]/10 text-muted-foreground/40 hover:text-[hsl(var(--destructive))] transition-all"
                      title="Remove from watchlist"
                      data-testid={`watchlist-remove-${company.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested companies */}
          {availableSuggestions.length > 0 && (
            <div>
              <label className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-medium block mb-2">
                Suggested companies
              </label>
              {/* Search filter */}
              <div className="relative mb-2">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
                <input
                  type="text"
                  placeholder="Filter suggestions..."
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  className="w-full h-7 pl-6 pr-2 text-[11px] bg-muted/20 border border-border/50 rounded text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]/30"
                  data-testid="watchlist-search-suggestions"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {availableSuggestions.slice(0, 12).map(company => (
                  <button
                    key={company.ticker}
                    onClick={() => handleQuickAdd(company)}
                    disabled={addMutation.isPending}
                    className="inline-flex items-center gap-1 py-1 px-2 text-[10px] border border-border/60 rounded hover:bg-muted/30 hover:border-[hsl(var(--primary))]/30 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    data-testid={`watchlist-suggest-${company.ticker}`}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span className="font-medium">{company.ticker}</span>
                    <span className="text-muted-foreground/50">{company.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border">
          <button
            onClick={onClose}
            className="w-full h-8 text-[12px] font-medium text-foreground border border-border rounded hover:bg-muted/30 transition-colors"
            data-testid="watchlist-manager-done"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
