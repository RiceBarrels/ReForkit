"use client"
import defaultSettings from "@/app/values/defaultEditorValue.json"
import { useEffect } from "react"
import { usePathname } from "next/navigation";

export function SaveDefualtSettings() {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure that we are running in a browser environment
    if (typeof window !== 'undefined') {
      const savingDelay = localStorage.getItem("savingDelay");
      const codeWarp = localStorage.getItem("codeWarp");

      if (!savingDelay) {
        localStorage.setItem("savingDelay", defaultSettings.savingDelay);
      }
      if (!codeWarp) {
        localStorage.setItem("codeWarp", defaultSettings.codeWarp);
      }
    }
  }, [pathname]);

  return null;
}