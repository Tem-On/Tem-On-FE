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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EventProductStatusBadge } from '@/components/status-badge'
import { StockBar } from '@/components/stock-bar'
import { formatKRW, formatNumber, discountRate } from '@/lib/format'
import {
  getAdminEventProducts,
  getAdminEvents,
  getProducts,
  saveEventProduct,
  deleteEventProduct,
} from '@/services/admin.service'
import type {
  EventProduct,
  EventProductStatus,
  EventSummary,
  Product,
} from '@/types'

interface FormState {
  eventId: string
  productId: string
  eventPrice: string
  totalStock: string
  status: EventProductStatus
}

const emptyForm: FormState = {
  eventId: '',
  productId: '',
  eventPrice: '',
  totalStock: '',
  status: 'READY',
}

const statusLabels: Record<EventProductStatus, string> = {
  READY: '판매 대기',
  ON_SALE: '판매중',
  STOPPED: '판매 중지',
  SOLD_OUT: '품절',
}

export default function AdminEventProductsPage() {
  const [rows, setRows] = useState<EventProduct[] | null>(null)
  const [events, setEvents] = useState<EventSummary[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<EventProduct | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const eventMap = Object.fromEntries(events.map((e) => [e.id, e]))
  const selectedProduct = products.find((p) => p.id === form.productId)

  const load = () => getAdminEventProducts().then(setRows)
  useEffect(() => {
    load()
    getAdminEvents().then(setEvents)
    getProducts().then(setProducts)
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (ep: EventProduct) => {
    setEditing(ep)
    setForm({
      eventId: ep.eventId,
      productId: ep.productId,
      eventPrice: String(ep.eventPrice),
      totalStock: String(ep.totalStock),
      status: ep.status,
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.eventId) {
      toast.error('이벤트를 선택해주세요.')
      return
    }
    if (!form.productId) {
      toast.error('상품을 선택해주세요.')
      return
    }
    const price = Number(form.eventPrice)
    const stock = Number(form.totalStock)
    if (!price || price <= 0) {
      toast.error('올바른 특가를 입력해주세요.')
      return
    }
    if (!stock || stock <= 0) {
      toast.error('올바른 재고 수량을 입력해주세요.')
      return
    }
    // 중복 편성 방지 (신규 편성 시)
    if (
      !editing &&
      rows?.some(
        (r) => r.eventId === form.eventId && r.productId === form.productId,
      )
    ) {
      toast.error('이미 해당 이벤트에 편성된 상품입니다.')
      return
    }

    await saveEventProduct({
      id: editing?.id,
      eventId: form.eventId,
      productId: form.productId,
      eventPrice: price,
      totalStock: stock,
      status: form.status,
    })
    toast.success(editing ? '이벤트 상품이 수정되었습니다.' : '상품이 이벤트에 편성되었습니다.')
    setOpen(false)
    load()
  }

  const handleDelete = async (id: string) => {
    await deleteEventProduct(id)
    toast.success('편성이 해제되었습니다.')
    load()
  }

  return (
    <>
      <AdminHeader
        title="이벤트 상품"
        description="어떤 상품을 어떤 이벤트에 편성할지 관리합니다."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus data-icon="inline-start" />
            상품 편성
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead>이벤트</TableHead>
                <TableHead className="text-right">특가</TableHead>
                <TableHead className="w-48">재고</TableHead>
                <TableHead className="text-right">판매</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="w-24 text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!rows
                ? Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : rows.map((ep) => {
                    const rate = discountRate(ep.originalPrice, ep.eventPrice)
                    return (
                      <TableRow key={ep.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={ep.image || '/placeholder.svg'}
                                alt={ep.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-medium">{ep.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {eventMap[ep.eventId]?.title ?? '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold tabular-nums">
                              {formatKRW(ep.eventPrice)}
                            </span>
                            {rate > 0 && (
                              <span className="text-xs text-danger">
                                {rate}% 할인
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StockBar
                            remaining={ep.remainingStock}
                            total={ep.totalStock}
                          />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatNumber(ep.soldCount)}
                        </TableCell>
                        <TableCell>
                          <EventProductStatusBadge status={ep.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="수정"
                              onClick={() => openEdit(ep)}
                            >
                              <Pencil />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="편성 해제"
                                    className="text-danger"
                                  >
                                    <Trash2 />
                                  </Button>
                                }
                              />
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    편성을 해제할까요?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {ep.name} 상품이 해당 이벤트에서 제외됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(ep.id)}
                                  >
                                    해제
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? '이벤트 상품 수정' : '상품 편성'}
            </DialogTitle>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>이벤트</FieldLabel>
              <Select
                value={form.eventId}
                onValueChange={(v) => setForm({ ...form, eventId: v ?? '' })}
                disabled={!!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="이벤트를 선택하세요">
                    {(value: string) =>
                      eventMap[value]?.title ?? '이벤트를 선택하세요'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>상품</FieldLabel>
              <Select
                value={form.productId}
                onValueChange={(v) => setForm({ ...form, productId: v ?? '' })}
                disabled={!!editing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품을 선택하세요">
                    {(value: string) =>
                      products.find((p) => p.id === value)?.name ??
                      '상품을 선택하세요'
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({formatKRW(p.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="eventPrice">
                이벤트 특가
                {selectedProduct && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    정상가 {formatKRW(selectedProduct.price)}
                  </span>
                )}
              </FieldLabel>
              <Input
                id="eventPrice"
                type="number"
                inputMode="numeric"
                placeholder="예: 77000"
                value={form.eventPrice}
                onChange={(ev) =>
                  setForm({ ...form, eventPrice: ev.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="totalStock">판매 수량 (재고)</FieldLabel>
              <Input
                id="totalStock"
                type="number"
                inputMode="numeric"
                placeholder="예: 200"
                value={form.totalStock}
                onChange={(ev) =>
                  setForm({ ...form, totalStock: ev.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>판매 상태</FieldLabel>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as EventProductStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {(value: EventProductStatus) => statusLabels[value]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="READY">판매 대기</SelectItem>
                  <SelectItem value="ON_SALE">판매중</SelectItem>
                  <SelectItem value="STOPPED">판매 중지</SelectItem>
                  <SelectItem value="SOLD_OUT">품절</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">취소</Button>} />
            <Button onClick={handleSave}>
              {editing ? '저장' : '편성하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
