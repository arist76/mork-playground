"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Play, Square } from "lucide-react"

export function StatusStreamCommand() {
  const [path, setPath] = useState("/status")
  const [isStreaming, setIsStreaming] = useState(false)
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: "info" | "error" | "success" }>>(
    [],
  )
  const { toast } = useToast()
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const startStream = () => {
    if (!path.trim()) {
      toast({
        title: "Validation Error",
        description: "Path is required",
        variant: "destructive",
      })
      return
    }

    setIsStreaming(true)
    setLogs([])

    // Simulate SSE stream
    const interval = setInterval(() => {
      const messages = [
        { message: "System status: Running", type: "info" as const },
        { message: "Memory usage: 45%", type: "info" as const },
        { message: "Active threads: 3", type: "success" as const },
        { message: "Queue size: 12", type: "info" as const },
        { message: "Warning: High CPU usage", type: "error" as const },
        { message: "Connection established", type: "success" as const },
      ]

      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      const newLog = {
        timestamp: new Date().toLocaleTimeString(),
        ...randomMessage,
      }

      setLogs((prev) => [...prev, newLog])
    }, 1000)

    // Auto-stop after 30 seconds for demo
    setTimeout(() => {
      clearInterval(interval)
      if (isStreaming) {
        stopStream()
      }
    }, 30000)

    toast({
      title: "Stream Started",
      description: `Streaming status from ${path}`,
    })
  }

  const stopStream = () => {
    setIsStreaming(false)
    toast({
      title: "Stream Stopped",
      description: "Status stream has been stopped",
    })
  }

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logs])

  return (
    <CommandCard
      title="Status Stream"
      description="Stream real-time status updates from the server using Server-Sent Events (SSE)."
      isUnderConstruction={true}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="stream-path">Stream Path</Label>
          <Input
            id="stream-path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/status"
            disabled={isStreaming}
          />
        </div>

        <div className="flex items-center gap-2">
          {!isStreaming ? (
            <Button onClick={startStream} className="w-32">
              <Play className="mr-2 h-4 w-4" />
              Start Stream
            </Button>
          ) : (
            <Button onClick={stopStream} variant="destructive" className="w-32">
              <Square className="mr-2 h-4 w-4" />
              Stop Stream
            </Button>
          )}
          <Badge variant={isStreaming ? "default" : "secondary"}>{isStreaming ? "Streaming" : "Stopped"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Status Log</CardTitle>
          <Badge variant="outline">{logs.length} messages</Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollAreaRef} className="h-[300px] w-full rounded-md border p-4">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isStreaming ? "Waiting for messages..." : "No messages yet. Start streaming to see status updates."}
              </p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground font-mono text-xs">{log.timestamp}</span>
                    <Badge
                      variant={log.type === "error" ? "destructive" : log.type === "success" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {log.type}
                    </Badge>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </CommandCard>
  )
}
