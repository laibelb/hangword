import Image from 'next/image'
import { getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Avatar({ src, name, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  }

  if (src) {
    return (
      <div className={`${sizes[size]} relative rounded-full overflow-hidden`}>
        <Image
          src={src}
          alt={name}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center font-medium`}
    >
      {getInitials(name)}
    </div>
  )
}
