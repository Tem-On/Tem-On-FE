'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  CalendarDays,
  Tags,
  Boxes,
  Receipt,
  Users,
  Activity,
  Zap,
  Store,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const groups = [
  {
    label: '개요',
    items: [
      { href: '/admin', label: '대시보드', icon: LayoutDashboard },
      { href: '/admin/monitoring', label: '실시간 모니터링', icon: Activity },
    ],
  },
  {
    label: '커머스 관리',
    items: [
      { href: '/admin/products', label: '상품 관리', icon: Package },
      { href: '/admin/events', label: '이벤트 관리', icon: CalendarDays },
      { href: '/admin/event-products', label: '이벤트 상품', icon: Tags },
      { href: '/admin/stock', label: '재고 관리', icon: Boxes },
    ],
  },
  {
    label: '운영',
    items: [
      { href: '/admin/orders', label: '주문 관리', icon: Receipt },
      { href: '/admin/queue', label: '대기열 관리', icon: Users },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/admin" className="flex items-center gap-2 px-2 py-1.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="size-4" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Tem-On</span>
            <span className="text-xs text-muted-foreground">Admin Console</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="스토어로 이동"
              render={<Link href="/" />}
            >
              <Store />
              <span>스토어 바로가기</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
