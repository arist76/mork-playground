import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface CommandCardProps {
  title: string
  description: string
  children: ReactNode
}

export function CommandCard({ title, description, children }: CommandCardProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}
