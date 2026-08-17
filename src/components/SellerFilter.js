import { escapeHtml, normalizeKey } from '../utils/formatters.js';

export class SellerFilter {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.isCollapsed = true;
    this.sellerState = new Map();
    this.currentData = [];
  }

  render(container) {
    if (!container) {
      console.error('SellerFilter: container não encontrado');
      return;
    }
    
    container.innerHTML = `
      <div class="seller-filter collapsed" id="sellerFilter">
        <div class="seller-filter-header" id="sellerFilterHeader" title="Clique para abrir ou recolher">
          <i class="fas fa-user-check" style="color:#2a6b9c"></i>
          <span class="seller-filter-title">Vendedores</span>
          <span class="seller-selection-count" id="sellerCount">0 de 0 ativos</span>
          <i class="fas fa-chevron-down seller-filter-chevron"></i>
        </div>
        <div class="seller-filter-body">
          <div id="sellerActions"></div>
          <div id="sellerChips"></div>
        </div>
      </div>
    `;

    this.setupHeaderToggle();

    this.eventBus.on('data:updated', (data) => {
      this.currentData = data || [];
      this.renderContent();
    });

    this.eventBus.on('data:cleared', () => {
      this.sellerState.clear();
      this.currentData = [];
      this.renderContent();
    });
  }

  update(data) {
    // Só atualiza se os dados mudaram
    if (this.currentData !== data) {
      this.currentData = data || [];
      this.renderContent();
    }
  }

  setupHeaderToggle() {
    const header = document.getElementById('sellerFilterHeader');
    if (header) {
      header.onclick = () => {
        this.isCollapsed = !this.isCollapsed;
        const filter = document.getElementById('sellerFilter');
        if (filter) {
          filter.classList.toggle('collapsed', this.isCollapsed);
        }
      };
    }
  }

  getActiveSellers() {
    return new Set(
      this.getAllSellerNames()
        .filter(n => this.isSellerActive(n))
        .map(n => normalizeKey(n))
    );
  }

  renderContent() {
    const sellerFilter = document.getElementById('sellerFilter');
    if (!sellerFilter) return;

    const names = this.getAllSellerNames();

    if (!names.length) {
      const sellerCount = document.getElementById('sellerCount');
      if (sellerCount) sellerCount.textContent = '0 de 0 ativos';

      const sellerChips = document.getElementById('sellerChips');
      if (sellerChips) {
        sellerChips.innerHTML = '<span style="color:#8aa3c0;font-size:.72rem;padding:10px;">Os vendedores aparecerão aqui após carregar os arquivos.</span>';
      }

      const sellerActions = document.getElementById('sellerActions');
      if (sellerActions) sellerActions.innerHTML = '';
      
      // Emite filtro vazio (todos ativos)
      this.eventBus.emit('seller:filterChanged', new Set());
      return;
    }

    const active = names.filter(n => this.isSellerActive(n)).length;

    const sellerCount = document.getElementById('sellerCount');
    if (sellerCount) sellerCount.textContent = `${active} de ${names.length} ativos`;

    const sellerActions = document.getElementById('sellerActions');
    if (sellerActions) {
      sellerActions.innerHTML = `
        <div class="seller-actions">
          <span class="seller-selection-count"><i class="fas fa-filter"></i> Seleção dos vendedores</span>
          <button type="button" id="activateAllSellersBtn">Ativar todos</button>
          <button type="button" id="deactivateAllSellersBtn">Desativar todos</button>
        </div>
      `;

      const activateAllBtn = document.getElementById('activateAllSellersBtn');
      const deactivateAllBtn = document.getElementById('deactivateAllSellersBtn');

      if (activateAllBtn) {
        activateAllBtn.onclick = () => {
          names.forEach(n => this.sellerState.set(normalizeKey(n), true));
          this.eventBus.emit('seller:filterChanged', this.getActiveSellers());
          this.renderContent();
        };
      }

      if (deactivateAllBtn) {
        deactivateAllBtn.onclick = () => {
          names.forEach(n => this.sellerState.set(normalizeKey(n), false));
          this.eventBus.emit('seller:filterChanged', this.getActiveSellers());
          this.renderContent();
        };
      }
    }

    const sellerChips = document.getElementById('sellerChips');
    if (sellerChips) {
      sellerChips.innerHTML = names.map(name => {
        const on = this.isSellerActive(name);
        const key = normalizeKey(name);
        return `
          <span class="seller-chip ${on ? 'active' : 'inactive'}" 
                data-seller-key="${escapeHtml(key)}"
                title="Clique para ${on ? 'desativar' : 'ativar'} ${escapeHtml(name)}">
            <span class="seller-eye"><i class="fas ${on ? 'fa-eye' : 'fa-eye-slash'}"></i></span>
            <span>${escapeHtml(name)}</span>
          </span>
        `;
      }).join('');

      sellerChips.querySelectorAll('.seller-chip').forEach(chip => {
        chip.onclick = () => {
          const key = chip.dataset.sellerKey;
          if (key) {
            const currentState = this.sellerState.get(key);
            this.sellerState.set(key, currentState === false ? true : false);
            this.eventBus.emit('seller:filterChanged', this.getActiveSellers());
            this.renderContent();
          }
        };
      });
    }
  }

  getAllSellerNames() {
    const map = new Map();
    this.currentData.forEach(d => {
      if (d.active === false) return;
      (d.sellers || []).forEach(s => {
        const key = normalizeKey(s.name);
        if (key && !map.has(key)) map.set(key, s.name);
      });
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }

  isSellerActive(name) {
    const key = normalizeKey(name);
    return this.sellerState.get(key) !== false;
  }
}