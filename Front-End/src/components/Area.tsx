"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
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
  },
  remainder: {
    label: "Remainder",
  },
} satisfies ChartConfig

export function Area({ interviews }: { interviews: Interview[] }) {
  const average = useMemo(() => {
    if (interviews.length === 0) return 0;
    const sum = interviews.reduce((acc, i) => acc + i.score, 0);
    return Math.round((sum / interviews.length) * 10) / 10;
  }, [interviews]);

  const chartData = useMemo(() => [
    { name: "Score", value: average, fill: "#4b0082" },
    { name: "Remainder", value: 10 - average, fill: "#2d2d2d" },
  ], [average]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {average}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      / 10
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}