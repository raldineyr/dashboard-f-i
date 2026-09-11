import {
  cleanText,
  normalizeKey,
  parseCurrencyValue
} from '../utils/formatters.js';

import {
  MONTH_NAMES
} from '../utils/constants.js';

import { storeConfig } from '../config/store.config.js';
import { monthConfig } from '../config/month.config.js';

/**
 * Extrai dados de arquivos CSV/XLSX que podem conter:
 *
 * - várias lojas no mesmo arquivo;
 * - tabela de operações;
 * - tabelas de resumo ao lado da tabela de operações;
 * - diferentes nomes para as mesmas colunas.
 *
 * Nomenclatura utilizada pelo Dashboard:
 *
 * RET. SPF
 *   -> RETORNO SPF
 *
 * RET. RENTABILIDADE
 *   -> RETORNO RENTABILIDADE
 *
 * RENTAB. TOTAL
 *   -> RENTABILIDADE TOTAL
 *
 * Identificação da MG Inglaterra:
 *
 * MG INGLATERRA
 * MG INGLATERRA SSA
 * INGLATERRA
 *
 * Todas representam:
 *
 * Nome da loja:
 *   MG INGLATERRA
 *
 * Nome curto:
 *   MG IGT
 */
export class DataExtractor {

  // ==============================================================
  // EXTRAÇÃO PRINCIPAL
  // ==============================================================

