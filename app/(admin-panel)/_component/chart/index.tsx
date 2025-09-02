'use client'
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type ChartProps = {
  usersData: any[]
}

function formatMonthlyUserData(users: any[]) {
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    return {
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      users: 0,
    }
  }).reverse()

  users.forEach((user) => {
    const createdAt = new Date(user.createdAt)
    const month = createdAt.toLocaleString("default", { month: "short" })
    const year = createdAt.getFullYear()

    const bucket = months.find((m) => m.month === month && m.year === year)
    if (bucket) bucket.users++
  })

  return months.map((m) => ({
    month: `${m.month} ${m.year.toString().slice(-2)}`,
    users: m.users,
  }))
}

const Chart = ({ usersData }: ChartProps) => {
  const monthlyUserData = formatMonthlyUserData(usersData)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">User Growth Over Time</CardTitle>
        <CardDescription className="text-muted-foreground">
          Monthly new user registrations for the past year
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            users: {
              label: "New Users",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyUserData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                className="text-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis className="text-muted-foreground" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="users"
                stroke="var(--color-chart-1)"
                strokeWidth={3}
                dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-chart-1)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default Chart
