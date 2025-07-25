"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CommandCard } from "@/components/command-card"
import { CodeEditor } from "@/components/code-editor"
import { OutputViewer } from "@/components/output-viewer"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { transformData, isPathClear } from "@/lib/mork-api"

interface TransformCommandProps {
	isUnderConstruction?: boolean
}

export function TransformCommand({ isUnderConstruction = false }: TransformCommandProps) {
	const [sExpr, setSExpr] = useState("(Node Node)")
	const [isLoading, setIsLoading] = useState(false)
	const [isPolling, setIsPolling] = useState(false)
	const [result, setResult] = useState<any>(null)
	const { toast } = useToast()
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

	const startPolling = (expr: string) => {
		setIsPolling(true)
		pollingIntervalRef.current = setInterval(async () => {
			try {
				const _isPathClear = await isPathClear(expr)

				if (_isPathClear) {
					stopPolling()
					setResult("Successfully transformed the space 🎉")
				}

			} catch (error) {
				console.error("Status error:", error)
				setResult({ error: "Failed to fetch status." })
				stopPolling()
				toast({
					title: "Status Error ☹️",
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

	const handleTransform = async () => {
		setIsLoading(true)
		setResult(null) // Clear previous results
		stopPolling() // Ensure no old polling is active

		try {
			const response = await transformData(sExpr)

			if (response.status === "success") {
				toast({
					title: "Transformation Initiated 🚀",
					description: response.message,
				})
				startPolling(sExpr) // Start polling with the sExpr as the identifier
			} else {
				toast({
					title: "Server Error ☹️",
					description: response.message || "Failed to initiate transformation ☹️",
					variant: "destructive",
				})
			}
		} catch (error) {
			console.error("Unknown Transform Error: ", error)
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
			title="Transform Data"
			description="Apply templates to matched patterns. Input S-Expression like: (transform (, (pattern)) (, (template)))"
			{...{ isUnderConstruction }}
		>
			<div className="space-y-4">
				<CodeEditor label="Patterns" value={sExpr} onChange={setSExpr} placeholder="(Node Node)" rows={4} />
			</div>

			<Button onClick={handleTransform} disabled={isLoading || isPolling || !sExpr.trim()} className="w-32">
				{isLoading ? (
					<>
						<Loader2 className="ml-2 mr-2 h-4 w-4 animate-spin" />
						Transforming...
					</>
				) : isPolling ? (
					<>
						<Loader2 className="ml-2 mr-2 h-4 w-4 animate-spin" />
						Waiting for results...
					</>
				) : (
					"Run Transform"
				)}
			</Button>

			{result && <OutputViewer title="Transform Results" data={result} status={result.error ? "error" : "success"} />}
		</CommandCard>
	)
}
