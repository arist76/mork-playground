"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { clearData, isPathClear } from "@/lib/mork-api"
import { CodeEditor } from "../code-editor"

export function ClearCommand() {
	const [isLoading, setIsLoading] = useState(false)
	const [sExpr, setSExpr] = useState("$x")
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()


	const handleClear = async () => {
		setIsLoading(true)
		setResult(null) // Clear previous results

		try {
			const clearResponse = await clearData(sExpr)

			if (clearResponse.status === "success") {
				toast({
					title: "Cleared 🧹",
					description: clearResponse.message || "Clear operation initiated.",
				})
			} else {
				console.error("Clear task failure: ", clearResponse.message)
				toast({
					title: "Clear task failure ☹️",
					description: clearResponse.message || "Failed to initiate clear data",
					variant: "destructive",
				})
			}
		} catch (error) {
			console.error("Unknown Clear Error: ", error)
			toast({
				title: "Unknown Error ☹️",
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
			<div className="space-y-4">
				<CodeEditor label="Sub Expression" value={sExpr} onChange={setSExpr} placeholder="(Node Node)" rows={4} />
			</div>
			<div className="flex items-center gap-4">

				<Button onClick={handleClear} disabled={isLoading} variant="destructive" className="w-32">
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Clearing...
						</>
					)
						: (
							"Clear"
						)}
				</Button>
				<p className="text-sm text-muted-foreground">This will permanently delete all data in the provided sub space</p>
			</div>

			{result && <OutputViewer title="Clear Result" data={result} status={result.error ? "error" : "success"} />}
		</CommandCard>
	)
}
