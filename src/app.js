import { EventBus } from './core/EventBus.js';
import { DataManager } from './core/DataManager.js';
import { Header } from './components/Header.js';
import { FileBar } from './components/FileBar.js';
import { SellerFilter } from './components/SellerFilter.js';
import { KPICards } from './components/KPICards.js';
import { ChartManager } from './components/Charts/ChartManager.js';
import { ComparisonSection } from './components/ComparisonSection.js';
import { SellerTable } from './components/SellerTable.js';
import { Footer } from './components/Footer.js';

export class App {
  constructor() {
    this.eventBus = new EventBus();
    this.dataManager = new DataManager(this.eventBus);
    this.components = {};
  }

  init() {
    this.renderApp();
    this.initializeComponents();
    this.setupEventListeners();
  }

  renderApp() {
    const app = document.getElementById('app');
    if (!app) {
      console.error('Elemento #app não encontrado!');
      return;
    }
    app.innerHTML = `
      <div class="dashboard">
        <div id="header-container"></div>
        <div id="file-bar-container"></div>
        <div id="seller-filter-container"></div>
        <div id="kpi-cards-container"></div>
        <div id="charts-container"></div>
        <div id="comparison-container"></div>
        <div id="seller-table-container"></div>
        <div id="footer-container"></div>
      </div>
    `;
  }

  initializeComponents() {
    this.components.header = new Header(this.eventBus);
    this.components.fileBar = new FileBar(this.eventBus);
    this.components.sellerFilter = new SellerFilter(this.eventBus);
    this.components.kpiCards = new KPICards(this.eventBus);
    this.components.chartManager = new ChartManager(this.eventBus);
    this.components.comparisonSection = new ComparisonSection(this.eventBus);
    this.components.sellerTable = new SellerTable(this.eventBus);
    this.components.footer = new Footer(this.eventBus);

    this.components.header.render(document.getElementById('header-container'));
    this.components.fileBar.render(document.getElementById('file-bar-container'));
    this.components.sellerFilter.render(document.getElementById('seller-filter-container'));
    this.components.kpiCards.render(document.getElementById('kpi-cards-container'));
    this.components.chartManager.render(document.getElementById('charts-container'));
    this.components.comparisonSection.render(document.getElementById('comparison-container'));
    this.components.sellerTable.render(document.getElementById('seller-table-container'));
    this.components.footer.render(document.getElementById('footer-container'));
  }

  setupEventListeners() {
    // Upload de arquivos
    this.eventBus.on('file:uploaded', async (files) => {
      await this.dataManager.loadFiles(files);
    });

    // Toggle dataset (ativar/desativar loja)
    this.eventBus.on('dataset:toggle', (index) => {
      this.dataManager.toggleDataset(index);
    });

    // Remover dataset
    this.eventBus.on('dataset:remove', (index) => {
      this.dataManager.removeDataset(index);
    });

    // Ativar todas as lojas
    this.eventBus.on('datasets:activateAll', () => {
      this.dataManager.activateAll();
    });

    // Desativar todas as lojas
    this.eventBus.on('datasets:deactivateAll', () => {
      this.dataManager.deactivateAll();
    });

    // Limpar todos os dados - CORRIGIDO
    this.eventBus.on('data:cleared', () => {
      // Não chama clearAll diretamente para evitar dupla emissão
      this.dataManager.datasets = [];
      this.eventBus.emit('data:updated', []);
    });

    // Quando os dados são atualizados
    this.eventBus.on('data:updated', (data) => {
      this.refreshAll(data);
    });

    // Filtro de vendedores mudou
    this.eventBus.on('seller:filterChanged', (activeSellers) => {
      const data = this.dataManager.getAllData();
      // Atualiza apenas componentes que precisam do filtro
      if (this.components.kpiCards) this.components.kpiCards.update(data);
      if (this.components.chartManager) this.components.chartManager.update(data);
      if (this.components.sellerTable) this.components.sellerTable.update(data);
    });
  }

  refreshAll(data) {
    // Verifica se os componentes existem antes de atualizar
    if (this.components.fileBar) this.components.fileBar.update(data);
    if (this.components.sellerFilter) this.components.sellerFilter.update(data);
    if (this.components.kpiCards) this.components.kpiCards.update(data);
    if (this.components.chartManager) this.components.chartManager.update(data);
    if (this.components.comparisonSection) this.components.comparisonSection.update(data);
    if (this.components.sellerTable) this.components.sellerTable.update(data);
  }
}