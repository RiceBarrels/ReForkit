"use client"

import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { SortableTab, EmptyTab, DragOverlayTab, CodeEditorTab } from '@/components/tab';
import { ClerkProvider } from '@clerk/nextjs';

import EditorShortcuts from './editor-shortcuts';
import { SidebarProvider } from "@/components/ui/sidebar";
import Link from "next/link";
import { Home, Loader2, Plus, X, Folder, Settings, Play, FilePlus, FolderPlus, FileUp, FileArchive, FolderGit, FolderGit2} from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { PiRectangle, PiSidebarFill } from "react-icons/pi";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FileText } from "lucide-react";
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
  SidebarMenu
} from "@/components/ui/sidebar";
import { getGitHubContents, getDefaultBranch, getBranches, createBranch } from '@/app/actions/github';
import { DndContext, DragOverlay} from "@dnd-kit/core";
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy} from "@dnd-kit/sortable";
import { useDroppable } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { truncateFileName, getLanguageFromFileName } from '@/utils/editor-utils';
import SettingsPage from '@/app/(selfcode)/(regular-nav)/settings/page';
import RunHtml from './runHtml';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateFile } from '@/app/actions/github';
import { Combobox } from '@/components/ui/comboBox';
import { motion } from 'framer-motion';
import { Editor } from '@monaco-editor/react';
import { useTheme } from "next-themes";

