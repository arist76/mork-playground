"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, File } from "lucide-react"

export function UploadCommand() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      const mockResult = {
        status: "success",
        filename: selectedFile.name,
        size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
        type: selectedFile.type,
        uploaded_at: new Date().toISOString(),
        message: `File ${selectedFile.name} uploaded successfully`,
      }
      setResult(mockResult)
      toast({
        title: "Upload Complete",
        description: `File ${selectedFile.name} uploaded successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
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
            disabled={isLoading}
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

      <Button onClick={handleUpload} disabled={isLoading || !selectedFile} className="w-32">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </>
        )}
      </Button>

      {result && (
        <OutputViewer title="Upload Result" data={result} status={result.status === "success" ? "success" : "error"} />
      )}
    </CommandCard>
  )
}
