"use client"
import defaultSettings from "@/app/values/defaultEditorValue.json"
import { useEffect } from "react"
import { usePathname } from "next/navigation";

export function SaveDefaultSettings() {
    const pathname = usePathname();
    
    useEffect(() => {
        // Check and set default settings if they don't exist
        const settingsToCheck = {
            "savingDelay": defaultSettings.savingDelay,
            "codeWrap": defaultSettings.codeWrap
        };

        Object.entries(settingsToCheck).forEach(([key, defaultValue]) => {
            const currentValue = localStorage.getItem(key);
            if (!currentValue) {
                localStorage.setItem(key, defaultValue);
            }
        });
    }, [pathname]);
} 