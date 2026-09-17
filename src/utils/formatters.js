export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatBRL(value) {
  return `R$ ${formatCurrency(value)}`;
}

export function formatInteger(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

export function cleanText(value) {
  return String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeKey(value) {
  return cleanText(value)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[ch]));
}

export function parseCurrencyValue(value) {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    let s = cleanText(value).replace(/R\$\s*/gi, '').trim();
    if (!s || s === '-' || s === '—') return 0;

    if (s.includes(',') && s.includes('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.includes(',')) {
        s = s.replace(',', '.');
    }

    s = s.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(s);
    return Number.isFinite(parsed) ? parsed : 0;
}
