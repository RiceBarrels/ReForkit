'use client'

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { FolderIcon, FileIcon, Link2, Loader2, Copy, Check, Download, Play } from "lucide-react"
import { BiGitRepoForked } from "react-icons/bi";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"
import { motion } from "framer-motion"
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/themes/prism.css';
import './editor-styles.css';
import { Button } from "@/components/ui/button";
import { getGitHubContents, getBranches, getDefaultBranch } from "@/app/actions/github";
import { Combobox } from "@/components/ui/comboBox";

// Add this helper function at the top of your component
const truncateFileName = (fileName, maxLength = 20) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const nameWithoutExt = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;
    
    const truncatedName = `${nameWithoutExt.slice(0, maxLength - 3 - extension.length)}...${extension ? `.${extension}` : ''}`;
    return truncatedName;
};

const renderFileBreadcrumbs = (filePath) => {
    const pathParts = filePath.split('/').filter(Boolean);
    
    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BreadcrumbLink>root</BreadcrumbLink>
                    </motion.div>
                </BreadcrumbItem>
                {pathParts.map((part, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbSeparator>/</BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }} // Delay for each part
                            >
                                <BreadcrumbLink>
                                    {index === pathParts.length - 1 ? part : truncateFileName(part)}
                                </BreadcrumbLink>
                            </motion.div>
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
};

// Update the getLanguageFromFilename function
const getLanguageFromFilename = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const codeExtensions = ['js', 'jsx', 'py', 'html', 'css', 'ts', 'tsx', 'java', 'cpp', 'c', 'rb', 'php', 'go'];
    
    if (!codeExtensions.includes(extension)) {
        return null; // Not a code file
    }

    const languageMap = {
        'js': languages.javascript,
        'jsx': languages.jsx,
        'py': languages.python,
        'html': languages.html,
        // Add more mappings as needed
    };
    return languageMap[extension] || languages.plaintext;
};

// Add this helper function
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
};

// Update the isImageFile helper function
const isImageFile = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'jfif', 'pdf'].includes(extension);
};

// Add this helper function at the top with other helpers
const decodeBase64Content = (content, encoding) => {
    if (encoding === 'base64') {
        try {
            return atob(content.replace(/\s/g, ''));
        } catch (e) {
            console.error('Failed to decode base64 content:', e);
            return content;
        }
    }
    return content;
};

