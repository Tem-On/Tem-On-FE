'use client'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { formatKRW } from '@/lib/format'
import {
  deleteProduct,
  getProducts,
  saveProduct,
} from '@/services/admin.service'
import type {
  Product,
  ProductCategory,
  ProductStatus,
} from '@/types'

interface ProductForm {
  name: string
  description: string
  image: string
  price: number
  category: ProductCategory
  status: ProductStatus
}

const PAGE_SIZE = 10

const emptyForm: ProductForm = {
  name: '',
  description: '',
  image: '',
  price: 0,
  category: 'ETC',
  status: 'ACTIVE',
}

const categoryOptions: Array<{
  value: ProductCategory
  label: string
}> = [
  { value: 'FASHION', label: '패션' },
  { value: 'SHOES', label: '신발' },
  { value: 'BAG', label: '가방' },
  {
    value: 'ACCESSORY',
    label: '액세서리',
  },
  {
    value: 'ELECTRONIC',
    label: '전자기기',
  },
  {
    value: 'DIGITAL_DEVICE',
    label: '디지털기기',
  },
  {
    value: 'HOME_APPLIANCE',
    label: '생활가전',
  },
  { value: 'BEAUTY', label: '뷰티' },
  { value: 'FOOD', label: '식품' },
  {
    value: 'LIVING',
    label: '생활용품',
  },
  { value: 'SPORTS', label: '스포츠' },
  { value: 'TOY', label: '완구' },
  { value: 'BOOK', label: '도서' },
  {
    value: 'PET',
    label: '반려동물',
  },
  { value: 'BABY', label: '유아동' },
  {
    value: 'HEALTH',
    label: '헬스/건강',
  },
  {
    value: 'INTERIOR',
    label: '인테리어',
  },
  {
    value: 'LIFESTYLE',
    label: '라이프스타일',
  },
  { value: 'ETC', label: '기타' },
]

const statusOptions: Array<{
  value: ProductStatus
  label: string
}> = [
  { value: 'ACTIVE', label: '판매 중' },
  {
    value: 'SOLD_OUT',
    label: '품절',
  },
  { value: 'HIDDEN', label: '숨김' },
]

function getCategoryLabel(
  category: ProductCategory,
): string {
  return (
    categoryOptions.find(
      (option) => option.value === category,
    )?.label ?? category
  )
}

function getStatusLabel(
  status: ProductStatus,
): string {
  switch (status) {
    case 'ACTIVE':
      return '판매 중'
    case 'SOLD_OUT':
      return '품절'
    case 'HIDDEN':
      return '숨김'
    case 'DELETED':
      return '삭제됨'
  }
}

