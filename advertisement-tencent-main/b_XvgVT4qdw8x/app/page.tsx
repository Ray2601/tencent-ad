'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Ellipsis, ListPlus, Search } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { Character } from '@/components/character'
import { BackpackPanel } from '@/components/backpack'
import { useBackpack } from '@/hooks/use-backpack'
import { brandLabels, productCatalog, skipAdCost } from '@/lib/collection-data'
import type { CharacterEmotion, Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import maskPositions from '../mask_positions.json'

const TARGET_HITS = 5
const collectibleProducts = productCatalog.filter(product => !product.exchangeRequirement)

const maskRewardProduct: Product = {
  id: 'chanel-perfume-bottle',
  name: '香奈儿香水',
  image: '/products/perfume.png',
  brand: 'chanel',
  category: 'luxury',
  description: '命中 5 次后从高光广告中收集',
  rarity: 'legendary',
  points: 160,
  purchaseUrl: 'https://www.chanel.com/us/fragrance/',
}

const episodeList = [
  { no: 1, badge: '' },
  { no: 2, badge: '' },
  { no: 3, badge: '限免' },
  { no: 4, badge: '限免' },
  { no: 5, badge: '限免' },
  { no: 6, badge: '预告' },
  { no: 7, badge: '预告' },
  { no: 8, badge: '预告' },
  { no: 9, badge: '预告' },
  { no: 10, badge: '预告' },
  { no: 11, badge: 'VIP' },
  { no: 12, badge: 'VIP' },
] as const

export default function InteractiveAdPage() {
  const {
    backpack,
    addItem,
    removeItem,
    clearBackpack,
    totalPoints,
    spendPoints,
    exchangeItem,
    logAction,
  } = useBackpack()

  const characterRef = useRef<HTMLDivElement>(null)
  const previousPhaseRef = useRef<'main' | 'mask' | 'collected'>('main')

  const [characterEmotion, setCharacterEmotion] = useState<CharacterEmotion>('expectant')
  const [receivedProduct, setReceivedProduct] = useState<Product | null>(null)
  const [hitCount, setHitCount] = useState(0)
  const [isCollected, setIsCollected] = useState(false)
  const [showCharacterPanel, setShowCharacterPanel] = useState(false)
  const [videoPhase, setVideoPhase] = useState<'main' | 'mask' | 'collected'>('main')
  const [rightPanelMode, setRightPanelMode] = useState<'series' | 'collect'>('series')

  const isCollectMode = videoPhase === 'mask' && !isCollected
  const currentDurability = Math.max(0, TARGET_HITS - hitCount)

  const relatedExchangeProducts = useMemo(() => {
    return productCatalog.filter(product => product.brand === maskRewardProduct.brand && product.exchangeRequirement)
  }, [])

  useEffect(() => {
    if (videoPhase === 'main') {
      setRightPanelMode('series')
      previousPhaseRef.current = videoPhase
      return
    }

    if (previousPhaseRef.current === 'main') {
      setRightPanelMode('collect')
    }
    previousPhaseRef.current = videoPhase
  }, [videoPhase])

  useEffect(() => {
    if (isCollectMode) {
      setCharacterEmotion('attacking')
      return
    }
    if (videoPhase === 'collected') {
      setCharacterEmotion('happy')
      return
    }
    setCharacterEmotion('expectant')
  }, [isCollectMode, videoPhase])

  const handleMaskHit = useCallback((nextHitCount: number) => {
    setHitCount(nextHitCount)
    setCharacterEmotion('attacking')
    logAction({
      type: 'mask_hit',
      productId: maskRewardProduct.id,
      details: { hitCount: nextHitCount },
    })
  }, [logAction])

  const handleMaskCompleted = useCallback((product: Product) => {
    const success = addItem(product)
    if (!success) {
      setCharacterEmotion('surprised')
      logAction({
        type: 'drop_reject',
        productId: product.id,
        details: { reason: 'backpack_full' },
      })
      return
    }

    setIsCollected(true)
    setHitCount(TARGET_HITS)
    setCharacterEmotion('happy')
    setReceivedProduct(product)
    logAction({ type: 'mask_collect', productId: product.id })

    window.setTimeout(() => {
      setReceivedProduct(null)
    }, 2400)
  }, [addItem, logAction])

  const handleCollectibleCollected = useCallback((product: Product) => {
    const success = addItem(product)
    if (!success) {
      setCharacterEmotion('surprised')
      logAction({
        type: 'drop_reject',
        productId: product.id,
        details: { reason: 'backpack_full' },
      })
      return
    }

    setCharacterEmotion(product.brand === 'chanel' || product.brand === 'dior' || product.brand === 'nike' ? 'happy' : 'expectant')
    setReceivedProduct(product)
    logAction({ type: 'hotspot_collect', productId: product.id })
    window.setTimeout(() => setReceivedProduct(null), 1800)
  }, [addItem, logAction])

  const handleRedeemSkip = useCallback(() => {
    const success = spendPoints(skipAdCost)
    if (success) {
      setCharacterEmotion('happy')
      logAction({ type: 'redeem_skip', details: { cost: skipAdCost } })
    } else {
      setCharacterEmotion('surprised')
    }
    return success
  }, [logAction, spendPoints])

  const handleExchange = useCallback((product: Product) => {
    const success = exchangeItem(product)
    if (!success) {
      setCharacterEmotion('surprised')
      return
    }
    setCharacterEmotion('happy')
    setReceivedProduct(product)
    logAction({ type: 'exchange_redeem', productId: product.id })
    window.setTimeout(() => setReceivedProduct(null), 1600)
  }, [exchangeItem, logAction])

  const openCharacterPanel = useCallback(() => {
    setShowCharacterPanel(true)
    logAction({ type: 'open_character' })
  }, [logAction])

  const rightPanel = rightPanelMode === 'collect' ? (
    <CollectStagePanel
      characterRef={characterRef}
      characterEmotion={characterEmotion}
      receivedProduct={receivedProduct}
      durability={currentDurability}
      target={TARGET_HITS}
      itemMap={new Map(backpack.items.map(item => [item.product.id, item.quantity]))}
      exchangeProducts={videoPhase === 'collected' ? relatedExchangeProducts : []}
      onExchange={handleExchange}
      onBackToSeries={() => setRightPanelMode('series')}
      backpack={backpack}
      totalPoints={totalPoints}
      onRemoveItem={removeItem}
      onClearBackpack={clearBackpack}
      catalog={productCatalog}
    />
  ) : (
    <SeriesInfoPanel
      backpack={backpack}
      totalPoints={totalPoints}
      onRemoveItem={removeItem}
      onClearBackpack={clearBackpack}
      catalog={productCatalog}
    />
  )

  return (
    <main className="min-h-screen bg-[#0d0e12] text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111317]">
        <div className="mx-auto flex h-20 w-full max-w-[1880px] items-center gap-6 px-6 lg:px-10">
          <div className="text-[38px] font-black tracking-tight text-white">腾讯视频</div>
          <nav className="hidden items-center gap-8 text-[30px] font-semibold text-white/80 xl:flex">
            <span>电视剧</span>
            <span>电影</span>
            <span>综艺</span>
            <span>动漫</span>
            <span>少儿</span>
            <span>短剧</span>
            <span>纪录片</span>
            <span>全部</span>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
              <span>奔跑吧 第10季</span>
              <Search className="ml-3 h-4 w-4" />
            </div>
            <button type="button" className="rounded-full bg-white/15 px-4 py-2 text-sm text-white/90">
              下载客户端
            </button>
            <button type="button" className="rounded-full bg-white/25 px-4 py-2 text-sm font-semibold text-white">
              登录
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1880px] grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,2fr)_520px] lg:p-6">
        <section className="relative min-h-[58vh] overflow-hidden rounded-2xl bg-black lg:min-h-[calc(100vh-140px)]">
          <VideoPlayer
            src="/video.mp4"
            maskSrc="/mask.mp4"
            maskData={maskPositions}
            maskRewardProduct={maskRewardProduct}
            adTriggerPoints={[]}
            onAdTriggered={() => undefined}
            onAdEnded={() => undefined}
            onMaskHit={handleMaskHit}
            onMaskCompleted={handleMaskCompleted}
            collectibleCatalog={collectibleProducts}
            onCollectibleCollected={handleCollectibleCollected}
            dropTargetRef={characterRef}
            onCharacterClick={openCharacterPanel}
            pointsBalance={totalPoints}
            skipCost={skipAdCost}
            onRedeemSkip={handleRedeemSkip}
            isAdActive={false}
            onPhaseChange={setVideoPhase}
            className="h-[58vh] w-full rounded-none lg:h-[calc(100vh-140px)]"
          />
        </section>
        <aside className="min-h-[42vh] rounded-2xl border border-white/10 bg-[#1a1c22] p-4 lg:min-h-[calc(100vh-140px)] lg:p-6">
          {rightPanel}
        </aside>
      </div>

      <CharacterSpace
        open={showCharacterPanel}
        onClose={() => setShowCharacterPanel(false)}
        products={collectibleProducts.slice(0, 4)}
        onGift={handleCollectibleCollected}
        balance={totalPoints}
      />
    </main>
  )
}

