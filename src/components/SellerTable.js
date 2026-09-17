import { escapeHtml, formatBRL } from '../utils/formatters.js';

export class SellerTable {
  constructor(eventBus) {
    this.eventBus = eventBus;

    this.currentData = [];
    this.activeSellers = new Set();

    this.sortConfig = {
      field: '',
      direction: ''
    };

    this.container = null;
    this.table = null;
    this.tableBody = null;
    this.sortSelect = null;
    this.sortResetButton = null;
    this.sortableHeaders = [];
  }

  // =========================================================
  // RENDER
  // =========================================================

  render(container) {
    if (!container) {
      console.error(
        '[SellerTable] Container não encontrado.'
      );
      return;
    }

    this.container = container;

    this.container.innerHTML =
      this.getTemplate();

    this.cacheElements();
    this.setupEventListeners();
    this.renderTable();
  }

  // =========================================================
  // TEMPLATE
  // =========================================================

  getTemplate() {
    return `
      <div class="seller-sort-control">

        <div class="seller-sort-label">
          <i class="fas fa-arrow-down-wide-short"></i>
          <span>Ordenar por:</span>
        </div>

        <select
          id="sellerSort"
          class="seller-sort-select"
          aria-label="Ordenar tabela de vendedores"
        >

          <option value="">
            Padrão — ordem da planilha
          </option>

          <!-- =================================================
               CONTRATOS ASSINADOS
               ================================================= -->

          <optgroup label="Contratos Assinados">

            <option value="contratosAssinados-desc">
              Contratos Assinados — maior → menor
            </option>

            <option value="contratosAssinados-asc">
              Contratos Assinados — menor → maior
            </option>

          </optgroup>

          <!-- =================================================
               R — MESMA ORDEM DA PLANILHA
               ================================================= -->

          <optgroup label="Retorno R">

            <option value="r0-desc">
              R0 — maior → menor
            </option>

            <option value="r0-asc">
              R0 — menor → maior
            </option>

            <option value="r1-desc">
              R1 — maior → menor
            </option>

            <option value="r1-asc">
              R1 — menor → maior
            </option>

            <option value="r2-desc">
              R2 — maior → menor
            </option>

            <option value="r2-asc">
              R2 — menor → maior
            </option>

            <option value="r3-desc">
              R3 — maior → menor
            </option>

            <option value="r3-asc">
              R3 — menor → maior
            </option>

            <option value="r4-desc">
              R4 — maior → menor
            </option>

            <option value="r4-asc">
              R4 — menor → maior
            </option>

            <option value="r5-desc">
              R5 — maior → menor
            </option>

            <option value="r5-asc">
              R5 — menor → maior
            </option>

            <option value="r50-desc">
              R50 — maior → menor
            </option>

            <option value="r50-asc">
              R50 — menor → maior
            </option>

            <option value="r75-desc">
              R75 — maior → menor
            </option>

            <option value="r75-asc">
              R75 — menor → maior
            </option>

            <option value="r100-desc">
              R100 — maior → menor
            </option>

            <option value="r100-asc">
              R100 — menor → maior
            </option>

            <option value="r150-desc">
              R150 — maior → menor
            </option>

            <option value="r150-asc">
              R150 — menor → maior
            </option>

          </optgroup>

          <!-- =================================================
               INDICADORES
               ================================================= -->

          <optgroup label="Indicadores">

            <option value="spf-desc">
              SPF — maior → menor
            </option>

            <option value="spf-asc">
              SPF — menor → maior
            </option>

            <option value="receita-desc">
              Receita (R$) — maior → menor
            </option>

            <option value="receita-asc">
              Receita (R$) — menor → maior
            </option>

          </optgroup>

          <!-- =================================================
               TEXTO
               ================================================= -->

          <optgroup label="Texto">

            <option value="name-asc">
              Vendedor — A → Z
            </option>

            <option value="name-desc">
              Vendedor — Z → A
            </option>

            <option value="store-asc">
              Loja — A → Z
            </option>

            <option value="store-desc">
              Loja — Z → A
            </option>

          </optgroup>

          <!-- =================================================
               PERÍODO
               ================================================= -->

          <optgroup label="Período">

            <option value="month-asc">
              Mês — mais antigo → mais recente
            </option>

            <option value="month-desc">
              Mês — mais recente → mais antigo
            </option>

          </optgroup>

        </select>

        <button
          type="button"
          id="sellerSortReset"
          class="seller-sort-reset"
          title="Voltar para a ordem original da planilha"
        >
          <i class="fas fa-rotate-left"></i>
          <span>Limpar</span>
        </button>

      </div>

      <div class="table-section">

        <table class="seller-table">

          <thead>

            <tr>

              <th
                data-field="index"
                class="table-header-static"
              >
                Nº
              </th>

              <!-- ORDEM BASEADA NA PLANILHA -->

              ${this.createSortableHeader(
                'name',
                'Vendedor'
              )}

              <th
                data-field="store"
                class="table-header-static store-header"
              >
                Loja
              </th>

              <th
                data-field="month"
                class="table-header-static"
              >
                Mês
              </th>

              ${this.createSortableHeader(
                'r0',
                'R0'
              )}

              ${this.createSortableHeader(
                'r1',
                'R1'
              )}

              ${this.createSortableHeader(
                'r2',
                'R2'
              )}

              ${this.createSortableHeader(
                'r3',
                'R3'
              )}

              ${this.createSortableHeader(
                'r4',
                'R4'
              )}

              ${this.createSortableHeader(
                'r5',
                'R5'
              )}

              ${this.createSortableHeader(
                'r50',
                'R50'
              )}

              ${this.createSortableHeader(
                'r75',
                'R75'
              )}

              ${this.createSortableHeader(
                'r100',
                'R100'
              )}

              ${this.createSortableHeader(
                'r150',
                'R150'
              )}

              ${this.createSortableHeader(
                'spf',
                'SPF'
              )}

              ${this.createSortableHeader(
                'receita',
                'Receita (R$)'
              )}

              ${this.createSortableHeader(
                'contratosAssinados',
                'Contratos Assinados'
              )}

            </tr>

          </thead>

          <tbody id="sellerTableBody">

            <tr>

              <td colspan="17">

                <div class="empty-state">

                  <i class="fas fa-cloud-upload-alt"></i>

                  <p>
                    Nenhum dado carregado.
                    Faça upload de um ou mais arquivos
                    CSV ou Excel.
                  </p>

                </div>

              </td>

            </tr>

          </tbody>

        </table>

      </div>
    `;
  }

