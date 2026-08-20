import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import {
  CHART_TYPES,
  CHART_COLORS
} from '../../config/chart.config.js';


// ================================================================
// REGISTRA SOMENTE O PLUGIN
// ================================================================
//
// NÃO ALTERAR:
// Chart.defaults.plugins.datalabels
// Chart.defaults.plugins.legend
//
// Todas as configurações são feitas individualmente em cada gráfico.
//
// ================================================================

Chart.register(ChartDataLabels);


export class ChartManager {

  constructor(eventBus) {

    this.eventBus = eventBus;

    this.charts = new Map();

    this.activeSellers = new Set();

    this.lastData = null;

    this.chartsReady = false;

    this.pendingUpdate = false;


    // ============================================================
    // CONTROLE INDIVIDUAL DOS VALORES
    // ============================================================

    this.showDataLabels = {

      vendedor: true,

      retornoSpf: true,

      banco: true,

      rType: true,

      spfGeral: true,

      spfVendedor: false

    };


    // ============================================================
    // TIPOS PADRÃO
    // ============================================================

    this.chartTypes = {

      vendedor: 'bar',

      retornoSpf: 'doughnut',

      banco: 'bar',

      rType: 'bar',

      spfGeral: 'doughnut',

      spfVendedor: 'bar'

    };


    // ============================================================
    // PALETA
    // ============================================================

    this.pieColors = [

      '#2563EB',
      '#16A34A',
      '#DC2626',
      '#F59E0B',
      '#7C3AED',
      '#0891B2',
      '#DB2777',
      '#65A30D',
      '#EA580C',
      '#4F46E5',
      '#0F766E',
      '#9333EA',
      '#CA8A04',
      '#BE123C',
      '#0369A1',
      '#15803D'

    ];


    // ============================================================
    // CORES SPF
    // ============================================================

    this.spfColors = {

      comSpf: '#16A34A',

      semSpf: '#DC2626'

    };


    // ============================================================
    // EVENTO DE FILTRO DE VENDEDORES
    // ============================================================

    if (this.eventBus) {

      this.eventBus.on(
        'seller:filterChanged',
        (activeSellers) => {

          this.activeSellers =
            activeSellers instanceof Set
              ? new Set(activeSellers)
              : new Set(
                  Array.isArray(activeSellers)
                    ? activeSellers
                    : []
                );


          if (this.lastData) {

            this.update(
              this.lastData
            );

          }

        }
      );

    }

  }


  // ==============================================================
  // TIPOS DISPONÍVEIS
  // ==============================================================

