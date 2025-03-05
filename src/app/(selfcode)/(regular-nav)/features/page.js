"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Code, Zap, Share2, Github, GitBranch, Brain, Sparkles, Lock, Globe, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Features() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>Features</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Features
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-3xl"
        >
          Discover the powerful tools and capabilities that make Reforkit the perfect platform for your web development projects.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-lg bg-card border hover:shadow-lg transition-all"
          >
            <feature.icon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-20"
      >
        <Badge className="mb-4">GitHub Integration</Badge>
        <h2 className="text-3xl font-bold mb-6">Powered by GitHub</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {githubFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-6 rounded-lg bg-card border"
            >
              <feature.icon className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center py-16 px-4 rounded-lg bg-muted/50 border"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Start Coding?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Experience all these features and more by trying Reforkit today.
        </p>
        <Link href="/editor" className="inline-block px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
          Launch Editor
        </Link>
      </motion.div>
    </div>
  )
}

const features = [
  {
    icon: Code,
    title: "Real-time Preview",
    description: "See your changes as you type with instant previews that update in real-time."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed with instant loading and responsive editing experience."
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your projects with a simple link that anyone can view and collaborate on."
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with team members or friends simultaneously on the same project."
  },
  {
    icon: Sparkles,
    title: "Auto-formatting",
    description: "Keep your code clean and consistent with automatic formatting."
  },
//   {
//     icon: Brain,
//     title: "AI Assistance",
//     description: "Get intelligent code suggestions and error detection as you type."
//   },
  {
    icon: Globe,
    title: "Accessible Anywhere",
    description: "Access your projects from any device with an internet connection."
  },
  {
    icon: Lock,
    title: "Secure",
    description: "Your code is protected with enterprise-grade security measures."
  }
]

const githubFeatures = [
  {
    icon: Github,
    title: "GitHub Authentication",
    description: "Sign in with your GitHub account and access your repositories seamlessly."
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Commit, branch, and manage your code directly through GitHub's version control system."
  },
  {
    icon: Share2,
    title: "Gist Integration",
    description: "Save and share your code snippets as GitHub Gists with just one click."
  }
]