  // =========================================================
  // HEADER
  // =========================================================

  createSortableHeader(field, label) {
    return `
      <th
        data-field="${field}"
        class="table-header-sortable"
        tabindex="0"
        role="button"
        title="Clique para ordenar"
        aria-label="Ordenar por ${label}"
      >

        <span class="header-content">

          <span>
            ${label}
          </span>

          <span
            class="sort-indicator"
            aria-hidden="true"
          ></span>

        </span>

      </th>
    `;
  }

  // =========================================================
  // CACHE
  // =========================================================

  cacheElements() {
    if (!this.container) {
      return;
    }

    this.table =
      this.container.querySelector(
        '.seller-table'
      );

    this.tableBody =
      this.container.querySelector(
        '#sellerTableBody'
      );

    this.sortSelect =
      this.container.querySelector(
        '#sellerSort'
      );

    this.sortResetButton =
      this.container.querySelector(
        '#sellerSortReset'
      );

    this.sortableHeaders =
      Array.from(
        this.container.querySelectorAll(
          '.table-header-sortable'
        )
      );
  }

  // =========================================================
  // EVENTOS
  // =========================================================

  setupEventListeners() {

    // ---------------------------------------------------------
    // SELECT
    // ---------------------------------------------------------

    if (this.sortSelect) {

      this.sortSelect.addEventListener(
        'change',
        (event) => {

          this.applySortValue(
            event.target.value
          );

        }
      );

    }

    // ---------------------------------------------------------
    // BOTÃO LIMPAR
    // ---------------------------------------------------------

    if (this.sortResetButton) {

      this.sortResetButton.addEventListener(
        'click',
        () => {

          this.clearSort();

        }
      );

    }

    // ---------------------------------------------------------
    // CABEÇALHOS
    // ---------------------------------------------------------

    this.sortableHeaders.forEach(
      (header) => {

        header.addEventListener(
          'click',
          () => {

            const field =
              header.dataset.field;

            if (!field) {
              return;
            }

            this.toggleColumnSort(
              field
            );

          }
        );

        header.addEventListener(
          'keydown',
          (event) => {

            if (
              event.key === 'Enter' ||
              event.key === ' '
            ) {

              event.preventDefault();

              const field =
                header.dataset.field;

              if (!field) {
                return;
              }

              this.toggleColumnSort(
                field
              );

            }

          }
        );

      }
    );

    // ---------------------------------------------------------
    // DADOS ATUALIZADOS
    // ---------------------------------------------------------

    this.eventBus.on(
      'data:updated',
      (data) => {

        this.currentData =
          Array.isArray(data)
            ? data
            : [];

        this.renderTable();

      }
    );

    // ---------------------------------------------------------
    // DADOS LIMPOS
    // ---------------------------------------------------------

    this.eventBus.on(
      'data:cleared',
      () => {

        this.currentData = [];

        this.activeSellers =
          new Set();

        this.renderTable();

      }
    );

    // ---------------------------------------------------------
    // FILTRO DE VENDEDORES
    // ---------------------------------------------------------

    this.eventBus.on(
      'seller:filterChanged',
      (activeSellers) => {

        this.activeSellers =
          activeSellers instanceof Set
            ? activeSellers
            : new Set();

        this.renderTable();

      }
    );
  }

