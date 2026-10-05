/** Display format for an integer amount, e.g. `25 000 F CFA` (`fr-FR`). */
export function formatAmount(amount: number, currency: string | null): string {
  const number = new Intl.NumberFormat('fr-FR').format(amount);
  return currency ? `${number} ${currency}` : number;
}
