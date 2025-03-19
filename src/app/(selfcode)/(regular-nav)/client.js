"use client"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Code2, Zap, Globe, Users, Check, Code, Brain, Sparkles, Share2, Lock, Github, GitBranch, X, AlertCircle, Download } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { FaGithub } from "react-icons/fa"
import dynamic from "next/dynamic"

// Dynamically import CodePreview (it won't be server-side rendered)
const CodePreview = dynamic(() => import('@/components/CodePreview'), {
  ssr: false,
  loading: () => <div className="h-[586px]"></div>,
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 pt-20 pb-32 text-center"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center items-end mb-6 bg-background">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image 
                priority
                src="/Logo.svg" 
                alt="Reforkit Logo" 
                className="w-16 h-16 mb-0.5" 
                width={64} 
                height={64} 
              />
            </motion.div>
            <motion.div
              initial={{ x: -20, opacity: 0, rotate: -10 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
              className="text-4xl md:text-6xl font-bold text-[#6168e5]"
            >
              eForkit
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            
            {["Code.", "Create.", "Share."].map((word, index) => (
              <motion.h1
                key={index}
                initial={{ y: 20, opacity: 0, rotate: 10 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ delay: 0.6 + index * 0.2 }}
                className="text-4xl md:text-5xl font-bold inline-block mr-3 bg-gradient-to-r from-primary to-[#6168e5] text-transparent bg-clip-text mb-3"
              >
                {word}
              </motion.h1>
            ))}
          </motion.div>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground mb-4"
          >
            A powerful online code editor for HTML, CSS, and JavaScript
          </motion.p>
          <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="flex items-center justify-center gap-2 mb-8">
            <Badge variant="outline" className="py-1">
              <FaGithub className="w-4 h-4 mr-1" />
              Powered by GitHub
            </Badge>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 justify-center mb-12"
        >
          <Link href="/editor">
            <Button size="lg" className="gap-2">
              Start Coding <ArrowRight size={18} />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            View Examples
          </Button>
        </motion.div>
      </motion.div>

      {/* Code Preview: Lazy loaded below above‑fold hero content */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.3 }}
        className="container mx-auto py-12 px-24 pt-0"
      >
        <CodePreview />
      </motion.div>

      {/* Features Section */}
      <div className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12"
          >
            Why Choose Reforkit?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-lg bg-card border"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* New: Live Demo Section */}
      <div className="py-20 border-t">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Live Demo</Badge>
            <h2 className="text-3xl font-bold mb-4">See Reforkit in Action</h2>
            <p className="text-xl text-muted-foreground">
              Watch how easy it is to bring your ideas to life
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="aspect-video rounded-lg border bg-card shadow-xl overflow-hidden"
          >
            {/* Replace with actual demo video or interactive demo */}
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">Demo Video/Interactive Preview</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* New: Key Features Grid */}
      <div className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-muted-foreground">
              Packed with powerful features to enhance your coding experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border hover:shadow-lg transition-all"
              >
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* New: Testimonials Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold mb-4">Loved by Developers</h2>
            <p className="text-xl text-muted-foreground">
              See what others are saying about Reforkit
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-lg bg-card border"
              >
                <p className="text-muted-foreground mb-4">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.initial}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Comparison Section */}
      <div className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge className="mb-4">Comparison</Badge>
            <h2 className="text-3xl font-bold mb-4">Why Choose Reforkit?</h2>
            <p className="text-xl text-muted-foreground">
              The perfect balance of power and simplicity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Replit Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-card border"
            >
              <div className="mb-6">
                <Link href="https://replit.com/pricing" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-2 group">
                  <h3 className="text-2xl font-bold mb-2">Replit Free</h3>
                  <Share2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
                <p className="text-muted-foreground">Basic limitations</p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span>Basic workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span>3 public projects only</span>
                </li>
                
                <li className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span>Poor collaboration (slow syncing)</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X className="w-5 h-5" />
                  <span>Limited storage</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t">
                <Badge variant="secondary">
                  Limited Free Tier
                </Badge>
              </div>
            </motion.div>

            {/* Reforkit Card */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-card border border-primary shadow-lg"
            >
              <div className="mb-6">
                <Link href="/editor" className="hover:underline inline-flex items-center gap-2 group">
                  <h3 className="text-2xl font-bold mb-2">Reforkit</h3>
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
                <p className="text-muted-foreground">Powered by GitHub</p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Fast, lightweight editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Unlimited public projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Real-time collaboration</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>GitHub-powered version control</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>Instant startup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  <span>No setup required</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Always Free
                </Badge>
              </div>
            </motion.div>

            {/* GitHub Codespaces Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-lg bg-card border"
            >
              <div className="mb-6">
                <Link href="https://github.com/features/codespaces" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-2 group">
                  <h3 className="text-2xl font-bold mb-2">GitHub Codespaces</h3>
                  <Share2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </Link>
                <p className="text-muted-foreground">Full development environment</p>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-muted-foreground" />
                  <span>Complete VS Code experience</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span>Manual collaboration (git sync)</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X className="w-5 h-5" />
                  <span>Slow startup time</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X className="w-5 h-5" />
                  <span>Limited free hours (60hr/month)</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <X className="w-5 h-5" />
                  <span>Complex setup required</span>
                </li>
              </ul>
              <div className="mt-6 pt-6 border-t">
                <Badge variant="secondary">
                  Limited Free Tier
                </Badge>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12 text-muted-foreground"
          >
            <p>
              Reforkit provides the perfect balance between simplicity and power. 
              No resource limits, no setup time, just instant coding.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="container mx-auto px-4 py-20 text-center"
      >
        <h2 className="text-3xl font-bold mb-6">Ready to Start Coding?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join thousands of developers who trust Reforkit for their web development needs.
        </p>
        <Link href="/editor">
          <Button size="lg" className="gap-2">
            Launch Editor <ArrowRight size={18} />
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

const features = [
  {
    icon: Code2,
    title: "Real-time Preview",
    description: "See your changes instantly as you code. Perfect for rapid prototyping and development."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built with performance in mind. No lag, no delays - just smooth coding experience."
  },
  {
    icon: Globe,
    title: "Share Your Work",
    description: "Generate shareable links instantly and collaborate with others on your projects."
  }
]

const keyFeatures = [
  {
    icon: Code,
    title: "Syntax Highlighting",
    description: "Support for multiple languages with beautiful syntax highlighting."
  },
  // {
  //   icon: Brain,
  //   title: "AI Assistance",
  //   description: "Get intelligent code suggestions and error detection."
  // },
  {
    icon: Sparkles,
    title: "Auto-formatting",
    description: "Keep your code clean and consistent automatically."
  },
  {
    icon: Share2,
    title: "Collaboration",
    description: "Work together in real-time with other developers."
  },
  {
    icon: Lock,
    title: "Secure",
    description: "Your code is safe with enterprise-grade security."
  },
  {
    icon: Github,
    title: "GitHub Powered",
    description: "Built on GitHub's APIs for reliable, secure, and scalable development."
  },
  {
    icon: GitBranch,
    title: "Version Control",
    description: "Full Git functionality with commit history, branches, and more."
  }
]

const testimonials = [
  {
    text: "Reforkit has completely transformed how I prototype and test new ideas. The real-time preview is a game-changer!",
    name: "Sarah Chen",
    role: "Frontend Developer",
    initial: "SC"
  },
  {
    text: "The best online code editor I've used. Clean interface, fast performance, and great features.",
    name: "Mike Johnson",
    role: "Web Designer",
    initial: "MJ"
  },
  {
    text: "Perfect for teaching web development. My students love how easy it is to get started.",
    name: "David Smith",
    role: "Coding Instructor",
    initial: "DS"
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
