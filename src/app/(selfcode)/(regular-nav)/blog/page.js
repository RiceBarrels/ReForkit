"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Calendar, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Blog() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>Blog</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Blog
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-3xl"
        >
          Latest news, tips, and insights from the Reforkit team.
        </motion.p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-12 mb-20">
        <div className="lg:col-span-2">
          {blogPosts.map((post, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="mb-12 pb-12 border-b last:border-b-0"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-auto hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.map((category, i) => (
                  <Badge key={i} variant="secondary" className="font-normal">
                    {category}
                  </Badge>
                ))}
              </div>
              <Link href={`/blog/${post.slug}`}>
                <h2 className="text-2xl font-bold mb-3 hover:text-primary transition-colors">
                  {post.title}
                </h2>
              </Link>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {post.date}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {post.readTime} read
                </div>
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {post.author}
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                {post.excerpt}
              </p>
              <Link href={`/blog/${post.slug}`} className="text-primary font-medium hover:underline">
                Read more
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="p-6 rounded-lg border bg-card">
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge key={index} variant="outline" className="hover:bg-primary/10 cursor-pointer">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const blogPosts = [
  {
    title: "Introducing Reforkit: A New Era for Web Development",
    slug: "introducing-reforkit",
    image: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    categories: ["Announcements", "Web Development"],
    date: "March 2, 2025",
    readTime: "5 min",
    author: "Muheng Fan",
    excerpt: "Today, we're excited to introduce Reforkit, a new web-based code editor designed to streamline your web development workflow and make coding more collaborative and accessible than ever before."
  }
]

const categories = [
  "Announcements", 
  "Tutorials", 
  "Tips & Tricks", 
  "Web Development", 
  "JavaScript", 
  "CSS", 
  "HTML", 
  "GitHub"
]