/**
 * Urgency badge component with color coding.
 * Uses both color AND text label for accessibility.
 */

import type { UrgencyLevel } from '../types';

interface Props {
  level: UrgencyLevel;
  size?: 'sm' | 'md' | 'lg';
}

const urgencyConfig: Record<
  UrgencyLevel,
  { bg: string; text: string; border: string }
> = {
  Critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
  },
  High: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
  },
  Medium: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  Low: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function UrgencyBadge({ level, size = 'md' }: Props) {
  const config = urgencyConfig[level];

  return (
    <span
      className={`inline-flex items-center rounded-full border font-semibold ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Urgency: ${level}`}
    >
      {level.toUpperCase()}
    </span>
  );
}
