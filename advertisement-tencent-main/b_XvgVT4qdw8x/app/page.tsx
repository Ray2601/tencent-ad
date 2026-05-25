'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, Ellipsis, ListPlus, Search } from 'lucide-react'
import { VideoPlayer } from '@/components/video-player'
import { Character } from '@/components/character'
import { FangchaoOutfitSprite } from '@/components/progress-bar-character'
import { BackpackPanel } from '@/components/backpack'
import { useBackpack } from '@/hooks/use-backpack'
import { brandLabels, fangchaoOutfits, fangchaoWearCost, productCatalog, skipAdCost } from '@/lib/collection-data'
import type { CharacterEmotion, Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import maskPositions from '../mask_positions.json'

// Stage 1 products: VCA jewelry tags
const stage1Products: Product[] = [
  {
    id: 'vca-necklace',
    name: '项链',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 广告中收集的项链',
    rarity: 'legendary',
    points: 240,
  },
  {
    id: 'vca-ring',
    name: '戒指',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 广告中收集的戒指',
    rarity: 'epic',
    points: 190,
  },
  {
    id: 'vca-earrings',
    name: '耳环',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 广告中收集的耳环',
    rarity: 'epic',
    points: 180,
  },
  // Decoy tags
  {
    id: 'decoy-vca-bag',
    name: '链条包',
    image: '/products/perfume.png',
    brand: 'vancleefarpels',
    category: 'luxury',
    description: '干扰标签',
    rarity: 'rare',
    points: 0,
  } as Product & { collectible?: boolean },
  {
    id: 'decoy-vca-watch',
    name: '腕表',
    image: '/products/perfume.png',
    brand: 'vancleefarpels',
    category: 'luxury',
    description: '干扰标签',
    rarity: 'rare',
    points: 0,
  } as Product & { collectible?: boolean },
]

// Mark decoys as non-collectible
const stage1Tags = stage1Products.map(p => ({
  ...p,
  collectible: !p.id.startsWith('decoy-'),
}))

// Stage 2 reward: Chanel perfume
const stage2Reward: Product = {
  id: 'chanel-perfume-bottle',
  name: '香奈儿香水',
  image: '/products/perfume.png',
  brand: 'chanel',
  category: 'luxury',
  description: '射击命中 5 次后从香水广告中获得',
  rarity: 'rare',
  points: 160,
  purchaseUrl: 'https://www.chanel.com/us/fragrance/',
}

const STAGE2_HP = 5
const STAGE1_SKIP_COST = 100
const STAGE2_SKIP_COST = 150
const STAGE3_SKIP_COST = 150

// Stage 3 reward: CandyMoyo nail polish
const stage3Reward: Product = {
  id: 'candymoyo-nail-red',
  name: 'CandyMoyo 红色指甲油',
  image: '/fig.png',
  brand: 'candymoyo',
  category: 'luxury',
  description: '猜对周媚的指甲油颜色后获得。',
  rarity: 'rare',
  points: 50,
}

type StageType = 'label' | 'shooting' | 'explore'

interface StageConfig {
  id: string
  src: string
  type: StageType
  label: string
}

const stages: StageConfig[] = [
  { id: 'stage1', src: '/van-cleef-arpels.mp4', type: 'label', label: '阶段① 标签广告' },
  { id: 'stage2', src: '/video.mp4', type: 'shooting', label: '阶段② 射击广告' },
  { id: 'stage3', src: '/video.mp4', type: 'explore', label: '阶段③ 探秘广告' },
]

const episodeList = [
  { no: 1, badge: '' }, { no: 2, badge: '' }, { no: 3, badge: '限免' },
  { no: 4, badge: '限免' }, { no: 5, badge: '限免' }, { no: 6, badge: '预告' },
  { no: 7, badge: '预告' }, { no: 8, badge: '预告' }, { no: 9, badge: '预告' },
  { no: 10, badge: '预告' }, { no: 11, badge: 'VIP' }, { no: 12, badge: 'VIP' },
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

  // Stage state
  const [currentStage, setCurrentStage] = useState(0)
  const [stage2HP, setStage2HP] = useState(STAGE2_HP)
  const [stage2Collected, setStage2Collected] = useState(false)
  const [showStage2CollectedToast, setShowStage2CollectedToast] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0) // 0-100 for current stage
  const [isPlaying, setIsPlaying] = useState(false)

  // Stage 3 state
  const [stage3QuizAnswered, setStage3QuizAnswered] = useState(false)
  const [stage3QuizResult, setStage3QuizResult] = useState<null | 'correct' | 'wrong'>(null)
  const [stage3ShowQuiz, setStage3ShowQuiz] = useState(false)
  const [stage3Skipped, setStage3Skipped] = useState(false)
  const [adCompleted, setAdCompleted] = useState(false)

  // Character & UI state
  const [characterEmotion, setCharacterEmotion] = useState<CharacterEmotion>('expectant')
  const [receivedProduct, setReceivedProduct] = useState<Product | null>(null)
  const [showCharacterPanel, setShowCharacterPanel] = useState(false)
  const [rightPanelMode, setRightPanelMode] = useState<'series' | 'collect'>('series')
  const [equippedOutfitId, setEquippedOutfitId] = useState<string | null>(null)

  const currentStageConfig = stages[currentStage]
  const isStage1 = currentStageConfig.type === 'label'
  const isStage2 = currentStageConfig.type === 'shooting'
  const isStage3 = currentStageConfig.type === 'explore'

  // Overall progress: each stage is 1/3 of the bar
  const overallProgress = useMemo(() => {
    const stageWidth = 100 / stages.length
    const base = currentStage * stageWidth
    return base + (videoProgress / 100) * stageWidth
  }, [currentStage, videoProgress])

  // Initialize equipped outfit from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    setEquippedOutfitId(window.localStorage.getItem('fangchao-equipped-outfit'))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (equippedOutfitId) {
      window.localStorage.setItem('fangchao-equipped-outfit', equippedOutfitId)
    } else {
      window.localStorage.removeItem('fangchao-equipped-outfit')
    }
  }, [equippedOutfitId])

  const ownedProductIds = useMemo(
    () => new Set(backpack.items.map(item => item.product.id)),
    [backpack.items]
  )

  // Reset stage state when changing stages
  const goToStage = useCallback((index: number) => {
    if (index >= stages.length) {
      setAdCompleted(true)
      return
    }
    setCurrentStage(index)
    setVideoProgress(0)
    setStage2HP(STAGE2_HP)
    setStage2Collected(false)
    setShowStage2CollectedToast(false)
    setStage3QuizAnswered(false)
    setStage3QuizResult(null)
    setStage3ShowQuiz(false)
    setStage3Skipped(false)
    setIsPlaying(false)
  }, [])

  // Video time update - track progress within stage
  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    if (duration > 0) {
      setVideoProgress((currentTime / duration) * 100)
    }
  }, [])

  // Stage 2: HP updates
  const handleStage2Hit = useCallback((hitCount: number) => {
    const remaining = Math.max(0, STAGE2_HP - hitCount)
    setStage2HP(remaining)
    if (remaining <= 0 && !stage2Collected) {
      setStage2Collected(true)
      setShowStage2CollectedToast(true)
      setTimeout(() => setShowStage2CollectedToast(false), 1500)
      addItem(stage2Reward)
      setCharacterEmotion('happy')
      setReceivedProduct(stage2Reward)
      logAction({ type: 'mask_collect', productId: stage2Reward.id, details: { hits: hitCount } })
      setTimeout(() => setReceivedProduct(null), 2000)
    }
  }, [stage2Collected, addItem, logAction])

  // Stage 1: collect tag
  const handleStage1Collect = useCallback((product: Product) => {
    // Skip decoys (collectible=false)
    if ((product as any).collectible === false) {
      logAction({ type: 'drop_reject', productId: product.id, details: { reason: 'decoy' } })
      return
    }
    const success = addItem(product)
    if (success) {
      setCharacterEmotion('happy')
      setReceivedProduct(product)
      logAction({ type: 'hotspot_collect', productId: product.id })
      setTimeout(() => setReceivedProduct(null), 1800)
    } else {
      setCharacterEmotion('surprised')
      logAction({ type: 'drop_reject', productId: product.id, details: { reason: 'backpack_full' } })
    }
  }, [addItem, logAction])

  // Video ended → next stage
  const handleVideoEnded = useCallback(() => {
    goToStage(currentStage + 1)
  }, [currentStage, goToStage])

  // Skip current stage
  const handleStageSkip = useCallback(() => {
    const cost = currentStage === 0 ? STAGE1_SKIP_COST : currentStage === 1 ? STAGE2_SKIP_COST : STAGE3_SKIP_COST
    if (totalPoints < cost) return
    const success = spendPoints(cost)
    if (success) {
      if (isStage3) {
        setStage3Skipped(true)
        setStage3ShowQuiz(false)
        setAdCompleted(true)
      } else {
        goToStage(currentStage + 1)
      }
      setCharacterEmotion('happy')
      logAction({ type: 'redeem_skip', details: { stage: currentStage, cost } })
    }
  }, [currentStage, isStage3, totalPoints, spendPoints, goToStage, logAction])

  // Stage 3: open quiz on video click
  const handleStage3VideoClick = useCallback(() => {
    if (stage3QuizAnswered || stage3Skipped) return
    setStage3ShowQuiz(true)
  }, [stage3QuizAnswered, stage3Skipped])

  // Stage 3: answer quiz
  const handleStage3Answer = useCallback((color: string) => {
    setStage3ShowQuiz(false)
    setStage3QuizAnswered(true)

    if (color === '红色') {
      setStage3QuizResult('correct')
      addItem(stage3Reward)
      setCharacterEmotion('happy')
      setReceivedProduct(stage3Reward)
      logAction({ type: 'mask_collect', productId: stage3Reward.id, details: { color } })
      setTimeout(() => setReceivedProduct(null), 2000)
    } else {
      setStage3QuizResult('wrong')
      logAction({ type: 'drop_reject', productId: stage3Reward.id, details: { color } })
    }
  }, [addItem, logAction, stage3QuizAnswered])

  // Character emotion updates
  useEffect(() => {
    if (isStage2 && stage2HP > 0 && isPlaying) {
      setCharacterEmotion('attacking')
    } else if (receivedProduct) {
      setCharacterEmotion('happy')
    } else {
      setCharacterEmotion('expectant')
    }
  }, [isStage2, stage2HP, isPlaying, receivedProduct])

  // Update right panel mode
  useEffect(() => {
    if (isStage1 || isStage2 || isStage3) {
      setRightPanelMode('collect')
    } else {
      setRightPanelMode('series')
    }
  }, [isStage1, isStage2, isStage3])

  // Character panel handlers
  const openCharacterPanel = useCallback(() => {
    setShowCharacterPanel(true)
  }, [])

  const handleEquipOutfit = useCallback((product: Product) => {
    if (equippedOutfitId === product.id) return true
    if (!ownedProductIds.has(product.id)) {
      setCharacterEmotion('surprised')
      return false
    }
    const success = spendPoints(fangchaoWearCost)
    if (!success) {
      setCharacterEmotion('surprised')
      return false
    }
    setEquippedOutfitId(product.id)
    setCharacterEmotion('happy')
    logAction({ type: 'equip_outfit', productId: product.id, details: { cost: fangchaoWearCost } })
    return true
  }, [equippedOutfitId, ownedProductIds, spendPoints, logAction])

  // Exchange handler
  const handleExchange = useCallback((product: Product) => {
    const success = exchangeItem(product)
    if (!success) {
      setCharacterEmotion('surprised')
      return
    }
    setCharacterEmotion('happy')
    setReceivedProduct(product)
    logAction({ type: 'exchange_redeem', productId: product.id })
    setTimeout(() => setReceivedProduct(null), 1600)
  }, [exchangeItem, logAction])

  // Quick-click products for character space
  const quickClickProductIds = new Set([
    'vca-bracelet', 'vca-ring', 'vca-necklace', 'vca-earrings',
    'fangchao-homie', 'fangchao-wukong', 'fangchao-taffy',
  ])
  const collectibleProducts = productCatalog.filter(p => quickClickProductIds.has(p.id))
  const fangchaoOutfitProducts = fangchaoOutfits
    .map(o => productCatalog.find(p => p.id === o.productId))
    .filter((p): p is Product => Boolean(p))

  // Build the VideoPlayer element
  const videoPlayer = (
    <VideoPlayer
      key={`${currentStageConfig.id}-${currentStage}`}
      src={currentStageConfig.src}
      mode={currentStageConfig.type === 'label' ? 'label' : currentStageConfig.type === 'shooting' ? 'shooting' : 'normal'}
      maskData={isStage2 ? (maskPositions as any) : undefined}
      maskRewardProduct={isStage2 ? stage2Reward : undefined}
      targetHits={STAGE2_HP}
      adTriggerPoints={[]}
      onAdTriggered={() => undefined}
      onAdEnded={() => undefined}
      onMaskHit={isStage2 ? handleStage2Hit : undefined}
      onMaskCompleted={undefined}
      collectibleCatalog={isStage1 ? stage1Tags as any : []}
      onCollectibleCollected={isStage1 ? handleStage1Collect : undefined}
      dropTargetRef={characterRef}
      onCharacterClick={openCharacterPanel}
      pointsBalance={totalPoints}
      skipCost={STAGE3_SKIP_COST}
      isAdActive={false}
      onPhaseChange={() => undefined}
      onTimeUpdate={handleTimeUpdate}
      onVideoEnded={handleVideoEnded}
      showMask={false}
      loop={false}
      overallProgress={overallProgress}
      equippedOutfitId={equippedOutfitId}
      autoPlay={isStage3}
      className="h-[58vh] w-full rounded-none lg:h-[calc(100vh-140px)]"
    />
  )

  // Right panel
  const rightPanel = rightPanelMode === 'collect' ? (
    <CollectStagePanel
      characterRef={characterRef}
      characterEmotion={characterEmotion}
      receivedProduct={receivedProduct}
      currentStage={currentStage}
      stageLabel={currentStageConfig.label}
      stage2HP={stage2HP}
      stage2MaxHP={STAGE2_HP}
      stage2Collected={stage2Collected}
      onBackToSeries={() => setRightPanelMode('series')}
      backpack={backpack}
      totalPoints={totalPoints}
      onRemoveItem={removeItem}
      onClearBackpack={clearBackpack}
      catalog={productCatalog}
      onExchange={handleExchange}
    />
  ) : (
    <SeriesPanel
      backpack={backpack}
      totalPoints={totalPoints}
      onRemoveItem={removeItem}
      onClearBackpack={clearBackpack}
      catalog={productCatalog}
    />
  )

  return (
    <main className="min-h-screen bg-[#0d0e12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#111317]">
        <div className="mx-auto flex h-20 w-full max-w-[1880px] items-center gap-4 px-6 lg:px-10">
          <div className="text-[28px] font-black tracking-tight text-white shrink-0">腾讯视频</div>
          <nav className="hidden items-center gap-4 text-lg font-semibold text-white/80 xl:flex">
            <span>电视剧</span><span>电影</span><span>综艺</span><span>动漫</span>
            <span>少儿</span><span>短剧</span><span>纪录片</span><span>全部</span>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <a href="/platform" className="rounded-full bg-sky-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-500 transition inline-block">
              我是平台
            </a>
            <a href="/advertiser" className="rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-500 transition inline-block">
              我是广告主
            </a>
            <div className="flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
              <span>奔跑吧 第10季</span>
              <Search className="ml-3 h-4 w-4" />
            </div>
            <button type="button" className="rounded-full bg-white/15 px-4 py-2 text-sm text-white/90">下载客户端</button>
            <button type="button" className="rounded-full bg-white/25 px-4 py-2 text-sm font-semibold text-white">登录</button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1880px] grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,2fr)_520px] lg:p-6">
        {/* Video section */}
        <section className="relative min-h-[58vh] overflow-hidden rounded-2xl bg-black lg:min-h-[calc(100vh-140px)]">
          {/* Stage indicator */}
          <div className="absolute left-4 top-4 z-30 rounded-full bg-black/65 px-4 py-2 text-sm font-bold text-white backdrop-blur">
            {currentStageConfig.label}
          </div>

          {videoPlayer}

          {/* Stage 2 HP overlay */}
          {isStage2 && !stage2Collected && (
            <div className="pointer-events-none absolute right-4 top-4 z-30 rounded-lg bg-black/70 px-4 py-3 text-white backdrop-blur">
              <div className="text-sm font-bold">香水生命值</div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-3 w-32 overflow-hidden rounded-full bg-white/15">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-yellow-400"
                    animate={{ width: `${(stage2HP / STAGE2_HP) * 100}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-xs font-bold text-yellow-300">{stage2HP}/{STAGE2_HP}</span>
              </div>
              <div className="mt-1 text-xs text-white/60">点击黄色高亮区域射击</div>
            </div>
          )}

          {/* Stage 2 collected toast */}
          {isStage2 && showStage2CollectedToast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="rounded-xl bg-white/95 px-6 py-4 text-center text-slate-950 shadow-2xl"
              >
                <div className="text-lg font-bold">藏品已收集</div>
                <div className="mt-1 text-sm text-slate-600">香水已存入背包</div>
              </motion.div>
            </motion.div>
          )}

          {/* Stage 3: magnifier + quiz overlay */}
          {isStage3 && !stage3Skipped && (
            <Stage3MagnifierQuiz
              quizAnswered={stage3QuizAnswered}
              quizResult={stage3QuizResult}
              showQuiz={stage3ShowQuiz}
              onVideoClick={handleStage3VideoClick}
              onAnswer={handleStage3Answer}
              onDismissQuiz={() => setStage3ShowQuiz(false)}
            />
          )}

          {/* Skip button for Stage 1 & 2 */}
          {(isStage1 || isStage2) && (
            <div className="absolute right-4 top-14 z-40">
              <button
                onClick={handleStageSkip}
                disabled={totalPoints < (isStage1 ? STAGE1_SKIP_COST : STAGE2_SKIP_COST)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition shadow-lg ${
                  totalPoints >= (isStage1 ? STAGE1_SKIP_COST : STAGE2_SKIP_COST)
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                    : 'cursor-not-allowed bg-gray-600/80 text-gray-300'
                }`}
              >
                {totalPoints >= (isStage1 ? STAGE1_SKIP_COST : STAGE2_SKIP_COST)
                  ? `跳过广告 (${isStage1 ? STAGE1_SKIP_COST : STAGE2_SKIP_COST}分)`
                  : `积分不足 (${totalPoints}/${isStage1 ? STAGE1_SKIP_COST : STAGE2_SKIP_COST})`}
              </button>
            </div>
          )}

          {/* Stage 3 skip button (always visible in top-right) */}
          {isStage3 && !stage3Skipped && (
            <div className="absolute right-4 top-14 z-40">
              <button
                onClick={handleStageSkip}
                disabled={totalPoints < STAGE3_SKIP_COST}
                className={`rounded-full px-4 py-2 text-sm font-bold transition shadow-lg ${
                  totalPoints >= STAGE3_SKIP_COST
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                    : 'cursor-not-allowed bg-gray-600/80 text-gray-300'
                }`}
              >
                {totalPoints >= STAGE3_SKIP_COST ? `跳过广告 (${STAGE3_SKIP_COST}分)` : `积分不足 (${totalPoints}/${STAGE3_SKIP_COST})`}
              </button>
            </div>
          )}

          {/* Stage 3 quiz result */}
          {isStage3 && stage3QuizResult && (
            <div className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2">
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`rounded-xl px-6 py-3 text-center text-lg font-bold shadow-2xl ${
                  stage3QuizResult === 'correct'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {stage3QuizResult === 'correct' ? '✓ 猜对了！+50积分' : '✗ 答案是红色'}
              </motion.div>
            </div>
          )}

          {/* Ad completed overlay */}
          {adCompleted && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-white/20 bg-gradient-to-br from-slate-900 to-slate-950 px-10 py-8 text-center text-white shadow-2xl"
              >
                <div className="text-4xl font-black text-yellow-300">广告已结束</div>
                <div className="mt-3 text-lg text-white/70">感谢观看，祝你生活愉快</div>
                <div className="mt-2 text-sm text-white/45">积分余额：{totalPoints}</div>
                <button
                  type="button"
                  onClick={() => {
                    setAdCompleted(false)
                    setCurrentStage(0)
                    setVideoProgress(0)
                    setStage2HP(STAGE2_HP)
                    setStage2Collected(false)
                    setShowStage2CollectedToast(false)
                    setStage3QuizAnswered(false)
                    setStage3QuizResult(null)
                    setStage3ShowQuiz(false)
                    setStage3Skipped(false)
                  }}
                  className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition"
                >
                  重新开始
                </button>
              </motion.div>
            </div>
          )}
        </section>

        {/* Right sidebar */}
        <aside className="min-h-[42vh] rounded-2xl border border-white/10 bg-[#1a1c22] p-4 lg:min-h-[calc(100vh-140px)] lg:p-6">
          {rightPanel}
        </aside>
      </div>

      {/* Character space modal */}
      <CharacterSpace
        open={showCharacterPanel}
        onClose={() => setShowCharacterPanel(false)}
        products={collectibleProducts.slice(0, 4)}
        onGift={handleStage1Collect}
        balance={totalPoints}
        outfits={fangchaoOutfitProducts}
        ownedProductIds={ownedProductIds}
        equippedOutfitId={equippedOutfitId}
        wearCost={fangchaoWearCost}
        onEquipOutfit={handleEquipOutfit}
      />

    </main>
  )
}

// ─── Series Panel ───────────────────────────────────────────────
function SeriesPanel({
  backpack, totalPoints, onRemoveItem, onClearBackpack, catalog,
}: {
  backpack: { items: Array<{ product: Product; quantity: number; acquiredAt: number }>; maxCapacity: number }
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
        <BackpackPanel backpack={backpack} totalPoints={totalPoints} onRemoveItem={onRemoveItem} onClear={onClearBackpack} catalog={catalog} />
      </div>
    </div>
  )
}

function DisabledActionButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button type="button" disabled className="grid h-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/40" aria-disabled="true">
      {icon}
    </button>
  )
}

// ─── Collect Stage Panel ────────────────────────────────────────
function CollectStagePanel({
  characterRef, characterEmotion, receivedProduct,
  currentStage, stageLabel, stage2HP, stage2MaxHP, stage2Collected,
  onBackToSeries, backpack, totalPoints, onRemoveItem, onClearBackpack, catalog, onExchange,
}: {
  characterRef: React.RefObject<HTMLDivElement | null>
  characterEmotion: CharacterEmotion
  receivedProduct: Product | null
  currentStage: number
  stageLabel: string
  stage2HP: number
  stage2MaxHP: number
  stage2Collected: boolean
  onBackToSeries: () => void
  backpack: { items: Array<{ product: Product; quantity: number; acquiredAt: number }>; maxCapacity: number }
  totalPoints: number
  onRemoveItem: (productId: string) => void
  onClearBackpack: () => void
  catalog: Product[]
  onExchange: (product: Product) => void
}) {
  const itemMap = useMemo(
    () => new Map(backpack.items.map(item => [item.product.id, item.quantity])),
    [backpack.items]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <BackpackPanel backpack={backpack} totalPoints={totalPoints} onRemoveItem={onRemoveItem} onClear={onClearBackpack} catalog={catalog} />
        <button type="button" onClick={onBackToSeries} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-lg font-bold text-red-300 hover:bg-white/5">
          <ChevronLeft className="h-5 w-5" />返回
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center">
        <button type="button" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Character ref={characterRef} emotion={characterEmotion} receivedProduct={receivedProduct} />
        </button>
        <div className="mt-3 text-2xl font-bold">{stageLabel}</div>

        {/* Stage 2 HP bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 w-full rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between text-lg">
            <span className="font-semibold">
              {stage2Collected ? '香水已收集' : '香水生命值'}
            </span>
            <span className="text-white/70">{stage2HP}/{stage2MaxHP}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-yellow-300"
              animate={{ width: `${Math.max(0, (stage2HP / stage2MaxHP) * 100)}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-white/65">
            {stage2Collected
              ? '香水已存入背包！等待广告结束进入下一阶段。'
              : '射击广告阶段，用十字准星瞄准黄色高亮区域点击射击。'}
          </p>
        </motion.div>

        {/* Exchange items */}
        <div className="mt-4 w-full flex-1 rounded-xl border border-white/10 bg-black/20 p-3">
          {backpack.items.filter(i => i.product.brand === 'chanel').length === 0 ? (
            <div className="grid h-full place-items-center text-sm text-white/45">
              收集香水后可在此兑换 Chanel 品牌商品
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {catalog.filter(p => p.brand === 'chanel' && p.exchangeRequirement).map(product => {
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
  product, current, required, canRedeem, onRedeem,
}: {
  product: Product; current: number; required: number; canRedeem: boolean; onRedeem: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <img src={product.image} alt="" className="h-12 w-12 rounded-md object-cover" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">{product.name}</div>
        <div className="mt-1 text-xs text-white/60">{brandLabels[product.brand]}</div>
        <div className="mt-1 text-xs text-white/45">进度 {current}/{required}</div>
      </div>
      <button
        type="button"
        disabled={!canRedeem}
        onClick={onRedeem}
        className={cn('rounded-md px-3 py-1 text-xs font-bold', canRedeem ? 'bg-emerald-500 text-white hover:bg-emerald-400' : 'bg-white/10 text-white/45')}
      >
        兑换
      </button>
    </div>
  )
}

// ─── Character Space ────────────────────────────────────────────
function CharacterSpace({
  open, onClose, products, onGift, balance, outfits, ownedProductIds, equippedOutfitId, wearCost, onEquipOutfit,
}: {
  open: boolean; onClose: () => void; products: Product[]; onGift: (p: Product) => void
  balance: number; outfits: Product[]; ownedProductIds: Set<string>
  equippedOutfitId: string | null; wearCost: number; onEquipOutfit: (p: Product) => boolean
}) {
  const [dragOverChar, setDragOverChar] = useState(false)

  if (!open) return null

  const handleDragStart = (e: React.DragEvent, product: Product) => {
    e.dataTransfer.setData('text/plain', product.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOverChar = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverChar(true)
  }

  const handleDragLeaveChar = () => setDragOverChar(false)

  const handleDropOnChar = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverChar(false)
    const productId = e.dataTransfer.getData('text/plain')
    const product = products.find(p => p.id === productId)
    if (product) onGift(product)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/45" onClick={onClose}>
      <motion.aside initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }} className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-slate-950 p-5 text-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-lg font-black">小人空间</div>
            <div className="mt-1 text-xs text-white/55">拖拽广告卡片到小人身上，或直接点击送礼。</div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/10 px-3 py-1 text-sm">关闭</button>
        </div>
        <div
          onDragOver={handleDragOverChar}
          onDragLeave={handleDragLeaveChar}
          onDrop={handleDropOnChar}
          className={cn(
            'grid place-items-center rounded-xl border p-5 transition',
            dragOverChar
              ? 'border-amber-400 bg-amber-500/15 scale-[1.02] shadow-[0_0_20px_rgba(251,191,36,0.3)]'
              : 'border-white/10 bg-white/[0.04]'
          )}
        >
          <Character emotion="happy" />
          <div className={cn(
            'mt-2 rounded-full px-4 py-2 text-sm transition',
            dragOverChar ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10'
          )}>
            {dragOverChar ? '松手送出礼物！' : '今天喜欢 Chanel 和 Nike。'}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="font-bold">方超穿搭</span>
          <span className="text-white/55">常驻穿戴 {wearCost} 积分</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {outfits.map(product => {
            const owned = ownedProductIds.has(product.id)
            const equipped = equippedOutfitId === product.id
            const canEquip = owned && (equipped || balance >= wearCost)
            return (
              <button
                key={product.id} type="button" disabled={!canEquip}
                onClick={() => onEquipOutfit(product)}
                className={cn('rounded-lg border p-2 text-left transition', equipped ? 'border-emerald-300 bg-emerald-400/15' : canEquip ? 'border-white/10 bg-white/[0.04] hover:border-primary/70' : 'border-white/5 bg-white/[0.02] opacity-55')}
              >
                <FangchaoOutfitSprite outfitId={product.id} className="h-20 w-full rounded-md" />
                <div className="mt-2 line-clamp-2 min-h-8 text-[11px] font-bold leading-4">{product.name}</div>
                <div className="mt-1 text-[10px] text-white/45">{equipped ? '已穿戴' : owned ? (balance >= wearCost ? '付费穿戴' : '积分不足') : '背包未拥有'}</div>
              </button>
            )
          })}
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
              draggable
              onDragStart={(e) => handleDragStart(e as any, product)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onGift(product)}
              className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-left shadow-lg transition hover:border-primary/70 cursor-grab active:cursor-grabbing"
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

// ─── Stage 3 Magnifier ──────────────────────────────────────────
// ─── Stage 3 Magnifier + Quiz ──────────────────────────────────

const LENS_RADIUS = 80
const QUIZ_OPTIONS = ['红色', '豆沙色', '橘色'] as const

function Stage3MagnifierQuiz({
  quizAnswered,
  quizResult,
  showQuiz,
  onVideoClick,
  onAnswer,
  onDismissQuiz,
}: {
  quizAnswered: boolean
  quizResult: null | 'correct' | 'wrong'
  showQuiz: boolean
  onVideoClick: () => void
  onAnswer: (color: string) => void
  onDismissQuiz: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top })
  }

  const handleClick = () => {
    if (!quizAnswered) {
      onVideoClick()
    }
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos(null)}
      onClick={handleClick}
      className="absolute inset-0 z-40 select-none"
      style={{ cursor: quizAnswered ? 'default' : 'none' }}
    >
      {/* Magnifier lens */}
      {pos && size.width > 0 && !quizAnswered && (
        <div
          className="pointer-events-none absolute overflow-hidden rounded-full border-[5px] border-pink-400/90 shadow-[0_0_35px_rgba(244,114,182,0.7),inset_0_0_20px_rgba(0,0,0,0.2)]"
          style={{
            left: pos.x - LENS_RADIUS,
            top: pos.y - LENS_RADIUS,
            width: LENS_RADIUS * 2,
            height: LENS_RADIUS * 2,
          }}
        >
          <div
            className="absolute"
            style={{
              left: -(pos.x - LENS_RADIUS),
              top: -(pos.y - LENS_RADIUS),
              width: size.width,
              height: size.height,
            }}
          >
            <img src="/fig.png" alt="" className="h-full w-full object-cover" draggable={false} />
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
        </div>
      )}

      {/* Hint when mouse not on video */}
      {!pos && !quizAnswered && (
        <div className="pointer-events-none absolute inset-x-0 top-6 z-50 flex justify-center">
          <div className="rounded-full bg-black/70 px-5 py-2 text-sm font-bold text-pink-200 shadow-xl backdrop-blur">
            移动鼠标查看放大镜，点击画面猜指甲油颜色
          </div>
        </div>
      )}

      {/* Quiz modal */}
      {showQuiz && !quizAnswered && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/15 bg-slate-900/95 px-8 py-6 text-center text-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-1 text-sm text-pink-300">CandyMoyo 指甲油</div>
            <div className="mb-5 text-xl font-bold">你觉得周媚会涂哪个颜色？</div>
            <div className="flex flex-col gap-3">
              {QUIZ_OPTIONS.map(color => (
                <button
                  key={color}
                  onClick={() => onAnswer(color)}
                  className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-lg font-bold text-white transition hover:bg-pink-500/30 hover:border-pink-400/60 active:scale-95"
                >
                  {color}
                </button>
              ))}
            </div>
            <button
              onClick={onDismissQuiz}
              className="mt-4 text-xs text-white/40 hover:text-white/70 transition"
            >
              关闭
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
