import type { Brand, Product } from '@/lib/types'

export const fangchaoWearCost = 100
export const fangchaoOutfitImage = '/fangchao%20(2).png'
export const fangchaoNvpuSpritesheet = '/homie/spritesheet.png'
export const fangchaoFujieSpritesheet = '/wukong/spritesheet.webp'
export const fangchaoShuaiSpritesheet = '/taffy/spritesheet.webp'

export type FangchaoOutfitRenderMode = 'body-texture' | 'full-sprite'

export interface FangchaoOutfitDef {
  productId: string
  name: string
  spritesheet: string
  spritePosition: string
  renderMode: FangchaoOutfitRenderMode
}

export const fangchaoOutfits: FangchaoOutfitDef[] = [
  {
    productId: 'fangchao-homie',
    name: 'Homie',
    spritesheet: fangchaoNvpuSpritesheet,
    spritePosition: '0% 0%',
    renderMode: 'full-sprite',
  },
  {
    productId: 'fangchao-wukong',
    name: 'Wukong',
    spritesheet: fangchaoFujieSpritesheet,
    spritePosition: '0% 0%',
    renderMode: 'full-sprite',
  },
  {
    productId: 'fangchao-taffy',
    name: 'Taffy',
    spritesheet: fangchaoShuaiSpritesheet,
    spritePosition: '0% 0%',
    renderMode: 'full-sprite',
  },
]

export const brandLabels: Record<Brand, string> = {
  nike: 'Nike',
  apple: 'Apple',
  dior: 'Dior',
  chanel: 'Chanel',
  mcdonalds: 'McDonalds',
  cocacola: 'Coca-Cola',
  vancleefarpels: 'Van Cleef&Arpels',
  fangchao: '方超',
  candymoyo: 'CandyMoyo',
  pepsi: '百事可乐',
  chowtaifook: '周大福',
}

export const productCatalog: Product[] = [
  {
    id: 'vca-bracelet',
    name: '手链',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 高光视频中跳出的手链标签。',
    rarity: 'legendary',
    points: 220,
    purchaseUrl: 'https://www.vancleefarpels.com/',
  },
  {
    id: 'vca-ring',
    name: '戒指',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 高光视频中跳出的戒指标签。',
    rarity: 'epic',
    points: 190,
    purchaseUrl: 'https://www.vancleefarpels.com/',
  },
  {
    id: 'vca-necklace',
    name: '项链',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 高光视频中跳出的项链标签。',
    rarity: 'legendary',
    points: 240,
    purchaseUrl: 'https://www.vancleefarpels.com/',
  },
  {
    id: 'vca-earrings',
    name: '耳环',
    brand: 'vancleefarpels',
    category: 'luxury',
    image: '/products/perfume.png',
    description: 'Van Cleef&Arpels 高光视频中跳出的耳环标签。',
    rarity: 'epic',
    points: 180,
    purchaseUrl: 'https://www.vancleefarpels.com/',
  },
  {
    id: 'fangchao-rich-look-1',
    name: '方超靓丽富姐装1',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoOutfitImage,
    description: '快速点击小游戏里可以收进背包的方超套装。',
    rarity: 'legendary',
    points: 260,
  },
  {
    id: 'fangchao-fit-look-2',
    name: '方超帅气薄肌套装2',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoOutfitImage,
    description: '快速点击小游戏里可以收进背包的方超套装。',
    rarity: 'epic',
    points: 230,
  },
  {
    id: 'fangchao-maid-look',
    name: '方超女仆装',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoOutfitImage,
    description: '快速点击小游戏里可以收进背包的方超套装。',
    rarity: 'epic',
    points: 210,
  },
  {
    id: 'fangchao-homie',
    name: 'Homie',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoNvpuSpritesheet,
    description: 'Homie宠物造型，可以在小人空间里穿搭。',
    rarity: 'legendary',
    points: 280,
  },
  {
    id: 'fangchao-wukong',
    name: 'Wukong',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoFujieSpritesheet,
    description: 'Wukong宠物造型，可以在小人空间里穿搭。',
    rarity: 'legendary',
    points: 280,
  },
  {
    id: 'fangchao-taffy',
    name: 'Taffy',
    brand: 'fangchao',
    category: 'clothing',
    image: fangchaoShuaiSpritesheet,
    description: 'Taffy宠物造型，可以在小人空间里穿搭。',
    rarity: 'legendary',
    points: 280,
  },
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
  {
    id: 'candymoyo-nail-red',
    name: 'CandyMoyo 红色指甲油',
    brand: 'candymoyo',
    category: 'luxury',
    image: '/fig.png',
    description: '猜对周媚的指甲油颜色后获得。',
    rarity: 'rare',
    points: 50,
  },
  {
    id: 'pepsi-cola',
    name: '百事可乐',
    brand: 'pepsi',
    category: 'beverage',
    image: '/products/perfume.png',
    description: '经典的百事可乐，一口畅爽。',
    rarity: 'common',
    points: 40,
  },
  {
    id: 'pepsi-zero',
    name: '百事无糖可乐',
    brand: 'pepsi',
    category: 'beverage',
    image: '/products/perfume.png',
    description: '零糖零卡，健康畅饮。',
    rarity: 'common',
    points: 50,
  },
  {
    id: 'dior-lipstick',
    name: '迪奥口红',
    brand: 'dior',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '迪奥烈焰蓝金唇膏，经典999色号。',
    rarity: 'epic',
    points: 180,
  },
  {
    id: 'chowtaifook-gold',
    name: '周大福金链',
    brand: 'chowtaifook',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '周大福传承系列足金项链。',
    rarity: 'legendary',
    points: 300,
  },
  {
    id: 'chowtaifook-ring',
    name: '周大福金戒',
    brand: 'chowtaifook',
    category: 'luxury',
    image: '/products/perfume.png',
    description: '周大福婚嫁系列黄金戒指。',
    rarity: 'epic',
    points: 220,
  },
  {
    id: 'mcdonalds-burger',
    name: '巨无霸汉堡',
    brand: 'mcdonalds',
    category: 'food',
    image: '/products/perfume.png',
    description: '麦当劳经典巨无霸，双层牛肉。',
    rarity: 'common',
    points: 35,
  },
]

export const skipAdCost = 450

/** Pool of product IDs for the recommended ad area */
export const recommendedAdProductIds = [
  'pepsi-cola',
  'pepsi-zero',
  'dior-lipstick',
  'chowtaifook-gold',
  'chowtaifook-ring',
  'mcdonalds-burger',
  'coke-pin',
  'nike-tech-bag',
  'apple-sticker',
  'dior-perfume-card',
]

export function getUnlockedBrands(ownedProductIds: Set<string>) {
  const ownedBrands = new Set<Brand>()
  productCatalog.forEach(product => {
    if (ownedProductIds.has(product.id)) {
      ownedBrands.add(product.brand)
    }
  })
  return ownedBrands
}
