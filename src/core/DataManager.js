import { CSVParser } from '../parsers/CSVParser.js';
import { ExcelParser } from '../parsers/ExcelParser.js';
import { DataExtractor } from '../parsers/DataExtractor.js';

export class DataManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.datasets = [];
  }

  async loadFiles(files) {
    const newData = [];
    
    for (const file of files) {
      try {
        console.log(`Processando arquivo: ${file.name}`);
        const parser = this.getParser(file);
        const rows = await parser.parse(file);
        
        // Remove dados antigos do mesmo arquivo
        this.datasets = this.datasets.filter(d => d.sourceFile !== file.name);
        
        const extracted = DataExtractor.extract(rows, file.name);
        
        if (extracted.length === 0) {
          console.warn(`Nenhuma loja encontrada no arquivo: ${file.name}`);
          alert(`Não foi possível identificar lojas no arquivo:\n${file.name}\n\nVerifique se o arquivo contém as colunas: CLIENTE, BANCO, VENDEDOR`);
          continue;
        }
        
        console.log(`Lojas encontradas em ${file.name}:`, extracted.map(d => d.label));
        newData.push(...extracted);
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        alert(`Erro ao ler o arquivo ${file.name}.\n\n${error.message || error}`);
      }
    }

    if (newData.length > 0) {
      this.datasets.push(...newData);
      console.log(`Total de lojas carregadas: ${this.datasets.length}`);
    }
    
    this.eventBus.emit('data:updated', this.getAllData());
  }

  getParser(file) {
    return file.name.match(/\.csv$/i) ? new CSVParser() : new ExcelParser();
  }

  getActiveData() {
    return this.datasets.filter(d => d.active !== false);
  }

  getAllData() {
    return [...this.datasets];
  }

  toggleDataset(index) {
    if (index >= 0 && index < this.datasets.length) {
      this.datasets[index].active = this.datasets[index].active === false;
      console.log(`Loja ${this.datasets[index].label}: ${this.datasets[index].active !== false ? 'ATIVADA' : 'DESATIVADA'}`);
      this.eventBus.emit('data:updated', this.getAllData());
    }
  }

  removeDataset(index) {
    if (index >= 0 && index < this.datasets.length) {
      const storeName = this.datasets[index].label;
      this.datasets.splice(index, 1);
      console.log(`Loja removida: ${storeName}. Restam ${this.datasets.length} loja(s).`);
      this.eventBus.emit('data:updated', this.getAllData());
    }
  }

  activateAll() {
    this.datasets.forEach(d => d.active = true);
    this.eventBus.emit('data:updated', this.getAllData());
  }

  deactivateAll() {
    this.datasets.forEach(d => d.active = false);
    this.eventBus.emit('data:updated', this.getAllData());
  }

  clearAll() {
    console.log('Limpando todos os dados...');
    this.datasets = [];
    // CORREÇÃO: Emite APENAS data:updated com array vazio
    // O data:cleared é redundante e causa dupla limpeza
    this.eventBus.emit('data:updated', []);
  }
}