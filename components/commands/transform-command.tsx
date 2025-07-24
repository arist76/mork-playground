"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { transformData } from "@/lib/mork-api"

export function TransformCommand() {
  const [sExpr, setSExpr] = useState("(Node Node)")
  //const [patterns, setPatterns] = useState("(, (pattern1 $x))")
  //const [templates, setTemplates] = useState("(, (template1 $x))")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleTransform = async () => {
    //if (!patterns.trim() || !templates.trim()) {
    //  toast({
    //    title: "Validation Error",
    //    description: "Both patterns and templates are required",
    //    variant: "destructive",
    //  })
    //  return
    //}

    setIsLoading(true)
    try {
      const response = await transformData(sExpr)
      setResult(response.data)

      if (response.status === "success") {
        toast({
          title: "Success",
          description: response.message,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to transform data",
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
      title="Transform Data"
      description="Apply templates to matched patterns. Input S-Expression like: (transform (, (pattern)) (, (template)))"
    >
      <div className="space-y-4">
        <CodeEditor label="Patterns" value={sExpr} onChange={setSExpr} placeholder="(Node Node)" rows={4} />
      </div>

      <Button onClick={handleTransform} disabled={isLoading || !sExpr.trim()} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Transforming...
          </>
        ) : (
          "Run Transform"
        )}
      </Button>

      {result && <OutputViewer title="Transform Results" data={result} status="success" />}
    </CommandCard>
  )
}