  static extract(rows, fileName = '') {

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {
      return [];
    }

    const headers =
      this.findTransactionHeaders(rows);

    if (!headers.length) {

      console.warn(
        `[DataExtractor] Nenhum cabeçalho de transações encontrado em: ${fileName}`
      );

      return [];
    }

    const result = [];

    for (
      let i = 0;
      i < headers.length;
      i++
    ) {

      const start =
        headers[i];

      const end =
        headers[i + 1] ??
        rows.length;

      const parsed =
        this.parseSection(
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


  // ==============================================================
  // LOCALIZA OS CABEÇALHOS DAS TRANSAÇÕES
  // ==============================================================

  static findTransactionHeaders(rows) {

    const headers = [];

    for (
      let i = 0;
      i < rows.length;
      i++
    ) {

      const row =
        Array.isArray(rows[i])
          ? rows[i]
          : [];

      const values =
        row.map(
          value =>
            this.normalizeHeader(value)
        );


      const hasCliente =
        values.includes('CLIENTE');


      const hasBanco =
        values.includes('BANCO');


      const hasVendedor =
        values.includes('VENDEDOR');


      const hasFinanciamento =
        values.includes('FINANCIAMENTO') ||
        values.includes('FINANCIADO') ||
        values.includes('VALOR FINANCIADO') ||
        values.includes('VAL. FINANCIADO');


      const hasCpfCnpj =
        values.includes('CPF/CNPJ') ||
        values.includes('CPF CNPJ') ||
        values.some(
          value =>
            value.includes('CPF/CNPJ')
        );


      const hasTipo =
        values.includes('PJ/PF') ||
        values.includes('PJ PF');


      if (
        hasCliente &&
        hasBanco &&
        hasVendedor &&
        hasFinanciamento &&
        (hasCpfCnpj || hasTipo)
      ) {

        headers.push(i);
      }
    }

    return headers;
  }


  // ==============================================================
  // PROCESSA UMA SEÇÃO / LOJA
  // ==============================================================

  static parseSection(
    rows,
    start,
    end,
    fileName,
    sectionIndex = 0
  ) {

    const sectionRows =
      rows.slice(
        start,
        end
      );


    if (
      !sectionRows.length
    ) {
      return null;
    }


    // ------------------------------------------------------------
    // 1. IDENTIFICAÇÃO DA LOJA
    // ------------------------------------------------------------

    const rawStoreName =
      this.findTitleBeforeHeader(
        rows,
        start
      ) ||
      this.makeFallbackStoreName(
        fileName,
        sectionIndex
      );


    const brand =
      this.inferBrand(
        fileName,
        rawStoreName
      );


    /*
     * IMPORTANTE:
     *
     * storeName mantém o nome oficial.
     *
     * Para MG INGLATERRA:
     *
     * rawStoreName:
     *   MG INGLATERRA SSA
     *
     * storeName:
     *   MG INGLATERRA
     *
     * shortName:
     *   MG IGT
     */

    const storeName =
      this.displayStoreName(
        rawStoreName
      );


    const detectedMonth =
      monthConfig.detectMonth(
        `${fileName} ${rawStoreName}`
      );


    const label =
      this.buildStoreLabel(
        brand,
        storeName
      );


    const storeKey =
      this.buildStoreKey(
        brand,
        storeName
      );


    const shortName =
      this.getShortStoreName(
        brand,
        storeName
      );


    // ------------------------------------------------------------
    // 2. CABEÇALHO DA TABELA DE OPERAÇÕES
    // ------------------------------------------------------------

    const txHeader = 0;


    const header =
      sectionRows[txHeader].map(
        value =>
          this.normalizeHeader(value)
      );


    const idxCliente =
      this.findExactHeader(
        header,
        [
          'CLIENTE'
        ]
      );


    const idxBanco =
      this.findExactHeader(
        header,
        [
          'BANCO'
        ]
      );


    const idxVendedor =
      this.findExactHeader(
        header,
        [
          'VENDEDOR',
          'VEND'
        ]
      );


    const idxR =
      this.findExactHeader(
        header,
        [
          'R',
          'R%'
        ]
      );


    const idxSpfStatus =
      this.findExactHeader(
        header,
        [
          'SPF',
          'STATUS SPF',
          'SPF STATUS'
        ]
      );


    const idxFinanciado =
      this.findHeader(
        header,
        [
          'FINANCIAMENTO',
          'FINANCIADO',
          'VALOR FINANCIADO',
          'VAL. FINANCIADO',
          'VALOR FINANC.'
        ]
      );


    const idxRetSpf =
      this.findHeader(
        header,
        [
          'RET. SPF',
          'RETORNO SPF',
          'RET SPF',
          'RET. SPF TOTAL',
          'RET SPF TOTAL'
        ]
      );


    const idxRetRentab =
      this.findHeader(
        header,
        [
          'RET. RENTABILIDADE',
          'RETORNO RENTABILIDADE',
          'RET. RENTAB.',
          'RETORNO RENTAB.',
          'RET RENTABILIDADE',
          'RET RENTAB'
        ]
      );


    const idxRetornoGenerico =
      this.findHeader(
        header,
        [
          'RETORNO',
          'RETORNO TOTAL'
        ]
      );


    const idxSpfPagar =
      this.findHeader(
        header,
        [
          'SPF A PAGAR',
          'SPF PAGAR',
          'SPF A RECEBER'
        ]
      );


    const idxRentabTotal =
      this.findHeader(
        header,
        [
          'RENTAB. TOTAL',
          'RENTAB TOTAL',
          'RENTABILIDADE TOTAL',
          'RENTAB. BRUTA',
          'RENTABILIDADE BRUTA'
        ]
      );


    // ------------------------------------------------------------
    // VALIDAÇÃO DA ESTRUTURA
    // ------------------------------------------------------------

    if (
      idxCliente < 0 ||
      idxBanco < 0 ||
      idxVendedor < 0 ||
      idxFinanciado < 0
    ) {

      console.warn(
        `[DataExtractor] Estrutura de operações inválida na seção ${sectionIndex + 1} de ${fileName}`
      );

      return null;
    }


    // ------------------------------------------------------------
    // 3. ACUMULADORES
    // ------------------------------------------------------------

    let financiado = 0;

    /*
     * retorno
     *
     * Representa:
     * RETORNO SPF
     */
    let retorno = 0;


    /*
     * retornoRentab
     *
     * Representa:
     * RETORNO RENTABILIDADE
     */
    let retornoRentab = 0;


    let spfPagar = 0;


    /*
     * rentab
     *
     * Representa:
     * RENTABILIDADE TOTAL
     */
    let rentab = 0;


    let operacoes = 0;


    const bancos = {};


    const rCounts = {

      R0: 0,

      R1: 0,

      R2: 0,

      R3: 0,

      R4: 0,

      R5: 0,

      R50: 0,

      R75: 0,

      R100: 0,

      R150: 0,

      RVW: 0

    };


    const sellerAgg =
      new Map();


    // ------------------------------------------------------------
    // 4. LEITURA DAS OPERAÇÕES
    // ------------------------------------------------------------

    for (
      let i = txHeader + 1;
      i < sectionRows.length;
      i++
    ) {

      const row =
        Array.isArray(
          sectionRows[i]
        )
          ? sectionRows[i]
          : [];


      if (
        !row.length
      ) {
        continue;
      }


      const cliente =
        cleanText(
          row[idxCliente]
        );


      const banco =
        cleanText(
          row[idxBanco]
        );


      const vendedor =
        cleanText(
          row[idxVendedor]
        );


      // ----------------------------------------------------------
      // LINHAS DE TOTAL
      // ----------------------------------------------------------

      if (
        this.isTotalRow(
          cliente
        )
      ) {

        break;
      }


      if (
        !cliente
      ) {

        continue;
      }


      /*
       * Evita interpretar linhas
       * numéricas isoladas como clientes.
       */

      if (
        /^\d+$/.test(cliente)
      ) {

        continue;
      }


      if (
        !banco &&
        !vendedor
      ) {

        continue;
      }


      // ----------------------------------------------------------
      // LEITURA FINANCEIRA
      // ----------------------------------------------------------

      const fin =
        this.readCurrency(
          row,
          idxFinanciado
        );


      const retSpf =
        this.readCurrency(
          row,
          idxRetSpf
        );


      const retRentab =
        this.readCurrency(
          row,
          idxRetRentab
        );


      const retGenerico =
        this.readCurrency(
          row,
          idxRetornoGenerico
        );


      const spf =
        this.readCurrency(
          row,
          idxSpfPagar
        );


      const rentTotal =
        this.readCurrency(
          row,
          idxRentabTotal
        );


      // ----------------------------------------------------------
      // DEFINIÇÃO DO RETORNO SPF
      // ----------------------------------------------------------

      let retSPFValor = 0;


      if (
        idxRetSpf >= 0
      ) {

        retSPFValor =
          retSpf;

      } else if (
        idxRetornoGenerico >= 0
      ) {

        retSPFValor =
          retGenerico;
      }


      // ----------------------------------------------------------
      // IGNORA LINHAS SEM VALORES
      // ----------------------------------------------------------

      if (
        fin <= 0 &&
        retSPFValor <= 0 &&
        retRentab <= 0 &&
        rentTotal <= 0 &&
        spf <= 0
      ) {

        continue;
      }


      // ----------------------------------------------------------
      // KPIs
      // ----------------------------------------------------------

      financiado +=
        fin;


      /*
       * Rentabilidade SPF
       */
      retorno +=
        retSPFValor;


      /*
       * Rentabilidade Retorno
       */
      retornoRentab +=
        retRentab;


      /*
       * SPF A PAGAR
       */
      spfPagar +=
        spf;


      /*
       * Rentabilidade Total
       */
      rentab +=
        rentTotal > 0
          ? rentTotal
          : (
              retSPFValor +
              retRentab
            );


      operacoes++;


      // ----------------------------------------------------------
      // BANCOS
      // ----------------------------------------------------------

      if (
        banco
      ) {

        const bankKey =
          this.normalizeHeader(
            banco
          );


        bancos[bankKey] =
          (
            bancos[bankKey] ||
            0
          ) + fin;
      }


      // ----------------------------------------------------------
      // TIPO R
      // ----------------------------------------------------------

      const rKey =
        this.normalizeRType(
          idxR >= 0
            ? row[idxR]
            : ''
        );


      if (
        Object.prototype.hasOwnProperty.call(
          rCounts,
          rKey
        )
      ) {

        rCounts[rKey]++;
      }


      // ----------------------------------------------------------
      // AGRUPAMENTO POR VENDEDOR
      // ----------------------------------------------------------

      if (
        vendedor
      ) {

        if (
          !sellerAgg.has(
            vendedor
          )
        ) {

          sellerAgg.set(
            vendedor,
            {

              name:
                vendedor,

              nome:
                vendedor,


              R0: 0,

              R1: 0,

              R2: 0,

              R3: 0,

              R4: 0,

              R5: 0,

              R50: 0,

              R75: 0,

              R100: 0,

              R150: 0,

              RVW: 0,


              SPF: 0,


              receita: 0,


              /*
               * Retorno SPF
               */
              retorno: 0,


              /*
               * Retorno Rentabilidade
               */
              retornoRentab: 0,


              /*
               * Rentabilidade Total
               */
              rentab: 0,


              /*
               * Total financiado
               */
              financiado: 0,


              operacoes: 0,


              financiamentos: 0

            }
          );
        }


        const seller =
          sellerAgg.get(
            vendedor
          );


        // --------------------------------------------------------
        // CONTAGEM R
        // --------------------------------------------------------

        if (
          Object.prototype.hasOwnProperty.call(
            seller,
            rKey
          )
        ) {

          seller[rKey]++;
        }


        // --------------------------------------------------------
        // SPF
        // --------------------------------------------------------

        if (
          this.isWithSpf(
            idxSpfStatus >= 0
              ? row[idxSpfStatus]
              : ''
          )
        ) {

          seller.SPF++;
        }


        // --------------------------------------------------------
        // RECEITA
        // --------------------------------------------------------

        seller.receita +=
          rentTotal > 0
            ? rentTotal
            : (
                retSPFValor +
                retRentab
              );


        // --------------------------------------------------------
        // RENTABILIDADE TOTAL
        // --------------------------------------------------------

        seller.rentab +=
          rentTotal > 0
            ? rentTotal
            : (
                retSPFValor +
                retRentab
              );


        // --------------------------------------------------------
        // RETORNO SPF
        // --------------------------------------------------------

        seller.retorno +=
          retSPFValor;


        // --------------------------------------------------------
        // RETORNO RENTABILIDADE
        // --------------------------------------------------------

        seller.retornoRentab +=
          retRentab;


        // --------------------------------------------------------
        // FINANCIADO
        // --------------------------------------------------------

        seller.financiado +=
          fin;


        // --------------------------------------------------------
        // OPERAÇÕES
        // --------------------------------------------------------

        seller.operacoes++;


        seller.financiamentos++;
      }
    }


    // ------------------------------------------------------------
    // 5. RESUMO OFICIAL DOS VENDEDORES
    // ------------------------------------------------------------

    let sellers =
      this.extractOfficialSellerSummary(
        sectionRows,
        sellerAgg
      );


    /*
     * Caso não exista um resumo oficial,
     * utiliza os vendedores calculados
     * diretamente das operações.
     */

    if (
      !sellers.length
    ) {

      sellers =
        Array.from(
          sellerAgg.values()
        );
    }


    if (
      !sellers.length &&
      operacoes === 0
    ) {

      return null;
    }


    // ------------------------------------------------------------
    // GARANTE RENTABILIDADE TOTAL
    // ------------------------------------------------------------

    if (
      rentab === 0 &&
      (
        retorno > 0 ||
        retornoRentab > 0
      )
    ) {

      rentab =
        retorno +
        retornoRentab;
    }


    // ------------------------------------------------------------
    // 6. RESULTADO
    // ------------------------------------------------------------

    return {

      /*
       * Nome oficial da loja.
       *
       * MG INGLATERRA
       */
      name:
        storeName,


      /*
       * Label utilizado para identificação
       * da loja em componentes gerais.
       *
       * MG INGLATERRA
       */
      label,


      /*
       * Nome curto.
       *
       * MG IGT
       *
       * A SellerTable pode utilizar
       * essa propriedade para evitar
       * nomes muito grandes.
       */
      shortName,


      /*
       * Marca / identificação lógica.
       *
       * MG IGT
       */
      brand,


      color:
        this.getStoreColor(
          storeName
        ),


      sourceFile:
        fileName,


      month:
        detectedMonth,


      monthLabel:
        monthConfig.getMonthLabel(
          detectedMonth
        ),


      monthOrder:
        MONTH_NAMES[
          detectedMonth
        ] ?? 99,


      /*
       * Chave estável da loja.
       *
       * Para MG INGLATERRA:
       *
       * normalizeKey('MG INGLATERRA')
       */
      storeKey,


      sellers,


      // ----------------------------------------------------------
      // KPIs
      // ----------------------------------------------------------

      kpis: {

        /*
         * Total Financiado
         */
        financiado,


        /*
         * Rentabilidade SPF
         */
        retorno,


        /*
         * Rentabilidade Retorno
         */
        retornoRentab,


        /*
         * SPF A Pagar
         */
        spfPagar,


        /*
         * Rentabilidade Total
         */
        rentab,


        /*
         * Operações
         */
        operacoes

      },


      bancos,


      rCounts,


      active:
        true

    };
  }


  // ==============================================================
  // RESUMO OFICIAL DOS VENDEDORES
  // ==============================================================

  static extractOfficialSellerSummary(
    sectionRows,
    sellerAgg
  ) {

    const sellers = [];


    for (
      let i = 0;
      i < sectionRows.length;
      i++
    ) {

      const row =
        Array.isArray(
          sectionRows[i]
        )
          ? sectionRows[i]
          : [];


      const header =
        row.map(
          value =>
            this.normalizeHeader(
              value
            )
        );


      const vendedorHeader =
        header.indexOf(
          'VENDEDOR'
        );


      if (
        vendedorHeader < 0
      ) {

        continue;
      }


      const r0Index =
        this.findNextExact(
          header,
          'R0',
          vendedorHeader + 1
        );


      const receitaIndex =
        this.findNextExact(
          header,
          'RECEITA',
          vendedorHeader + 1
        );


      if (
        r0Index < 0 ||
        receitaIndex < 0 ||
        r0Index <= vendedorHeader
      ) {

        continue;
      }


      const requiredR = [

        'R1',

        'R2',

        'R3',

        'R4',

        'R5'

      ];


      const hasExpectedRColumns =
        requiredR.every(
          value =>
            header.some(
              (
                headerValue,
                index
              ) =>
                index > r0Index &&
                headerValue === value
            )
        );


      if (
        !hasExpectedRColumns
      ) {

        continue;
      }


      // ----------------------------------------------------------
      // LEITURA DO RESUMO
      // ----------------------------------------------------------

      for (
        let j = i + 1;
        j < sectionRows.length;
        j++
      ) {

        const rr =
          sectionRows[j];


        const name =
          cleanText(
            rr[vendedorHeader]
          );


        if (
          !name
        ) {

          continue;
        }


        const normalizedName =
          this.normalizeHeader(
            name
          );


        if (
          normalizedName === 'TOTAL'
        ) {

          break;
        }


        if (
          /^\d+$/.test(name)
        ) {

          continue;
        }


        if (
          /BANCO|CLIENTE|MOTIVO|LOJAS|LOCALIDADE/i.test(
            normalizedName
          )
        ) {

          continue;
        }


        const operationSeller =
          sellerAgg.get(
            name
          );


        sellers.push({

          name,

          nome:
            name,


          R0:
            this.readInteger(
              rr[r0Index]
            ),


          R1:
            this.readInteger(
              rr[r0Index + 1]
            ),


          R2:
            this.readInteger(
              rr[r0Index + 2]
            ),


          R3:
            this.readInteger(
              rr[r0Index + 3]
            ),


          R4:
            this.readInteger(
              rr[r0Index + 4]
            ),


          R5:
            this.readInteger(
              rr[r0Index + 5]
            ),


          RVW:
            this.readInteger(
              rr[r0Index + 6]
            ),


          SPF:
            this.readInteger(
              rr[r0Index + 7]
            ),


          receita:
            this.readCurrency(
              rr[receitaIndex]
            ),


          // ----------------------------------------------------
          // DADOS CALCULADOS DAS OPERAÇÕES
          // ----------------------------------------------------

          retorno:
            operationSeller?.retorno ||
            0,


          retornoRentab:
            operationSeller?.retornoRentab ||
            0,


          rentab:
            operationSeller?.rentab ||
            0,


          financiado:
            operationSeller?.financiado ||
            0,


          operacoes:
            operationSeller?.operacoes ||
            0,


          financiamentos:
            operationSeller?.financiamentos ||
            0

        });
      }


      if (
        sellers.length
      ) {

        break;
      }
    }


    return sellers;
  }


  // ==============================================================
  // IDENTIFICAÇÃO DA LOJA
  // ==============================================================

  static findTitleBeforeHeader(
    rows,
    headerIndex
  ) {

    const monthRegex =
      /(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/i;


    // ------------------------------------------------------------
    // PRIMEIRA TENTATIVA:
    // PROCURA POR MÊS
    // ------------------------------------------------------------

    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 8
      );
      i--
    ) {

      const row =
        Array.isArray(rows[i])
          ? rows[i]
          : [];


      for (
        const cell of row
      ) {

        const value =
          cleanText(
            cell
          );


        if (
          value &&
          monthRegex.test(value) &&
          value.length <= 120
        ) {

          return value;
        }
      }
    }


    // ------------------------------------------------------------
    // SEGUNDA TENTATIVA:
    // PROCURA POR NOME DE LOJA
    // ------------------------------------------------------------

    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 8
      );
      i--
    ) {

      const row =
        Array.isArray(rows[i])
          ? rows[i]
          : [];


      for (
        const cell of row
      ) {

        const value =
          cleanText(
            cell
          );


        /*
         * Aqui incluímos INGLATERRA.
         *
         * Isso é importante para que
         * "MG INGLATERRA SSA" seja
         * reconhecido como a loja
         * MG INGLATERRA.
         */

        if (
          value &&
          /(MANDARIM|TERRACOTA|BYD|MG INGLATERRA|INGLATERRA)/i.test(
            value
          ) &&
          value.length <= 120
        ) {

          return value;
        }
      }
    }


    return '';
  }


