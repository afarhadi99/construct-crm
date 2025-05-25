```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// You might add other utility functions here, e.g., date formatters, currency formatters
export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Date(date).toLocaleDateString(undefined, options || defaultOptions);
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function getInitials(name: string = ''): string {
  return name
    .split(' ')
    .map(n => n[0])
    .filter((_, i, arr) => i === 0 || i === arr.length - 1) // First and last initial
    .join('')
    .toUpperCase();
}
```