'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize, Pause, Play, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ProgressBarCharacter } from '@/components/progress-bar-character'
import type { AdTriggerPoint, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

type MaskBox = {
  x: number
  y: number
  width: number
  height: number
  x_max: number
  y_max: number
}

type MaskFrame = {
  frame_id: number
  timestamp_s: number
  yellow_mask: null | {
    bounding_box: MaskBox
    contour_points?: number[][]
  }
}

type MaskData = {
  video_info: {
    frames: number
    fps: number
    width: number
    height: number
    duration_s: number
  }
  frames: MaskFrame[]
}

type ClickTagProduct = Product & {
  collectible?: boolean
}

type PlayerMode = 'label' | 'shooting' | 'normal'

interface VideoPlayerProps {
  src?: string
  maskData?: MaskData
  maskRewardProduct?: Product
  adTriggerPoints: AdTriggerPoint[]
  onAdTriggered: (products: Product[]) => void
  onAdEnded: () => void
  onMaskCompleted?: (product: Product) => void
  onMaskHit?: (hitCount: number) => void
  collectibleCatalog?: ClickTagProduct[]
  onCollectibleCollected?: (product: Product) => void
  dropTargetRef?: RefObject<HTMLElement | null>
  onCharacterClick?: () => void
  pointsBalance?: number
  skipCost?: number
  onRedeemSkip?: () => boolean
  isAdActive: boolean
  className?: string
  onPause?: () => void
  onPlay?: () => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPhaseChange?: (phase: 'main' | 'mask' | 'collected') => void
  onVideoEnded?: () => void
  showMask?: boolean
  equippedOutfitId?: string | null
  loop?: boolean
  overallProgress?: number
  mode?: PlayerMode
  targetHits?: number
  autoPlay?: boolean
}

// targetHits passed as prop, default 5

export function VideoPlayer({
  src,
  maskData,
  maskRewardProduct,
  adTriggerPoints,
  onAdTriggered,
  onAdEnded,
  onMaskCompleted,
  onMaskHit,
  collectibleCatalog = [],
  onCollectibleCollected,
  dropTargetRef,
  onCharacterClick,
  pointsBalance = 0,
  skipCost = 450,
  onRedeemSkip,
  isAdActive,
  className,
  onPause,
  onPlay,
  onTimeUpdate,
  onPhaseChange,
  onVideoEnded,
  showMask = false,
  equippedOutfitId,
  loop = false,
  overallProgress,
  mode = 'normal',
  targetHits = 5,
  autoPlay = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const lastShotRef = useRef(0)

  const [phase, setPhase] = useState<'main' | 'mask' | 'collected'>('main')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [triggeredAds, setTriggeredAds] = useState<Set<number>>(new Set())
  const [currentAdEndTime, setCurrentAdEndTime] = useState<number | null>(null)
  const [characterThrown, setCharacterThrown] = useState(false)
  const [aimPoint, setAimPoint] = useState({ x: 50, y: 50 })
  const [hitCount, setHitCount] = useState(0)
  const [shot, setShot] = useState<null | { id: number; x: number; y: number; hit: boolean }>(null)
  const [damageTexts, setDamageTexts] = useState<Array<{ id: number; x: number; y: number; hit: boolean }>>([])
  const [justHit, setJustHit] = useState(false)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [collectedToast, setCollectedToast] = useState<null | { id: number; product: Product; collected: boolean }>(null)

  const isMaskPhase = phase === 'mask' && mode !== 'label'
  const isMaskCompleted = phase === 'collected'
  const isLabelMode = mode === 'label'
  const isShootingMode = mode === 'shooting'
  const isQuickClickActive = Boolean(
    (isLabelMode || (maskData && mode !== 'shooting')) && collectibleCatalog.length > 0 && !isMaskCompleted
  )
  const activeSrc = src

  useEffect(() => {
    if (maskData && isPlaying && !isMaskCompleted && phase !== 'mask' && mode !== 'label') {
      setPhase('mask')
    }
  }, [maskData, isPlaying, isMaskCompleted, phase, mode])

  useEffect(() => {
    onPhaseChange?.(phase)
  }, [onPhaseChange, phase])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateSize = () => {
      const rect = element.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const frameById = useMemo(() => {
    const map = new Map<number, MaskFrame>()
    maskData?.frames.forEach(frame => map.set(frame.frame_id, frame))
    return map
  }, [maskData])

  const activeMaskFrame = useMemo(() => {
    if (!maskData) return null
    if (!isQuickClickActive && !isShootingMode) return null
    const frameId = Math.max(0, Math.min(maskData.video_info.frames - 1, Math.round(currentTime * maskData.video_info.fps)))
    return frameById.get(frameId) ?? null
  }, [currentTime, frameById, isQuickClickActive, isShootingMode, maskData])

  const frameCollectible = useMemo(() => {
    if (collectibleCatalog.length === 0 || !isQuickClickActive || !isPlaying || isMaskCompleted || isAdActive || isShootingMode) return null
    const frameId = Math.max(0, Math.floor(currentTime * 30))
    const stableSlot = Math.floor(frameId / 15)
    const product = collectibleCatalog[stableSlot % collectibleCatalog.length]
    const mask = activeMaskFrame?.yellow_mask

    if (mask && maskData) {
      const box = mask.bounding_box
      const centerX = ((box.x + box.width / 2) / maskData.video_info.width) * 100
      const centerY = ((box.y + box.height / 2) / maskData.video_info.height) * 100
      const radiusX = Math.max(12, (box.width / maskData.video_info.width) * 70)
      const radiusY = Math.max(10, (box.height / maskData.video_info.height) * 70)
      const angle = (stableSlot * 137.5 * Math.PI) / 180

      return {
        product,
        x: Math.min(86, Math.max(6, centerX + Math.cos(angle) * radiusX)),
        y: Math.min(78, Math.max(8, centerY + Math.sin(angle) * radiusY)),
      }
    }

    return {
      product,
      x: 16 + ((stableSlot * 29) % 58),
      y: 16 + ((stableSlot * 17) % 46),
    }
  }, [activeMaskFrame, collectibleCatalog, currentTime, isAdActive, isMaskCompleted, isPlaying, isQuickClickActive, maskData])

  const outfitIndex = useMemo(() => {
    const slot = Math.floor(currentTime / 4)
    return (slot * 7 + 2) % 6
  }, [currentTime])
  const isClimaxWindow = duration > 0 && duration - currentTime <= 3 && currentTime > duration * 0.55

  const handleCharacterThrow = useCallback((velocity: { x: number; y: number }) => {
    setCharacterThrown(true)
    setTimeout(() => setCharacterThrown(false), 3000)
  }, [])

  useEffect(() => {
    if (!isPlaying || isAdActive || isMaskPhase) return

    const checkPoint = adTriggerPoints.find(
      point =>
        currentTime >= point.time &&
        currentTime < point.time + 1 &&
        !triggeredAds.has(point.time)
    )

    if (checkPoint) {
      setTriggeredAds(prev => new Set([...prev, checkPoint.time]))
      setCurrentAdEndTime(currentTime + checkPoint.duration)
      videoRef.current?.pause()
      setIsPlaying(false)
      onAdTriggered(checkPoint.products)
    }
  }, [currentTime, isPlaying, adTriggerPoints, triggeredAds, isAdActive, onAdTriggered, isMaskPhase])

  const togglePlay = useCallback(() => {
    if (!videoRef.current || isAdActive || isMaskCompleted) return

    const video = videoRef.current
    if (video instanceof HTMLVideoElement) {
      if (isPlaying) {
        video.pause()
      } else {
        void video.play()
      }
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, isAdActive, isMaskCompleted])

  const skipAd = useCallback(() => {
    onAdEnded()
    setCurrentAdEndTime(null)
    if (videoRef.current) {
      void videoRef.current.play()
      setIsPlaying(true)
    }
  }, [onAdEnded])

  const collectProduct = useCallback((product: ClickTagProduct) => {
    const canCollect = product.collectible !== false
    if (canCollect) onCollectibleCollected?.(product)
    const id = Date.now()
    setCollectedToast({ id, product, collected: canCollect })
    window.setTimeout(() => {
      setCollectedToast(current => (current?.id === id ? null : current))
    }, 1300)
  }, [onCollectibleCollected])

  const handleCollectibleDragEnd = useCallback((product: ClickTagProduct, point: { x: number; y: number }) => {
    const rect = dropTargetRef?.current?.getBoundingClientRect()
    const droppedOnCharacter =
      rect &&
      point.x >= rect.left &&
      point.x <= rect.right &&
      point.y >= rect.top &&
      point.y <= rect.bottom

    if (droppedOnCharacter) collectProduct(product)
  }, [collectProduct, dropTargetRef])

  const redeemClimaxSkip = useCallback(() => {
    if (!onRedeemSkip?.()) return
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, duration - 0.15)
      void videoRef.current.play()
      setIsPlaying(true)
    }
  }, [duration, onRedeemSkip])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setCurrentTime(video.currentTime)
    onTimeUpdate?.(video.currentTime, video.duration || 0)
  }, [onTimeUpdate])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    setDuration(video.duration || 0)
  }, [])

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return
    const video = videoRef.current
    if (!video) return
    const play = () => {
      void video.play()
      setIsPlaying(true)
    }
    if (video.readyState >= 2) {
      play()
    } else {
      video.addEventListener('canplay', play, { once: true })
      return () => video.removeEventListener('canplay', play)
    }
  }, [autoPlay])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setShowControls(true)
    onVideoEnded?.()
  }, [onVideoEnded])

  const handleSeek = useCallback((value: number[]) => {
    if (videoRef.current && !isAdActive && !isMaskCompleted) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }, [isAdActive, isMaskCompleted])

  const handleVolumeChange = useCallback((value: number[]) => {
    const video = videoRef.current
    if (!video) return
    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current.requestFullscreen()
    }
  }, [])

  const handleMouseMove = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    setShowControls(true)
    if (containerRef.current && isMaskPhase) {
      const rect = containerRef.current.getBoundingClientRect()
      setAimPoint({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      })
    }
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isAdActive && !isMaskPhase) setShowControls(false)
    }, 3000)
  }, [isPlaying, isAdActive, isMaskPhase])

  const getVideoPoint = useCallback((clientX: number, clientY: number) => {
    const video = videoRef.current
    if (!video || !maskData) return null

    const rect = video.getBoundingClientRect()
    const videoW = maskData.video_info.width
    const videoH = maskData.video_info.height
    const scale = Math.max(rect.width / videoW, rect.height / videoH)
    const renderedW = videoW * scale
    const renderedH = videoH * scale
    const offsetX = (rect.width - renderedW) / 2
    const offsetY = (rect.height - renderedH) / 2

    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    }
  }, [maskData])

  const pointInPolygon = (point: { x: number; y: number }, polygon?: number[][]) => {
    if (!polygon || polygon.length < 3) return false
    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0]
      const yi = polygon[i][1]
      const xj = polygon[j][0]
      const yj = polygon[j][1]
      const intersects = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi
      if (intersects) inside = !inside
    }
    return inside
  }

  const isPointInMask = useCallback((clientX: number, clientY: number) => {
    const mask = activeMaskFrame?.yellow_mask
    const videoPoint = getVideoPoint(clientX, clientY)
    if (!mask || !videoPoint) return false

    const box = mask.bounding_box
    const inBox =
      videoPoint.x >= box.x &&
      videoPoint.x <= box.x_max &&
      videoPoint.y >= box.y &&
      videoPoint.y <= box.y_max

    return inBox && (pointInPolygon(videoPoint, mask.contour_points) || !mask.contour_points?.length)
  }, [activeMaskFrame, getVideoPoint])

  const fireAt = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (!isMaskPhase || isMaskCompleted || !maskRewardProduct) return

    const now = Date.now()
    if (now - lastShotRef.current < 220) return
    lastShotRef.current = now

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    const hit = isPointInMask(event.clientX, event.clientY)
    const id = now

    setShot({ id, x, y, hit })
    setDamageTexts(prev => [...prev, { id, x, y, hit }])
    setTimeout(() => setShot(null), 280)
    setTimeout(() => setDamageTexts(prev => prev.filter(item => item.id !== id)), 900)

    if (!hit) return

    setJustHit(true)
    setTimeout(() => setJustHit(false), 180)

    const nextHitCount = Math.min(targetHits, hitCount + 1)
    setHitCount(nextHitCount)
    onMaskHit?.(nextHitCount)

    if (nextHitCount >= targetHits) {
      setPhase('collected')
      onMaskCompleted?.(maskRewardProduct)
      // In shooting mode, keep video playing until it ends naturally
      if (mode !== 'shooting') {
        setIsPlaying(false)
        videoRef.current?.pause()
      }
    }
  }, [hitCount, isMaskPhase, isMaskCompleted, isPointInMask, maskRewardProduct, onMaskCompleted, onMaskHit])

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const adMarkers = adTriggerPoints.map(point => ({
    position: duration > 0 ? (point.time / duration) * 100 : 0,
    triggered: triggeredAds.has(point.time),
  }))

  const maskBoxStyle = useMemo(() => {
    const mask = activeMaskFrame?.yellow_mask
    if (!mask || !maskData || containerSize.width === 0 || containerSize.height === 0) return null
    const box = mask.bounding_box
    const videoW = maskData.video_info.width
    const videoH = maskData.video_info.height
    const scale = Math.max(containerSize.width / videoW, containerSize.height / videoH)
    const renderedW = videoW * scale
    const renderedH = videoH * scale
    const offsetX = (containerSize.width - renderedW) / 2
    const offsetY = (containerSize.height - renderedH) / 2

    return {
      left: `${offsetX + box.x * scale}px`,
      top: `${offsetY + box.y * scale}px`,
      width: `${box.width * scale}px`,
      height: `${box.height * scale}px`,
    }
  }, [activeMaskFrame, containerSize, maskData])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-xl bg-black', isShootingMode && isMaskPhase && 'cursor-crosshair', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !isMaskPhase && setShowControls(false)}
      onClick={event => {
        if (isMaskPhase && !isMaskCompleted) {
          fireAt(event)
        } else if (!isAdActive && !isMaskCompleted && !isLabelMode) {
          togglePlay()
        }
      }}
    >
      {activeSrc ? (
        <video
          key={activeSrc}
          ref={videoRef}
          src={activeSrc}
          className={cn('h-full w-full object-cover', isMaskCompleted && mode !== 'shooting' && 'opacity-25')}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPause={onPause}
          onPlay={onPlay}
          playsInline
          loop={loop}
        />
      ) : (
        <DemoVideoPlaceholder
          currentTime={currentTime}
          duration={duration || 120}
          isPlaying={isPlaying}
          onTimeUpdate={setCurrentTime}
          onDurationSet={setDuration}
        />
      )}

      <AnimatePresence>
        {frameCollectible && (
          <motion.div
            key={`${frameCollectible.product.id}-${Math.floor(currentTime * 2)}`}
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileDrag={{ scale: 1.12, rotate: -6, zIndex: 70 }}
            onClick={event => {
              event.stopPropagation()
              collectProduct(frameCollectible.product)
            }}
            onDragEnd={(_, info) => handleCollectibleDragEnd(frameCollectible.product, info.point)}
            className={cn(
              'absolute z-30 flex cursor-pointer items-center gap-2 rounded-full border-2 bg-white/95 px-3 py-2 text-slate-950 shadow-2xl active:cursor-grabbing',
              frameCollectible.product.collectible === false ? 'border-white/50 opacity-90' : 'border-primary'
            )}
            style={{
              left: `${frameCollectible.x}%`,
              top: `${frameCollectible.y}%`,
              touchAction: 'none',
            }}
          >
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-primary/15">
              <img src={frameCollectible.product.image} alt="" className="h-full w-full object-cover" />
            </span>
            <span className="max-w-[120px] truncate text-xs font-black">
              {frameCollectible.product.name}
            </span>
            <span className="rounded-full bg-orange-400 px-2 py-0.5 text-[10px] font-bold text-white">
              {frameCollectible.product.collectible === false ? '干扰' : `+${frameCollectible.product.points}`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!isPlaying && !isAdActive && !isMaskCompleted && (
        <button
          type="button"
          onClick={event => {
            event.stopPropagation()
            togglePlay()
          }}
          className="absolute left-1/2 top-1/2 z-30 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-950 shadow-2xl transition hover:scale-105 hover:bg-white"
          aria-label="播放"
        >
          <Play className="ml-1 h-8 w-8 fill-current" />
        </button>
      )}

      <AnimatePresence>
        {collectedToast && (
          <motion.div
            key={collectedToast.id}
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.9 }}
            className="absolute right-4 top-4 z-50 rounded-full bg-orange-500 px-4 py-2 text-sm font-black text-white shadow-xl"
          >
            {collectedToast.collected ? `+${collectedToast.product.points} 积分` : '未加入背包'}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMaskPhase && !isMaskCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-20"
          >
            {maskBoxStyle && (
              <motion.div
                className={cn(
                  'absolute rounded-md border-2 border-yellow-300/80 shadow-[0_0_24px_rgba(250,204,21,0.75)]',
                  justHit && 'border-red-400 shadow-[0_0_35px_rgba(248,113,113,0.9)]'
                )}
                style={maskBoxStyle}
                animate={{ scale: justHit ? [1, 1.04, 1] : 1 }}
                transition={{ duration: 0.18 }}
              >
                <div className="absolute left-1/2 top-0 w-32 -translate-x-1/2 -translate-y-8">
                  <div className="h-3 overflow-hidden rounded-full border border-white/80 bg-black/60">
                    <motion.div
                      className="h-full bg-gradient-to-r from-red-500 to-lime-400"
                      animate={{ width: `${((targetHits - hitCount) / targetHits) * 100}%` }}
                    />
                  </div>
                  <div className="mt-1 text-center text-xs font-bold text-white drop-shadow">
                    {targetHits - hitCount} / {targetHits}
                  </div>
                </div>
              </motion.div>
            )}

            <div
              className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90"
              style={{ left: `${aimPoint.x}%`, top: `${aimPoint.y}%` }}
            >
              <div className="absolute left-1/2 top-1/2 h-px w-9 -translate-x-1/2 bg-white/80" />
              <div className="absolute left-1/2 top-1/2 h-9 w-px -translate-y-1/2 bg-white/80" />
            </div>

            {shot && (
              <motion.div
                key={shot.id}
                initial={{ opacity: 0.9, scaleX: 0 }}
                animate={{ opacity: 0, scaleX: 1 }}
                transition={{ duration: 0.24 }}
                className={cn('absolute bottom-20 left-1/2 h-1 origin-left rounded-full', shot.hit ? 'bg-yellow-300' : 'bg-white/70')}
                style={{
                  width: `${Math.hypot(shot.x - 50, shot.y - 88)}%`,
                  transform: `rotate(${Math.atan2(shot.y - 88, shot.x - 50)}rad)`,
                }}
              />
            )}

            {damageTexts.map(item => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -36, scale: 1.15 }}
                exit={{ opacity: 0 }}
                className={cn('absolute text-xl font-black drop-shadow-lg', item.hit ? 'text-yellow-300' : 'text-white/70')}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.hit ? '-1' : '未命中'}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Only show "collected" overlay in non-shooting mode; shooting mode keeps playing */}
      {isMaskCompleted && mode !== 'shooting' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/55"
        >
          <div className="rounded-lg bg-white/95 px-6 py-4 text-center text-slate-950 shadow-2xl">
            <div className="text-lg font-bold">藏品已收集</div>
            <div className="mt-1 text-sm text-slate-600">已自动加入背包</div>
          </div>
        </motion.div>
      )}

      {isAdActive && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-4 text-lg font-medium text-white">
              把商品拖到小人身上
            </div>
            <Button variant="outline" size="sm" onClick={skipAd} className="gap-2">
              <SkipForward className="h-4 w-4" />
              跳过
            </Button>
          </div>
        </div>
      )}

      {isMaskPhase && !isMaskCompleted && (
        <div className="pointer-events-none absolute left-4 top-4 z-30 rounded-md bg-black/60 px-3 py-2 text-sm text-white">
          移动鼠标瞄准，点击发射 {hitCount}/{targetHits}
        </div>
      )}

      {isMaskPhase && !isMaskCompleted && !activeMaskFrame?.yellow_mask && (
        <div className="pointer-events-none absolute left-4 top-16 z-30 rounded-md bg-yellow-500/90 px-3 py-2 text-sm font-medium text-slate-950">
          当前帧没有高亮区域，等藏品再次出现。
        </div>
      )}

      {isClimaxWindow && !isMaskCompleted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
          <div className="rounded-xl border border-white/15 bg-slate-950/85 p-5 text-center text-white shadow-2xl">
            <div className="mb-3 text-sm font-bold">高潮广告阶段</div>
            <Button
              onClick={redeemClimaxSkip}
              disabled={pointsBalance < skipCost}
              className="gap-2 rounded-full"
            >
              <SkipForward className="h-4 w-4" />
              消耗 {skipCost} 积分跳过
            </Button>
            <div className="mt-2 text-xs text-white/60">当前余额：{pointsBalance} 积分</div>
          </div>
        </div>
      )}

      <div
        className={cn(
          'absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
          showControls || isAdActive || isMaskPhase ? 'opacity-100' : 'opacity-0'
        )}
        onClick={event => event.stopPropagation()}
      >
        <div className="relative mb-3 pt-12">
          {!isAdActive && !isMaskCompleted && (
            <ProgressBarCharacter
              progress={overallProgress ?? (duration > 0 ? (currentTime / duration) * 100 : 0)}
              isPlaying={isPlaying}
              onThrow={handleCharacterThrow}
              onClick={onCharacterClick}
              outfitIndex={outfitIndex}
              equippedOutfitId={equippedOutfitId}
            />
          )}

          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={isAdActive || isMaskCompleted}
            className="cursor-pointer"
          />
          {!isMaskPhase && adMarkers.map((marker, index) => (
            <div
              key={index}
              className={cn(
                'absolute bottom-0 h-3 w-1 -translate-y-1/2 rounded-full',
                marker.triggered ? 'bg-muted-foreground' : 'bg-accent'
              )}
              style={{ left: `${marker.position}%` }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={isAdActive || isMaskCompleted}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>

            <span className="text-sm text-white/80">
              {phase === 'mask' ? '高光广告' : '正常广告'} {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-white hover:bg-white/20"
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function DemoVideoPlaceholder({
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onDurationSet,
}: {
  currentTime: number
  duration: number
  isPlaying: boolean
  onTimeUpdate: (time: number) => void
  onDurationSet: (duration: number) => void
}) {
  useEffect(() => {
    onDurationSet(120)
  }, [onDurationSet])

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      onTimeUpdate(Math.min(currentTime + 0.1, duration))
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, duration, onTimeUpdate])

  return (
    <div className="flex h-full w-full items-center justify-center bg-slate-950">
      <div className="text-center text-white">
        <div className="mb-2 text-4xl font-bold">互动广告</div>
        <div className="text-sm text-white/70">{isPlaying ? '播放中...' : '点击播放'}</div>
      </div>
    </div>
  )
}