function EditorPanel({ panel, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `panel-${panel.id}`,
    data: {
      panelId: panel.id
    }
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col relative h-full ${
        isOver ? 'bg-accent/20' : ''
      }`}
      style={{ 
        position: 'relative',
        minHeight: '100%',
        transition: 'background-color 0.15s ease-in-out'
      }}
    >
      {children}
    </div>
  );
}

export default function CodeEditor({ params }) {
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const { user: owner, repo } = resolvedParams;
  const router = useRouter();
  
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const { isLoaded, userId } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [folderContents, setFolderContents] = useState({});
  const [allBranches, setAllBranches] = useState([]);
  const [defaultBranch, setDefaultBranch] = useState('');
  const [settingsFile, setSettingsFile] = useState({});

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

  const { theme } = useTheme();
  const editorRef = useRef(null);

  // Add a helper function to check if file is an image
  const isImageFile = (filename) => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Fetch directory contents
  const fetchDirectory = async (path = '') => {
    try {
      if (!settingsFile.autoSaveBranch) {
        throw new Error('No autoSaveBranch');
      }

      if (path === '') {
        setSidebarLoading(true);
      } else {
        setLoadingFolders(prev => ({ ...prev, [path]: true }));
      }
      setError(null);
      
      const result = await getGitHubContents(owner, repo, path, settingsFile.autoSaveBranch, true);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch directory contents');
      }

      const sortedContent = result.content.sort((a, b) => {
        if (a.type === 'dir' && b.type !== 'dir') return -1;
        if (a.type !== 'dir' && b.type === 'dir') return 1;
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
      
      panelGroups.forEach(panel => {
        const tab = panel.tabs.find(tab => tab.path === file.path);
        if (tab) {
          existingPanel = panel;
          existingTab = tab;
        }
      });

      if (existingTab) {
        setPanelGroups(prev => prev.map(panel => {
          if (panel.id === existingPanel.id) {
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

      setPanelGroups(prev => prev.map(panel => {
        if (panel.id === activePanelId) {
          return {
            ...panel,
            tabs: panel.tabs.filter(tab => tab.type !== 'empty'),
            fileLoading: true
          };
        }
        return panel;
      }));

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
        const result = await getGitHubContents(owner, repo, file.path, settingsFile.autoSaveBranch, true);
        
        if (!result.success) {
          throw new Error(result.message || 'Failed to fetch file content');
        }

        // Handle the content based on the response format
        let content = '';
        if (typeof result.content === 'string') {
          content = result.content;
        } else if (result.content.content) {
          // GitHub API returns base64 encoded content
          content = atob(result.content.content.replace(/\s/g, ''));
        } else {
          throw new Error('Unexpected content format');
        }

        newTab = {
          path: file.path,
          name: file.name,
          type: 'code',
          content: content
        };
        setCode(content);
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
    const initializeRepo = async () => {
      if (isLoaded) {
        try {
          // Get default branch first
          const defaultBranchResult = await getDefaultBranch(owner, repo);
          
          // Get settings file
          const settingsResult = await getGitHubContents(owner, repo, '.reforkitSettings', defaultBranchResult.default_branch, true);
          let settingsData = {};
          
          if (settingsResult.success) {
            const settingsContent = atob(settingsResult.content.content.replace(/\s/g, ''));
            settingsData = JSON.parse(settingsContent);
            setSettingsFile(settingsData); // This is async!
          }

          // Get settings file in autoSaveBranch 
          const autoSaveBranchSettingsResult = await getGitHubContents(owner, repo, '.reforkitSettings', settingsData.autoSaveBranch, true);
          let autoSaveBranchSettingsData = {};
          // If the settings are different, update the settings file in the autoSaveBranch
          if (autoSaveBranchSettingsResult.success) {
            const autoSaveBranchSettingsContent = atob(autoSaveBranchSettingsResult.content.content.replace(/\s/g, ''));
            autoSaveBranchSettingsData = JSON.parse(autoSaveBranchSettingsContent);
            if (autoSaveBranchSettingsData!=settingsData) {
              await updateFile(owner, repo, '.reforkitSettings', settingsData.autoSaveBranch, JSON.stringify(settingsData));
            }
          }

          // get all branches
          const branchesResult = await getBranches(owner, repo);
          let existingBranches = [];
          if (branchesResult.success) {
            existingBranches = branchesResult.branches.map(branch => branch.name);
            setAllBranches(existingBranches);
          }
          console.log('allBranches', branchesResult);

          // create auto save branch if it doesn't exist
          if (settingsData.autoSaveBranch && !existingBranches.includes(settingsData.autoSaveBranch)) {
            const autoSaveBranchResult = await createBranch(
              owner, 
              repo, 
              defaultBranchResult.default_branch, 
              settingsData.autoSaveBranch
            );
            
            if (autoSaveBranchResult.success) {
              // Update branches list with FRESH data
              const updatedBranches = await getBranches(owner, repo);
              if (updatedBranches.success) {
                setAllBranches(updatedBranches.branches.map(b => b.name));
              }
            }
          }

          if (defaultBranchResult.success && settingsResult.success) {
            setDefaultBranch(defaultBranchResult.default_branch);
            // Only fetch directory after we have the branch
            const result = await getGitHubContents(owner, repo, '', settingsData.autoSaveBranch, true);
            if (!result.success) {
              throw new Error(result.message || 'Failed to fetch directory contents');
            }
            
            const sortedContent = result.content.sort((a, b) => {
              if (a.type === 'dir' && b.type !== 'dir') return -1;
              if (a.type !== 'dir' && b.type === 'dir') return 1;
              return a.name.localeCompare(b.name);
            });
            
            setFiles(sortedContent);
          } else {
            throw new Error('Failed to fetch directory contents');
          }
        } catch (err) {
          console.error("Repository initialization error:", err);
          setError(err.message);
        } finally {
          setSidebarLoading(false);
        }
      }
    };

    initializeRepo();
  }, [isLoaded, owner, repo]);

  useEffect(() => {
    if (editorRef.current) {
      const editorTheme = theme === 'dark' ? 'custom-dark' : 'custom-light';
      editorRef.current.updateOptions({ theme: editorTheme });
    }
  }, [theme]);

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
                <div className="relative w-4 h-4 flex-shrink-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: loadingFolders[itemPath] ? 1 : 0, scale: loadingFolders[itemPath] ? 1 : 0.5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <Loader2 size={16} className="animate-spin"/>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    animate={{ opacity: loadingFolders[itemPath] ? 0 : 1, scale: loadingFolders[itemPath] ? 0.5 : 1 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-0"
                  >
                    <Folder size={16}/>
                  </motion.div>
                </div>
                <span className="truncate min-w-0">{item.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-6 pl-1 border-l-[1px]">
                {folderContents[itemPath] && (
                  <div key={`content-${itemPath}`} className="space-y-1">
                    {renderFileTree(folderContents[itemPath], itemPath)}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      }
      
      return (
        <TooltipProvider key={itemPath}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 py-2"
                onClick={() => handleFileClick(item)}
              >
                <FileText size={16}/>
                <span className="truncate min-w-0">
                  {truncateFileName(item.name)}
                </span>
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

  const handleDragCancel = () => {
    setTimeout(()=>setActiveId(null),0);
  };

  const handleDragEnd = (event) => {
    setTimeout(()=>setActiveId(null),0);
    
    const { active, over } = event;
    if (!active || !over) return;

    const activeData = active.data.current;
    
    // Extract panel ID from the over.id if it's a panel drop target
    const overPanelId = over.id.startsWith('panel-') 
      ? parseInt(over.id.split('-')[1])
      : over.data.current?.panelId;

    // If no valid target panel, return
    if (!overPanelId) return;

    const activePanelId = activeData.panelId;

    setPanelGroups(prev => {
      const sourcePanel = prev.find(p => p.id === activePanelId);
      const targetPanel = prev.find(p => p.id === overPanelId);
      const draggedTab = sourcePanel?.tabs.find(t => t.path === active.id);

      if (!draggedTab) return prev;

      return prev.map(panel => {
        if (panel.id === activePanelId) {
          // Remove from source panel
          const newTabs = panel.tabs.filter(t => t.path !== active.id);
          return {
            ...panel,
            tabs: newTabs,
            activeTab: newTabs[0]?.path || null,
            currentContent: newTabs[0] ? { 
              type: newTabs[0].type,
              ...(newTabs[0].content && { content: newTabs[0].content })
            } : { type: 'code' }
          };
        }

        if (panel.id === overPanelId) {
          // Add to target panel with full state
          const insertIndex = over.data.current?.index ?? panel.tabs.length;
          const newTabs = [...panel.tabs];
          newTabs.splice(insertIndex, 0, {
            ...draggedTab,
            // Preserve all properties including any transient state
            content: draggedTab.content,
            type: draggedTab.type,
            path: draggedTab.path,
            name: draggedTab.name
          });

          return {
            ...panel,
            tabs: newTabs,
            activeTab: draggedTab.path,
            currentContent: {
              type: draggedTab.type,
              ...(draggedTab.content && { content: draggedTab.content })
            }
          };
        }

        return panel;
      });
    });

    // Preserve code state regardless of panel
    if (draggedTab?.type === 'code') {
      setCode(draggedTab.content);
    }
    setCurrentPath(draggedTab?.path || '');
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

  const handleOpenUtilityTabs = (tabType) => {
    // Generate unique ID for the tab
    const tabId = `${tabType}-${Date.now()}`;
    
    setPanelGroups(prev => prev.map(panel => {
        if (panel.id === activePanelId) {
            // Remove any empty tabs first
            const filteredTabs = panel.tabs.filter(t => t.type !== 'empty');
            
            // Check if this type of utility tab already exists
            const existingTab = filteredTabs.find(t => t.type === tabType);
            if (existingTab) {
                // If it exists, just activate it
                return {
                    ...panel,
                    tabs: filteredTabs,  // Remove empty tabs
                    activeTab: existingTab.path,
                    currentContent: { type: tabType }
                };
            }
            
            // Otherwise create a new tab
            return {
                ...panel,
                tabs: [...filteredTabs, {  // Use filtered tabs without empty ones
                    path: tabId,
                    name: tabType.charAt(0).toUpperCase() + tabType.slice(1),
                    type: tabType,
                    content: null
                }],
                activeTab: tabId,
                currentContent: { type: tabType }
            };
        }
        return panel;
    }));
  };

  // Add this near your other click handlers
  const handleRunClick = () => {
    // Generate unique ID for the preview tab
    const previewTabId = `preview-${Date.now()}`;
    
    setPanelGroups(prev => prev.map(panel => {
        if (panel.id === activePanelId) {
            // Remove any empty tabs first
            const filteredTabs = panel.tabs.filter(t => t.type !== 'empty');
            
            // Check if preview tab already exists
            const existingTab = filteredTabs.find(t => t.type === 'preview');
            if (existingTab) {
                // If it exists, just update and activate it
                return {
                    ...panel,
                    tabs: filteredTabs.map(t => 
                        t.type === 'preview' 
                            ? { ...t, content: { src: `/github/${owner}/${repo}/${settingsFile.autoSaveBranch}/run/${currentPath.split('.')[currentPath.split('.').length - 1] === 'html' ? currentPath : ''}` } }
                            : t
                    ),
                    activeTab: existingTab.path,
                    currentContent: { type: 'preview', src: `/github/${owner}/${repo}/${settingsFile.autoSaveBranch}/run/${currentPath.split('.')[currentPath.split('.').length - 1] === 'html' ? currentPath : ''}` }
                };
            }
            
            // Otherwise create a new preview tab
            return {
                ...panel,
                tabs: [...filteredTabs, {
                    path: previewTabId,
                    name: 'Preview',
                    type: 'preview',
                    content: { src: `/github/${owner}/${repo}/${settingsFile.autoSaveBranch}/run/${currentPath.split('.')[currentPath.split('.').length - 1] === 'html' ? currentPath : ''}` }
                }],
                activeTab: previewTabId,
                currentContent: { type: 'preview', src: `/github/${owner}/${repo}/${settingsFile.autoSaveBranch}/run/${currentPath.split('.')[currentPath.split('.').length - 1] === 'html' ? currentPath : ''}` }
            };
        }
        return panel;
    }));
  };

  // Show loading state until auth is initialized
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Loader2 className="w-4 h-4 animate-spin"/>
      </div>
    );
  }

  // Redirect only after auth is fully loaded
  if (isLoaded && !userId) {
    router.push('/login');
    return null;
  }

  // Move these state declarations after auth check
  const [config, setConfig] = useState({
    repoFullName: `${owner}/${repo}`,
    codeKind: settingsFile.codeKind,
    autoSaveBranch: 'reforkit-auto-save'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCodeKindSet, setIsCodeKindSet] = useState(false);
  const [isAutoSaveBranchSet, setIsAutoSaveBranchSet] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    const response = await updateFile(owner, repo, '.reforkitSettings', defaultBranch, JSON.stringify(config));
    if (response.success) {
      setSettingsFile(response.data);
      // reload the page
      window.location.reload();
    }
  }

  useEffect(() => {
    setIsCodeKindSet(Boolean(config.codeKind));
    setIsAutoSaveBranchSet(config.autoSaveBranch.trim() !== '');
  }, [config.codeKind, config.autoSaveBranch]);

  if (sidebarLoading) {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <Loader2 className="w-4 h-4 animate-spin"/>
      </div>
    );
  }

  if (
    Object.keys(settingsFile).length === 0 ||
    !settingsFile.autoSaveBranch ||
    !settingsFile.codeKind ||
    settingsFile.repoFullName !== `${owner}/${repo}`
  ) {
    return (
      <div className="flex justify-center items-center w-screen h-screen">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2">Configure {owner}/{repo}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            First time setup for Reforkit editor
          </p>
          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label className="block text-left font-semibold">
                Code Environment <span className="text-red-500">*</span>
              </Label>
              {settingsFile.codeKind === undefined ?
                <Combobox
                  datas={[
                    { value: 'vanilla', label: 'Vanilla HTML + CSS + JS' },
                    { value: 'java', label: 'Java' },
                    { value: 'python', label: 'Python' },
                    { value: 'csharp', label: 'C#' },
                    { value: 'cpp', label: 'C++' },
                    { value: 'custom', label: 'Custom - Linux Terminal' }
                  ]}
                  datasName="Code Environment"
                  valueNow={config.codeKind}
                  onSelect={(selected) => {
                    console.log("Selected option:", selected);
                    const newCodeKind = typeof selected === "string" ? selected : selected;
                    setConfig((prev) => ({ ...prev, codeKind: newCodeKind }));
                  }}
                  className="w-full"
                  required
                /> : null
              }
            </div>

            <div className="space-y-2">
              <Label className="block text-left font-semibold">
                Auto-save Branch <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="branch-name"
                value={config.autoSaveBranch}
                onChange={(e) => {
                  // Update autoSaveBranch only.
                  const newValue = e.target.value;
                  setConfig((prev) => ({ ...prev, autoSaveBranch: newValue }));
                }}
                className="w-full"
                pattern="[a-zA-Z0-9\-_]+"
                title="Branch name can only contain letters, numbers, hyphens, and underscores"
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={handleSaveSettings}
              disabled={isSaving || !isCodeKindSet || !isAutoSaveBranchSet}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSaving
                ? 'Saving...'
                : !isCodeKindSet
                  ? 'Please select a code environment'
                  : !isAutoSaveBranchSet
                    ? 'Please enter a branch name'
                    : 'Save'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider>
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
                <Sidebar className="h-full w-full bg-background" collapsible="none">
                    <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                        <SidebarContent className="h-full">
                            <SidebarGroup className="h-full">
                                <SidebarGroupLabel>Reforkit (Closed Beta)</SidebarGroupLabel>
                                <Separator className="my-2"/>
                                <SidebarGroupContent className="h-full">
                                  <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                                    <div className="flex items-center gap-0.5 py-0.5 justify-center">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                            <FolderPlus size={16}/>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>New Folder <span className="text-[10px] text-muted-foreground">⌘⇧N</span></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                            <FilePlus size={16}/>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>New File <span className="text-[10px] text-muted-foreground">⌘N</span></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                            <FileUp size={16}/>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Upload <span className="text-[10px] text-muted-foreground">⌘⇧U</span></TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="w-8 h-8">
                                            <FileArchive size={16}/>
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Download zip <span className="text-[10px] text-muted-foreground">⌘⇧D</span></TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TooltipProvider>
                                    <SidebarMenu className="h-full">
                                        <Accordion type="multiple" collapsible="true" defaultValue={["files"]} className="h-full">
                                            <AccordionItem value="files" className="h-full border-b-0">
                                                <AccordionTrigger className="mx-2 py-2">
                                                    <span className="inline-flex items-center gap-2">
                                                        <FolderGit2 size={16}/> {resolvedParams.repo}
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
                              <div 
                                onClick={() => handleOpenUtilityTabs('settings')}
                                className="hover:bg-accent rounded-md p-1 px-4 flex items-center max-h-6 cursor-pointer"
                              >
                                  <Settings size={16} className="mr-2"/>
                                  <span className="text-sm">Settings</span>
                              </div>
                          </TooltipTrigger>
                          <TooltipContent>Settings <span className="text-[10px] text-muted-foreground">⌘,</span></TooltipContent>
                      </Tooltip>
                  </TooltipProvider>
                  {currentPath} {hoveringPanelId} {activeId} {activePanelId}
                  <div className='flex-1'/>
                  <TooltipProvider delayDuration={100} skipDelayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                          <div 
                            className='align-center gap-x-1 justify-center hover:bg-accent px-2 py-1 rounded-md flex items-center max-h-6 cursor-pointer text-xs font-extrabold mx-3'
                            onClick={handleRunClick}
                          >
                            <Play size={16}/> <span>Run</span>
                          </div>
                        </TooltipTrigger>
                      <TooltipContent>Run <code className='text-xs border rounded-sm px-2 py-1'>index.html</code> <span className="text-[10px] text-muted-foreground">⌘R</span></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                      onMouseEnter={() => {
                        console.log('Setting hovering panel:', `panel-${panel.id}`);
                        setHoveringPanelId(`panel-${panel.id}`);
                      }}
                      onMouseLeave={() => setHoveringPanelId(null)}
                      onMouseDown={() => {
                        console.log('Setting active panel:', panel.id);
                        setActivePanelId(panel.id);
                      }}
                      onMouseUp={() => {
                        console.log('Mouse up event');
                        console.log('Active panel ID:', activePanelId);
                        console.log('Hovering panel ID:', hoveringPanelId);
                        console.log('Active ID:', activeId);
                        console.log(parseInt(hoveringPanelId.split('-')[1]))
                        if (activePanelId !== parseInt(hoveringPanelId.split('-')[1]) && activeId != null) {
                          console.log('Moving tab:', {
                            activeId,
                            fromPanel: activePanelId,
                            toPanel: parseInt(hoveringPanelId.split('-')[1]),
                            hoveringPanelId
                          });
                          
                          setPanelGroups(prev => {
                            // Find the source panel that contains the active tab
                            const sourcePanel = prev.find(p => p.tabs.some(t => t.path === activeId));
                            if (!sourcePanel) {
                              console.log('Source panel not found');
                              return prev;
                            }

                            // Find the tab that's being moved
                            const tabToMove = sourcePanel.tabs.find(t => t.path === activeId);
                            if (!tabToMove) {
                              console.log('Tab to move not found');
                              return prev;
                            }

                            console.log('Moving tab:', tabToMove);

                            return prev.map(panel => {
                              // Remove tab from source panel
                              if (panel.id === sourcePanel.id) {
                                const remainingTabs = panel.tabs.filter(t => t.path !== activeId);
                                return {
                                  ...panel,
                                  tabs: remainingTabs,
                                  activeTab: remainingTabs.length > 0 ? remainingTabs[0].path : null,
                                  currentContent: remainingTabs.length > 0 ? 
                                    (remainingTabs[0].type === 'image' ? { type: 'image', url: remainingTabs[0].content.url } :
                                    remainingTabs[0].type === 'preview' ? { type: 'preview', src: remainingTabs[0].content.src } :
                                    remainingTabs[0].type === 'settings' ? { type: 'settings' } :
                                    { type: 'code' }) 
                                    : { type: 'code' }
                                };
                              }

                              // Add tab to target panel
                              if (panel.id === parseInt(hoveringPanelId.split('-')[1])) {
                                return {
                                  ...panel,
                                  tabs: [...panel.tabs, tabToMove],
                                  activeTab: tabToMove.path,
                                  currentContent: tabToMove.type === 'image' ? 
                                    { type: 'image', url: tabToMove.content.url } :
                                    tabToMove.type === 'preview' ?
                                    { type: 'preview', src: tabToMove.content.src } :
                                    tabToMove.type === 'settings' ?
                                    { type: 'settings' } :
                                    { type: 'code' }
                                };
                              }

                              return panel;
                            });
                          });

                          // Update code state if necessary
                          const movedTab = panelGroups
                            .find(p => p.tabs.some(t => t.path === activeId))
                            ?.tabs.find(t => t.path === activeId);

                          if (movedTab?.type === 'code') {
                            setCode(movedTab.content);
                          }
                          setCurrentPath(movedTab?.path || '');
                        }
                      }}
                      minSize={24}
                    >
                      <EditorPanel panel={panel}>
                        {/* Add tabs */}
                        <DndContext
                          sensors={sensors}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onDragCancel={handleDragCancel}
                          modifiers={[restrictToWindowEdges]}
                        >
                          <div
                            className='flex overflow-x-auto overflow-y-hidden border-y w-full h-12 justify-start items-center relative'
                          >
                            <SortableContext
                              items={panel.tabs.map(tab => tab.path)}
                              strategy={horizontalListSortingStrategy}
                            >
                              <div className="flex items-center">
                                {panel.tabs.map((tab, index) => (
                                  
                                  <SortableTab
                                    key={tab.path}
                                    id={tab.path}
                                    name={truncateFileName(tab.name)}
                                    panelId={panel.id}
                                    panelGroups={panelGroups}
                                    index={index}
                                    className={hoveringPanelId !== `panel-${panel.id}` && hoveringPanelId && activeId === tab.path ? 'scale-[0!important] w-0' : '' + " transition-all scale-100"}
                                    onClick={() => {
                                      setPanelGroups(prev => prev.map(p => ({
                                        ...p,
                                        activeTab: p.id === panel.id ? tab.path : p.activeTab,
                                        currentContent: p.id === panel.id ? { type: tab.type } : p.currentContent
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
                              </div>
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
                        <div className={`h-[calc(100vh-4rem)] editor-content transition-all duration-250 ${
                          hoveringPanelId === `panel-${panel.id}` && activeId && activePanelId !== panel.id ? 
                          'opacity-65 bg-[#187cff54]' : ''
                        }`}>
                          {panel.fileLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin"/>
                            </div>
                          ) : (
                            <div className="relative w-full h-full">
                              {/* Render all image tabs */}
                              {panel.tabs.map(tab => (
                                tab.type === 'image' && (
                                  <div 
                                    key={tab.path}
                                    className="flex justify-center items-center h-full absolute top-0 w-full transition-transform duration-200 ease-in-out"
                                    style={{ 
                                      transform: `translateX(${panel.activeTab === tab.path ? '0%' : '100%'})`,
                                      pointerEvents: panel.activeTab === tab.path ? 'auto' : 'none'
                                    }}
                                  >
                                    <img 
                                      src={tab.content.url} 
                                      alt={tab.path}
                                      className="max-w-full h-auto object-contain"
                                      style={{ maxHeight: 'calc(100vh - 8rem)' }}
                                    />
                                  </div>
                                )
                              ))}

                              {/* Render all code tabs */}
                              {panel.tabs.map(tab => (
                                tab.type === 'code' && (
                                  <div 
                                    key={tab.path}
                                    className="absolute top-0 w-full h-full transition-transform duration-200 ease-in-out"
                                    style={{ 
                                      transform: `translateX(${panel.activeTab === tab.path ? '0%' : '100%'})`,
                                      pointerEvents: panel.activeTab === tab.path ? 'auto' : 'none',
                                      overflow: panel.activeTab === tab.path ? 'auto' : 'hidden'
                                    }}
                                  >
                                    <div className="w-full h-full">
                                      <Editor
                                        height="100%"
                                        language={getLanguageFromFileName(tab.path)}
                                        value={tab.content}
                                        onChange={(value) => {
                                          setPanelGroups(prev => prev.map(p => ({
                                            ...p,
                                            tabs: p.tabs.map(t => 
                                              t.path === tab.path ? { ...t, content: value } : t
                                            )
                                          })));
                                          setCode(value);
                                        }}
                                        options={{
                                          minimap: { enabled: false },
                                          fontSize: 14,
                                          roundedSelection: true,
                                          scrollBeyondLastLine: true,
                                          automaticLayout: true,
                                          lineNumbers: 'on',
                                          glyphMargin: true,
                                          folding: true,
                                          lineDecorationsWidth: 0,
                                          lineNumbersMinChars: 3
                                        }}
                                        onMount={(editor, monaco) => {
                                          const editorTheme = theme === 'dark' ? 'custom-dark' : 'custom-light';
                                          editor.updateOptions({ theme: editorTheme });
                                          
                                          monaco.editor.defineTheme('custom-dark', {
                                            base: 'vs-dark',
                                            inherit: true,
                                            rules: [],
                                            colors: {
                                              'editor.background': '#0a0a0a',
                                              'editor.lineHighlightBackground': '#000000',
                                              'editorLineNumber.foreground': '#404040',
                                            },
                                          });

                                          monaco.editor.defineTheme('custom-light', {
                                            base: 'vs',
                                            inherit: true,
                                            rules: [],
                                            colors: {
                                              'editor.background': '#ffffff',
                                              'editor.lineHighlightBackground': '#ffffff',
                                              'editorLineNumber.foreground': '#404040',
                                            },
                                          });

                                          editor.focus();
                                        }}
                                      />
                                    </div>
                                  </div>
                                )
                              ))}

                              {/* Render empty tab */}
                              {panel.currentContent.type === 'empty' && (
                                <div 
                                  className="absolute top-0 w-full transition-transform duration-200 ease-in-out"
                                  style={{ 
                                    transform: `translateX(${panel.tabs.some(t => t.type === 'empty') ? '0%' : '100%'})`,
                                    pointerEvents: panel.tabs.some(t => t.type === 'empty') ? 'auto' : 'none'
                                  }}
                                >
                                  <EmptyTab 
                                    files={files}
                                    folderContents={folderContents}
                                    loadingFolders={loadingFolders}
                                    handleFileClick={handleFileClick}
                                    owner={owner}
                                    repo={repo}
                                    fetchDirectory={fetchDirectory}
                                    handleOpenUtilityTabs={handleOpenUtilityTabs}
                                  />
                                </div>
                              )}
                              {panel.currentContent.type === 'settings' && (
                                <div 
                                  className="absolute top-0 w-full transition-transform duration-200 ease-in-out overflow-auto"
                                  style={{ 
                                    transform: `translateX(${panel.tabs.some(t => t.type === 'settings') ? '0%' : '100%'})`,
                                    pointerEvents: panel.tabs.some(t => t.type === 'settings') ? 'auto' : 'none'
                                  }}
                                >
                                  <SettingsPage />
                                </div>
                              )}

                              {/* Render preview tabs */}
                              {panel.currentContent.type === 'preview' && (
                                <div 
                                    className="absolute top-0 w-full h-full transition-transform duration-200 ease-in-out"
                                    style={{ 
                                        transform: `translateX(${panel.tabs.some(t => t.type === 'preview') ? '0%' : '100%'})`,
                                        pointerEvents: panel.tabs.some(t => t.type === 'preview') ? 'auto' : 'none'
                                    }}
                                >
                                    <RunHtml src={panel.tabs.find(t => t.type === 'preview')?.content.src} />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </EditorPanel>
                    </ResizablePanel>
                    {index < panelGroups.length - 1 && <ResizableHandle withHandle/>}
                </React.Fragment>
                ))}

                <EditorShortcuts handleOpenUtilityTabs={handleOpenUtilityTabs} />
                <div 
                    className='fixed bottom-2 left-2 cursor-pointer hover:bg-accent rounded-md p-1 z-[9999]'
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
    </ClerkProvider>
  );
}
