import { escapeHtml } from '../utils/formatters.js';

export class FileBar {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.isCollapsed = false;
    this.datasets = [];
  }

  render(container) {
    container.innerHTML = `
      <div class="files-bar" id="filesBar">
        <span class="empty-message">
          <i class="fas fa-folder-open"></i> 
          Nenhuma loja carregada — você pode adicionar vários meses da mesma loja.
        </span>
      </div>
    `;

    this.eventBus.on('data:updated', (data) => this.update(data));
    this.eventBus.on('data:cleared', () => this.clear());
  }

  update(data) {
    this.datasets = data || [];
    const filesBar = document.getElementById('filesBar');
    
    if (!filesBar) return;
    
    if (!this.datasets.length) {
      this.clear();
      return;
    }

    const activeCount = this.datasets.filter(d => d.active !== false).length;
    
    filesBar.innerHTML = `
      <div class="loaded-stores-header">
        <span class="loaded-stores-title">
          <i class="fas fa-store"></i> Lojas carregadas
        </span>
        <button type="button" id="toggleLoadedStores" class="loaded-stores-toggle"
                aria-expanded="${!this.isCollapsed}">
          <i class="fas ${this.isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}"></i>
          ${this.isCollapsed ? 'Mostrar lojas carregadas' : 'Minimizar lojas carregadas'}
        </button>
      </div>
      <div class="loaded-stores-content" style="display: ${this.isCollapsed ? 'none' : 'block'}">
        <div class="selection-actions">
          <span class="selection-count">
            <i class="fas fa-filter"></i> 
            ${activeCount} de ${this.datasets.length} loja(s) ativa(s)
          </span>
          <button type="button" id="activateAllBtn">Ativar todas</button>
          <button type="button" id="deactivateAllBtn">Desativar todas</button>
        </div>
        ${this.datasets.map((d, idx) => `
          <span class="file-tag ${d.active !== false ? 'active' : 'inactive'}" 
                data-store-idx="${idx}" 
                style="--store-color:${d.color}"
                title="Clique para ${d.active !== false ? 'desativar' : 'ativar'} a loja">
            <span class="toggle-icon">
              <i class="fas ${d.active !== false ? 'fa-eye' : 'fa-eye-slash'}"></i>
            </span>
            <span class="color-dot" style="background:${d.color}"></span>
            <span class="store-name">${escapeHtml(d.label)}${d.monthLabel ? ` · ${escapeHtml(d.monthLabel)}` : ''}</span>
            <span class="remove" data-remove-idx="${idx}" title="Remover loja">&times;</span>
          </span>
        `).join('')}
      </div>
    `;

    this.setupInteractions();
  }

  setupInteractions() {
    // Toggle de mostrar/esconder lista de lojas
    const toggleBtn = document.getElementById('toggleLoadedStores');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.isCollapsed = !this.isCollapsed;
        this.update(this.datasets);
      });
    }

    // Clique na tag da loja (NÃO no X) - Ativar/Desativar
    document.querySelectorAll('.file-tag').forEach(el => {
      el.addEventListener('click', (e) => {
        // Se clicou no botão X (remove), não faz nada aqui
        if (e.target.classList.contains('remove') || e.target.closest('.remove')) {
          return;
        }
        
        const idx = parseInt(el.dataset.storeIdx);
        if (!isNaN(idx)) {
          // Alterna entre ativo/inativo
          this.eventBus.emit('dataset:toggle', idx);
        }
      });
    });

    // Clique no X para remover a loja
    document.querySelectorAll('.remove').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique se propague para a tag
        e.preventDefault();
        
        const idx = parseInt(el.dataset.removeIdx);
        if (!isNaN(idx)) {
          // Confirma antes de remover
          if (confirm('Tem certeza que deseja remover esta loja?')) {
            this.eventBus.emit('dataset:remove', idx);
          }
        }
      });
    });

    // Botão Ativar Todas
    const activateAllBtn = document.getElementById('activateAllBtn');
    if (activateAllBtn) {
      activateAllBtn.addEventListener('click', () => {
        this.eventBus.emit('datasets:activateAll');
      });
    }

    // Botão Desativar Todas
    const deactivateAllBtn = document.getElementById('deactivateAllBtn');
    if (deactivateAllBtn) {
      deactivateAllBtn.addEventListener('click', () => {
        this.eventBus.emit('datasets:deactivateAll');
      });
    }
  }

  clear() {
    const filesBar = document.getElementById('filesBar');
    if (filesBar) {
      filesBar.innerHTML = `
        <span class="empty-message">
          <i class="fas fa-folder-open"></i> 
          Nenhuma loja carregada — você pode adicionar vários meses da mesma loja.
        </span>
      `;
    }
  }
}