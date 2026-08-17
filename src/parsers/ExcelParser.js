import * as XLSX from 'xlsx';

export class ExcelParser {
  async parse(file) {
    const buffer = await this.readFileAsArrayBuffer(file);
    const data = new Uint8Array(buffer);
    
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: false
    });

    const allRows = [];
    workbook.SheetNames.forEach((sheetName, sheetIndex) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: ''
      });
      
      if (sheetIndex > 0) {
        allRows.push(['']); // Separador entre planilhas
      }
      
      allRows.push(...rows);
    });

    return allRows;
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  }
}
