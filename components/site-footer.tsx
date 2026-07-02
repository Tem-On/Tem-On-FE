import Link from 'next/link'
import { Zap } from 'lucide-react'

const columns = [
  {
    title: '고객지원',
    links: [
      { label: '공지사항', href: '#' },
      { label: '자주 묻는 질문', href: '#' },
      { label: '1:1 문의', href: '#' },
    ],
  },
  {
    title: '회사',
    links: [
      { label: '회사소개', href: '#' },
      { label: '이용약관', href: '#' },
      { label: '개인정보처리방침', href: '#' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-card">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-8 px-4 py-10 md:grid-cols-3">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Zap className="size-4" />
            </span>
            <span className="text-lg font-bold">Tem-On</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            실시간 이벤트 커머스. 대기열과 실시간 재고로 공정하게, 놓치지 않고
            구매하세요.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Tem-On. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