  // =========================================================
  // UPDATE
  // =========================================================

  update(data) {

    this.currentData =
      Array.isArray(data)
        ? data
        : [];

    this.renderTable();
  }

  // =========================================================
  // APLICA SELECT
  // =========================================================

  applySortValue(value) {

    if (!value) {

      this.clearSort();

      return;
    }

    const separator =
      value.lastIndexOf('-');

    if (
      separator === -1
    ) {
      return;
    }

    const field =
      value.substring(
        0,
        separator
      );

    const direction =
      value.substring(
        separator + 1
      );

    if (
      !this.isSortableField(
        field
      )
    ) {
      return;
    }

    if (
      direction !== 'asc' &&
      direction !== 'desc'
    ) {
      return;
    }

    this.sortConfig = {
      field,
      direction
    };

    this.renderTable();
  }

  // =========================================================
  // CLIQUE NO HEADER
  //
  // 1º = DESC
  // 2º = ASC
  // 3º = PADRÃO
  // =========================================================

  toggleColumnSort(field) {

    if (
      !this.isSortableField(
        field
      )
    ) {
      return;
    }

    // Nova coluna
    if (
      this.sortConfig.field !== field
    ) {

      this.sortConfig = {
        field,
        direction: 'desc'
      };

      this.renderTable();

      return;
    }

    // DESC -> ASC
    if (
      this.sortConfig.direction === 'desc'
    ) {

      this.sortConfig = {
        field,
        direction: 'asc'
      };

      this.renderTable();

      return;
    }

    // ASC -> PADRÃO
    this.clearSort();
  }

  // =========================================================
  // CAMPOS ORDENÁVEIS
  // =========================================================

  isSortableField(field) {

    return [

      'name',
      'store',
      'month',

      'r0',
      'r1',
      'r2',
      'r3',
      'r4',
      'r5',
      'r50',
      'r75',
      'r100',
      'r150',

      'spf',
      'receita',

      'contratosAssinados'

    ].includes(field);
  }

  // =========================================================
  // LIMPAR
  // =========================================================

  clearSort() {

    this.sortConfig = {
      field: '',
      direction: ''
    };

    this.renderTable();
  }

  // =========================================================
  // RENDER TABLE
  // =========================================================

  renderTable() {

    if (!this.tableBody) {
      return;
    }

    if (
      !Array.isArray(
        this.currentData
      ) ||
      this.currentData.length === 0
    ) {

      this.renderEmptyState();

      return;
    }

    const sellerRows =
      this.collectSellerRows();

    if (
      sellerRows.length === 0
    ) {

      this.renderNoResults();

      return;
    }

    const sortedRows =
      this.sortSellerRows(
        sellerRows
      );

    this.tableBody.innerHTML =
      sortedRows
        .map(
          (seller, index) =>
            this.createRowHtml(
              seller,
              index + 1
            )
        )
        .join('');

    this.syncSortControls();
    this.updateColumnHighlight();
  }

  // =========================================================
  // EMPTY
  // =========================================================

