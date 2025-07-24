"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { clearData } from "@/lib/mork-api"

export function ClearCommand() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleClear = async () => {
    setIsLoading(true)
    try {
      const response = await clearData()
      setResult(response.data)

      if (response.status === "success") {
        toast({
          title: "Success",
          description: response.message || "All data has been cleared from the space",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to clear data",
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
      title="Clear Data"
      description="Remove all data from the current space. This operation cannot be undone."
    >
      <div className="flex items-center gap-4">
        <Button onClick={handleClear} disabled={isLoading} variant="destructive" className="w-32">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            "Clear All Data"
          )}
        </Button>
        <p className="text-sm text-muted-foreground">This will permanently delete all data in the space</p>
      </div>

      {result && <OutputViewer title="Clear Result" data={result} status="success" />}
    </CommandCard>
  )
}
