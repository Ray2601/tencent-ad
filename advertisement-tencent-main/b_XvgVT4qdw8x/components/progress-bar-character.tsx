'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { fangchaoOutfits, type FangchaoOutfitDef } from '@/lib/collection-data'
import { cn } from '@/lib/utils'

interface ProgressBarCharacterProps {
  progress: number
  isPlaying: boolean
  onThrow?: (velocity: { x: number; y: number }) => void
  onClick?: () => void
  outfitIndex?: number
  equippedOutfitId?: string | null
  className?: string
}

type DragMood = 'normal' | 'surprised' | 'thrown'

const codexPetOutfits = fangchaoOutfits.filter(o => o.renderMode === 'full-sprite')
const FRAME_COUNT = 8
const ROW_COUNT = 9

function pickRow(mood: DragMood, isPlaying: boolean): number {
  if (mood === 'surprised') return 2
  if (mood === 'thrown') return 4
  if (isPlaying) return 1 // walking forward row
  return 0 // idle row
}

export function ProgressBarCharacter({
  progress,
  isPlaying,
  onThrow,
  onClick,
  outfitIndex = 0,
  equippedOutfitId,
  className,
}: ProgressBarCharacterProps) {
  const [mood, setMood] = useState<DragMood>('normal')
  const [showReturnHint, setShowReturnHint] = useState(false)
  const [throwTarget, setThrowTarget] = useState({ x: 0, y: 0, rotate: 0 })

  const equippedOutfit = useMemo(
    () => (equippedOutfitId ? fangchaoOutfits.find(o => o.productId === equippedOutfitId) ?? null : null),
    [equippedOutfitId],
  )

  const randomOutfit = useMemo(() => {
    if (codexPetOutfits.length === 0) return null
    const permutedIndex = (outfitIndex * 7 + 3) % codexPetOutfits.length
    return codexPetOutfits[permutedIndex]
  }, [outfitIndex])

  const displayOutfit: FangchaoOutfitDef | null = equippedOutfit ?? randomOutfit

  const tease = equippedOutfit
    ? '已穿搭'
    : displayOutfit
      ? displayOutfit.name
      : ['点我呀', '新穿搭', '看这里'][outfitIndex % 3]

  useEffect(() => {
    if (mood !== 'thrown') return
    const timer = window.setTimeout(() => {
      setMood('normal')
      setShowReturnHint(false)
      setThrowTarget({ x: 0, y: 0, rotate: 0 })
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [mood])

  return (
    <div
      className={cn('pointer-events-none absolute flex flex-col items-center', className)}
      style={{
        left: `${progress}%`,
        bottom: '1.15rem',
        transform: 'translateX(-50%)',
        zIndex: 50,
      }}
    >
      <motion.div
        className="pointer-events-auto cursor-grab"
        drag
        dragMomentum={false}
        whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
        animate={
          mood === 'thrown'
            ? { x: throwTarget.x, y: throwTarget.y, rotate: throwTarget.rotate, opacity: 0 }
            : { x: 0, y: 0, opacity: 1 }
        }
        transition={mood === 'thrown' ? { duration: 0.55, ease: 'easeOut' } : { duration: 0.2 }}
        onDrag={(_, info) => {
          const isAwayFromBar = Math.abs(info.offset.y) > 18 || Math.abs(info.offset.x) > 42
          if (mood !== 'thrown') setMood(isAwayFromBar ? 'surprised' : 'normal')
        }}
        onDragEnd={(_, info) => {
          onThrow?.({ x: info.velocity.x, y: info.velocity.y })
          const speed = Math.hypot(info.velocity.x, info.velocity.y)

          if (speed > 900) {
            const direction = Math.random() > 0.5 ? 1 : -1
            setThrowTarget({
              x: direction * (260 + Math.random() * 180),
              y: -170 - Math.random() * 120,
              rotate: direction * (80 + Math.random() * 70),
            })
            setMood('thrown')
            setShowReturnHint(true)
            return
          }

          setMood('normal')
        }}
        onClick={event => {
          event.stopPropagation()
          if (mood !== 'thrown') onClick?.()
        }}
        style={{ touchAction: 'none' }}
      >
        {mood !== 'thrown' && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-1 text-[10px] font-bold text-primary shadow">
            {mood === 'surprised' ? '哎呀！' : tease}
          </div>
        )}

        <AnimatedSpriteCharacter
          outfit={displayOutfit}
          mood={mood}
          isPlaying={isPlaying}
        />
      </motion.div>

      {showReturnHint && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-white shadow-lg"
          style={{ top: '6rem' }}
        >
          很快回来喔
        </motion.div>
      )}
    </div>
  )
}

function AnimatedSpriteCharacter({
  outfit,
  mood,
  isPlaying,
}: {
  outfit: FangchaoOutfitDef | null
  mood: DragMood
  isPlaying: boolean
}) {
  const [frame, setFrame] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const row = pickRow(mood, isPlaying)

  const frameInterval = mood === 'surprised' ? 150 : 200

  useEffect(() => {
    const shouldAnimate = isPlaying || mood === 'surprised'

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!shouldAnimate) {
      setFrame(0)
      return
    }

    intervalRef.current = setInterval(() => {
      setFrame(f => (f + 1) % FRAME_COUNT)
    }, frameInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isPlaying, mood, frameInterval])

  const spritesheet = outfit?.spritesheet ?? codexPetOutfits[0]?.spritesheet ?? ''
  const bgX = `${((frame / (FRAME_COUNT - 1)) * 100).toFixed(2)}%`
  const bgY = `${((row / (ROW_COUNT - 1)) * 100).toFixed(2)}%`

  return (
    <motion.div
      className="flex flex-col items-center"
      animate={isPlaying && mood === 'normal' ? { y: [0, -3, -1, -3, 0], x: [0, 1, 2, 1, 0] } : {}}
      transition={{ duration: 0.55, repeat: isPlaying && mood === 'normal' ? Infinity : 0 }}
    >
      <div
        className="w-16 bg-no-repeat drop-shadow-[0_8px_10px_rgba(0,0,0,0.45)]"
        style={{
          backgroundImage: `url('${spritesheet}')`,
          backgroundSize: '800% auto',
          backgroundPosition: `${bgX} ${bgY}`,
          aspectRatio: '192/208',
        }}
      />
    </motion.div>
  )
}

export function FangchaoOutfitSprite({
  outfitId,
  className,
}: {
  outfitId: string
  className?: string
}) {
  const outfit = fangchaoOutfits.find(item => item.productId === outfitId) ?? fangchaoOutfits[0]

  if (!outfit) return null

  if (outfit.renderMode === 'full-sprite') {
    return (
      <div
        aria-label={outfit.name}
        className={cn('overflow-hidden rounded-md bg-white/5 bg-no-repeat', className)}
        style={{
          backgroundImage: `url('${outfit.spritesheet}')`,
          backgroundSize: '800% auto',
          backgroundPosition: '0% 0%',
        }}
      />
    )
  }

  return (
    <div
      aria-label={outfit.name}
      className={cn('overflow-hidden rounded-md bg-white/5 bg-no-repeat', className)}
      style={{
        backgroundImage: `url('${outfit.spritesheet}')`,
        backgroundPosition: outfit.spritePosition,
        backgroundSize: '300% auto',
      }}
    />
  )
}
