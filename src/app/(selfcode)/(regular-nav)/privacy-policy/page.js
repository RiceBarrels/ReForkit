import Link from "next/link"
import { ChevronRight } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span>Privacy Policy</span>
        </div>
        
        <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
        {/* Introduction */}
        <div className="bg-muted/50 p-6 rounded-lg">
          <p className="text-lg leading-relaxed">
            At Reforkit, we take your privacy seriously. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our web-based code editor platform.
          </p>
        </div>

        {/* Main Content Sections */}
        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">Information We Collect</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-4">Personal Information</h3>
              <p className="mb-4">
                When you use Reforkit, we may collect certain personally identifiable information, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>GitHub account information (when you authorize with GitHub)</li>
                <li>Email address</li>
                <li>Usage data and preferences</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold mb-4">Non-Personal Information</h3>
              <p className="mb-4">
                We may also collect non-personal information about how you use our service, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Referral source</li>
                <li>Length of visit, page views</li>
                <li>Navigation paths</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Cookie Section with Visual Distinction */}
        <section className="bg-muted/30 p-6 rounded-lg">
          <h2 className="text-3xl font-bold mb-6" id="cookies">Cookies and Tracking Technologies</h2>
          <div className="space-y-6">
            <p className="text-lg">
              We use cookies and similar tracking technologies to track the activity on our service and hold certain information.
              Cookies are files with a small amount of data that may include an anonymous unique identifier.
            </p>

            <div>
              <h3 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Essential Cookies</h4>
                  <p className="text-muted-foreground">Required for the website to function properly</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Functional Cookies</h4>
                  <p className="text-muted-foreground">Help with user experience and remember preferences</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                  <p className="text-muted-foreground">Help us understand how visitors interact with our website</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Authentication Cookies</h4>
                  <p className="text-muted-foreground">Manage your login session and security</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Advertising Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 pb-2 border-b">Advertising</h2>
          <div className="space-y-6">
            <p className="text-lg">
              We may use third-party advertising services to serve advertisements when you visit our website. These
              services may use information about your visits to our website and other websites to provide relevant
              advertisements about goods and services that may interest you.
            </p>

            <div className="bg-muted/30 p-6 rounded-lg">
              <h3 className="text-2xl font-semibold mb-4">Your Advertising Choices</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can opt out of personalized advertising by visiting your browser&apos;s privacy settings</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can visit <Link href="https://www.aboutads.info" className="text-primary hover:underline">www.aboutads.info</Link> to learn more about online behavioral advertising</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can opt out of some third-party vendors&apos; uses of cookies for personalized advertising by visiting <Link href="https://www.aboutads.info/choices" className="text-primary hover:underline">www.aboutads.info/choices</Link></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-primary/5 p-6 rounded-lg mt-12">
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <Link 
            href="mailto:contact@reforkit.com"
            className="text-primary hover:underline font-medium"
          >
            contact@reforkit.com
          </Link>
        </section>
      </div>
    </div>
  )
}
