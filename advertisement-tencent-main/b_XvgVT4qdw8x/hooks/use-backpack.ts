'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Backpack, Product, UserAction } from '@/lib/types'

const BACKPACK_STORAGE_KEY = 'interactive-ad-backpack'
const ACTIONS_STORAGE_KEY = 'interactive-ad-actions'
const SPENT_POINTS_STORAGE_KEY = 'interactive-ad-spent-points'
const MAX_CAPACITY = 50

export function useBackpack() {
  const [backpack, setBackpack] = useState<Backpack>({
    items: [],
    maxCapacity: MAX_CAPACITY,
  })
  const [userActions, setUserActions] = useState<UserAction[]>([])
  const [spentPoints, setSpentPoints] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedBackpack = window.localStorage.getItem(BACKPACK_STORAGE_KEY)
      if (savedBackpack) setBackpack(JSON.parse(savedBackpack))
    } catch {
      setBackpack({ items: [], maxCapacity: MAX_CAPACITY })
    }

    try {
      const savedActions = window.localStorage.getItem(ACTIONS_STORAGE_KEY)
      if (savedActions) setUserActions(JSON.parse(savedActions))
    } catch {
      setUserActions([])
    }

    try {
      const savedSpentPoints = window.localStorage.getItem(SPENT_POINTS_STORAGE_KEY)
      if (savedSpentPoints) setSpentPoints(Number(savedSpentPoints) || 0)
    } catch {
      setSpentPoints(0)
    }

    setIsInitialized(true)
  }, [])

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return
    window.localStorage.setItem(BACKPACK_STORAGE_KEY, JSON.stringify(backpack))
  }, [backpack, isInitialized])

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return
    window.localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(userActions))
  }, [userActions, isInitialized])

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return
    window.localStorage.setItem(SPENT_POINTS_STORAGE_KEY, String(spentPoints))
  }, [spentPoints, isInitialized])

  const addItem = useCallback((product: Product): boolean => {
    let success = false

    setBackpack(prev => {
      const existingItem = prev.items.find(item => item.product.id === product.id)
      if (existingItem) {
        success = true
        return {
          ...prev,
          items: prev.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }

      if (prev.items.length >= prev.maxCapacity) return prev

      success = true
      return {
        ...prev,
        items: [...prev.items, { product, acquiredAt: Date.now(), quantity: 1 }],
      }
    })

    return success
  }, [])

  const removeItem = useCallback((productId: string) => {
    setBackpack(prev => ({
      ...prev,
      items: prev.items.filter(item => item.product.id !== productId),
    }))
  }, [])

  const clearBackpack = useCallback(() => {
    setBackpack({ items: [], maxCapacity: MAX_CAPACITY })
    setSpentPoints(0)
  }, [])

  const logAction = useCallback((action: Omit<UserAction, 'timestamp'>) => {
    setUserActions(prev => [...prev, { ...action, timestamp: Date.now() }])
  }, [])

  const earnedPoints = useMemo(
    () => backpack.items.reduce((sum, item) => sum + item.product.points * item.quantity, 0),
    [backpack.items]
  )

  const totalPoints = useMemo(() => Math.max(0, earnedPoints - spentPoints), [earnedPoints, spentPoints])

  const spendPoints = useCallback((cost: number) => {
    if (cost <= 0) return true
    let success = false
    setSpentPoints(prev => {
      const available = Math.max(0, earnedPoints - prev)
      if (available < cost) return prev
      success = true
      return prev + cost
    })
    return success
  }, [earnedPoints])

  const exchangeItem = useCallback((targetProduct: Product): boolean => {
    const requirement = targetProduct.exchangeRequirement
    if (!requirement) return false

    let success = false
    setBackpack(prev => {
      const sourceItem = prev.items.find(item => item.product.id === requirement.productId)
      if (!sourceItem || sourceItem.quantity < requirement.quantity) return prev

      const targetItem = prev.items.find(item => item.product.id === targetProduct.id)
      if (!targetItem && prev.items.length >= prev.maxCapacity) return prev

      const nextItems = prev.items
        .map(item => {
          if (item.product.id !== requirement.productId) return item
          const nextQuantity = item.quantity - requirement.quantity
          return { ...item, quantity: nextQuantity }
        })
        .filter(item => item.quantity > 0)

      const targetIndex = nextItems.findIndex(item => item.product.id === targetProduct.id)
      if (targetIndex >= 0) {
        nextItems[targetIndex] = {
          ...nextItems[targetIndex],
          quantity: nextItems[targetIndex].quantity + 1,
        }
      } else {
        nextItems.push({
          product: targetProduct,
          acquiredAt: Date.now(),
          quantity: 1,
        })
      }

      success = true
      return {
        ...prev,
        items: nextItems,
      }
    })

    return success
  }, [])

  return {
    backpack,
    addItem,
    removeItem,
    clearBackpack,
    totalPoints,
    earnedPoints,
    spentPoints,
    spendPoints,
    exchangeItem,
    isFull: backpack.items.length >= backpack.maxCapacity,
    userActions,
    logAction,
  }
}
