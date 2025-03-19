"use client"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"


// json
import defaultEditorValue from "@/app/values/defaultEditorValue.json"
import { RefreshCw, Save } from "lucide-react"

export function UserSettings() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TooltipProvider delayDuration={100}>
                <motion.h1 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    User Settings
                </motion.h1>

                <Separator />

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-y-3 mt-2"
                >
                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold">Personal Information</Label>
                        <p className="text-sm text-muted-foreground">Manage your personal account information and preferences.</p>
                    </div>
                </motion.div>
            </TooltipProvider>
        </motion.div>
    )
}

export function AppearanceSettings() {
    const { theme, setTheme } = useTheme();
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TooltipProvider delayDuration={100}>
                <motion.h1 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Appearance Settings
                </motion.h1>

                <Separator />

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-y-3 mt-2"
                >
                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold" htmlFor="dark-mode">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">Dark mode will change the appearance of the editor and the entire application to a darker color scheme.</p>
                        <div className="flex items-center gap-2">
                            <div>Light</div>
                            <Switch 
                                id="dark-mode" 
                                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                                checked={theme === "dark"}
                            />
                            <div>Dark</div>
                        </div>
                    </div>
                </motion.div>
            </TooltipProvider>
        </motion.div>
    )
}

export function EditorSettings() {
    const defaultSavingDelay = defaultEditorValue.savingDelay;
    const [savingDelay, setSavingDelay] = useState(parseInt(localStorage.getItem('savingDelay')));
    const [savedValue, setSavedValue] = useState(parseInt(localStorage.getItem('savingDelay')));
    
    const defaultCodeWarp = defaultEditorValue.codeWarp;
    const [codeWarp, setCodeWarp] = useState(localStorage.getItem('codeWarp') === 'true' || false);
    const [savedCodeWarp, setSavedCodeWarp] = useState(localStorage.getItem('codeWarp') === 'true' || false);


    const handleSavingDelayChange = () => {
        const value = Math.floor(parseInt(savingDelay));
        if (value >= 2000) {
            localStorage.setItem('savingDelay', value.toString());
            setSavedValue(value);
            toast.success(`Saving delay updated to ${value}ms or ${value / 1000}s`);
        } else {
            toast.error("Saving delay must be at least 2 seconds");
        }
    }

    const handleInputChange = (e) => {
        const value = Math.floor(parseInt(e.target.value) || 0);
        setSavingDelay(value);
    };

    const handleCodeWarpChange = () => {
        localStorage.setItem('codeWarp', codeWarp.toString());
        setSavedCodeWarp(codeWarp);
        toast.success(`Code warping ${codeWarp ? 'enabled' : 'disabled'}`);
    }

    return(
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TooltipProvider delayDuration={100}>
                <motion.h1 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Editor Settings
                </motion.h1>

                <Separator />

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-y-3 mt-2"
                >
                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold" htmlFor="saving-delay">Auto Saving Delay</Label>
                        <p className="text-sm text-muted-foreground">The delay in milliseconds between auto-saves. Minimum 2000ms.</p>
                        <div className="flex items-center gap-2">
                            <Input 
                                type="number" 
                                id="saving-delay" 
                                placeholder="Saving Delay" 
                                value={savingDelay} 
                                min={2000} 
                                step={1}
                                onChange={handleInputChange}
                            />
                            
                            {savingDelay !== savedValue && (
                                <Button variant="outline" onClick={handleSavingDelayChange}>
                                    <Save size={16} /> <span>Save</span>
                                </Button>
                            )}
                            
                            {savingDelay !== defaultSavingDelay && (
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button variant="outline" onClick={() => {
                                            setSavingDelay(defaultSavingDelay);
                                            localStorage.setItem('savingDelay', defaultSavingDelay.toString());
                                            setSavedValue(defaultSavingDelay);
                                    toast.success(`Saving delay updated to ${defaultSavingDelay}ms or ${defaultSavingDelay / 1000}s`);
                                }}>
                                    <RefreshCw size={16} /> <span>Reset</span>
                                </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Reset to default
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold" htmlFor="code-warp">Code Warping</Label>
                        <p className="text-sm text-muted-foreground">Enable code warping to automatically wrap code at the end of the file.</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                                <div>False</div>
                                <Switch 
                                    id="code-warp" 
                                    checked={codeWarp} 
                                    onCheckedChange={() => setCodeWarp(!codeWarp)} />
                                <div>True</div>
                            </div>
                            <div className="flex gap-2">
                                {codeWarp !== savedCodeWarp && (
                                    <Button variant="outline" onClick={handleCodeWarpChange}>
                                        <Save size={16} /> <span>Save</span>
                                    </Button>
                                )}
                                
                                {codeWarp !== defaultCodeWarp && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="outline" onClick={() => {
                                                setCodeWarp(defaultCodeWarp);
                                                localStorage.setItem('codeWarp', defaultCodeWarp.toString());
                                                setSavedCodeWarp(defaultCodeWarp);
                                                toast.success(`Code warping ${defaultCodeWarp ? 'enabled' : 'disabled'}`);
                                            }}>
                                                <RefreshCw size={16} /> <span>Reset</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Reset to default
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </TooltipProvider>
        </motion.div>
    )
}

export function AdvancedSettings() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TooltipProvider delayDuration={100}>
                <motion.h1 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Advanced Settings
                </motion.h1>

                <Separator />

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-y-3 mt-2"
                >
                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold">Advanced Configuration</Label>
                        <p className="text-sm text-muted-foreground">Configure advanced settings for the application.</p>
                    </div>
                </motion.div>
            </TooltipProvider>
        </motion.div>
    )
}

export function BetaSettings() {
    const defaultDebugMode = defaultEditorValue.debugMode;
    const [debugMode, setDebugMode] = useState(localStorage.getItem('debugMode') === 'true' || false);
    const [savedDebugMode, setSavedDebugMode] = useState(localStorage.getItem('debugMode') === 'true' || false);

    const handleDebugModeChange = () => {
        localStorage.setItem('debugMode', debugMode.toString());
        setSavedDebugMode(debugMode);
        toast.success(`Debug mode ${debugMode ? 'enabled' : 'disabled'}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TooltipProvider delayDuration={100}>
                <motion.h1 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Beta Settings
                </motion.h1>

                <Separator />

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col gap-y-3 mt-2"
                >
                    <div className="flex flex-col gap-2 p-4 rounded-lg hover:bg-muted transition">
                        <Label className="font-semibold" htmlFor="debug-mode">Debug Mode</Label>
                        <p className="text-sm text-muted-foreground">Enable debug mode to see additional information for development and testing.</p>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 flex-1">
                                <div>Off</div>
                                <Switch 
                                    id="debug-mode" 
                                    checked={debugMode}
                                    onCheckedChange={() => setDebugMode(!debugMode)}
                                />
                                <div>On</div>
                            </div>
                            <div className="flex gap-2">
                                {debugMode !== savedDebugMode && (
                                    <Button variant="outline" onClick={handleDebugModeChange}>
                                        <Save size={16} /> <span>Save</span>
                                    </Button>
                                )}
                                
                                {debugMode !== defaultDebugMode && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Button variant="outline" onClick={() => {
                                                setDebugMode(defaultDebugMode);
                                                localStorage.setItem('debugMode', defaultDebugMode.toString());
                                                setSavedDebugMode(defaultDebugMode);
                                                toast.success(`Debug mode ${defaultDebugMode ? 'enabled' : 'disabled'}`);
                                            }}>
                                                <RefreshCw size={16} /> <span>Reset</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Reset to default
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </TooltipProvider>
        </motion.div>
    )
}
