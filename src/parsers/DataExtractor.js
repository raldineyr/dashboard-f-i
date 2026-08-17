import { cleanText, normalizeKey, parseCurrencyValue } from '../utils/formatters.js';
import { MONTH_NAMES, R_TYPES } from '../utils/constants.js';
import { storeConfig } from '../config/store.config.js';
import { monthConfig } from '../config/month.config.js';

/**
 * Extrai os dados da aba "VENDEDORES".
 *
 * Regra importante para SPF:
 * - A coluna "SPF" da tabela de vendas contém STATUS ("COM SPF"/"SEM SPF").
 * - A coluna "SPF a pagar" contém VALOR monetário.
 * - Portanto, quantidade de SPF deve ser contabilizada pelo STATUS da
 *   operação, e não pelo valor de "SPF a pagar".
 *
 * A tabela-resumo de vendedores da própria planilha não é usada como
 * fonte de verdade para os indicadores. Ela pode estar desatualizada
 * ou excluir operações que possuem valores financeiros zerados.
 * A fonte de verdade passa a ser cada operação da tabela principal.
 */
export class DataExtractor {
  static extract(rows, fileName) {
    const headers = this.findTransactionHeaders(rows);
    if (!headers.length) return [];

    const result = [];

    for (let i = 0; i < headers.length; i++) {
      const start = headers[i];
      const end = headers[i + 1] ?? rows.length;
      const parsed = this.parseSection(rows, start, end, fileName, i);

      if (parsed) result.push(parsed);
    }

    return result;
  }

  static findTransactionHeaders(rows) {
    const headers = [];

    for (let i = 0; i < rows.length; i++) {
      const upperRow = rows[i].map(cell => cleanText(cell).toUpperCase());

      if (
        upperRow.includes('CLIENTE') &&
        upperRow.includes('BANCO') &&
        upperRow.includes('VENDEDOR')
      ) {
        headers.push(i);
      }
    }

    return headers;
  }

  static parseSection(rows, start, end, fileName, sectionIndex) {
    const sectionRows = rows.slice(start, end);
    if (!sectionRows.length) return null;

    const rawStoreName =
      this.findTitleBeforeHeader(rows, start) ||
      this.makeFallbackStoreName(fileName, sectionIndex);

    const brand = this.inferBrand(fileName, rawStoreName);
    const storeName = this.displayStoreName(rawStoreName);
    const detectedMonth = monthConfig.detectMonth(
      `${fileName} ${rawStoreName}`
    );

    const label = `${brand} • ${storeName}`;
    const storeKey = normalizeKey(`${brand} ${storeName}`);

    const header = sectionRows[0].map(cell =>
      cleanText(cell).toUpperCase()
    );

    const indexes = {
      cliente: header.indexOf('CLIENTE'),
      banco: header.indexOf('BANCO'),
      vendedor: header.indexOf('VENDEDOR'),
      r: header.findIndex(v => v === 'R' || v === 'R%'),
      spfStatus: header.indexOf('SPF'),
      financiado: header.findIndex(v => v.includes('FINANCIADO')),
      retorno: header.findIndex(v => v.startsWith('RETORNO')),
      spfPagar: header.findIndex(v => v.includes('SPF A PAGAR')),
      rentab: header.findIndex(v => v.includes('RENTAB'))
    };

    if (
      indexes.cliente < 0 ||
      indexes.banco < 0 ||
      indexes.vendedor < 0 ||
      indexes.financiado < 0
    ) {
      return null;
    }

    const extracted = this.extractData(sectionRows, indexes);
    const sellers = this.extractSellers(
      sectionRows,
      indexes,
      extracted.sellerAgg
    );

    if (!sellers.length) return null;

    return {
      name: storeName,
      label,
      brand,
      color: storeConfig.getStoreColor(storeName),
      sourceFile: fileName,
      month: detectedMonth,
      monthLabel: monthConfig.getMonthLabel(detectedMonth),
      monthOrder: MONTH_NAMES[detectedMonth] || 99,
      storeKey,
      sellers,
      kpis: {
        financiado: extracted.financiado,
        retorno: extracted.retorno,
        spfPagar: extracted.spfPagar,
        rentab: extracted.rentab,
        operacoes: extracted.operacoes
      },
      bancos: extracted.bancos,
      rCounts: extracted.rCounts,
      active: true
    };
  }

