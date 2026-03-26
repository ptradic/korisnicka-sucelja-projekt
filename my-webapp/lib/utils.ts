import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Item, Currency } from "@/app/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calcTotalWeight(inventory: Item[], currency?: Currency): number {
  const itemWeight = inventory.reduce((sum, item) => sum + item.weight * item.quantity, 0);
  const coinWeight = currency ? Math.floor((currency.pp + currency.gp + currency.sp + currency.cp) / 50) : 0;
  return itemWeight + coinWeight;
}
