'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarCharacterProps {
  progress: number
  isPlaying: boolean
  onThrow?: (velocity: { x: number; y: number }) => void
  onClick?: () => void
  outfitIndex?: number
  className?: string
}

type DragMood = 'normal' | 'surprised' | 'thrown'

export function ProgressBarCharacter({
  progress,
  isPlaying,
  onThrow,
  onClick,
  outfitIndex = 0,
  className,
}: ProgressBarCharacterProps) {
  const [mood, setMood] = useState<DragMood>('normal')
  const [showReturnHint, setShowReturnHint] = useState(false)
  const [throwTarget, setThrowTarget] = useState({ x: 0, y: 0, rotate: 0 })
  const tease = ['点我呀', '新穿搭', '看这里'][outfitIndex % 3]

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
      className={cn('pointer-events-none absolute bottom-0 h-20', className)}
      style={{
        left: `${progress}%`,
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
            : { x: 0, y: 0, rotate: isPlaying ? [0, -3, 3, -3, 0] : 0, opacity: 1 }
        }
        transition={mood === 'thrown' ? { duration: 0.55, ease: 'easeOut' } : { duration: 2, repeat: isPlaying ? Infinity : 0, ease: 'easeInOut' }}
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
        <LyingCharacterSvg isPlaying={isPlaying} outfitIndex={outfitIndex} mood={mood} />
      </motion.div>

      {showReturnHint && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute left-1/2 top-14 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/85 px-3 py-1 text-xs font-bold text-white shadow-lg"
        >
          很快回来喔
        </motion.div>
      )}
    </div>
  )
}

function LyingCharacterSvg({
  isPlaying,
  outfitIndex,
  mood,
}: {
  isPlaying: boolean
  outfitIndex: number
  mood: DragMood
}) {
  const outfitColors = ['#A78BFA', '#60A5FA', '#4ADE80']
  const accent = mood === 'surprised' ? '#FBBF24' : mood === 'thrown' ? '#F472B6' : outfitColors[outfitIndex % outfitColors.length]
  const isSurprised = mood === 'surprised'
  const isThrown = mood === 'thrown'

  return (
    <svg width="80" height="50" viewBox="0 0 80 50" fill="none" className="drop-shadow-lg">
      <motion.ellipse
        cx="38"
        cy="35"
        rx="30"
        ry="12"
        fill={accent}
        animate={{ ry: isPlaying && mood === 'normal' ? [12, 10, 12] : 12 }}
        transition={{ duration: 0.5, repeat: isPlaying && mood === 'normal' ? Infinity : 0 }}
      />
      <motion.circle
        cx="64"
        cy="20"
        r="18"
        fill={accent}
        animate={{ cy: isPlaying && mood === 'normal' ? [20, 18, 20] : 20 }}
        transition={{ duration: 0.5, repeat: isPlaying && mood === 'normal' ? Infinity : 0 }}
      />

      {isThrown ? (
        <>
          <path d="M56 14 L64 22 M64 14 L56 22" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 14 L76 22 M76 14 L68 22" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M59 31 Q65 26 71 31" stroke="#171717" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      ) : isSurprised ? (
        <>
          <circle cx="60" cy="18" r="5" fill="#fff" stroke="#171717" strokeWidth="1.5" />
          <circle cx="72" cy="18" r="5" fill="#fff" stroke="#171717" strokeWidth="1.5" />
          <circle cx="60" cy="18" r="2" fill="#171717" />
          <circle cx="72" cy="18" r="2" fill="#171717" />
          <ellipse cx="66" cy="29" rx="4" ry="5" fill="#171717" />
        </>
      ) : (
        <>
          <path d="M54 18 Q58 14 62 18" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M68 18 Q72 14 76 18" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M59 27 Q65 31 71 27" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
        </>
      )}

      <ellipse cx="15" cy="42" rx="6" ry="8" fill={accent} />
      <motion.ellipse
        cx="12"
        cy="28"
        rx="5"
        ry="7"
        fill={accent}
        animate={{ rotate: isPlaying && mood === 'normal' ? [0, 15, -15, 0] : 0 }}
        transition={{ duration: 1, repeat: isPlaying && mood === 'normal' ? Infinity : 0 }}
        style={{ transformOrigin: '12px 35px' }}
      />
    </svg>
  )
}
