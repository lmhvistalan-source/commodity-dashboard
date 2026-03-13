export interface Commodity {
  id: string;
  name: string;
  price: number;
  change: number;
  unit: string;
  sparklineData: number[];
}

export interface NewsArticle {
  id: number;
  category: "metals" | "oil";
  tag: string;
  source: string;
  date: string;
  headline: string;
  summary: string;
  readTime: number;
}

function generateSparkline(base: number, volatility: number, trend: number): number[] {
  const points: number[] = [];
  let value = base * (1 - volatility * 10);
  for (let i = 0; i < 20; i++) {
    value += (Math.random() - 0.5 + trend * 0.1) * volatility * base;
    points.push(value);
  }
  // Ensure last point is near the actual price
  const lastDelta = base - points[points.length - 1];
  for (let i = 0; i < points.length; i++) {
    points[i] += lastDelta * (i / (points.length - 1));
  }
  return points;
}

export const commodities: Commodity[] = [
  {
    id: "lithium",
    name: "Lithium (LIT)",
    price: 14850,
    change: 3.1,
    unit: "USD",
    sparklineData: generateSparkline(14850, 0.01, 0.8),
  },
  {
    id: "nickel",
    name: "Nickel (JJN)",
    price: 16280,
    change: 1.2,
    unit: "USD",
    sparklineData: generateSparkline(16280, 0.008, 0.4),
  },
  {
    id: "copper",
    name: "Copper",
    price: 4.52,
    change: -0.5,
    unit: "USD/lb",
    sparklineData: generateSparkline(4.52, 0.006, -0.3),
  },
  {
    id: "aluminum",
    name: "Aluminum",
    price: 2345,
    change: 0.6,
    unit: "USD/t",
    sparklineData: generateSparkline(2345, 0.007, 0.2),
  },
  {
    id: "rareearths",
    name: "Rare Earths (REMX)",
    price: 38.75,
    change: -1.3,
    unit: "USD",
    sparklineData: generateSparkline(38.75, 0.012, -0.4),
  },
  {
    id: "iron",
    name: "Iron Ore (VALE)",
    price: 120.40,
    change: 0.8,
    unit: "USD",
    sparklineData: generateSparkline(120.40, 0.012, 0.2),
  },
  {
    id: "gold",
    name: "Gold",
    price: 2847.30,
    change: 2.4,
    unit: "USD/oz",
    sparklineData: generateSparkline(2847.30, 0.008, 1),
  },
  {
    id: "uranium",
    name: "Uranium (URA)",
    price: 28.60,
    change: 2.1,
    unit: "USD",
    sparklineData: generateSparkline(28.60, 0.015, 0.7),
  },
  {
    id: "oil",
    name: "Brent Crude",
    price: 85.20,
    change: 1.8,
    unit: "USD/bbl",
    sparklineData: generateSparkline(85.20, 0.015, 0.5),
  },
  {
    id: "natgas",
    name: "Natural Gas",
    price: 2.14,
    change: -4.2,
    unit: "USD/MMBtu",
    sparklineData: generateSparkline(2.14, 0.025, -1),
  },
];

