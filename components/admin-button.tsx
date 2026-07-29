'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('temon_token')

    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))

      setIsAdmin(payload.role === 'ADMIN')
    } catch (e) {
      console.error(e)
    }
  }, [])

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-black/80"
    >
      <ShieldCheck className="h-4 w-4" />
      관리자 페이지
    </Link>
  )
}