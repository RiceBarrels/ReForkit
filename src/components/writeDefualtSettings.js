"use client"
import defaultSettings from "@/app/values/defaultEditorValue.json"
import { useEffect } from "react"
import { usePathname } from "next/navigation";

export function SaveDefualtSettings(){
    // if any of the settings didnt have in the local storage, then save the default settings to the local storage
    const savingDelay = localStorage.getItem("savingDelay");
    const codeWarp = localStorage.getItem("codeWarp");
    const pathname = usePathname();
    
    useEffect(() => {
        if(!savingDelay){
            localStorage.setItem("savingDelay", defaultSettings.savingDelay);
        }
        if(!codeWarp){
            localStorage.setItem("codeWarp", defaultSettings.codeWarp);
        }
    }, [pathname]);
}