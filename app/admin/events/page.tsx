'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EventStatusBadge } from '@/components/status-badge'
import { formatDateTime } from '@/lib/format'
import {
  getAdminEvents,
  saveEvent,
  deleteEvent,
} from '@/services/admin.service'
import type { EventStatus, EventSummary } from '@/types'

const empty = {
  title: '',
  description: '',
  status: 'UPCOMING' as EventStatus,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventSummary[] | null>(null)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventSummary | null>(null)
  const [form, setForm] = useState(empty)

  const load = () => getAdminEvents().then(setEvents)
  useEffect(() => {
    load()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(empty)
    setOpen(true)
  }
  const openEdit = (e: EventSummary) => {
    setEditing(e)
    setForm({ title: e.title, description: e.description, status: e.status })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('이벤트명을 입력해주세요.')
      return
    }
    await saveEvent({ ...editing, ...form })
    toast.success(editing ? '이벤트가 수정되었습니다.' : '이벤트가 생성되었습니다.')
    setOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteEvent(id)
    toast.success('이벤트가 삭제되었습니다.')
    load()
  }

  return (
    <>
      <AdminHeader
        title="이벤트 관리"
        description="라이브 커머스 이벤트를 생성하고 상태를 관리합니다."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            이벤트 생성
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이벤트</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">상품 수</TableHead>
                <TableHead className="w-24 text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!events
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : events.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                            <Image
                              src={e.image || '/placeholder.svg'}
                              alt={e.title}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{e.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <EventStatusBadge status={e.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(e.startAt)} ~ {formatDateTime(e.endAt)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {e.productCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="수정"
                            onClick={() => openEdit(e)}
                          >
                            <Pencil />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="삭제"
                                  className="text-danger"
                                >
                                  <Trash2 />
                                </Button>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  이벤트를 삭제할까요?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {e.title} 이벤트가 삭제됩니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(e.id)}
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '이벤트 수정' : '이벤트 생성'}</DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">이벤트명</FieldLabel>
              <Input
                id="title"
                value={form.title}
                onChange={(ev) => setForm({ ...form, title: ev.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edesc">설명</FieldLabel>
              <Textarea
                id="edesc"
                value={form.description}
                onChange={(ev) =>
                  setForm({ ...form, description: ev.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>상태</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as EventStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPCOMING">오픈예정</SelectItem>
                  <SelectItem value="OPEN">진행중</SelectItem>
                  <SelectItem value="CLOSED">종료</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">취소</Button>} />
            <Button onClick={handleSave}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
