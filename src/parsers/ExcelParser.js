import * as XLSX from 'xlsx';

export class ExcelParser {

  async parse(file) {

    const buffer =
      await this.readFileAsArrayBuffer(file);

    const workbook =
      XLSX.read(buffer, {
        type: 'array',
        cellDates: false
      });


    console.groupCollapsed(
      `[ExcelParser] ${file.name}`
    );


    console.log(
      'Abas encontradas:',
      workbook.SheetNames
    );


    // ============================================================
    // IDENTIFICA SOMENTE AS ABAS DE OPERAÇÕES
    // ============================================================

    const transactionSheets =
      workbook.SheetNames.filter(
        sheetName =>
          this.isTransactionSheet(
            workbook.Sheets[sheetName]
          )
      );


    // ============================================================
    // IMPORTANTE
    //
    // NÃO existe mais fallback para todas as abas.
    //
    // Se não encontramos uma tabela de operações,
    // não vamos entregar ACESSOS, LISTAS, RESUMOS etc.
    // para o DataExtractor.
    // ============================================================

    if (
      !transactionSheets.length
    ) {

      console.warn(
        `[ExcelParser] Nenhuma aba de operações encontrada em "${file.name}".`
      );

      console.groupEnd();

      return [];
    }


    console.log(
      'Abas de operações selecionadas:',
      transactionSheets
    );


    const allRows = [];


    // ============================================================
    // LÊ CADA ABA OPERACIONAL
    // ============================================================

    for (
      const sheetName of transactionSheets
    ) {

      const sheet =
        workbook.Sheets[sheetName];


      if (!sheet) {
        continue;
      }


      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            header: 1,
            defval: ''
          }
        );


      if (
        !rows.length
      ) {
        continue;
      }


      // Mantém separação entre abas.
      if (
        allRows.length
      ) {
        allRows.push(['']);
      }


      allRows.push(
        ...rows
      );
    }


    console.log({
      arquivo: file.name,

      abasOperacionais:
        transactionSheets,

      linhasEntreguesAoExtractor:
        allRows.length
    });


    console.groupEnd();


    return allRows;
  }


  // ============================================================
  // IDENTIFICA UMA ABA DE OPERAÇÕES
  // ============================================================

  isTransactionSheet(
    sheet
  ) {

    if (!sheet) {
      return false;
    }


    const rows =
      XLSX.utils.sheet_to_json(
        sheet,
        {
          header: 1,
          defval: ''
        }
      );


    return rows.some(
      row => {

        if (
          !Array.isArray(row)
        ) {
          return false;
        }


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


        const hasPessoa =
          values.includes(
            'CPF/CNPJ'
          ) ||
          values.includes(
            'CPF CNPJ'
          ) ||
          values.includes(
            'PJ/PF'
          ) ||
          values.includes(
            'PJ PF'
          ) ||
          values.some(
            value =>
              value.includes(
                'CPF/CNPJ'
              )
          );


        return (
          hasCliente &&
          hasBanco &&
          hasVendedor &&
          hasFinanciamento &&
          hasPessoa
        );
      }
    );
  }


  // ============================================================
  // NORMALIZA CABEÇALHO
  // ============================================================

  normalizeHeader(
    value
  ) {

    return String(
      value ?? ''
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


  // ============================================================
  // LEITURA DO ARQUIVO
  // ============================================================

  readFileAsArrayBuffer(
    file
  ) {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const reader =
          new FileReader();


        reader.onload =
          event => {

            resolve(
              event.target.result
            );
          };


        reader.onerror =
          event => {

            reject(
              event
            );
          };


        reader.readAsArrayBuffer(
          file
        );
      }
    );
  }

}