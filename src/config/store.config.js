import { normalizeKey } from '../utils/formatters.js';
import { COLOR_PALETTE } from '../utils/constants.js';

const FIXED_STORE_COLORS = {
  'IGUATEMI': '#2ecc71',
  'ITABUNA': '#9b59b6',
  'LAURO DE FREITAS': '#e74c3c',
  'FEIRA DE SANTANA': '#2a6b9c',
  'VITORIA DA CONQUISTA': '#e67e22',
  'VITÓRIA DA CONQUISTA': '#e67e22'
};

export const storeConfig = {
  getStoreColor(storeName) {
    const key = normalizeKey(storeName);

    // Verifica cores fixas primeiro
    for (const [fixedName, color] of Object.entries(FIXED_STORE_COLORS)) {
      const fixedKey = normalizeKey(fixedName);
      if (key.includes(fixedKey) || fixedKey.includes(key)) {
        return color;
      }
    }

    // Gera cor determinística baseada no nome
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
  },

  getFixedColors() {
    return { ...FIXED_STORE_COLORS };
  },

  getStoreIdentity(brand, storeName) {
    return normalizeKey(`${brand} ${storeName}`)
      .replace(/\b(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
};
