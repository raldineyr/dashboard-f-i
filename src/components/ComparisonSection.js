import {
  escapeHtml,
  formatBRL,
  formatInteger,
  normalizeKey
} from '../utils/formatters.js';

export class ComparisonSection {

  constructor(eventBus) {
    this.eventBus = eventBus;
    this.currentData = [];

    this.comparisonMode = 'automatic';

    this.selectedStore = '';

    this.selectedStoreA = '';
    this.selectedMonthA = '';

    this.selectedStoreB = '';
    this.selectedMonthB = '';

    this.selectedSellerA = '';
    this.selectedSellerMonthA = '';

    this.selectedSellerB = '';
    this.selectedSellerMonthB = '';
  }

  render(container) {
    if (!container) {
      console.error('ComparisonSection: container não encontrado');
      return;
    }

    container.innerHTML = `
      <div class="comparison-section">
        <div class="comparison-header">
          <h3>
            <i class="fas fa-chart-line"></i>
            Comparativos
          </h3>

          <div class="comparison-controls">
            <select
              class="comparison-mode-select"
              id="comparisonMode"
              aria-label="Tipo de comparação"
            >
              <option value="automatic">Mesma loja × meses</option>
              <option value="store">Loja × Loja</option>
              <option value="seller">Vendedor × Vendedor</option>
            </select>
          </div>
        </div>

        <div id="comparisonContent" class="comparison-content">
          <div class="comparison-empty">
            Carregue os dados para realizar uma comparação.
          </div>
        </div>
      </div>
    `;

    this.setupControls();
    this.registerEvents();
    this.renderComparison();
  }

  registerEvents() {
    if (!this.eventBus) return;

    this.eventBus.on('data:updated', (data) => {
      this.currentData = Array.isArray(data) ? data : [];
      this.renderComparison();
    });

    this.eventBus.on('data:cleared', () => {
      this.currentData = [];

      this.selectedStore = '';

      this.selectedStoreA = '';
      this.selectedMonthA = '';

      this.selectedStoreB = '';
      this.selectedMonthB = '';

      this.selectedSellerA = '';
      this.selectedSellerMonthA = '';

      this.selectedSellerB = '';
      this.selectedSellerMonthB = '';

      this.renderComparison();
    });
  }

  setupControls() {
    const modeSelect = document.getElementById('comparisonMode');

    if (!modeSelect) return;

    modeSelect.value = this.comparisonMode;

    modeSelect.addEventListener('change', (event) => {
      this.comparisonMode = event.target.value || 'automatic';
      this.renderComparison();
    });
  }

  update(data) {
    this.currentData = Array.isArray(data) ? data : [];
    this.renderComparison();
  }

  getStoreIdentityText(data) {
    if (!data) return '';

    return normalizeKey(
      [
        data.brand,
        data.name,
        data.label,
        data.storeKey,
        data.sourceFile
      ]
        .filter(Boolean)
        .join(' ')
    );
  }

