import { escapeHtml } from '../utils/formatters.js';

export class StoreLegend {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  render(container) {
    container.innerHTML = '<div class="store-legend" id="storeLegend"></div>';
    
    this.eventBus.on('data:updated', (data) => this.update(data));
    this.eventBus.on('data:cleared', () => this.clear());
  }

  update(data) {
    const legend = document.getElementById('storeLegend');
    if (!legend) return;

    const unique = this.getUniqueStores(data || []);
    
    if (!unique.length) {
      legend.innerHTML = '';
      return;
    }

    legend.innerHTML = `
      <span style="font-weight:600;color:#1f3a5f;">Lojas:</span>
      ${unique.map(d => `
        <span class="legend-item" style="opacity:${d.active !== false ? '1' : '.42'}">
          <span class="legend-dot" style="background:${d.color}"></span>
          ${escapeHtml(d.label)}${d.active !== false ? '' : ' <small>(inativa)</small>'}
        </span>
      `).join('')}
    `;
  }

  getUniqueStores(data) {
    const unique = [];
    const seen = new Set();

    data.forEach(d => {
      const key = d.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(d);
      }
    });

    return unique;
  }

  clear() {
    const legend = document.getElementById('storeLegend');
    if (legend) legend.innerHTML = '';
  }
}
