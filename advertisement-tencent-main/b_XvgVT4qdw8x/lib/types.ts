export interface Product {
  id: string
  name: string
  brand: Brand
  category: ProductCategory
  image: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  purchaseUrl?: string
  exchangeRequirement?: {
    productId: string
    quantity: number
    label: string
  }
  unlockedByDefault?: boolean
  silhouette?: string
}

export type Brand = 'nike' | 'apple' | 'dior' | 'chanel' | 'mcdonalds' | 'cocacola' | 'vancleefarpels' | 'fangchao' | 'candymoyo' | 'pepsi' | 'chowtaifook'

export type ProductCategory = 'clothing' | 'electronics' | 'luxury' | 'food' | 'beverage'

export type CharacterEmotion = 'expectant' | 'happy' | 'surprised' | 'disgusted' | 'bored' | 'attacking'

export interface BackpackItem {
  product: Product
  acquiredAt: number
  quantity: number
}

export interface Backpack {
  items: BackpackItem[]
  maxCapacity: number
}

export interface AdTriggerPoint {
  time: number
  products: Product[]
  duration: number
}

export interface UserAction {
  type:
    | 'drag_start'
    | 'drag_end'
    | 'drop_success'
    | 'drop_reject'
    | 'video_pause'
    | 'video_resume'
    | 'feed_from_split'
    | 'mask_hit'
    | 'mask_collect'
    | 'hotspot_collect'
    | 'exchange_redeem'
    | 'redeem_skip'
    | 'open_character'
    | 'equip_outfit'
  productId?: string
  timestamp: number
  details?: Record<string, unknown>
}

export interface AppState {
  backpack: Backpack
  userActions: UserAction[]
  currentEmotion: CharacterEmotion
  totalPoints: number
}
