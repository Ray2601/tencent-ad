'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ChevronDown, Download, MessageSquare, Search, Star, X } from 'lucide-react'

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

interface AdvertiserFeedback {
  id: number
  advertiser: string
  brand: string
  avatar: string
  content: string
  date: string
  tag: string
}

interface FeedbackItem {
  id: number
  advertiser: string
  rating: number
  content: string
  status: '待处理' | '已读' | '处理中' | '已采纳'
  date: string
}

type NavPage = '小人造型' | '数据看板' | '反馈管理'

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

const mockFeedbacks: AdvertiserFeedback[] = [
  {
    id: 1,
    advertiser: '香奈儿',
    brand: 'chanel',
    avatar: 'C',
    content: '探秘类广告的穿搭点击率偏低，建议优化小人造型的服装搭配，换一批更吸引女性用户的款式，我们可以配合推出联名款。',
    date: '2026-05-23',
    tag: '投放优化',
  },
  {
    id: 2,
    advertiser: 'CandyMoyo',
    brand: 'candymoyo',
    avatar: 'M',
    content: '收集类效果不错但跳转外链率偏低，希望能在收集成功后增加一键跳转店铺的入口，缩短转化路径。',
    date: '2026-05-23',
    tag: '功能建议',
  },
  {
    id: 3,
    advertiser: '梵克雅宝',
    brand: 'vancleefarpels',
    avatar: 'V',
    content: '射击类广告曝光量很大但收集率只有8.2%，能否在射击命中后增加弹窗展示商品详情，让用户了解更多产品信息再决定是否收集。',
    date: '2026-05-22',
    tag: '体验优化',
  },
  {
    id: 4,
    advertiser: '香奈儿',
    brand: 'chanel',
    avatar: 'C',
    content: '满意度趋势连涨两天后昨天略有回落，建议排查5/22当天是否有技术问题导致广告加载慢，我们有用户反馈页面卡顿。',
    date: '2026-05-22',
    tag: '问题反馈',
  },
]

