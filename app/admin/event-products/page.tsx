'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { AdminHeader } from '@/components/admin/admin-header'
import { EventProductStatusBadge } from '@/components/status-badge'
import { StockBar } from '@/components/stock-bar'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  deleteEventProduct,
  getAdminEventProducts,
  getAdminEvents,
  getProducts,
  saveEventProduct,
} from '@/services/admin.service'

import {
  discountRate,
  formatKRW,
  formatNumber,
} from '@/lib/format'

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
  purchaseLimit: string
  status: EventProductStatus
}

const emptyForm: FormState = {
  eventId: '',
  productId: '',
  eventPrice: '',
  totalStock: '',
  purchaseLimit: '',
  status: 'READY',
}

const statusLabels: Record<
  EventProductStatus,
  string
> = {
  READY: '판매 대기',
  ON_SALE: '판매중',
  HIDDEN: '판매 중지',
  SOLD_OUT: '품절',
  DELETED: '삭제',
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message
  }

  return '요청 처리 중 오류가 발생했습니다.'
}

export default function AdminEventProductsPage() {
  const [rows, setRows] = useState<
    EventProduct[] | null
  >(null)

  const [events, setEvents] = useState<
    EventSummary[]
  >([])

  const [products, setProducts] = useState<
    Product[]
  >([])

  const [open, setOpen] = useState(false)
  const [saving, setSaving] =
    useState(false)
  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const [editing, setEditing] =
    useState<EventProduct | null>(null)

  const [form, setForm] =
    useState<FormState>(emptyForm)

  const eventMap = useMemo(
    () =>
      Object.fromEntries(
        events.map((event) => [
          event.id,
          event,
        ]),
      ),
    [events],
  )

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.id === form.productId,
      ),
    [products, form.productId],
  )

  const loadEventProducts =
    useCallback(async () => {
      try {
        const data =
          await getAdminEventProducts()
        setRows(data)
      } catch (error) {
        console.error(
          '이벤트 상품 조회 실패:',
          error,
        )

        setRows([])
        toast.error(
          getErrorMessage(error),
        )
      }
    }, [])

  const loadSelectOptions =
    useCallback(async () => {
      try {
        const [
          eventData,
          productPage,
        ] = await Promise.all([
          getAdminEvents(),
          getProducts(0, 1000),
        ])

        setEvents(eventData)
        setProducts(
          productPage.products,
        )
      } catch (error) {
        console.error(
          '선택 항목 조회 실패:',
          error,
        )

        toast.error(
          '이벤트 또는 상품 목록을 불러오지 못했습니다.',
        )
      }
    }, [])

  useEffect(() => {
    void loadEventProducts()
    void loadSelectOptions()
  }, [
    loadEventProducts,
    loadSelectOptions,
  ])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (
    eventProduct: EventProduct,
  ) => {
    setEditing(eventProduct)

    setForm({
      eventId: eventProduct.eventId,
      productId:
        eventProduct.productId,
      eventPrice: String(
        eventProduct.eventPrice,
      ),
      totalStock: String(
        eventProduct.totalStock,
      ),
      purchaseLimit:
        eventProduct.purchaseLimit !==
        undefined
          ? String(
              eventProduct.purchaseLimit,
            )
          : '',
      status: eventProduct.status,
    })

    setOpen(true)
  }

  const handleSave = async () => {
    if (saving) {
      return
    }

    if (!form.eventId) {
      toast.error(
        '이벤트를 선택해주세요.',
      )
      return
    }

    if (!form.productId) {
      toast.error(
        '상품을 선택해주세요.',
      )
      return
    }

    const price = Number(
      form.eventPrice,
    )

    const stock = Number(
      form.totalStock,
    )

    const purchaseLimit =
      form.purchaseLimit.trim()
        ? Number(form.purchaseLimit)
        : undefined

    if (
      !Number.isInteger(price) ||
      price <= 0
    ) {
      toast.error(
        '올바른 이벤트 특가를 입력해주세요.',
      )
      return
    }

    if (
      !Number.isInteger(stock) ||
      stock <= 0
    ) {
      toast.error(
        '올바른 재고 수량을 입력해주세요.',
      )
      return
    }

    if (
      purchaseLimit !== undefined &&
      (!Number.isInteger(
        purchaseLimit,
      ) ||
        purchaseLimit <= 0)
    ) {
      toast.error(
        '구매 제한은 1 이상의 정수여야 합니다.',
      )
      return
    }

    if (
      !editing &&
      rows?.some(
        (row) =>
          row.eventId ===
            form.eventId &&
          row.productId ===
            form.productId,
      )
    ) {
      toast.error(
        '이미 해당 이벤트에 편성된 상품입니다.',
      )
      return
    }

    try {
      setSaving(true)

      await saveEventProduct({
        id: editing?.id,
        eventId: form.eventId,
        productId: form.productId,
        eventPrice: price,
        totalStock: stock,
        purchaseLimit,
        status: form.status,
      })

      toast.success(
        editing
          ? '이벤트 상품이 수정되었습니다.'
          : '상품이 이벤트에 편성되었습니다.',
      )

      setOpen(false)
      setEditing(null)
      setForm(emptyForm)

      await loadEventProducts()
    } catch (error) {
      console.error(
        '이벤트 상품 저장 실패:',
        error,
      )

      toast.error(
        getErrorMessage(error),
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    id: string,
  ) => {
    if (deletingId) {
      return
    }

    try {
      setDeletingId(id)

      await deleteEventProduct(id)

      toast.success(
        '편성이 해제되었습니다.',
      )

      await loadEventProducts()
    } catch (error) {
      console.error(
        '이벤트 상품 삭제 실패:',
        error,
      )

      toast.error(
        getErrorMessage(error),
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <AdminHeader
        title="이벤트 상품"
        description="어떤 상품을 어떤 이벤트에 편성할지 관리합니다."
        actions={
          <Button
            size="sm"
            onClick={openCreate}
          >
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
                <TableHead>
                  상품
                </TableHead>

                <TableHead>
                  이벤트
                </TableHead>

                <TableHead className="text-right">
                  특가
                </TableHead>

                <TableHead className="w-48">
                  재고
                </TableHead>

                <TableHead className="text-right">
                  판매
                </TableHead>

                <TableHead>
                  상태
                </TableHead>

                <TableHead className="w-24 text-right">
                  관리
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!rows ? (
                Array.from({
                  length: 6,
                }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell
                      colSpan={7}
                    >
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    등록된 이벤트 상품이
                    없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(
                  (eventProduct) => {
                    const rate =
                      discountRate(
                        eventProduct.originalPrice,
                        eventProduct.eventPrice,
                      )

                    return (
                      <TableRow
                        key={
                          eventProduct.id
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                              <Image
                                src={
                                  eventProduct.image ||
                                  '/placeholder.svg'
                                }
                                alt={
                                  eventProduct.name
                                }
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>

                            <span className="font-medium">
                              {
                                eventProduct.name
                              }
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-muted-foreground">
                          {eventMap[
                            eventProduct
                              .eventId
                          ]?.title ??
                            '-'}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold tabular-nums">
                              {formatKRW(
                                eventProduct.eventPrice,
                              )}
                            </span>

                            {rate >
                              0 && (
                              <span className="text-xs text-danger">
                                {
                                  rate
                                }
                                % 할인
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <StockBar
                            remaining={
                              eventProduct.remainingStock
                            }
                            total={
                              eventProduct.totalStock
                            }
                          />
                        </TableCell>

                        <TableCell className="text-right tabular-nums">
                          {formatNumber(
                            eventProduct.soldCount,
                          )}
                        </TableCell>

                        <TableCell>
                          <EventProductStatusBadge
                            status={
                              eventProduct.status
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="수정"
                              onClick={() =>
                                openEdit(
                                  eventProduct,
                                )
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
                                    aria-label="편성 해제"
                                    className="text-danger"
                                    disabled={
                                      deletingId ===
                                      eventProduct.id
                                    }
                                  >
                                    <Trash2 />
                                  </Button>
                                }
                              />

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    편성을
                                    해제할까요?
                                  </AlertDialogTitle>

                                  <AlertDialogDescription>
                                    {
                                      eventProduct.name
                                    }{' '}
                                    상품이 해당
                                    이벤트에서
                                    제외됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    취소
                                  </AlertDialogCancel>

                                  <AlertDialogAction
                                    onClick={() =>
                                      void handleDelete(
                                        eventProduct.id,
                                      )
                                    }
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
                  },
                )
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!saving) {
            setOpen(nextOpen)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing
                ? '이벤트 상품 수정'
                : '상품 편성'}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel>
                이벤트
              </FieldLabel>

              <Select
                value={form.eventId}
                onValueChange={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      eventId:
                        value ?? '',
                    }),
                  )
                }
                disabled={
                  Boolean(editing) ||
                  saving
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="이벤트를 선택하세요">
                    {(
                      value: string,
                    ) =>
                      eventMap[value]
                        ?.title ??
                      '이벤트를 선택하세요'
                    }
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {events.map(
                    (event) => (
                      <SelectItem
                        key={
                          event.id
                        }
                        value={
                          event.id
                        }
                      >
                        {
                          event.title
                        }
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>
                상품
              </FieldLabel>

              <Select
                value={form.productId}
                onValueChange={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      productId:
                        value ?? '',
                    }),
                  )
                }
                disabled={
                  Boolean(editing) ||
                  saving
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="상품을 선택하세요">
                    {(
                      value: string,
                    ) =>
                      products.find(
                        (product) =>
                          product.id ===
                          value,
                      )?.name ??
                      '상품을 선택하세요'
                    }
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {products.map(
                    (product) => (
                      <SelectItem
                        key={
                          product.id
                        }
                        value={
                          product.id
                        }
                      >
                        {
                          product.name
                        }{' '}
                        (
                        {formatKRW(
                          product.price,
                        )}
                        )
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="eventPrice">
                이벤트 특가

                {selectedProduct && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    정상가{' '}
                    {formatKRW(
                      selectedProduct.price,
                    )}
                  </span>
                )}
              </FieldLabel>

              <Input
                id="eventPrice"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="예: 77000"
                value={
                  form.eventPrice
                }
                disabled={saving}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      eventPrice:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="totalStock">
                판매 수량 (재고)
              </FieldLabel>

              <Input
                id="totalStock"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="예: 200"
                value={
                  form.totalStock
                }
                disabled={saving}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      totalStock:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="purchaseLimit">
                1인당 구매 제한
              </FieldLabel>

              <Input
                id="purchaseLimit"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="제한 없음"
                value={
                  form.purchaseLimit
                }
                disabled={saving}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      purchaseLimit:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel>
                판매 상태
              </FieldLabel>

              <Select
                value={form.status}
                disabled={saving}
                onValueChange={(value) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      status:
                        value as EventProductStatus,
                    }),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue>
                    {(
                      value: EventProductStatus,
                    ) =>
                      statusLabels[
                        value
                      ]
                    }
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="READY">
                    판매 대기
                  </SelectItem>

                  <SelectItem value="ON_SALE">
                    판매중
                  </SelectItem>

                  <SelectItem value="HIDDEN">
                    판매 중지
                  </SelectItem>

                  <SelectItem value="SOLD_OUT">
                    품절
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
                ? '처리 중...'
                : editing
                  ? '저장'
                  : '편성하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}