  renderEmptyState() {

    this.tableBody.innerHTML = `
      <tr>

        <td colspan="17">

          <div class="empty-state">

            <i class="fas fa-cloud-upload-alt"></i>

            <p>
              Nenhum dado carregado.
              Faça upload de um ou mais arquivos
              CSV ou Excel.
            </p>

          </div>

        </td>

      </tr>
    `;

    this.syncSortControls();
  }

  // =========================================================
  // NO RESULTS
  // =========================================================

  renderNoResults() {

    this.tableBody.innerHTML = `
      <tr>

        <td
          colspan="17"
          style="
            text-align:center;
            padding:40px;
            color:#8aa3c0;
          "
        >

          <div class="empty-state">

            <i class="fas fa-user-slash"></i>

            <p>
              Nenhum vendedor encontrado
              com os filtros atuais.
            </p>

          </div>

        </td>

      </tr>
    `;

    this.syncSortControls();
  }

  // =========================================================
  // COLETA VENDEDORES
  // =========================================================

  collectSellerRows() {

    const rows = [];

    this.currentData.forEach(
      (dataset) => {

        if (
          dataset?.active === false
        ) {
          return;
        }

        const sellers =
          Array.isArray(
            dataset?.sellers
          )
            ? dataset.sellers
            : [];

        sellers.forEach(
          (seller) => {

            if (!seller) {
              return;
            }

            const name =
              String(
                seller.name ||
                seller.nome ||
                ''
              ).trim();

            if (!name) {
              return;
            }

            const sellerKey =
              this.normalizeSellerKey(
                name
              );

            if (
              this.activeSellers.size > 0 &&
              !this.activeSellers.has(
                sellerKey
              )
            ) {
              return;
            }

            rows.push({

              ...seller,

              dataset,

              monthLabel:
                dataset.monthLabel ||
                seller.monthLabel ||
                'Mês não identificado',

              monthOrder:
                this.getMonthOrder(
                  dataset,
                  seller
                ),

              contratosAssinados:
                this.getContratosAssinados(
                  seller
                ),

              originalIndex:
                rows.length

            });

          }
        );

      }
    );

    return rows;
  }

  // =========================================================
  // CONTRATOS ASSINADOS
  // =========================================================

  getContratosAssinados(
    seller
  ) {

    // Campo explícito
    if (
      seller?.contratosAssinados !==
        undefined &&
      seller?.contratosAssinados !==
        null &&
      seller?.contratosAssinados !== ''
    ) {

      return this.toNumber(
        seller.contratosAssinados
      );
    }

    // Campo exatamente como aparece
    // na planilha
    if (
      seller?.CONTRATOS_ASSINADOS !==
        undefined &&
      seller?.CONTRATOS_ASSINADOS !==
        null &&
      seller?.CONTRATOS_ASSINADOS !== ''
    ) {

      return this.toNumber(
        seller.CONTRATOS_ASSINADOS
      );
    }

    // Estrutura atual do DataExtractor
    if (
      seller?.operacoes !==
        undefined &&
      seller?.operacoes !==
        null
    ) {

      return this.toNumber(
        seller.operacoes
      );
    }

    // Fallback:
    // soma das categorias R
    const rFields = [
      'R0',
      'R1',
      'R2',
      'R3',
      'R4',
      'R5',
      'R50',
      'R75',
      'R100',
      'R150'
    ];

    return rFields.reduce(
      (
        total,
        field
      ) => {

        return (
          total +
          this.toNumber(
            seller?.[field]
          )
        );

      },
      0
    );
  }

  // =========================================================
  // NORMALIZA VENDEDORES
  // =========================================================

