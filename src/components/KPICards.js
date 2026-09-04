import { formatBRL, formatInteger } from '../utils/formatters.js';

export class KPICards {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.activeSellers = new Set();
    this.lastData = null;
    this.cards = [
      { id: 'kpiFinanciado', icon: 'fa-money-bill-wave', label: 'Total financiado', sublabel: 'Financiamento', formatter: formatBRL },
      { id: 'kpiRentab', icon: 'fa-chart-bar', label: 'Rentabilidade Total', sublabel: 'Total bruto', formatter: formatBRL },
      { id: 'kpiRetornoRentab', icon: 'fa-hand-holding-usd', label: 'Rentabilidade Retorno', sublabel: 'R[1..5]', formatter: formatBRL },
      { id: 'kpiRetorno', icon: 'fa-arrow-left', label: 'Rentabilidade SPF', sublabel: 'SPF', formatter: formatBRL },
      { id: 'kpiOperacoes', icon: 'fa-shopping-cart', label: 'Operações', sublabel: 'vendas ativas', formatter: formatInteger },
      { id: 'kpiLojas', icon: 'fa-store', label: 'Lojas', sublabel: 'lojas identificadas', formatter: formatInteger }
    ];
  }

  render(container) {
    container.innerHTML = `
      <div class="kpi-grid">
        ${this.cards.map(card => `
          <div class="kpi-card">
            <div class="kpi-label"><i class="fas ${card.icon}"></i> ${card.label}</div>
            <div class="kpi-value" id="${card.id}">—</div>
            <div class="kpi-sub">${card.sublabel}</div>
          </div>
        `).join('')}
      </div>
    `;

    // Escuta filtro de vendedores
    this.eventBus.on('seller:filterChanged', (activeSellers) => {
      this.activeSellers = activeSellers || new Set();
      if (this.lastData) this.update(this.lastData);
    });
  }

  update(data) {
    this.lastData = data;
    
    if (!data || data.length === 0) {
      this.cards.forEach(card => {
        const el = document.getElementById(card.id);
        if (el) el.textContent = '—';
      });
      return;
    }

    const totals = this.calculateTotals(data);
    
    const mapping = {
      kpiFinanciado: totals.totalFin,
      kpiRetorno: totals.totalRet,
      kpiRetornoRentab: totals.totalRetornoRentab,
      kpiRentab: totals.totalRent,
      kpiOperacoes: totals.totalOps,
      kpiLojas: data.filter(d => d.active !== false).length
    };

    this.cards.forEach(card => {
      const el = document.getElementById(card.id);
      if (el) el.textContent = card.formatter(mapping[card.id] || 0);
    });
  }

  calculateTotals(data) {
    let totalFin = 0, totalRet = 0, totalRetornoRentab = 0, totalRent = 0, totalOps = 0;

    data.forEach(dataset => {
      if (dataset.active === false) return;
      
      (dataset.sellers || []).forEach(seller => {
        const key = seller.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (this.activeSellers.size > 0 && !this.activeSellers.has(key)) return;
        
        totalFin += seller.financiado || 0;
        totalRet += seller.retorno || 0;
        totalRetornoRentab += seller.retornoRentab || 0;
        totalRent += seller.rentab || seller.receita || 0;
        totalOps += seller.operacoes || 0;
      });
    });

    return { totalFin, totalRet, totalRetornoRentab, totalRent, totalOps };
  }
}