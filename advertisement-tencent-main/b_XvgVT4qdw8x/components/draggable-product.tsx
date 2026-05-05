'use client'

import { useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import type { Product } from '@/lib/types'
import { ProductIcon, BrandLogo } from './product-icons'
import { getRarityColor, brandNames } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface DraggableProductProps {
  product: Product
  onDragStart?: () => void
  onDragEnd?: (info: PanInfo, element: HTMLElement) => void
  onDrop?: (product: Product) => void
  disabled?: boolean
  className?: string
}

export function DraggableProduct({
  product,
  onDragStart,
  onDragEnd,
  disabled = false,
  className,
}: DraggableProductProps) {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useTransform(
    [x, y],
    ([latestX, latestY]: number[]) => {
      const distance = Math.sqrt(latestX * latestX + latestY * latestY)
      return Math.min(1.2, 1 + distance / 500)
    }
  )
  const rotate = useTransform(x, [-200, 200], [-15, 15])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    onDragStart?.()
  }, [onDragStart])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false)
      
      // 获取当前拖拽元素的位置
      const element = document.elementFromPoint(
        info.point.x,
        info.point.y
      ) as HTMLElement | null

      if (element) {
        onDragEnd?.(info, element)
      }

      // 重置位置
      x.set(0)
      y.set(0)
    },
    [onDragEnd, x, y]
  )

  const rarityColor = getRarityColor(product.rarity)

  return (
    <div ref={constraintsRef} className={cn('relative', className)}>
      <motion.div
        drag={!disabled}
        dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
        dragElastic={0.1}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, y, scale, rotate }}
        whileTap={{ cursor: 'grabbing' }}
        className={cn(
          'relative cursor-grab rounded-xl border bg-card p-3 shadow-lg transition-shadow',
          isDragging && 'z-50 shadow-2xl',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* 稀有度指示条 */}
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
          style={{ backgroundColor: rarityColor }}
        />

        {/* 商品图片 */}
        <div className="relative mb-2 flex justify-center">
          <ProductIcon productId={product.id} size={72} />
          {isDragging && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
            >
              +{product.points}
            </motion.div>
          )}
        </div>

        {/* 商品信息 */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <BrandLogo brand={product.brand} size={16} />
            <span>{brandNames[product.brand]}</span>
          </div>
          <h4 className="mt-1 line-clamp-1 text-sm font-medium text-foreground">
            {product.name}
          </h4>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: rarityColor + '20',
                color: rarityColor,
              }}
            >
              {getRarityLabel(product.rarity)}
            </span>
            <span className="text-xs text-accent">+{product.points}分</span>
          </div>
        </div>

        {/* 拖拽提示 */}
        {!disabled && !isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 opacity-0 transition-opacity hover:opacity-100">
            <span className="text-sm text-white">拖拽到小人</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// 商品展示区域
interface ProductShowcaseProps {
  products: Product[]
  onProductDragStart?: (product: Product) => void
  onProductDragEnd?: (product: Product, info: PanInfo, element: HTMLElement) => void
  disabled?: boolean
  className?: string
}

export function ProductShowcase({
  products,
  onProductDragStart,
  onProductDragEnd,
  disabled = false,
  className,
}: ProductShowcaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        'grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4',
        className
      )}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <DraggableProduct
            product={product}
            onDragStart={() => onProductDragStart?.(product)}
            onDragEnd={(info, element) => onProductDragEnd?.(product, info, element)}
            disabled={disabled}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

function getRarityLabel(rarity: Product['rarity']): string {
  const labels = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return labels[rarity]
}
