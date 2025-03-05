"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight, Mail, Github, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FaGithub } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

export default function Contact() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>Contact</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-4"
        >
          Get in Touch
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground max-w-3xl"
        >
          Have questions or feedback? We'd love to hear from you.
        </motion.p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-2/3"
        >
          <div className="p-8 rounded-lg border bg-card">
            <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
            <form>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="How can we help you?" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Your message" className="min-h-[150px]" />
                </div>
                <Button type="submit" className="w-full">Send Message</Button>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-1/3"
        >
          <div className="p-8 rounded-lg border bg-card h-full">
            <h2 className="text-2xl font-bold mb-6">Connect with us</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <a href="mailto:contact@reforkit.com" className="flex items-center gap-2 text-primary hover:underline">
                  <Mail className="h-4 w-4" />
                  contact@reforkit.com
                </a>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">GitHub</h3>
                <a href="https://github.com/reforkit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <FaGithub className="h-4 w-4" />
                  github.com/reforkit
                </a>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Twitter</h3>
                <a href="https://twitter.com/reforkit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                  <FaXTwitter className="h-4 w-4" />
                  @reforkit
                </a>
              </div>
            </div>
            <div className="mt-12">
              <h3 className="text-lg font-semibold mb-2">Hours</h3>
              <p className="text-muted-foreground">
                Our support team is available Monday through Friday from 9am to 5pm EST.
              </p>
              <p className="text-muted-foreground mt-2">
                We typically respond to inquiries within 24 hours.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
