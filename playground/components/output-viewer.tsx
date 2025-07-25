"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OutputViewerProps {
  title?: string
  data: any
  format?: "json" | "text" | "metta"
  status?: "success" | "error" | "loading"
}

export function OutputViewer({ title = "Output", data, format = "json", status = "success" }: OutputViewerProps) {
  const formatData = () => {
    if (!data) return "No output"

    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2)
      case "text":
        return String(data)
      case "metta":
        return String(data)
      default:
        return String(data)
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "loading":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge variant="outline" className={`${getStatusColor()} text-white`}>
          {status}
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <pre className="text-sm font-mono whitespace-pre-wrap">{formatData()}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
