import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FileText, Folder, Loader2 } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { truncateFileName } from "@/utils/editor-utils";

export default function FileTree({ 
  items, 
  currentPath = '', 
  folderContents, 
  loadingFolders, 
  handleFileClick, 
  fetchDirectory 
}) {
  return items.map((item) => {
    const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
    
    if (item.type === 'dir') {
      return (
        <AccordionItem key={itemPath} value={itemPath} className="border-b-0">
          <AccordionTrigger 
            className="py-2.5 mb-1 px-4 rounded-md border-b-0 hover:bg-accent hover:text-accent-foreground relative w-full"
            onClick={() => {
              if (!folderContents[itemPath] && !loadingFolders[itemPath]) {
                fetchDirectory(itemPath);
              }
            }}
          >
            <div className="inline-flex items-center gap-2 w-full pr-6">
              <Folder size={16} className="flex-shrink-0"/>
              <span className="truncate min-w-0">{item.name}</span>
              {loadingFolders[itemPath] && (
                <Loader2 className="w-4 h-4 animate-spin absolute right-4 top-1/2 -translate-y-1/2"/>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="ml-6 pl-1 border-l-[1px]">
              {folderContents[itemPath] && (
                <div className="space-y-1">
                  <FileTree 
                    items={folderContents[itemPath]} 
                    currentPath={itemPath}
                    folderContents={folderContents}
                    loadingFolders={loadingFolders}
                    handleFileClick={handleFileClick}
                    fetchDirectory={fetchDirectory}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    }
    
    return (
      <Button
        key={itemPath}
        variant="ghost"
        className="w-full justify-start gap-2 py-2"
        onClick={() => handleFileClick(item)}
      >
        <FileText size={16}/>
        <Tooltip>
          <TooltipTrigger>{truncateFileName(item.name)}</TooltipTrigger>
        </Tooltip>
      </Button>
    );
  });
} 