"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface CodeEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  syntax?: string
  rows?: number
}

export function CodeEditor({ label, value, onChange, placeholder, syntax = "metta", rows = 4 }: CodeEditorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, "-")}>{label}</Label>
      <Textarea
        id={label.toLowerCase().replace(/\s+/g, "-")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="font-mono text-sm"
        aria-describedby={`${label.toLowerCase().replace(/\s+/g, "-")}-description`}
      />
      <p id={`${label.toLowerCase().replace(/\s+/g, "-")}-description`} className="text-xs text-muted-foreground">
        {syntax === "metta" ? "MeTTa S-Expression syntax" : `${syntax} format`}
      </p>
    </div>
  )
}