function SeriesInfoPanel({
  backpack,
  totalPoints,
  onRemoveItem,
  onClearBackpack,
  catalog,
}: {
  backpack: {
    items: Array<{ product: Product; quantity: number; acquiredAt: number }>
    maxCapacity: number
  }
  totalPoints: number
  onRemoveItem: (productId: string) => void
  onClearBackpack: () => void
  catalog: Product[]
}) {
  return (
    <div className="relative flex h-full flex-col pb-16">
      <div className="border-b border-white/10 pb-4">
        <div className="text-3xl font-black">爱情没有神话</div>
        <div className="mt-3 text-lg text-white/75">内地 2026 都市生活 情感纠葛 女性成长</div>
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="rounded-full bg-white/12 px-3 py-1">9.2分</span>
          <span className="rounded-full bg-white/12 px-3 py-1">🔥22052</span>
        </div>
        <p className="mt-4 text-base leading-7 text-white/75">
          追剧日历 · 更新至18集/全37集 · 4月28日起，腾讯视频全网首播，会员每日19:30更新，SVIP抢先看一集
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 border-b border-white/10 py-4">
        <DisabledActionButton icon={<ListPlus className="h-5 w-5" />} />
        <DisabledActionButton icon={<Download className="h-5 w-5" />} />
        <DisabledActionButton icon={<Ellipsis className="h-5 w-5" />} />
      </div>

      <div className="mt-4 text-2xl font-black">播放列表</div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {episodeList.map(item => (
          <div
            key={`${item.no}-${item.badge}`}
            className={cn(
              'relative grid h-16 place-items-center rounded-lg bg-white/10 text-xl font-black text-white/90',
              item.no === 1 && 'bg-[#24534f] text-[#37e0d0]'
            )}
          >
            {item.badge && (
              <span className="absolute right-1 top-1 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
            {item.no}
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 right-0">
        <BackpackPanel
          backpack={backpack}
          totalPoints={totalPoints}
          onRemoveItem={onRemoveItem}
          onClear={onClearBackpack}
          catalog={catalog}
        />
      </div>
    </div>
  )
}

function DisabledActionButton({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="grid h-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/40"
      aria-disabled="true"
      title="当前阶段不可用"
    >
      {icon}
    </button>
  )
}

function CollectStagePanel({
  characterRef,
  characterEmotion,
  receivedProduct,
  durability,
  target,
  itemMap,
  exchangeProducts,
  onExchange,
  onBackToSeries,
  backpack,
  totalPoints,
  onRemoveItem,
  onClearBackpack,
  catalog,
}: {
  characterRef: RefObject<HTMLDivElement | null>
  characterEmotion: CharacterEmotion
  receivedProduct: Product | null
  durability: number
  target: number
  itemMap: Map<string, number>
  exchangeProducts: Product[]
  onExchange: (product: Product) => void
  onBackToSeries: () => void
  backpack: {
    items: Array<{ product: Product; quantity: number; acquiredAt: number }>
    maxCapacity: number
  }
  totalPoints: number
  onRemoveItem: (productId: string) => void
  onClearBackpack: () => void
  catalog: Product[]
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <BackpackPanel
          backpack={backpack}
          totalPoints={totalPoints}
          onRemoveItem={onRemoveItem}
          onClear={onClearBackpack}
          catalog={catalog}
        />
        <button
          type="button"
          onClick={onBackToSeries}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-bold text-red-300 hover:bg-white/5"
        >
          <ChevronLeft className="h-5 w-5" />
          返回
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <button
          type="button"
          className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Character ref={characterRef} emotion={characterEmotion} receivedProduct={receivedProduct} />
        </button>
        <div className="mt-3 text-2xl font-bold">准备收集</div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 p-4"
        >
          <div className="mb-3 flex items-center justify-between text-lg">
            <span className="font-semibold">藏品耐久</span>
            <span className="text-white/70">{durability}/{target}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-yellow-300"
              animate={{ width: `${Math.max(0, (durability / target) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/65">高光广告阶段，点击标注高亮区域即可造成伤害。</p>
        </motion.div>

        <div className="mt-4 w-full flex-1 rounded-xl border border-white/10 bg-black/20 p-3">
          {exchangeProducts.length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-white/45">
              广告结束后将自动展示关联兑换商品
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {exchangeProducts.map(product => {
                const requirement = product.exchangeRequirement
                if (!requirement) return null
                const current = itemMap.get(requirement.productId) ?? 0
                const canRedeem = current >= requirement.quantity
                return (
                  <ExchangeCard
                    key={product.id}
                    product={product}
                    current={current}
                    required={requirement.quantity}
                    canRedeem={canRedeem}
                    onRedeem={() => onExchange(product)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ExchangeCard({
  product,
  current,
  required,
  canRedeem,
  onRedeem,
}: {
  product: Product
  current: number
  required: number
  canRedeem: boolean
  onRedeem: () => void
}) {
  const [showHint, setShowHint] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const startHover = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setShowHint(true), 2000)
  }

  const endHover = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = null
    setShowHint(false)
  }

  return (
    <div className="relative flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <img src={product.image} alt="" className="h-12 w-12 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{product.name}</div>
        <div className="mt-1 text-xs text-white/60">{brandLabels[product.brand]}</div>
      </div>
      <div
        className="relative flex items-center gap-2"
        onMouseEnter={startHover}
        onMouseLeave={endHover}
      >
        <ChevronRight className="h-4 w-4 text-white/60" />
        <button
          type="button"
          disabled={!canRedeem}
          onClick={onRedeem}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-bold',
            canRedeem ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-white/10 text-white/45'
          )}
        >
          兑换
        </button>
        {showHint && product.exchangeRequirement && (
          <div className="absolute right-0 top-9 z-20 w-44 rounded-md border border-primary/40 bg-slate-900/95 p-2 text-[11px] leading-relaxed text-white shadow-xl">
            <div className="font-bold text-primary">兑换要求</div>
            <div className="mt-1">{product.exchangeRequirement.label}</div>
            <div className="mt-1 text-white/60">当前进度 {current}/{required}</div>
          </div>
        )}
      </div>
    </div>
  )
}

function CharacterSpace({
  open,
  onClose,
  products,
  onGift,
  balance,
}: {
  open: boolean
  onClose: () => void
  products: Product[]
  onGift: (product: Product) => void
  balance: number
}) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/45"
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: 420 }}
        animate={{ x: 0 }}
        exit={{ x: 420 }}
        className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-slate-950 p-5 text-white shadow-2xl"
        onClick={event => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-lg font-black">小人空间</div>
            <div className="mt-1 text-xs text-white/55">把广告礼物送给小人，解锁表情和品牌。</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">
            关闭
          </button>
        </div>

        <div className="grid place-items-center rounded-xl border border-white/10 bg-white/[0.04] p-5">
          <Character emotion="happy" />
          <div className="mt-2 rounded-full bg-white/10 px-4 py-2 text-sm">今天喜欢 Chanel 和 Nike。</div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-bold">广告卡片</span>
          <span className="text-orange-300">{balance} 积分</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {products.map(product => (
            <motion.button
              key={product.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onGift(product)}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left shadow-lg transition hover:border-primary/70"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-white/10">
                <img src={product.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="mt-2 truncate text-sm font-bold">{product.name}</div>
              <div className="mt-1 text-xs text-white/45">{brandLabels[product.brand]}</div>
              <div className="mt-2 text-xs font-bold text-orange-300">+{product.points} 积分</div>
            </motion.button>
          ))}
        </div>
      </motion.aside>
    </motion.div>
  )
}
