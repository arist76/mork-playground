"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MainPanel } from "@/components/main-panel"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  const [selectedCommand, setSelectedCommand] = useState("clear")

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar selectedCommand={selectedCommand} onCommandSelect={setSelectedCommand} />
        <MainPanel selectedCommand={selectedCommand} />
        <Toaster />
      </div>
    </SidebarProvider>
  )
}
