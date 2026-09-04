import {
  cleanText,
  normalizeKey,
  parseCurrencyValue
} from '../utils/formatters.js';

import {
  MONTH_NAMES,
  R_TYPES
} from '../utils/constants.js';

import { storeConfig } from '../config/store.config.js';
import { monthConfig } from '../config/month.config.js';


export class DataExtractor {

  static extract(rows, fileName) {
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const headers = this.findTransactionHeaders(rows);

    if (!headers.length) {
      console.warn(
        `Nenhum cabeçalho de transações encontrado em: ${fileName}`
      );

      return [];
    }

    const result = [];

    for (let i = 0; i < headers.length; i++) {
      const start = headers[i];
      const end = headers[i + 1] ?? rows.length;

      const parsed = this.parseSection(
        rows,
        start,
        end,
        fileName,
        i
      );

      if (parsed) {
        result.push(parsed);
      }
    }

    return result;
  }


  /**
   * Localiza SOMENTE os cabeçalhos reais da tabela de vendas.
   *
   * O CSV possui várias outras áreas contendo:
   * CLIENTE
   * BANCO
   * VENDEDOR
   *
   * Portanto não basta procurar apenas essas três palavras.
   */
  static findTransactionHeaders(rows) {
    const headers = [];

    for (let i = 0; i < rows.length; i++) {
      const row = Array.isArray(rows[i])
        ? rows[i]
        : [];

      const values = row.map(cell =>
        normalizeKey(cell)
      );

      const hasCliente = values.some(
        value => value === 'CLIENTE'
      );

      const hasCpfCnpj = values.some(
        value =>
          value === 'CPF/CNPJ' ||
          value === 'CPF CNPJ' ||
          value.includes('CPF/CNPJ')
      );

      const hasBanco = values.some(
        value => value === 'BANCO'
      );

      const hasTipo = values.some(
        value =>
          value === 'PJ/PF' ||
          value === 'PJ PF'
      );

      const hasVendedor = values.some(
        value =>
          value === 'VENDEDOR' ||
          value === 'VEND'
      );

      const hasFinanciamento = values.some(
        value =>
          value === 'FINANCIAMENTO' ||
          value === 'FINANCIADO'
      );

      /*
       * Este é o cabeçalho real.
       */
      if (
        hasCliente &&
        hasCpfCnpj &&
        hasBanco &&
        hasTipo &&
        hasVendedor &&
        hasFinanciamento
      ) {
        headers.push(i);
      }
    }

    return headers;
  }


