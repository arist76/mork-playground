"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, File } from "lucide-react"
import { uploadFile, isPathClear, exportData } from "@/lib/mork-api"

export function UploadCommand() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const startPolling = (expr: string) => {
    setIsPolling(true)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await isPathClear(`/status/${encodeURIComponent(expr)}`)
        if (statusResponse.status === "success" && statusResponse.data) {
          if (statusResponse.data.isClear) {
            stopPolling()
            const exportResponse = await exportData("", "")
            if (exportResponse.status === "success") {
              setResult(exportResponse.data)
              toast({
                title: "Upload Completed",
                description: "Results received.",
              })
            } else {
              setResult({ error: exportResponse.message || "Failed to retrieve uploaded data." })
              toast({
                title: "Upload Error",
                description: exportResponse.message || "An error occurred while retrieving results.",
                variant: "destructive",
              })
            }
          } else if (statusResponse.data.status === "error") {
            setResult({ error: statusResponse.data.message || "Upload failed." })
            stopPolling()
            toast({
              title: "Upload Error",
              description: statusResponse.data.message || "An error occurred during upload.",
              variant: "destructive",
            })
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
        setResult({ error: "Failed to fetch status." })
        stopPolling()
        toast({
          title: "Polling Error",
          description: "Failed to connect to the status endpoint.",
          variant: "destructive",
        })
      }
    }, 3000) // Poll every 3 seconds
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    setIsPolling(false)
  }

  useEffect(() => {
    return () => {
      stopPolling() // Cleanup on unmount
    }
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Validation Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null) // Clear previous results
    stopPolling() // Ensure no old polling is active

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await uploadFile(formData)

      if (response.status === "success") {
        toast({
          title: "Upload Initiated",
          description: response.message,
        })
        startPolling(selectedFile.name) // Start polling with the file name as the identifier
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to initiate upload",
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <CommandCard title="Upload File" description="Upload a file to the server for processing or storage.">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file-upload">Select File</Label>
          <Input
            id="file-upload"
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            disabled={isLoading || isPolling}
            className="cursor-pointer"
          />
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <File className="h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
              </p>
            </div>
          </div>
        )}
      </div>

      <Button onClick={handleUpload} disabled={isLoading || isPolling || !selectedFile} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : isPolling ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Waiting for results...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>

      {result && <OutputViewer title="Upload Result" data={result} status={result.error ? "error" : "success"} />}
    </CommandCard>
  )
}
