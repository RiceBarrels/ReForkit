
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { Home } from "lucide-react";

export default function EditorLayout({ children }) {
  return (
    <>
    
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <TooltipProvider className="flex items-center" delayDuration={100} skipDelayDuration={100}>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarTrigger />
                  </TooltipTrigger>
                  <TooltipContent>Editor Sidebar <span className="text-xs text-muted-foreground">⌘⇧B</span></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7 ml-2"><Home /></Link>
                  </TooltipTrigger>
                  <TooltipContent>Home <span className="text-xs text-muted-foreground">⌘H</span></TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            <div className="overflow-auto flex-1">
                {children}
            </div>
          </main>
        </SidebarProvider>
    
    </>
  )
}
