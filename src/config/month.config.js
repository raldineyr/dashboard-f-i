const MONTH_NAMES = {
  'JANEIRO': 1, 'FEVEREIRO': 2, 'MARCO': 3, 'MARÇO': 3,
  'ABRIL': 4, 'MAIO': 5, 'JUNHO': 6, 'JULHO': 7,
  'AGOSTO': 8, 'SETEMBRO': 9, 'OUTUBRO': 10,
  'NOVEMBRO': 11, 'DEZEMBRO': 12
};

const MONTH_LABELS = {
  'JANEIRO': 'Janeiro', 'FEVEREIRO': 'Fevereiro', 'MARCO': 'Março',
  'ABRIL': 'Abril', 'MAIO': 'Maio', 'JUNHO': 'Junho',
  'JULHO': 'Julho', 'AGOSTO': 'Agosto', 'SETEMBRO': 'Setembro',
  'OUTUBRO': 'Outubro', 'NOVEMBRO': 'Novembro', 'DEZEMBRO': 'Dezembro'
};

export const monthConfig = {
  detectMonth(text) {
    const normalized = text
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    
    const match = normalized.match(
      /\b(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/
    );
    
    return match ? match[1] : '';
  },

  getMonthLabel(month) {
    return MONTH_LABELS[month] || month || 'Mês não identificado';
  },

  getMonthOrder(month) {
    return MONTH_NAMES[month] || 99;
  },

  getMonthNumber(month) {
    return MONTH_NAMES[month] || 0;
  },

  getMonthNames() {
    return { ...MONTH_NAMES };
  },

  getMonthLabels() {
    return { ...MONTH_LABELS };
  },

  sortByMonth(items, monthProperty = 'month') {
    return [...items].sort((a, b) => {
      const orderA = MONTH_NAMES[a[monthProperty]] || 99;
      const orderB = MONTH_NAMES[b[monthProperty]] || 99;
      return orderA - orderB;
    });
  },

  getMonthNameFromOrder(order) {
    for (const [name, num] of Object.entries(MONTH_NAMES)) {
      if (num === order) return name;
    }
    return '';
  }
};
