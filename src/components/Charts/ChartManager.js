import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  CHART_TYPES,
  CHART_COLORS,
  BANK_CHART_COLORS,
  R_CHART_COLORS
} from '../../config/chart.config.js';

import { storeConfig } from '../../config/store.config.js';
import { monthConfig } from '../../config/month.config.js';

Chart.register(ChartDataLabels);

export class ChartManager {

  constructor(eventBus) {
    this.eventBus = eventBus;
    this.charts = new Map();
    this.activeSellers = new Set();
    this.lastData = null;
    this.chartsReady = false;
    this.pendingUpdate = false;

    this.showDataLabels = {
      vendedor: true,
      retornoSpf: true,
      banco: true,
      rType: true,
      spfGeral: true,
      spfVendedor: false
    };

    this.chartTypes = {
      vendedor: 'bar',
      retornoSpf: 'doughnut',
      banco: 'bar',
      rType: 'bar',
      spfGeral: 'doughnut',
      spfVendedor: 'bar'
    };

    this.pieColors = [
      '#2563EB', '#16A34A', '#DC2626', '#F59E0B', '#7C3AED',
      '#0891B2', '#DB2777', '#65A30D', '#EA580C', '#4F46E5',
      '#0F766E', '#9333EA', '#CA8A04', '#BE123C', '#0369A1',
      '#15803D'
    ];

    this.spfColors = {
      comSpf: '#16A34A',
      semSpf: '#DC2626'
    };

    if (this.eventBus) {
      this.eventBus.on('seller:filterChanged', (activeSellers) => {
        this.activeSellers =
          activeSellers instanceof Set
            ? new Set(activeSellers)
            : new Set(
                Array.isArray(activeSellers)
                  ? activeSellers
                  : []
              );

        if (this.lastData) {
          this.update(this.lastData);
        }
      });
    }
  }

