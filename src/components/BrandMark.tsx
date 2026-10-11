interface BrandMarkProps {
  size?: number
  className?: string
  alt?: string
}

export function BrandMark({ size = 32, className = '', alt = '' }: BrandMarkProps) {
  return <img src="/brand/hand-mark-v1-64.png" width={size} height={size} alt={alt} decoding="async" fetchPriority="high" className={className} />
}
