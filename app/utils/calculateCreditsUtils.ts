import type { Cart, Item } from '~/models/Item';

/**
 * Calculates the remaining credit balance after purchases, withdrawals, and fees
 * @param startingCredits - Initial credit balance
 * @param cart - Array of items with price and quantity
 * @param withdrawal - Amount withdrawn
 * @param fee - Additional fees
 * @returns Remaining credits
 */
export function calculateRemainingBalance(
  startingCredits: number,
  cartCost: number,
  withdrawal: number = 0,
  fee: number = 0
): number {
  return startingCredits - cartCost - withdrawal - fee;
}

export function calculateItemTotal(cart: Cart, taxRate: number = 0, discountPercent: number = 0): number {
  return calculateTotalFromCartSubtotal(calculateCartSubtotal(cart), taxRate, discountPercent);
}

export function calculateCartSubtotal(cart: Cart): number {
  return cart.reduce((total, item) => total + calculateItemSubTotal(item), 0);
}

export function calculateItemSubTotal(item: Item): number {
  return item.price * item.quantity;
}

export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100);
}

export function calculateDiscount(amount: number, discountPercent: number): number {
  return amount * (discountPercent / 100);
}

export function calculateTotalFromCartSubtotal(castSubtotal: number, taxRate: number, discountPercent: number): number {
  return castSubtotal + calculateTax(castSubtotal, taxRate) - calculateDiscount(castSubtotal, discountPercent);
}
