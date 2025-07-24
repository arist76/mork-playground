"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download } from "lucide-react"
import { exportData } from "@/lib/mork-api"
import { CodeEditor } from "../code-editor"

export function ExportCommand() {
	const [uri, setUri] = useState("")
	const [format, setFormat] = useState("metta")
	const [isLoading, setIsLoading] = useState(false)
	const [pattern, setPattern] = useState("$x")
	const [template, setTemplate] = useState("$x")
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()

	const handleExport = async () => {
		const _uri = uri === "" ? undefined : uri

		setIsLoading(true)

		try {
			const exportResponse = await exportData(pattern, template, _uri, format)

			setResult(exportResponse.data || "()")

			toast({
				title: "Export Complete 📂",
				description: `Exported to ${_uri || "memory"}`,
			})
		} catch (error) {
			toast({
				title: "Error ☹️",
				description: "Failed to export data",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<CommandCard
			title="Export Data"
			description="Export data to a file in the specified format. Supports local files and remote URLs."
		>
			<div className="space-y-4">
				<div className="space-y-4">
					<CodeEditor label="Patterns" value={pattern} onChange={setPattern} placeholder="$x" rows={4} />
					<CodeEditor label="Templates" value={template} onChange={setTemplate} placeholder="$x" rows={4} />
				</div>

				<div className="space-y-2">
					<Label htmlFor="export-uri">Export URI</Label>
					<Input
						id="export-uri"
						value={uri}
						onChange={(e) => setUri(e.target.value)}
						placeholder="file:///..."
						disabled={isLoading}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="export-format">Format</Label>
					<Select value={format} onValueChange={setFormat} disabled={isLoading}>
						<SelectTrigger id="export-format">
							<SelectValue placeholder="Select format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="metta">MeTTa</SelectItem>
							<SelectItem value="json">JSON</SelectItem>
							<SelectItem value="csv">CSV</SelectItem>
							<SelectItem value="raw">Raw</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button onClick={handleExport} disabled={isLoading || !pattern.trim() || !template.trim()} className="w-32">
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Exporting...
					</>
				) : (
					<>
						<Download className="mr-2 h-4 w-4" />
						Export Data
					</>
				)}
			</Button>

			{result && (
				<OutputViewer title="Export Result" data={result} status={!result.error ? "success" : "error"} />
			)}
		</CommandCard>
	)
}
