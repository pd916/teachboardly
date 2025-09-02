'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import React from 'react'

type Props = {
    title: string;
  value: number | string;
  icon?: React.ReactNode; 
  subtitle?: string;
}

const TotalUsers = ({
    title,
    value,
    icon,
    subtitle
}: Props) => {
  return (
     <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">{title}</CardTitle>
             {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">{value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent font-medium">{subtitle}</span> from last month
              </p>
            </CardContent>
          </Card> 
  )
}

export default TotalUsers