  static extractData(sectionRows, indexes) {
    let financiado = 0;
    let retorno = 0;
    let spfPagar = 0;
    let rentab = 0;
    let operacoes = 0;

    const bancos = {};
    const rCounts = {};
    const sellerAgg = new Map();

    R_TYPES.forEach(r => {
      rCounts[r] = 0;
    });

    for (let i = 1; i < sectionRows.length; i++) {
      const row = sectionRows[i];

      const cliente = cleanText(row[indexes.cliente]);
      const vendedor = cleanText(row[indexes.vendedor]);

      // A operação precisa ter cliente e vendedor.
      // Não usamos "valores > 0" como critério porque uma venda com
      // COM SPF pode ter retorno/receita/SPF a pagar temporariamente em 0.
      if (!this.isTransactionRow(cliente, vendedor)) continue;

      const banco = cleanText(row[indexes.banco]);
      const fin = parseCurrencyValue(row[indexes.financiado]);

      const ret =
        indexes.retorno >= 0
          ? parseCurrencyValue(row[indexes.retorno])
          : 0;

      const spfValue =
        indexes.spfPagar >= 0
          ? parseCurrencyValue(row[indexes.spfPagar])
          : 0;

      const rent =
        indexes.rentab >= 0
          ? parseCurrencyValue(row[indexes.rentab])
          : ret + spfValue;

      const spfStatus =
        indexes.spfStatus >= 0 ? row[indexes.spfStatus] : '';

      // Quantidade de SPF = quantidade de operações marcadas COM SPF.
      const hasSpf = this.isWithSpf(spfStatus);

      financiado += fin;
      retorno += ret;
      spfPagar += spfValue;
      rentab += rent;
      operacoes++;

      if (banco) {
        const bankKey = normalizeKey(banco);
        bancos[bankKey] = (bancos[bankKey] || 0) + fin;
      }

      const rValue = this.normalizeRType(row[indexes.r]);

      if (Object.prototype.hasOwnProperty.call(rCounts, rValue)) {
        rCounts[rValue]++;
      }

      const sellerKey = normalizeKey(vendedor);

      if (!sellerAgg.has(sellerKey)) {
        sellerAgg.set(sellerKey, {
          name: vendedor,
          ...Object.fromEntries(R_TYPES.map(r => [r, 0])),
          SPF: 0,
          receita: 0,
          financiado: 0,
          retorno: 0,
          spfValor: 0,
          rentab: 0,
          operacoes: 0
        });
      }

      const seller = sellerAgg.get(sellerKey);

      if (Object.prototype.hasOwnProperty.call(seller, rValue)) {
        seller[rValue]++;
      }

      if (hasSpf) {
        seller.SPF++;
      }

      seller.receita += rent;
      seller.financiado += fin;
      seller.retorno += ret;
      seller.spfValor += spfValue;
      seller.rentab += rent;
      seller.operacoes++;
    }

    return {
      financiado,
      retorno,
      spfPagar,
      rentab,
      operacoes,
      bancos,
      rCounts,
      sellerAgg
    };
  }

  /**
   * Retorna apenas as operações reais da tabela principal.
   */
  static isTransactionRow(cliente, vendedor) {
    if (!cliente || !vendedor) return false;

    const clienteKey = normalizeKey(cliente);
    const vendedorKey = normalizeKey(vendedor);

    if (
      clienteKey === 'CLIENTE' ||
      clienteKey === 'TOTAL' ||
      vendedorKey === 'VENDEDOR' ||
      vendedorKey === 'TOTAL'
    ) {
      return false;
    }

    return true;
  }