  getCanonicalStore(data) {
    const text = this.getStoreIdentityText(data);
    const brand = normalizeKey(data?.brand || '');

    if (
      brand.includes('MG IGT') ||
      text.includes('MG INGLATERRA') ||
      text.includes('INGLATERRA')
    ) {
      return {
        key: 'MG INGLATERRA',
        label: 'MG INGLATERRA'
      };
    }

    if (brand.includes('TERRACOTA') || text.includes('TERRACOTA')) {
      if (
        text.includes('VITORIA DA CONQUISTA') ||
        /\bVTC\b/.test(text)
      ) {
        return {
          key: 'TERRACOTA VITORIA DA CONQUISTA VTC',
          label: 'TERRACOTA • TERRACOTA VITÓRIA DA CONQUISTA - VTC'
        };
      }

      if (
        text.includes('FEIRA DE SANTANA') ||
        /\bFSA\b/.test(text)
      ) {
        return {
          key: 'TERRACOTA FEIRA DE SANTANA FSA',
          label: 'TERRACOTA • TERRACOTA FEIRA DE SANTANA - FSA'
        };
      }
    }

    if (brand.includes('BYD') || text.includes('BYD') || text.includes('MANDARIM')) {
      if (text.includes('IGUATEMI') || /\bIGT\b/.test(text)) {
        return {
          key: 'BYD MANDARIM IGUATEMI IGT',
          label: 'BYD • BYD MANDARIM IGUATEMI - IGT'
        };
      }

      if (text.includes('ITABUNA') || /\b(?:ITB|IBT)\b/.test(text)) {
        return {
          key: 'BYD MANDARIM ITABUNA ITB',
          label: 'BYD • BYD MANDARIM ITABUNA - ITB'
        };
      }

      if (text.includes('LAURO DE FREITAS') || /\bLF\b/.test(text)) {
        return {
          key: 'BYD MANDARIM LAURO DE FREITAS LF',
          label: 'BYD • BYD MANDARIM LAURO DE FREITAS - LF'
        };
      }

      if (text.includes('FEIRA DE SANTANA') || /\bFSA\b/.test(text)) {
        return {
          key: 'BYD MANDARIM FEIRA DE SANTANA FSA',
          label: 'BYD • BYD MANDARIM FEIRA DE SANTANA - FSA'
        };
      }
    }

    const key =
      data.storeKey ||
      normalizeKey(`${data.brand || ''} ${data.name || ''}`);

    const brandLabel = String(data.brand || '').trim();
    const nameLabel = String(data.name || '').trim();

    return {
      key,
      label:
        data.label ||
        (brandLabel && nameLabel
          ? `${brandLabel} • ${nameLabel}`
          : nameLabel || brandLabel || 'Loja')
    };
  }

  getStoreKey(data) {
    return this.getCanonicalStore(data).key;
  }

  getStoreLabel(data) {
    return this.getCanonicalStore(data).label;
  }

  // Identidade única do período.
  // O mês sozinho (ex.: "Julho") não é suficiente quando existem
  // arquivos de anos diferentes ou mais de um registro para o mesmo mês.
  getPeriodKey(data) {
    if (!data) return '';

    if (data.periodKey) {
      return String(data.periodKey);
    }

    const year =
      Number(data.year) ||
      this.extractYearFromSource(data.sourceFile);

    const month =
      Number(data.monthNumber) ||
      Number(data.monthOrder) ||
      0;

    if (!year || !month) return '';

    return `${year}-${String(month).padStart(2, '0')}`;
  }

  extractYearFromSource(sourceFile) {
    const match = String(sourceFile || '').match(/\b(20\d{2})\b/);
    return match ? Number(match[1]) : 0;
  }

  getPeriodLabel(data) {
    if (!data) return 'Período não identificado';

    const month =
      data.monthLabel ||
      'Mês não identificado';

    const year =
      Number(data.year) ||
      this.extractYearFromSource(data.sourceFile);

    return year ? `${month}/${year}` : month;
  }

  getSellerKey(name) {
    return normalizeKey(name || '');
  }

  getSellerLabel(name) {
    return String(name || '').trim();
  }

  calculateVariationBetween(valueBase, valueComparado) {
    const base = Number(valueBase) || 0;
    const comparado = Number(valueComparado) || 0;

    if (base === 0 && comparado === 0) {
      return {
        text: '0,0%',
        className: 'variation-neutral'
      };
    }

    if (base === 0 && comparado > 0) {
      return {
        text: '+100,0%',
        className: 'variation-positive'
      };
    }

    if (base === 0 && comparado < 0) {
      return {
        text: '-100,0%',
        className: 'variation-negative'
      };
    }

    if (comparado === 0) {
      if (base > 0) {
        return {
          text: '-100,0%',
          className: 'variation-negative'
        };
      }

      if (base < 0) {
        return {
          text: '+100,0%',
          className: 'variation-positive'
        };
      }
    }

    const percentage =
      ((comparado - base) / Math.abs(base)) * 100;

    let className = 'variation-neutral';

    if (percentage > 0.05) {
      className = 'variation-positive';
    } else if (percentage < -0.05) {
      className = 'variation-negative';
    }

    const sign = percentage > 0 ? '+' : '';

    const text =
      `${sign}${percentage.toFixed(1).replace('.', ',')}%`;

    return {
      text,
      className
    };
  }

