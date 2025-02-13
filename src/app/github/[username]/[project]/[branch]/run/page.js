'use client'

import { Loader2 } from 'lucide-react';
import { redirect, usePathname } from 'next/navigation'
import { PiSpinner } from 'react-icons/pi';

export default function Page({ params }) {
    const path = usePathname();
    setTimeout(() => {
      redirect(path + '/index.html')
    }, 1000)
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="font-black">Loading {params.username}'s {params.project}......</h1>
      <Loader2 size="16" className='animate-spin' />
      
    </div>
  )
}