  normalizeSellerKey(
    name
  ) {

    return String(
      name || ''
    )
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  // =========================================================
  // ORDEM MÊS
  // =========================================================

  getMonthOrder(
    dataset,
    seller
  ) {

    const datasetMonth =
      Number(
        dataset?.monthOrder
      );

    if (
      Number.isFinite(
        datasetMonth
      )
    ) {
      return datasetMonth;
    }

    const sellerMonth =
      Number(
        seller?.monthOrder
      );

    if (
      Number.isFinite(
        sellerMonth
      )
    ) {
      return sellerMonth;
    }

    return 999999;
  }

  // =========================================================
  // ORDENAÇÃO
  // =========================================================

  sortSellerRows(rows) {

    const sorted =
      [...rows];

    const {
      field,
      direction
    } = this.sortConfig;

    // IMPORTANTE:
    // sem filtro mantém a ordem original
    // recebida da planilha/parser.
    if (
      !field ||
      !direction
    ) {
      return sorted;
    }

    const multiplier =
      direction === 'desc'
        ? -1
        : 1;

    return sorted.sort(
      (a, b) => {

        const result =
          this.compareRows(
            a,
            b,
            field
          );

        // Ordenação estável
        if (
          result === 0
        ) {

          return (
            a.originalIndex -
            b.originalIndex
          );
        }

        return (
          result *
          multiplier
        );
      }
    );
  }

  // =========================================================
  // COMPARAÇÃO
  // =========================================================

  compareRows(
    a,
    b,
    field
  ) {

    // -------------------------------------------------------
    // MÊS
    // -------------------------------------------------------

    if (
      field === 'month'
    ) {

      return this.compareNumbers(
        a.monthOrder,
        b.monthOrder
      );
    }

    // -------------------------------------------------------
    // TEXTO
    // -------------------------------------------------------

    if (
      field === 'name' ||
      field === 'store'
    ) {

      const av =
        this.getTextValue(
          a,
          field
        );

      const bv =
        this.getTextValue(
          b,
          field
        );

      return av.localeCompare(
        bv,
        'pt-BR',
        {
          sensitivity: 'base',
          numeric: true
        }
      );
    }

    // -------------------------------------------------------
    // NUMÉRICO
    // -------------------------------------------------------

    return this.compareNumbers(

      this.getNumericValue(
        a,
        field
      ),

      this.getNumericValue(
        b,
        field
      )

    );
  }

  // =========================================================
  // TEXTO
  // =========================================================

  getTextValue(
    row,
    field
  ) {

    switch (field) {

      case 'name':

        return String(
          row?.name ||
          row?.nome ||
          ''
        ).trim();

      case 'store':

        return String(
          row?.dataset?.label ||
          row?.dataset?.name ||
          row?.store ||
          ''
        ).trim();

      default:

        return '';
    }
  }

  // =========================================================
  // NUMÉRICO
  // =========================================================

  getNumericValue(
    row,
    field
  ) {

    switch (field) {

      case 'contratosAssinados':

        return this.getContratosAssinados(
          row
        );

      case 'r0':
        return this.toNumber(
          row?.R0
        );

      case 'r1':
        return this.toNumber(
          row?.R1
        );

      case 'r2':
        return this.toNumber(
          row?.R2
        );

      case 'r3':
        return this.toNumber(
          row?.R3
        );

      case 'r4':
        return this.toNumber(
          row?.R4
        );

      case 'r5':
        return this.toNumber(
          row?.R5
        );

      case 'r50':
        return this.toNumber(
          row?.R50
        );

      case 'r75':
        return this.toNumber(
          row?.R75
        );

      case 'r100':
        return this.toNumber(
          row?.R100
        );

      case 'r150':
        return this.toNumber(
          row?.R150 ??
          row?.RVW
        );

      case 'spf':
        return this.toNumber(
          row?.SPF
        );

      case 'receita':
        return this.toNumber(
          row?.receita
        );

      default:
        return 0;
    }
  }

  // =========================================================
  // CONVERSÃO NUMÉRICA
  // =========================================================

  toNumber(value) {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return 0;
    }

    if (
      typeof value === 'number'
    ) {

      return Number.isFinite(
        value
      )
        ? value
        : 0;
    }

    let normalized =
      String(value)
        .trim()
        .replace(
          /\s/g,
          ''
        );

    if (!normalized) {
      return 0;
    }

    normalized =
      normalized.replace(
        /R\$/gi,
        ''
      );

    // 1.234,56
    if (
      normalized.includes('.') &&
      normalized.includes(',')
    ) {

      normalized =
        normalized
          .replace(
            /\./g,
            ''
          )
          .replace(
            ',',
            '.'
          );
    }

    // 1234,56
    else if (
      normalized.includes(',')
    ) {

      normalized =
        normalized.replace(
          ',',
          '.'
        );
    }

    const number =
      Number(normalized);

    return Number.isFinite(
      number
    )
      ? number
      : 0;
  }

  // =========================================================
  // COMPARAÇÃO NUMÉRICA
  // =========================================================

