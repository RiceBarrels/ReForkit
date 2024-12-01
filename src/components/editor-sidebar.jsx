import { FileText, Folder, Settings, PlusCircle, Download } from "lucide-react"
import { MdDriveFolderUpload, MdOutlineUploadFile } from "react-icons/md";
import { Separator } from "@/components/ui/separator"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Menu items for editor navigation
const editorItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    shortcut: "⌘,"
  },
]

export function EditorSidebar() {
  return (
    <Sidebar>
      <TooltipProvider delayDuration={100} skipDelayDuration={100}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Editor</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
              {/* open by default */} 
              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="mx-2 py-2"><span className="inline-flex items-center gap-2"><FileText size={16}/> Files</span></AccordionTrigger>
                  <AccordionContent className="mx-2">
                    <div className="flex flex-row gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="w-6 h-8"><PlusCircle size={16}/></Button>
                        </TooltipTrigger>
                        <TooltipContent>New File <span className="text-xs text-muted-foreground">⌘N</span></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="w-5 h-8"><Folder size={16}/></Button>
                        </TooltipTrigger>
                        <TooltipContent>New Folder <span className="text-xs text-muted-foreground">⌘⇧N</span></TooltipContent>
                      </Tooltip>
                      <div className="flex-1"/>
                      <Separator orientation="vertical" className="h-8"/>
                      <div className="flex-1"/>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="w-5 h-8"><MdOutlineUploadFile size={16}/></Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload File <span className="text-xs text-muted-foreground">⌘O</span></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="w-5 h-8"><MdDriveFolderUpload size={16}/></Button>
                        </TooltipTrigger>
                        <TooltipContent>Upload Folder <span className="text-xs text-muted-foreground">⌘⇧O</span></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" className="w-5 h-8"><Download size={16}/></Button>
                        </TooltipTrigger>
                        <TooltipContent>Download as ZIP <span className="text-xs text-muted-foreground">⌘D</span></TooltipContent>
                      </Tooltip>
                    </div>
                    <Separator className="my-2"/>

                  </AccordionContent>
                </AccordionItem>
              </Accordion>

                {editorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex flex-row gap-2 w-full">
                        <item.icon />
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </TooltipProvider>
    </Sidebar>
  )
}
