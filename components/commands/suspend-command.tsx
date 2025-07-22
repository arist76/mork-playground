"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Pause } from "lucide-react"

export function SuspendCommand() {
  const [location, setLocation] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleSuspend = async () => {
    if (!location.trim()) {
      toast({
        title: "Validation Error",
        description: "Thread location is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockResult = {
        status: "success",
        location: location,
        suspended_at: new Date().toISOString(),
        message: `Thread at location ${location} has been suspended`,
      }
      setResult(mockResult)
      toast({
        title: "Thread Suspended",
        description: `Thread at ${location} has been suspended`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend thread",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard title="Suspend Thread" description="Suspend execution of a MeTTa thread at the specified location.">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="suspend-location">Thread Location</Label>
          <Input
            id="suspend-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="thread_abc123"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">Enter the location of the thread you want to suspend</p>
        </div>
      </div>

      <Button onClick={handleSuspend} disabled={isLoading || !location.trim()} variant="destructive" className="w-40">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Suspending...
          </>
        ) : (
          <>
            <Pause className="mr-2 h-4 w-4" />
            Suspend Thread
          </>
        )}
      </Button>

      {result && (
        <OutputViewer title="Suspend Result" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
