"use client"
 
import * as React from "react"

import {
  Calculator,
  Home,
  Save,
  Settings,
  Search,
} from "lucide-react"
 
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import Link from "next/link"
import { useRouter } from "next/navigation"
export default function EditorShortcuts() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    React.useEffect(() => {
      const down = (e) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpen((open) => !open)
        } else if (e.key === "," && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push("/settings")
        } else if (e.key === "h" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push("/")
        } else if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          router.push("/search")
        }
      }
   
      document.addEventListener("keydown", down)
      return () => document.removeEventListener("keydown", down)
    }, [])
   
    return (
      <>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <Home />
                <span>Home</span>
                <CommandShortcut>⌘H</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Search />
                <span>Search On Github</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Commands">
              <CommandItem>
                <Search />
                <span>Search</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Save />
                <span>Save</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
              <Link href="/settings">
                <CommandItem>
                  <Settings />
                  <span>Settings</span>
                  <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </Link>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    )
}