function createPageNumbers(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index,
    )
  }

  let start = Math.max(
    0,
    currentPage - 2,
  )

  let end = Math.min(
    totalPages - 1,
    start + 4,
  )

  if (end - start < 4) {
    start = Math.max(0, end - 4)
  }

  return Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  )
}

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([])

  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] =
    useState(0)
  const [totalElements, setTotalElements] =
    useState(0)

  const [listLoading, setListLoading] =
    useState(true)
  const [saving, setSaving] =
    useState(false)

  const [open, setOpen] =
    useState(false)
  const [editing, setEditing] =
    useState<Product | null>(null)

  const [form, setForm] =
    useState<ProductForm>(emptyForm)

  const [deletingId, setDeletingId] =
    useState<string | null>(null)

  const loadProducts = useCallback(
    async (targetPage: number) => {
      setListLoading(true)

      try {
        const response = await getProducts(
          targetPage,
          PAGE_SIZE,
        )

        setProducts(response.products)
        setPage(response.page)
        setTotalPages(response.totalPages)
        setTotalElements(
          response.totalElements,
        )
      } catch (error) {
        console.error(
          '상품 목록 조회 실패:',
          error,
        )

        toast.error(
          '상품 목록을 불러오지 못했습니다.',
        )

        setProducts([])
        setTotalPages(0)
        setTotalElements(0)
      } finally {
        setListLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    void loadProducts(page)
  }, [page, loadProducts])

  const pageNumbers = createPageNumbers(
    page,
    totalPages,
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (
    product: Product,
  ) => {
    setEditing(product)

    setForm({
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      category: product.category,
      status: product.status,
    })

    setOpen(true)
  }

  const handleDialogChange = (
    nextOpen: boolean,
  ) => {
    if (saving) {
      return
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      setEditing(null)
      setForm(emptyForm)
    }
  }

  const handleSave = async () => {
    const name = form.name.trim()
    const description =
      form.description.trim()
    const image = form.image.trim()

    if (!name) {
      toast.error(
        '상품명을 입력해주세요.',
      )
      return
    }

    if (form.price < 0) {
      toast.error(
        '가격은 0원 이상이어야 합니다.',
      )
      return
    }

    setSaving(true)

    try {
      await saveProduct({
        id: editing?.id,
        name,
        description,
        image,
        price: form.price,
        category: form.category,
        status: editing
          ? form.status
          : undefined,
      })

      toast.success(
        editing
          ? '상품이 수정되었습니다.'
          : '상품이 등록되었습니다.',
      )

      setOpen(false)
      setEditing(null)
      setForm(emptyForm)

      if (editing) {
        await loadProducts(page)
      } else {
        setPage(0)

        if (page === 0) {
          await loadProducts(0)
        }
      }
    } catch (error) {
      console.error(
        '상품 저장 실패:',
        error,
      )

      toast.error(
        editing
          ? '상품 수정에 실패했습니다.'
          : '상품 등록에 실패했습니다.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (
    id: string,
  ) => {
    setDeletingId(id)

    try {
      await deleteProduct(id)

      toast.success(
        '상품이 삭제되었습니다.',
      )

      const shouldMovePreviousPage =
        products.length === 1 &&
        page > 0

      if (shouldMovePreviousPage) {
        setPage((previous) =>
          Math.max(0, previous - 1),
        )
      } else {
        await loadProducts(page)
      }
    } catch (error) {
      console.error(
        '상품 삭제 실패:',
        error,
      )

      toast.error(
        '상품 삭제에 실패했습니다.',
      )
    } finally {
      setDeletingId(null)
    }
  }

  const handlePreviousPage = () => {
    if (page > 0 && !listLoading) {
      setPage((previous) =>
        previous - 1,
      )
    }
  }

  const handleNextPage = () => {
    if (
      page < totalPages - 1 &&
      !listLoading
    ) {
      setPage((previous) =>
        previous + 1,
      )
    }
  }

  return (
    <>
      <AdminHeader
        title="상품 관리"
        description={`판매 상품 마스터 데이터를 관리합니다. 총 ${totalElements.toLocaleString()}개`}
        actions={
          <Button
            size="sm"
            onClick={openCreate}
          >
            <Plus data-icon="inline-start" />
            상품 등록
          </Button>
        }
      />

      <div className="space-y-4 p-4 md:p-6">
        <Card className="overflow-hidden py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품</TableHead>
                <TableHead>
                  카테고리
                </TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">
                  기본가
                </TableHead>
                <TableHead className="w-24 text-right">
                  관리
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {listLoading &&
                Array.from({
                  length: PAGE_SIZE,
                }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!listLoading &&
                products.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      등록된 상품이 없습니다.
                    </TableCell>
                  </TableRow>
                )}

              {!listLoading &&
                products.map((product) => (
                  <TableRow
                    key={product.id}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-muted">
                          <Image
                            src={
                              product.image ||
                              '/placeholder.svg'
                            }
                            alt={product.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {product.name}
                          </div>

                          <div className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                            {product.description ||
                              '상품 설명 없음'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryLabel(
                          product.category,
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          product.status ===
                          'ACTIVE'
                            ? 'default'
                            : product.status ===
                                'SOLD_OUT'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {getStatusLabel(
                          product.status,
                        )}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right font-medium tabular-nums">
                      {formatKRW(
                        product.price,
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="수정"
                          onClick={() =>
                            openEdit(product)
                          }
                        >
                          <Pencil />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="삭제"
                                className="text-destructive"
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                              >
                                <Trash2 />
                              </Button>
                            }
                          />

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                상품을
                                삭제할까요?
                              </AlertDialogTitle>

                              <AlertDialogDescription>
                                {
                                  product.name
                                }{' '}
                                상품은 DELETED
                                상태로
                                변경됩니다.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel>
                                취소
                              </AlertDialogCancel>

                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(
                                    product.id,
                                  )
                                }
                                disabled={
                                  deletingId ===
                                  product.id
                                }
                              >
                                {deletingId ===
                                product.id
                                  ? '삭제 중...'
                                  : '삭제'}
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

        {!listLoading &&
          totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <div className="text-sm text-muted-foreground">
                전체{' '}
                {totalElements.toLocaleString()}
                개 중{' '}
                {(
                  page * PAGE_SIZE +
                  1
                ).toLocaleString()}
                -
                {Math.min(
                  (page + 1) *
                    PAGE_SIZE,
                  totalElements,
                ).toLocaleString()}
                개 표시
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    handlePreviousPage
                  }
                  disabled={
                    page === 0 ||
                    listLoading
                  }
                >
                  <ChevronLeft />
                  이전
                </Button>

                {pageNumbers.map(
                  (pageNumber) => (
                    <Button
                      key={pageNumber}
                      type="button"
                      size="sm"
                      variant={
                        pageNumber === page
                          ? 'default'
                          : 'outline'
                      }
                      onClick={() =>
                        setPage(
                          pageNumber,
                        )
                      }
                      disabled={
                        listLoading
                      }
                      className="min-w-9"
                    >
                      {pageNumber + 1}
                    </Button>
                  ),
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={
                    handleNextPage
                  }
                  disabled={
                    page >=
                      totalPages - 1 ||
                    listLoading
                  }
                >
                  다음
                  <ChevronRight />
                </Button>
              </div>
            </div>
          )}
      </div>

      <Dialog
        open={open}
        onOpenChange={
          handleDialogChange
        }
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? '상품 수정'
                : '상품 등록'}
            </DialogTitle>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="product-name">
                상품명
              </FieldLabel>

              <Input
                id="product-name"
                value={form.name}
                disabled={saving}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      name: event.target
                        .value,
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-description">
                설명
              </FieldLabel>

              <Textarea
                id="product-description"
                value={
                  form.description
                }
                disabled={saving}
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      description:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="product-image">
                이미지 URL
              </FieldLabel>

              <Input
                id="product-image"
                value={form.image}
                disabled={saving}
                placeholder="https://example.com/image.jpg"
                onChange={(event) =>
                  setForm(
                    (previous) => ({
                      ...previous,
                      image:
                        event.target
                          .value,
                    }),
                  )
                }
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="product-price">
                  기본가 (원)
                </FieldLabel>

                <Input
                  id="product-price"
                  type="number"
                  min={0}
                  value={form.price}
                  disabled={saving}
                  onChange={(event) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        price: Number(
                          event.target
                            .value,
                        ),
                      }),
                    )
                  }
                />
              </Field>

              <Field>
                <FieldLabel>
                  카테고리
                </FieldLabel>

                <Select
                  value={
                    form.category
                  }
                  disabled={saving}
                  onValueChange={(
                    value,
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        category:
                          value as ProductCategory,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {categoryOptions.map(
                      (option) => (
                        <SelectItem
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {editing && (
              <Field>
                <FieldLabel>
                  상품 상태
                </FieldLabel>

                <Select
                  value={form.status}
                  disabled={saving}
                  onValueChange={(
                    value,
                  ) =>
                    setForm(
                      (previous) => ({
                        ...previous,
                        status:
                          value as ProductStatus,
                      }),
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {statusOptions.map(
                      (option) => (
                        <SelectItem
                          key={
                            option.value
                          }
                          value={
                            option.value
                          }
                        >
                          {option.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                >
                  취소
                </Button>
              }
            />

            <Button
              type="button"
              onClick={handleSave}
              disabled={saving}
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