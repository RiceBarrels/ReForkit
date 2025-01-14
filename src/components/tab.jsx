import { IoClose } from "react-icons/io5";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Folder, Loader2, Settings, XIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { truncateFileName } from "@/utils/editor-utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getLanguageFromFileName } from "@/utils/editor-utils";
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { MdOutlineUploadFile } from "react-icons/md";

// Add this new component for sortable tabs
export function SortableTab({ id, className, name, panelId, onClose, onClick, fileDir, panelGroups, index }) {
    const panel = panelGroups.find(p => p.id === panelId);
    const active = panel?.activeTab === id;
    
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ 
      id,
      data: {
        type: 'tab',
        panelId,
        path: fileDir,
        index
      }
    });
  
    const [mouseDownTime, setMouseDownTime] = useState(0);
    
    const handleMouseDown = () => {
      setMouseDownTime(Date.now());
    };
  
    const handleMouseUp = (e) => {
      // If the mouse was down for less than 200ms, consider it a click
      if (Date.now() - mouseDownTime < 200) {
        onClick(e);
      }
    };
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      position: isDragging ? 'relative' : undefined,
      zIndex: isDragging ? 1000 : undefined,
    };
  
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center ml-1 my-0.5 rounded-md bg-[#88888820] backdrop-blur-md border border-[#88888820] cursor-pointer hover:bg-[#88888830] hover:border-[#88888830] hover:scale-105 active:scale-100 active:bg-[#88888840] active:border-[#88888840] active:z-10 group duration-150 ease-in-out ${
          active ? 'bg-[#88888840!important] border-[#88888840!important]' : ''
        } ${className}`}
      >
        <div 
          {...attributes} 
          {...listeners} 
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          className="flex items-center pl-4 py-[0.50rem]"
        >
          <span className="truncate text-sm max-w-[150px]">{name}</span>
        </div>
        <button
          className={`mx-1 p-1 hover:bg-accent-foreground/10 rounded opacity-0 transition-all duration-150 ease-in-out group-hover:opacity-100 ${active ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => {
            e.stopPropagation();
            onClose(e);
          }}
        >
          <IoClose size={14} />
        </button>
      </div>
    );
  }



// Add this new component for empty tabs
export function EmptyTab({ files, folderContents, loadingFolders, handleFileClick, owner, repo, fetchDirectory, handleOpenUtilityTabs }) {
    const [expandFile, setExpandFile] = useState(false);
  
    // Reuse the renderFileTree function logic but with some modifications for the empty tab view
    const renderEmptyTabFileTree = (items, currentPath = '') => {
      return items.map((item) => {
        const itemPath = currentPath ? `${currentPath}/${item.name}` : item.name;
        
        if (item.type === 'dir') {
          return (
            <AccordionItem key={itemPath} value={itemPath} className="border-b-0">
              <AccordionTrigger 
                className="py-2 px-4 rounded-md border-b-0 hover:bg-accent hover:text-accent-foreground relative w-full text-sm"
                onClick={() => {
                  if (!folderContents[itemPath] && !loadingFolders[itemPath]) {
                    fetchDirectory(itemPath);
                  }
                }}
              >
                <div className="inline-flex items-center gap-2 w-full pr-6">
                  <Folder size={14} className="flex-shrink-0"/>
                  <span className="truncate min-w-0">{item.name}</span>
                  {loadingFolders[itemPath] && (
                    <Loader2 className="w-3 h-3 animate-spin absolute right-2 top-1/2 -translate-y-1/2"/>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="ml-4 pl-1 border-l-[1px]">
                  {folderContents[itemPath] && (
                    <div className="space-y-1">
                      {renderEmptyTabFileTree(folderContents[itemPath], itemPath)}
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
            className="w-full justify-start gap-2 py-1.5 px-4 text-sm h-auto"
            onClick={() => handleFileClick(item)}
          >
            <FileText size={14}/>
            {truncateFileName(item.name)}
          </Button>
        );
      });
    };
  
    return (
      <div className="flex flex-col items-center justify-start h-full text-muted-foreground p-4">
        <div className="text-lg font-semibold mb-4">New Tab</div>
  
        <div className="w-full max-w-md">
          <Button 
            variant="outline" 
            className={`w-full gap-2 transition-all mb-4 ${expandFile ? 'invisible scale-75 opacity-0 h-0 mb-0' : ''}`}
            onClick={() => setExpandFile(true)}
          >
            <MdOutlineUploadFile size={16} />
            Open File
          </Button>
  
          <div className={`transition-all duration-200 origin-top ${expandFile ? 'opacity-100 scale-100' : 'opacity-0 scale-0 h-0'}`}>
            <div className="flex flex-col bg-background/50 backdrop-blur-sm border rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">Open a File</div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 mb-1"
                  onClick={() => setExpandFile(false)}
                >
                  <XIcon size={16} />
                </Button>
              </div>
              <Separator className="mt-2 mb-4" />
              <Accordion type="multiple" className="w-full">
                {renderEmptyTabFileTree(files)}
              </Accordion>
            </div>
          </div>
          {/* Utility Tabs */}
          <div className="flex flex-col bg-background/50 backdrop-blur-sm border rounded-lg p-4">
            <div className="text-lg font-semibold">Utility Tabs</div>
            <Separator className="mt-2 mb-4" />
            <div className="flex flex-col">
          <Button 
            variant="outline" 
            className={`w-full gap-2 transition-all mb-4`}
            onClick={() => {
              handleOpenUtilityTabs('settings');
            }}
            >
                <Settings size={16} />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add this new component for the drag overlay
export function DragOverlayTab({ name }) {
  return (
    <div className="flex items-center ml-1 my-1 rounded-md bg-[#88888840] border border-[#88888840] px-4 py-2 shadow-lg backdrop-blur-sm cursor-pointer opacity-95 pointer-events-none">
      <span className="truncate text-sm max-w-[150px]">{name}</span>
    </div>
  );
}

export function CodeEditorTab({ code, setCode, currentPath, isActive }) {
  return (
    <div className="flex">
      <div className="line-numbers text-muted-foreground select-none px-4 min-w-[64px] text-right flex-shrink-0 bg-[#333]">
        {code.split('\n').map((_, i) => (
          <div key={i + 1} className="editor-line-number text-accent-foreground bg-background">
            {i + 1}
          </div>
        ))}
      </div>
      <div id="view">
        <Editor
          value={code}
          onValueChange={setCode}
          highlight={code => {
            try {
              const language = getLanguageFromFileName(currentPath);
              console.log(language);
              console.log(Prism.languages);
              if (!Prism.languages[language]) {
                console.warn(`Language '${language}' not found, using javascript`);
                return Prism.highlight(code, Prism.languages.javascript, 'javascript');
              }
              return Prism.highlight(code, Prism.languages[language], language);
            } catch (error) {
              console.error('Highlighting error:', error);
              return code;
            }
          }}
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 14,
            backgroundColor: 'var(--background)',
            borderRadius: '4px',
            minWidth: '100%',
            whiteSpace: 'pre',
          }}
          className="editor-wrapper whitespace-pre"
          textareaClassName="editor-textarea whitespace-pre"
          preClassName="editor-pre whitespace-pre"
        />
      </div>
    </div>
  );
}