  static parseSection(
    rows,
    start,
    end,
    fileName,
    sectionIndex
  ) {
    const sectionRows = rows.slice(start, end);

    if (!sectionRows.length) {
      return null;
    }

    const rawStoreName =
      this.findTitleBeforeHeader(rows, start) ||
      this.makeFallbackStoreName(
        fileName,
        sectionIndex
      );

    const brand = this.inferBrand(
      fileName,
      rawStoreName
    );

    const storeName =
      this.displayStoreName(rawStoreName);

    const detectedMonth =
      monthConfig.detectMonth(
        `${fileName} ${rawStoreName}`
      );

    const label =
      `${brand} • ${storeName}`;

    const storeKey =
      normalizeKey(
        `${brand} ${storeName}`
      );


    /*
     * Primeiro registro da seção = cabeçalho.
     */
    const header = sectionRows[0].map(cell =>
      normalizeKey(cell)
    );


    /*
     * Localiza cada coluna pelo nome.
     */
    const indexes = {

      cliente:
        header.findIndex(
          value => value === 'CLIENTE'
        ),

      cpfCnpj:
        header.findIndex(
          value =>
            value === 'CPF/CNPJ' ||
            value === 'CPF CNPJ' ||
            value.includes('CPF/CNPJ')
        ),

      banco:
        header.findIndex(
          value => value === 'BANCO'
        ),

      tipo:
        header.findIndex(
          value =>
            value === 'PJ/PF' ||
            value === 'PJ PF'
        ),

      vendedor:
        header.findIndex(
          value =>
            value === 'VENDEDOR' ||
            value === 'VEND'
        ),

      r:
        header.findIndex(
          value =>
            value === 'R' ||
            value === 'R%'
        ),

      spfStatus:
        header.findIndex(
          value =>
            value === 'SPF'
        ),

      valorVeiculo:
        header.findIndex(
          value =>
            value.includes('VAL. VEICULO') ||
            value.includes('VAL VEICULO')
        ),

      entrada:
        header.findIndex(
          value =>
            value === 'ENTRADA'
        ),

      financiado:
        header.findIndex(
          value =>
            value === 'FINANCIAMENTO' ||
            value === 'FINANCIADO'
        ),

      retorno:
        header.findIndex(
          value =>
            value === 'RETORNO SPF' ||
            value === 'RETORNO'
        ),

      retornoRentab:
        header.findIndex(
          value =>
            value === 'RETORNO RENTABILIDADE'
        ),

      rentab:
        header.findIndex(
          value =>
            value === 'RENTAB. TOTAL' ||
            value === 'RENTAB TOTAL' ||
            value === 'RENTABILIDADE' ||
            value === 'RENTAB'
        ),

      motivo:
        header.findIndex(
          value =>
            value === 'MOTIVO'
        )
    };


    /*
     * O mínimo necessário para uma seção ser considerada
     * uma tabela de vendas.
     */
    if (
      indexes.vendedor < 0 ||
      indexes.financiado < 0
    ) {
      console.warn(
        'Seção ignorada: colunas VENDEDOR ou FINANCIAMENTO não encontradas.',
        {
          start,
          header: sectionRows[0]
        }
      );

      return null;
    }


    const extracted =
      this.extractData(
        sectionRows,
        indexes
      );


    const sellers =
      this.extractSellers(
        extracted.sellerAgg
      );


    /*
     * Uma seção sem vendedores reais não é uma loja.
     */
    if (!sellers.length) {
      return null;
    }


    return {

      name: storeName,

      label,

      brand,

      color:
        storeConfig.getStoreColor(
          storeName
        ),

      sourceFile: fileName,

      month: detectedMonth,

      monthLabel:
        monthConfig.getMonthLabel(
          detectedMonth
        ),

      monthOrder:
        MONTH_NAMES[detectedMonth] ?? 99,

      storeKey,

      sellers,

      kpis: {

        financiado:
          extracted.financiado,

        retorno:
          extracted.retorno,

        retornoRentab:
          extracted.retornoRentab,

        rentab:
          extracted.rentab,

        operacoes:
          extracted.operacoes
      },

      bancos:
        extracted.bancos,

      rCounts:
        extracted.rCounts,

      active: true
    };
  }


