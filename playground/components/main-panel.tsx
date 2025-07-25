"use client"

import { ClearCommand } from "@/components/commands/clear-command"
import { CopyCommand } from "@/components/commands/copy-command"
import { CountCommand } from "@/components/commands/count-command"
import { ExportCommand } from "@/components/commands/export-command"
import { ImportCommand } from "@/components/commands/import-command"
import { UploadCommand } from "@/components/commands/upload-command"
import { TransformCommand } from "@/components/commands/transform-command"
import { MettaThreadCommand } from "@/components/commands/metta-thread-command"
import { SuspendCommand } from "@/components/commands/suspend-command"
import { BusywaitCommand } from "@/components/commands/busywait-command"
import { StopCommand } from "@/components/commands/stop-command"
import { StatusCommand } from "@/components/commands/status-command"
import { StatusStreamCommand } from "@/components/commands/status-stream-command"
import { Neo4jCommand } from "@/components/commands/neo4j-command"

interface MainPanelProps {
  selectedCommand: string
}

export function MainPanel({ selectedCommand }: MainPanelProps) {
  const renderCommand = () => {
    switch (selectedCommand) {
      case "clear":
        return <ClearCommand />
      case "copy":
        return <CopyCommand />
      case "count":
        return <CountCommand />
      case "export":
        return <ExportCommand />
      case "import":
        return <ImportCommand />
      case "upload":
        return <UploadCommand />
      case "transform":
        return <TransformCommand />
      case "metta-thread":
        return <MettaThreadCommand />
      case "suspend":
        return <SuspendCommand />
      case "busywait":
        return <BusywaitCommand />
      case "stop":
        return <StopCommand />
      case "status":
        return <StatusCommand />
      case "status-stream":
        return <StatusStreamCommand />
      case "neo4j":
        return <Neo4jCommand />
      default:
        return <ClearCommand />
    }
  }

  return <div className="p-6 w-full">{renderCommand()}</div>
}
