"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { GameCompletion } from "@/lib/types";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  completionTime: {
    label: "Completion Time",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AreaChartBoard({ data }: { data: GameCompletion[] }) {
  const chartData = data.map((item: GameCompletion) => ({
    completionTime: Math.floor(item.completionTime).toString().slice(0, 3),
    count: data.filter((d) => d.completionTime.toString().slice(0, 3) === item.completionTime.toString().slice(0, 3)).length,
  }));
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 4,
          right: 4,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="completionTime"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="count"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