  /**
   * "SPF" na aba de vendedores é uma coluna de status.
   *
   * Aceitamos também algumas variações para tornar o CSV robusto:
   * COM SPF, COMSPF, COM-SPF, SIM e valores numéricos > 0.
   */
  static isWithSpf(value) {
    if (typeof value === 'number') return value > 0;

    const key = normalizeKey(value).replace(/[\s_-]+/g, '');

    return (
      key === 'COMSPF' ||
      key === 'SIM' ||
      key === '1' ||
      key === 'TRUE'
    );
  }

  /**
   * Os vendedores são derivados da tabela principal.
   * A tabela-resumo lateral da planilha é deliberadamente ignorada,
   * pois pode não conter vendedores/operações com valores financeiros 0.
   */
  static extractSellers(sectionRows, indexes, sellerAgg) {
    return Array.from(sellerAgg.values()).map(seller => ({
      name: seller.name,
      R0: seller.R0 || 0,
      R1: seller.R1 || 0,
      R2: seller.R2 || 0,
      R3: seller.R3 || 0,
      R4: seller.R4 || 0,
      R5: seller.R5 || 0,
      R150: seller.R150 || 0,
      R100: seller.R100 || 0,
      R75: seller.R75 || 0,
      R50: seller.R50 || 0,
      SPF: seller.SPF || 0,
      receita: seller.receita || 0,
      financiado: seller.financiado || 0,
      retorno: seller.retorno || 0,
      spfValor: seller.spfValor || 0,
      rentab: seller.rentab || 0,
      operacoes: seller.operacoes || 0
    }));
  }

  static normalizeRType(rValue) {
    const rRaw = normalizeKey(rValue).replace(/\s+/g, '');

    let normalized = rRaw
      .replace(/^R-?150$/, 'R150')
      .replace(/^R-?100$/, 'R100')
      .replace(/^R-?75$/, 'R75')
      .replace(/^R-?50$/, 'R50');

    if (
      normalized === 'RVW' ||
      normalized === 'R-VW' ||
      normalized === 'RVOLKSWAGEN'
    ) {
      normalized = 'R150';
    }

    return normalized;
  }

  static findTitleBeforeHeader(rows, headerIndex) {
    const monthRegex =
      /(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/i;

    for (
      let i = headerIndex - 1;
      i >= Math.max(0, headerIndex - 6);
      i--
    ) {
      const row = rows[i];

      for (const cell of row) {
        const value = cleanText(cell);

        if (
          value &&
          monthRegex.test(value) &&
          value.length <= 100
        ) {
          return value;
        }
      }
    }

    for (
      let i = headerIndex - 1;
      i >= Math.max(0, headerIndex - 6);
      i--
    ) {
      const row = rows[i];

      for (const cell of row) {
        const value = cleanText(cell);

        if (
          value &&
          /(MANDARIM|TERRACOTA|BYD)/i.test(value) &&
          value.length <= 100
        ) {
          return value;
        }
      }
    }

    return '';
  }

  static makeFallbackStoreName(fileName, sectionIndex) {
    const base = fileName.replace(/\.[^.]+$/, '');
    return sectionIndex > 0
      ? `${base} • Seção ${sectionIndex + 1}`
      : base;
  }

  static inferBrand(fileName, storeName) {
    const text = normalizeKey(`${fileName} ${storeName}`);

    if (text.includes('TERRACOTA')) return 'TERRACOTA';
    if (text.includes('BYD')) return 'BYD';
    if (text.includes('MANDARIM')) return 'BYD';

    return 'MULTIMARCAS';
  }

  static displayStoreName(rawName) {
    let name = cleanText(rawName);

    name = name.replace(
      /\s*[-–—]\s*(JANEIRO|FEVEREIRO|MARCO|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)\s*$/i,
      ''
    );

    return name.replace(/\s+/g, ' ').trim();
  }
}
