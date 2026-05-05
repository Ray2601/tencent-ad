'use client'

import { forwardRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CharacterEmotion, Product } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CharacterProps {
  emotion: CharacterEmotion
  isReceiving?: boolean
  receivedProduct?: Product | null
  className?: string
}

export const Character = forwardRef<HTMLDivElement, CharacterProps>(
  function Character({ emotion, isReceiving = false, receivedProduct, className }, ref) {
    const [showParticles, setShowParticles] = useState(false)

    useEffect(() => {
      if (!receivedProduct) return
      setShowParticles(true)
      const timer = window.setTimeout(() => setShowParticles(false), 1600)
      return () => window.clearTimeout(timer)
    }, [receivedProduct])

    return (
      <div
        ref={ref}
        className={cn('relative flex flex-col items-center justify-center', className)}
      >
        <AnimatePresence>
          {isReceiving && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
            />
          )}
        </AnimatePresence>

        <AnimatePresence>{showParticles && <ParticleEffect />}</AnimatePresence>

        <motion.div
          animate={{
            y: emotion === 'happy' ? [0, -14, 0, -8, 0] : 0,
            scale: isReceiving ? 1.08 : 1,
          }}
          transition={{ duration: 0.7 }}
        >
          <CharacterSvg emotion={emotion} />
        </motion.div>

        <motion.div
          key={emotion}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-lg"
        >
          {getEmotionMessage(emotion)}
        </motion.div>

        <AnimatePresence>
          {receivedProduct && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: -10 }}
              exit={{ opacity: 0, scale: 0.7, y: -30 }}
              className="absolute -top-8 rounded-md bg-yellow-300 px-3 py-1 text-sm font-bold text-slate-950 shadow-lg"
            >
              +{receivedProduct.name}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

function CharacterSvg({ emotion }: { emotion: CharacterEmotion }) {
  const bodyColor = getEmotionBodyColor(emotion)
  const isHappy = emotion === 'happy'
  const isAttacking = emotion === 'attacking'

  return (
    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="drop-shadow-lg">
      <motion.ellipse
        cx="90"
        cy="132"
        rx="45"
        ry="34"
        fill={bodyColor}
        animate={{ ry: isHappy ? [34, 30, 34] : 34 }}
        transition={{ duration: 0.35, repeat: isHappy ? Infinity : 0 }}
      />
      <motion.circle
        cx="90"
        cy="70"
        r="50"
        fill={bodyColor}
        animate={{ cy: isHappy ? [70, 64, 70] : 70 }}
        transition={{ duration: 0.35, repeat: isHappy ? Infinity : 0 }}
      />

      {emotion === 'happy' ? (
        <>
          <path d="M62 61 Q70 54 78 61" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
          <path d="M102 61 Q110 54 118 61" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
          <path d="M65 88 Q90 116 115 88" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="#fff" />
        </>
      ) : emotion === 'surprised' ? (
        <>
          <circle cx="70" cy="61" r="12" fill="#fff" stroke="#171717" strokeWidth="2" />
          <circle cx="110" cy="61" r="12" fill="#fff" stroke="#171717" strokeWidth="2" />
          <circle cx="70" cy="61" r="5" fill="#171717" />
          <circle cx="110" cy="61" r="5" fill="#171717" />
          <ellipse cx="90" cy="95" rx="12" ry="15" fill="#171717" />
        </>
      ) : (
        <>
          <ellipse cx="70" cy="62" rx="8" ry="10" fill="#171717" />
          <ellipse cx="110" cy="62" rx="8" ry="10" fill="#171717" />
          <circle cx="73" cy="58" r="3" fill="#fff" />
          <circle cx="113" cy="58" r="3" fill="#fff" />
          <path d="M70 92 Q90 106 110 92" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      )}

      <motion.ellipse
        cx="35"
        cy="130"
        rx="12"
        ry="20"
        fill={bodyColor}
        animate={{ rotate: isAttacking ? [0, -35, 18, 0] : isHappy ? [0, -14, 14, 0] : 0 }}
        transition={{ duration: isAttacking ? 0.28 : 0.55 }}
        style={{ transformOrigin: '50px 118px' }}
      />
      <motion.ellipse
        cx="145"
        cy="130"
        rx="12"
        ry="20"
        fill={bodyColor}
        animate={{ rotate: isAttacking ? [0, 35, -18, 0] : isHappy ? [0, 14, -14, 0] : 0 }}
        transition={{ duration: isAttacking ? 0.28 : 0.55 }}
        style={{ transformOrigin: '130px 118px' }}
      />
    </svg>
  )
}

function ParticleEffect() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 14 }).map((_, index) => {
        const angle = (Math.PI * 2 * index) / 14
        return (
          <motion.div
            key={index}
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: 0,
              scale: 1,
              x: Math.cos(angle) * 85,
              y: Math.sin(angle) * 85,
            }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-yellow-300"
          />
        )
      })}
    </div>
  )
}

function getEmotionBodyColor(emotion: CharacterEmotion) {
  switch (emotion) {
    case 'happy':
      return '#4ADE80'
    case 'surprised':
      return '#FBBF24'
    case 'attacking':
      return '#F97316'
    case 'bored':
      return '#CBD5E1'
    case 'disgusted':
      return '#94A3B8'
    default:
      return '#A78BFA'
  }
}

function getEmotionMessage(emotion: CharacterEmotion) {
  switch (emotion) {
    case 'happy':
      return '收到了，好开心！'
    case 'surprised':
      return '背包满啦'
    case 'attacking':
      return '瞄准中，发射！'
    case 'bored':
      return '等一个喜欢的礼物...'
    case 'disgusted':
      return '这个不太合适'
    default:
      return '准备收集'
  }
}
