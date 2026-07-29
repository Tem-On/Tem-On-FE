'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Search, User, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'

export function SiteHeader() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const [query, setQuery] = useState('')

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/events${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 md:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-1.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Tem-On</span>
        </Link>

        <form onSubmit={onSearch} className="hidden flex-1 md:block">
          <InputGroup>
            <InputGroupInput
              placeholder="이벤트, 상품을 검색해보세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>
        </form>

        <nav className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/events" />}
          >
            이벤트
          </Button>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="마이메뉴">
                    <Avatar className="size-7">
                      <AvatarImage src={user?.profileImage} alt="" />
                      <AvatarFallback>
                        {user?.nickname?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{user?.nickname}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/mypage')}>
                    <User />
                    마이페이지
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout}>
                    <LogOut />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" nativeButton={false} render={<Link href="/login" />}>
              로그인
            </Button>
          )}
        </nav>
      </div>

      <form onSubmit={onSearch} className="border-t px-4 py-2 md:hidden">
        <InputGroup>
          <InputGroupInput
            placeholder="이벤트, 상품 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
      </form>
    </header>
  )
}
