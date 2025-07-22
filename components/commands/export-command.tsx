"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download } from "lucide-react"

export function ExportCommand() {
  const [uri, setUri] = useState("")
  const [format, setFormat] = useState("json")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleExport = async () => {
    if (!uri.trim()) {
      toast({
        title: "Validation Error",
        description: "URI is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockResult = {
        status: "success",
        exported: 156,
        uri: uri,
        format: format,
        size: "2.4 MB",
        message: `Data exported successfully to ${uri}`,
      }
      setResult(mockResult)
      toast({
        title: "Export Complete",
        description: `Exported ${mockResult.exported} items to ${uri}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="Export Data"
      description="Export data to a file in the specified format. Supports local files and remote URLs."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="export-uri">Export URI</Label>
          <Input
            id="export-uri"
            value={uri}
            onChange={(e) => setUri(e.target.value)}
            placeholder="/path/to/export.json or https://example.com/data.json"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="export-format">Format</Label>
          <Select value={format} onValueChange={setFormat} disabled={isLoading}>
            <SelectTrigger id="export-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="metta">MeTTa</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="raw">Raw</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleExport} disabled={isLoading || !uri.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </>
        )}
      </Button>

      {result && (
        <OutputViewer title="Export Result" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
