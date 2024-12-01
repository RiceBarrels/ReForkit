import { clerkMiddleware } from "@clerk/nextjs/server";

// Export Clerk middleware
export default clerkMiddleware({
  // Define public routes
  publicRoutes: [
    "/",
    "/login(.*)",
    "/register(.*)",
    "/api/public(.*)",
  ],
  
  // Define routes that should be ignored by the middleware
  ignoredRoutes: [
    "/((?!api|trpc))(_next.*|.+.[w]+$)", // Ignore static files
    "/api/public(.*)",                    // Ignore public API routes
  ],

  // Optional: Debug mode
  debug: true,

  beforeAuth: (req) => {
    console.log('Current server time:', new Date().toISOString());
  }
});

// Configure middleware matcher
export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};