import * as XLSX from 'xlsx';

export class CSVParser {
  constructor() {
    this.decoder = new TextDecoder('utf-8', { fatal: false });
  }

  async parse(file) {
    const buffer = await this.readFileAsArrayBuffer(file);
    const text = this.decodeBuffer(buffer);
    
    const workbook = XLSX.read(text, {
      type: 'string',
      FS: ';',
      raw: false,
      cellDates: false
    });

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: ''
    });
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  }

  decodeBuffer(buffer) {
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
    } catch {
      return new TextDecoder('windows-1252').decode(buffer);
    }
  }
}
