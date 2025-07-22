"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function TransformCommand() {
  const [patterns, setPatterns] = useState("(, (pattern1 $x))")
  const [templates, setTemplates] = useState("(, (template1 $x))")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTransform = async () => {
    if (!patterns.trim() || !templates.trim()) {
      toast({
        title: "Validation Error",
        description: "Both patterns and templates are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockResult = {
        status: "success",
        transformed: 8,
        input: `(transform ${patterns} ${templates})`,
        results: ["(template1 value1)", "(template1 value2)", "(template1 value3)"],
      }
      setResult(mockResult)
      toast({
        title: "Success",
        description: `Transformed ${mockResult.transformed} items`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to transform data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CommandCard
      title="Transform Data"
      description="Apply templates to matched patterns. Input S-Expression like: (transform (, (pattern)) (, (template)))"
    >
      <div className="space-y-4">
        <CodeEditor label="Patterns" value={patterns} onChange={setPatterns} placeholder="(, (pattern1 $x))" rows={4} />
        <CodeEditor
          label="Templates"
          value={templates}
          onChange={setTemplates}
          placeholder="(, (template1 $x))"
          rows={4}
        />
      </div>

      <Button onClick={handleTransform} disabled={isLoading || !patterns.trim() || !templates.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transforming...
          </>
        ) : (
          "Run Transform"
        )}
      </Button>

      {result && (
        <OutputViewer
          title="Transform Results"
          data={result}
          status={result.status === "success" ? "success" : "error"}
        />
      )}
    </CommandCard>
  )
}
