"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function TermsOfService() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>Terms of Service</span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-6"
        >
          Terms of Service
        </motion.h1>
        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="prose prose-lg dark:prose-invert max-w-none space-y-12"
      >
        <div className="bg-muted/50 p-6 rounded-lg">
          <p className="text-lg leading-relaxed">
            Welcome to Reforkit. These Terms of Service govern your use of our website and services.
            By accessing or using Reforkit, you agree to be bound by these Terms.
          </p>
        </div>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Reforkit, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms of Service. If you do not agree to these Terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">2. Description of Service</h2>
          <p>
            Reforkit provides a web-based code editor platform that allows users to create, edit, and share HTML, 
            CSS, and JavaScript code. Our service may include various features such as real-time preview, code sharing, 
            and GitHub integration.
          </p>
        </section>

        <section className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-3xl font-bold mb-6">3. User Accounts</h2>
          <div className="space-y-6">
            <p>
              To access certain features of Reforkit, you may need to create an account or connect your GitHub account. 
              You are responsible for maintaining the confidentiality of your account credentials and for all activities 
              that occur under your account.
            </p>
            <p className="mt-4">
              You agree to provide accurate and complete information when creating your account and to update your 
              information to keep it accurate and current.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">4. User Content</h2>
          <p>
            You retain ownership of any content you create, upload, or store using our service. By using Reforkit, 
            you grant us a non-exclusive, worldwide, royalty-free license to use, store, and display your content 
            for the purpose of providing and improving our services.
          </p>
          <p className="mt-4">
            You are solely responsible for your content and the consequences of sharing it. You represent and warrant 
            that you have all necessary rights to your content and that it does not violate any third-party rights or 
            applicable laws.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">5. Prohibited Conduct</h2>
          <p>You agree not to use Reforkit to:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {[
              "Violate any laws or regulations",
              "Infringe on intellectual property rights",
              "Distribute malware or engage in hacking",
              "Harass, abuse, or harm others",
              "Send spam or unsolicited messages",
              "Attempt to disrupt our services",
              "Create multiple accounts for abuse"
            ].map((item, index) => (
              <div key={index} className="p-4 bg-background rounded-lg">
                <p className="text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">6. Intellectual Property</h2>
          <p>
            Reforkit and its original content, features, and functionality are owned by Reforkit and are protected 
            by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">7. Third-Party Services</h2>
          <p>
            Reforkit may integrate with third-party services, such as GitHub. Your use of such third-party services 
            is subject to their respective terms of service and privacy policies. We are not responsible for the 
            content or practices of these third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to Reforkit at our sole discretion, without 
            notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, 
            or for any other reason.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">9. Disclaimer of Warranties</h2>
          <p>
            REFORKIT IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
            INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
            NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">10. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL REFORKIT, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT, 
            INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, 
            DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY 
            TO ACCESS OR USE THE SERVICE.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">11. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any material 
            changes by posting the updated Terms on this page and updating the "Last updated" date.
          </p>
          <p className="mt-4">
            Your continued use of Reforkit after any such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States, 
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="bg-primary/5 p-6 rounded-lg mt-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms, please contact us at:
          </p>
          <Link 
            href="mailto:contact@reforkit.com"
            className="text-primary hover:underline font-medium"
          >
            contact@reforkit.com
          </Link>
        </section>
      </motion.div>
    </div>
  )
}
