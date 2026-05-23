'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  GripVertical,
  LogOut,
  Star,
  X,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

type GameType = '探秘类' | '射击类' | '收集类' | '标签广告'

interface GameData {
  name: string
  type: GameType
  jumpRate: number    // 跳转外链率
  collectRate: number // 背包收集率
  outfitRate: number  // 穿搭点击率
  adClickRate: number // 广告点击率
  exposure: number
  cost: number
  running: boolean
}

type MetricKey = 'jumpRate' | 'collectRate' | 'outfitRate' | 'adClickRate'

interface MetricDef {
  key: MetricKey
  label: string
  primaryType: GameType
}

// ─── Mock Data ────────────────────────────────────────────────────

const METRICS: MetricDef[] = [
  { key: 'jumpRate', label: '跳转外链率', primaryType: '射击类' },
  { key: 'collectRate', label: '背包收集率', primaryType: '收集类' },
  { key: 'outfitRate', label: '穿搭点击率', primaryType: '探秘类' },
  { key: 'adClickRate', label: '广告点击率', primaryType: '标签广告' },
]

const mockGames: GameData[] = [
  { name: '周媚化妆台', type: '探秘类', jumpRate: 8.2, collectRate: 12.5, outfitRate: 3.1, adClickRate: 5.8, exposure: 3200, cost: 480, running: true },
  { name: '犯罪现场', type: '探秘类', jumpRate: 6.1, collectRate: 9.8, outfitRate: 4.2, adClickRate: 6.5, exposure: 2100, cost: 320, running: false },
  { name: '公主闺房', type: '探秘类', jumpRate: 7.5, collectRate: 11.2, outfitRate: 2.8, adClickRate: 5.1, exposure: 2800, cost: 410, running: true },
  { name: '香水靶场', type: '射击类', jumpRate: 9.1, collectRate: 7.2, outfitRate: 2.5, adClickRate: 4.8, exposure: 4500, cost: 620, running: true },
  { name: '霓虹神射手', type: '射击类', jumpRate: 8.8, collectRate: 6.5, outfitRate: 1.9, adClickRate: 3.7, exposure: 3800, cost: 550, running: true },
  { name: 'VCA宝藏', type: '收集类', jumpRate: 5.2, collectRate: 15.8, outfitRate: 6.2, adClickRate: 7.1, exposure: 1800, cost: 280, running: true },
  { name: '香奈儿橱窗', type: '收集类', jumpRate: 4.9, collectRate: 14.1, outfitRate: 5.5, adClickRate: 6.8, exposure: 1500, cost: 230, running: false },
  { name: '耐克跑鞋标签', type: '标签广告', jumpRate: 10.2, collectRate: 3.5, outfitRate: 2.1, adClickRate: 8.5, exposure: 5200, cost: 720, running: true },
  { name: '苹果手表标签', type: '标签广告', jumpRate: 9.5, collectRate: 4.1, outfitRate: 1.8, adClickRate: 7.9, exposure: 4900, cost: 680, running: true },
]

const SIDEBAR_ITEMS = [
  { label: '营销内容', icon: '🎯' },
  { label: '广告版位', icon: '📺' },
  { label: '定向', icon: '🎯' },
  { label: '出价与预算', icon: '💰' },
  { label: '广告设置', icon: '⚙️' },
  { label: '互动广告', icon: '🎮', active: true },
  { label: '帮助中心', icon: '❓' },
]

const TEST_SCALES = [50, 100, 1000, 10000] as const
const COST_PER_PERSON = 0.05

// ─── Page Component ───────────────────────────────────────────────