  getComparisonStores() {
    const map = new Map();

    this.currentData.forEach((data) => {
      if (!data || data.active === false) return;

      const key = this.getStoreKey(data);

      if (!key) return;

      if (!map.has(key)) {
        map.set(key, {
          key,
          label: this.getStoreLabel(data),
          months: new Map()
        });
      }

      const store = map.get(key);
      const periodKey = this.getPeriodKey(data);

      // Registros sem período não entram no comparativo, pois não podem
      // ser associados com segurança a um mês específico.
      if (!periodKey) return;

      // Se o mesmo arquivo/loja/período aparecer novamente, o último
      // registro substitui o anterior em vez de criar um mês duplicado.
      store.months.set(periodKey, {
        ...data,
        periodKey,
        year:
          Number(data.year) ||
          this.extractYearFromSource(data.sourceFile)
      });
    });

    const result = Array.from(map.values());

    result.forEach((store) => {
      store.months = Array.from(store.months.values()).sort((a, b) => {
        const yearA = Number(a.year) || 0;
        const yearB = Number(b.year) || 0;

        if (yearA !== yearB) {
          return yearA - yearB;
        }

        const monthA = Number(a.monthOrder || 99);
        const monthB = Number(b.monthOrder || 99);

        if (monthA !== monthB) {
          return monthA - monthB;
        }

        return String(a.sourceFile || '')
          .localeCompare(
            String(b.sourceFile || ''),
            'pt-BR'
          );
      });
    });

    return result.sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
    );
  }

  getComparisonSellers() {
    const sellerMap = new Map();

    this.currentData.forEach((data) => {
      if (!data || data.active === false) return;

      const sellers = Array.isArray(data.sellers)
        ? data.sellers
        : [];

      sellers.forEach((seller) => {
        if (!seller || !seller.name) return;

        const sellerKey = this.getSellerKey(seller.name);

        if (!sellerMap.has(sellerKey)) {
          sellerMap.set(sellerKey, {
            key: sellerKey,
            label: this.getSellerLabel(seller.name),
            records: []
          });
        }

        sellerMap.get(sellerKey).records.push({
          seller,
          data,
          storeKey: this.getStoreKey(data),
          storeLabel: this.getStoreLabel(data),
          monthLabel: data.monthLabel || 'Mês não identificado',
          monthOrder: Number(data.monthOrder || 99)
        });
      });
    });

    const sellers = Array.from(sellerMap.values());

    sellers.forEach((seller) => {
      seller.records.sort((a, b) => {
        if (a.monthOrder !== b.monthOrder) {
          return a.monthOrder - b.monthOrder;
        }

        return a.storeLabel.localeCompare(
          b.storeLabel,
          'pt-BR'
        );
      });
    });

    return sellers.sort((a, b) =>
      a.label.localeCompare(b.label, 'pt-BR')
    );
  }

  renderComparison() {
    const content =
      document.getElementById('comparisonContent');

    if (!content) return;

    if (!this.currentData || this.currentData.length === 0) {
      content.innerHTML = `
        <div class="comparison-empty">
          Carregue os dados para realizar uma comparação.
        </div>
      `;

      return;
    }

    if (this.comparisonMode === 'seller') {
      this.renderSellerComparison(content);
      return;
    }

    if (this.comparisonMode === 'store') {
      this.renderStoreVsStore(content);
      return;
    }

    this.renderAutomaticComparison(content);
  }

  renderAutomaticComparison(content) {
    const stores = this.getComparisonStores();

    const validStores = stores.filter(
      store => store.months.length >= 2
    );

    if (!this.selectedStore) {
      if (validStores.length > 0) {
        this.selectedStore = validStores[0].key;
      }
    }

    if (
      this.selectedStore &&
      !stores.some(
        store => store.key === this.selectedStore
      )
    ) {
      this.selectedStore = '';
    }

    const selected = stores.find(
      store => store.key === this.selectedStore
    );

    const storeOptions = stores
      .map(store => `
        <option
          value="${escapeHtml(store.key)}"
          ${store.key === this.selectedStore ? 'selected' : ''}
        >
          ${escapeHtml(store.label)}
        </option>
      `)
      .join('');

    if (!selected) {
      content.innerHTML = `
        <div class="comparison-controls comparison-inline-controls">
          <select
            class="comparison-store-select"
            id="comparisonStore"
            aria-label="Loja para comparação"
          >
            <option value="">
              Selecione uma loja
            </option>

            ${storeOptions}
          </select>
        </div>

        <div class="comparison-empty">
          Selecione uma loja com pelo menos dois meses carregados.
        </div>
      `;

      this.bindAutomaticControls();

      return;
    }

    const months = selected.months;

    content.innerHTML = `
      <div class="comparison-controls comparison-inline-controls">
        <select
          class="comparison-store-select"
          id="comparisonStore"
          aria-label="Loja para comparação"
        >
          ${storeOptions}
        </select>
      </div>

      ${this.buildMonthTable(
        selected.label,
        months
      )}
    `;

    this.bindAutomaticControls();
  }

  renderStoreVsStore(content) {
    const stores = this.getComparisonStores();

    if (stores.length < 2) {
      content.innerHTML = `
        <div class="comparison-empty">
          É necessário carregar pelo menos duas lojas
          para realizar este comparativo.
        </div>
      `;

      return;
    }

    if (!this.selectedStoreA) {
      this.selectedStoreA = stores[0].key;
    }

    if (!this.selectedStoreB) {
      this.selectedStoreB =
        stores.find(
          store => store.key !== this.selectedStoreA
        )?.key || stores[0].key;
    }

    const storeA = stores.find(
      store => store.key === this.selectedStoreA
    );

    const storeB = stores.find(
      store => store.key === this.selectedStoreB
    );

    if (!storeA || !storeB) {
      content.innerHTML = `
        <div class="comparison-empty">
          Selecione duas lojas diferentes.
        </div>
      `;

      return;
    }

    const monthsA = storeA.months;
    const monthsB = storeB.months;

    const availablePeriodA = monthsA.map(month => this.getPeriodKey(month));
    const availablePeriodB = monthsB.map(month => this.getPeriodKey(month));

    if (
      !this.selectedMonthA ||
      !availablePeriodA.includes(this.selectedMonthA)
    ) {
      this.selectedMonthA =
        this.getPeriodKey(monthsA[0]) || '';
    }

    if (
      !this.selectedMonthB ||
      !availablePeriodB.includes(this.selectedMonthB)
    ) {
      this.selectedMonthB =
        this.getPeriodKey(monthsB[0]) || '';
    }

    const dataA = this.findMonthRecord(
      monthsA,
      this.selectedMonthA
    );

    const dataB = this.findMonthRecord(
      monthsB,
      this.selectedMonthB
    );

    content.innerHTML = `
      <div class="seller-comparison-controls">

        <div class="comparison-field">
          <label>Loja A</label>

          <select
            class="comparison-select"
            id="comparisonStoreA"
          >
            ${this.buildStoreOptions(
              stores,
              this.selectedStoreA
            )}
          </select>
        </div>

        <div class="comparison-field">
          <label>Mês A</label>

          <select
            class="comparison-select"
            id="comparisonMonthA"
          >
            ${this.buildMonthOptions(
              monthsA,
              this.selectedMonthA
            )}
          </select>
        </div>

        <div class="comparison-versus">
          ×
        </div>

        <div class="comparison-field">
          <label>Loja B</label>

          <select
            class="comparison-select"
            id="comparisonStoreB"
          >
            ${this.buildStoreOptions(
              stores,
              this.selectedStoreB
            )}
          </select>
        </div>

        <div class="comparison-field">
          <label>Mês B</label>

          <select
            class="comparison-select"
            id="comparisonMonthB"
          >
            ${this.buildMonthOptions(
              monthsB,
              this.selectedMonthB
            )}
          </select>
        </div>

      </div>

      ${
        dataA && dataB
          ? this.buildStoreVsStoreTable(
              dataA,
              dataB
            )
          : `
            <div class="comparison-empty">
              Selecione os meses para comparar.
            </div>
          `
      }
    `;

    this.bindStoreControls();
  }

  renderSellerComparison(content) {
    const sellers = this.getComparisonSellers();

    if (sellers.length < 2) {
      content.innerHTML = `
        <div class="comparison-empty">
          É necessário ter pelo menos dois vendedores
          carregados para realizar o comparativo.
        </div>
      `;

      return;
    }

    if (!this.selectedSellerA) {
      this.selectedSellerA = sellers[0].key;
    }

    if (!this.selectedSellerB) {
      this.selectedSellerB =
        sellers.find(
          seller => seller.key !== this.selectedSellerA
        )?.key || sellers[0].key;
    }

    const sellerA = sellers.find(
      seller => seller.key === this.selectedSellerA
    );

    const sellerB = sellers.find(
      seller => seller.key === this.selectedSellerB
    );

    if (!sellerA || !sellerB) {
      content.innerHTML = `
        <div class="comparison-empty">
          Selecione dois vendedores.
        </div>
      `;

      return;
    }

    if (!this.selectedSellerMonthA) {
      this.selectedSellerMonthA =
        this.getRecordLabel(
          sellerA.records[0]
        );
    }

    if (!this.selectedSellerMonthB) {
      this.selectedSellerMonthB =
        this.getRecordLabel(
          sellerB.records[0]
        );
    }

    const recordA = this.findSellerRecord(
      sellerA.records,
      this.selectedSellerMonthA
    );

    const recordB = this.findSellerRecord(
      sellerB.records,
      this.selectedSellerMonthB
    );

    content.innerHTML = `
      <div class="seller-comparison-controls">

        <div class="comparison-field">
          <label>Vendedor A</label>

          <select
            class="comparison-select"
            id="comparisonSellerA"
          >
            ${this.buildSellerOptions(
              sellers,
              this.selectedSellerA
            )}
          </select>
        </div>

        <div class="comparison-field">
          <label>Mês A</label>

          <select
            class="comparison-select"
            id="comparisonSellerMonthA"
          >
            ${this.buildSellerRecordOptions(
              sellerA.records,
              this.selectedSellerMonthA
            )}
          </select>
        </div>

        <div class="comparison-versus">
          ×
        </div>

        <div class="comparison-field">
          <label>Vendedor B</label>

          <select
            class="comparison-select"
            id="comparisonSellerB"
          >
            ${this.buildSellerOptions(
              sellers,
              this.selectedSellerB
            )}
          </select>
        </div>

        <div class="comparison-field">
          <label>Mês B</label>

          <select
            class="comparison-select"
            id="comparisonSellerMonthB"
          >
            ${this.buildSellerRecordOptions(
              sellerB.records,
              this.selectedSellerMonthB
            )}
          </select>
        </div>

      </div>

      ${
        recordA && recordB
          ? this.buildSellerComparisonTable(
              recordA,
              recordB
            )
          : `
            <div class="comparison-empty">
              Selecione os vendedores e meses
              para realizar a comparação.
            </div>
          `
      }
    `;

    this.bindSellerControls();
  }

  buildSellerComparisonTable(recordA, recordB) {
    const sellerA = recordA.seller;
    const sellerB = recordB.seller;

    const nameA =
      `${this.getSellerLabel(sellerA.name)} • ` +
      `${recordA.storeLabel.replace(/^[^•]+•\s*/, '')}`;

    const nameB =
      `${this.getSellerLabel(sellerB.name)} • ` +
      `${recordB.storeLabel.replace(/^[^•]+•\s*/, '')}`;

    const indicators = [
      {
        label: 'Receita',
        key: 'receita',
        currency: true
      },
      {
        label: 'Rentabilidade SPF',
        key: 'retorno',
        currency: true
      },
      {
        label: 'Rentabilidade Retorno',
        key: 'retornoRentab',
        currency: true
      },
      {
        label: 'R0',
        key: 'R0',
        currency: false
      },
      {
        label: 'R1',
        key: 'R1',
        currency: false
      },
      {
        label: 'R2',
        key: 'R2',
        currency: false
      },
      {
        label: 'R3',
        key: 'R3',
        currency: false
      },
      {
        label: 'R4',
        key: 'R4',
        currency: false
      },
      {
        label: 'R5',
        key: 'R5',
        currency: false
      },
      {
        label: 'R50',
        key: 'R50',
        currency: false
      },
      {
        label: 'R75',
        key: 'R75',
        currency: false
      },
      {
        label: 'R100',
        key: 'R100',
        currency: false
      },
      {
        label: 'R150',
        key: 'R150',
        currency: false
      }
    ];

    const rows = indicators
      .map(indicator => {
        const valueA =
          Number(sellerA[indicator.key]) || 0;

        const valueB =
          Number(sellerB[indicator.key]) || 0;

        const variationA =
          this.calculateVariationBetween(
            valueB,
            valueA
          );

        const variationB =
          this.calculateVariationBetween(
            valueA,
            valueB
          );

        const formattedA =
          indicator.currency
            ? formatBRL(valueA)
            : formatInteger(valueA);

        const formattedB =
          indicator.currency
            ? formatBRL(valueB)
            : formatInteger(valueB);

        return `
          <tr>

            <td>
              <strong>
                ${escapeHtml(indicator.label)}
              </strong>
            </td>

            <td>
              ${formattedA}

              ${
                variationA.text &&
                variationA.text !== '—'
                  ? `
                    <span
                      class="comparison-inline-variation ${variationA.className}"
                    >
                      ${variationA.text}
                    </span>
                  `
                  : ''
              }
            </td>

            <td>
              ${formattedB}

              ${
                variationB.text &&
                variationB.text !== '—'
                  ? `
                    <span
                      class="comparison-inline-variation ${variationB.className}"
                    >
                      ${variationB.text}
                    </span>
                  `
                  : ''
              }
            </td>

          </tr>
        `;
      })
      .join('');

    return `
      <div class="table-section comparison-table-wrapper">

        <table class="comparison-table">

          <thead>
            <tr>

              <th>
                Indicador
              </th>

              <th>
                <strong>
                  ${escapeHtml(nameA)}
                </strong>
                <br>
                <small>
                  ${escapeHtml(recordA.monthLabel)}
                </small>
              </th>

              <th>
                <strong>
                  ${escapeHtml(nameB)}
                </strong>
                <br>
                <small>
                  ${escapeHtml(recordB.monthLabel)}
                </small>
              </th>

            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

      </div>

      <div class="comparison-note">
        Comparação entre
        <strong>${escapeHtml(sellerA.name)}</strong>
        e
        <strong>${escapeHtml(sellerB.name)}</strong>.
        <br>

        A variação do
        <strong>Vendedor A</strong>
        é calculada em relação ao
        <strong>Vendedor B</strong>.

        A variação do
        <strong>Vendedor B</strong>
        é calculada em relação ao
        <strong>Vendedor A</strong>.
      </div>
    `;
  }

  /*
   * ============================================================
   * INDICADORES PADRÃO DO COMPARATIVO
   * ============================================================
   *
   * IMPORTANTE:
   *
   * Financiado
   *      -> kpis.financiado
   *
   * Rentabilidade SPF
   *      -> kpis.retorno
   *
   * Rentabilidade Retorno
   *      -> kpis.retornoRentab
   *
   * Rentabilidade Total
   *      -> kpis.rentab
   *
   * Operações
   *      -> kpis.operacoes
   *
   * A nomenclatura visual é independente
   * dos nomes internos utilizados nos dados.
   */

  getStoreComparisonIndicators() {
    return [
      {
        label: 'Financiado',
        getter: data => data.kpis?.financiado || 0,
        currency: true
      },
      {
        label: 'Rentabilidade SPF',
        getter: data => data.kpis?.retorno || 0,
        currency: true
      },
      {
        label: 'Rentabilidade Retorno',
        getter: data => data.kpis?.retornoRentab || 0,
        currency: true
      },
      {
        label: 'Rentabilidade Total',
        getter: data => data.kpis?.rentab || 0,
        currency: true
      },
      {
        label: 'Operações',
        getter: data => data.kpis?.operacoes || 0,
        currency: false
      }
    ];
  }

  buildMonthTable(storeLabel, months) {
    const indicators =
      this.getStoreComparisonIndicators();

    const headers = months
      .map(month => `
        <th>
          <strong>
            ${escapeHtml(
              month.monthLabel || 'Mês'
            )}
          </strong>

          ${
            month.sourceFile
              ? `
                <br>
                <small>
                  ${escapeHtml(
                    String(month.sourceFile)
                      .substring(0, 30)
                  )}
                </small>
              `
              : ''
          }
        </th>
      `)
      .join('');

    const body = indicators
      .map(indicator => {
        const values = months.map(
          indicator.getter
        );

        return `
          <tr>

            <td>
              <strong>
                ${escapeHtml(indicator.label)}
              </strong>
            </td>

            ${
              values
                .map((value, index) => {
                  let variation = '';

                  if (index > 0) {
                    const previous =
                      Number(
                        values[index - 1]
                      ) || 0;

                    const result =
                      this.calculateVariationBetween(
                        previous,
                        value
                      );

                    variation = `
                      <br>
                      <small
                        class="${result.className}"
                      >
                        ${escapeHtml(
                          result.text
                        )}
                      </small>
                    `;
                  }

                  const formatted =
                    indicator.currency
                      ? formatBRL(value)
                      : formatInteger(value);

                  return `
                    <td>
                      ${formatted}
                      ${variation}
                    </td>
                  `;
                })
                .join('')
            }

          </tr>
        `;
      })
      .join('');

    return `
      <div class="table-section">

        <table class="comparison-table">

          <thead>
            <tr>

              <th>
                Indicador
              </th>

              ${headers}

            </tr>
          </thead>

          <tbody>
            ${body}
          </tbody>

        </table>

      </div>

      <div class="comparison-note">
        <strong>
          ${escapeHtml(storeLabel)}
        </strong>
        — ${months.length} meses comparados.
      </div>
    `;
  }

  buildStoreVsStoreTable(dataA, dataB) {
    const indicators =
      this.getStoreComparisonIndicators();

    const rows = indicators
      .map(indicator => {
        const valueA =
          Number(indicator.getter(dataA)) || 0;

        const valueB =
          Number(indicator.getter(dataB)) || 0;

        const variationA =
          this.calculateVariationBetween(
            valueB,
            valueA
          );

        const variationB =
          this.calculateVariationBetween(
            valueA,
            valueB
          );

        const formattedA =
          indicator.currency
            ? formatBRL(valueA)
            : formatInteger(valueA);

        const formattedB =
          indicator.currency
            ? formatBRL(valueB)
            : formatInteger(valueB);

        return `
          <tr>

            <td>
              <strong>
                ${escapeHtml(indicator.label)}
              </strong>
            </td>

            <td>
              ${formattedA}

              ${
                variationA.text &&
                variationA.text !== '—'
                  ? `
                    <span
                      class="comparison-inline-variation ${variationA.className}"
                    >
                      ${variationA.text}
                    </span>
                  `
                  : ''
              }
            </td>

            <td>
              ${formattedB}

              ${
                variationB.text &&
                variationB.text !== '—'
                  ? `
                    <span
                      class="comparison-inline-variation ${variationB.className}"
                    >
                      ${variationB.text}
                    </span>
                  `
                  : ''
              }
            </td>

          </tr>
        `;
      })
      .join('');

    return `
      <div class="table-section">

        <table class="comparison-table">

          <thead>
            <tr>

              <th>
                Indicador
              </th>

              <th>
                ${escapeHtml(
                  this.getStoreLabel(dataA)
                )}
                <br>

                <small>
                  ${escapeHtml(
                    dataA.monthLabel || ''
                  )}
                </small>
              </th>

              <th>
                ${escapeHtml(
                  this.getStoreLabel(dataB)
                )}
                <br>

                <small>
                  ${escapeHtml(
                    dataB.monthLabel || ''
                  )}
                </small>
              </th>

            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>

        </table>

      </div>

      <div class="comparison-note">
        A variação da
        <strong>Loja A</strong>
        é calculada em relação à
        <strong>Loja B</strong>.

        A variação da
        <strong>Loja B</strong>
        é calculada em relação à
        <strong>Loja A</strong>.
      </div>
    `;
  }

  buildStoreOptions(stores, selected) {
    return stores
      .map(store => `
        <option
          value="${escapeHtml(store.key)}"
          ${store.key === selected ? 'selected' : ''}
        >
          ${escapeHtml(store.label)}
        </option>
      `)
      .join('');
  }

  buildMonthOptions(months, selected) {
    return months
      .map(month => {
        const value =
          this.getPeriodKey(month) ||
          month.monthLabel ||
          'Mês';

        const label =
          this.getPeriodLabel(month);

        return `
          <option
            value="${escapeHtml(value)}"
            ${value === selected ? 'selected' : ''}
          >
            ${escapeHtml(label)}
          </option>
        `;
      })
      .join('');
  }

  buildSellerOptions(sellers, selected) {
    return sellers
      .map(seller => `
        <option
          value="${escapeHtml(seller.key)}"
          ${seller.key === selected ? 'selected' : ''}
        >
          ${escapeHtml(seller.label)}
        </option>
      `)
      .join('');
  }

  buildSellerRecordOptions(records, selected) {
    return records
      .map(record => {
        const value =
          this.getRecordLabel(record);

        const storeName =
          record.storeLabel || '';

        const shortStore =
          storeName.replace(
            /^[^•]+•\s*/,
            ''
          );

        const label =
          `${record.monthLabel} — ${shortStore}`;

        return `
          <option
            value="${escapeHtml(value)}"
            ${value === selected ? 'selected' : ''}
          >
            ${escapeHtml(label)}
          </option>
        `;
      })
      .join('');
  }

  findMonthRecord(months, periodKey) {
    if (!Array.isArray(months) || months.length === 0) {
      return null;
    }

    return (
      months.find(
        month => this.getPeriodKey(month) === periodKey
      ) ||
      null
    );
  }

  getRecordLabel(record) {
    if (!record) return '';

    return [
      record.monthLabel || '',
      record.storeKey || ''
    ].join('::');
  }

  findSellerRecord(records, value) {
    return (
      records.find(
        record =>
          this.getRecordLabel(record) === value
      ) ||
      records[0] ||
      null
    );
  }

  bindAutomaticControls() {
    const select =
      document.getElementById(
        'comparisonStore'
      );

    if (!select) return;

    select.addEventListener(
      'change',
      event => {
        this.selectedStore =
          event.target.value;

        this.renderComparison();
      }
    );
  }

  bindStoreControls() {
    const storeA =
      document.getElementById(
        'comparisonStoreA'
      );

    const monthA =
      document.getElementById(
        'comparisonMonthA'
      );

    const storeB =
      document.getElementById(
        'comparisonStoreB'
      );

    const monthB =
      document.getElementById(
        'comparisonMonthB'
      );

    if (storeA) {
      storeA.addEventListener(
        'change',
        event => {
          this.selectedStoreA =
            event.target.value;

          this.selectedMonthA = '';

          this.renderComparison();
        }
      );
    }

    if (monthA) {
      monthA.addEventListener(
        'change',
        event => {
          this.selectedMonthA =
            event.target.value;

          this.renderComparison();
        }
      );
    }

    if (storeB) {
      storeB.addEventListener(
        'change',
        event => {
          this.selectedStoreB =
            event.target.value;

          this.selectedMonthB = '';

          this.renderComparison();
        }
      );
    }

    if (monthB) {
      monthB.addEventListener(
        'change',
        event => {
          this.selectedMonthB =
            event.target.value;

          this.renderComparison();
        }
      );
    }
  }

  bindSellerControls() {
    const sellerA =
      document.getElementById(
        'comparisonSellerA'
      );

    const monthA =
      document.getElementById(
        'comparisonSellerMonthA'
      );

    const sellerB =
      document.getElementById(
        'comparisonSellerB'
      );

    const monthB =
      document.getElementById(
        'comparisonSellerMonthB'
      );

    if (sellerA) {
      sellerA.addEventListener(
        'change',
        event => {
          this.selectedSellerA =
            event.target.value;

          this.selectedSellerMonthA = '';

          this.renderComparison();
        }
      );
    }

    if (monthA) {
      monthA.addEventListener(
        'change',
        event => {
          this.selectedSellerMonthA =
            event.target.value;

          this.renderComparison();
        }
      );
    }

    if (sellerB) {
      sellerB.addEventListener(
        'change',
        event => {
          this.selectedSellerB =
            event.target.value;

          this.selectedSellerMonthB = '';

          this.renderComparison();
        }
      );
    }

    if (monthB) {
      monthB.addEventListener(
        'change',
        event => {
          this.selectedSellerMonthB =
            event.target.value;

          this.renderComparison();
        }
      );
    }
  }
}