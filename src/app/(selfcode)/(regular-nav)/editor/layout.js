"use client"
import { Separator } from "@/components/ui/separator"
import { UserRepositories } from "@/components/user-repositories"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { AnimatePresence } from "framer-motion"
export default function EditorPage({children}) {
  const { isLoaded, isSignedIn } = useUser();
    return (
        <div className="flex flex-col p-4 min-h-screen">
            {isSignedIn ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">Your Repositories</h1>
                    <div className="flex justify-start mb-4">
                        <Link href="/editor/new">
                            <Button>
                                <PlusIcon className="w-4 h-4" />
                                Create New Repository
                            </Button>
                        </Link>
                    </div>
                </>
            ) : isLoaded ? (
                <div className="flex flex-col p-4">
                    <h1 className="text-2xl font-bold mb-4">Editor is Disabled for Non-Signed In Users</h1>
                </div>
            ) : (
                <></>
            )}
            <Separator className="mb-4" />
            <UserRepositories />
            <AnimatePresence className="">
                {children}
            </AnimatePresence>
        </div>
    )
}