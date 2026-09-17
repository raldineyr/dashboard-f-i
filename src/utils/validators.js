export class Validators {
  static isValidFile(file) {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    return validExtensions.includes(extension);
  }

  static isValidCSV(file) {
    return file.name.toLowerCase().endsWith('.csv');
  }

  static isValidExcel(file) {
    const name = file.name.toLowerCase();
    return name.endsWith('.xlsx') || name.endsWith('.xls');
  }

  static isValidNumber(value) {
    return !isNaN(value) && isFinite(value) && value !== null;
  }

  static isValidCurrency(value) {
    if (typeof value === 'number') return this.isValidNumber(value);
    if (typeof value !== 'string') return false;
    
    const cleaned = value.replace(/[R$\s.]/g, '').replace(',', '.');
    return this.isValidNumber(parseFloat(cleaned));
  }

  static isValidMonth(month) {
    const validMonths = [
      'JANEIRO', 'FEVEREIRO', 'MARCO', 'MARÇO', 'ABRIL', 
      'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 
      'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    return validMonths.includes(month?.toUpperCase());
  }

  static isValidStoreName(name) {
    return name && typeof name === 'string' && name.trim().length > 0;
  }

  static isValidSellerName(name) {
    if (!name || typeof name !== 'string') return false;
    const cleaned = name.trim();
    return cleaned.length > 1 && 
           !/^\d+$/.test(cleaned) && 
           !/TOTAL/i.test(cleaned);
  }

  static hasRequiredHeaders(headers) {
    const required = ['CLIENTE', 'BANCO', 'VENDEDOR'];
    const upperHeaders = headers.map(h => h?.toUpperCase());
    return required.every(r => upperHeaders.includes(r));
  }

  static isRType(value) {
    const validRTypes = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R150', 'R100', 'R75', 'R50', 'RVW'];
    return validRTypes.includes(value?.toUpperCase()?.replace(/\s/g, ''));
  }
}
