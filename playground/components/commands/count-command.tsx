"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function CountCommand() {
	const [pattern, setPattern] = useState("(test (data $v) _)")
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()

	const handleCount = async () => {
		if (!pattern.trim()) {
			toast({
				title: "Validation Error",
				description: "Pattern is required",
				variant: "destructive",
			})
			return
		}

		setIsLoading(true)
		try {
			await new Promise((resolve) => setTimeout(resolve, 800))
			const mockResult = {
				status: "success",
				count: Math.floor(Math.random() * 100) + 1,
				pattern: pattern,
			}
			setResult(mockResult)
			toast({
				title: "Success",
				description: `Found ${mockResult.count} matching items`,
			})
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to count items",
				variant: "destructive",
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<CommandCard
			title="Count Items"
			description="Count the number of items that match the specified pattern."
			isUnderConstruction={true}
		>
			<CodeEditor label="Pattern" value={pattern} onChange={setPattern} placeholder="(test (data $v) _)" rows={3} />

			<Button onClick={handleCount} disabled={isLoading || !pattern.trim()} className="w-32">
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Counting...
					</>
				) : (
					"Count Items"
				)}
			</Button>

			{result && (
				<OutputViewer title="Count Result" data={result} status={result.status === "success" ? "success" : "error"} />
			)}
		</CommandCard>
	)
}
