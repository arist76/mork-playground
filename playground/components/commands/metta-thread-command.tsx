"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, PlayCircle } from "lucide-react"

interface MettaThreadCommandProps {
	isUnderConstruction?: boolean
}

export function MettaThreadCommand({ isUnderConstruction = false }: MettaThreadCommandProps) {
  const [location, setLocation] = useState("")
  const [expression, setExpression] = useState("(exec (+ 1 2 3))")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const generateLocation = () => {
    const randomId = Math.random().toString(36).substring(2, 15)
    setLocation(`thread_${randomId}`)
  }

  const handleExecute = async () => {
    if (!expression.trim()) {
      toast({
        title: "Validation Error",
        description: "Expression is required",
        variant: "destructive",
      })
      return
    }

    const execLocation = location || `thread_${Math.random().toString(36).substring(2, 15)}`

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockResult = {
        status: "success",
        location: execLocation,
        expression: expression,
        result: "6",
        thread_id: "th_" + Math.random().toString(36).substring(2, 10),
        execution_time: "0.045s",
      }
      setResult(mockResult)
      toast({
        title: "Execution Complete",
        description: `MeTTa expression executed in thread ${execLocation}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute MeTTa expression",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="MeTTa Thread Execution"
      description="Execute MeTTa expressions in a separate thread with optional location specification."
      {...{ isUnderConstruction }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="thread-location">Thread Location (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="thread-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Auto-generated if empty"
              disabled={isLoading}
            />
            <Button type="button" variant="outline" onClick={generateLocation} disabled={isLoading}>
              Generate
            </Button>
          </div>
        </div>

        <CodeEditor
          label="MeTTa Expression"
          value={expression}
          onChange={setExpression}
          placeholder="(exec (+ 1 2 3))"
          rows={4}
        />
      </div>

      <Button onClick={handleExecute} disabled={isLoading || !expression.trim()} className="w-40">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Executing...
          </>
        ) : (
          <>
            <PlayCircle className="mr-2 h-4 w-4" />
            Execute Thread
          </>
        )}
      </Button>

      {result && (
        <OutputViewer
          title="Execution Result"
          data={result}
          status={result.status === "success" ? "success" : "error"}
        />
      )}
    </CommandCard>
  )
}
