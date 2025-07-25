import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ReactNode } from "react"

interface CommandCardProps {
	title: string
	description: string
	children: ReactNode
	isUnderConstruction?: boolean
}

export function CommandCard({ title, description, children, isUnderConstruction = false }: CommandCardProps) {
	return (
		<Card className="w-full max-w-4xl relative">
			{isUnderConstruction && (
				<div className="absolute inset-0 bg-background/80 backdrop-blur-xs z-10 flex items-center justify-center rounded-lg">
					<span className="text-2xl font-bold text-muted-foreground">
						<div style={{ width: '100%', height: 0, paddingBottom: '100%', position: 'relative' }}>
							<iframe
								src="https://giphy.com/embed/vR1dPIYzQmkRzLZk2w"
								width="100%"
								height="100%"
								style={{ position: 'absolute' }}
								//frameBorder="0"
								className="giphy-embed"
								allowFullScreen
							/>
							<p>
								<a href="https://giphy.com/gifs/pudgypenguins-maintenance-under-construction-vR1dPIYzQmkRzLZk2w">
									Under Construction 🚧
								</a>
							</p>
						</div>
					</span>
				</div>
			)}
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent className={`space-y-4 ${isUnderConstruction ? "pointer-events-none opacity-50" : ""}`}>{
				children
			}</CardContent>
		</Card>
	)
}
