"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Github, Twitter, Linkedin, Code, Zap, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { FaGithub, FaXTwitter } from "react-icons/fa6"
import { FaLinkedin } from "react-icons/fa"

export default function About() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>About</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          About Reforkit
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-3xl"
        >
          Our mission is to make web development more accessible, collaborative, and enjoyable for everyone.
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold mb-6">My Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Reforkit was born out of my frustration with the complexity and barriers to entry in web development. 
              I wanted to create a tool that would allow anyone to start coding without the hassle of setting up 
              a development environment.
            </p>
            <p>
              Founded in 2025, Reforkit is designed to be a lightweight, accessible, yet powerful 
              platform for web developers of all skill levels. As a high school student with a passion for coding,
              I believe in the power of the web and want to make it more accessible to everyone.
            </p>
            <p>
              I've built Reforkit with a focus on simplicity, performance, and collaboration, leveraging the 
              power of GitHub to provide robust version control and collaboration features that developers expect 
              in their workflow.
            </p>
            <p>
              This is a solo project that I'm developing alongside my studies. It's just getting started, but I have big plans 
              for the future of Reforkit and how it can improve web development for everyone.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="rounded-lg overflow-hidden h-full">
            <img 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Team working together" 
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center mb-20"
      >
        <h2 className="text-3xl font-bold mb-6">Our Values</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="p-6 rounded-lg border bg-card"
            >
              <value.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-20"
      >
        <h2 className="text-3xl font-bold mb-10 text-center">Meet the Developer</h2>
        <div className="max-w-2xl mx-auto p-8 rounded-lg border bg-card">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden mx-auto">
                <img
                  src="https://github.com/identicons/muhengfan.png"
                  alt="Muheng Fan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Muheng Fan</h3>
              <p className="text-muted-foreground mb-4">Founder & Solo Developer | High School Student</p>
              <p className="text-muted-foreground mb-4">
                Full-stack developer and high school student with a passion for creating tools that make web development more accessible.
                Reforkit is my passion project aimed at simplifying the web development experience while I continue my education.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <FaGithub className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <FaXTwitter className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                  <FaLinkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const values = [
  {
    icon: Code,
    title: "Simplicity",
    description: "We believe that powerful tools don't have to be complicated. We strive to make web development accessible to everyone."
  },
  {
    icon: Zap,
    title: "Performance",
    description: "We're committed to building fast, responsive tools that help developers work efficiently without technical barriers."
  },
  {
    icon: Heart,
    title: "Community",
    description: "We value collaboration and believe that the best ideas come from a diverse community working together."
  }
]

const team = [
  {
    name: "Muheng Fan",
    role: "Founder & Solo Developer",
    image: "https://github.com/identicons/RiceBarrels.png"
  }
]