  // ==============================================================
  // FALLBACK DO NOME DA LOJA
  // ==============================================================

  static makeFallbackStoreName(
    fileName,
    sectionIndex
  ) {

    const base =
      String(
        fileName || ''
      ).replace(
        /\.[^.]+$/,
        ''
      );


    return sectionIndex > 0
      ? `${base} • Seção ${sectionIndex + 1}`
      : base;
  }


  // ==============================================================
  // IDENTIFICA A MARCA
  // ==============================================================

  static inferBrand(
    fileName,
    storeName
  ) {

    const text =
      normalizeKey(
        `${fileName} ${storeName}`
      );


    // ------------------------------------------------------------
    // TERRACOTA
    // ------------------------------------------------------------

    if (
      text.includes(
        'TERRACOTA'
      )
    ) {

      return 'TERRACOTA';
    }


    // ------------------------------------------------------------
    // BYD / MANDARIM
    // ------------------------------------------------------------

    if (
      text.includes(
        'BYD'
      ) ||
      text.includes(
        'MANDARIM'
      )
    ) {

      return 'BYD';
    }


    // ------------------------------------------------------------
    // MG INGLATERRA
    // ------------------------------------------------------------

    if (
      text.includes(
        'MG INGLATERRA'
      ) ||
      text.includes(
        'INGLATERRA'
      )
    ) {

      return 'MG IGT';
    }


    // ------------------------------------------------------------
    // FALLBACK
    // ------------------------------------------------------------

    return 'MULTIMARCAS';
  }


