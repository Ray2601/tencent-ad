'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Backpack as BackpackIcon, ExternalLink, Lock, ShoppingBag, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { brandLabels, productCatalog } from '@/lib/collection-data'
import type { Backpack as BackpackType, Brand, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

const rarityLabels: Record<Product['rarity'], string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

interface BackpackProps {
  backpack: BackpackType
  totalPoints: number
  catalog?: Product[]
  onRemoveItem: (productId: string) => void
  onClear: () => void
  className?: string
}

export function BackpackPanel({
  backpack,
  totalPoints,
  catalog = productCatalog,
  onRemoveItem,
  onClear,
  className,
}: BackpackProps) {
  const [open, setOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<'all' | Brand>('all')
  const itemCount = backpack.items.reduce((sum, item) => sum + item.quantity, 0)

  const ownedById = useMemo(() => {
    return new Map(backpack.items.map(item => [item.product.id, item]))
  }, [backpack.items])

  const unlockedBrands = useMemo(() => {
    return new Set(backpack.items.map(item => item.product.brand))
  }, [backpack.items])

  const brands = useMemo(() => {
    return Array.from(new Set(catalog.map(product => product.brand))).filter(brand => unlockedBrands.has(brand))
  }, [catalog, unlockedBrands])

  useEffect(() => {
    if (selectedBrand !== 'all' && !unlockedBrands.has(selectedBrand)) setSelectedBrand('all')
  }, [selectedBrand, unlockedBrands])

  const visibleProducts = catalog.filter(product => {
    if (!unlockedBrands.has(product.brand)) return false
    return selectedBrand === 'all' || product.brand === selectedBrand
  })

  return (
    <div className={className}>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="relative gap-2 rounded-full border-primary/50 bg-slate-950/80 text-white shadow-xl backdrop-blur hover:bg-slate-900"
      >
        <BackpackIcon className="h-4 w-4 text-primary" />
        背包
        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">{itemCount}</span>
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/30"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed right-0 top-0 z-[90] flex h-screen w-full max-w-[390px] flex-col border-l bg-slate-950 text-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
                <div>
                  <div className="flex items-center gap-2 text-base font-bold">
                    <BackpackIcon className="h-5 w-5 text-primary" />
                    我的背包
                  </div>
                  <div className="mt-1 text-xs text-white/55">
                    {itemCount} / {backpack.maxCapacity} 件藏品
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-orange-300">+ {totalPoints} 积分</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOpen(false)}
                    className="mt-1 h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3">
                <FilterButton active={selectedBrand === 'all'} onClick={() => setSelectedBrand('all')}>
                  全部
                </FilterButton>
                {brands.map(brand => (
                  <FilterButton
                    key={brand}
                    active={selectedBrand === brand}
                    onClick={() => setSelectedBrand(brand)}
                  >
                    {brandLabels[brand]} {backpack.items
                      .filter(item => item.product.brand === brand)
                      .reduce((sum, item) => sum + item.quantity, 0)}
                  </FilterButton>
                ))}
              </div>

              <div className="flex-1 space-y-3 overflow-auto p-3">
                {visibleProducts.length === 0 && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60">
                    收集任意品牌藏品后，会开启对应品牌货架。
                  </div>
                )}
                {visibleProducts.map(product => {
                  const owned = ownedById.get(product.id)
                  return (
                    <BackpackProductCard
                      key={product.id}
                      product={product}
                      owned={owned}
                      exchangeQuantity={
                        product.exchangeRequirement
                          ? ownedById.get(product.exchangeRequirement.productId)?.quantity ?? 0
                          : 0
                      }
                      onRemoveItem={onRemoveItem}
                    />
                  )
                })}
              </div>

              <div className="flex items-center justify-between border-t border-white/10 p-3">
                <div className="text-xs text-white/60">共 {itemCount} 件藏品</div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onClear}
                  disabled={itemCount === 0}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  清空背包
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function BackpackProductCard({
  product,
  owned,
  exchangeQuantity,
  onRemoveItem,
}: {
  product: Product
  owned?: BackpackType['items'][number]
  exchangeQuantity: number
  onRemoveItem: (productId: string) => void
}) {
  const [showExchangeHint, setShowExchangeHint] = useState(false)
  const hoverTimerRef = useRef<number | null>(null)
  const isOwned = Boolean(owned)
  const exchangeRequirement = product.exchangeRequirement

  useEffect(() => {
    if (isOwned || !exchangeRequirement) setShowExchangeHint(false)
  }, [exchangeRequirement, isOwned])

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    }
  }, [])

  return (
    <div
      onMouseEnter={() => {
        if (!isOwned && exchangeRequirement) {
          if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
          hoverTimerRef.current = window.setTimeout(() => setShowExchangeHint(true), 2000)
        }
      }}
      onMouseLeave={() => {
        if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
        hoverTimerRef.current = null
        setShowExchangeHint(false)
      }}
      className={cn(
        'group/product relative flex gap-3 rounded-lg border p-3 pr-24 transition',
        isOwned
          ? 'border-primary/80 bg-primary/10 shadow-[0_0_0_1px_rgba(167,139,250,0.3)]'
          : 'border-white/10 bg-white/[0.04] opacity-75'
      )}
    >
      <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md bg-white/10">
        <img
          src={product.image}
          alt=""
          className={cn('h-full w-full object-cover', !isOwned && 'grayscale opacity-35')}
        />
        {!isOwned && (
          <div className="absolute inset-0 grid place-items-center bg-black/20">
            <Lock className="h-5 w-5 text-white/70" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-bold">{product.name}</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-primary">
            {rarityLabels[product.rarity]}
          </span>
        </div>
        <div className="mt-1 text-xs text-white/50">
          {brandLabels[product.brand]} - {isOwned ? `x${owned?.quantity}` : '未拥有'}
        </div>
        <div className="mt-2 text-xs">
          <span className="text-orange-300">+{product.points} 积分</span>
        </div>
      </div>

      {product.purchaseUrl && (
        <a
          href={product.purchaseUrl}
          target="_blank"
          rel="noreferrer"
          onClick={event => event.stopPropagation()}
          className={cn(
            'absolute top-1/2 inline-flex -translate-y-1/2 items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80',
            isOwned ? 'right-11' : 'right-3'
          )}
        >
          购买
          <ExternalLink className="h-3 w-3" />
        </a>
      )}

      {isOwned && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemoveItem(product.id)}
          className="absolute right-2 top-2 h-8 w-8 opacity-80 hover:bg-red-500/20 hover:text-red-200 md:opacity-0 md:group-hover/product:opacity-100"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <AnimatePresence>
        {showExchangeHint && exchangeRequirement && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute right-3 top-12 z-20 w-44 rounded-md border border-primary/40 bg-slate-900/95 p-2 text-[11px] leading-relaxed text-white shadow-xl"
          >
            <div className="font-bold text-primary">兑换要求</div>
            <div className="mt-1">{exchangeRequirement.label}</div>
            <div className="mt-1 text-white/55">
              当前进度 {exchangeQuantity}/{exchangeRequirement.quantity}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
      )}
    >
      {children}
    </button>
  )
}

export function BackpackMini({
  backpack,
  totalPoints,
  className,
}: {
  backpack: BackpackType
  totalPoints: number
  onClick?: () => void
  className?: string
}) {
  const itemCount = backpack.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-lg border bg-card/90 p-3 shadow-lg backdrop-blur-sm', className)}
    >
      <div className="flex items-center gap-2 text-sm">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <span>{itemCount} 件藏品</span>
        <span className="text-muted-foreground">-</span>
        <span className="text-accent">{totalPoints} 积分</span>
      </div>
    </motion.div>
  )
}