  getChartTypes(key) {

    let types = [];


    switch (key) {

      case 'vendedor':

        types =
          CHART_TYPES?.VENDEDOR || [

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'line',
              label: 'Linhas'
            },

            {
              value: 'radar',
              label: 'Radar'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      case 'retornoSpf':

        types =
          CHART_TYPES?.RETORNO_SPF || [

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      case 'banco':

        types =
          CHART_TYPES?.BANCO || [

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'line',
              label: 'Linhas'
            },

            {
              value: 'radar',
              label: 'Radar'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      case 'rType':

        types =
          CHART_TYPES?.R_TYPE || [

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'line',
              label: 'Linhas'
            },

            {
              value: 'radar',
              label: 'Radar'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      case 'spfGeral':

        types =
          CHART_TYPES?.SPF_GERAL || [

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      case 'spfVendedor':

        types =
          CHART_TYPES?.SPF_VENDEDOR || [

            {
              value: 'bar',
              label: 'Barras'
            },

            {
              value: 'line',
              label: 'Linhas'
            },

            {
              value: 'radar',
              label: 'Radar'
            },

            {
              value: 'pie',
              label: 'Pizza'
            },

            {
              value: 'doughnut',
              label: 'Rosca'
            },

            {
              value: 'polarArea',
              label: 'Área polar'
            }

          ];

        break;


      default:

        types = [];

    }


    if (!Array.isArray(types)) {

      types = [];

    }


    types =
      types
        .filter(
          type =>
            type &&
            typeof type.value === 'string' &&
            typeof type.label === 'string'
        )
        .map(
          type => ({
            value: type.value,
            label: type.label
          })
        );


    if (
      !types.some(
        type =>
          type.value === 'pie'
      )
    ) {

      types.push({

        value: 'pie',

        label: 'Pizza'

      });

    }


    if (
      !types.some(
        type =>
          type.value === 'doughnut'
      )
    ) {

      types.push({

        value: 'doughnut',

        label: 'Rosca'

      });

    }


    return types;

  }


  // ==============================================================
  // RENDER
  // ==============================================================

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
          'RETORNO SPF VS SPF A PAGAR',
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


  // ==============================================================
  // CRIA CARD
  // ==============================================================

  createChartCard(
    key,
    title,
    icon
  ) {

    const types =
      this.getChartTypes(
        key
      );


    const currentType =
      this.chartTypes[key];


    const hasCurrentType =
      types.some(
        type =>
          type.value === currentType
      );


    if (
      !hasCurrentType &&
      types.length > 0
    ) {

      this.chartTypes[key] =
        types[0].value;

    }


    const valuesEnabled =
      this.showDataLabels[key] === true;


    return `

      <div
        class="chart-card"
        data-chart-key="${key}"
      >

        <h3>

          <i class="fas ${icon}"></i>

          ${title}

        </h3>


        <div class="chart-toolbar">

          <span class="chart-type-label">
            Visualização
          </span>


          <select
            class="chart-type-select"
            id="chartType_${key}"
            aria-label="Selecionar visualização do gráfico"
          >

            ${types.map(
              type => `

                <option
                  value="${type.value}"
                  ${
                    type.value ===
                    this.chartTypes[key]
                      ? 'selected'
                      : ''
                  }
                >

                  ${type.label}

                </option>

              `
            ).join('')}

          </select>


          <select
            class="chart-type-select chart-values-select"
            id="chartValues_${key}"
            aria-label="Ativar ou desativar valores do gráfico"
          >

            <option
              value="on"
              ${
                valuesEnabled
                  ? 'selected'
                  : ''
              }
            >
              Valores: Ativados
            </option>

            <option
              value="off"
              ${
                !valuesEnabled
                  ? 'selected'
                  : ''
              }
            >
              Valores: Desativados
            </option>

          </select>

        </div>


        <div class="chart-container">

          <canvas
            id="chart_${key}"
          ></canvas>

        </div>

      </div>

    `;

  }


  // ==============================================================
  // INICIALIZA GRÁFICOS
  // ==============================================================

  initializeCharts() {

    const chartKeys = [

      'vendedor',

      'retornoSpf',

      'banco',

      'rType',

      'spfGeral',

      'spfVendedor'

    ];


    chartKeys.forEach(
      key => {

        const canvas =
          document.getElementById(
            `chart_${key}`
          );


        if (canvas) {

          const ctx =
            canvas.getContext(
              '2d'
            );


          const config =
            this.getDefaultConfig(
              key
            );


          try {

            const chart =
              new Chart(
                ctx,
                config
              );


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

      }
    );


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


  // ==============================================================
  // ATIVA / DESATIVA VALORES DE UM GRÁFICO
  // ==============================================================

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
      Boolean(
        visible
      );


    const chart =
      this.charts.get(
        key
      );


    if (!chart) {

      return;

    }


    if (!chart.options.plugins) {

      chart.options.plugins = {};

    }


    chart.options.plugins.datalabels =
      this.getDataLabelOptions(
        key,
        chart.config.type
      );


    chart.update(
      'none'
    );

  }


  // ==============================================================
  // DEFINE SE DEVE MOSTRAR
  // ==============================================================

  shouldShowDataLabels(
    key
  ) {

    // CORREÇÃO:
    // O SPF POR VENDEDOR também deve respeitar o estado
    // definido pelo seletor "Valores: Ativados/Desativados".
    //
    // Antes havia uma condição que bloqueava explicitamente
    // o spfVendedor, fazendo com que os valores nunca fossem
    // exibidos, mesmo quando o botão estava ativado.

    return (
      this.showDataLabels[key] === true
    );

  }


  // ==============================================================
  // CONFIGURAÇÃO PADRÃO
  // ==============================================================

  getDefaultConfig(
    key
  ) {

    const type =
      this.chartTypes[key] ||
      'bar';


    return {

      type,

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


  // ==============================================================
  // OPÇÕES
  // ==============================================================

  getChartOptions(
    key,
    type
  ) {

    const isCircular =
      this.isCircularType(
        type
      );


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

      layout: {

        padding: {

          top:
            this.getChartTopPadding(
              type
            ),

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


    if (
      !isCircular &&
      type !== 'radar'
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


    if (
      type === 'radar'
    ) {

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


  // ==============================================================
  // VERIFICA GRÁFICO CIRCULAR
  // ==============================================================

  isCircularType(
    type
  ) {

    return [

      'pie',

      'doughnut',

      'polarArea'

    ].includes(
      type
    );

  }


  // ==============================================================
  // ESPAÇO SUPERIOR
  // ==============================================================

  getChartTopPadding(
    type
  ) {

    if (
      type === 'bar'
    ) {

      return 24;

    }


    if (
      type === 'line'
    ) {

      return 26;

    }


    if (
      type === 'radar'
    ) {

      return 18;

    }


    return 8;

  }


  // ==============================================================
  // DATALABELS
  // ==============================================================

  getDataLabelOptions(
    key,
    type
  ) {

    const enabled =
      this.shouldShowDataLabels(
        key
      );


    const isCircular =
      this.isCircularType(
        type
      );


    // ============================================================
    // DESATIVADO
    // ============================================================

    if (!enabled) {

      return {

        display: false

      };

    }


    // ============================================================
    // SPF POR VENDEDOR
    // ============================================================

    // CORREÇÃO:
    // Antes este gráfico retornava "display: false" sempre.
    // Agora ele respeita o seletor de valores normalmente.

    if (
      key === 'spfVendedor'
    ) {

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

        font: {

          size: 9,

          weight: '700'

        },

        anchor:
          this.getDataLabelAnchor(
            type
          ),

        align:
          this.getDataLabelAlign(
            type
          ),

        offset:
          this.getDataLabelOffset(
            type
          ),

        clamp: true,

        clip: false,

        formatter: value =>
          this.formatInteger(
            value
          )

      };

    }


    // ============================================================
    // RETORNO SPF
    // ============================================================

    if (
      key === 'retornoSpf'
    ) {

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

        formatter: value =>
          this.formatBRL(
            value
          )

      };

    }


    // ============================================================
    // COM SPF VS SEM SPF
    // ============================================================

    if (
      key === 'spfGeral'
    ) {

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

        formatter: value =>
          this.formatInteger(
            value
          )

      };

    }


    // ============================================================
    // VENDEDOR / BANCO
    // ============================================================

    if (
      key === 'vendedor' ||
      key === 'banco'
    ) {

      return this.getFinancialDataLabelOptions(
        type
      );

    }


    // ============================================================
    // TIPO R
    // ============================================================

    if (
      key === 'rType'
    ) {

      return {

        display: context => {

          const value =
            Number(
              context.dataset.data[
                context.dataIndex
              ]
            ) || 0;


          if (
            value === 0
          ) {

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

        font: {

          size: 9,

          weight: '700'

        },

        anchor:
          this.getDataLabelAnchor(
            type
          ),

        align:
          this.getDataLabelAlign(
            type
          ),

        offset:
          this.getDataLabelOffset(
            type
          ),

        clamp: true,

        clip: false,

        formatter: value =>
          this.formatInteger(
            value
          )

      };

    }


    return {

      display: false

    };

  }


  // ==============================================================
  // CONFIGURAÇÃO FINANCEIRA
  // ==============================================================

  getFinancialDataLabelOptions(
    type
  ) {

    const isCircular =
      this.isCircularType(
        type
      );


    return {

      display: context => {

        const value =
          Number(
            context.dataset.data[
              context.dataIndex
            ]
          ) || 0;


        if (
          value === 0
        ) {

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


      font:
        context =>
          this.getResponsiveDataLabelFont(
            context
          ),


      anchor:
        this.getDataLabelAnchor(
          type
        ),


      align:
        this.getDataLabelAlign(
          type
        ),


      offset:
        this.getDataLabelOffset(
          type
        ),


      clamp: true,

      clip: false,


      formatter: value =>
        this.formatBRL(
          value
        )

    };

  }


  // ==============================================================
  // FONTE RESPONSIVA
  // ==============================================================

  getResponsiveDataLabelFont(
    context
  ) {

    const chart =
      context.chart;


    const width =
      chart?.width || 600;


    let size = 9;


    if (
      width < 400
    ) {

      size = 7;

    } else if (
      width < 600
    ) {

      size = 8;

    }


    return {

      size,

      weight: '700'

    };

  }


  // ==============================================================
  // POSIÇÃO DO VALOR
  // ==============================================================

  getDataLabelAnchor(
    type
  ) {

    if (
      type === 'bar'
    ) {

      return 'end';

    }


    if (
      type === 'line'
    ) {

      return 'center';

    }


    if (
      type === 'radar'
    ) {

      return 'end';

    }


    if (
      this.isCircularType(
        type
      )
    ) {

      return 'center';

    }


    return 'center';

  }


  // ==============================================================
  // ALINHAMENTO DO VALOR
  // ==============================================================

  getDataLabelAlign(
    type
  ) {

    if (
      type === 'bar'
    ) {

      return 'top';

    }


    if (
      type === 'line'
    ) {

      return context => {

        const index =
          context.dataIndex;


        return index % 2 === 0
          ? 'top'
          : 'bottom';

      };

    }


    if (
      type === 'radar'
    ) {

      return 'end';

    }


    if (
      this.isCircularType(
        type
      )
    ) {

      return 'center';

    }


    return 'center';

  }


  // ==============================================================
  // DISTÂNCIA DO VALOR
  // ==============================================================

  getDataLabelOffset(
    type
  ) {

    if (
      type === 'bar'
    ) {

      return 3;

    }


    if (
      type === 'line'
    ) {

      return 7;

    }


    if (
      type === 'radar'
    ) {

      return 5;

    }


    if (
      this.isCircularType(
        type
      )
    ) {

      return 0;

    }


    return 4;

  }


  // ==============================================================
  // ALTERA TIPO
  // ==============================================================

  changeChartType(
    key,
    type
  ) {

    const validTypes =
      this.getChartTypes(
        key
      );


    const valid =
      validTypes.some(
        item =>
          item.value === type
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
      this.charts.get(
        key
      );


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


    this.charts.delete(
      key
    );


    const ctx =
      canvas.getContext(
        '2d'
      );


    const config = {

      type,

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


    if (
      this.lastData
    ) {

      this.updateSingleChart(
        key,
        this.lastData
      );

    }

  }


  // ==============================================================
  // ATUALIZA UM GRÁFICO
  // ==============================================================

  updateSingleChart(
    key,
    data
  ) {

    switch (key) {

      case 'vendedor':

        this.updateVendedorChart(
          data
        );

        break;


      case 'retornoSpf':

        this.updateRetornoSpfChart(
          data
        );

        break;


      case 'banco':

        this.updateBancoChart(
          data
        );

        break;


      case 'rType':

        this.updateRTypeChart(
          data
        );

        break;


      case 'spfGeral':

        this.updateSpfGeralChart(
          data
        );

        break;


      case 'spfVendedor':

        this.updateSpfVendedorChart(
          data
        );

        break;

    }

  }


  // ==============================================================
  // UPDATE GERAL
  // ==============================================================

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


  // ==============================================================
  // VENDEDOR
  // ==============================================================

  updateVendedorChart(
    data
  ) {

    const sellerMap =
      new Map();


    data.forEach(
      d => {

        if (
          d.active === false
        ) {

          return;

        }


        (
          d.sellers || []
        ).forEach(
          s => {

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

                  label:
                    s.name,

                  values: {}

                }
              );

            }


            const sellerData =
              sellerMap.get(
                nameKey
              );


            sellerData.values[
              d.label
            ] =
              (
                sellerData.values[
                  d.label
                ] || 0
              ) +
              (
                Number(
                  s.receita
                ) || 0
              );

          }
        );

      }
    );


    const sellerEntries =
      Array.from(
        sellerMap.values()
      );


    const labels =
      sellerEntries.map(
        item =>
          item.label
      );


    const activeData =
      data.filter(
        d =>
          d.active !== false
      );


    const datasets =
      activeData.map(
        (d, index) => {

          const color =
            CHART_COLORS[
              index %
              CHART_COLORS.length
            ];


          return {

            label:
              d.label,

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

            borderRadius:
              4,

            borderWidth:
              1

          };

        }
      );


    this.updateChartData(
      'vendedor',
      labels,
      datasets
    );

  }


  // ==============================================================
  // RETORNO SPF
  // ==============================================================

  updateRetornoSpfChart(
    data
  ) {

    let totalRetorno = 0;

    let totalSpf = 0;


    data.forEach(
      d => {

        if (
          d.active === false
        ) {

          return;

        }


        (
          d.sellers || []
        ).forEach(
          s => {

            if (
              !this.isSellerActive(
                s.name
              )
            ) {

              return;

            }


            totalRetorno +=
              Number(
                s.retorno
              ) || 0;


            totalSpf +=
              Number(
                s.spfValor
              ) || 0;

          }
        );

      }
    );


    this.setCircularChartData(

      'retornoSpf',

      [
        'Retorno',
        'SPF a pagar'
      ],

      [
        totalRetorno,
        totalSpf
      ],

      [
        this.pieColors[1],
        this.pieColors[2]
      ]

    );

  }


  // ==============================================================
  // BANCO
  // ==============================================================

  updateBancoChart(
    data
  ) {

    const bankSet =
      new Set();


    data.forEach(
      d => {

        if (
          d.active === false
        ) {

          return;

        }


        Object.keys(
          d.bancos || {}
        ).forEach(
          bank =>
            bankSet.add(
              bank
            )
        );

      }
    );


    const labels =
      Array.from(
        bankSet
      );


    const activeData =
      data.filter(
        d =>
          d.active !== false
      );


    const currentType =
      this.chartTypes.banco;


    if (
      this.isCircularType(
        currentType
      )
    ) {

      const totals =
        labels.map(
          bank =>
            activeData.reduce(
              (
                total,
                d
              ) =>
                total +
                (
                  Number(
                    (
                      d.bancos || {}
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

        this.getDistinctColors(
          labels.length
        )

      );


      return;

    }


    const datasets =
      activeData.map(
        (d, index) => {

          const color =
            CHART_COLORS[
              index %
              CHART_COLORS.length
            ];


          return {

            label:
              d.label,

            data:
              labels.map(
                bank =>
                  Number(
                    (
                      d.bancos || {}
                    )[bank]
                  ) || 0
              ),

            backgroundColor:
              color,

            borderColor:
              color,

            borderRadius:
              4,

            borderWidth:
              1

          };

        }
      );


    this.updateChartData(
      'banco',
      labels,
      datasets
    );

  }


  // ==============================================================
  // TIPO R
  // ==============================================================

  updateRTypeChart(
    data
  ) {

    const rLabels = [

      'R0',
      'R1',
      'R2',
      'R3',
      'R4',
      'R5',
      'R150',
      'R100',
      'R75',
      'R50'

    ];


    const activeData =
      data.filter(
        d =>
          d.active !== false
      );


    const currentType =
      this.chartTypes.rType;


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

                (
                  d.sellers || []
                ).forEach(
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

        this.getDistinctColors(
          rLabels.length
        )

      );


      return;

    }


    const datasets =
      activeData.map(
        (d, index) => {

          const color =
            CHART_COLORS[
              index %
              CHART_COLORS.length
            ];


          return {

            label:
              d.label,

            data:
              rLabels.map(
                r => {

                  let total = 0;


                  (
                    d.sellers || []
                  ).forEach(
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
              color,

            borderColor:
              color,

            borderRadius:
              4,

            borderWidth:
              1

          };

        }
      );


    this.updateChartData(
      'rType',
      rLabels,
      datasets
    );

  }


  // ==============================================================
  // COM SPF VS SEM SPF
  // ==============================================================

  updateSpfGeralChart(
    data
  ) {

    let comSpf = 0;

    let totalOperacoes = 0;


    data.forEach(
      d => {

        if (
          d.active === false
        ) {

          return;

        }


        (
          d.sellers || []
        ).forEach(
          s => {

            if (
              !this.isSellerActive(
                s.name
              )
            ) {

              return;

            }


            const spf =
              Number(
                s.SPF
              ) || 0;


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

          }
        );

      }
    );


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
      ]

    );

  }


  // ==============================================================
  // SPF POR VENDEDOR
  // ==============================================================

  updateSpfVendedorChart(
    data
  ) {

    const sellerMap =
      new Map();


    data.forEach(
      d => {

        if (
          d.active === false
        ) {

          return;

        }


        (
          d.sellers || []
        ).forEach(
          s => {

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

                  label:
                    s.name,

                  spfCount:
                    0,

                  totalOperacoes:
                    0

                }
              );

            }


            const seller =
              sellerMap.get(
                nameKey
              );


            seller.spfCount +=
              Number(
                s.SPF
              ) || 0;


            seller.totalOperacoes +=
              Number(
                s.operacoes
              ) || 0;

          }
        );

      }
    );


    const sellerEntries =
      Array.from(
        sellerMap.values()
      );


    sellerEntries.sort(
      (
        a,
        b
      ) =>
        b.spfCount -
        a.spfCount
    );


    const labels =
      sellerEntries.map(
        item =>
          item.label
      );


    const values =
      sellerEntries.map(
        item =>
          item.spfCount
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

          [
            'Sem SPF'
          ],

          [
            1
          ],

          [
            '#E5E7EB'
          ]

        );


        return;

      }


      this.setCircularChartData(

        'spfVendedor',

        filtered.map(
          item =>
            item.label
        ),

        filtered.map(
          item =>
            item.spfCount
        ),

        this.getDistinctColors(
          filtered.length
        )

      );


      return;

    }


    chart.data.labels =
      [
        ...labels
      ];


    chart.data.datasets = [

      {

        label:
          'Quantidade de SPF',

        data:
          [
            ...values
          ],

        backgroundColor:
          this.spfColors.comSpf,

        borderColor:
          this.spfColors.comSpf,

        borderRadius:
          4,

        borderWidth:
          1

      }

    ];


    chart.update(
      'none'
    );

  }


  // ==============================================================
  // ATUALIZA DADOS
  // ==============================================================

  updateChartData(
    key,
    labels,
    datasets
  ) {

    const chart =
      this.charts.get(
        key
      );


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
            ? [
                ...labels
              ]
            : [];


        chart.data.datasets =
          [];


        chart.update(
          'none'
        );


        return;

      }


      const values =
        Array.isArray(
          source.data
        )
          ? [
              ...source.data
            ]
          : [];


      chart.data.labels =
        Array.isArray(labels)
          ? [
              ...labels
            ]
          : [];


      chart.data.datasets = [

        {

          label:
            source.label || '',

          data:
            values,

          backgroundColor:
            this.getDistinctColors(
              values.length
            ),

          borderColor:
            '#ffffff',

          borderWidth:
            2

        }

      ];

    } else {

      chart.data.labels =
        Array.isArray(labels)
          ? [
              ...labels
            ]
          : [];


      chart.data.datasets =
        Array.isArray(datasets)
          ? datasets
          : [];

    }


    chart.update(
      'none'
    );

  }


  // ==============================================================
  // GRÁFICO CIRCULAR
  // ==============================================================

  setCircularChartData(
    key,
    labels,
    values,
    colors
  ) {

    const chart =
      this.charts.get(
        key
      );


    if (!chart) {

      return;

    }


    const safeLabels =
      Array.isArray(labels)
        ? [
            ...labels
          ]
        : [];


    const safeValues =
      Array.isArray(values)
        ? values.map(
            value =>
              Number(
                value
              ) || 0
          )
        : [];


    const safeColors =
      Array.isArray(colors)
        ? [
            ...colors
          ]
        : this.getDistinctColors(
            safeValues.length
          );


    chart.data.labels =
      safeLabels;


    chart.data.datasets = [

      {

        data:
          safeValues,

        backgroundColor:
          safeColors,

        borderColor:
          '#ffffff',

        borderWidth:
          2

      }

    ];


    chart.update(
      'none'
    );

  }


  // ==============================================================
  // CORES
  // ==============================================================

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


  // ==============================================================
  // VENDEDORES ATIVOS
  // ==============================================================

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


  // ==============================================================
  // NORMALIZA NOME
  // ==============================================================

  normalizeName(
    value
  ) {

    return String(
      value ?? ''
    )
      .trim()
      .toUpperCase()
      .normalize(
        'NFD'
      )
      .replace(
        /[\u0300-\u036f]/g,
        ''
      );

  }


  // ==============================================================
  // INTEIRO
  // ==============================================================

  formatInteger(
    value
  ) {

    const number =
      Number(
        value
      ) || 0;


    return number.toLocaleString(
      'pt-BR',
      {

        maximumFractionDigits:
          0

      }
    );

  }


  // ==============================================================
  // BRL
  // ==============================================================

  formatBRL(
    value
  ) {

    const number =
      Number(
        value
      ) || 0;


    return number.toLocaleString(
      'pt-BR',
      {

        style:
          'currency',

        currency:
          'BRL',

        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2

      });

  }


  // ==============================================================
  // LIMPA
  // ==============================================================

  clearCharts() {

    this.charts.forEach(
      chart => {

        if (!chart) {

          return;

        }


        try {

          chart.data.labels =
            [];

          chart.data.datasets =
            [];


          chart.update(
            'none'
          );

        } catch (error) {

          console.warn(
            'ChartManager: erro ao limpar gráfico:',
            error
          );

        }

      }
    );

  }


  // ==============================================================
  // DESTROI
  // ==============================================================

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