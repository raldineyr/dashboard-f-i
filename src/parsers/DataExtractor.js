import {
  cleanText,
  normalizeKey,
  parseCurrencyValue
} from '../utils/formatters.js';

import {
  MONTH_NAMES
} from '../utils/constants.js';

import {
  storeConfig
} from '../config/store.config.js';

import {
  monthConfig
} from '../config/month.config.js';


export class DataExtractor {


  // ==============================================================
  // EXTRAÇÃO PRINCIPAL
  // ==============================================================

  static extract(
    rows,
    fileName = ''
  ) {

    if (
      !Array.isArray(rows) ||
      rows.length === 0
    ) {

      return [];
    }


    const headers =
      this.findTransactionHeaders(
        rows
      );


    console.groupCollapsed(
      `[DataExtractor] ${fileName} — ${headers.length} tabela(s) de operações`
    );


    console.log(
      'Cabeçalhos encontrados:',
      headers
    );


    console.groupEnd();


    if (
      !headers.length
    ) {

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

      const parsed =
        this.parseSection(
          rows,
          headers[i],
          headers[i + 1] ??
            rows.length,
          fileName,
          i
        );


      if (
        parsed
      ) {

        result.push(
          parsed
        );
      }
    }


    return result;
  }


  // ==============================================================
  // ANO
  // ==============================================================

  static detectYear(
    text
  ) {

    const match =
      String(
        text || ''
      ).match(
        /\b(20\d{2})\b/
      );


    return match
      ? Number(match[1])
      : 0;
  }


  // ==============================================================
  // LOCALIZA CABEÇALHOS
  // ==============================================================

  static findTransactionHeaders(
    rows
  ) {

    const headers = [];


    for (
      let i = 0;
      i < rows.length;
      i++
    ) {

      const row =
        Array.isArray(
          rows[i]
        )
          ? rows[i]
          : [];


      const values =
        row.map(
          value =>
            this.normalizeHeader(
              value
            )
        );


      const hasCliente =
        values.includes(
          'CLIENTE'
        );


      const hasBanco =
        values.includes(
          'BANCO'
        );


      const hasVendedor =
        values.includes(
          'VENDEDOR'
        );


      const hasFinanciamento =
        values.includes(
          'FINANCIAMENTO'
        ) ||
        values.includes(
          'FINANCIADO'
        ) ||
        values.includes(
          'VALOR FINANCIADO'
        ) ||
        values.includes(
          'VAL. FINANCIADO'
        ) ||
        values.includes(
          'VALOR FINANC.'
        );


      const hasCpfCnpj =
        values.includes(
          'CPF/CNPJ'
        ) ||
        values.includes(
          'CPF CNPJ'
        ) ||
        values.some(
          value =>
            value.includes(
              'CPF/CNPJ'
            )
        );


      const hasTipo =
        values.includes(
          'PJ/PF'
        ) ||
        values.includes(
          'PJ PF'
        );


      if (
        hasCliente &&
        hasBanco &&
        hasVendedor &&
        hasFinanciamento &&
        (
          hasCpfCnpj ||
          hasTipo
        )
      ) {

        headers.push(
          i
        );
      }
    }


    return headers;
  }


  // ==============================================================
  // PROCESSA UMA SEÇÃO
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


    // ============================================================
    // IDENTIDADE DA LOJA
    // ============================================================

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


    const storeName =
      this.resolveStoreName(
        fileName,
        rawStoreName,
        brand
      );


    // ============================================================
    // MÊS
    // ============================================================

    const detectedMonth =
      monthConfig.detectMonth(
        `${fileName} ${rawStoreName}`
      );


    const detectedYear =
      this.detectYear(
        `${fileName} ${rawStoreName}`
      );


    const monthNumber =
      monthConfig.getMonthNumber(
        detectedMonth
      );


    const periodKey =
      detectedYear &&
      monthNumber
        ? `${detectedYear}-${String(monthNumber).padStart(2, '0')}`
        : '';


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


    // ============================================================
    // CABEÇALHO
    // ============================================================

