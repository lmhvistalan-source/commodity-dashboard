import type { Commodity } from "@/data/commodityData";
import { ArrowUp, ArrowDown } from "lucide-react";

interface KpiCardProps {
  commodity: Commodity;
  isLoading?: boolean;
}

function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 48;
  const height = 20;
  const padding = 1;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = padding + (1 - (v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const color = isPositive ? "hsl(184, 84%, 26%)" : "hsl(340, 82%, 33%)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function KpiCard({ commodity, isLoading }: KpiCardProps) {
  const isPositive = commodity.change >= 0;

  return (
    <div
      data-testid={`kpi-card-${commodity.id}`}
      className={`flex items-center justify-between py-2.5 px-0 border-b border-border last:border-b-0 transition-opacity ${isLoading ? "animate-pulse opacity-70" : ""}`}
    >
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] font-semibold text-foreground truncate">{commodity.name}</span>
        <span className="text-[9px] text-muted-foreground/60">{commodity.unit}</span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Sparkline data={commodity.sparklineData} isPositive={isPositive} />
        <div className="flex flex-col items-end">
          <span
            className="text-[13px] font-bold text-foreground tabular-nums"
          >
            ${formatPrice(commodity.price)}
          </span>
          <div className="flex items-center gap-0.5">
            {isPositive ? (
              <ArrowUp className="h-2.5 w-2.5 text-[hsl(var(--primary))]" />
            ) : (
              <ArrowDown className="h-2.5 w-2.5 text-[hsl(var(--ft-claret))]" />
            )}
            <span
              className={`text-[11px] font-semibold tabular-nums ${isPositive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--ft-claret))]"}`}
            >
              {isPositive ? "+" : ""}{commodity.change.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
