"use client"

import { Home, Search, Settings, FileText,LogOut, Moon, Sun } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs"
import { useTheme } from "next-themes"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    shortcut: "H",
  },
  {
    title: "Editor",
    url: "/editor",
    icon: FileText,
    shortcut: "E",
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
    shortcut: "S",
  },
]

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      items.forEach((item) => {
        if (e.key === item.shortcut.toLowerCase() && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          router.push(item.url);
        }
      });
      if (e.key === "s" && (e.metaKey || e.ctrlKey) && pathname === "/search") {
        e.preventDefault();
        document.getElementById("search-input").focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const ThemeIcon = mounted ? (theme === 'dark' ? Moon : Sun) : null;

  return (
    <Sidebar className="h-full">
      <SidebarContent className="h-full">
        <SidebarGroup className="h-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
          >
            <SidebarGroupLabel className="text-xs">Application</SidebarGroupLabel>
            <SidebarGroupContent className="h-full">
              <SidebarMenu className="h-full">
                <TooltipProvider delayDuration={100} skipDelayDuration={100} className="flex items-center flex-col h-full">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <SidebarMenuItem>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton 
                              className={cn(
                                "relative p-2",
                                pathname === item.url && "before:absolute before:left-0 before:w-1 before:h-full before:bg-primary before:rounded-r animate-in"
                              )} 
                              data-active={`${pathname === item.url}`} 
                              asChild
                            >
                              <Link href={item.url} className="flex items-center gap-3 text-sm">
                                <motion.div
                                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                                  transition={{ duration: 0.5 }}
                                >
                                  <item.icon className={cn(
                                    "w-4 h-4",
                                    "transition-colors",
                                    pathname === item.url ? "text-primary" : "text-muted-foreground"
                                  )} />
                                </motion.div>
                                <span>{item.title}</span>
                                <div className="flex-1"/>
                                <span className="text-[10px] text-muted-foreground">⌘{item.shortcut}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent className="text-sm">{item.title} <span className="text-[10px] text-muted-foreground">⌘{item.shortcut}</span></TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    </motion.div>
                  ))}
                  <div className="flex-1"/>
                  <SidebarMenuItem key="user">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton className="p-2" asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <SignedIn>
                              {user?.imageUrl && (
                                <>
                                  <img 
                                    src={user.imageUrl} 
                                    alt={user.fullName || "User"} 
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="text-sm">{user.username}</span>
                                </>
                              )}
                            </SignedIn>
                            <SignedOut>
                              <Link href="/login" className="w-full">Sign In</Link>
                            </SignedOut>
                          </motion.div>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        <SignedIn>
                          Account Settings
                        </SignedIn>
                        <SignedOut>
                          Sign In
                        </SignedOut>
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                  <div className="flex-1"/>
                  <motion.div 
                    className="flex w-full"
                    variants={itemVariants}
                  >
                    <SidebarMenuItem key="settings">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton className="p-2" asChild>
                            <Link href="/settings">
                              <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.3 }}
                              >
                                <Settings />
                              </motion.div>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        <TooltipContent className="text-md">Settings <span className="text-xs">⌘,</span></TooltipContent>
                      </Tooltip>
                    </SidebarMenuItem>
                    <div className="flex-1"/>
                    <SignedIn>
                      <SidebarMenuItem key="logout">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton 
                              onClick={handleSignOut}
                              asChild
                            >
                              <motion.div
                                whileHover={{ scale: 1.1, x: 5 }}
                                transition={{ duration: 0.2 }}
                              >
                                <LogOut />
                              </motion.div>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent className="text-md">Logout <span className="text-xs text-muted-foreground">⌘L</span></TooltipContent>
                        </Tooltip>
                      </SidebarMenuItem>
                    </SignedIn>
                  </motion.div>
                  <SidebarMenuItem key="theme">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                          className="p-2" 
                          asChild
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.2 }}
                            data-sidebar="menu-button"
                            data-size="default"
                            data-active={false}
                          >
                            {mounted ? (
                              theme === 'dark' ? (
                                <Moon className="w-4 h-4" />
                              ) : (
                                <Sun className="w-4 h-4" />
                              )
                            ) : (
                              <div className="w-4 h-4" />
                            )}
                          </motion.div>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        Toggle theme
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                </TooltipProvider>
              </SidebarMenu>
            </SidebarGroupContent>
          </motion.div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
