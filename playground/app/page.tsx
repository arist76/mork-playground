"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MainPanel } from "@/components/main-panel"
import { Toaster } from "@/components/ui/toaster"
import { SidebarInset } from "@/components/ui/sidebar"

export default function Home() {
  const [selectedCommand, setSelectedCommand] = useState("clear")

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar selectedCommand={selectedCommand} onCommandSelect={setSelectedCommand} />
        <SidebarInset className="flex-1">
          <MainPanel selectedCommand={selectedCommand} />
        </SidebarInset>
        <Toaster />
      </div>
    </SidebarProvider>
  )
}