export default function GithubProjectPage({ params }) {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [spin, setSpin] = useState(true); // Changed loading to spin
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [folderContents, setFolderContents] = useState({});
    const [Branch, setBranch] = useState(''); 
    const [defaultBranch, setDefaultBranch] = useState('');
    const [allBranch, setAllBranch] = useState([]);
    const resolvedParams = use(params);

    useEffect(() => {
        const fetchData = async () => {
            setSpin(true);
            try {
                // Get default branch first
                const defaultBranchData = await getDefaultBranch(resolvedParams.username, resolvedParams.project);
                const defaultBranchName = defaultBranchData.default_branch;
                
                // Set both Branch and defaultBranch
                setBranch(defaultBranchName);
                setDefaultBranch(defaultBranchName);
                
                // Get all branches
                setAllBranch(await getBranches(resolvedParams.username, resolvedParams.project));

                // Then fetch contents using the default branch
                const response = await getGitHubContents(
                    resolvedParams.username, 
                    resolvedParams.project, 
                    '', 
                    defaultBranchName, 
                    false
                );
                
                if (Array.isArray(response.content)) {
                    const sortedData = response.content.sort((a, b) => {
                        if (a.type === 'dir' && b.type !== 'dir') return -1;
                        if (a.type !== 'dir' && b.type === 'dir') return 1;
                        return a.name.localeCompare(b.name);
                    });
                    setData(sortedData);
                }
            } catch (err) {
                setError('Error loading repository contents: ' + err);
            } finally {
                setSpin(false);
            }
        };

        fetchData();
    }, [resolvedParams.username, resolvedParams.project]);

    // Update the handleFileClick function
    const handleFileClick = async (file) => {
        try {
            const response = await getGitHubContents(
                resolvedParams.username, 
                resolvedParams.project, 
                file.path,
                Branch,
                false
            );
            
            if (response.success) {
                setSelectedFile(file);
                // Handle the response object and decode base64 content if necessary
                if (typeof response.content === 'object') {
                    // If it's a full GitHub API response object
                    const content = response.content.content;
                    const encoding = response.content.encoding;
                    setFileContent(decodeBase64Content(content, encoding));
                } else {
                    // If it's just the content directly
                    setFileContent(response.content);
                }
            } else {
                setError('Error loading file contents: ' + response.message);
            }
        } catch (err) {
            console.error('File error:', err);
            setError('Error loading file contents');
        }
    };

    // Update the handleFolderClick function
    const handleFolderClick = async (path) => {
        try {
            if (!folderContents[path]) {
                const response = await getGitHubContents(
                    resolvedParams.username,
                    resolvedParams.project,
                    path,
                    Branch,
                    false
                );
                
                if (response.content && Array.isArray(response.content)) {
                    // Sort the folder contents
                    const sortedResult = response.content.sort((a, b) => {
                        if (a.type === 'dir' && b.type !== 'dir') return -1;
                        if (a.type !== 'dir' && b.type === 'dir') return 1;
                        return a.name.localeCompare(b.name);
                    });
                    setFolderContents(prev => ({
                        ...prev,
                        [path]: sortedResult
                    }));
                } else {
                    throw new Error('Failed to fetch folder contents');
                }
            }
        } catch (err) {
            console.error('Folder error:', err);
            setError('Error loading folder contents');
        }
    };

    const renderFileOrFolder = (item, path = '') => {
        const currentPath = path ? `${path}/${item.name}` : item.name;
        
        if (item.type === "dir") {
            return (
                <Accordion key={currentPath} type="single" collapsible className="w-full">
                    <AccordionItem value={currentPath} className="border-none">
                        <AccordionTrigger 
                            className="p-2 border rounded-md"
                            onClick={() => handleFolderClick(currentPath)}
                        >
                            <motion.div 
                                className="flex items-center gap-2"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FolderIcon className="w-4 h-4" />
                                {truncateFileName(item.name)}
                            </motion.div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <motion.div 
                                className="flex flex-col gap-2 pl-4"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {folderContents[currentPath]?.map(subItem => 
                                    renderFileOrFolder(subItem, currentPath)
                                )}
                            </motion.div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            );
        }

        return (
            <motion.div 
                key={currentPath}
                className="p-2 border rounded-md flex items-center gap-2 cursor-pointer hover:underline"
                onClick={() => handleFileClick(item)}
                title={item.name} // Add this to show full name on hover
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <FileIcon className="w-4 h-4" />
                {truncateFileName(item.name)}
            </motion.div>
        );
    };

    if (spin) { // Changed loading to spin
        return (
            <div className="flex justify-center items-center h-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="loader">
                        <Loader2 className="w-4 h-4 animate-spin" />
                    </div> {/* Add your spinner here */}
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4">
                <motion.p
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {error}
                </motion.p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="flex gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <Link href={`https://github.com/${resolvedParams.username}/${resolvedParams.project}`}>
                            <motion.h1 
                                className="text-2xl font-bold underline items-center gap-2 inline-flex"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div>{resolvedParams.project}</div> 
                                <Link2 className="w-4 h-4" />
                            </motion.h1>
                        </Link>
                        <Combobox 
                            datas={allBranch?.branches?.map(branch => ({ 
                                value: branch.name, 
                                label: branch.name 
                            })) || []}
                            datasName="branches"
                            defaultValue={defaultBranch}
                            valueNow={Branch}
                            onSelect={async (selectedBranch) => {
                                setBranch(selectedBranch);
                                setSpin(true);
                                try {
                                    // Fetch contents for the new branch
                                    const response = await getGitHubContents(
                                        resolvedParams.username,
                                        resolvedParams.project,
                                        '',
                                        selectedBranch,
                                        false
                                    );
                                    
                                    if (response.data && Array.isArray(response.data)) {
                                        const sortedData = response.data.sort((a, b) => {
                                            if (a.type === 'dir' && b.type !== 'dir') return -1;
                                            if (a.type !== 'dir' && b.type === 'dir') return 1;
                                            return a.name.localeCompare(b.name);
                                        });
                                        setData(sortedData);
                                        // Clear selected file and folder contents when changing branches
                                        setSelectedFile(null);
                                        setFileContent(null);
                                        setFolderContents({});
                                    } else {
                                        throw new Error('Invalid response format');
                                    }
                                } catch (err) {
                                    setError('Error loading branch contents');
                                } finally {
                                    setSpin(false);
                                }
                            }}
                        />
                    </div>

                    <motion.p 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        This project is hosted on GitHub
                    </motion.p>
                </div>
                <div className="flex-1" />
                <div className="flex gap-2">
                    <Button>
                        <Link 
                            href={`/github/${resolvedParams.username}/${resolvedParams.project}/${Branch}/run`}
                            className="flex items-center gap-2"
                        >
                            Run <Play className="w-4 h-4" />
                        </Link>
                    </Button>
                    <Button>Fork <BiGitRepoForked className="w-4 h-4" /></Button>
                    <Button>
                        <Link 
                            href={`https://github.com/${resolvedParams.username}/${resolvedParams.project}/archive/refs/heads/${Branch}.zip`}
                            className="flex items-center gap-2"
                        >
                            Download ZIP <Download className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="flex gap-4 mt-4">
                <motion.div 
                    className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-10rem)] w-52"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {data.map(item => renderFileOrFolder(item))}
                </motion.div>

                {/* File content display */}
                <motion.div 
                    className="flex-1 overflow-hidden"
                    key={selectedFile ? selectedFile.path : 'no-file'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {selectedFile && (
                        <motion.div 
                            className="border rounded-lg p-4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.30 }}
                        >
                            <div className="flex justify-between items-center">
                                {renderFileBreadcrumbs(selectedFile.path)}
                                <CopyButton content={fileContent} />
                            </div>
                            <motion.div 
                                className="mt-4 relative overflow-auto"
                                key={fileContent}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.30 }}
                            >
                                {isImageFile(selectedFile.name) ? (
                                    <div className="flex flex-col items-center">
                                        {selectedFile.name.endsWith('.pdf') ? (
                                            <>
                                                <iframe
                                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedFile.download_url)}&embedded=true`}
                                                    className="w-full h-[80vh]"
                                                    title={selectedFile.name}
                                                />
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    PDF viewer powered by Google Docs
                                                </p>
                                            </>
                                        ) : (
                                            <img 
                                                src={selectedFile.download_url} 
                                                alt={selectedFile.name}
                                                className="max-w-full h-auto"
                                            />
                                        )}
                                    </div>
                                ) : getLanguageFromFilename(selectedFile.name) ? (
                                    <div className="flex">
                                        <div className="line-numbers text-muted-foreground select-none pr-4 text-right sticky left-0 bg-background">
                                            {fileContent?.split('\n').map((_, i) => (
                                                <div key={i + 1} className="editor-line-number">
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="overflow-auto flex-1">
                                            <Editor
                                                value={fileContent || ''}
                                                onValueChange={() => {}}
                                                highlight={code => highlight(code, getLanguageFromFilename(selectedFile.name))}
                                                padding={10}
                                                style={{
                                                    fontFamily: '"Fira code", "Fira Mono", monospace',
                                                    fontSize: 12,
                                                    backgroundColor: "var(--background)",
                                                    borderRadius: '4px',
                                                    minWidth: 'fit-content',
                                                }}
                                                textareaClassName="editor-textarea"
                                                preClassName="editor-pre"
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="whitespace-pre-wrap font-mono text-sm">
                                        {fileContent}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

const CopyButton = ({ content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(content);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1 text-sm rounded-md hover:bg-muted transition-colors"
            title="Copy code"
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                </>
            )}
        </button>
    );
};
