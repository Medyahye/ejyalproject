import { Payment } from '../types';

export interface MonthlyRevenue {
  month: string;
  amount: number;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Buckets successful payments by calendar month (oldest to newest) for the last `monthsBack` months. */
export function computeMonthlyRevenue(payments: Payment[], monthsBack = 6): MonthlyRevenue[] {
  const successful = payments.filter((p) => p.status === 'Réussi');
  const now = new Date();

  return Array.from({ length: monthsBack }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1 - i), 1);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    const amount = successful
      .filter((p) => {
        const pd = new Date(p.date);
        return `${pd.getFullYear()}-${pd.getMonth()}` === monthKey;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    return { month: capitalize(d.toLocaleDateString('fr-FR', { month: 'long' })), amount: Math.round(amount * 100) / 100 };
  });
}
