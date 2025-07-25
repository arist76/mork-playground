"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { importData } from "@/lib/mork-api"

interface ImportCommandProps {
	isUnderConstruction?: boolean
}

export function ImportCommand({ isUnderConstruction = false }: ImportCommandProps) {
	const [uri, setUri] = useState("")
	const [format, setFormat] = useState("json")
	const [isLoading, setIsLoading] = useState(false)
	const [pattern, setPattern] = useState("$x")
	const [template, setTemplate] = useState("$x")
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()

	const handleImport = async () => {
		if (!uri.trim()) {
			toast({
				title: "Validation Error ☹️",
				description: "URI is required",
				variant: "destructive",
			})
			return
		}

		setIsLoading(true)
		try {
			const importResponse = await importData(pattern, template, uri)

			setResult(importResponse.data)
			toast({
				title: "Import Complete 📥",
				description: `Imported items from ${uri}`,
			})
		} catch (error) {
			console.error("Unknown Import Error: ", error)
			toast({
				title: "Unknown Error",
				description: "Failed to import data",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<CommandCard
			title="Import Data"
			description="Import data from a file in the specified format. Supports local files and remote URLs."
			{...{ isUnderConstruction }}
		>
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="import-uri">Import URI</Label>
					<Input
						id="import-uri"
						value={uri}
						onChange={(e) => setUri(e.target.value)}
						placeholder="/path/to/import.json or https://example.com/data.json"
						disabled={isLoading}
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="import-format">Format</Label>
					<Select value={format} onValueChange={setFormat} disabled={isLoading}>
						<SelectTrigger id="import-format">
							<SelectValue placeholder="Select format" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="json">JSON</SelectItem>
							<SelectItem value="metta">MeTTa</SelectItem>
							<SelectItem value="csv">CSV</SelectItem>
							<SelectItem value="raw">Raw</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<Button onClick={handleImport} disabled={isLoading || !uri.trim()} className="w-32">
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Importing...
					</>
				) : (
					<>
						<Upload className="mr-2 h-4 w-4" />
						Import Data
					</>
				)}
			</Button>

			{result && (
				<OutputViewer title="Import Result" data={result} status={!result.error ? "success" : "error"} />
			)}
		</CommandCard>
	)
}