  // ==============================================================
  // NORMALIZA O NOME OFICIAL DA LOJA
  // ==============================================================

  static displayStoreName(
    rawName
  ) {

    let name =
      cleanText(
        rawName
      );


    /*
     * Remove o mês quando ele estiver
     * no final do nome.
     *
     * Exemplo:
     *
     * MG INGLATERRA SSA - JULHO
     *
     * vira:
     *
     * MG INGLATERRA SSA
     */

    name =
      name.replace(
        /\s*[-–—]\s*(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)(?:\s*[-–—]\s*\d+)?\s*$/i,
        ''
      );


    /*
     * ----------------------------------------------------------
     * REGRA ESPECIAL MG INGLATERRA
     * ----------------------------------------------------------
     *
     * Independentemente de aparecer:
     *
     * MG INGLATERRA
     * MG INGLATERRA SSA
     * INGLATERRA
     *
     * o nome oficial da loja será:
     *
     * MG INGLATERRA
     */

    const normalized =
      this.normalizeHeader(
        name
      );


    if (
      normalized.includes(
        'MG INGLATERRA'
      ) ||
      normalized.includes(
        'INGLATERRA'
      )
    ) {

      return 'MG INGLATERRA';
    }


    return name
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }


  // ==============================================================
  // LABEL DA LOJA
  // ==============================================================

