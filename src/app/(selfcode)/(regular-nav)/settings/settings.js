"use client"
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { UserSettings, EditorSettings, AppearanceSettings, AdvancedSettings, BetaSettings } from './settingPages';
import { motion, AnimatePresence } from 'framer-motion';

export default function Settings() {
    const [selected, setSelected] = useState("User")

    const menuItems = [
        { id: "User", label: "User" },
        { id: "Appearance", label: "Appearance" },
        { id: "Advanced", label: "Advanced" },
        { id: "Beta", label: "Beta" },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 w-full h-[100dvh] flex flex-col"
        >
            <motion.h1 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                className="text-2xl font-bold mb-2"
            >
                Settings
            </motion.h1>
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Separator />
            </motion.div>
            <div className='flex flex-1'>
                <div className='w-52 p-4 flex flex-col gap-6'>
                    {menuItems.map((item, index) => (
                        <motion.h2
                            key={item.id}
                            initial={{ x: -40, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ 
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                            onClick={() => setSelected(item.id)}
                            className={`text-lg font-semibold hover:scale-105 transition-all hover:bg-muted rounded-md p-2 py-1 hover:shadow-lg cursor-pointer
                                ${selected === item.id ? "scale-125 shadow-xl -translate-x-2 bg-muted hover:scale-125 hover:shadow-xl" : ""}`}
                            whileHover={{ 
                                scale: selected === item.id ? 1.25 : 1.05,
                                transition: { type: "spring", stiffness: 400 }
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item.label}
                        </motion.h2>
                    ))}
                </div>
                <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Separator orientation='vertical' />
                </motion.div>
                <div className='flex-1 p-4'>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selected}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {selected === "User" && <UserSettings />}
                            {selected === "Appearance" && <AppearanceSettings />}
                            {selected === "Advanced" && <AdvancedSettings />}
                            {selected === "Beta" && <BetaSettings />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
