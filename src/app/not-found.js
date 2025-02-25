"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function NotFound() {
    const router = useRouter()
  return (
    <div className='flex flex-col items-center justify-center min-h-screen min-w-screen'>
      <h2 className='text-2xl font-bold'>Not Found</h2>
      <p className='text-muted-foreground'>Could not find requested resource</p>
      <div className='flex flex-row gap-2'>
        <Button variant="outline" className='mt-4' onClick={() => router.back()}>
          Previous Page
        </Button>
        <Button className='mt-4' asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  )
}