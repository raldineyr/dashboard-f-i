import { escapeHtml, formatBRL } from '../utils/formatters.js';

export class SellerTable {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.currentData = [];
    this.sortConfig = {
      field: '', // Inicia vazio (sem filtro padrão)
      direction: ''
    };
    this.activeSellers = new Set();
  }

  render(container) {
    container.innerHTML = `
      <div class="seller-sort-control">
        <label for="sellerSort">Ordenar por:</label>
        <select id="sellerSort">
          <option value="">Padrão (Sem ordenação)</option>
          <option value="r0-desc">R0 — maior → menor</option>
          <option value="r0-asc">R0 — menor → maior</option>
          <option value="r1-desc">R1 — maior → menor</option>
          <option value="r1-asc">R1 — menor → maior</option>
          <option value="r2-desc">R2 — maior → menor</option>
          <option value="r2-asc">R2 — menor → maior</option>
          <option value="r3-desc">R3 — maior → menor</option>
          <option value="r3-asc">R3 — menor → maior</option>
          <option value="r4-desc">R4 — maior → menor</option>
          <option value="r4-asc">R4 — menor → maior</option>
          <option value="r5-desc">R5 — maior → menor</option>
          <option value="r5-asc">R5 — menor → maior</option>
          <option value="r50-desc">R50 — maior → menor</option>
          <option value="r50-asc">R50 — menor → maior</option>
          <option value="r75-desc">R75 — maior → menor</option>
          <option value="r75-asc">R75 — menor → maior</option>
          <option value="r100-desc">R100 — maior → menor</option>
          <option value="r100-asc">R100 — menor → maior</option>
          <option value="r150-desc">R150 — maior → menor</option>
          <option value="r150-asc">R150 — menor → maior</option>
          <option value="spf-desc">SPF — maior → menor</option>
          <option value="spf-asc">SPF — menor → maior</option>
          <option value="receita-desc">Receita (R$) — maior → menor</option>
          <option value="receita-asc">Receita (R$) — menor → maior</option>
          <option value="name-asc">Vendedor — A → Z</option>
          <option value="name-desc">Vendedor — Z → A</option>
          <option value="month-asc">Mês — mais antigo → mais recente</option>
          <option value="month-desc">Mês — mais recente → mais antigo</option>
        </select>
      </div>
      <div class="table-section">
        <table>
          <thead>
            <tr>
              <th data-field="index">Nº</th>
              <th data-field="name">Vendedor</th>
              <th data-field="store">Loja</th>
              <th data-field="month">Mês</th>
              <th data-field="r0">R0</th>
              <th data-field="r1">R1</th>
              <th data-field="r2">R2</th>
              <th data-field="r3">R3</th>
              <th data-field="r4">R4</th>
              <th data-field="r5">R5</th>
              <th data-field="r50">R50</th>
              <th data-field="r75">R75</th>
              <th data-field="r100">R100</th>
              <th data-field="r150">R150</th>
              <th data-field="spf">SPF</th>
              <th data-field="receita">Receita (R$)</th>
            </tr>
          </thead>
          <tbody id="sellerTableBody">
            <tr>
              <td colspan="16">
                <div class="empty-state">
                  <i class="fas fa-cloud-upload-alt"></i>
                  <p>Nenhum dado carregado. Faça upload de um ou mais arquivos CSV ou Excel.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    this.setupSortListener();
    
    this.eventBus.on('data:updated', (data) => {
      this.currentData = data || [];
      this.renderTable();
    });
    
    this.eventBus.on('data:cleared', () => {
      this.currentData = [];
      this.activeSellers = new Set();
      this.renderTable();
    });

    this.eventBus.on('seller:filterChanged', (activeSellers) => {
      this.activeSellers = activeSellers || new Set();
      this.renderTable();
    });
  }

  update(data) {
    this.currentData = data || [];
    this.renderTable();
  }

  setupSortListener() {
    const sortSelect = document.getElementById('sellerSort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) {
          this.sortConfig = { field: '', direction: '' };
        } else {
          const [field, direction] = val.split('-');
          this.sortConfig = { field, direction };
        }
        this.renderTable();
      });
    }
  }

  renderTable() {
    const tbody = document.getElementById('sellerTableBody');
    if (!tbody) return;

    if (!this.currentData || !this.currentData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="16">
            <div class="empty-state">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Nenhum dado carregado. Faça upload de um ou mais arquivos CSV ou Excel.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const sellerRows = this.collectSellerRows();
    const sortedRows = this.sortSellerRows(sellerRows);

    if (!sortedRows.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="16" style="text-align:center;padding:40px;color:#8aa3c0;">
            Nenhum vendedor encontrado com os filtros atuais
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = sortedRows.map((s, index) => this.createRowHtml(s, index + 1)).join('');

    // --- NOVA LÓGICA DE DESTAQUE DE COLUNA (Apenas nas colunas R) ---
    const table = tbody.closest('table');
    if (table) {
      // Limpa os estados anteriores
      table.classList.remove('filtro-r-ativo');
      table.querySelectorAll('.coluna-destaque').forEach(el => {
        el.classList.remove('coluna-destaque');
      });

      // Pega o campo atual selecionado no sort
      const currentField = this.sortConfig.field;
      
      // Só aplica o efeito de foco nas métricas de R (r0 até r150)
      if (currentField && currentField.startsWith('r') && currentField !== 'receita') {
        table.classList.add('filtro-r-ativo');
        // Adiciona a classe de destaque no th e nos tds correspondentes
        table.querySelectorAll(`th[data-field="${currentField}"], td[data-field="${currentField}"]`).forEach(el => {
          el.classList.add('coluna-destaque');
        });
      }
    }
  }

  collectSellerRows() {
    const rows = [];
    
    this.currentData.forEach(d => {
      if (d.active === false) return;
      
      (d.sellers || []).forEach(s => {
        const sellerKey = s.name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        if (this.activeSellers.size > 0 && !this.activeSellers.has(sellerKey)) {
          return;
        }
        
        rows.push({
          ...s,
          dataset: d,
          monthLabel: d.monthLabel || 'Mês não identificado',
          monthOrder: d.monthOrder ?? 99
        });
      });
    });

    return rows;
  }

  sortSellerRows(rows) {
    const sorted = [...rows];
    const { field, direction } = this.sortConfig;
    
    // Se o filtro for vazio (Padrão), apenas retorna a lista original sem ordenar
    if (!field) return sorted;

    const isDesc = direction === 'desc';

    const getValue = (row) => {
      switch (field) {
        case 'r0': return Number(row.R0) || 0;
        case 'r1': return Number(row.R1) || 0;
        case 'r2': return Number(row.R2) || 0;
        case 'r3': return Number(row.R3) || 0;
        case 'r4': return Number(row.R4) || 0;
        case 'r5': return Number(row.R5) || 0;
        case 'r150': return Number(row.R150 || row.RVW) || 0;
        case 'r100': return Number(row.R100) || 0;
        case 'r75': return Number(row.R75) || 0;
        case 'r50': return Number(row.R50) || 0;
        case 'spf': return Number(row.SPF) || 0;
        case 'receita': return Number(row.receita) || 0;
        case 'month': return Number.isFinite(row.monthOrder) ? row.monthOrder : 99;
        case 'name': return String(row.name || '');
        default: return 0;
      }
    };

    return sorted.sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);

      if (typeof av === 'string' || typeof bv === 'string') {
        return isDesc
          ? String(bv).localeCompare(String(av), 'pt-BR')
          : String(av).localeCompare(String(bv), 'pt-BR');
      }
      return isDesc ? bv - av : av - bv;
    });
  }

  createRowHtml(seller, rowNumber) {
    const d = seller.dataset;
    
    return `
      <tr>
        <td data-field="index">${rowNumber}</td>
        <td data-field="name"><strong>${escapeHtml(seller.name)}</strong></td>
        <td data-field="store">
          <span style="color:${d.color};font-weight:600;">
            ${escapeHtml(d.label)}
          </span>
        </td>
        <td data-field="month"><strong>${escapeHtml(seller.monthLabel)}</strong></td>
        <td data-field="r0" class="r-cell r0">${seller.R0 || 0}</td>
        <td data-field="r1" class="r-cell r1">${seller.R1 || 0}</td>
        <td data-field="r2" class="r-cell r2">${seller.R2 || 0}</td>
        <td data-field="r3" class="r-cell r3">${seller.R3 || 0}</td>
        <td data-field="r4" class="r-cell r4">${seller.R4 || 0}</td>
        <td data-field="r5" class="r-cell r5">${seller.R5 || 0}</td>
        <td data-field="r50" class="r-cell r50">${seller.R50 || 0}</td>
        <td data-field="r75" class="r-cell r75">${seller.R75 || 0}</td>
        <td data-field="r100" class="r-cell r100">${seller.R100 || 0}</td>
        <td data-field="r150" class="r-cell r150">${seller.R150 || seller.RVW || 0}</td>
        <td data-field="spf" class="spf-cell ${Number(seller.SPF) > 0 ? 'spf-positive' : 'spf-zero'}">
          ${seller.SPF || 0}
        </td>
        <td data-field="receita">${formatBRL(seller.receita)}</td>
      </tr>
    `;
  }
}