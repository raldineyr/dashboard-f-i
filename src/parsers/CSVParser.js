import * as XLSX from 'xlsx';

export class CSVParser {
  constructor() {
    this.decoderUtf8 = new TextDecoder('utf-8', {
      fatal: false
    });

    this.decoderUtf8Strict = new TextDecoder('utf-8', {
      fatal: true
    });

    this.decoderWindows = new TextDecoder('windows-1252', {
      fatal: false
    });
  }

  /**
   * Lê e processa um arquivo CSV.
   *
   * O CSV utilizado pelo dashboard:
   * - utiliza ; como separador;
   * - pode possuir várias colunas vazias;
   * - pode conter mais de uma seção/tabela;
   * - pode possuir caracteres acentuados;
   * - pode ter BOM UTF-8;
   * - pode ter sido salvo pelo Excel em Windows-1252;
   * - pode possuir valores monetários no padrão brasileiro.
   */
  async parse(file) {
    if (!file) {
      throw new Error('Nenhum arquivo CSV foi fornecido.');
    }

    if (!file.name || !/\.csv$/i.test(file.name)) {
      throw new Error('O arquivo selecionado não é um CSV válido.');
    }

    const buffer = await this.readFileAsArrayBuffer(file);

    const text = this.decodeBuffer(buffer);

    if (!text || !text.trim()) {
      throw new Error('O arquivo CSV está vazio.');
    }

    const normalizedText = this.normalizeText(text);

    /*
     * O arquivo enviado utiliza ponto e vírgula como separador.
     *
     * Importante:
     * Não usamos XLSX.read diretamente com FS=';' como única proteção,
     * porque o arquivo possui muitas linhas com estruturas diferentes.
     */
    const workbook = XLSX.read(normalizedText, {
      type: 'string',
      FS: ';',
      raw: false,
      cellDates: false,
      cellNF: false,
      cellText: true,
      dense: true
    });

    if (
      !workbook ||
      !workbook.SheetNames ||
      workbook.SheetNames.length === 0
    ) {
      throw new Error(
        'Não foi possível identificar uma planilha dentro do CSV.'
      );
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      throw new Error(
        'Não foi possível acessar os dados do CSV.'
      );
    }

    /*
     * header: 1
     * mantém a estrutura como matriz:
     *
     * [
     *   ['','','CLIENTE','CPF/CNPJ', ...],
     *   ['', '1', 'CLIENTE...', ...],
     *   ...
     * ]
     *
     * Isso é importante porque o DataExtractor trabalha
     * com os índices das colunas.
     */
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false,
      blankrows: true
    });

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error(
        'O CSV não contém dados que possam ser processados.'
      );
    }

    /*
     * Normaliza cada célula.
     *
     * Não removemos colunas vazias!
     *
     * Isso é extremamente importante para esse CSV, pois
     * existem informações do dashboard em posições específicas
     * da mesma linha.
     */
    return rows.map(row => {
      if (!Array.isArray(row)) {
        return [];
      }

      return row.map(cell => this.normalizeCell(cell));
    });
  }

  /**
   * Lê o arquivo como ArrayBuffer.
   */
  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        try {
          resolve(event.target.result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(
          new Error(
            `Não foi possível ler o arquivo "${file.name}".`
          )
        );
      };

      reader.onabort = () => {
        reject(
          new Error(
            `A leitura do arquivo "${file.name}" foi cancelada.`
          )
        );
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Decodifica o conteúdo do arquivo.
   *
   * Prioridade:
   * 1. UTF-8
   * 2. Windows-1252
   */
  decodeBuffer(buffer) {
    if (!buffer) {
      throw new Error('Buffer do arquivo CSV inválido.');
    }

    try {
      const textUtf8 = this.decoderUtf8Strict.decode(buffer);

      if (this.isUsableText(textUtf8)) {
        return textUtf8;
      }
    } catch (error) {
      console.warn(
        'O CSV não está em UTF-8. Tentando Windows-1252.'
      );
    }

    const textWindows = this.decoderWindows.decode(buffer);

    if (!this.isUsableText(textWindows)) {
      throw new Error(
        'Não foi possível decodificar o conteúdo do CSV.'
      );
    }

    return textWindows;
  }

  /**
   * Verifica se o texto decodificado parece válido.
   */
  isUsableText(text) {
    if (!text || !text.trim()) {
      return false;
    }

    /*
     * O CSV esperado possui ; como separador.
     */
    if (!text.includes(';')) {
      return false;
    }

    return true;
  }

  /**
   * Normaliza o texto inteiro antes do XLSX interpretar.
   */
  normalizeText(text) {
    if (!text) {
      return '';
    }

    return String(text)
      // Remove BOM UTF-8
      .replace(/^\uFEFF/, '')

      // Normaliza quebras de linha
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

      // Remove caracteres NUL que podem aparecer em alguns exports
      .replace(/\u0000/g, '');
  }

  /**
   * Normaliza uma célula individual.
   */
  normalizeCell(value) {
    if (value === null || value === undefined) {
      return '';
    }

    /*
     * O XLSX pode retornar números como number.
     * Não transformamos números em texto desnecessariamente.
     */
    if (typeof value === 'number') {
      return value;
    }

    let text = String(value);

    /*
     * Remove BOM que eventualmente tenha aparecido
     * no começo de uma célula.
     */
    text = text.replace(/^\uFEFF/, '');

    /*
     * Remove espaços invisíveis.
     */
    text = text.replace(/\u00A0/g, ' ');

    /*
     * Mantém o conteúdo interno, mas remove espaços
     * acidentais no começo/final.
     */
    text = text.trim();

    return text;
  }
}