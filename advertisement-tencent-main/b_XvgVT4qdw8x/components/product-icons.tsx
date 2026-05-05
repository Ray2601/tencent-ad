import type { Brand } from '@/lib/types'
import { brandColors } from '@/lib/mock-data'


interface ProductIconProps {
  productId: string
  className?: string
  size?: number
}

export function ProductIcon({ productId, className = '', size = 64 }: ProductIconProps) {
  const iconMap: Record<string, React.ReactNode> = {
    // Nike
    'nike-001': <NikeJordanIcon size={size} />,
    'nike-002': <NikeHoodieIcon size={size} />,
    'nike-003': <NikeDunkIcon size={size} />,
    // Apple
    'apple-001': <AppleiPhoneIcon size={size} />,
    'apple-002': <AppleAirPodsIcon size={size} />,
    'apple-003': <AppleWatchIcon size={size} />,
    // Dior
    'dior-001': <DiorPerfumeIcon size={size} />,
    'dior-002': <DiorBagIcon size={size} />,
    'dior-003': <DiorJadoreIcon size={size} />,
    // McDonald's
    'mcd-001': <McDonaldsBigMacIcon size={size} />,
    'mcd-002': <McDonaldsSpicyIcon size={size} />,
    'mcd-003': <McDonaldsMcFlurryIcon size={size} />,
    // Coca-Cola
    'coca-001': <CocaColaClassicIcon size={size} />,
    'coca-002': <CocaColaZeroIcon size={size} />,
    'coca-003': <CocaColaLimitedIcon size={size} />,
  }

  return (
    <div className={className}>
      {iconMap[productId] || <DefaultProductIcon size={size} />}
    </div>
  )
}

// Nike Icons
function NikeJordanIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <path d="M12 38C12 38 20 30 32 28C44 26 52 30 52 30L48 36C48 36 40 32 32 34C24 36 16 42 16 42L12 38Z" fill="#FF6B00" />
      <path d="M20 44L32 20L36 22L28 42L20 44Z" fill="#FFFFFF" />
      <circle cx="44" cy="24" r="4" fill="#FF6B00" />
    </svg>
  )
}

function NikeHoodieIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#2D2D2D" />
      <path d="M16 24L24 16H40L48 24V52H16V24Z" fill="#4A4A4A" />
      <path d="M24 16C24 16 28 20 32 20C36 20 40 16 40 16" stroke="#333" strokeWidth="2" />
      <ellipse cx="32" cy="14" rx="8" ry="4" fill="#4A4A4A" />
      <path d="M26 32L38 32" stroke="#FF6B00" strokeWidth="2" />
    </svg>
  )
}

function NikeDunkIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#F5F5F5" />
      <path d="M10 40C10 40 16 34 28 32C40 30 54 34 54 34L50 42C50 42 40 38 30 40C20 42 14 48 14 48L10 40Z" fill="#1A1A1A" />
      <rect x="14" y="28" width="36" height="12" rx="2" fill="#FFFFFF" stroke="#1A1A1A" strokeWidth="2" />
    </svg>
  )
}

// Apple Icons
function AppleiPhoneIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <rect x="18" y="8" width="28" height="48" rx="4" fill="#2D2D2D" stroke="#555" strokeWidth="1" />
      <rect x="20" y="12" width="24" height="36" rx="2" fill="#111" />
      <circle cx="32" cy="52" r="2" fill="#555" />
      <rect x="28" y="10" width="8" height="2" rx="1" fill="#333" />
    </svg>
  )
}

function AppleAirPodsIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#F5F5F5" />
      <ellipse cx="24" cy="28" rx="8" ry="10" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
      <rect x="22" y="36" width="4" height="16" rx="2" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
      <ellipse cx="40" cy="28" rx="8" ry="10" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
      <rect x="38" y="36" width="4" height="16" rx="2" fill="#FFFFFF" stroke="#DDD" strokeWidth="1" />
    </svg>
  )
}

function AppleWatchIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <rect x="20" y="12" width="24" height="40" rx="6" fill="#333" stroke="#FF6B00" strokeWidth="2" />
      <rect x="24" y="16" width="16" height="24" rx="2" fill="#111" />
      <rect x="18" y="8" width="28" height="4" rx="2" fill="#555" />
      <rect x="18" y="52" width="28" height="4" rx="2" fill="#555" />
    </svg>
  )
}

// Dior Icons
function DiorPerfumeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <rect x="24" y="16" width="16" height="36" rx="2" fill="linear-gradient(180deg, #444 0%, #222 100%)" />
      <rect x="24" y="16" width="16" height="36" rx="2" fill="#333" />
      <rect x="28" y="8" width="8" height="8" rx="1" fill="#C9A050" />
      <text x="32" y="38" textAnchor="middle" fill="#C9A050" fontSize="6" fontWeight="bold">DIOR</text>
    </svg>
  )
}

function DiorBagIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <rect x="12" y="24" width="40" height="28" rx="4" fill="#2D2D2D" />
      <path d="M20 24V16C20 12 24 8 32 8C40 8 44 12 44 16V24" stroke="#C9A050" strokeWidth="2" fill="none" />
      <circle cx="20" cy="36" r="3" fill="#C9A050" />
      <circle cx="32" cy="36" r="3" fill="#C9A050" />
      <circle cx="44" cy="36" r="3" fill="#C9A050" />
    </svg>
  )
}

function DiorJadoreIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#FFF8E7" />
      <ellipse cx="32" cy="36" rx="12" ry="18" fill="#F5D77A" />
      <ellipse cx="32" cy="36" rx="8" ry="14" fill="#FFE4A0" />
      <rect x="28" y="8" width="8" height="12" rx="2" fill="#C9A050" />
      <circle cx="32" cy="8" r="4" fill="#C9A050" />
    </svg>
  )
}

