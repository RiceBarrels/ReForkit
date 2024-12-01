"use client"

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function SearchPage({ searchParams = { query: '' } }) {
    const router = useRouter();

    const handleSearch = (value) => {
        const query = encodeURIComponent(value);
        router.push(`/search?query=${query}`);
    };

    return (
        <div className="flex items-center gap-2">
            <Search className="w-10 h-10 text-gray-500" />
            <Input 
                defaultValue={searchParams.query}  // Changed from value to defaultValue
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search for repositories" 
            />
        </div>
    );
}

