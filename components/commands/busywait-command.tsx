"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { OutputViewer } from "@/components/output-viewer"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { executeBusywait } from "@/lib/mork-api"

export function BusywaitCommand() {
  const [millis, setMillis] = useState([1000])
  const [lockExpr, setLockExpr] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleBusywait = async () => {
    setIsLoading(true)
    try {
      const response = await executeBusywait(millis[0], lockExpr)
      setResult(response.data)

      if (response.status === "success") {
        toast({
          title: "Success",
          description: response.message,
        })
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
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Range: 100ms - 10,000ms (10 seconds)</p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="lock-expr" checked={lockExpr} onCheckedChange={setLockExpr} disabled={isLoading} />
          <Label htmlFor="lock-expr">Lock expr1 during execution</Label>
        </div>
      </div>

      <Button onClick={handleBusywait} disabled={isLoading} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Running...
          </>
        ) : (
          "Run Busywait"
        )}
      </Button>

      {result && <OutputViewer title="Busywait Result" data={result} status="success" />}
    </CommandCard>
  )
}
