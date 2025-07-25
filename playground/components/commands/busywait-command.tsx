"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { OutputViewer } from "@/components/output-viewer"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { executeBusywait, getStatus } from "@/lib/mork-api"

interface BusywaitCommandProps {
	isUnderConstruction?: boolean
}

export function BusywaitCommand({ isUnderConstruction = false }: BusywaitCommandProps) {
  const [millis, setMillis] = useState([1000])
  const [lockExpr, setLockExpr] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const busywaitExpr = `busywait-${millis[0]}-${lockExpr}`

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
              title: "Busywait Completed",
              description: "Results received.",
            })
          } else if (statusResponse.data.status === "error") {
            setResult({ error: statusResponse.data.message || "Busywait failed." })
            stopPolling()
            toast({
              title: "Busywait Error",
              description: statusResponse.data.message || "An error occurred during busywait.",
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

  const handleBusywait = async () => {
    setIsLoading(true)
    setResult(null) // Clear previous results
    stopPolling() // Ensure no old polling is active

    try {
      const response = await executeBusywait(millis[0], lockExpr)

      if (response.status === "success") {
        toast({
          title: "Busywait Initiated",
          description: response.message,
        })
        startPolling(busywaitExpr) // Start polling with the busywaitExpr as the identifier
      } else {
        toast({
          title: "Error",
          description: response.message || "Busywait operation failed",
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
      title="Busywait Operation"
      description="Execute a busywait operation for the specified duration with optional expression locking."
      {...{ isUnderConstruction }}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="duration-slider">Duration: {millis[0]}ms</Label>
          <Slider
            id="duration-slider"
            min={100}
            max={10000}
            step={100}
            value={millis}
            onValueChange={setMillis}
            className="w-full"
            disabled={isLoading || isPolling}
          />
          <p className="text-xs text-muted-foreground">Range: 100ms - 10,000ms (10 seconds)</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="lock-expr" checked={lockExpr} onCheckedChange={setLockExpr} disabled={isLoading || isPolling} />
          <Label htmlFor="lock-expr">Lock expr1 during execution</Label>
        </div>
      </div>

      <Button onClick={handleBusywait} disabled={isLoading || isPolling} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running...
          </>
        ) : isPolling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for results...
          </>
        ) : (
          "Run Busywait"
        )}
      </Button>

      {result && <OutputViewer title="Busywait Result" data={result} status={result.error ? "error" : "success"} />}
    </CommandCard>
  )
}
