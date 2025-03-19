"use client"
import { SignIn } from '@clerk/nextjs'

export default function Page() {

  // add a ?redirect_url= to the sign in page
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect_url');

  return <SignIn fallbackRedirectUrl={redirectUrl} />
}