'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, Search } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────

interface HotComment {
  rank: number
  content: string
  likes: string
  product: string
  brand: string
}

interface AdData {
  advertiser: string
  type: string
  cost: string
  exposure: string
  clickRate: string
  collectRate: string
  status: string
}

type NavPage = '小人造型' | '数据看板'

// ─── Mock Data ────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { label: NavPage | string; icon: string }[] = [
  { label: '数据看板', icon: '📊' },
  { label: '剧集管理', icon: '🎮' },
  { label: '广告管理', icon: '📢' },
  { label: '小人造型', icon: '🎨' },
  { label: '反馈管理', icon: '📋' },
  { label: '设置', icon: '⚙️' },
]

const EPISODES = ['爱情没有神话', '热播榜', '即将上线']

const mockComments: HotComment[] = [
  { rank: 1, content: '"周媚的化妆台太好看了！"', likes: '12.3w', product: '香奈儿香水', brand: 'chanel' },
  { rank: 2, content: '"渣男去死！红色指甲油绝了"', likes: '8.7w', product: 'CandyMoyo 红色指甲油', brand: 'candymoyo' },
  { rank: 3, content: '"这个项链想要同款"', likes: '6.2w', product: '梵克雅宝四叶草项链', brand: 'vancleefarpels' },
  { rank: 4, content: '"香水瓶好精致"', likes: '4.5w', product: '香奈儿迷你香水瓶', brand: 'chanel' },
]

const mockAdData: AdData[] = [
  { advertiser: '香奈儿', type: '探秘类', cost: '¥5,234', exposure: '12.3w', clickRate: '5.8%', collectRate: '12.5%', status: '投放中' },
  { advertiser: 'CandyMoyo', type: '收集类', cost: '¥3,120', exposure: '8.7w', clickRate: '7.2%', collectRate: '18.3%', status: '已结束' },
  { advertiser: '梵克雅宝', type: '射击类', cost: '¥8,456', exposure: '15.2w', clickRate: '4.9%', collectRate: '8.2%', status: '投放中' },
]

// Satisfaction trend (last 7 days)
const satisfactionTrend = [3.8, 4.1, 4.0, 4.3, 4.5, 4.2, 4.6]
const DAY_LABELS = ['5/17', '5/18', '5/19', '5/20', '5/21', '5/22', '5/23']

// ─── Page ─────────────────────────────────────────────────────────

