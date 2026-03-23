"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type Interview = {
  id: number;
  institution: string;
  score: number;
  interview_date: string;
};

const chartConfig = {
  score: {
    label: "Score",
    color: "#4b0082",
  },
} satisfies ChartConfig

export function Graph({ interviews }: { interviews: Interview[] }) {
  const chartData = useMemo(() =>
    [...interviews].reverse().map((i) => ({
      institution: i.institution,
      score: i.score,
    })),
    [interviews]
  );

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData} barSize={50}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="institution"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis domain={[0, 10]} hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="score" fill="var(--color-score)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}