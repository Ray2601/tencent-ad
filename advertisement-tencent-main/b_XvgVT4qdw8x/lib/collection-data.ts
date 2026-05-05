import type { Brand, Product } from '@/lib/types'

export const brandLabels: Record<Brand, string> = {
  nike: 'Nike',
  apple: 'Apple',
  dior: 'Dior',
  chanel: 'Chanel',
  mcdonalds: 'McDonalds',
  cocacola: 'Coca-Cola',
}

export const productCatalog: Product[] = [
  {
    id: 'chanel-perfume-bottle',
    name: '香奈儿香水',
    brand: 'chanel',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '从香水广告里收集到的香奈儿香水。',
    rarity: 'rare',
    points: 160,
    purchaseUrl: 'https://www.chanel.com/us/fragrance/',
  },
  {
    id: 'chanel-classic-bag',
    name: '经典链条包',
    brand: 'chanel',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '品牌货架里的高级兑换藏品。',
    rarity: 'legendary',
    points: 520,
    purchaseUrl: 'https://www.chanel.com/us/fashion/handbags/',
    exchangeRequirement: {
      productId: 'chanel-perfume-bottle',
      quantity: 3,
      label: '收集 3 瓶香奈儿香水可以兑换 1 个香奈儿包包',
    },
  },
  {
    id: 'chanel-pearl-necklace',
    name: '珍珠项链',
    brand: 'chanel',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '需要更多香水藏品解锁的品牌配饰。',
    rarity: 'epic',
    points: 320,
    purchaseUrl: 'https://www.chanel.com/us/fashion/costume-jewelry/',
    exchangeRequirement: {
      productId: 'chanel-perfume-bottle',
      quantity: 2,
      label: '收集 2 瓶香奈儿香水可以兑换 1 条香奈儿项链',
    },
  },
  {
    id: 'dior-perfume-card',
    name: '香水卡片',
    brand: 'dior',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '从香水广告里抽出的香氛卡片。',
    rarity: 'rare',
    points: 150,
    purchaseUrl: 'https://www.dior.com/en_us/beauty/fragrance',
  },
  {
    id: 'dior-mini-bottle',
    name: '迷你香水瓶',
    brand: 'dior',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '带着柔粉光泽的迷你瓶。',
    rarity: 'epic',
    points: 200,
    purchaseUrl: 'https://www.dior.com/en_us/beauty/fragrance',
    exchangeRequirement: {
      productId: 'dior-perfume-card',
      quantity: 2,
      label: '收集 2 张香水卡片可以兑换 1 瓶迷你香水',
    },
  },
  {
    id: 'nike-air-jordan',
    name: '复古高帮鞋',
    brand: 'nike',
    category: 'clothing',
    image: '/products/perfume.png',
    description: '可解锁 Nike 品牌货架的球鞋藏品。',
    rarity: 'epic',
    points: 300,
    purchaseUrl: 'https://www.nike.com/',
  },
  {
    id: 'nike-tech-bag',
    name: '机能小包',
    brand: 'nike',
    category: 'clothing',
    image: '/products/perfume.png',
    description: '适合小人的轻量斜挎包。',
    rarity: 'common',
    points: 80,
    purchaseUrl: 'https://www.nike.com/w/bags-backpacks-9xy71',
    exchangeRequirement: {
      productId: 'nike-air-jordan',
      quantity: 2,
      label: '收集 2 双复古高帮鞋可以兑换 1 个机能小包',
    },
  },
  {
    id: 'apple-sticker',
    name: '工作室贴纸',
    brand: 'apple',
    category: 'electronics',
    image: '/products/perfume.png',
    description: '暂停广告帧里出现的亮面科技贴纸。',
    rarity: 'rare',
    points: 120,
    purchaseUrl: 'https://www.apple.com/store',
  },
  {
    id: 'coke-pin',
    name: '气泡徽章',
    brand: 'cocacola',
    category: 'beverage',
    image: '/products/perfume.png',
    description: '一枚会闪光的小徽章。',
    rarity: 'common',
    points: 60,
    purchaseUrl: 'https://www.coca-cola.com/',
  },
]

export const skipAdCost = 450

export function getUnlockedBrands(ownedProductIds: Set<string>) {
  const ownedBrands = new Set<Brand>()
  productCatalog.forEach(product => {
    if (ownedProductIds.has(product.id)) {
      ownedBrands.add(product.brand)
    }
  })
  return ownedBrands
}
