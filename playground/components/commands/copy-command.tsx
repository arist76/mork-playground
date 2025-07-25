"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { copyData, isPathClear } from "@/lib/mork-api"

interface CopyCommandProps {
	isUnderConstruction?: boolean
}

export function CopyCommand({ isUnderConstruction = false }: CopyCommandProps) {
	const [srcExpr, setSrcExpr] = useState("()")
	const [dstExpr, setDstExpr] = useState("()")
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()


	const handleCopy = async () => {
		if (!srcExpr.trim() || !dstExpr.trim()) {
			toast({
				title: "Validation Error",
				description: "Both pattern and template are required",
				variant: "destructive",
			})
			return
		}

		setIsLoading(true)
		setResult(null) // Clear previous results

		try {
			const response = await copyData(srcExpr, dstExpr)

			if (response.status === "success") {
				setResult(response.data)
				toast({
					title: "Copy Initiated",
					description: response.message,
				})
			} else {
				toast({
					title: "Unknown Error ☹️",
					description: response.message || "Failed to initiate copy",
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
			title="Copy Data"
			description="Copy data matching patterns and apply templates to transform the results."
			{...{ isUnderConstruction }}
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<CodeEditor label="Pattern" value={srcExpr} onChange={setSrcExpr} placeholder="(test (data $v) _)" rows={3} />
				<CodeEditor label="Template" value={dstExpr} onChange={setDstExpr} placeholder="(result $v)" rows={3} />
			</div>

			<Button onClick={handleCopy} disabled={isLoading || !srcExpr.trim() || !dstExpr.trim()} className="w-32">
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Copying...
					</>
				) : (
					"Run Copy"
				)}
			</Button>

			{result && <OutputViewer title="Copy Results" data={result} status={result.error ? "error" : "success"} />}
		</CommandCard>
	)
}