  getChartTypes(key) {
    let types = [];

    switch (key) {

      case 'vendedor':
        types = CHART_TYPES?.VENDEDOR || [
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'line', label: 'Linhas' },
          { value: 'area', label: 'Área' },
          { value: 'radar', label: 'Radar' },
          { value: 'pie', label: 'Pizza' },
          { value: 'doughnut', label: 'Rosca' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'retornoSpf':
        types = CHART_TYPES?.RETORNO_SPF || [
          { value: 'doughnut', label: 'Rosca' },
          { value: 'pie', label: 'Pizza' },
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'area', label: 'Área' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'banco':
        types = CHART_TYPES?.BANCO || [
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'line', label: 'Linhas' },
          { value: 'area', label: 'Área' },
          { value: 'radar', label: 'Radar' },
          { value: 'pie', label: 'Pizza' },
          { value: 'doughnut', label: 'Rosca' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'rType':
        types = CHART_TYPES?.R_TYPE || [
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'line', label: 'Linhas' },
          { value: 'area', label: 'Área' },
          { value: 'radar', label: 'Radar' },
          { value: 'pie', label: 'Pizza' },
          { value: 'doughnut', label: 'Rosca' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'spfGeral':
        types = CHART_TYPES?.SPF_GERAL || [
          { value: 'doughnut', label: 'Rosca' },
          { value: 'pie', label: 'Pizza' },
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'area', label: 'Área' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'spfVendedor':
        types = CHART_TYPES?.SPF_VENDEDOR || [
          { value: 'bar', label: 'Barras' },
          { value: 'horizontalBar', label: 'Barras horizontais' },
          { value: 'line', label: 'Linhas' },
          { value: 'area', label: 'Área' },
          { value: 'radar', label: 'Radar' },
          { value: 'pie', label: 'Pizza' },
          { value: 'doughnut', label: 'Rosca' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      default:
        types = [];
    }

    if (!Array.isArray(types)) {
      types = [];
    }

    types = types
      .filter(
        type =>
          type &&
          typeof type.value === 'string' &&
          typeof type.label === 'string'
      )
      .map(type => ({
        value: type.value,
        label: type.label
      }));

    if (!types.some(type => type.value === 'pie')) {
      types.push({
        value: 'pie',
        label: 'Pizza'
      });
    }

    if (!types.some(type => type.value === 'doughnut')) {
      types.push({
        value: 'doughnut',
        label: 'Rosca'
      });
    }

    return types;
  }

  render(container) {
    if (!container) {
      console.error(
        'ChartManager: container não encontrado.'
      );
      return;
    }

    this.destroyCharts();

    container.innerHTML = `
      <div class="chart-grid">

        ${this.createChartCard(
          'vendedor',
          'RENTABILIDADE POR VENDEDOR',
          'fa-users'
        )}

        ${this.createChartCard(
          'retornoSpf',
          'RENTABILIDADE SPF vs RENTABILIDADE RETORNO',
          'fa-chart-pie'
        )}

        ${this.createChartCard(
          'banco',
          'FINANCIAMENTOS POR BANCO',
          'fa-university'
        )}

        ${this.createChartCard(
          'rType',
          'COMISSÃO TIPO R',
          'fa-tags'
        )}

        ${this.createChartCard(
          'spfGeral',
          'COM SPF VS SEM SPF',
          'fa-check-circle'
        )}

        ${this.createChartCard(
          'spfVendedor',
          'SPF POR VENDEDOR',
          'fa-user-check'
        )}

      </div>

      <div class="chart-note">
        Use "Visualização" para alternar entre barras,
        linhas, radar, rosca/pizza e área polar.
      </div>
    `;

    this.initializeCharts();
  }

  createChartCard(key, title, icon) {
    const types = this.getChartTypes(key);
    const currentType = this.chartTypes[key];

    const hasCurrentType =
      types.some(
        type => type.value === currentType
      );

    if (!hasCurrentType && types.length > 0) {
      this.chartTypes[key] = types[0].value;
    }

    const valuesEnabled =
      this.showDataLabels[key] === true;

    return `
      <div
        class="chart-card"
        data-chart-key="${key}"
        style="min-height:370px;box-sizing:border-box;"
      >

        <h3>
          <i class="fas ${icon}"></i>
          ${title}
        </h3>

        <div
          class="chart-toolbar"
          style="
            display:flex;
            align-items:center;
            justify-content:center;
            gap:8px;
            width:100%;
            flex-wrap:wrap;
            box-sizing:border-box;
          "
        >

          <span class="chart-type-label">
            Visualização
          </span>

          <select
            class="chart-type-select"
            id="chartType_${key}"
            aria-label="Selecionar visualização do gráfico"
          >
            ${types
              .map(
                type => `
                  <option
                    value="${type.value}"
                    ${
                      type.value === this.chartTypes[key]
                        ? 'selected'
                        : ''
                    }
                  >
                    ${type.label}
                  </option>
                `
              )
              .join('')}
          </select>

          <span class="chart-type-label chart-values-label">
            Valores
          </span>

          <select
            class="chart-type-select chart-values-select"
            id="chartValues_${key}"
            aria-label="Ativar ou desativar valores do gráfico"
          >
            <option
              value="on"
              ${valuesEnabled ? 'selected' : ''}
            >
              Ativados
            </option>

            <option
              value="off"
              ${!valuesEnabled ? 'selected' : ''}
            >
              Desativados
            </option>
          </select>

        </div>

        <div
          class="chart-container"
          style="
            position:relative;
            width:100%;
            height:280px;
            min-height:280px;
          "
        >
          <canvas id="chart_${key}"></canvas>
        </div>

      </div>
    `;
  }

  initializeCharts() {
    const chartKeys = [
      'vendedor',
      'retornoSpf',
      'banco',
      'rType',
      'spfGeral',
      'spfVendedor'
    ];

    chartKeys.forEach(key => {

      const canvas =
        document.getElementById(
          `chart_${key}`
        );

      if (canvas) {

        const ctx =
          canvas.getContext('2d');

        const config =
          this.getDefaultConfig(key);

        try {

          const chart =
            new Chart(ctx, config);

          this.charts.set(
            key,
            chart
          );

        } catch (error) {

          console.error(
            `ChartManager: erro ao criar gráfico ${key}:`,
            error
          );
        }
      }

      const typeSelect =
        document.getElementById(
          `chartType_${key}`
        );

      if (typeSelect) {

        typeSelect.addEventListener(
          'change',
          event => {
            this.changeChartType(
              key,
              event.target.value
            );
          }
        );
      }

      const valuesSelect =
        document.getElementById(
          `chartValues_${key}`
        );

      if (valuesSelect) {

        valuesSelect.addEventListener(
          'change',
          event => {

            this.setChartDataLabelsVisibility(
              key,
              event.target.value === 'on'
            );

          }
        );
      }

    });

    this.chartsReady = true;

    if (
      this.pendingUpdate &&
      this.lastData
    ) {

      this.pendingUpdate = false;

      this.update(
        this.lastData
      );
    }
  }

  setChartDataLabelsVisibility(
    key,
    visible
  ) {

    if (
      !Object.prototype.hasOwnProperty.call(
        this.showDataLabels,
        key
      )
    ) {
      return;
    }

    this.showDataLabels[key] =
      Boolean(visible);

    const chart =
      this.charts.get(key);

    if (!chart) return;

    if (!chart.options.plugins) {
      chart.options.plugins = {};
    }

    chart.options.plugins.datalabels =
      this.getDataLabelOptions(
        key,
        this.chartTypes[key] || chart.config.type
      );

    chart.update('none');
  }

  shouldShowDataLabels(key) {
    return (
      this.showDataLabels[key] === true
    );
  }

  getDefaultConfig(key) {

    const type =
      this.chartTypes[key] || 'bar';

    return {
      type: this.getChartJsType(type),

      data: {
        labels: [],
        datasets: []
      },

      options:
        this.getChartOptions(
          key,
          type
        )
    };
  }

  getChartOptions(key, type) {

    const chartJsType =
      this.getChartJsType(type);

    const isCircular =
      this.isCircularType(type);

    const options = {

      responsive: true,

      maintainAspectRatio: false,

      animation: {
        duration: 250
      },

      interaction: {
        intersect: false,
        mode: 'index'
      },

      ...(type === 'horizontalBar'
        ? { indexAxis: 'y' }
        : {}),

      layout: {
        padding: {
          top:
            this.getChartTopPadding(type),

          right: 8,

          bottom: 8,

          left: 8
        }
      },

      plugins: {

        legend: {

          display: true,

          position: 'bottom',

          align: 'center',

          labels: {
            boxWidth: 12,
            boxHeight: 12,
            padding: 10,
            usePointStyle: false,

            font: {
              size: 10
            },

            // A legenda identifica loja + mês pela mesma cor da loja.
            // As cores internas de bancos e R continuam preservadas.
            generateLabels: chart => {
              const defaultLabels =
                Chart.defaults.plugins.legend.labels.generateLabels(chart);

              return defaultLabels.map(item => {
                const dataset =
                  chart.data.datasets?.[item.datasetIndex];

                if (
                  dataset &&
                  (
                    dataset.label === undefined ||
                    dataset.label === null ||
                    String(dataset.label).trim() === ''
                  )
                ) {
                  const fallback =
                    dataset.contextLabel || 'Dados';

                  dataset.label = fallback;
                  item.text = fallback;
                }

                if (dataset?.legendColor) {
                  item.fillStyle = dataset.legendColor;
                  item.strokeStyle = dataset.legendColor;
                }

                return item;
              });
            }
          }
        },

        tooltip: {
          enabled: true
        },

        datalabels:
          this.getDataLabelOptions(
            key,
            type
          )
      }
    };

    if (type === 'area') {
      options.elements = {
        line: {
          fill: true,
          tension: 0.35
        },
        point: {
          radius: 3,
          hoverRadius: 5
        }
      };
    }

    if (
      !isCircular &&
      chartJsType !== 'radar'
    ) {

      options.scales = {

        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 25
          }
        },

        y: {
          beginAtZero: true,

          ticks: {
            precision: 0
          }
        }
      };
    }

    if (this.getChartJsType(type) === 'radar') {

      options.scales = {

        r: {
          beginAtZero: true,

          ticks: {
            precision: 0
          }
        }
      };
    }

    return options;
  }

  getChartJsType(type) {
    if (type === 'area') return 'line';
    if (type === 'horizontalBar') return 'bar';
    return type || 'bar';
  }

  isCircularType(type) {
    return [
      'pie',
      'doughnut',
      'polarArea'
    ].includes(type);
  }

  getChartTopPadding(type) {

    const chartJsType = this.getChartJsType(type);

    if (chartJsType === 'bar') {
      return 24;
    }

    if (chartJsType === 'line') {
      return 26;
    }

    if (this.getChartJsType(type) === 'radar') {
      return 18;
    }

    return 8;
  }

  getDataLabelOptions(
    key,
    type
  ) {

    const enabled =
      this.shouldShowDataLabels(key);

    const isCircular =
      this.isCircularType(type);

    if (!enabled) {
      return {
        display: false
      };
    }

    if (key === 'spfVendedor') {

      return {

        display: context => {

          const value =
            Number(
              context.dataset.data[
                context.dataIndex
              ]
            ) || 0;

          return value !== 0
            ? 'auto'
            : false;
        },

        color:
          isCircular
            ? '#ffffff'
            : '#1F2937',

        backgroundColor:
          isCircular
            ? 'rgba(0, 0, 0, 0.58)'
            : 'rgba(255, 255, 255, 0.90)',

        borderRadius: 4,

        padding:
          isCircular
            ? 4
            : 3,

        textAlign: 'center',

        font: {
          size: 9,
          weight: '700'
        },

        anchor:
          this.getDataLabelAnchor(type),

        align:
          this.getDataLabelAlign(type),

        offset:
          this.getDataLabelOffset(type),

        clamp: true,

        clip: false,

        formatter:
          (value, context) =>
            this.formatWithPercentage(
              value,
              context,
              false
            )
      };
    }

    if (key === 'retornoSpf') {

      return {

        display: context => {

          const value =
            Number(
              context.dataset.data[
                context.dataIndex
              ]
            ) || 0;

          return value !== 0
            ? 'auto'
            : false;
        },

        color: '#ffffff',

        backgroundColor:
          'rgba(0, 0, 0, 0.58)',

        borderRadius: 4,

        padding: 4,

        textAlign: 'center',

        font: {
          size: 10,
          weight: '700'
        },

        anchor:
          isCircular
            ? 'center'
            : 'end',

        align:
          isCircular
            ? 'center'
            : 'top',

        offset:
          isCircular
            ? 0
            : 4,

        clamp: true,

        clip: false,

        formatter:
          (value, context) =>
            this.formatWithPercentage(
              value,
              context,
              true
            )
      };
    }

    if (key === 'spfGeral') {

      return {

        display: context => {

          const value =
            Number(
              context.dataset.data[
                context.dataIndex
              ]
            ) || 0;

          return value !== 0
            ? 'auto'
            : false;
        },

        color: '#ffffff',

        backgroundColor:
          'rgba(0, 0, 0, 0.58)',

        borderRadius: 4,

        padding: 4,

        textAlign: 'center',

        font: {
          size: 10,
          weight: '700'
        },

        anchor:
          isCircular
            ? 'center'
            : 'end',

        align:
          isCircular
            ? 'center'
            : 'top',

        offset:
          isCircular
            ? 0
            : 4,

        clamp: true,

        clip: false,

        formatter:
          (value, context) =>
            this.formatWithPercentage(
              value,
              context,
              false
            )
      };
    }

    if (
      key === 'vendedor' ||
      key === 'banco'
    ) {

      return this.getFinancialDataLabelOptions(
        type
      );
    }

    if (key === 'rType') {

      return {

        display: context => {

          const value =
            Number(
              context.dataset.data[
                context.dataIndex
              ]
            ) || 0;

          if (value === 0) {
            return false;
          }

          return 'auto';
        },

        color:
          isCircular
            ? '#ffffff'
            : '#1F2937',

        backgroundColor:
          isCircular
            ? 'rgba(0, 0, 0, 0.58)'
            : 'rgba(255, 255, 255, 0.90)',

        borderRadius: 4,

        padding:
          isCircular
            ? 4
            : 3,

        textAlign: 'center',

        font: {
          size: 9,
          weight: '700'
        },

        anchor:
          this.getDataLabelAnchor(type),

        align:
          this.getDataLabelAlign(type),

        offset:
          this.getDataLabelOffset(type),

        clamp: true,

        clip: false,

        formatter:
          (value, context) =>
            this.formatWithPercentage(
              value,
              context,
              false
            )
      };
    }

    return {
      display: false
    };
  }

  getFinancialDataLabelOptions(type) {

    const isCircular =
      this.isCircularType(type);

    return {

      display: context => {

        const value =
          Number(
            context.dataset.data[
              context.dataIndex
            ]
          ) || 0;

        if (value === 0) {
          return false;
        }

        return 'auto';
      },

      color:
        isCircular
          ? '#ffffff'
          : '#1F2937',

      backgroundColor:
        isCircular
          ? 'rgba(0, 0, 0, 0.58)'
          : 'rgba(255, 255, 255, 0.90)',

      borderRadius: 4,

      padding:
        isCircular
          ? 4
          : 3,

      textAlign: 'center',

      font:
        context =>
          this.getResponsiveDataLabelFont(
            context
          ),

      anchor:
        this.getDataLabelAnchor(type),

      align:
        this.getDataLabelAlign(type),

      offset:
        this.getDataLabelOffset(type),

      clamp: true,

      clip: false,

      formatter:
        (value, context) =>
          this.formatWithPercentage(
            value,
            context,
            true
          )
    };
  }

  getResponsiveDataLabelFont(context) {

    const chart =
      context.chart;

    const width =
      chart?.width || 600;

    let size = 9;

    if (width < 400) {
      size = 7;
    } else if (width < 600) {
      size = 8;
    }

    return {
      size,
      weight: '700'
    };
  }

  getDataLabelAnchor(type) {

    const chartJsType = this.getChartJsType(type);

    if (chartJsType === 'bar') {
      return 'end';
    }

    if (chartJsType === 'line') {
      return 'center';
    }

    if (this.getChartJsType(type) === 'radar') {
      return 'end';
    }

    if (this.isCircularType(type)) {
      return 'center';
    }

    return 'center';
  }

  getDataLabelAlign(type) {

    const chartJsType = this.getChartJsType(type);

    if (chartJsType === 'bar') {
      return 'top';
    }

    if (chartJsType === 'line') {
      return context =>
        context.dataIndex % 2 === 0
          ? 'top'
          : 'bottom';
    }

    if (this.getChartJsType(type) === 'radar') {
      return 'end';
    }

    if (this.isCircularType(type)) {
      return 'center';
    }

    return 'center';
  }

  getDataLabelOffset(type) {

    const chartJsType = this.getChartJsType(type);

    if (chartJsType === 'bar') {
      return 3;
    }

    if (chartJsType === 'line') {
      return 7;
    }

    if (this.getChartJsType(type) === 'radar') {
      return 5;
    }

    if (this.isCircularType(type)) {
      return 0;
    }

    return 4;
  }

  changeChartType(key, type) {

    const validTypes =
      this.getChartTypes(key);

    const valid =
      validTypes.some(
        item => item.value === type
      );

    if (!valid) {

      console.warn(
        `ChartManager: tipo inválido ${type} para ${key}`
      );

      return;
    }

    this.chartTypes[key] =
      type;

    const oldChart =
      this.charts.get(key);

    const canvas =
      document.getElementById(
        `chart_${key}`
      );

    if (!canvas) {
      return;
    }

    if (oldChart) {

      try {

        oldChart.destroy();

      } catch (error) {

        console.warn(
          `ChartManager: erro ao destruir ${key}:`,
          error
        );
      }
    }

    this.charts.delete(key);

    const ctx =
      canvas.getContext('2d');

    const config = {

      type: this.getChartJsType(type),

      data: {
        labels: [],
        datasets: []
      },

      options:
        this.getChartOptions(
          key,
          type
        )
    };

    try {

      const newChart =
        new Chart(
          ctx,
          config
        );

      this.charts.set(
        key,
        newChart
      );

    } catch (error) {

      console.error(
        `ChartManager: erro ao criar ${key}:`,
        error
      );

      return;
    }

    if (this.lastData) {

      this.updateSingleChart(
        key,
        this.lastData
      );
    }
  }

  updateSingleChart(
    key,
    data
  ) {

    switch (key) {

      case 'vendedor':
        this.updateVendedorChart(data);
        break;

      case 'retornoSpf':
        this.updateRetornoSpfChart(data);
        break;

      case 'banco':
        this.updateBancoChart(data);
        break;

      case 'rType':
        this.updateRTypeChart(data);
        break;

      case 'spfGeral':
        this.updateSpfGeralChart(data);
        break;

      case 'spfVendedor':
        this.updateSpfVendedorChart(data);
        break;
    }
  }

  update(data) {

    this.lastData =
      Array.isArray(data)
        ? data
        : [];

    if (
      !this.chartsReady ||
      this.charts.size === 0
    ) {

      this.pendingUpdate = true;

      return;
    }

    if (
      this.lastData.length === 0
    ) {

      this.clearCharts();

      return;
    }

    this.pendingUpdate = false;

    const updates = [

      [
        'vendedor',
        () =>
          this.updateVendedorChart(
            this.lastData
          )
      ],

      [
        'retornoSpf',
        () =>
          this.updateRetornoSpfChart(
            this.lastData
          )
      ],

      [
        'banco',
        () =>
          this.updateBancoChart(
            this.lastData
          )
      ],

      [
        'rType',
        () =>
          this.updateRTypeChart(
            this.lastData
          )
      ],

      [
        'spfGeral',
        () =>
          this.updateSpfGeralChart(
            this.lastData
          )
      ],

      [
        'spfVendedor',
        () =>
          this.updateSpfVendedorChart(
            this.lastData
          )
      ]
    ];

    updates.forEach(
      ([key, callback]) => {

        try {

          callback();

        } catch (error) {

          console.error(
            `ChartManager: erro ao atualizar ${key}:`,
            error
          );
        }
      }
    );
  }

  updateVendedorChart(data) {

    const sellerMap =
      new Map();

    data.forEach(d => {

      if (d.active === false) {
        return;
      }

      (d.sellers || [])
        .forEach(s => {

          if (
            !this.isSellerActive(
              s.name
            )
          ) {
            return;
          }

          const nameKey =
            this.normalizeName(
              s.name
            );

          if (
            !sellerMap.has(
              nameKey
            )
          ) {

            sellerMap.set(
              nameKey,
              {
                label: s.name,
                values: {}
              }
            );
          }

          const sellerData =
            sellerMap.get(
              nameKey
            );

          sellerData.values[d.label] =
            (
              sellerData.values[d.label] ||
              0
            ) +
            (
              Number(s.receita) ||
              0
            );
        });
    });

    const sellerEntries =
      Array.from(
        sellerMap.values()
      );

    const labels =
      sellerEntries.map(
        item => item.label
      );

    const activeData =
      data.filter(
        d => d.active !== false
      );

    const datasets =
      activeData.map(
        (d, index) => {

          const color =
            this.getStoreChartColor(d) ||
            CHART_COLORS[
              index %
              CHART_COLORS.length
            ];

          return {

            label: this.getChartStoreLabel(d),

            data:
              sellerEntries.map(
                item =>
                  Number(
                    item.values[
                      d.label
                    ]
                  ) || 0
              ),

            backgroundColor:
              color,

            borderColor:
              color,

            borderRadius: 4,

            borderWidth: 1,

            legendColor: color
          };
        }
      );

    this.updateChartData(
      'vendedor',
      labels,
      datasets
    );
  }

  getCircularContextLabel(data) {
    const active = (Array.isArray(data) ? data : [])
      .filter(item => item && item.active !== false);

    if (active.length === 0) {
      return 'Dados';
    }

    const contexts = active.map(item => {
      const month = String(
        item.monthLabel ||
        item.month ||
        ''
      ).trim();

      // Para os gráficos de pizza/rosca, usamos somente a MARCA
      // + MÊS no nome do contexto. A localidade continua disponível
      // nos demais componentes e não é repetida aqui.
      const storeName = String(
        item.storeName ||
        item.name ||
        item.label ||
        ''
      ).trim();

      const brand =
        String(item.brand || '').trim().toUpperCase() ||
        this.getBrandFromStoreName(storeName) ||
        'Loja';

      const brandLabel =
        brand === 'MG IGT'
          ? 'MG'
          : brand;

      return {
        base: brandLabel || 'Loja',
        month
      };
    });

    const uniqueBases = [
      ...new Set(
        contexts
          .map(item => item.base)
          .filter(Boolean)
      )
    ];

    if (uniqueBases.length === 1) {
      const months = [
        ...new Set(
          contexts
            .map(item => item.month)
            .filter(Boolean)
        )
      ];

      if (months.length === 1) {
        return `${uniqueBases[0]} ${months[0]}`;
      }

      if (months.length > 1) {
        return `${uniqueBases[0]} • ${months.join(', ')}`;
      }

      return uniqueBases[0];
    }

    const uniqueFullLabels = [
      ...new Set(
        contexts
          .map(item => {
            const full = item.base;
            return item.month
              ? `${full} ${item.month}`
              : full;
          })
          .filter(Boolean)
      )
    ];

    return uniqueFullLabels.join(' | ') || 'Dados';
  }

  updateRetornoSpfChart(data) {

    let totalRetorno = 0;

    let totalRetornoRentab = 0;

    data.forEach(d => {

      if (d.active === false) {
        return;
      }

      (d.sellers || [])
        .forEach(s => {

          if (
            !this.isSellerActive(
              s.name
            )
          ) {
            return;
          }

          totalRetorno +=
            Number(s.retorno) ||
            0;

          totalRetornoRentab +=
            Number(
              s.retornoRentab
            ) || 0;
        });
    });

    this.setCircularChartData(

      'retornoSpf',

      [
        'Retorno SPF',
        'Rentabilidade Retorno'
      ],

      [
        totalRetorno,
        totalRetornoRentab
      ],

      [
        '#16A34A',
        '#2563EB'
      ],
      this.getCircularContextLabel(data)
    );
  }

  updateBancoChart(data) {

    const bankSet =
      new Set();

    data.forEach(d => {

      if (d.active === false) {
        return;
      }

      Object.keys(
        d.bancos || {}
      ).forEach(
        bank => bankSet.add(bank)
      );
    });

    const labels =
      Array.from(bankSet);

    const activeData =
      data.filter(
        d => d.active !== false
      );

    const currentType =
      this.chartTypes.banco;

    const bankColors =
      labels.map(
        (bank, index) =>
          BANK_CHART_COLORS[
            this.normalizeBankName(bank)
          ] ||
          CHART_COLORS[
            index % CHART_COLORS.length
          ]
      );

    if (
      this.isCircularType(
        currentType
      )
    ) {

      const totals =
        labels.map(
          bank =>
            activeData.reduce(
              (total, d) =>
                total +
                (
                  Number(
                    (
                      d.bancos ||
                      {}
                    )[bank]
                  ) || 0
                ),
              0
            )
        );

      this.setCircularChartData(
        'banco',
        labels,
        totals,
        bankColors,
        this.getCircularContextLabel(data)
      );

      return;
    }

    const datasets =
      activeData.map(
        (d, index) => {

          const fallbackColor =
            this.getStoreChartColor(d) ||
            CHART_COLORS[
              index % CHART_COLORS.length
            ];

          const storeColor =
            this.getStoreChartColor(d) ||
            fallbackColor;

          return {

            label:
              this.getChartStoreLabel(d),

            data:
              labels.map(
                bank =>
                  Number(
                    (
                      d.bancos ||
                      {}
                    )[bank]
                  ) || 0
              ),

            backgroundColor:
              labels.map(
                bank =>
                  BANK_CHART_COLORS[
                    this.normalizeBankName(bank)
                  ] || fallbackColor
              ),

            borderColor:
              labels.map(
                bank =>
                  BANK_CHART_COLORS[
                    this.normalizeBankName(bank)
                  ] || fallbackColor
              ),

            pointBackgroundColor:
              labels.map(
                bank =>
                  BANK_CHART_COLORS[
                    this.normalizeBankName(bank)
                  ] || fallbackColor
              ),

            pointBorderColor:
              labels.map(
                bank =>
                  BANK_CHART_COLORS[
                    this.normalizeBankName(bank)
                  ] || fallbackColor
              ),

            borderRadius: 4,

            borderWidth: 1,

            legendColor: storeColor
          };
        }
      );

    this.updateChartData(
      'banco',
      labels,
      datasets
    );
  }

  updateRTypeChart(data) {

    const rLabels = [
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

    const activeData =
      data.filter(
        d => d.active !== false
      );

    const currentType =
      this.chartTypes.rType;

    const rColors =
      rLabels.map(
        r => R_CHART_COLORS[r]
      );

    if (
      this.isCircularType(
        currentType
      )
    ) {

      const totals =
        rLabels.map(
          r => {

            let total = 0;

            activeData.forEach(
              d => {

                (d.sellers || [])
                  .forEach(
                    s => {

                      if (
                        !this.isSellerActive(
                          s.name
                        )
                      ) {
                        return;
                      }

                      total +=
                        Number(
                          s[r]
                        ) || 0;
                    }
                  );
              }
            );

            return total;
          }
        );

      this.setCircularChartData(
        'rType',
        rLabels,
        totals,
        rColors,
        this.getCircularContextLabel(data)
      );

      return;
    }

    const datasets =
      activeData.map(
        (d, index) => {

          const fallbackColor =
            this.getStoreChartColor(d) ||
            CHART_COLORS[
              index % CHART_COLORS.length
            ];

          const storeColor =
            this.getStoreChartColor(d) ||
            fallbackColor;

          return {

            label:
              this.getChartStoreLabel(d),

            data:
              rLabels.map(
                r => {

                  let total = 0;

                  (d.sellers || [])
                    .forEach(
                      s => {

                        if (
                          !this.isSellerActive(
                            s.name
                          )
                        ) {
                          return;
                        }

                        total +=
                          Number(
                            s[r]
                          ) || 0;
                      }
                    );

                  return total;
                }
              ),

            backgroundColor:
              rColors.map(
                color => color || fallbackColor
              ),

            borderColor:
              rColors.map(
                color => color || fallbackColor
              ),

            pointBackgroundColor:
              rColors.map(
                color => color || fallbackColor
              ),

            pointBorderColor:
              rColors.map(
                color => color || fallbackColor
              ),

            borderRadius: 4,

            borderWidth: 1,

            legendColor: storeColor
          };
        }
      );

    this.updateChartData(
      'rType',
      rLabels,
      datasets
    );
  }

  updateSpfGeralChart(data) {

    let comSpf = 0;

    let totalOperacoes = 0;

    data.forEach(d => {

      if (d.active === false) {
        return;
      }

      (d.sellers || [])
        .forEach(s => {

          if (
            !this.isSellerActive(
              s.name
            )
          ) {
            return;
          }

          const spf =
            Number(s.SPF) ||
            0;

          const operacoes =
            Number(
              s.operacoes
            ) || 0;

          comSpf +=
            Math.max(
              0,
              spf
            );

          totalOperacoes +=
            Math.max(
              0,
              operacoes
            );
        });
    });

    const semSpf =
      Math.max(
        0,
        totalOperacoes -
        comSpf
      );

    this.setCircularChartData(

      'spfGeral',

      [
        'Com SPF',
        'Sem SPF'
      ],

      [
        comSpf,
        semSpf
      ],

      [
        this.spfColors.comSpf,
        this.spfColors.semSpf
      ],
      this.getCircularContextLabel(data)
    );
  }

  updateSpfVendedorChart(data) {

    const sellerMap =
      new Map();

    data.forEach(d => {

      if (d.active === false) {
        return;
      }

      (d.sellers || [])
        .forEach(s => {

          if (
            !this.isSellerActive(
              s.name
            )
          ) {
            return;
          }

          const nameKey =
            this.normalizeName(
              s.name
            );

          if (
            !sellerMap.has(
              nameKey
            )
          ) {

            sellerMap.set(
              nameKey,
              {
                label: s.name,
                spfCount: 0,
                totalOperacoes: 0
              }
            );
          }

          const seller =
            sellerMap.get(
              nameKey
            );

          seller.spfCount +=
            Number(s.SPF) ||
            0;

          seller.totalOperacoes +=
            Number(
              s.operacoes
            ) || 0;
        });
    });

    const sellerEntries =
      Array.from(
        sellerMap.values()
      );

    sellerEntries.sort(
      (a, b) =>
        b.spfCount -
        a.spfCount
    );

    const labels =
      sellerEntries.map(
        item => item.label
      );

    const values =
      sellerEntries.map(
        item => item.spfCount
      );

    const chart =
      this.charts.get(
        'spfVendedor'
      );

    if (!chart) {
      return;
    }

    const currentType =
      this.chartTypes.spfVendedor;

    if (
      this.isCircularType(
        currentType
      )
    ) {

      const filtered =
        sellerEntries.filter(
          item =>
            item.spfCount > 0
        );

      if (
        filtered.length === 0
      ) {

        this.setCircularChartData(
          'spfVendedor',
          ['Sem SPF'],
          [1],
          ['#E5E7EB']
        );

        return;
      }

      this.setCircularChartData(
        'spfVendedor',

        filtered.map(
          item => item.label
        ),

        filtered.map(
          item => item.spfCount
        ),

        this.getDistinctColors(
          filtered.length
        ),
        this.getCircularContextLabel(data)
      );

      return;
    }

    chart.data.labels =
      [...labels];

    chart.data.datasets = [

      {

        label:
          'Quantidade de SPF',

        data:
          [...values],

        backgroundColor:
          this.spfColors.comSpf,

        borderColor:
          this.spfColors.comSpf,

        borderRadius: 4,

        borderWidth: 1
      }
    ];

    chart.update('none');
  }

  updateChartData(
    key,
    labels,
    datasets
  ) {

    const chart =
      this.charts.get(key);

    if (!chart) {
      return;
    }

    const type =
      this.chartTypes[key];

    if (
      this.isCircularType(
        type
      )
    ) {

      const source =
        datasets &&
        datasets.length
          ? datasets[0]
          : null;

      if (!source) {

        chart.data.labels =
          Array.isArray(labels)
            ? [...labels]
            : [];

        chart.data.datasets = [];

        chart.update('none');

        return;
      }

      const values =
        Array.isArray(
          source.data
        )
          ? [...source.data]
          : [];

      chart.data.labels =
        Array.isArray(labels)
          ? [...labels]
          : [];

      chart.data.datasets = [

        {

          label:
            source.label ||
            source.contextLabel ||
            'Dados',

          contextLabel:
            source.contextLabel ||
            source.label ||
            'Dados',

          data:
            values,

          backgroundColor:
            this.getDistinctColors(
              values.length
            ),

          borderColor:
            '#ffffff',

          borderWidth: 2
        }
      ];

    } else {

      chart.data.labels =
        Array.isArray(labels)
          ? [...labels]
          : [];

      chart.data.datasets =
        Array.isArray(datasets)
          ? datasets
          : [];
    }

    chart.update('none');
  }

  setCircularChartData(
    key,
    labels,
    values,
    colors,
    contextLabel = 'Dados'
  ) {

    const chart =
      this.charts.get(key);

    if (!chart) {
      return;
    }

    const safeLabels =
      Array.isArray(labels)
        ? labels.map(
            (label, index) => {
              const text =
                String(
                  label ?? ''
                ).trim();

              return text ||
                `Item ${index + 1}`;
            }
          )
        : [];

    const safeValues =
      Array.isArray(values)
        ? values.map(
            value =>
              Number(value) ||
              0
          )
        : [];

    const safeColors =
      Array.isArray(colors)
        ? [...colors]
        : this.getDistinctColors(
            safeValues.length
          );

    chart.data.labels =
      safeLabels;

    chart.data.datasets = [

      {

        label:
          contextLabel || 'Dados',

        contextLabel:
          contextLabel || 'Dados',

        data:
          safeValues,

        backgroundColor:
          safeColors,

        borderColor:
          '#ffffff',

        borderWidth: 2
      }
    ];

    chart.update('none');
  }

  getDistinctColors(
    count,
    offset = 0
  ) {

    if (
      !count ||
      count <= 0
    ) {
      return [];
    }

    const colors = [];

    for (
      let i = 0;
      i < count;
      i++
    ) {

      const index =
        (
          i +
          offset
        ) %
        this.pieColors.length;

      colors.push(
        this.pieColors[index]
      );
    }

    return colors;
  }

  isSellerActive(
    sellerName
  ) {

    if (
      this.activeSellers.size === 0
    ) {
      return true;
    }

    const key =
      this.normalizeName(
        sellerName
      );

    return this.activeSellers.has(
      key
    );
  }

  getStoreChartColor(data) {

    if (!data) {
      return null;
    }

    // A cor exibida na legenda do gráfico deve ser a MESMA
    // cor utilizada pelo componente "Lojas carregadas".
    if (
      typeof data.color === 'string' &&
      data.color.trim()
    ) {
      return data.color.trim();
    }

    try {
      const storeName =
        data.storeName ||
        data.name ||
        data.label ||
        '';

      if (
        storeConfig &&
        typeof storeConfig.getStoreColor === 'function'
      ) {
        return storeConfig.getStoreColor(storeName);
      }
    } catch (error) {
      console.warn(
        'ChartManager: erro ao obter cor da loja:',
        error
      );
    }

    return null;
  }

  // Mantido para compatibilidade com código legado.
  // A cor da legenda NÃO deve mais depender do mês.
  getMonthChartColor(data) {
    return this.getStoreChartColor(data);
  }

  getChartStoreLabel(data) {

    if (!data) {
      return 'Loja';
    }

    const brand =
      String(data.brand || '')
        .trim()
        .toUpperCase();

    const storeName =
      String(
        data.storeName ||
        data.name ||
        data.label ||
        ''
      ).trim();

    const locality =
      this.getChartStoreLocality(storeName, data.label);

    let month =
      String(
        data.monthLabel ||
        data.month ||
        ''
      ).trim();

    // Alguns datasets antigos podem chegar sem monthLabel.
    // Nesse caso, recuperamos o mês pelo arquivo de origem.
    if (!month) {
      try {
        const sourceText =
          [
            data.sourceFile,
            data.fileName,
            data.label,
            data.storeName,
            data.name
          ]
            .filter(Boolean)
            .join(' ');

        const detectedMonth =
          monthConfig.detectMonth(sourceText);

        month =
          monthConfig.getMonthLabel(
            detectedMonth
          );

        if (
          month === 'Mês não identificado'
        ) {
          month = '';
        }
      } catch (error) {
        month = '';
      }
    }

    const brandLabel =
      brand === 'MG IGT'
        ? 'MG'
        : brand || this.getBrandFromStoreName(storeName);

    const base =
      locality
        ? `${brandLabel} • ${locality}`
        : (data.label || storeName || brandLabel);

    return month
      ? `${base} ${month}`
      : base;
  }

  getChartStoreLocality(storeName, fallbackLabel = '') {

    const text =
      String(storeName || fallbackLabel || '')
        .trim()
        .toUpperCase();

    const suffixMatch =
      text.match(/-\s*([A-Z]{2,3})\s*$/);

    if (suffixMatch) {
      return suffixMatch[1];
    }

    if (text.includes('MG INGLATERRA') || text === 'MG INGLATERRA') {
      return 'IGT';
    }

    if (text.includes('IGUATEMI')) {
      return 'IGT';
    }

    if (text.includes('ITABUNA')) {
      return 'ITB';
    }

    if (text.includes('LAURO DE FREITAS')) {
      return 'LF';
    }

    if (text.includes('FEIRA DE SANTANA')) {
      return 'FSA';
    }

    if (text.includes('VITORIA DA CONQUISTA') || text.includes('VITÓRIA DA CONQUISTA')) {
      return 'VTC';
    }

    return '';
  }

  getBrandFromStoreName(storeName) {

    const text =
      this.normalizeName(storeName);

    if (text.includes('TERRACOTA')) return 'TERRACOTA';
    if (text.includes('BYD') || text.includes('MANDARIM')) return 'BYD';
    if (text.includes('MG INGLATERRA') || text.includes('INGLATERRA')) return 'MG';

    return '';
  }

  normalizeBankName(value) {
    return this.normalizeName(value)
      .replace(/\s+/g, ' ');
  }

  normalizeName(value) {

    return String(
      value ?? ''
    )
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );
  }

  // Método atualizado:
  // retorna array de strings para múltiplas linhas
  formatWithPercentage(
    value,
    context,
    isCurrency
  ) {

    const numValue =
      Number(value) ||
      0;

    // Obtém o total do dataset atual para cálculo
    let total = 0;

    if (
      context.dataset &&
      context.dataset.data
    ) {

      total =
        context.dataset.data.reduce(
          (
            acc,
            val
          ) =>
            acc +
            (
              Number(val) ||
              0
            ),
          0
        );
    }

    const formattedValue =
      isCurrency
        ? this.formatBRL(
            numValue
          )
        : this.formatInteger(
            numValue
          );

    // Retorna array para quebra de linha:
    // Porcentagem na primeira,
    // valor na segunda
    if (total === 0) {
      return [
        formattedValue
      ];
    }

    const percent =
      (
        numValue /
        total
      ) *
      100;

    const formattedPercent =
      `${percent
        .toFixed(1)
        .replace('.', ',')}%`;

    // Retornando array força o plugin
    // a colocar os textos em linhas diferentes
    return [
      formattedPercent,
      formattedValue
    ];
  }

  formatInteger(value) {

    const number =
      Number(value) ||
      0;

    return number.toLocaleString(
      'pt-BR',
      {
        maximumFractionDigits: 0
      }
    );
  }

  formatBRL(value) {

    const number =
      Number(value) ||
      0;

    return number.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );
  }

  clearCharts() {

    this.charts.forEach(
      chart => {

        if (!chart) {
          return;
        }

        try {

          chart.data.labels = [];

          chart.data.datasets = [];

          chart.update('none');

        } catch (error) {

          console.warn(
            'ChartManager: erro ao limpar gráfico:',
            error
          );
        }
      }
    );
  }

  destroyCharts() {

    this.charts.forEach(
      chart => {

        if (!chart) {
          return;
        }

        try {

          chart.destroy();

        } catch (error) {

          console.warn(
            'ChartManager: erro ao destruir gráfico:',
            error
          );
        }
      }
    );

    this.charts.clear();

    this.chartsReady = false;
  }
}