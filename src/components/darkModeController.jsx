"use client"
import { useEffect } from "react"

export default function DarkModeController() {
    useEffect(() => {
        const isDarkMode = window.localStorage.getItem("darkMode") === "true";
        document.documentElement.classList.toggle("dark", isDarkMode);
    }, [])
}
