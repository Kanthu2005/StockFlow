/**
 * Formatting and utility helpers for StockFlow.
 */

export function getCurrencySymbol(currencyString = 'USD ($)') {
  if (!currencyString) return '$';
  if (currencyString.includes('₹') || currencyString.startsWith('INR')) return '₹';
  if (currencyString.includes('€') || currencyString.startsWith('EUR')) return '€';
  if (currencyString.includes('£') || currencyString.startsWith('GBP')) return '£';
  if (currencyString.includes('A$') || currencyString.startsWith('AUD')) return 'A$';
  if (currencyString.includes('C$') || currencyString.startsWith('CAD')) return 'C$';
  return '$';
}

export function formatCurrency(amount, currencyString = 'USD ($)') {
  if (amount == null || amount === '') return '—';
  const symbol = getCurrencySymbol(currencyString);
  const num = Number(amount);
  if (isNaN(num)) return '—';
  return `${symbol}${num.toFixed(2)}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