  static extractData(
    sectionRows,
    indexes
  ) {

    let financiado = 0;

    let retorno = 0;

    let retornoRentab = 0;

    let rentab = 0;

    let operacoes = 0;


    const bancos = {};

    const rCounts = {};

    const sellerAgg = new Map();


    R_TYPES.forEach(r => {
      rCounts[r] = 0;
    });


    /*
     * Processa somente as linhas abaixo do cabeçalho.
     */
    for (
      let i = 1;
      i < sectionRows.length;
      i++
    ) {

      const row = sectionRows[i];

      if (!Array.isArray(row)) {
        continue;
      }


      const cliente =
        indexes.cliente >= 0
          ? cleanText(
              row[indexes.cliente]
            )
          : '';


      const vendedor =
        indexes.vendedor >= 0
          ? cleanText(
              row[indexes.vendedor]
            )
          : '';


      /*
       * Ignora linhas que não são operações.
       */
      if (
        !this.isTransactionRow(
          cliente,
          vendedor
        )
      ) {
        continue;
      }


      const banco =
        indexes.banco >= 0
          ? cleanText(
              row[indexes.banco]
            )
          : 'Outros';


      const fin =
        indexes.financiado >= 0
          ? parseCurrencyValue(
              row[indexes.financiado]
            )
          : 0;


      const ret =
        indexes.retorno >= 0
          ? parseCurrencyValue(
              row[indexes.retorno]
            )
          : 0;


      const retornoRentabValue =
        indexes.retornoRentab >= 0
          ? parseCurrencyValue(
              row[indexes.retornoRentab]
            )
          : 0;


      const rent =
        indexes.rentab >= 0
          ? parseCurrencyValue(
              row[indexes.rentab]
            )
          : (
              ret +
              retornoRentabValue
            );


      const spfStatus =
        indexes.spfStatus >= 0
          ? cleanText(
              row[indexes.spfStatus]
            )
          : '';


      const hasSpf =
        this.isWithSpf(
          spfStatus
        );


      /*
       * Acumula KPIs.
       */
      financiado += fin;

      retorno += ret;

      retornoRentab +=
        retornoRentabValue;

      rentab += rent;

      operacoes++;


      /*
       * Bancos.
       */
      if (banco) {

        const bankKey =
          normalizeKey(banco);

        bancos[bankKey] =
          (
            bancos[bankKey] || 0
          ) + fin;
      }


      /*
       * Tipo R.
       */
      const rValue =
        indexes.r >= 0
          ? this.normalizeRType(
              row[indexes.r]
            )
          : 'R0';


      if (
        Object.prototype.hasOwnProperty.call(
          rCounts,
          rValue
        )
      ) {
        rCounts[rValue]++;
      }


      /*
       * Vendedor.
       */
      const sellerKey =
        normalizeKey(vendedor);


      if (!sellerKey) {
        continue;
      }


      if (
        !sellerAgg.has(
          sellerKey
        )
      ) {

        sellerAgg.set(
          sellerKey,
          {

            name: vendedor,

            ...Object.fromEntries(
              R_TYPES.map(
                r => [r, 0]
              )
            ),

            SPF: 0,

            receita: 0,

            financiado: 0,

            retorno: 0,

            retornoRentab: 0,

            rentab: 0,

            operacoes: 0,

            /*
             * Mantemos também o nome
             * utilizado pelo ComparisonSection.
             */
            financiamentos: 0
          }
        );
      }


      const seller =
        sellerAgg.get(
          sellerKey
        );


      if (
        Object.prototype.hasOwnProperty.call(
          seller,
          rValue
        )
      ) {
        seller[rValue]++;
      }


      if (hasSpf) {
        seller.SPF++;
      }


      seller.receita += rent;

      seller.financiado += fin;

      seller.retorno += ret;

      seller.retornoRentab +=
        retornoRentabValue;

      seller.rentab += rent;

      seller.operacoes++;

      /*
       * Compatibilidade com componentes
       * que utilizam "financiamentos".
       */
      seller.financiamentos++;
    }


    return {

      financiado,

      retorno,

      retornoRentab,

      rentab,

      operacoes,

      bancos,

      rCounts,

      sellerAgg
    };
  }


  static isTransactionRow(
    cliente,
    vendedor
  ) {

    if (!vendedor) {
      return false;
    }


    const clienteKey =
      normalizeKey(
        cliente
      );


    const vendedorKey =
      normalizeKey(
        vendedor
      );


    /*
     * Linhas que definitivamente NÃO são vendas.
     */
    const invalidClientes = [
      '',
      'CLIENTE',
      'TOTAL',
      'R',
      'COM SPF',
      'SEM SPF'
    ];


    const invalidVendedores = [
      '',
      'VENDEDOR',
      'TOTAL'
    ];


    if (
      invalidClientes.includes(
        clienteKey
      )
    ) {
      return false;
    }


    if (
      invalidVendedores.includes(
        vendedorKey
      )
    ) {
      return false;
    }


    /*
     * Ignora linhas de indicadores/resumos.
     */
    if (
      clienteKey.includes(
        'ATENCAO'
      ) ||
      clienteKey.includes(
        'ID_TABELAS'
      ) ||
      clienteKey.includes(
        'NOME_DA_TABELA'
      )
    ) {
      return false;
    }


    return true;
  }