export default function AdvertiserPage() {
  // ── 低预算试错 ──
  const [testScale, setTestScale] = useState<number>(100)
  const [testScaleOpen, setTestScaleOpen] = useState(false)

  // ── 精准转化 ──
  const [conversionMode, setConversionMode] = useState<'auto' | 'manual'>('auto')
  const [manualTypes, setManualTypes] = useState<Set<GameType>>(new Set(['收集类', '射击类', '探秘类', '标签广告']))

  // ── 快速复盘 ──
  const [checkedMetrics, setCheckedMetrics] = useState<Set<MetricKey>>(
    new Set(['jumpRate', 'collectRate', 'adClickRate'])
  )
  const [expandedTypes, setExpandedTypes] = useState<Set<GameType>>(new Set(['探秘类']))
  const [columnOrder, setColumnOrder] = useState<MetricKey[]>(['jumpRate', 'collectRate', 'outfitRate', 'adClickRate'])
  const [dragKey, setDragKey] = useState<MetricKey | null>(null)
  const [dragOverKey, setDragOverKey] = useState<MetricKey | null>(null)
  const [games, setGames] = useState<GameData[]>(mockGames)

  // ── 满意度弹窗 ──
  type SurveyStep = 'closed' | 'q1' | 'q2-rate' | 'q2-suggest' | 'done'
  const [surveyStep, setSurveyStep] = useState<SurveyStep>('closed')
  const [surveyRating, setSurveyRating] = useState(0)
  const [surveySuggestion, setSurveySuggestion] = useState('')

  // ── 投放规则 ──
  type DeliveryMode = 'auto' | 'tag' | 'manual'
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('auto')

  const estimatedCost = (testScale * COST_PER_PERSON).toFixed(0)

  // Toggle game type expand
  const toggleTypeExpand = (type: GameType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  // Toggle metric check
  const toggleMetric = (key: MetricKey) => {
    setCheckedMetrics(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Toggle manual type
  const toggleManualType = (type: GameType) => {
    setManualTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  // Toggle game running
  const toggleGameRunning = (name: string) => {
    setGames(prev => prev.map(g => g.name === name ? { ...g, running: !g.running } : g))
  }

  // Drag column order
  const handleDragStart = (key: MetricKey) => setDragKey(key)
  const handleDragOver = (e: React.DragEvent, key: MetricKey) => {
    e.preventDefault()
    setDragOverKey(key)
  }
  const handleDragLeave = () => setDragOverKey(null)
  const handleDrop = (key: MetricKey) => {
    if (!dragKey || dragKey === key) { setDragKey(null); setDragOverKey(null); return }
    setColumnOrder(prev => {
      const next = [...prev]
      const from = next.indexOf(dragKey)
      const to = next.indexOf(key)
      next.splice(from, 1)
      next.splice(to, 0, dragKey)
      return next
    })
    setDragKey(null)
    setDragOverKey(null)
  }

  // Group games by type
  const gamesByType = useMemo(() => {
    const map = new Map<GameType, GameData[]>()
    games.forEach(g => {
      const arr = map.get(g.type) || []
      arr.push(g)
      map.set(g.type, arr)
    })
    return map
  }, [games])

  // Average per type
  const avgByType = useMemo(() => {
    const map = new Map<GameType, Record<MetricKey, number>>()
    gamesByType.forEach((gs, type) => {
      const n = gs.length
      const avgs = {
        jumpRate: parseFloat((gs.reduce((s, g) => s + g.jumpRate, 0) / n).toFixed(1)),
        collectRate: parseFloat((gs.reduce((s, g) => s + g.collectRate, 0) / n).toFixed(1)),
        outfitRate: parseFloat((gs.reduce((s, g) => s + g.outfitRate, 0) / n).toFixed(1)),
        adClickRate: parseFloat((gs.reduce((s, g) => s + g.adClickRate, 0) / n).toFixed(1)),
      }
      map.set(type, avgs)
    })
    return map
  }, [gamesByType])

  // Today's summary
  const todayCost = games.reduce((s, g) => s + g.cost, 0)
  const todayExposure = games.reduce((s, g) => s + g.exposure, 0)
  const avgClickRate = parseFloat((games.reduce((s, g) => s + g.adClickRate, 0) / games.length).toFixed(1))

  // Cost per game type
  const costByType = useMemo(() => {
    const map = new Map<GameType, number>()
    gamesByType.forEach((gs, type) => {
      map.set(type, gs.reduce((s, g) => s + g.cost, 0))
    })
    return map
  }, [gamesByType])

  const totalRunningCost = games.filter(g => g.running).reduce((s, g) => s + g.cost, 0)
  const manualModeCost = (['收集类', '射击类', '探秘类', '标签广告'] as GameType[])
    .filter(t => manualTypes.has(t))
    .reduce((s, t) => s + (costByType.get(t) || 0), 0)

  // Compare with average
  const compareAvg = (value: number, avg: number): 'up' | 'down' | 'equal' => {
    if (value > avg + 0.05) return 'up'
    if (value < avg - 0.05) return 'down'
    return 'equal'
  }

  const formatRate = (v: number) => `${v.toFixed(1)}%`

  const getMetricValue = (game: GameData, key: MetricKey): number => game[key]

  return (
    <main className="flex h-screen bg-[#0d0e12] text-white overflow-hidden">

      {/* ── Left Sidebar ────────────────────────────────────── */}
      <aside className="w-56 shrink-0 border-r border-white/10 bg-[#111317] flex flex-col">
        <a href="/" className="flex h-16 items-center gap-2 border-b border-white/10 px-5 text-lg font-black tracking-tight text-white hover:text-amber-400 transition-colors">
          ← 腾讯视频
        </a>
        <nav className="flex-1 py-3">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 px-5 py-3 text-sm transition ${
                item.active
                  ? 'bg-amber-500/10 border-r-2 border-amber-400 text-amber-300 font-bold'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main Area ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-[#111317] px-6">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm text-white/50">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="搜索广告系列/活动"
              className="flex-1 bg-transparent text-white placeholder:text-white/35 outline-none"
            />
          </div>
          <button className="relative rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white transition">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <span className="text-sm font-medium text-white/80">广告主名称</span>
            <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-white/55 hover:bg-white/10 hover:text-red-400 transition">
              <LogOut className="h-4 w-4" />
              退出
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">

            {/* ── Header Stats ── */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-[#1a1c22] p-4">
                <div className="text-xs text-white/45">今日消耗</div>
                <div className="mt-1 text-2xl font-black text-amber-400">¥{todayCost.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#1a1c22] p-4">
                <div className="text-xs text-white/45">曝光</div>
                <div className="mt-1 text-2xl font-black text-white">{(todayExposure / 10000).toFixed(1)}w</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#1a1c22] p-4">
                <div className="text-xs text-white/45">点击率</div>
                <div className="mt-1 text-2xl font-black text-emerald-400">{avgClickRate.toFixed(1)}%</div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* 一、低预算试错                                       */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-xs text-amber-400">一</span>
                低预算试错
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm text-white/65">测试规模：</span>
                <div className="relative">
                  <button
                    onClick={() => setTestScaleOpen(!testScaleOpen)}
                    className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition min-w-[120px]"
                  >
                    {testScale >= 10000 ? `${testScale / 10000}w人` : `${testScale}人`}
                    <ChevronDown className={`h-4 w-4 text-white/40 transition ${testScaleOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {testScaleOpen && (
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/15 bg-[#22252d] shadow-xl">
                      {TEST_SCALES.map(s => (
                        <button
                          key={s}
                          onClick={() => { setTestScale(s); setTestScaleOpen(false) }}
                          className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition ${
                            testScale === s ? 'text-amber-400 font-bold' : 'text-white/75'
                          }`}
                        >
                          {s >= 10000 ? `${s / 10000}w人` : `${s}人`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-sm text-white/65">
                  预估费用：<span className="font-bold text-amber-400">¥{estimatedCost}</span>
                </span>
                <button className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-black hover:bg-amber-400 transition ml-auto">
                  开始测试
                </button>
              </div>
            </section>

            {/* ══════════════════════════════════════════════════ */}
            {/* 二、精准转化                                        */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs text-emerald-400">二</span>
                精准转化
              </h2>

              {/* Auto mode */}
              <label className="flex items-start gap-3 mb-4 cursor-pointer group">
                <input
                  type="radio"
                  name="conversionMode"
                  checked={conversionMode === 'auto'}
                  onChange={() => setConversionMode('auto')}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-sm font-bold group-hover:text-amber-300 transition">自动模式</div>
                  <div className="text-xs text-white/50 mt-0.5">全品类 A/B test，自动投放所有互动类型对比效果</div>
                  <div className="text-xs font-bold text-amber-400 mt-1">预估日耗：¥{totalRunningCost.toLocaleString()}</div>
                </div>
              </label>

              {/* Manual mode */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="conversionMode"
                  checked={conversionMode === 'manual'}
                  onChange={() => setConversionMode('manual')}
                  className="mt-0.5 accent-amber-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-bold group-hover:text-amber-300 transition">手动模式</div>
                  <div className="text-xs text-white/50 mt-0.5 mb-1">广告主勾选投放类型</div>
                  <div className="text-xs font-bold text-amber-400 mb-3">预估日耗：¥{manualModeCost.toLocaleString()}</div>

                  {conversionMode === 'manual' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-wrap gap-3"
                    >
                      {(['收集类', '射击类', '探秘类', '标签广告'] as GameType[]).map(type => {
                        const typeCost = costByType.get(type) || 0
                        return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={manualTypes.has(type)}
                            onChange={() => toggleManualType(type)}
                            className="accent-amber-500"
                          />
                          <span className="text-sm text-white/80">{type}</span>
                          <span className="text-xs text-amber-400/70 font-medium">¥{typeCost}</span>
                        </label>
                      )})}
                    </motion.div>
                  )}
                </div>
              </label>

              <button className="mt-5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-2.5 text-sm font-bold text-black hover:from-amber-400 hover:to-orange-400 transition">
                开始投放
              </button>
            </section>

            {/* ══════════════════════════════════════════════════ */}
            {/* 三、快速复盘                                        */}
            {/* ══════════════════════════════════════════════════ */}
            <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-500/20 text-xs text-blue-400">三</span>
                快速复盘
              </h2>

              {/* ── 1. 实时数据看板 ── */}
              <div className="mb-6 rounded-lg border border-white/8 bg-white/[0.02] p-4">
                <div className="text-sm font-bold mb-3 text-white/70">📊 实时数据看板</div>
                <div className="flex flex-wrap gap-4">
                  {METRICS.map(metric => (
                    <label
                      key={metric.key}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition ${
                        checkedMetrics.has(metric.key)
                          ? 'border-amber-400/40 bg-amber-500/10 text-amber-200'
                          : 'border-white/8 bg-white/5 text-white/45 hover:border-white/15'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checkedMetrics.has(metric.key)}
                        onChange={() => toggleMetric(metric.key)}
                        className="accent-amber-500"
                      />
                      <span className="text-sm font-medium">{metric.label}</span>
                      <span className="text-xs font-bold ml-1">
                        {formatRate(games.reduce((s, g) => s + g[metric.key], 0) / games.length)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ── 2. 按游戏类型分组 ── */}
              <div className="mb-6">
                <div className="text-sm font-bold mb-3 text-white/70">📋 按游戏类型分组（点击展开）</div>

                {(['探秘类', '射击类', '收集类', '标签广告'] as GameType[]).map(type => {
                  const typeGames = gamesByType.get(type) || []
                  const isExpanded = expandedTypes.has(type)
                  const avgs = avgByType.get(type)!

                  return (
                    <div key={type} className="mb-3 rounded-lg border border-white/8 bg-white/[0.02] overflow-hidden">
                      <button
                        onClick={() => toggleTypeExpand(type)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
                      >
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-white/50" /> : <ChevronRight className="h-4 w-4 text-white/50" />}
                        <span className="text-sm font-bold">{type}游戏</span>
                        <span className="text-xs text-white/45">（{typeGames.length}个）</span>
                        <span className="ml-auto text-xs font-bold text-amber-400">¥{(costByType.get(type) || 0).toLocaleString()}</span>
                      </button>

                      {isExpanded && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-4 overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-white/10 text-xs text-white/45">
                                <th className="py-2 text-left font-medium">游戏名称</th>
                                {columnOrder.map(key => {
                                  const def = METRICS.find(m => m.key === key)!
                                  return (
                                    <th key={key} className="py-2 text-right font-medium">
                                      {def.label}
                                    </th>
                                  )
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {typeGames.map(game => (
                                <tr key={game.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                                  <td className="py-2.5 font-medium">{game.name}</td>
                                  {columnOrder.map(key => {
                                    const val = getMetricValue(game, key)
                                    const cmp = compareAvg(val, avgs[key])
                                    return (
                                      <td key={key} className="py-2.5 text-right tabular-nums">
                                        <span className={
                                          cmp === 'up' ? 'text-emerald-400' : cmp === 'down' ? 'text-red-400' : 'text-white/60'
                                        }>
                                          {formatRate(val)}
                                          {cmp === 'up' && ' ↑'}
                                          {cmp === 'down' && ' ↓'}
                                        </span>
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                              {/* Average row */}
                              <tr className="bg-white/[0.03] font-bold">
                                <td className="py-2.5 text-amber-300">平均值</td>
                                {columnOrder.map(key => (
                                  <td key={key} className="py-2.5 text-right tabular-nums text-amber-300">
                                    {formatRate(avgs[key])}
                                  </td>
                                ))}
                              </tr>
                            </tbody>
                          </table>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── 3. 列优先顺序 ── */}
              <div className="mb-6 rounded-lg border border-white/8 bg-white/[0.02] p-4">
                <div className="text-sm font-bold mb-3 text-white/70 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-white/40" />
                  列优先顺序（拖动调整）
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {columnOrder.map((key, idx) => {
                    const def = METRICS.find(m => m.key === key)!
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={() => handleDragStart(key)}
                        onDragOver={(e) => handleDragOver(e, key)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(key)}
                        onDragEnd={() => { setDragKey(null); setDragOverKey(null) }}
                        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium cursor-grab active:cursor-grabbing transition select-none ${
                          dragOverKey === key && dragKey !== key
                            ? 'border-amber-400/60 bg-amber-500/15 scale-105'
                            : dragKey === key
                            ? 'border-amber-400 bg-amber-500/20 scale-95 opacity-50'
                            : 'border-white/15 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <span className="text-white/35 text-[10px]">{idx + 1}</span>
                        <span className="text-white/80">{def.label}</span>
                        <span className="text-white/35">→ {def.primaryType}</span>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-xs text-white/40">
                  优先级第一的指标将作为自动扩量的依据
                </p>
              </div>

              {/* ── 4. 投放规则（三选一） ── */}
              <div className="mb-6 rounded-lg border border-white/8 bg-white/[0.02] p-4">
                <div className="text-sm font-bold mb-4 text-white/70">🎯 投放规则</div>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                    deliveryMode === 'auto' ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/8 hover:border-white/15'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'auto'}
                      onChange={() => setDeliveryMode('auto')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="text-sm font-bold">自动投放</div>
                      <div className="text-xs text-white/50 mt-0.5">
                        曝光 ≥ 1000 人时自动按优先级第一的指标扩量（该指标高于平均值的游戏优先获得预算）
                      </div>
                      <div className="text-xs font-bold text-amber-400 mt-1">预估日耗：¥{totalRunningCost.toLocaleString()}</div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                    deliveryMode === 'tag' ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/8 hover:border-white/15'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'tag'}
                      onChange={() => setDeliveryMode('tag')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="text-sm font-bold">按 Tag 投放</div>
                      <div className="text-xs text-white/50 mt-0.5">
                        喜欢收集 → 收集类 &nbsp;|&nbsp; 喜欢射击 → 射击类 &nbsp;|&nbsp; 喜欢剧情 → 探秘类
                      </div>
                      <div className="text-xs font-bold text-amber-400 mt-1">预估日耗：¥{Math.round(totalRunningCost * 0.7).toLocaleString()}</div>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition ${
                    deliveryMode === 'manual' ? 'border-amber-400/40 bg-amber-500/10' : 'border-white/8 hover:border-white/15'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryMode"
                      checked={deliveryMode === 'manual'}
                      onChange={() => setDeliveryMode('manual')}
                      className="mt-0.5 accent-amber-500"
                    />
                    <div>
                      <div className="text-sm font-bold">手动投放</div>
                      <div className="text-xs text-white/50 mt-0.5">
                        广告主观测数据后自己决定投放策略
                      </div>
                      <div className="text-xs font-bold text-amber-400 mt-1">预估日耗：¥{totalRunningCost.toLocaleString()}</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* ── 5. 游戏管理（仅手动模式） ── */}
              {deliveryMode === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 rounded-lg border border-white/8 bg-white/[0.02] p-4"
                >
                  <div className="text-sm font-bold mb-1 text-white/70">✅ 勾选继续投放的游戏</div>
                  <div className="text-xs text-amber-400 font-bold mb-3">勾选游戏日耗合计：¥{totalRunningCost.toLocaleString()}</div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {games.map(game => {
                      const typeAvgs = avgByType.get(game.type)!
                      const primaryKey = columnOrder[0]
                      const primaryMetric = METRICS.find(m => m.key === primaryKey)!
                      const isBelowAvg = compareAvg(game[primaryKey], typeAvgs[primaryKey]) === 'down'

                      return (
                        <label
                          key={game.name}
                          className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition ${
                            game.running
                              ? 'border-white/10 bg-white/5 hover:border-amber-400/30'
                              : 'border-white/5 bg-white/[0.01]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={game.running}
                            onChange={() => toggleGameRunning(game.name)}
                            className="accent-amber-500"
                          />
                          <span className="text-sm flex-1">{game.name}</span>
                          <span className="text-xs text-white/40">{game.type}</span>
                          <span className="text-xs text-amber-400/80 font-medium">¥{game.cost}</span>
                          <span className={`text-xs font-bold ${isBelowAvg ? 'text-red-400' : 'text-emerald-400'}`}>
                            {primaryMetric.label} {formatRate(game[primaryKey])}
                            {isBelowAvg ? ' ↓' : ' ↑'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* 应用变更按钮 */}
              <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4">
                <button
                  onClick={() => setSurveyStep('q1')}
                  className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition"
                >
                  应用变更
                </button>
              </div>

            </section>

          </div>
        </div>
      </div>
      {/* ── 满意度弹窗 ──────────────────────────────────── */}
      <AnimatePresence>
        {surveyStep !== 'closed' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => surveyStep === 'done' && setSurveyStep('closed')}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#1e2030] p-8 text-white shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setSurveyStep('closed')}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-white/35 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* ── Step: q1 ── */}
              {surveyStep === 'q1' && (
                <div className="text-center">
                  <div className="mb-2 text-xs font-bold tracking-wider text-amber-400 uppercase">满意度反馈</div>
                  <div className="text-xl font-bold mb-8">问题1：反馈面板有用吗？</div>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setSurveyStep('q2-rate')}
                      className="rounded-xl bg-emerald-500/15 border border-emerald-400/30 px-10 py-4 text-lg font-bold text-emerald-300 hover:bg-emerald-500/25 hover:scale-105 active:scale-95 transition"
                    >
                      有用
                    </button>
                    <button
                      onClick={() => setSurveyStep('q2-suggest')}
                      className="rounded-xl bg-red-500/15 border border-red-400/30 px-10 py-4 text-lg font-bold text-red-300 hover:bg-red-500/25 hover:scale-105 active:scale-95 transition"
                    >
                      无用
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step: q2-rate (有用 → 星级评分) ── */}
              {surveyStep === 'q2-rate' && (
                <div className="text-center">
                  <div className="mb-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">感谢您的认可</div>
                  <div className="text-xl font-bold mb-2">问题2：投流效果如何？</div>
                  <p className="mb-8 text-sm text-white/50">请为投放效果打分</p>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setSurveyRating(n)}
                        className="transition hover:scale-110 active:scale-90"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            n <= surveyRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-white/20 hover:text-amber-400/50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setSurveyStep('done')}
                    disabled={surveyRating === 0}
                    className={`rounded-xl px-10 py-3 text-sm font-bold transition ${
                      surveyRating > 0
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    提交
                  </button>
                </div>
              )}

              {/* ── Step: q2-suggest (无用 → 建议) ── */}
              {surveyStep === 'q2-suggest' && (
                <div className="text-center">
                  <div className="mb-2 text-xs font-bold tracking-wider text-red-400 uppercase">我们很抱歉</div>
                  <div className="text-xl font-bold mb-2">请写下您的建议：</div>
                  <p className="mb-6 text-sm text-white/50">帮助我们做得更好</p>
                  <textarea
                    value={surveySuggestion}
                    onChange={e => setSurveySuggestion(e.target.value)}
                    placeholder="请输入您的建议…"
                    rows={5}
                    className="mb-6 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-amber-400/50 resize-none"
                  />
                  <button
                    onClick={() => setSurveyStep('done')}
                    disabled={!surveySuggestion.trim()}
                    className={`rounded-xl px-10 py-3 text-sm font-bold transition ${
                      surveySuggestion.trim()
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-white/10 text-white/30 cursor-not-allowed'
                    }`}
                  >
                    提交
                  </button>
                </div>
              )}

              {/* ── Step: done ── */}
              {surveyStep === 'done' && (
                <div className="text-center py-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <div className="text-xl font-bold text-white">谢谢您的反馈！</div>
                  <p className="mt-2 text-sm text-white/50">您的意见将帮助我们优化投放体验</p>
                  <button
                    onClick={() => {
                      setSurveyStep('closed')
                      setSurveyRating(0)
                      setSurveySuggestion('')
                    }}
                    className="mt-6 rounded-xl bg-white/10 px-8 py-2.5 text-sm font-medium text-white/80 hover:bg-white/15 transition"
                  >
                    关闭
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
