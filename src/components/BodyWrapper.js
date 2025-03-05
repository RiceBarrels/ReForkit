'use client'

export default function BodyWrapper({ children }) {
  return (
    <body onContextMenu={(e) => e.preventDefault()}>
      {children}
    </body>
  )
} 