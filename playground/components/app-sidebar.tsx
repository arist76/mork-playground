"use client"

import {
  Database,
  Settings,
  Copy,
  DotIcon as Counter,
  Download,
  Upload,
  ReplaceIcon as Transform,
  PlayCircle,
  Pause,
  Clock,
  Square,
  Activity,
  Radio,
  Network,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const commandGroups = [
  {
    label: "Data Management",
    commands: [
      { id: "clear", label: "Clear", icon: Database, description: "Clear all data from the space" },
      { id: "copy", label: "Copy", icon: Copy, description: "Copy data matching patterns" },
      { id: "count", label: "Count", icon: Counter, description: "Count items matching patterns" },
      { id: "export", label: "Export", icon: Download, description: "Export data to file" },
      { id: "import", label: "Import", icon: Upload, description: "Import data from file" },
      { id: "upload", label: "Upload", icon: Upload, description: "Upload file to server" },
      { id: "transform", label: "Transform", icon: Transform, description: "Apply templates to patterns" },
    ],
  },
  {
    label: "MeTTa Execution",
    commands: [
      { id: "metta-thread", label: "MeTTa Thread", icon: PlayCircle, description: "Execute MeTTa in thread" },
      { id: "suspend", label: "Suspend", icon: Pause, description: "Suspend thread execution" },
    ],
  },
  {
    label: "System Control",
    commands: [
      { id: "busywait", label: "Busywait", icon: Clock, description: "Execute busywait operation" },
      { id: "stop", label: "Stop", icon: Square, description: "Stop server operations" },
      { id: "status", label: "Status", icon: Activity, description: "Get system status" },
      { id: "status-stream", label: "Status Stream", icon: Radio, description: "Stream system status" },
    ],
  },
  {
    label: "Neo4j Integration",
    commands: [{ id: "neo4j", label: "Neo4j Setup", icon: Network, description: "Configure Neo4j connection" }],
  },
]

interface AppSidebarProps {
  selectedCommand: string
  onCommandSelect: (command: string) => void
}

export function AppSidebar({ selectedCommand, onCommandSelect }: AppSidebarProps) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h1 className="text-lg font-semibold">MORK Server</h1>
        </div>
        <p className="text-sm text-muted-foreground">Interactive UI for MORK server commands</p>
      </SidebarHeader>
      <SidebarContent>
        {commandGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.commands.map((command) => (
                  <SidebarMenuItem key={command.id}>
                    <SidebarMenuButton
                      isActive={selectedCommand === command.id}
                      onClick={() => onCommandSelect(command.id)}
                      tooltip={command.description}
                    >
                      <command.icon className="h-4 w-4" />
                      <span>{command.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
