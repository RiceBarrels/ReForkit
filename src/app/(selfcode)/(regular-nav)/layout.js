
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { Home } from "lucide-react";
import "@/app/animations.css"

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
                  <TooltipContent>Sidebar <span className="text-xs text-muted-foreground">⌘⇧B</span></TooltipContent>
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

                {/* New: Footer */}
                <footer className="border-t py-12">
                  <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                      <div>
                        <h3 className="font-bold mb-4">Reforkit</h3>
                        <p className="text-sm text-muted-foreground">
                          The modern web development platform for creators and developers.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <div className="space-y-2 text-sm text-muted-foreground flex flex-col gap-2 transition-colors hover:[&>*]:text-primary hover:[&>*]:underline">
                          <Link href="/features">Features</Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Me</h4>
                        <div className="space-y-2 text-sm text-muted-foreground flex flex-col gap-2 transition-colors hover:[&>*]:text-primary hover:[&>*]:underline">
                          <Link href="/about">About</Link>
                          <Link href="/blog">Blog</Link>
                          <Link href="/contact">Contact</Link>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <div className="space-y-2 text-sm text-muted-foreground flex flex-col gap-2 transition-colors hover:[&>*]:text-primary hover:[&>*]:underline">
                          <Link href="/privacy-policy">Privacy Policy</Link>
                          <Link href="/terms-of-service">Terms of Service</Link>
                          <Link href="/privacy-policy/#cookies">Cookie Policy</Link>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
                      © {new Date().getFullYear()} Muheng Fan. All rights reserved.
                    </div>
                  </div>
                </footer>
            </div>
          </main>
        </SidebarProvider>
    
    </>
  )
}
