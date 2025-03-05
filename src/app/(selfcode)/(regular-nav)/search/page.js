"use client"

import { useState, useEffect, use } from 'react';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion'; // Importing motion for animations
import { useDebounce } from 'use-debounce'; // Add this import
import Link from 'next/link';

export default function Page({ searchParams }) {
    const params = use(searchParams);
    const router = useRouter();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update to use params.query
    const [hasSearched, setHasSearched] = useState(!!params.query);

    const [searchValue, setSearchValue] = useState(params.query || '');
    const [debouncedValue] = useDebounce(searchValue, 1000); // 1 second delay

    // Update initial page state to use URL params
    const [currentPage, setCurrentPage] = useState(parseInt(params.page) || 1);

    // Update handleSearch to handle both immediate and debounced searches
    const handleSearch = (value, immediate = false) => {
        setSearchValue(value);
        
        if (immediate) {
            performSearch(value);
        }
    };

    const performSearch = (value) => {
        if (!value.trim()) {
            setHasSearched(false);
            setCurrentPage(1);
            router.push('/search');
            return;
        }
        setHasSearched(true);
        setCurrentPage(1);
        const query = encodeURIComponent(value);
        router.push(`/search?query=${query}&page=1`);
    };

    useEffect(() => {
        performSearch(debouncedValue);
    }, [debouncedValue]);

    useEffect(() => {
        async function fetchResults() {
            if (!params.query) return;
            
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `https://api.github.com/search/repositories?q=${encodeURIComponent(params.query)}&page=${currentPage}&per_page=10`,
                    {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'NextJS-App'
                        }
                    }
                );
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchResults();
    }, [params.query, currentPage]);

    return (
        <div className="flex flex-col items-center min-h-screen">
            <motion.div 
                className={`flex flex-col items-center justify-center w-full gap-2 ${hasSearched ? 'mt-8' : 'mt-[40vh]'}`}
                animate={{
                    y: hasSearched ? 0 : 0,  // Changed from "40vh" to 0
                    scale: hasSearched ? 0.9 : 1
                }}
                transition={{ duration: 0.5 }}
            >
                <motion.div
                    whileTap={{ scale: 0.97 }}
                    whileFocus={{ scale: 1.02 }}
                    initial={{ scale: 1 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"  // Added relative positioning
                >
                    <div className="text-sm text-muted-foreground mb-2">
                        <small>Press ⌘S to Focus</small>
                    </div>
                    <Input 
                        // auto focus on input
                        autoFocus
                        id="search-input"
                        defaultValue={params.query}
                        onChange={(e) => handleSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.target.value, true);
                            }
                            if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
                                e.preventDefault();
                                const input = document.getElementById('search-input');
                                if (input) {
                                    input.focus();
                                }
                            }
                        }}
                        onFocus={() => {
                            // Add ripple effect on focus
                            const input = document.getElementById('search-input');
                            if (input) {
                                input.animate([
                                    { boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.4)' },
                                    { boxShadow: '0 0 0 15px rgba(99, 102, 241, 0)' }
                                ], {
                                    duration: 800,
                                    easing: 'ease-out',
                                });
                            }
                        }}
                        onBlur={(e) => handleSearch(e.target.value, true)}
                        placeholder="Search for repositories" 
                        className="w-[300px] md:w-[400px] transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:scale-105"
                    />
                </motion.div>

                <div className="text-sm text-gray-500">Press Enter to search on GitHub</div>
            </motion.div>
            
            {loading && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8"
                >
                    <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full" />
                </motion.div>
            )}

            {error && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 text-red-500"
                >
                    Error: {error}
                </motion.div>
            )}

            {hasSearched && results?.items?.length > 0 ? (
                <motion.div 
                    className="mt-8 w-full max-w-2xl px-4"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl font-bold mb-4">Search Results</h1>
                    <ul className="space-y-4">
                        {results.items.map((repo, index) => (
                            <motion.li 
                                key={repo.id}
                                initial={{ opacity: 0, x: -20 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
                            >
                                <Link 
                                    href={`github/${repo.full_name}`}
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline font-medium"
                                >
                                    {repo.full_name}
                                </Link>
                                <p className=" mt-2">{repo.description || 'No description available'}</p>
                                <small className="">Stars: {repo.stargazers_count}</small>&nbsp;
                                <small className="">Forks: {repo.forks_count}</small>&nbsp;
                                <small className="">Language: {repo.language}</small>
                                <div className="mt-2 text-gray-600">
                                    <small>This repo is hosted on <Link href={`https://github.com/${repo.full_name}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GitHub</Link></small>
                                </div>
                            </motion.li>
                        ))}
                    </ul>

                    {hasSearched && results?.items?.length > 0 && (
                        <div className="flex justify-center gap-4 mt-6 mb-8">
                            <button
                                onClick={() => {
                                    const newPage = Math.max(1, currentPage - 1);
                                    setCurrentPage(newPage);
                                    router.push(`/search?query=${encodeURIComponent(params.query)}&page=${newPage}`);
                                }}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="flex items-center">
                                Page {currentPage}
                                {results.total_count && (
                                    <span className="text-sm text-muted-foreground ml-2">
                                        of {Math.ceil(Math.min(results.total_count, 1000) / 10)}
                                    </span>
                                )}
                            </span>
                            <button
                                onClick={() => {
                                    const newPage = currentPage + 1;
                                    setCurrentPage(newPage);
                                    router.push(`/search?query=${encodeURIComponent(params.query)}&page=${newPage}`);
                                }}
                                disabled={!results.items?.length || results.items.length < 10}
                                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </motion.div>
            ) : hasSearched && results?.items?.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8"
                >
                    No results found
                </motion.div>
            ) : null}
        </div>
    );
}
