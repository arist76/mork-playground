"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { copyData, getStatus } from "@/lib/mork-api"

export function CopyCommand() {
  const [pattern, setPattern] = useState("(test (data $v) _)")
  const [template, setTemplate] = useState("(result $v)")
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const copyExpr = `copy-${encodeURIComponent(pattern)}-${encodeURIComponent(template)}`

  const startPolling = (expr: string) => {
    setIsPolling(true)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await getStatus(`/status/${encodeURIComponent(expr)}`)
        if (statusResponse.status === "success" && statusResponse.data) {
          if (statusResponse.data.status === "completed") {
            setResult(statusResponse.data.result)
            stopPolling()
            toast({
              title: "Copy Completed",
              description: "Results received.",
            })
          } else if (statusResponse.data.status === "error") {
            setResult({ error: statusResponse.data.message || "Copy failed." })
            stopPolling()
            toast({
              title: "Copy Error",
              description: statusResponse.data.message || "An error occurred during copy.",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
        setResult({ error: "Failed to fetch status." })
        stopPolling()
        toast({
          title: "Polling Error",
          description: "Failed to connect to the status endpoint.",
          variant: "destructive",
        })
      }
    }, 3000) // Poll every 3 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
  }

  useEffect(() => {
    return () => {
      stopPolling() // Cleanup on unmount
    }
  }, [])

  const handleCopy = async () => {
    if (!pattern.trim() || !template.trim()) {
      toast({
        title: "Validation Error",
        description: "Both pattern and template are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null) // Clear previous results
    stopPolling() // Ensure no old polling is active

    try {
      const response = await copyData(pattern, template)

      if (response.status === "success") {
        toast({
          title: "Copy Initiated",
          description: response.message,
        })
        startPolling(copyExpr) // Start polling with the copyExpr as the identifier
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to initiate copy",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="Copy Data"
      description="Copy data matching patterns and apply templates to transform the results."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CodeEditor label="Pattern" value={pattern} onChange={setPattern} placeholder="(test (data $v) _)" rows={3} />
        <CodeEditor label="Template" value={template} onChange={setTemplate} placeholder="(result $v)" rows={3} />
      </div>

      <Button onClick={handleCopy} disabled={isLoading || isPolling || !pattern.trim() || !template.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Copying...
          </>
        ) : isPolling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for results...
          </>
        ) : (
          "Run Copy"
        )}
      </Button>

      {result && <OutputViewer title="Copy Results" data={result} status={result.error ? "error" : "success"} />}
    </CommandCard>
  )
}
