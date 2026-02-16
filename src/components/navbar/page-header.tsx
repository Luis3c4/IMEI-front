import { SidebarTrigger } from "@/components/ui/sidebar"
import { PanelLeft } from "lucide-react"

export function PageHeader() {
  return (
    <div className="fixed top-4 left-4 z-50 md:hidden">
      <SidebarTrigger className="h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 hover:bg-accent border border-border">
        <PanelLeft className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  )
}
