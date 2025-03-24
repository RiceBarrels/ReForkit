"use client"
import { SignIn } from '@clerk/nextjs'
import '../../clerkStyle.css'

export default function Page() {

  // add a ?redirect_url= to the sign in page
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect_url');

  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn fallbackRedirectUrl={redirectUrl} />
    </div>
  )
}