  static isWithSpf(value) {

    if (
      typeof value === 'number'
    ) {
      return value > 0;
    }


    const key =
      normalizeKey(
        value
      )
      .replace(
        /[\s_-]+/g,
        ''
      );


    return (
      key === 'COMSPF' ||
      key === 'SIM' ||
      key === '1' ||
      key === 'TRUE'
    );
  }


  static extractSellers(
    sellerAgg
  ) {

    return Array.from(
      sellerAgg.values()
    ).map(
      seller => ({

        nome:
          seller.name,

        name:
          seller.name,

        R0:
          seller.R0 || 0,

        R1:
          seller.R1 || 0,

        R2:
          seller.R2 || 0,

        R3:
          seller.R3 || 0,

        R4:
          seller.R4 || 0,

        R5:
          seller.R5 || 0,

        R150:
          seller.R150 || 0,

        R100:
          seller.R100 || 0,

        R75:
          seller.R75 || 0,

        R50:
          seller.R50 || 0,

        SPF:
          seller.SPF || 0,

        receita:
          seller.receita || 0,

        financiado:
          seller.financiado || 0,

        retorno:
          seller.retorno || 0,

        retornoRentab:
          seller.retornoRentab || 0,

        rentab:
          seller.rentab || 0,

        operacoes:
          seller.operacoes || 0,

        financiamentos:
          seller.financiamentos || 0
      })
    );
  }


  static normalizeRType(
    rValue
  ) {

    const rRaw =
      normalizeKey(
        rValue
      ).replace(
        /\s+/g,
        ''
      );


    let normalized =
      rRaw
        .replace(
          /^R-?150$/,
          'R150'
        )
        .replace(
          /^R-?100$/,
          'R100'
        )
        .replace(
          /^R-?75$/,
          'R75'
        )
        .replace(
          /^R-?50$/,
          'R50'
        );


    if (
      normalized === 'RVW' ||
      normalized === 'RVOLKSWAGEN'
    ) {
      normalized = 'R150';
    }


    /*
     * Se estiver vazio, considera R0.
     */
    if (!normalized) {
      normalized = 'R0';
    }


    return normalized;
  }


  static findTitleBeforeHeader(
    rows,
    headerIndex
  ) {

    const monthRegex =
      /(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/i;


    /*
     * Primeiro tenta encontrar o título da loja
     * imediatamente acima do cabeçalho.
     */
    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 8
      );
      i--
    ) {

      const row = rows[i];

      if (!Array.isArray(row)) {
        continue;
      }


      for (const cell of row) {

        const value =
          cleanText(cell);


        if (
          value &&
          monthRegex.test(value) &&
          value.length <= 120
        ) {
          return value;
        }
      }
    }


    /*
     * Segunda tentativa: TERRACOTA / BYD / MANDARIM.
     */
    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 8
      );
      i--
    ) {

      const row = rows[i];

      if (!Array.isArray(row)) {
        continue;
      }


      for (const cell of row) {

        const value =
          cleanText(cell);


        if (
          value &&
          /(MANDARIM|TERRACOTA|BYD)/i.test(value) &&
          value.length <= 120
        ) {
          return value;
        }
      }
    }


    return '';
  }


  static makeFallbackStoreName(
    fileName,
    sectionIndex
  ) {

    const base =
      fileName.replace(
        /\.[^.]+$/,
        ''
      );


    return sectionIndex > 0
      ? `${base} • Seção ${sectionIndex + 1}`
      : base;
  }


  static inferBrand(
    fileName,
    storeName
  ) {

    const text =
      normalizeKey(
        `${fileName} ${storeName}`
      );


    if (
      text.includes(
        'TERRACOTA'
      )
    ) {
      return 'TERRACOTA';
    }


    if (
      text.includes(
        'BYD'
      )
    ) {
      return 'BYD';
    }


    if (
      text.includes(
        'MANDARIM'
      )
    ) {
      return 'BYD';
    }


    return 'MULTIMARCAS';
  }


  static displayStoreName(
    rawName
  ) {

    let name =
      cleanText(
        rawName
      );


    name =
      name.replace(
        /\s*[-–—]\s*(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)(?:\s*[-–—]\s*\d+)?\s*$/i,
        ''
      );


    return name
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }
}