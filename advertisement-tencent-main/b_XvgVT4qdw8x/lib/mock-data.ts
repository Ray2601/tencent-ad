import type { Product, AdTriggerPoint, Brand } from './types'

// 品牌颜色映射
export const brandColors: Record<Brand, { primary: string; secondary: string }> = {
  nike: { primary: '#FF6B00', secondary: '#000000' },
  apple: { primary: '#555555', secondary: '#FFFFFF' },
  dior: { primary: '#C9A050', secondary: '#1A1A1A' },
  chanel: { primary: '#E7E5E4', secondary: '#111111' },
  mcdonalds: { primary: '#FFC72C', secondary: '#DA291C' },
  cocacola: { primary: '#F40009', secondary: '#FFFFFF' },
  vancleefarpels: { primary: '#9F7A4F', secondary: '#F8F1E7' },
  fangchao: { primary: '#F472B6', secondary: '#111827' },
  candymoyo: { primary: '#FF6B8A', secondary: '#FFFFFF' },
}

// 品牌名称映射
export const brandNames: Record<Brand, string> = {
  nike: 'Nike',
  apple: 'Apple',
  dior: 'Dior',
  chanel: 'Chanel',
  mcdonalds: '麦当劳',
  cocacola: '可口可乐',
  vancleefarpels: 'Van Cleef&Arpels',
  fangchao: '方超',
  candymoyo: 'CandyMoyo',
}

// 模拟商品数据
export const mockProducts: Product[] = [
  // Nike 商品
  {
    id: 'nike-001',
    name: 'Air Jordan 1 复古高帮',
    brand: 'nike',
    category: 'clothing',
    image: '/products/nike-jordan.svg',
    description: '经典复古篮球鞋，街头潮流必备',
    rarity: 'epic',
    points: 150,
  },
  {
    id: 'nike-002',
    name: 'Tech Fleece 连帽衫',
    brand: 'nike',
    category: 'clothing',
    image: '/products/nike-hoodie.svg',
    description: '轻便保暖的科技面料',
    rarity: 'rare',
    points: 80,
  },
  {
    id: 'nike-003',
    name: 'Dunk Low 熊猫配色',
    brand: 'nike',
    category: 'clothing',
    image: '/products/nike-dunk.svg',
    description: '经典黑白配色，百搭之选',
    rarity: 'common',
    points: 50,
  },

  // Apple 商品
  {
    id: 'apple-001',
    name: 'iPhone 16 Pro',
    brand: 'apple',
    category: 'electronics',
    image: '/products/apple-iphone.svg',
    description: '最新旗舰智能手机',
    rarity: 'legendary',
    points: 300,
  },
  {
    id: 'apple-002',
    name: 'AirPods Pro 3',
    brand: 'apple',
    category: 'electronics',
    image: '/products/apple-airpods.svg',
    description: '主动降噪无线耳机',
    rarity: 'rare',
    points: 100,
  },
  {
    id: 'apple-003',
    name: 'Apple Watch Ultra',
    brand: 'apple',
    category: 'electronics',
    image: '/products/apple-watch.svg',
    description: '极限运动智能手表',
    rarity: 'epic',
    points: 200,
  },

  // Dior 商品
  {
    id: 'dior-001',
    name: 'Sauvage 旷野男士香水',
    brand: 'dior',
    category: 'luxury',
    image: '/products/dior-perfume.svg',
    description: '清新木质调香氛',
    rarity: 'epic',
    points: 180,
  },
  {
    id: 'dior-002',
    name: 'Lady Dior 手袋',
    brand: 'dior',
    category: 'luxury',
    image: '/products/dior-bag.svg',
    description: '经典优雅的标志性手袋',
    rarity: 'legendary',
    points: 500,
  },
  {
    id: 'dior-003',
    name: 'J\'Adore 真我女士香水',
    brand: 'dior',
    category: 'luxury',
    image: '/products/dior-jadore.svg',
    description: '花香调女士香氛',
    rarity: 'rare',
    points: 120,
  },

  // 麦当劳商品
  {
    id: 'mcd-001',
    name: '巨无霸套餐',
    brand: 'mcdonalds',
    category: 'food',
    image: '/products/mcd-bigmac.svg',
    description: '经典双层牛肉汉堡套餐',
    rarity: 'common',
    points: 20,
  },
  {
    id: 'mcd-002',
    name: '麦辣鸡腿堡',
    brand: 'mcdonalds',
    category: 'food',
    image: '/products/mcd-spicy.svg',
    description: '香辣酥脆的鸡腿堡',
    rarity: 'common',
    points: 15,
  },
  {
    id: 'mcd-003',
    name: '限定版麦旋风',
    brand: 'mcdonalds',
    category: 'food',
    image: '/products/mcd-mcflurry.svg',
    description: '季节限定口味冰淇淋',
    rarity: 'rare',
    points: 40,
  },

  // 可口可乐商品
  {
    id: 'coca-001',
    name: '经典可口可乐',
    brand: 'cocacola',
    category: 'beverage',
    image: '/products/coca-classic.svg',
    description: '原味碳酸饮料',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'coca-002',
    name: '可口可乐无糖版',
    brand: 'cocacola',
    category: 'beverage',
    image: '/products/coca-zero.svg',
    description: '零卡路里的畅爽体验',
    rarity: 'common',
    points: 10,
  },
  {
    id: 'coca-003',
    name: '限量版收藏罐',
    brand: 'cocacola',
    category: 'beverage',
    image: '/products/coca-limited.svg',
    description: '艺术家联名限量版',
    rarity: 'epic',
    points: 150,
  },
]

// 广告触发点配置（基于视频时间线）
export const adTriggerPoints: AdTriggerPoint[] = [
  {
    time: 13,
    products: mockProducts.filter(p => p.brand === 'nike').slice(0, 2),
    duration: 5,
  },
  {
    time: 25,
    products: mockProducts.filter(p => p.brand === 'apple').slice(0, 2),
    duration: 15,
  },
  {
    time: 45,
    products: mockProducts.filter(p => p.brand === 'dior').slice(0, 2),
    duration: 15,
  },
  {
    time: 65,
    products: mockProducts.filter(p => p.brand === 'mcdonalds').slice(0, 2),
    duration: 15,
  },
  {
    time: 85,
    products: mockProducts.filter(p => p.brand === 'cocacola').slice(0, 2),
    duration: 15,
  },
]

// 获取随机商品
export function getRandomProducts(count: number = 3): Product[] {
  const shuffled = [...mockProducts].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// 根据品牌筛选商品
export function getProductsByBrand(brand: Brand): Product[] {
  return mockProducts.filter(p => p.brand === brand)
}

// 获取稀有度颜色
export function getRarityColor(rarity: Product['rarity']): string {
  const colors = {
    common: '#9CA3AF',
    rare: '#3B82F6',
    epic: '#8B5CF6',
    legendary: '#F59E0B',
  }
  return colors[rarity]
}
