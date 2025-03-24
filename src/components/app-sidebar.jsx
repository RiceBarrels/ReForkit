"use client"

import { Home, Search, Settings, FileText,LogOut, Moon, Sun, ChevronsUpDown, ChevronsDown, X, User, LogInIcon, Pencil } from "lucide-react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs"
import { useTheme } from "next-themes"
import { version,stage } from "../../package.json";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

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
  const { user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
  }, [isProfileOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Add this useEffect for handling clicks outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileElement = document.getElementById('profile-dropdown');
      if (profileElement && !profileElement.contains(event.target) && isProfileOpen) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [isProfileOpen]);

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

  if (!mounted) {
    return null;
  }

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  const variants = {
    // when profile open, move to the center of the screen
    profileOpen: { y: 0, x: "1.5rem", height: "28rem", boxShadow: "-0.5rem 0 0.5rem 0 rgba(0, 0, 0, 0.1)" },
    profileClosed: { y: 0, x: 0, height: "3.125rem", boxShadow: "0 0 0 0 rgba(0, 0, 0, 0.1)" },
  };

  return (
    <Sidebar className="h-full">
      <SidebarHeader className="border-b border-border">
        <SidebarGroupLabel className="text-xs">Reforkit ({stage} {version})</SidebarGroupLabel>
        <AnimatePresence>
          {user ? (
          <motion.div 
            id="profile-dropdown"
            className={"items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background w-full justify-start flex flex-col z-[99] rounded-lg h-[50px]" + (isProfileOpen ? " cursor-default" : "")}
            initial={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            variants={variants}
            animate={isProfileOpen ? variants.profileOpen : variants.profileClosed}
            exit={{ opacity: 0, scale: 0 }}
          >
            <div 
              className={"flex items-center gap-2 w-full p-2 rounded-md transition-all duration-200" + (isProfileOpen ? " cursor-default" : " hover:bg-accent hover:text-accent-foreground cursor-pointer")}
              onClick={() => {if(!isProfileOpen)setIsProfileOpen(!isProfileOpen)}}
            >
              <motion.div 
                className="flex items-center flex-1 gap-2"
                animate={{ opacity: isProfileOpen ? 0 : 1, width: isProfileOpen ? 0 : "100%", y: isProfileOpen ? 12 : 0, x: isProfileOpen ? 32 : 0 }}
                transition={{ duration: 0.1 }}
              >
                {user?.imageUrl && <img src={user?.imageUrl} alt={user?.fullName || "User"} className="w-8 h-8 rounded-full" />}
                <motion.span
                  className="text-sm flex-1 text-left font-bold"
                  animate={{ y: isProfileOpen ? 92 : 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {"@"+user?.username || "User"}
                </motion.span>
              </motion.div>
              <motion.div
                animate={{ rotate: isProfileOpen ? 180 : 0, scale: isProfileOpen ? 1.2 : 1, x: isProfileOpen ? "-1rem" : 0, y: isProfileOpen ? 0 : 0 }}
                transition={{ duration: 0.1 }}
                className="hover:bg-accent hover:text-accent-foreground p-1 rounded-md cursor-pointer"
                onClick={() => {if(isProfileOpen)setIsProfileOpen(!isProfileOpen)}}
              >
                {isProfileOpen ? <X className="w-4 h-4" /> : <ChevronsDown className="w-4 h-4" />}
              </motion.div>
            </div>
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  className="flex flex-col w-full flex-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="flex flex-col gap-0.5 justify-center items-center mb-2">
                    <motion.div 
                      className="w-16 h-16 rounded-full" 
                      initial={{ opacity: 0, y: -32, x: -32, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -32, x: -32, scale: 0.5 }}
                      transition={{ duration: 0.1 }}
                    >
                      <img src={user?.imageUrl} alt={user?.fullName || "User"} className="absolute w-16 h-16 rounded-full" />
                      <motion.div 
                        className="absolute flex justify-center items-center w-16 h-16 cursor-pointer backdrop-blur-sm bg-background/10 rounded-full border"
                        whileHover={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                    <motion.span 
                      className="text-md font-bold mt-3"
                      animate={{ y: isProfileOpen ? 0 : 92 }}
                    >
                      {"@"+user?.username || "User"}
                    </motion.span>
                    <motion.span className="text-xs text-muted-foreground">{user?.emailAddresses[0]?.emailAddress || "user@example.com"}</motion.span>
                  </div>
                  <Separator className="w-full mt-6" />
                  <div className="flex flex-col gap-2 p-2">
                    <Button variant="outline" className="w-full" onClick={() => {setIsProfileOpen(false)}} asChild>
                      <Link href="/settings">
                        <Settings className="w-4 h-4" />
                        <span>Manage Account</span>
                      </Link>
                    </Button>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 p-2 justify-end">
                    <Button variant="outline" className="w-full border-red-600 dark:border-red-900 hover:bg-red-600 dark:hover:bg-red-900 hover:text-white dark:hover:text-white" onClick={() => {setTimeout(handleSignOut, 100);setIsProfileOpen(false)}}>
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          ) : isLoaded ? (
            <motion.div
              className={"items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background w-full justify-start flex z-[99] rounded-lg h-[50px] pl-2 pr-1 hover:bg-accent hover:text-accent-foreground cursor-pointer"}
              initial={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              variants={variants}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="w-8 h-8 flex justify-center items-center bg-muted rounded-full">
                <User className="w-4 h-4" />
              </div>
              <Link href="/login" className="flex-1 flex justify-end items-center">
                <Button variant="ghost" className="" onClick={() => {setIsProfileOpen(!isProfileOpen)}}>
                  <LogInIcon className="w-4 h-4" />
                  Sign in
                </Button>
              </Link>
            </motion.div>
          ):(<motion.div className="items-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background w-full justify-start flex z-[99] rounded-lg h-[50px] pl-2 pr-1 hover:bg-accent hover:text-accent-foreground cursor-pointer" exit={{ opacity: 0, scale: 0 }}/>)}
        </AnimatePresence>
      </SidebarHeader>
      <SidebarContent className="h-full">
        <SidebarGroup className="h-full">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={sidebarVariants}
            className="flex flex-col h-full"
          >
            <SidebarGroupContent className="h-full">
              <SidebarMenu className="h-full flex flex-col">
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
                </TooltipProvider>
              </SidebarMenu>
            </SidebarGroupContent>
            <SidebarFooter className="flex flex-col">
                  <div className="flex-1"/>
                  <motion.div 
                    className="flex justify-between w-full"
                    variants={itemVariants}
                  >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href="/settings">
                              <motion.div
                                whileHover={{ rotate: 180 }}
                                whileTap={{ scale: 0.95, rotate: 0 }}
                                transition={{ duration: 0.3 }}
                              className="h-full w-full flex justify-center items-center"
                              >
                                <Settings className="w-4 h-4" />
                              </motion.div>
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-md">Settings <span className="text-xs">⌘,</span></TooltipContent>
                      </Tooltip>
                    {/* dark mode toggle */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            variant="ghost"
                            size="icon"
                          >
                            <motion.div
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0, rotate: 180 }}
                              transition={{ duration: 0.2 }}
                              className={"h-full w-full flex justify-center items-center " + (theme === 'dark' ? "text-yellow-200 hover:text-yellow-400" : "text-blue-800 hover:text-blue-600")}
                            >
                              <ThemeIcon className={"w-4 h-4"} />
                            </motion.div>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-md">{theme === 'dark' ? 'Light' : 'Dark'} Mode <span className="text-xs">⌘T</span></TooltipContent>
                      </Tooltip>
                    {mounted && (
                      <>
                        <SignedIn>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={handleSignOut}
                              variant="ghost"
                              size="icon"
                            >
                              <motion.div
                                whileHover={{ scaleX: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="h-full w-full flex justify-center items-center"
                              >
                                <LogOut />
                              </motion.div>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-md">Logout <span className="text-xs text-muted-foreground">⌘L</span></TooltipContent>
                        </Tooltip>
                        </SignedIn>
                      </>
                    )}
                  </motion.div>

            </SidebarFooter>
          </motion.div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
