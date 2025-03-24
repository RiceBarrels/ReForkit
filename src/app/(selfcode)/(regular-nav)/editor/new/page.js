"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@clerk/nextjs"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState } from "react"
export default function EditorNewPage() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();
    const [isClosed, setIsClosed] = useState(false);
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1}}
            transition={{ duration: 0.2 }}
            className="flex flex-col p-4 top-0 right-0 fixed w-[calc(100vw-16rem)] h-screen backdrop-blur-sm bg-background/30 border-1 "
            onClick={() => {setTimeout(() => router.push("/editor"), 200); setIsClosed(true)}}
        >
            {isSignedIn ? (
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: isClosed ? 0.9 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full flex justify-center items-center"
                >
                    <Card className="w-1/2 h-1/2">
                        <CardHeader>
                            <CardTitle>Create New Repository</CardTitle>
                        </CardHeader>
                    </Card>
                </motion.div>
            ) : isLoaded ? (
                <></>
            ) : (
                <></>
            )}
        </motion.div>
    )
}