  compareNumbers(
    a,
    b
  ) {

    const av =
      Number.isFinite(a)
        ? a
        : 0;

    const bv =
      Number.isFinite(b)
        ? b
        : 0;

    if (
      av === bv
    ) {
      return 0;
    }

    return av > bv
      ? 1
      : -1;
  }

  // =========================================================
  // LINHA
  // =========================================================

  createRowHtml(
    seller,
    rowNumber
  ) {

    const dataset =
      seller?.dataset || {};

    const storeLabel =
      this.getCompactStoreName(
        dataset.label ||
        dataset.name ||
        seller.store ||
        ''
      );

    const storeColor =
      dataset.color ||
      'inherit';

    const contratos =
      this.getContratosAssinados(
        seller
      );

    const spf =
      this.toNumber(
        seller.SPF
      );

    const receita =
      this.toNumber(
        seller.receita
      );

    return `
      <tr>

        <td
          data-field="index"
          class="seller-index"
        >
          ${rowNumber}
        </td>

        <td
          data-field="name"
          class="seller-name"
        >
          <strong>
            ${escapeHtml(
              seller.name ||
              seller.nome ||
              'Sem nome'
            )}
          </strong>
        </td>

        <!-- =================================================
             LOJA COMPACTA
             ================================================= -->

        <td
          data-field="store"
          class="seller-store"
          title="${escapeHtml(
            dataset.label ||
            dataset.name ||
            seller.store ||
            ''
          )}"
        >

          <span
            class="store-badge"
            style="
              --store-color:${escapeHtml(
                storeColor
              )};
            "
          >
            ${escapeHtml(
              storeLabel
            )}
          </span>

        </td>

        <td
          data-field="month"
          class="seller-month"
        >
          ${escapeHtml(
            seller.monthLabel
          )}
        </td>

        <!-- =================================================
             MESMA ORDEM DA PLANILHA
             R0 R1 R2 R3 R4 R5 R50 R75 R100 R150
             ================================================= -->

        <td
          data-field="r0"
          class="r-cell r0"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R0
            )
          )}
        </td>

        <td
          data-field="r1"
          class="r-cell r1"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R1
            )
          )}
        </td>

        <td
          data-field="r2"
          class="r-cell r2"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R2
            )
          )}
        </td>

        <td
          data-field="r3"
          class="r-cell r3"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R3
            )
          )}
        </td>

        <td
          data-field="r4"
          class="r-cell r4"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R4
            )
          )}
        </td>

        <td
          data-field="r5"
          class="r-cell r5"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R5
            )
          )}
        </td>

        <td
          data-field="r50"
          class="r-cell r50"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R50
            )
          )}
        </td>

        <td
          data-field="r75"
          class="r-cell r75"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R75
            )
          )}
        </td>

        <td
          data-field="r100"
          class="r-cell r100"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R100
            )
          )}
        </td>

        <td
          data-field="r150"
          class="r-cell r150"
        >
          ${escapeHtml(
            this.displayValue(
              seller.R150 ??
              seller.RVW
            )
          )}
        </td>

        <!-- =================================================
             SPF
             ================================================= -->

        <td
          data-field="spf"
          class="
            spf-cell
            ${
              spf > 0
                ? 'spf-positive'
                : 'spf-zero'
            }
          "
        >
          ${escapeHtml(
            this.displayValue(
              seller.SPF
            )
          )}
        </td>

        <!-- =================================================
             RECEITA
             ================================================= -->

        <td
          data-field="receita"
          class="revenue-cell"
        >
          ${formatBRL(
            receita
          )}
        </td>

        <!-- =================================================
             CONTRATOS ASSINADOS
             ================================================= -->

        <td
          data-field="contratosAssinados"
          class="contracts-cell"
        >
          ${contratos}
        </td>

      </tr>
    `;
  }

  // =========================================================
  // NOME COMPACTO DA LOJA
  //
  // Exemplos:
  //
  // BYD MANDARIM IGUATEMI
  //        ↓
  // BYD IGT
  //
  // BYD MANDARIM ITABUNA
  //        ↓
  // BYD ITB
  //
  // BYD MANDARIM FEIRA DE SANTANA
  //        ↓
  // BYD FSA
  //
  // TERRACOTA FEIRA DE SANTANA
  //        ↓
  // TERRACOTA FSA
  //
  // TERRACOTA VITÓRIA DA CONQUISTA
  //        ↓
  // TERRACOTA VTC
  // =========================================================