    const header =
      sectionRows[0].map(
        value =>
          this.normalizeHeader(
            value
          )
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


    // ============================================================
    // VALIDAÇÃO
    // ============================================================

    if (
      idxCliente < 0 ||
      idxBanco < 0 ||
      idxVendedor < 0 ||
      idxFinanciado < 0
    ) {

      console.warn(
        `[DataExtractor] Estrutura inválida em ${fileName}, seção ${sectionIndex + 1}`
      );

      return null;
    }


    // ============================================================
    // ACUMULADORES
    // ============================================================

    let financiado = 0;

    let retorno = 0;

    let retornoRentab = 0;

    let spfPagar = 0;

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


    // ============================================================
    // AUDITORIA
    // ============================================================

    const auditRows = [];


    // ============================================================
    // OPERAÇÕES
    // ============================================================

    for (
      let i = 1;
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
      // TOTAL
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


      if (
        /^\d+$/.test(
          cliente
        )
      ) {

        continue;
      }


      if (
        !banco &&
        !vendedor
      ) {

        continue;
      }


      // ==========================================================
      // VALORES
      // ==========================================================

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


      const spfColumn =
        this.readCurrency(
          row,
          idxSpfPagar
        );


      const rentTotal =
        this.readCurrency(
          row,
          idxRentabTotal
        );


      // ==========================================================
      // RETORNO SPF
      // ==========================================================

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


      // ==========================================================
      // DESCARTA LINHA SEM DADOS FINANCEIROS
      // ==========================================================

      if (
        fin <= 0 &&
        retSPFValor <= 0 &&
        retRentab <= 0 &&
        rentTotal <= 0 &&
        spfColumn <= 0
      ) {

        continue;
      }


      // ==========================================================
      // SPF A PAGAR
      //
      // Se existir coluna própria:
      //     utiliza a coluna.
      //
      // Caso contrário:
      //     acompanha o RETORNO SPF.
      // ==========================================================

      const spfPagarValor =
        idxSpfPagar >= 0
          ? spfColumn
          : retSPFValor;


      // ==========================================================
      // RENTABILIDADE TOTAL
      // ==========================================================

      const rentabilidadeTotal =
        rentTotal > 0
          ? rentTotal
          : (
              retSPFValor +
              retRentab
            );


      // ==========================================================
      // ACUMULA KPIs
      // ==========================================================

      financiado +=
        fin;


      retorno +=
        retSPFValor;


      retornoRentab +=
        retRentab;


      spfPagar +=
        spfPagarValor;


      rentab +=
        rentabilidadeTotal;


      operacoes++;


      // ==========================================================
      // AUDITORIA DA OPERAÇÃO
      // ==========================================================

      auditRows.push({

        linha:
          start + i + 1,

        cliente,

        banco,

        vendedor,

        financiamento:
          fin,

        retornoSPF:
          retSPFValor,

        retornoRentabilidade:
          retRentab,

        spfAPagar:
          spfPagarValor,

        rentabilidadeTotal:
          rentabilidadeTotal

      });


      // ==========================================================
      // BANCO
      // ==========================================================

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


      // ==========================================================
      // R
      // ==========================================================

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


      // ==========================================================
      // VENDEDOR
      // ==========================================================

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

              retorno: 0,

              retornoRentab: 0,

              rentab: 0,

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


        if (
          Object.prototype.hasOwnProperty.call(
            seller,
            rKey
          )
        ) {

          seller[rKey]++;
        }


        if (
          this.isWithSpf(
            idxSpfStatus >= 0
              ? row[idxSpfStatus]
              : ''
          )
        ) {

          seller.SPF++;
        }


        seller.receita +=
          rentabilidadeTotal;


        seller.rentab +=
          rentabilidadeTotal;


        seller.retorno +=
          retSPFValor;


        seller.retornoRentab +=
          retRentab;


        seller.financiado +=
          fin;


        seller.operacoes++;


        seller.financiamentos++;
      }
    }


    // ============================================================
    // RESUMO OFICIAL
    // ============================================================

    let sellers =
      this.extractOfficialSellerSummary(
        sectionRows,
        sellerAgg
      );


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


    // ============================================================
    // GARANTE RENTABILIDADE TOTAL
    // ============================================================

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


    // ============================================================
    // AUDITORIA VISUAL
    // ============================================================

    console.groupCollapsed(
      `[DataExtractor] DATASET — ${fileName} — ${storeName} — ${monthConfig.getMonthLabel(detectedMonth)}`
    );


    console.log({

      arquivo:
        fileName,

      loja:
        storeName,

      marca:
        brand,

      mes:
        monthConfig.getMonthLabel(
          detectedMonth
        ),

      ano:
        detectedYear,

      periodKey,

      linhaCabecalho:
        start + 1,

      linhasDaSecao:
        sectionRows.length,

      operacoes,

      financiado,

      retornoSPF:
        retorno,

      retornoRentabilidade:
        retornoRentab,

      spfAPagar:
        spfPagar,

      rentabilidadeTotal:
        rentab

    });


    console.table(
      auditRows
    );


    console.groupEnd();


    // ============================================================
    // RESULTADO
    // ============================================================

