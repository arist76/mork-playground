"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Activity } from "lucide-react"

export function StatusCommand() {
  const [path, setPath] = useState("/status")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleGetStatus = async () => {
    if (!path.trim()) {
      toast({
        title: "Validation Error",
        description: "Path is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockResult = {
        status: "success",
        path: path,
        server_status: "running",
        uptime: "2h 34m 12s",
        memory_usage: "45%",
        cpu_usage: "23%",
        active_threads: 3,
        queue_size: 12,
        last_activity: new Date().toISOString(),
        version: "1.2.3",
      }
      setResult(mockResult)
      toast({
        title: "Status Retrieved",
        description: "Server status information retrieved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to retrieve status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard title="Get Status" description="Retrieve current system status information from the specified path."
      isUnderConstruction={true}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status-path">Status Path</Label>
          <Input
            id="status-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/status"
            disabled={isLoading}
          />
        </div>
      </div>

      <Button onClick={handleGetStatus} disabled={isLoading || !path.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          <>
            <Activity className="mr-2 h-4 w-4" />
            Get Status
          </>
        )}
      </Button>

      {result && (
        <OutputViewer title="System Status" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
