"use client"

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import { highlight, languages } from 'prismjs/components/prism-core';

import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';

import EditorShortcuts from './editor-shortcuts';
import { motion } from 'framer-motion';
import { SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import { Home, Plus, XIcon } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PiRectangle, PiSidebarFill } from "react-icons/pi";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import './editor-styles.css';
import { FileText, Folder, Settings, PlusCircle, Download, Loader2 } from "lucide-react";
import { MdDriveFolderUpload, MdOutlineUploadFile } from "react-icons/md";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { fetchGitHubFile } from '@/app/actions/github';
import { IoClose } from "react-icons/io5";
import { DndContext, DragOverlay, defaultDropAnimation, defaultDropAnimationSideEffects } from "@dnd-kit/core";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { arrayMove } from "@dnd-kit/sortable";
import { useDroppable } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// Menu items for editor navigation
const editorItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    shortcut: "⌘,"
  },
]

const getLanguageFromFileName = (filename) => {
  if (!filename) return 'javascript';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    java: 'java',
    cs: 'csharp',
    css: 'css',
    json: 'js',
    md: 'markdown',
    yaml: 'yaml',
    yml: 'yaml',
    sh: 'bash',
    bash: 'bash',
    sql: 'sql',
    php: 'php',
    html: 'markup',
    htm: 'markup',
    mjs: 'js',

  };

  return languageMap[extension] || 'jsx';
};

// Add this helper function near the top with other utility functions
const truncateFileName = (fileName, maxLength = 20) => {
  if (fileName.length <= maxLength) return fileName;
  const extension = fileName.split('.').pop();
  const nameWithoutExt = fileName.slice(0, -(extension.length + 1));
  const truncatedName = nameWithoutExt.slice(0, maxLength - 3 - extension.length);
  return `${truncatedName}...${extension}`;
};

