"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { OutputViewer } from "@/components/output-viewer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Square, AlertTriangle } from "lucide-react"

interface StopCommandProps {
	isUnderConstruction?: boolean
}

export function StopCommand({ isUnderConstruction = false }: StopCommandProps) {
  const [waitForIdle, setWaitForIdle] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleStop = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockResult = {
        status: "success",
        wait_for_idle: waitForIdle,
        stopped_at: new Date().toISOString(),
        active_threads_stopped: 3,
        message: `Server operations stopped ${waitForIdle ? "after waiting for idle" : "immediately"}`,
      }
      setResult(mockResult)
      toast({
        title: "Server Stopped",
        description: "All server operations have been stopped",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop server operations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="Stop Server"
      description="Stop all server operations. This will halt all running processes and threads."
      {...{ isUnderConstruction }}
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="wait-idle" checked={waitForIdle} onCheckedChange={setWaitForIdle} disabled={isLoading} />
          <Label htmlFor="wait-idle">Wait for idle before stopping</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {waitForIdle
            ? "Server will wait for all operations to complete before stopping"
            : "Server will stop immediately, potentially interrupting running operations"}
        </p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" disabled={isLoading} className="w-32">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="mr-2 h-4 w-4" />
                Stop Server
              </>
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Server Stop
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will stop all server operations and may interrupt running processes.
              {waitForIdle
                ? " The server will wait for current operations to complete."
                : " Operations will be stopped immediately."}
              <br />
              <br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStop}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Stop Server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {result && (
        <OutputViewer title="Stop Result" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