export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    category: "metals",
    tag: "Gold",
    source: "Reuters",
    date: "Mar 1, 2026",
    headline: "Gold Surges Past $2,800 as Central Banks Accelerate Purchases",
    summary: "Central bank gold buying hit a record pace in Q1 2026, with emerging market banks leading the charge amid ongoing geopolitical uncertainty.",
    readTime: 4,
  },
  {
    id: 2,
    category: "oil",
    tag: "Crude Oil",
    source: "Bloomberg",
    date: "Mar 1, 2026",
    headline: "Brent Crude Climbs to $85 on OPEC+ Supply Tightening",
    summary: "Oil prices rallied as OPEC+ confirmed deeper production cuts through mid-2026, with Saudi Arabia leading voluntary reductions.",
    readTime: 3,
  },
  {
    id: 3,
    category: "metals",
    tag: "Lithium",
    source: "Mining Weekly",
    date: "Feb 28, 2026",
    headline: "Rio Tinto Expands Lithium Operations in Western Australia",
    summary: "Mining giant Rio Tinto announced a $2.4B expansion of its Rincon lithium project, aiming to meet surging EV battery demand.",
    readTime: 5,
  },
  {
    id: 4,
    category: "oil",
    tag: "Natural Gas",
    source: "S&P Global",
    date: "Feb 28, 2026",
    headline: "Natural Gas Futures Drop on Mild Weather Forecasts",
    summary: "Henry Hub natural gas prices fell 4.2% as extended mild weather forecasts reduced heating demand expectations.",
    readTime: 3,
  },
  {
    id: 5,
    category: "metals",
    tag: "Copper",
    source: "IEA",
    date: "Feb 27, 2026",
    headline: "Copper Demand Set to Double by 2035, Report Finds",
    summary: "A new IEA report projects copper demand will double driven by renewable energy infrastructure and EVs.",
    readTime: 6,
  },
  {
    id: 6,
    category: "oil",
    tag: "M&A",
    source: "FT",
    date: "Feb 27, 2026",
    headline: "ExxonMobil Acquires Pioneer's Permian Basin Assets for $60B",
    summary: "ExxonMobil completed its landmark acquisition, becoming the largest Permian Basin operator.",
    readTime: 4,
  },
  {
    id: 7,
    category: "metals",
    tag: "Iron Ore",
    source: "Fastmarkets",
    date: "Feb 26, 2026",
    headline: "Iron Ore Prices Stabilize as China Steel Output Recovers",
    summary: "Iron ore benchmark prices found support near $120/ton as Chinese steel mills ramped up production.",
    readTime: 3,
  },
  {
    id: 8,
    category: "oil",
    tag: "Deepwater",
    source: "Reuters",
    date: "Feb 26, 2026",
    headline: "Shell Announces $5B Investment in Gulf of Mexico Deepwater",
    summary: "Shell greenlit two major deepwater projects targeting combined peak production of 200,000 boe/d.",
    readTime: 4,
  },
];

export type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface ChartDataPoint {
  date: string;
  price: number;
}

function generateChartData(range: TimeRange): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  let numPoints: number;
  let basePrice = 2780;
  let volatility: number;

  switch (range) {
    case "1D":
      numPoints = 24;
      volatility = 3;
      break;
    case "1W":
      numPoints = 7;
      volatility = 12;
      break;
    case "1M":
      numPoints = 30;
      volatility = 18;
      break;
    case "3M":
      numPoints = 90;
      volatility = 25;
      break;
    case "1Y":
      numPoints = 52;
      volatility = 40;
      basePrice = 2400;
      break;
  }

  let price = basePrice;
  const today = new Date(2026, 2, 1); // Mar 1, 2026

  for (let i = 0; i < numPoints; i++) {
    const drift = (2847.30 - basePrice) / numPoints;
    price += drift + (Math.random() - 0.45) * volatility;
    price = Math.max(price - 100, Math.min(price + 100, price));

    let label: string;
    if (range === "1D") {
      label = `${i.toString().padStart(2, "0")}:00`;
    } else if (range === "1W") {
      const d = new Date(today);
      d.setDate(d.getDate() - (numPoints - 1 - i));
      label = d.toLocaleDateString("en-US", { weekday: "short" });
    } else if (range === "1Y") {
      const d = new Date(today);
      d.setDate(d.getDate() - (numPoints - 1 - i) * 7);
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      const d = new Date(today);
      d.setDate(d.getDate() - (numPoints - 1 - i));
      label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }

    points.push({ date: label, price: Math.round(price * 100) / 100 });
  }

  // Ensure the last point ends near the current price
  points[points.length - 1].price = 2847.30;

  return points;
}

const chartDataCache: Record<TimeRange, ChartDataPoint[]> = {} as Record<TimeRange, ChartDataPoint[]>;

export function getChartData(range: TimeRange): ChartDataPoint[] {
  if (!chartDataCache[range]) {
    chartDataCache[range] = generateChartData(range);
  }
  return chartDataCache[range];
}
