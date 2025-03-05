"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Globe, GitFork, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchGitHubRepos } from "@/app/actions/github";
import { formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function UserRepositories() {
  const { isLoaded, isSignedIn } = useUser();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useClerk();
  const [sortBy, setSortBy] = useState("updated");

  useEffect(() => {
    async function loadRepos() {
      try {
        console.log('Starting to load repos');
        setLoading(true);
        setError(null);
        
        // Add delay and retry logic for temporary auth issues
        const maxRetries = 3;
        let retryCount = 0;
        
        while (retryCount < maxRetries) {
          try {
            const result = await fetchGitHubRepos();
            if (!result.connected) {
              throw new Error(result.message || 'GitHub account not connected');
            }
            setRepos(result.repos || []);
            break;
          } catch (err) {
            retryCount++;
            if (retryCount === maxRetries) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
          }
        }
      } catch (err) {
        console.error("Repository fetch error:", err);
        setError(err.message || 'Failed to fetch repositories');
      } finally {
        setLoading(false);
      }
    }

    if (isLoaded && isSignedIn) {
      loadRepos();
    } else if (isLoaded && !isSignedIn) {
      setRepos([]);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Add debugging for conditional renders
  console.log('Render state:', { isLoaded, isSignedIn, loading, error, reposLength: repos.length });

  const connectGitHub = async () => {
    try {
      await user.createExternalAccount({
        strategy: "oauth_github",
        redirect_url: "/editor", // Where to redirect after connecting
      });
    } catch (err) {
      console.error("Error connecting GitHub:", err);
    }
  };

  // Get 5 most recently updated repos (always sorted by update time)
  const recentRepos = [...repos]
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 5);

  // Sort repositories based on selected option (for "All Repositories" section)
  const sortedRepos = [...repos].sort((a, b) => {
    switch (sortBy) {
      case "updated":
        return new Date(b.updated_at) - new Date(a.updated_at);
      case "created":
        return new Date(b.created_at) - new Date(a.created_at);
      case "stars":
        return b.stargazers_count - a.stargazers_count;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  // Add this container variant near the top of the component
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Update the RepoCard component to use motion
  const RepoCard = ({ repo }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        key={repo.id}
        href={`/editor/${repo.full_name}`}
        className="block p-4 rounded-lg border bg-card hover:bg-accent transition-colors bg-slate-100 dark:bg-slate-800"
      >
        <div className="flex items-center gap-2 mb-2">
          {/* Owner Avatar */}
          <img 
            src={repo.owner.avatar_url} 
            alt={`${repo.owner.login}'s avatar`}
            className="w-5 h-5 rounded-full"
          />
          {/* Owner/Repo Name */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">{repo.owner.login}</span>
            <span className="text-sm text-muted-foreground mx-1">/</span>
            <h3 className="font-medium">{repo.name || 'Unnamed Repository'}</h3>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {repo.description || 'No description'}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {repo.private ? <Lock className="w-4 h-4 mr-1" /> : <Globe className="w-4 h-4 mr-1" />}
              {repo.private ? 'Private' : 'Public'}
            </div>
            {repo.language && (
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-primary" />
                {repo.language}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1" />
              {repo.stargazers_count || 0}
            </div>
            <div className="flex items-center">
              <GitFork className="w-4 h-4 mr-1" />
              {repo.forks_count || 0}
            </div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <div>Created {formatDistanceToNow(new Date(repo.created_at))} ago</div>
          <div>Updated {formatDistanceToNow(new Date(repo.updated_at))} ago</div>
        </div>
      </Link>
    </motion.div>
  );

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-8 h-[calc(100vh-10rem)]">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading user...</span>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!isSignedIn) {
    return (
      <div className="p-4 border rounded-lg">
        <p className="text-muted-foreground">
          Please sign in to view your repositories.
        </p>
        <Link 
          href="/login"
          className="text-sm text-primary hover:underline mt-2 block"
        >
          Go to login →
        </Link>
      </div>
    );
  }

  // Show loading state while fetching repositories
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 h-[calc(100vh-10rem)]">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2 text-muted-foreground">Loading Repositories...</span>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
        <p className="text-destructive font-medium mb-2">Error loading repositories</p>
        <p className="text-sm text-destructive mb-4">{error}</p>
        <small className="text-muted-foreground">
          If you have connected your GitHub account, please try refreshing the page.
        </small>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => loadRepos()}
            className="text-sm"
          >
            Try Again
          </Button>
          {error.includes('not connected') && (
            <Button 
              variant="default"
              onClick={() => connectGitHub()}
              className="text-sm"
            >
              Connect GitHub
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Show empty state
  if (repos.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground mb-4">No repositories found</p>
        <Button 
          variant="outline"
          onClick={() => loadRepos()}
          className="text-sm"
        >
          Refresh
        </Button>
      </div>
    );
  }

  // Show repositories list
  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <h3 className="text-lg font-extrabold mb-4">Recent Updates:</h3>
        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {recentRepos.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </motion.div>
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-extrabold">All Repositories:</h3>
          <motion.div whileHover={{ scale: 1.05 }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Sort by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy("updated")}>
                  Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("created")}>
                  Creation Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("stars")}>
                  Stars
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("name")}>
                  Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
        
        <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedRepos.map(repo => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </motion.div>
      </motion.div>
    </>
  );
}