// Add this new component for sortable tabs
function SortableTab({ id, name, panelId, onClose, onClick, fileDir, panelGroups }) {
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
      path: fileDir
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
      className={`flex items-center ml-1 my-0.5 rounded-md bg-[#88888820] backdrop-blur-md border border-[#88888820] cursor-pointer hover:bg-[#88888830] hover:border-[#88888830] hover:scale-105 active:scale-100 active:bg-[#88888840] active:border-[#88888840] active:z-10 group transition-[transform,border,background] hover:transition-[transform,border,background] active:transition-[border,background] duration-150 ease-in-out ${
        active ? 'bg-[#88888840!important] border-[#88888840!important]' : ''
      }`}
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

// Add this new component for the editor
function CodeEditorTab({ code, setCode, currentPath, isActive }) {
  return (
    <div 
      className="flex"
    >
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
          onValueChange={(newCode) => {
            setCode(newCode);
          }}
          highlight={code => {
            try {
              const language = getLanguageFromFileName(currentPath);
              if (!Prism.languages[language]) {
                console.warn(`Language '${language}' not found, falling back to 'plaintext'`);
                return code;
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

// Add this new component for the drag overlay
function DragOverlayTab({ name }) {
  return (
    <div className="flex items-center ml-1 my-1 rounded-md bg-[#88888840] border border-[#88888840] px-4 py-2 shadow-lg backdrop-blur-sm cursor-pointer opacity-95 pointer-events-none">
      <span className="truncate text-sm max-w-[150px]">{name}</span>
    </div>
  );
}

// Update the panel component to include a droppable area
function EditorPanel({ panel, children }) {
  const { setNodeRef } = useDroppable({
    id: `panel-${panel.id}`,
  });

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col relative h-full"
      style={{ 
        position: 'relative',
        minHeight: '100%'
      }}
    >
      {children}
    </div>
  );
}

// Add this new component for empty tabs
function EmptyTab({ files, folderContents, loadingFolders, handleFileClick, owner, repo, fetchDirectory }) {
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

        <div className={`transition-all duration-200 origin-top ${expandFile ? 'opacity-100 scale-100' : 'opacity-0 scale-0 invisible'}`}>
          <div className="flex flex-col bg-background/50 backdrop-blur-sm border rounded-lg p-4">
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
      </div>
    </div>
  );
}

export default function CodeEditor({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const { user: owner, repo } = resolvedParams;
  
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const { isSignedIn } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [folderContents, setFolderContents] = useState({});

  // Add a new state to track loading state for each folder
  const [loadingFolders, setLoadingFolders] = useState({});

  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Add new state for panel groups
  const [panelGroups, setPanelGroups] = useState([
    { id: 1, tabs: [], activeTab: null, fileLoading: false, currentContent: { type: 'code' } },
    { id: 2, tabs: [], activeTab: null, fileLoading: false, currentContent: { type: 'code' } }
  ]);
  const [activePanelId, setActivePanelId] = useState(1);
  const [hoveringPanelId, setHoveringPanelId] = useState(null);

  // Add a helper function to check if file is an image
  const isImageFile = (filename) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Fetch directory contents
  const fetchDirectory = async (path = '') => {
    try {
      if (path === '') {
        setSidebarLoading(true);
      } else {
        setLoadingFolders(prev => ({ ...prev, [path]: true }));
      }
      setError(null);
      
      const result = await fetchGitHubFile(owner, repo, path);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch directory contents');
      }

      // Sort files and directories
      const sortedContent = result.content.sort((a, b) => {
        // Directories first
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
        // Then alphabetically
        return a.name.localeCompare(b.name);
      });

      if (path === '') {
        setFiles(sortedContent);
      } else {
        setFolderContents(prev => ({
          ...prev,
          [path]: sortedContent
        }));
      }
    } catch (err) {
      console.error("Directory fetch error:", err);
      setError(err.message);
    } finally {
      if (path === '') {
        setSidebarLoading(false);
      } else {
        setLoadingFolders(prev => ({ ...prev, [path]: false }));
      }
    }
  };

  // Update handleFileClick to fix tab reopening
  const handleFileClick = async (file) => {
    try {
      // Check if tab already exists in any panel
      let existingPanel;
      let existingTab;
      
      // Update the tab existence check to use the full file path
      panelGroups.forEach(panel => {
        const tab = panel.tabs.find(tab => tab.path === file.path);
        if (tab) {
          existingPanel = panel;
          existingTab = tab;
        }
      });

      if (existingTab) {
        // Update the panel groups to activate the existing tab
        setPanelGroups(prev => prev.map(panel => {
          if (panel.id === existingPanel.id) {
            // If it's a code tab, make sure to set the code state
            if (existingTab.type === 'code') {
              setCode(existingTab.content);
            }
            return {
              ...panel,
              activeTab: existingTab.path,
              currentContent: existingTab.type === 'image' ? 
                { type: 'image', url: existingTab.content.url } : 
                { type: existingTab.type || 'code' }
            };
          }
          return panel;
        }));
        setCurrentPath(file.path);
        return;
      }

      // Set loading state for active panel
      setPanelGroups(prev => prev.map(panel => ({
        ...panel,
        fileLoading: panel.id === activePanelId ? true : panel.fileLoading
      })));

      setError(null);
      
      // Create new tab object
      let newTab;
      if (isImageFile(file.name)) {
        newTab = {
          path: file.path,
          name: file.name,
          type: 'image',
          content: { url: file.download_url }
        };
        setPanelGroups(prev => prev.map(panel => {
          if (panel.id === activePanelId) {
            return {
              ...panel,
              tabs: [...panel.tabs, newTab],
              activeTab: file.path,
              fileLoading: false,
              currentContent: { type: 'image', url: file.download_url }
            };
          }
          return panel;
        }));
      } else {
        const result = await fetchGitHubFile(owner, repo, file.path);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch file content');
        }

        newTab = {
          path: file.path,
          name: file.name,
          type: 'code',
          content: result.content
        };
        setCode(result.content);
        setPanelGroups(prev => prev.map(panel => {
          if (panel.id === activePanelId) {
            return {
              ...panel,
              tabs: [...panel.tabs, newTab],
              activeTab: file.path,
              fileLoading: false,
              currentContent: { type: 'code' }
            };
          }
          return panel;
        }));
      }

      setCurrentPath(file.path);

    } catch (err) {
      console.error("File fetch error:", err);
      setError(err.message);
      setPanelGroups(prev => prev.map(panel => ({
        ...panel,
        fileLoading: false
      })));
    }
  };

  // Update handleCloseTab to properly handle empty tabs
  const handleCloseTab = (path, event) => {
    event.stopPropagation();
    
    const panelWithTab = panelGroups.find(panel => 
      panel.tabs.some(t => t.path === path)
    );

    if (!panelWithTab) return;

    setPanelGroups(prev => prev.map(panel => {
      if (panel.id === panelWithTab.id) {
        const remainingTabs = panel.tabs.filter(t => t.path !== path);
        const closedTab = panel.tabs.find(t => t.path === path);
        
        // If this was the active tab, set a new active tab
        let newActiveTab = null;
        let newContent = { type: 'code' };
        
        if (panel.activeTab === path && remainingTabs.length > 0) {
          const tabIndex = panel.tabs.findIndex(t => t.path === path);
          // Try to select the previous tab, or the next one if there is no previous
          const newIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
          const nextTab = remainingTabs[newIndex];
          newActiveTab = nextTab.path;
          newContent = nextTab.type === 'image' ? 
            { type: 'image', url: nextTab.content.url } : 
            { type: nextTab.type || 'code' };
          
          if (nextTab.type === 'code') {
            setCode(nextTab.content || '');
          }
          setCurrentPath(nextTab.path);
        } else if (panel.activeTab === path) {
          setCode('');
          setCurrentPath('');
        }

        return {
          ...panel,
          tabs: remainingTabs,
          activeTab: newActiveTab,
          currentContent: newContent
        };
      }
      return panel;
    }));
  };

  // Initial load
  useEffect(() => {
    if (isSignedIn) {
      fetchDirectory();
    }
  }, [isSignedIn, owner, repo]); // Updated dependencies to use unwrapped values

  const renderFileTree = (items, currentPath = '') => {
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
                    {renderFileTree(folderContents[itemPath], itemPath)}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                key={itemPath}
                variant="ghost"
                className="w-full justify-start gap-2 py-2"
                onClick={() => handleFileClick(item)}
              >
                <FileText size={16}/>
                {truncateFileName(item.name)}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {item.name}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  const panelRef = useRef(null);

  const toggleSidebar = () => {
    if (panelRef.current) {
      if (sidebarOpen) {
        // Animate closing from 24 to 0
        for (let i = 24; i >= 0; i--) {
          setTimeout(() => {
            panelRef.current.resize(i);
          }, (24 - i) * 5); // 5ms delay per step
        }
      } else {
        // Animate opening from 0 to 24
        for (let i = 0; i <= 24; i++) {
          setTimeout(() => {
            panelRef.current.resize(i);
          }, i * 5); // 5ms delay per step
        }
      }
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleShortcut = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'b') {
      event.preventDefault();
      toggleSidebar();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleShortcut);
    return () => document.removeEventListener('keydown', handleShortcut);
  }, [sidebarOpen]);

  // Add sensor configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor)
  );

  const [activeId, setActiveId] = useState(null);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    if (!activeId || !hoveringPanelId) return;

    // Only proceed if hovering over a different panel
    if (hoveringPanelId !== `panel-${activePanelId}`) {
      setPanelGroups(prev => {
        // Find the source panel that contains the dragged tab
        const sourcePanel = prev.find(p => p.tabs.some(t => t.path === activeId));
        if (!sourcePanel) return prev;

        // Get the dragged tab
        const draggedTab = sourcePanel.tabs.find(t => t.path === activeId);
        if (!draggedTab) return prev;
        
        // Get target panel ID from hovering panel ID
        const targetPanelId = parseInt(hoveringPanelId.split('-')[1]);
        if (!targetPanelId) return prev;
        
        return prev.map(panel => {
          // Remove tab from source panel
          if (panel.id === sourcePanel.id) {
            const tabIndex = panel.tabs.findIndex(t => t.path === activeId);
            const remainingTabs = panel.tabs.filter(t => t.path !== activeId);
            
            // Determine new active tab for source panel
            let newActiveTab = panel.activeTab;
            if (panel.activeTab === activeId && remainingTabs.length > 0) {
              // Try to select the previous tab, or the next one if there is no previous
              const newIndex = Math.max(0, Math.min(tabIndex - 1, remainingTabs.length - 1));
              newActiveTab = remainingTabs[newIndex]?.path || null;
            } else if (panel.activeTab === activeId) {
              newActiveTab = null;
            }

            return {
              ...panel,
              tabs: remainingTabs,
              activeTab: newActiveTab
            };
          }
          
          // Add tab to target panel
          if (panel.id === targetPanelId) {
            return {
              ...panel,
              tabs: [...panel.tabs, draggedTab],
              activeTab: activeId
            };
          }
          
          return panel;
        });
      });
    }
    
    setActiveId(null);
    setHoveringPanelId(null);
  };

  // Update handleNewTab to ensure unique IDs and proper content type
  const handleNewTab = (panelId) => {
    const newTabId = `new-tab-${Date.now()}`; // Generate unique ID
    setPanelGroups(prev => prev.map(panel => {
      if (panel.id === panelId) {
        // Check if there's already an empty tab
        const hasEmptyTab = panel.tabs.some(tab => tab.type === 'empty');
        if (hasEmptyTab) {
          // If there's already an empty tab, just activate it
          const emptyTab = panel.tabs.find(tab => tab.type === 'empty');
          return {
            ...panel,
            activeTab: emptyTab.path,
            currentContent: { type: 'empty' }
          };
        }
        // Otherwise create a new empty tab
        return {
          ...panel,
          tabs: [...panel.tabs, { 
            path: newTabId,
            name: 'New Tab',
            type: 'empty',
            content: null
          }],
          activeTab: newTabId,
          currentContent: { type: 'empty' }
        };
      }
      return panel;
    }));
  };

  return (
    <SidebarProvider className="h-screen flex">
        <ResizablePanelGroup 
            direction="horizontal" 
            className="min-h-screen rounded-lg"
        >
            <ResizablePanel 
                ref={panelRef}
                defaultSize={24}
                minSize={0}
                maxSize={82}
                collapsible={true}
            >
                <Sidebar className="h-full w-full border-r" collapsible="none">
                    <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                        <SidebarContent className="h-full">
                            <SidebarGroup className="h-full">
                                <SidebarGroupLabel>Editor</SidebarGroupLabel>
                                <SidebarGroupContent className="h-full">
                                    <SidebarMenu className="h-full">
                                        <Accordion type="multiple" collapsible="true" defaultValue={["files"]} className="h-full">
                                            <AccordionItem value="files" className="h-full border-b-0">
                                                <AccordionTrigger className="mx-2 py-2">
                                                    <span className="inline-flex items-center gap-2">
                                                        <FileText size={16}/> Files
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="mx-2 mt-2 h-[calc(100vh-8rem)] overflow-auto">
                                                    {sidebarLoading && !folderContents[currentPath] ? (
                                                        <div className="flex justify-center py-4">
                                                            <Loader2 className="w-4 h-4 animate-spin"/>
                                                        </div>
                                                    ) : error ? (
                                                        <div className="text-destructive text-sm py-2">
                                                            {error}
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            {renderFileTree(files)}
                                                        </div>
                                                    )}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </TooltipProvider>
                </Sidebar>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel className="flex flex-col">
              <div className='max-h-6 min-h-6 flex items-center m-0.5'>
                  <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <Link href="/" className="hover:bg-accent rounded-md p-1 px-4 flex items-center max-h-6">
                                  <Home size={16}/>
                              </Link>
                          </TooltipTrigger>
                          <TooltipContent>Home <span className="text-[10px] text-muted-foreground">⌘H</span></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <div className="hover:bg-accent font-semibold rounded-md p-1 px-4 text-sm cursor-pointer flex items-center max-h-6">
                                  Help
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>Help <span className="text-[10px] text-muted-foreground">⌘K</span></TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  {currentPath} {hoveringPanelId} {activeId}
              </div>
              {/* Editor panels */}
        <ResizablePanelGroup 
                direction="horizontal" 
                className="flex flex-1 rounded-lg"
            >
                {panelGroups.map((panel, index) => (
                  <React.Fragment key={panel.id}>
                    <ResizablePanel 
                      className={`flex flex-col relative`}
                      id={`panel-${panel.id}`}
                      onMouseEnter={() => setHoveringPanelId(`panel-${panel.id}`)}
                      onMouseLeave={() => setHoveringPanelId(null)}
                      onMouseDown={() => setActivePanelId(panel.id)}
                      minSize={24}
                    >
                      <EditorPanel panel={panel}>
                        {/* Add tabs */}
                        <DndContext
                          sensors={sensors}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToWindowEdges]}
                        >
                          <div
                            className='flex overflow-x-auto overflow-y-hidden border-y w-full h-12 justify-start items-center relative'
                          >
                            <SortableContext
                              items={panel.tabs.map(tab => tab.path)}
                              strategy={horizontalListSortingStrategy}
                            >
                              {panel.tabs.map(tab => (
                                <SortableTab
                                  key={tab.path}
                                  id={tab.path}
                                  name={truncateFileName(tab.name)}
                                  panelId={panel.id}
                                  panelGroups={panelGroups}
                                  onClick={() => {
                                    setPanelGroups(prev => prev.map(p => ({
                                      ...p,
                                      activeTab: p.id === panel.id ? tab.path : p.activeTab,
                                      currentContent: p.id === panel.id ? 
                                        (tab.type === 'image' ? { type: 'image', url: tab.content.url } : { type: 'code' }) 
                                        : p.currentContent
                                    })));
                                    if (tab.type === 'code') {
                                      setCode(tab.content);
                                    }
                                    setCurrentPath(tab.path);
                                  }}
                                  onClose={(e) => handleCloseTab(tab.path, e)}
                                  fileDir={tab.path}
                                />
                              ))}
                            </SortableContext>
                            <div 
                              className="flex p-1 items-center mx-4 my-1 rounded-md bg-[#88888820] backdrop-blur-md border border-[#88888820] cursor-pointer hover:bg-[#88888830] hover:border-[#88888830] hover:scale-105 active:scale-100 active:bg-[#88888840] active:border-[#88888840] active:z-10 group transition-[transform,border,background] hover:transition-[transform,border,background] active:transition-[border,background] duration-150 ease-in-out"
                              onClick={() => handleNewTab(panel.id)}
                            >
                              <Plus size={16}/>
                            </div>
                          </div>
                          <DragOverlay 
                            dropAnimation={{
                              duration: 150,
                              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                            }} 
                            className="opacity-95 pointer-events-none"
                          >
                            {activeId ? <DragOverlayTab name={truncateFileName(activeId)} /> : null}
                          </DragOverlay>
                        </DndContext>
                        {/* Editor content */}
                        <div className={`h-[calc(100dvh-1rem)] editor-content transition-all duration-250 overflow-x-scroll overflow-y-scroll py-2 pr-2 m-2 ${
                          hoveringPanelId === `panel-${panel.id}` && activeId && activePanelId !== panel.id ? 
                          'opacity-65 bg-[#187cff54]' : ''
                        }`}>
                            {(() => {
                              if (panel.fileLoading) {
                                return (
                                  <div className="flex justify-center py-4">
                                    <Loader2 className="w-6 h-6 animate-spin"/>
                                  </div>
                                );
                              }

                              if (panel.currentContent.type === 'image') {
                                return (
                                  <div className="flex justify-center items-center h-full">
                                    <img 
                                      src={panel.currentContent.url} 
                                      alt={currentPath}
                                      className="max-w-full h-auto object-contain"
                                      style={{ maxHeight: 'calc(100vh - 8rem)' }}
                                    />
                                  </div>
                                );
                              } else if (panel.currentContent.type === 'empty') {
                                return <EmptyTab 
                                  files={files}
                                  folderContents={folderContents}
                                  loadingFolders={loadingFolders}
                                  handleFileClick={handleFileClick}
                                  owner={owner}
                                  repo={repo}
                                  fetchDirectory={fetchDirectory}
                                />;
                              } else {
                                return panel.tabs
                                  .filter(tab => tab.path === panel.activeTab && tab.type === 'code')
                                  .map(tab => (
                                    <CodeEditorTab
                                      key={tab.path}
                                      code={tab.content}
                                      setCode={(newCode) => {
                                        setPanelGroups(prev => prev.map(p => ({
                                          ...p,
                                          tabs: p.tabs.map(t => 
                                            t.path === tab.path ? { ...t, content: newCode } : t
                                          )
                                        })));
                                        if (tab.path === panel.activeTab) {
                                          setCode(newCode);
                                        }
                                      }}
                                      currentPath={tab.path}
                                      isActive={true}
                                    />
                                  ));
                              }
                            })()}
                        </div>
                      </EditorPanel>
                    </ResizablePanel>
                    {index < panelGroups.length - 1 && <ResizableHandle withHandle/>}
                </React.Fragment>
                ))}

                <EditorShortcuts />
                <div 
                    className='absolute bottom-2 left-2 cursor-pointer hover:bg-accent rounded-md p-1'
                        onClick={toggleSidebar}
                    >
                        <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                  {sidebarOpen ? <PiRectangle size={24}/> : <PiSidebarFill size={24}/>}
                                </TooltipTrigger>
                            <TooltipContent>Toggle sidebar <span className="text-[10px] text-muted-foreground">⌘B</span></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
              </ResizablePanelGroup>
            </ResizablePanel>

            
        </ResizablePanelGroup>
    </SidebarProvider>
  );
}
