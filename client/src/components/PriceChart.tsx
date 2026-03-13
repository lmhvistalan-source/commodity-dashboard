import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getChartData, type TimeRange, type ChartDataPoint } from "@/data/commodityData";
import { Loader2 } from "lucide-react";

const timeRanges: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y"];

interface PriceChartProps {
  symbol?: string;
  commodityName?: string;
  commodityUnit?: string;
}

export default function PriceChart({
  symbol = "GC=F",
  commodityName = "Gold",
  commodityUnit = "USD/oz",
}: PriceChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>("1M");

  // Fetch real chart data from API, keyed by symbol + range
  const { data: chartResponse, isLoading } = useQuery<{
    success: boolean;
    data: ChartDataPoint[];
    meta?: { name: string; unit: string };
  }>({
    queryKey: ["/api/chart", `?range=${activeRange}&symbol=${encodeURIComponent(symbol)}`],
    staleTime: 10 * 60 * 1000,
  });

  // Use API data if available, otherwise fall back to generated data
  const data =
    chartResponse?.success && chartResponse.data?.length > 0
      ? chartResponse.data
      : getChartData(activeRange);

  const isLive = chartResponse?.success === true && chartResponse.data?.length > 0;
  const displayName = chartResponse?.meta?.name || commodityName;
  const displayUnit = chartResponse?.meta?.unit || commodityUnit;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <h2 className="font-display text-sm font-bold text-foreground">{displayName} Price</h2>
          <span className="text-[11px] text-muted-foreground">{displayUnit}</span>
          {isLive && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
              Live
            </span>
          )}
        </div>
        <div className="flex gap-0.5">
          {timeRanges.map((range) => (
            <button
              key={range}
              data-testid={`chart-range-${range}`}
              onClick={() => setActiveRange(range)}
              className={`px-2 py-1 text-[11px] font-medium uppercase tracking-wide transition-colors border-b-2 ${
                activeRange === range
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[300px] w-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["dataMin - 20", "dataMax + 20"]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
              width={72}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "2px",
                fontSize: "11px",
                color: "hsl(var(--foreground))",
                fontFamily: "'DM Sans', system-ui, sans-serif",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Price"]}
              labelStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#tealGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