  static buildStoreLabel(
    brand,
    storeName
  ) {

    /*
     * MG IGT é apenas a identificação
     * curta da marca.
     *
     * O nome da loja continua sendo:
     *
     * MG INGLATERRA
     */

    if (
      brand === 'MG IGT'
    ) {

      return 'MG INGLATERRA';
    }


    return `${brand} • ${storeName}`;
  }


  // ==============================================================
  // CHAVE DA LOJA
  // ==============================================================

  static buildStoreKey(
    brand,
    storeName
  ) {

    /*
     * A chave precisa representar
     * a loja real e não o apelido.
     *
     * Portanto:
     *
     * MG IGT
     *
     * não é usado aqui.
     *
     * A chave será:
     *
     * MG INGLATERRA
     */

    if (
      brand === 'MG IGT'
    ) {

      return normalizeKey(
        'MG INGLATERRA'
      );
    }


    return normalizeKey(
      `${brand} ${storeName}`
    );
  }


  // ==============================================================
  // NOME CURTO DA LOJA
  // ==============================================================

  static getShortStoreName(
    brand,
    storeName
  ) {

    /*
     * Esse campo existe especificamente
     * para componentes que possuem pouco
     * espaço horizontal.
     *
     * Exemplo:
     *
     * SellerTable
     * filtros
     * indicadores
     * comparativos compactos
     */

    if (
      brand === 'MG IGT'
    ) {

      return 'MG IGT';
    }


    return storeName;
  }