    return {

      name:
        storeName,

      label,

      shortName,

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

      monthNumber,

      year:
        detectedYear,

      periodKey,

      storeKey,


      sellers:
        sellers.map(
          seller => ({

            ...seller,

            storeName,

            storeShortName:
              shortName,

            storeLabel:
              label,

            storeKey

          })
        ),


      kpis: {

        financiado,

        retorno,

        retornoRentab,

        spfPagar,

        rentab,

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
          /^\d+$/.test(
            name
          )
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
  // TÍTULO ANTES DO CABEÇALHO
  // ==============================================================

  static findTitleBeforeHeader(
    rows,
    headerIndex
  ) {

    const monthRegex =
      /(JANEIRO|FEVEREIRO|MAR[CÇ]O|ABRIL|MAIO|JUNHO|JULHO|AGOSTO|SETEMBRO|OUTUBRO|NOVEMBRO|DEZEMBRO)/i;


    // Primeiro procuramos a loja.
    // Isso evita confundir "MAIO" com o nome da loja.

    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 12
      );
      i--
    ) {

      const row =
        Array.isArray(
          rows[i]
        )
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
          /(MANDARIM|TERRACOTA|BYD|MG INGLATERRA|INGLATERRA)/i.test(
            value
          ) &&
          value.length <= 120
        ) {

          return value;
        }
      }
    }


    // Se não achou loja, procura mês.

    for (
      let i = headerIndex - 1;
      i >= Math.max(
        0,
        headerIndex - 12
      );
      i--
    ) {

      const row =
        Array.isArray(
          rows[i]
        )
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
          monthRegex.test(
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
  // FALLBACK
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
  // MARCA
  // ==============================================================

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
      ) ||
      text.includes(
        'MANDARIM'
      )
    ) {

      return 'BYD';
    }


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


    return 'MULTIMARCAS';
  }


  // ==============================================================
  // NOME OFICIAL
  // ==============================================================

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
  // LABEL
  // ==============================================================

  static buildStoreLabel(
    brand,
    storeName
  ) {

    if (
      brand === 'MG IGT'
    ) {

      return 'MG INGLATERRA';
    }


    return `${brand} • ${storeName}`;
  }


  // ==============================================================
  // CHAVE
  // ==============================================================

  static buildStoreKey(
    brand,
    storeName
  ) {

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
  // NOME CANÔNICO
  // ==============================================================

  static resolveStoreName(
    fileName,
    rawStoreName,
    brand
  ) {

    const text =
      this.normalizeHeader(
        `${fileName || ''} ${rawStoreName || ''}`
      );


    if (
      brand === 'MG IGT' ||
      text.includes(
        'MG INGLATERRA'
      ) ||
      text.includes(
        'INGLATERRA'
      )
    ) {

      return 'MG INGLATERRA';
    }


    if (
      brand === 'TERRACOTA'
    ) {

      if (
        text.includes(
          'VITORIA DA CONQUISTA'
        ) ||
        text.includes(
          'VTC'
        )
      ) {

        return 'TERRACOTA VITORIA DA CONQUISTA - VTC';
      }


      if (
        text.includes(
          'FEIRA DE SANTANA'
        ) ||
        text.includes(
          'FSA'
        )
      ) {

        return 'TERRACOTA FEIRA DE SANTANA - FSA';
      }
    }


    if (
      brand === 'BYD'
    ) {

      if (
        text.includes(
          'IGUATEMI'
        ) ||
        /\bIGT\b/.test(
          text
        )
      ) {

        return 'BYD MANDARIM IGUATEMI - IGT';
      }


      if (
        text.includes(
          'ITABUNA'
        ) ||
        /\bITB\b/.test(
          text
        ) ||
        /\bIBT\b/.test(
          text
        )
      ) {

        return 'BYD MANDARIM ITABUNA - ITB';
      }


      if (
        text.includes(
          'LAURO DE FREITAS'
        ) ||
        /\bLF\b/.test(
          text
        )
      ) {

        return 'BYD MANDARIM LAURO DE FREITAS - LF';
      }


      if (
        text.includes(
          'FEIRA DE SANTANA'
        ) ||
        /\bFSA\b/.test(
          text
        )
      ) {

        return 'BYD MANDARIM FEIRA DE SANTANA - FSA';
      }
    }


    return this.displayStoreName(
      rawStoreName
    );
  }


  // ==============================================================
  // NOME CURTO
  // ==============================================================

  static getShortStoreName(
    brand,
    storeName
  ) {

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
  // CABEÇALHO EXATO
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
  // CABEÇALHO POR INCLUSÃO
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
        value =>
          this.normalizeHeader(
            value
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
  // PRÓXIMO CABEÇALHO EXATO
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
  // MOEDA
  // ==============================================================

  static readCurrency(
    row,
    index
  ) {

    if (
      index < 0 ||
      !Array.isArray(
        row
      )
    ) {

      return 0;
    }


    return parseCurrencyValue(
      row[index]
    );
  }


  // ==============================================================
  // INTEIRO
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
  // TOTAL
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
  // SPF
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
  // R
  // ==============================================================

  static normalizeRType(
    value
  ) {

    const r =
      this.normalizeHeader(
        value
      )
      .replace(
        /\s+/g,
        ''
      );


    if (
      r === 'R-VW' ||
      r === 'RVOLKSWAGEN' ||
      r === 'RVW'
    ) {

      return 'RVW';
    }


    return [
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
      ? r
      : r;
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

    } catch (
      error
    ) {

      console.warn(
        '[DataExtractor] Erro ao obter cor:',
        error
      );
    }


    return '#64748b';
  }

}