const mockFeedbackItems: FeedbackItem[] = [
  {
    id: 1,
    advertiser: '香奈儿',
    rating: 4.0,
    content: '射击游戏命中判定太严格了，我们的香水瓶经常点不中，用户反馈体验不好，建议放宽判定范围。',
    status: '待处理',
    date: '2026-05-23',
  },
  {
    id: 2,
    advertiser: 'CandyMoyo',
    rating: 5.0,
    content: '收集类游戏很好玩，用户留存率高，指甲油颜色也很受欢迎，下次还想合作！',
    status: '已读',
    date: '2026-05-23',
  },
  {
    id: 3,
    advertiser: '梵克雅宝',
    rating: 3.0,
    content: '放大镜效果不够明显，很多用户不知道要点哪里，建议增加引导提示或加大高亮区域。',
    status: '处理中',
    date: '2026-05-22',
  },
  {
    id: 4,
    advertiser: '香奈儿',
    rating: 4.5,
    content: '标签广告的转化效果超出预期，建议下一期增加更多品牌联名标签，我们愿意加大投放预算。',
    status: '已采纳',
    date: '2026-05-22',
  },
  {
    id: 5,
    advertiser: 'CandyMoyo',
    rating: 3.5,
    content: '探秘广告里小人造型的指甲颜色和实际商品有色差，用户反映和广告图不一样，希望能统一配色。',
    status: '待处理',
    date: '2026-05-21',
  },
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
            ) : activePage === '反馈管理' ? (
              <FeedbackManagementPage key="feedback" />
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
  const [showPreview, setShowPreview] = useState(false)

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
            onClick={() => designComment && setShowPreview(true)}
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

      {/* ── 小人造型预览弹窗 ──────────────────────────────── */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={e => e.stopPropagation()}
              className="relative rounded-2xl border border-white/15 bg-[#1a1c22] p-4 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute -right-2 -top-2 z-10 rounded-full bg-slate-800 border border-white/15 p-1.5 text-white/60 hover:bg-slate-700 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Animation */}
              <img
                src="/zhoumei.gif"
                alt="小人造型预览"
                className="rounded-lg max-h-[70vh] max-w-[70vw] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      {/* 用户画像细分 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-violet-500/20 text-xs text-violet-400">👥</span>
          用户画像细分
        </h2>

        {/* Two cards row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 按游戏偏好 */}
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="text-sm font-bold mb-3 text-white/70">按游戏偏好</div>
            {[
              { label: '喜欢收集类', pct: 32, color: 'bg-emerald-400' },
              { label: '喜欢射击类', pct: 28, color: 'bg-sky-400' },
              { label: '喜欢探秘类', pct: 25, color: 'bg-amber-400' },
              { label: '喜欢标签广告', pct: 15, color: 'bg-pink-400' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="text-xs text-white/60 w-24 shrink-0">{item.label}</span>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/70 w-10 text-right tabular-nums">{item.pct}%</span>
              </div>
            ))}
          </div>

          {/* 按消费意愿 */}
          <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4">
            <div className="text-sm font-bold mb-3 text-white/70">按消费意愿</div>
            {[
              { label: '高消费意愿', pct: 18, color: 'bg-red-400' },
              { label: '中消费意愿', pct: 45, color: 'bg-amber-400' },
              { label: '低消费意愿', pct: 37, color: 'bg-white/40' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 mb-2 last:mb-0">
                <span className="text-xs text-white/60 w-24 shrink-0">{item.label}</span>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white/70 w-10 text-right tabular-nums">{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 按剧集兴趣 */}
        <div className="rounded-lg border border-white/8 bg-white/[0.03] p-4 mb-4">
          <div className="text-sm font-bold mb-3 text-white/70">按剧集兴趣</div>
          <div className="flex items-center gap-3">
            {[
              { label: '爱情没有神话', pct: 28, color: 'bg-sky-400' },
              { label: '开端', pct: 22, color: 'bg-emerald-400' },
              { label: '繁花', pct: 18, color: 'bg-amber-400' },
              { label: '其他', pct: 32, color: 'bg-white/25' },
            ].map(item => (
              <div key={item.label} className="flex-1 text-center">
                <div className="w-full h-2 rounded-full bg-white/10 mb-2 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
                <div className="text-xs text-white/60">{item.label}</div>
                <div className="text-sm font-bold text-white/80">{item.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* 给广告商的建议 */}
        <div className="rounded-lg border border-amber-400/15 bg-amber-500/5 p-4">
          <div className="text-sm font-bold mb-3 text-amber-300 flex items-center gap-1.5">
            🎯 给广告商的建议
          </div>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
              射击类游戏用户占比28%，香奈儿可加大射击广告投放
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              爱情没有神话观众占28%，梵克雅宝可绑定该剧弹幕设计造型
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
              高消费意愿用户18%，建议推高端商品
            </li>
          </ul>
        </div>
      </section>

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

      {/* 广告商反馈意见 */}
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-rose-500/20 text-xs text-rose-400">💬</span>
          广告商反馈意见
        </h2>
        <div className="space-y-3">
          {mockFeedbacks.map(fb => (
            <div
              key={fb.id}
              className="flex gap-4 rounded-lg border border-white/8 bg-white/[0.02] p-4 hover:border-white/15 transition"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sm font-bold text-sky-400">
                {fb.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-bold text-white">{fb.advertiser}</span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    fb.tag === '问题反馈'
                      ? 'bg-red-500/15 text-red-400'
                      : fb.tag === '功能建议'
                      ? 'bg-blue-500/15 text-blue-400'
                      : fb.tag === '投放优化'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {fb.tag}
                  </span>
                  <span className="ml-auto text-xs text-white/35">{fb.date}</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{fb.content}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 transition">
            回复反馈
          </button>
          <span className="text-xs text-white/40">
            共 {mockFeedbacks.length} 条反馈，及时回复可提升广告商满意度
          </span>
        </div>
      </section>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 页面三：反馈管理
// ══════════════════════════════════════════════════════════════════

function FeedbackManagementPage() {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(mockFeedbackItems)

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
  const fillPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${PAD_T + plotH} L ${points[0].x.toFixed(1)} ${PAD_T + plotH} Z`

  const statusStyle = (status: FeedbackItem['status']) => {
    switch (status) {
      case '待处理': return 'bg-amber-500/15 text-amber-400'
      case '已读': return 'bg-white/10 text-white/45'
      case '处理中': return 'bg-blue-500/15 text-blue-400'
      case '已采纳': return 'bg-emerald-500/15 text-emerald-400'
    }
  }

  const statusCycle: FeedbackItem['status'][] = ['待处理', '处理中', '已读', '已采纳']

  const cycleStatus = (id: number) => {
    setFeedbackItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const idx = statusCycle.indexOf(item.status)
      const next = statusCycle[(idx + 1) % statusCycle.length]
      return { ...item, status: next }
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="mx-auto max-w-5xl space-y-6"
    >
      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-purple-500/20 text-xs text-purple-400">📊</span>
          满意度趋势（近7天）
        </h2>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full max-w-[600px]" style={{ maxHeight: 200 }}>
            {[3.5, 4.0, 4.5, 5.0].map(v => {
              const y = PAD_T + plotH - ((v - minVal) / range) * plotH
              return (
                <g key={v}>
                  <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="white" strokeOpacity={0.06} />
                  <text x={PAD_L - 8} y={y + 4} textAnchor="end" fill="white" fillOpacity={0.35} fontSize={10}>{v.toFixed(1)}</text>
                </g>
              )
            })}
            {DAY_LABELS.map((d, i) => {
              const x = PAD_L + (i / (DAY_LABELS.length - 1)) * plotW
              return (
                <text key={d} x={x} y={CHART_H - 4} textAnchor="middle" fill="white" fillOpacity={0.35} fontSize={9}>{d}</text>
              )
            })}
            <path d={fillPath} fill="url(#grad2)" opacity={0.25} />
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill="#0d0e12" stroke="#38bdf8" strokeWidth={2} />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="white" fillOpacity={0.8} fontSize={10} fontWeight="bold">{p.v.toFixed(1)}</text>
              </g>
            ))}
            <defs>
              <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-[#1a1c22] p-5">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-rose-500/20 text-xs text-rose-400">📝</span>
          广告商意见列表
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs text-white/45">
                <th className="py-3 text-left font-medium w-20">广告商</th>
                <th className="py-3 text-left font-medium w-28">满意度评分</th>
                <th className="py-3 text-left font-medium">意见内容</th>
                <th className="py-3 text-center font-medium w-20">状态</th>
                <th className="py-3 text-center font-medium w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {feedbackItems.map(item => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 font-bold">{item.advertiser}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star
                          key={n}
                          className={`h-3.5 w-3.5 ${
                            n <= item.rating
                              ? 'fill-amber-400 text-amber-400'
                              : n - 0.5 <= item.rating
                              ? 'fill-amber-400/50 text-amber-400/50'
                              : 'text-white/20'
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs text-white/50">{item.rating.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="py-3 text-white/70 max-w-xs">
                    <p className="truncate">{item.content}</p>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => cycleStatus(item.id)}
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold cursor-pointer hover:ring-1 hover:ring-white/30 transition ${statusStyle(item.status)}`}
                      title="点击切换状态"
                    >
                      {item.status}
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <button className="rounded-lg bg-sky-500/15 px-3 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/30 transition">
                      回复
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition">
          <Download className="h-4 w-4" />
          导出意见报告
        </button>
      </div>
    </motion.div>
  )
}