  // ==============================================================
  // NORMALIZA CABEÇALHO
  // ==============================================================

  static normalizeHeader(
    value
  ) {

    return cleanText(
      value
    )
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      )
      .toUpperCase()
      .replace(
        /\s+/g,
        ' '
      )
      .trim();
  }


  // ==============================================================
  // LOCALIZA CABEÇALHO EXATO
  // ==============================================================

  static findExactHeader(
    header,
    aliases
  ) {

    const normalizedHeader =
      header.map(
        value =>
          this.normalizeHeader(
            value
          )
      );


    for (
      const alias of aliases
    ) {

      const index =
        normalizedHeader.indexOf(
          this.normalizeHeader(
            alias
          )
        );


      if (
        index >= 0
      ) {

        return index;
      }
    }


    return -1;
  }


  // ==============================================================
  // LOCALIZA CABEÇALHO POR INCLUSÃO
  // ==============================================================

  static findHeader(
    header,
    aliases
  ) {

    const exact =
      this.findExactHeader(
        header,
        aliases
      );


    if (
      exact >= 0
    ) {

      return exact;
    }


    const normalizedHeader =
      header.map(
        value =>
          this.normalizeHeader(
            value
          )
      );


    const normalizedAliases =
      aliases.map(
        alias =>
          this.normalizeHeader(
            alias
          )
      );


    for (
      const alias of normalizedAliases
    ) {

      const index =
        normalizedHeader.findIndex(
          value =>
            value.includes(
              alias
            )
        );


      if (
        index >= 0
      ) {

        return index;
      }
    }


    return -1;
  }


  // ==============================================================
  // LOCALIZA PRÓXIMO CABEÇALHO EXATO
  // ==============================================================

  static findNextExact(
    header,
    value,
    startIndex = 0
  ) {

    const target =
      this.normalizeHeader(
        value
      );


    for (
      let i =
        Math.max(
          0,
          startIndex
        );

      i <
      header.length;

      i++
    ) {

      if (
        this.normalizeHeader(
          header[i]
        ) === target
      ) {

        return i;
      }
    }


    return -1;
  }


  // ==============================================================
  // LEITURA DE MOEDA
  // ==============================================================

  static readCurrency(
    row,
    index
  ) {

    if (
      index < 0 ||
      !Array.isArray(row)
    ) {

      return 0;
    }


    return parseCurrencyValue(
      row[index]
    );
  }


  // ==============================================================
  // LEITURA DE INTEIRO
  // ==============================================================

  static readInteger(
    value
  ) {

    const text =
      cleanText(
        value
      );


    if (
      !text
    ) {

      return 0;
    }


    const numeric =
      Number(
        text
          .replace(
            /\./g,
            ''
          )
          .replace(
            ',',
            '.'
          )
      );


    if (
      Number.isFinite(
        numeric
      )
    ) {

      return Math.round(
        numeric
      );
    }


    return (
      parseInt(
        text,
        10
      ) || 0
    );
  }


  // ==============================================================
  // IDENTIFICA LINHA DE TOTAL
  // ==============================================================

  static isTotalRow(
    value
  ) {

    const normalized =
      this.normalizeHeader(
        value
      );


    return (
      normalized === 'TOTAL' ||
      normalized === 'TOTAL GERAL' ||
      normalized.startsWith(
        'TOTAL '
      )
    );
  }


  // ==============================================================
  // IDENTIFICA COM SPF
  // ==============================================================

  static isWithSpf(
    value
  ) {

    const normalized =
      this.normalizeHeader(
        value
      );


    return (
      normalized === 'COM SPF' ||
      normalized === 'SPF' ||
      normalized === 'SIM' ||
      normalized === 'COMSPF' ||
      normalized === '1'
    );
  }


  // ==============================================================
  // NORMALIZA TIPO R
  // ==============================================================

  static normalizeRType(
    value
  ) {

    let r =
      this.normalizeHeader(
        value
      )
      .replace(
        /\s+/g,
        ''
      );


    /*
     * Tratamento legado do R Volkswagen.
     */

    if (
      r === 'R-VW' ||
      r === 'RVOLKSWAGEN' ||
      r === 'RVW'
    ) {

      return 'RVW';
    }


    if (
      [
        'R0',
        'R1',
        'R2',
        'R3',
        'R4',
        'R5',
        'R50',
        'R75',
        'R100',
        'R150'
      ].includes(
        r
      )
    ) {

      return r;
    }


    return r;
  }


  // ==============================================================
  // COR DA LOJA
  // ==============================================================

  static getStoreColor(
    storeName
  ) {

    try {

      if (
        storeConfig &&
        typeof storeConfig.getStoreColor ===
          'function'
      ) {

        return storeConfig.getStoreColor(
          storeName
        );
      }

    } catch (error) {

      console.warn(
        '[DataExtractor] Não foi possível obter a cor da loja:',
        error
      );
    }


    return '#64748b';
  }

}