export default function PlatformPage() {
  const [activePage, setActivePage] = useState<NavPage>('小人造型')
  const [selectedEpisode, setSelectedEpisode] = useState(EPISODES[0])
  const [episodeOpen, setEpisodeOpen] = useState(false)
  const [designComment, setDesignComment] = useState<HotComment | null>(null)

  const handleDesign = (comment: HotComment) => {
    setDesignComment(comment)
  }

  return (
    <main className="flex h-screen bg-[#0d0e12] text-white overflow-hidden">

      {/* ── Left Sidebar ────────────────────────────────────── */}
      <aside className="w-52 shrink-0 border-r border-white/10 bg-[#111317] flex flex-col">
        <a href="/" className="flex h-16 items-center gap-2 border-b border-white/10 px-5 text-base font-black tracking-tight text-white hover:text-sky-400 transition-colors">
          ← 腾讯视频
        </a>
        <nav className="flex-1 py-3">
          {SIDEBAR_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => setActivePage(item.label as NavPage)}
              className={`flex w-full items-center gap-3 px-5 py-3 text-sm transition ${
                activePage === item.label
                  ? 'bg-sky-500/10 border-r-2 border-sky-400 text-sky-300 font-bold'
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
          <div className="text-lg font-bold text-white/90">{activePage}</div>
          <div className="ml-auto flex items-center gap-3">
            <button className="relative rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white transition">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <span className="text-sm font-medium text-white/80">管理员</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activePage === '小人造型' ? (
              <CharacterDesignPage
                key="character"
                selectedEpisode={selectedEpisode}
                setSelectedEpisode={setSelectedEpisode}
                episodeOpen={episodeOpen}
                setEpisodeOpen={setEpisodeOpen}
                designComment={designComment}
                onDesign={handleDesign}
              />
            ) : (
              <DataDashboardPage key="dashboard" />
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

// ══════════════════════════════════════════════════════════════════
// 页面一：小人造型（功能一：剧集热点抓取 & 小人造型设计）
// ══════════════════════════════════════════════════════════════════

function CharacterDesignPage({
  selectedEpisode, setSelectedEpisode, episodeOpen, setEpisodeOpen,
  designComment, onDesign,
}: {
  selectedEpisode: string
  setSelectedEpisode: (v: string) => void
  episodeOpen: boolean
  setEpisodeOpen: (v: boolean) => void
  designComment: HotComment | null
  onDesign: (c: HotComment) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* 一、剧集热点抓取 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-sky-500/20 text-xs text-sky-400">一</span>
          剧集热点抓取
        </h2>

        {/* Episode selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-white/65">选择剧集：</span>
          <div className="relative">
            <button
              onClick={() => setEpisodeOpen(!episodeOpen)}
              className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10 transition min-w-[140px]"
            >
              {selectedEpisode}
              <ChevronDown className={`h-4 w-4 text-white/40 transition ${episodeOpen ? 'rotate-180' : ''}`} />
            </button>
            {episodeOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/15 bg-[#22252d] shadow-xl">
                {EPISODES.map(ep => (
                  <button
                    key={ep}
                    onClick={() => { setSelectedEpisode(ep); setEpisodeOpen(false) }}
                    className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition ${
                      selectedEpisode === ep ? 'text-sky-400 font-bold' : 'text-white/75'
                    }`}
                  >
                    {ep}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="py-3 text-left font-medium w-16">排名</th>
                <th className="py-3 text-left font-medium">弹幕内容</th>
                <th className="py-3 text-right font-medium w-24">点赞数</th>
                <th className="py-3 text-right font-medium w-36">关联商品</th>
                <th className="py-3 text-center font-medium w-28">操作</th>
              </tr>
            </thead>
            <tbody>
              {mockComments.map(comment => (
                <tr key={comment.rank} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                      comment.rank <= 3 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-white/45'
                    }`}>
                      {comment.rank}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{comment.content}</td>
                  <td className="py-3 text-right tabular-nums text-white/70">{comment.likes}</td>
                  <td className="py-3 text-right text-white/60">{comment.product}</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onDesign(comment)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        designComment?.rank === comment.rank
                          ? 'bg-sky-500 text-white'
                          : 'bg-sky-500/15 text-sky-300 hover:bg-sky-500/30'
                      }`}
                    >
                      设计造型
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 二、小人造型设计 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-pink-500/20 text-xs text-pink-400">二</span>
          小人造型设计
        </h2>

        {designComment ? (
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">👗</span>
              <span className="text-white/65">服装：</span>
              <span className="font-bold text-white">
                {designComment.rank <= 2 ? '红色旗袍' : '时尚套装'}
                <span className="ml-2 text-xs text-white/40">（来自弹幕#{designComment.rank}）</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">💄</span>
              <span className="text-white/65">配饰：</span>
              <span className="font-bold text-white">
                {designComment.brand === 'candymoyo' ? '红色指甲油' : '精致妆容'}
                <span className="ml-2 text-xs text-white/40">（来自弹幕#{designComment.rank}）</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-2xl">💎</span>
              <span className="text-white/65">首饰：</span>
              <span className="font-bold text-white">
                {designComment.brand === 'vancleefarpels' ? '四叶草项链' : designComment.brand === 'chanel' ? '香奈儿吊坠' : '品牌饰品'}
                <span className="ml-2 text-xs text-white/40">（来自弹幕#{designComment.rank}）</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/35">
            点击上方弹幕的"设计造型"按钮，为小人搭配同款造型
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            disabled={!designComment}
            className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${
              designComment
                ? 'bg-sky-500 text-white hover:bg-sky-400'
                : 'bg-white/5 text-white/25 cursor-not-allowed'
            }`}
          >
            预览小人造型
          </button>
          <button
            disabled={!designComment}
            className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${
              designComment
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400'
                : 'bg-white/5 text-white/25 cursor-not-allowed'
            }`}
          >
            发布到广告
          </button>
          <button
            disabled={!designComment}
            className={`rounded-lg px-6 py-2.5 text-sm font-bold transition ${
              designComment
                ? 'border border-white/20 bg-white/5 text-white/80 hover:bg-white/10'
                : 'bg-white/5 text-white/25 cursor-not-allowed'
            }`}
          >
            保存为模板
          </button>
        </div>

        {/* Hint */}
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-400/20 px-4 py-3">
          <span className="text-amber-400 text-sm">💡</span>
          <p className="text-sm text-amber-300/80">提示：粉丝愿意为爱豆打投，玩小游戏收集爱豆同款商品</p>
        </div>
      </section>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 页面二：数据看板（功能二：广告投放数据收集）
// ══════════════════════════════════════════════════════════════════

function DataDashboardPage() {
  // Chart dimensions
  const CHART_W = 600
  const CHART_H = 160
  const PAD_L = 40
  const PAD_R = 20
  const PAD_T = 15
  const PAD_B = 25
  const plotW = CHART_W - PAD_L - PAD_R
  const plotH = CHART_H - PAD_T - PAD_B

  const minVal = 3.5
  const maxVal = 5.0
  const range = maxVal - minVal

  const points = satisfactionTrend.map((v, i) => ({
    x: PAD_L + (i / (satisfactionTrend.length - 1)) * plotW,
    y: PAD_T + plotH - ((v - minVal) / range) * plotH,
    v,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  // Fill path
  const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${PAD_T + plotH} L ${points[0].x.toFixed(1)} ${PAD_T + plotH} Z`

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      {/* 广告投放数据收集 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-emerald-500/20 text-xs text-emerald-400">📊</span>
          广告商投放数据表
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="py-3 text-left font-medium">广告商</th>
                <th className="py-3 text-left font-medium">投放类型</th>
                <th className="py-3 text-right font-medium">消耗金额</th>
                <th className="py-3 text-right font-medium">曝光量</th>
                <th className="py-3 text-right font-medium">点击率</th>
                <th className="py-3 text-right font-medium">收集率</th>
                <th className="py-3 text-center font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {mockAdData.map(row => (
                <tr key={row.advertiser} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 font-bold">{row.advertiser}</td>
                  <td className="py-3 text-white/70">{row.type}</td>
                  <td className="py-3 text-right tabular-nums text-amber-400 font-medium">{row.cost}</td>
                  <td className="py-3 text-right tabular-nums text-white/70">{row.exposure}</td>
                  <td className="py-3 text-right tabular-nums text-white/70">{row.clickRate}</td>
                  <td className="py-3 text-right tabular-nums text-emerald-400 font-medium">{row.collectRate}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      row.status === '投放中'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-white/10 text-white/45'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 满意度趋势图 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-xs text-purple-400">📈</span>
          满意度趋势图
        </h2>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full max-w-[600px]" style={{ maxHeight: 200 }}>
            {/* Grid lines */}
            {[3.5, 4.0, 4.5, 5.0].map(v => {
              const y = PAD_T + plotH - ((v - minVal) / range) * plotH
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="white" strokeOpacity={0.06} />
                  <text x={PAD_L - 8} y={y + 4} textAnchor="end" fill="white" fillOpacity={0.35} fontSize={10}>
                    {v.toFixed(1)}
                  </text>
                </g>
              )
            })}

            {/* X labels */}
            {DAY_LABELS.map((d, i) => {
              const x = PAD_L + (i / (DAY_LABELS.length - 1)) * plotW
              return (
                <text key={d} x={x} y={CHART_H - 4} textAnchor="middle" fill="white" fillOpacity={0.35} fontSize={9}>
                  {d}
                </text>
              )
            })}

            {/* Fill area */}
            <path d={fillPath} fill="url(#grad)" opacity={0.25} />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Dots */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="#0d0e12" stroke="#38bdf8" strokeWidth={2} />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="white" fillOpacity={0.8} fontSize={10} fontWeight="bold">
                  {p.v.toFixed(1)}
                </text>
              </g>
            ))}

            {/* Gradient def */}
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </motion.div>
  )
}
