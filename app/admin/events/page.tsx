'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import Image from 'next/image'

import {
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { toast } from 'sonner'

import { AdminHeader } from '@/components/admin/admin-header'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'

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
  deleteEvent,
  getAdminEvents,
  saveEvent,
} from '@/services/admin.service'

import type {
  EventStatus,
  EventSummary,
} from '@/types'

interface EventForm {
  title: string
  description: string
  startAt: string
  endAt: string
  status: EventStatus
}

function getEventImageUrl(image?: string, id?: string): string {
  if (image && image.trim()) return image;
  if (id === '1' || id === 'home-living') return '/images/home-living.png';
  if (id === '2' || id === 'tech-friday') return '/images/tech-friday.png';
  return '/placeholder.svg';
}

function formatDateTimeLocal(
  value?: string,
): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  const hours = String(
    date.getHours(),
  ).padStart(2, '0')

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function createEmptyForm(): EventForm {
  const now = new Date()

  const end = new Date(
    now.getTime() + 60 * 60 * 1000,
  )

  return {
    title: '',
    description: '',
    startAt:
      formatDateTimeLocal(
        now.toISOString(),
      ),
    endAt:
      formatDateTimeLocal(
        end.toISOString(),
      ),
    status: 'UPCOMING',
  }
}

export default function AdminEventsPage() {
  const [events, setEvents] =
    useState<EventSummary[] | null>(null)

  const [open, setOpen] =
    useState(false)

  const [editing, setEditing] =
    useState<EventSummary | null>(null)

  const [form, setForm] =
    useState<EventForm>(
      createEmptyForm(),
    )

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const response =
        await getAdminEvents()

      setEvents(response)
    } catch (error) {
      console.error(
        '이벤트 목록 조회 실패:',
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : '이벤트 목록을 불러오지 못했습니다.',
      )

      setEvents([])
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(createEmptyForm())
    setOpen(true)
  }

  const openEdit = (
    event: EventSummary,
  ) => {
    setEditing(event)

    setForm({
      title: event.title,
      description:
        event.description ?? '',
      startAt:
        formatDateTimeLocal(
          event.startAt,
        ),
      endAt:
        formatDateTimeLocal(
          event.endAt,
        ),
      status: event.status,
    })

    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error(
        '이벤트명을 입력해주세요.',
      )
      return
    }

    if (!form.startAt) {
      toast.error(
        '이벤트 시작일을 입력해주세요.',
      )
      return
    }

    if (!form.endAt) {
      toast.error(
        '이벤트 종료일을 입력해주세요.',
      )
      return
    }

    const startAt =
      new Date(form.startAt)

    const endAt =
      new Date(form.endAt)

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime())
    ) {
      toast.error(
        '올바른 이벤트 기간을 입력해주세요.',
      )
      return
    }

    if (endAt <= startAt) {
      toast.error(
        '종료일은 시작일보다 늦어야 합니다.',
      )
      return
    }

    try {
      setSaving(true)

      await saveEvent({
        id: editing?.id,
        title: form.title.trim(),
        description:
          form.description.trim(),
        startAt: form.startAt,
        endAt: form.endAt,
        status: form.status,
      })

      toast.success(
        editing
          ? '이벤트가 수정되었습니다.'
          : '이벤트가 생성되었습니다.',
      )

      setOpen(false)
      setEditing(null)

      await load()
    } catch (error) {
      console.error(
        '이벤트 저장 실패:',
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : '이벤트 저장에 실패했습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    id: string,
  ) => {
    try {
      setDeletingId(id)

      await deleteEvent(id)

      toast.success(
        '이벤트가 삭제되었습니다.',
      )

      await load()
    } catch (error) {
      console.error(
        '이벤트 삭제 실패:',
        error,
      )

      toast.error(
        error instanceof Error
          ? error.message
          : '이벤트 삭제에 실패했습니다.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <AdminHeader
        title="이벤트 관리"
        description="라이브 커머스 이벤트를 생성하고 상태를 관리합니다."
        actions={
          <Button
            size="sm"
            onClick={openCreate}
          >
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
                <TableHead>
                  이벤트
                </TableHead>

                <TableHead>
                  상태
                </TableHead>

                <TableHead>
                  기간
                </TableHead>

                <TableHead className="text-right">
                  상품 수
                </TableHead>

                <TableHead className="w-24 text-right">
                  관리
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {events === null &&
                Array.from({
                  length: 4,
                }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {events?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-muted-foreground"
                  >
                    등록된 이벤트가 없습니다.
                  </TableCell>
                </TableRow>
              )}

              {events?.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                        <Image
                          src={getEventImageUrl(event.image, event.id)}
                          alt={event.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {event.title}
                        </p>

                        {event.description && (
                          <p className="max-w-80 truncate text-xs text-muted-foreground">
                            {
                              event.description
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <EventStatusBadge
                      status={event.status}
                    />
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    <div>
                      {formatDateTime(
                        event.startAt,
                      )}
                    </div>

                    <div>
                      ~{' '}
                      {formatDateTime(
                        event.endAt,
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right tabular-nums">
                    {event.productCount}
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="수정"
                        onClick={() =>
                          openEdit(event)
                        }
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
                              disabled={
                                deletingId ===
                                event.id
                              }
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
                              {event.title} 이벤트가
                              삭제 상태로 변경됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              취소
                            </AlertDialogCancel>

                            <AlertDialogAction
                              onClick={() =>
                                void handleDelete(
                                  event.id,
                                )
                              }
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

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (saving) {
            return
          }

          setOpen(nextOpen)

          if (!nextOpen) {
            setEditing(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? '이벤트 수정'
                : '이벤트 생성'}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="event-title">
                이벤트명
              </FieldLabel>

              <Input
                id="event-title"
                value={form.title}
                placeholder="이벤트명을 입력하세요."
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    title:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event-description">
                설명
              </FieldLabel>

              <Textarea
                id="event-description"
                value={form.description}
                placeholder="이벤트 설명을 입력하세요."
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event-start-at">
                시작일
              </FieldLabel>

              <Input
                id="event-start-at"
                type="datetime-local"
                value={form.startAt}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    startAt:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="event-end-at">
                종료일
              </FieldLabel>

              <Input
                id="event-end-at"
                type="datetime-local"
                value={form.endAt}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    endAt:
                      event.target.value,
                  }))
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                상태
              </FieldLabel>

              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    status:
                      value as EventStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="UPCOMING">
                    오픈 예정
                  </SelectItem>

                  <SelectItem value="OPEN">
                    진행 중
                  </SelectItem>

                  <SelectItem value="CLOSED">
                    종료
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  disabled={saving}
                >
                  취소
                </Button>
              }
            />

            <Button
              disabled={saving}
              onClick={() =>
                void handleSave()
              }
            >
              {saving
                ? '저장 중...'
                : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}