// McDonald's Icons
function McDonaldsBigMacIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#DA291C" />
      <ellipse cx="32" cy="44" rx="18" ry="6" fill="#8B4513" />
      <rect x="14" y="38" width="36" height="6" fill="#228B22" />
      <rect x="14" y="32" width="36" height="6" fill="#CD853F" />
      <ellipse cx="32" cy="32" rx="18" ry="4" fill="#8B4513" />
      <rect x="14" y="26" width="36" height="6" fill="#228B22" />
      <ellipse cx="32" cy="20" rx="18" ry="8" fill="#DEB887" />
      <ellipse cx="28" cy="18" rx="2" ry="1" fill="#FFF8DC" />
      <ellipse cx="36" cy="19" rx="2" ry="1" fill="#FFF8DC" />
    </svg>
  )
}

function McDonaldsSpicyIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#DA291C" />
      <ellipse cx="32" cy="44" rx="18" ry="6" fill="#8B4513" />
      <rect x="14" y="32" width="36" height="12" fill="#FF6B00" />
      <rect x="14" y="36" width="36" height="4" fill="#228B22" />
      <ellipse cx="32" cy="20" rx="18" ry="8" fill="#DEB887" />
      <ellipse cx="28" cy="18" rx="2" ry="1" fill="#FFF8DC" />
    </svg>
  )
}

function McDonaldsMcFlurryIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#FFC72C" />
      <path d="M20 16L16 52H48L44 16H20Z" fill="#FFFFFF" />
      <ellipse cx="32" cy="16" rx="12" ry="4" fill="#F5F5F5" />
      <circle cx="26" cy="28" r="3" fill="#8B4513" />
      <circle cx="38" cy="32" r="3" fill="#8B4513" />
      <circle cx="30" cy="40" r="3" fill="#8B4513" />
      <rect x="30" y="8" width="4" height="12" fill="#DA291C" />
    </svg>
  )
}

// Coca-Cola Icons
function CocaColaClassicIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#F40009" />
      <path d="M24 12L22 52H42L40 12H24Z" fill="#B30000" />
      <ellipse cx="32" cy="12" rx="8" ry="3" fill="#8B0000" />
      <path d="M26 24C26 24 28 28 32 28C36 28 38 24 38 24" stroke="#FFFFFF" strokeWidth="2" />
      <text x="32" y="40" textAnchor="middle" fill="#FFFFFF" fontSize="5" fontWeight="bold">Coca-Cola</text>
    </svg>
  )
}

function CocaColaZeroIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#1A1A1A" />
      <path d="M24 12L22 52H42L40 12H24Z" fill="#0D0D0D" />
      <ellipse cx="32" cy="12" rx="8" ry="3" fill="#000" />
      <path d="M26 24C26 24 28 28 32 28C36 28 38 24 38 24" stroke="#F40009" strokeWidth="2" />
      <text x="32" y="40" textAnchor="middle" fill="#F40009" fontSize="5" fontWeight="bold">ZERO</text>
    </svg>
  )
}

function CocaColaLimitedIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#F40009" />
      <path d="M24 12L22 52H42L40 12H24Z" fill="#B30000" />
      <ellipse cx="32" cy="12" rx="8" ry="3" fill="#8B0000" />
      <circle cx="32" cy="32" r="12" fill="#FFD700" fillOpacity="0.3" />
      <path d="M28 28L32 24L36 28L32 36L28 28Z" fill="#FFD700" />
      <text x="32" y="48" textAnchor="middle" fill="#FFD700" fontSize="5" fontWeight="bold">限量版</text>
    </svg>
  )
}

function DefaultProductIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="8" fill="#333" />
      <rect x="16" y="16" width="32" height="32" rx="4" fill="#555" />
      <text x="32" y="36" textAnchor="middle" fill="#999" fontSize="8">?</text>
    </svg>
  )
}

// 品牌Logo组件
export function BrandLogo({ brand, size = 32 }: { brand: Brand; size?: number }) {
  const colors = brandColors[brand]
  
  const logos: Record<Brand, React.ReactNode> = {
    nike: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M4 20C4 20 8 16 16 14C24 12 28 14 28 14L26 18C26 18 22 16 16 17C10 18 6 22 6 22L4 20Z" fill="#3b82f6" />
      </svg>
    ),
    apple: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M16 6C16 6 18 2 22 2C22 6 20 8 16 8C16 8 14 10 14 14C14 22 20 28 24 28C22 30 18 30 16 28C14 30 10 30 8 28C4 24 4 14 10 10C12 8 14 6 16 6Z" fill="#3b82f6" />
      </svg>
    ),
    dior: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <text x="16" y="20" textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">DIOR</text>
      </svg>
    ),
    chanel: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="12" cy="16" r="7" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="20" cy="16" r="7" stroke="#3b82f6" strokeWidth="2" />
        <text x="16" y="30" textAnchor="middle" fill="#3b82f6" fontSize="6" fontWeight="bold">CHANEL</text>
      </svg>
    ),
    mcdonalds: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path d="M6 28V8C6 4 10 2 12 6L16 16L20 6C22 2 26 4 26 8V28" stroke="#3b82f6" strokeWidth="4" fill="none" />
      </svg>
    ),
    cocacola: (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" fill="#3b82f6" />
        <path d="M10 16C10 16 12 12 16 12C20 12 22 16 22 16" stroke="#FFFFFF" strokeWidth="2" />
      </svg>
    ),
  }

  return <div className="flex items-center justify-center">{logos[brand]}</div>
}