  getCompactStoreName(
    storeName
  ) {

    const original =
      String(
        storeName || ''
      )
        .trim()
        .toUpperCase();

    if (!original) {
      return '-';
    }

    const normalized =
      original
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        );

    // -------------------------------------------------------
    // BYD
    // -------------------------------------------------------

    if (
      normalized.includes('BYD')
    ) {

      if (
        normalized.includes(
          'IGUATEMI'
        ) ||
        /\bIGT\b/.test(
          normalized
        )
      ) {
        return 'BYD IGT';
      }

      if (
        normalized.includes(
          'ITABUNA'
        ) ||
        /\bIBT\b/.test(
          normalized
        )
      ) {
        return 'BYD ITB';
      }

      if (
        normalized.includes(
          'LAURO DE FREITAS'
        ) ||
        /\bFSA\b/.test(
          normalized
        )
      ) {
        return 'BYD LF';
      }
    }

    // -------------------------------------------------------
    // TERRACOTA
    // -------------------------------------------------------

    if (
      normalized.includes(
        'TERRACOTA'
      )
    ) {

      if (
        normalized.includes(
          'FEIRA DE SANTANA'
        ) ||
        /\bFSA\b/.test(
          normalized
        )
      ) {
        return 'TERRACOTA FSA';
      }

      if (
        normalized.includes(
          'VITORIA DA CONQUISTA'
        ) ||
        normalized.includes(
          'VITORIA DA CONQUISTA'
        ) ||
        /\bVTC\b/.test(
          normalized
        )
      ) {
        return 'TERRACOTA VTC';
      }
    }

    // -------------------------------------------------------
    // Fallback
    //
    // Caso apareça uma loja nova,
    // não destrói o nome.
    // -------------------------------------------------------

    return original
      .replace(
        /^BYD MANDARIM\s+/i,
        'BYD '
      )
      .replace(
        /\s+-\s+M[EÊ]S$/i,
        ''
      )
      .trim();
  }

  // =========================================================
  // DISPLAY
  // =========================================================

  displayValue(value) {

    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      return '0';
    }

    return String(value);
  }

  // =========================================================
  // SINCRONIZA CONTROLES
  // =========================================================

  syncSortControls() {

    if (
      this.sortSelect
    ) {

      const {
        field,
        direction
      } = this.sortConfig;

      this.sortSelect.value =
        field && direction
          ? `${field}-${direction}`
          : '';
    }

    this.updateHeaderIndicators();
  }

  // =========================================================
  // INDICADORES ↑ ↓
  // =========================================================

  updateHeaderIndicators() {

    if (
      !this.sortableHeaders
    ) {
      return;
    }

    const {
      field,
      direction
    } = this.sortConfig;

    this.sortableHeaders.forEach(
      (header) => {

        const headerField =
          header.dataset.field;

        const indicator =
          header.querySelector(
            '.sort-indicator'
          );

        header.classList.remove(
          'sort-active',
          'sort-desc',
          'sort-asc'
        );

        if (indicator) {
          indicator.textContent = '';
        }

        if (
          headerField !== field
        ) {
          return;
        }

        header.classList.add(
          'sort-active'
        );

        if (
          direction === 'desc'
        ) {

          header.classList.add(
            'sort-desc'
          );

          if (indicator) {
            indicator.textContent =
              ' ↓';
          }

        } else {

          header.classList.add(
            'sort-asc'
          );

          if (indicator) {
            indicator.textContent =
              ' ↑';
          }

        }

      }
    );
  }

  // =========================================================
  // DESTAQUE DA COLUNA
  // =========================================================

  updateColumnHighlight() {

    if (!this.table) {
      return;
    }

    this.table
      .querySelectorAll(
        '.coluna-destaque'
      )
      .forEach(
        (element) => {

          element.classList.remove(
            'coluna-destaque'
          );

        }
      );

    const field =
      this.sortConfig.field;

    if (!field) {
      return;
    }

    this.table
      .querySelectorAll(
        `[data-field="${field}"]`
      )
      .forEach(
        (element) => {

          element.classList.add(
            'coluna-destaque'
          );

        }
      );
  }
}