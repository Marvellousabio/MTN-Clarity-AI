import { motion } from 'motion/react';

interface NotificationBadgeProps {
  count: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function NotificationBadge({ count, size = 'sm', className = '' }: NotificationBadgeProps) {
  if (count <= 0) return null;

  const sizeClasses = size === 'sm' ? 'min-w-[18px] h-[18px] text-[10px]' : 'min-w-[22px] h-[22px] text-xs';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className={`absolute -top-0.5 -right-0.5 ${sizeClasses} bg-red-500 text-white font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-lg z-10 ${className}`}
    >
      {count > 99 ? '99+' : count}
    </motion.div>
  );
}
