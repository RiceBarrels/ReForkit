'use client'

import { redirect, usePathname } from 'next/navigation'

export default function Page() {
    const path = usePathname()
    redirect(`${path}/index.html`)

  return (
    <div>
    </div>
  )
}
