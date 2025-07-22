"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function CopyCommand() {
  const [pattern, setPattern] = useState("(test (data $v) _)")
  const [template, setTemplate] = useState("(result $v)")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

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
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockResult = {
        status: "success",
        copied: 15,
        pattern: pattern,
        template: template,
        results: ["(result value1)", "(result value2)", "(result value3)"],
      }
      setResult(mockResult)
      toast({
        title: "Success",
        description: `Copied ${mockResult.copied} items`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy data",
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

      <Button onClick={handleCopy} disabled={isLoading || !pattern.trim() || !template.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Copying...
          </>
        ) : (
          "Run Copy"
        )}
      </Button>

      {result && (
        <OutputViewer title="Copy Results" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
