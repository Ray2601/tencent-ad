'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Character } from '@/components/character'
import { FangchaoOutfitSprite } from '@/components/progress-bar-character'
import { useBackpack } from '@/hooks/use-backpack'
import { productCatalog, recommendedAdProductIds, fangchaoOutfits } from '@/lib/collection-data'
import type { CharacterEmotion, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

const IDLE_SECONDS = 30
const AD_REFRESH_SECONDS = 30
const EMOTION_DISPLAY_MS = 2500

type BubbleInfo = { text: string; show: boolean }

export default function CharacterSpacePage() {
  const { backpack, addItem, totalPoints, logAction } = useBackpack()

  const [emotion, setEmotion] = useState<CharacterEmotion>('expectant')
  const [bubble, setBubble] = useState<BubbleInfo>({ text: '准备收集', show: true })
  const [equippedProductId, setEquippedProductId] = useState<string | null>(null)
  const [recommendedAds, setRecommendedAds] = useState<Product[]>([])
  const [dragoverChar, setDragoverChar] = useState(false)
  const [collectedId, setCollectedId] = useState<string | null>(null)

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const emotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const adTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const equippedOutfit = equippedProductId
    ? fangchaoOutfits.find(o => o.productId === equippedProductId) ?? null
    : null

  const equippedProduct = equippedProductId
    ? productCatalog.find(p => p.id === equippedProductId) ?? null
    : null

  // ── Helpers ──────────────────────────────────────────────────────

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => {
      setEmotion('bored')
      setBubble({ text: '好无聊呀...', show: true })
    }, IDLE_SECONDS * 1000)
  }, [])

  const showTemporaryEmotion = useCallback(
    (emo: CharacterEmotion, text: string) => {
      setEmotion(emo)
      setBubble({ text, show: true })
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
      emotionTimerRef.current = setTimeout(() => {
        setEmotion('expectant')
        setBubble({ text: '准备收集', show: true })
      }, EMOTION_DISPLAY_MS)
    },
    [],
  )

  const recordActivity = useCallback(() => {
    resetIdleTimer()
    if (emotion === 'bored') {
      setEmotion('expectant')
      setBubble({ text: '准备收集', show: true })
    }
  }, [emotion, resetIdleTimer])

  // ── Pick 3 random recommended ads ─────────────────────────────────

  const pickAds = useCallback(() => {
    const pool = recommendedAdProductIds
      .map(id => productCatalog.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3)
  }, [])

  const refreshAds = useCallback(() => {
    setRecommendedAds(pickAds())
    showTemporaryEmotion('surprised', '这是什么？')
  }, [pickAds, showTemporaryEmotion])

  // ── Init ─────────────────────────────────────────────────────────

  useEffect(() => {
    setRecommendedAds(pickAds())
    resetIdleTimer()
  }, [pickAds, resetIdleTimer])

  // Ad refresh interval
  useEffect(() => {
    adTimerRef.current = setInterval(refreshAds, AD_REFRESH_SECONDS * 1000)
    return () => {
      if (adTimerRef.current) clearInterval(adTimerRef.current)
    }
  }, [refreshAds])

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (emotionTimerRef.current) clearTimeout(emotionTimerRef.current)
    }
  }, [])

  // ── Drag & drop handlers ─────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('application/product-id', product.id)
    e.dataTransfer.effectAllowed = 'move'
    recordActivity()
    logAction({ type: 'drag_start', productId: product.id })
  }

  const handleDragOverChar = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragoverChar(true)
  }

  const handleDragLeaveChar = () => {
    setDragoverChar(false)
  }

  const handleDropOnChar = (e: React.DragEvent) => {
    e.preventDefault()
    setDragoverChar(false)
    const productId = e.dataTransfer.getData('application/product-id')
    if (!productId) return

    const product = productCatalog.find(p => p.id === productId)
    if (!product) return

    setEquippedProductId(product.id)
    showTemporaryEmotion('happy', '好看吗？')
    recordActivity()
    logAction({ type: 'equip_outfit', productId: product.id })
  }

  // ── Collect handler ──────────────────────────────────────────────

  const handleCollect = (product: Product) => {
    const success = addItem(product)
    if (success) {
      setCollectedId(product.id)
      setTimeout(() => setCollectedId(null), 1200)
      showTemporaryEmotion('happy', '收到了！')
    } else {
      showTemporaryEmotion('surprised', '背包满啦')
    }
    recordActivity()
  }

  // ── Unequip handler ──────────────────────────────────────────────

  const handleUnequip = () => {
    setEquippedProductId(null)
    recordActivity()
  }

  // ── Only clothing items are draggable for outfit change ──────────

  const backpackItems = backpack.items

  return (
    <main
      className="min-h-screen bg-[#0d0e12] text-white"
      onClick={recordActivity}
      onKeyDown={recordActivity}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111317]">
        <div className="mx-auto flex h-16 w-full max-w-[960px] items-center justify-between px-6">
          <div className="text-xl font-black tracking-tight">小人空间</div>
          <div className="flex items-center gap-4 text-sm text-white/60">
            <span>积分：<span className="font-bold text-yellow-300">{totalPoints}</span></span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[960px] space-y-8 px-6 py-8">
        {/* ── Top: Character display ─────────────────────────────── */}
        <section className="flex flex-col items-center">
          {/* Drop target */}
          <div
            className={cn(
              'relative rounded-3xl border-2 border-dashed p-6 transition-all',
              dragoverChar
                ? 'border-emerald-400 bg-emerald-400/10 scale-105'
                : 'border-white/15 bg-white/[0.03]',
            )}
            onDragOver={handleDragOverChar}
            onDragLeave={handleDragLeaveChar}
            onDrop={handleDropOnChar}
          >
            {equippedOutfit && equippedOutfit.renderMode === 'full-sprite' ? (
              <div className="flex flex-col items-center gap-3">
                <FangchaoOutfitSprite
                  outfitId={equippedOutfit.productId}
                  className="h-40 w-40"
                />
                <span className="text-sm font-bold text-emerald-300">
                  已穿搭：{equippedOutfit.name}
                </span>
                <button
                  onClick={handleUnequip}
                  className="rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/70 hover:bg-white/20 transition"
                >
                  卸下穿搭
                </button>
              </div>
            ) : (
              <>
                <Character emotion={emotion} className="pointer-events-none" />
                {equippedProduct && (
                  <div className="mt-2 flex items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-1.5">
                    <span className="text-sm font-bold text-emerald-300">
                      已穿搭：{equippedProduct.name}
                    </span>
                    <button
                      onClick={handleUnequip}
                      className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-white/70 hover:bg-white/20 transition"
                    >
                      卸下
                    </button>
                  </div>
                )}
                {/* Custom bubble overlay */}
                <AnimatePresence mode="wait">
                  {bubble.show && (
                    <motion.div
                      key={bubble.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className={cn(
                        'absolute -top-3 left-1/2 -translate-x-1/2 -translate-y-full rounded-2xl px-5 py-3 text-lg font-bold shadow-xl whitespace-nowrap',
                        emotion === 'bored'
                          ? 'bg-slate-400 text-slate-900'
                          : emotion === 'happy'
                            ? 'bg-emerald-400 text-emerald-950'
                            : emotion === 'surprised'
                              ? 'bg-yellow-400 text-yellow-950'
                              : 'bg-white text-slate-900',
                      )}
                    >
                      {bubble.text}
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent"
                        style={{
                          borderTopColor:
                            emotion === 'bored' ? '#94a3b8' :
                            emotion === 'happy' ? '#4ade80' :
                            emotion === 'surprised' ? '#facc15' : '#fff',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          <p className="mt-3 text-sm text-white/40">
            {dragoverChar ? '松手即可换装！' : '把下方卡牌拖到小人身上即可换装'}
          </p>
        </section>

        {/* ── Middle: Backpack ────────────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-[#1a1c22] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">我的背包</h2>
            <span className="text-sm text-white/45">
              {backpackItems.length} / {backpack.maxCapacity}
            </span>
          </div>

          {backpackItems.length === 0 ? (
            <div className="grid h-32 place-items-center rounded-xl border border-dashed border-white/10 text-white/35">
              <div className="text-center">
                <p className="text-lg">背包空空如也</p>
                <p className="mt-1 text-sm">点击下方推荐广告的【收集】按钮获取商品</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {backpackItems.map(item => {
                const isClothing = item.product.category === 'clothing'
                const isEquipped = item.product.id === equippedProductId
                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    draggable
                    onDragStart={e => handleDragStart(e, item.product)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative flex cursor-grab flex-col items-center gap-2 rounded-xl border p-3 transition-all active:cursor-grabbing',
                      isEquipped
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : isClothing
                          ? 'border-white/15 bg-white/[0.04] hover:border-primary/60 hover:bg-white/[0.08]'
                          : 'border-white/5 bg-white/[0.02] opacity-50',
                    )}
                  >
                    {isClothing && (
                      <span className="absolute right-1.5 top-1.5 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        可穿搭
                      </span>
                    )}
                    {isEquipped && (
                      <span className="absolute right-1.5 top-1.5 rounded bg-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-950">
                        已穿搭
                      </span>
                    )}
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/10">
                      <span className="text-2xl">
                        {item.product.category === 'clothing' ? '👗' :
                         item.product.category === 'luxury' ? '💎' :
                         item.product.category === 'beverage' ? '🥤' :
                         item.product.category === 'food' ? '🍔' : '📦'}
                      </span>
                    </div>
                    <span className="truncate text-center text-xs font-medium text-white/80 w-full">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-white/35">x{item.quantity}</span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Bottom: Recommended Ads ─────────────────────────────── */}
        <section className="rounded-2xl border border-white/10 bg-[#1a1c22] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">推荐广告</h2>
            <span className="text-xs text-white/35">
              每 {AD_REFRESH_SECONDS}s 自动刷新
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {recommendedAds.map(product => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-3xl">
                  {product.category === 'beverage' ? '🥤' :
                   product.category === 'luxury' ? '💄' :
                   product.category === 'food' ? '🍔' :
                   product.category === 'clothing' ? '👟' :
                   product.category === 'electronics' ? '📱' : '🎁'}
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{product.name}</div>
                  <div className="mt-0.5 text-xs text-white/45">
                    {product.points} 积分
                  </div>
                </div>
                <button
                  onClick={() => handleCollect(product)}
                  disabled={collectedId === product.id}
                  className={cn(
                    'w-full rounded-full py-2 text-sm font-bold transition-all active:scale-95',
                    collectedId === product.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-primary hover:bg-primary/90 text-white',
                  )}
                >
                  {collectedId === product.id ? '✓ 已收集' : '收集'}
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
