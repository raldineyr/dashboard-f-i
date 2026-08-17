import Chart from 'chart.js/auto';
import {
  CHART_TYPES,
  CHART_COLORS
} from '../../config/chart.config.js';

export class ChartManager {

  constructor(eventBus) {

    this.eventBus = eventBus;

    this.charts = new Map();

    this.activeSellers = new Set();

    this.lastData = null;
    this.chartsReady = false;
    this.pendingUpdate = false;


    // =========================================================
    // TIPOS PADRÃO DOS GRÁFICOS
    // =========================================================

    this.chartTypes = {

      vendedor: 'bar',

      retornoSpf: 'bar',

      banco: 'bar',

      rType: 'bar',

      spfGeral: 'doughnut',

      spfVendedor: 'bar'

    };


    // =========================================================
    // PALETA PARA GRÁFICOS DE PIZZA / ROSCA
    // =========================================================

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


    // =========================================================
    // CORES PARA SPF
    // =========================================================

    this.spfColors = {
      comSpf: '#16A34A',
      semSpf: '#DC2626'
    };


    // =========================================================
    // ESCUTA FILTRO DE VENDEDORES
    // =========================================================

    if (this.eventBus) {
      this.eventBus.on(
        'seller:filterChanged',
        (activeSellers) => {

          this.activeSellers =
            activeSellers || new Set();

          if (this.lastData) {
            this.update(this.lastData);
          }

        }
      );

      // O ChartManager também escuta diretamente a chegada dos dados.
      // Isso garante que o gráfico RETORNO SPF VS SPF A PAGAR seja
      // atualizado mesmo quando o CSV chega no mesmo ciclo em que os
      // componentes do dashboard estão sendo renderizados.
      this.eventBus.on('data:updated', (data) => {
        this.lastData = Array.isArray(data) ? data : [];

        if (this.chartsReady && this.charts.size > 0) {
          this.update(this.lastData);
        } else {
          this.pendingUpdate = true;
        }
      });
    }

  }


  // =========================================================
  // GARANTE QUE O TIPO PIZZA EXISTE
  // =========================================================

  getChartTypes(key) {

    let types = [];

    switch (key) {

      case 'vendedor':
        types = CHART_TYPES?.VENDEDOR || [
          { value: 'bar', label: 'Barras' },
          { value: 'line', label: 'Linhas' },
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
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'banco':
        types = CHART_TYPES?.BANCO || [
          { value: 'bar', label: 'Barras' },
          { value: 'line', label: 'Linhas' },
          { value: 'radar', label: 'Radar' },
          { value: 'pie', label: 'Pizza' },
          { value: 'doughnut', label: 'Rosca' },
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'rType':
        types = CHART_TYPES?.R_TYPE || [
          { value: 'bar', label: 'Barras' },
          { value: 'line', label: 'Linhas' },
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
          { value: 'polarArea', label: 'Área polar' }
        ];
        break;

      case 'spfVendedor':
        types = CHART_TYPES?.SPF_VENDEDOR || [
          { value: 'bar', label: 'Barras' },
          { value: 'line', label: 'Linhas' },
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

    types = [...types];

    const hasPie = types.some(type => type && type.value === 'pie');
    if (!hasPie) {
      types.push({ value: 'pie', label: 'Pizza' });
    }

    const hasDoughnut = types.some(type => type && type.value === 'doughnut');
    if (!hasDoughnut) {
      types.push({ value: 'doughnut', label: 'Rosca' });
    }

    return types;

  }


  // =========================================================
  // RENDER
  // =========================================================

  render(container) {

    if (!container) {
      console.error('ChartManager: container não encontrado.');
      return;
    }

    container.innerHTML = `

      <div class="chart-grid">

        ${this.createChartCard('vendedor', 'RENTABILIDADE POR VENDEDOR', 'fa-users')}
        ${this.createChartCard('retornoSpf', 'RETORNO SPF VS SPF A PAGAR', 'fa-chart-pie')}
        ${this.createChartCard('banco', 'FINANCIAMENTOS POR BANCO', 'fa-university')}
        ${this.createChartCard('rType', 'COMISSÃO TIPO R', 'fa-tags')}
        ${this.createChartCard('spfGeral', 'COM SPF VS SEM SPF', 'fa-check-circle')}
        ${this.createChartCard('spfVendedor', 'SPF POR VENDEDOR', 'fa-user-check')}

      </div>

      <div class="chart-note">
        Use "Visualização" para alternar entre barras, linhas, radar, rosca/pizza e área polar.
      </div>

    `;

    this.initializeCharts();
    this.chartsReady = true;

    // Garante especificamente a existência do gráfico RETORNO SPF VS SPF A PAGAR
    // antes de processar qualquer atualização pendente.
    this.ensureRetornoSpfChart();

    // O CSV pode ser carregado muito próximo do momento em que os canvases
    // entram no DOM. Fazemos algumas tentativas curtas de atualização para
    // garantir que o primeiro desenho aconteça sem exigir troca manual no
    // seletor de visualização.
    this.scheduleInitialUpdate();

  }


  // =========================================================
  // CARD DO GRÁFICO
  // =========================================================

  createChartCard(key, title, icon) {

    const types = this.getChartTypes(key);

    // Garante que o tipo atual existe na lista
    const currentType = this.chartTypes[key];
    const hasCurrentType = types.some(t => t.value === currentType);

    if (!hasCurrentType && types.length > 0) {
      this.chartTypes[key] = types[0].value;
    }

    return `

      <div class="chart-card">

        <h3>
          <i class="fas ${icon}"></i>
          ${title}
        </h3>

        <div class="chart-toolbar">
          <span class="chart-type-label">Visualização</span>
          <select class="chart-type-select" id="chartType_${key}">
            ${types.map(type => `
              <option value="${type.value}" ${type.value === this.chartTypes[key] ? 'selected' : ''}>
                ${type.label}
              </option>
            `).join('')}
          </select>
        </div>

        <div class="chart-container">
          <canvas id="chart_${key}"></canvas>
        </div>

      </div>

    `;

  }


  // =========================================================
  // INICIALIZA OS GRÁFICOS
  // =========================================================

  initializeCharts() {

    const chartKeys = ['vendedor', 'retornoSpf', 'banco', 'rType', 'spfGeral', 'spfVendedor'];

    chartKeys.forEach(key => {

      const canvas = document.getElementById(`chart_${key}`);

      if (canvas) {
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, this.getDefaultConfig(key));
        this.charts.set(key, chart);
      }

      const select = document.getElementById(`chartType_${key}`);

      if (select) {
        select.addEventListener('change', event => {
          this.changeChartType(key, event.target.value);
        });
      }

    });

    // Força o Chart.js a calcular o tamanho dos canvases após o DOM
    // estar efetivamente renderizado. Isso evita gráficos vazios no
    // primeiro carregamento do CSV.
    requestAnimationFrame(() => {
      this.charts.forEach(chart => chart.resize());
      this.scheduleInitialUpdate();
    });

  }

  // Garante o primeiro desenho dos gráficos depois que o DOM, o CSS e os
  // dados do CSV estiverem disponíveis. O update é idempotente, então as
  // tentativas extras não alteram os dados nem o tipo escolhido.
  scheduleInitialUpdate() {
    const run = () => {
      if (!this.chartsReady || this.charts.size === 0) return;

      this.ensureRetornoSpfChart();

      if (this.lastData?.length) {
        this.update(this.lastData);
      }
    };

    requestAnimationFrame(run);
    requestAnimationFrame(() => requestAnimationFrame(run));
    setTimeout(run, 80);
    setTimeout(run, 250);
  }

  ensureRetornoSpfChart() {
    const canvas = document.getElementById('chart_retornoSpf');
    if (!canvas) return null;

    let chart = this.charts.get('retornoSpf');

    // Se o DOM recriou o canvas, o Chart antigo não pode ser reutilizado.
    if (chart && chart.canvas !== canvas) {
      try { chart.destroy(); } catch (_) {}
      this.charts.delete('retornoSpf');
      chart = null;
    }

    if (!chart) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      chart = new Chart(ctx, this.getDefaultConfig('retornoSpf'));
      this.charts.set('retornoSpf', chart);
    }

    try {
      chart.resize();
    } catch (_) {}

    return chart;
  }


  // =========================================================
  // CONFIGURAÇÃO PADRÃO
  // =========================================================

  getDefaultConfig(key) {

    const type = this.chartTypes[key] || 'bar';

    return {
      type: type,
      data: {
        labels: [],
        datasets: []
      },
      options: this.getChartOptions(type)
    };

  }


  // =========================================================
  // OPÇÕES DO GRÁFICO
  // =========================================================

  getChartOptions(type) {

    const isCircular = ['doughnut', 'pie', 'polarArea'].includes(type);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 12,
            font: {
              size: 10
            }
          }
        }
      }
    };

    if (!isCircular && type !== 'radar') {
      options.scales = {
        y: {
          beginAtZero: true
        }
      };
    }

    return options;

  }


  // =========================================================
  // ALTERA TIPO DO GRÁFICO
  // =========================================================

  changeChartType(key, type) {

    console.log(`ChartManager: alterando ${key} para ${type}`);

    this.chartTypes[key] = type;

    const chart = this.charts.get(key);
    const canvas = document.getElementById(`chart_${key}`);

    if (!chart || !canvas) {
      return;
    }

    // Copia os dados atuais
    const oldData = {
      labels: [...(chart.data.labels || [])],
      datasets: (chart.data.datasets || []).map(dataset => ({
        ...dataset,
        data: [...(dataset.data || [])],
        backgroundColor: Array.isArray(dataset.backgroundColor)
          ? [...dataset.backgroundColor]
          : dataset.backgroundColor
      }))
    };

    chart.destroy();

    const preparedData = this.prepareDataForChartType(oldData, type);

    const ctx = canvas.getContext('2d');
    const newChart = new Chart(ctx, {
      type,
      data: preparedData,
      options: this.getChartOptions(type)
    });

    this.charts.set(key, newChart);

    // Redesenha com os dados atuais
    if (this.lastData) {
      switch (key) {
        case 'vendedor':
          this.updateVendedorChart(this.lastData);
          break;
        case 'retornoSpf':
          this.updateRetornoSpfChart(this.lastData);
          break;
        case 'banco':
          this.updateBancoChart(this.lastData);
          break;
        case 'rType':
          this.updateRTypeChart(this.lastData);
          break;
        case 'spfGeral':
          this.updateSpfGeralChart(this.lastData);
          break;
        case 'spfVendedor':
          this.updateSpfVendedorChart(this.lastData);
          break;
      }
    }

  }


  // =========================================================
  // PREPARA DATASET DE ACORDO COM O TIPO
  // =========================================================

  prepareDataForChartType(data, type) {

    if (!data) {
      return {
        labels: [],
        datasets: []
      };
    }

    if (['pie', 'doughnut', 'polarArea'].includes(type)) {

      return {
        labels: data.labels || [],
        datasets: (data.datasets || []).map((dataset, datasetIndex) => {
          const amount = Array.isArray(dataset.data) ? dataset.data.length : 0;
          return {
            ...dataset,
            data: [...(dataset.data || [])],
            backgroundColor: this.getDistinctColors(amount, datasetIndex),
            borderColor: '#ffffff',
            borderWidth: 2
          };
        })
      };

    }

    return data;

  }


  // =========================================================
  // RETORNA CORES DISTINTAS
  // =========================================================

  getDistinctColors(count, offset = 0) {

    if (!count || count <= 0) {
      return [];
    }

    const colors = [];

    for (let i = 0; i < count; i++) {
      const index = (i + offset) % this.pieColors.length;
      colors.push(this.pieColors[index]);
    }

    return colors;

  }


  // =========================================================
  // UPDATE GERAL
  // =========================================================

  update(data) {

    console.log(
      'ChartManager.update: recebeu',
      data?.length || 0,
      'lojas'
    );

    this.lastData = Array.isArray(data) ? data : [];

    if (!this.chartsReady || this.charts.size === 0) {
      // Os dados podem chegar no mesmo ciclo em que os canvases ainda
      // estão sendo montados. Guarda a atualização e executa assim que
      // os gráficos estiverem prontos.
      this.pendingUpdate = true;
      return;
    }

    if (this.lastData.length === 0) {
      this.clearCharts();
      return;
    }

    this.pendingUpdate = false;

    // Um gráfico com dados inválidos não pode impedir os demais de serem
    // desenhados. Cada atualização é isolada para que o carregamento do CSV
    // sempre resulte em gráficos visíveis.
    const updates = [
      ['vendedor', () => this.updateVendedorChart(this.lastData)],
      ['retornoSpf', () => this.updateRetornoSpfChart(this.lastData)],
      ['banco', () => this.updateBancoChart(this.lastData)],
      ['rType', () => this.updateRTypeChart(this.lastData)],
      ['spfGeral', () => this.updateSpfGeralChart(this.lastData)],
      ['spfVendedor', () => this.updateSpfVendedorChart(this.lastData)]
    ];

    updates.forEach(([key, callback]) => {
      try {
        callback();
      } catch (error) {
        console.error(`ChartManager: erro ao atualizar ${key}:`, error);
      }
    });

    // Segundo ciclo após o layout garante que Chart.js calcule corretamente
    // a área dos canvases, inclusive para pizza/rosca.
    requestAnimationFrame(() => {
      this.charts.forEach(chart => {
        try {
          chart.resize();
          chart.update('none');
        } catch (error) {
          console.error('ChartManager: erro ao redesenhar gráfico:', error);
        }
      });
    });

  }


  // =========================================================
  // VERIFICA VENDEDOR ATIVO
  // =========================================================

  isSellerActive(sellerName) {

    if (this.activeSellers.size === 0) {
      return true;
    }

    const key = sellerName
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return this.activeSellers.has(key);

  }


  // =========================================================
  // GRÁFICO VENDEDOR
  // =========================================================

  updateVendedorChart(data) {

    const sellerMap = new Map();

    data.forEach(d => {
      if (d.active === false) return;
      (d.sellers || []).forEach(s => {
        if (!this.isSellerActive(s.name)) return;
        const nameKey = s.name.toUpperCase();
        if (!sellerMap.has(nameKey)) {
          sellerMap.set(nameKey, {
            label: s.name,
            values: {}
          });
        }
        sellerMap.get(nameKey).values[d.label] =
          (sellerMap.get(nameKey).values[d.label] || 0) + (s.receita || 0);
      });
    });

    const sellerEntries = Array.from(sellerMap.values());
    const labels = sellerEntries.map(x => x.label);
    const activeData = data.filter(d => d.active !== false);

    const datasets = activeData.map((d, i) => ({
      label: d.label,
      data: sellerEntries.map(x => x.values[d.label] || 0),
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
      borderRadius: 4
    }));

    this.updateChartData('vendedor', labels, datasets);

  }


  // =========================================================
  // RETORNO VS SPF
  // =========================================================

  updateRetornoSpfChart(data) {
    if (!Array.isArray(data) || data.length === 0) return;

    let totalRet = 0;
    let totalSpf = 0;

    data.forEach(d => {
      if (!d || d.active === false) return;

      if (this.activeSellers.size > 0) {
        (Array.isArray(d.sellers) ? d.sellers : []).forEach(s => {
          if (!this.isSellerActive(s?.name)) return;
          totalRet += Number(s?.retorno) || 0;
          totalSpf += Number(s?.spfValor) || 0;
        });
      } else {
        totalRet += Number(d?.kpis?.retorno) || 0;
        totalSpf += Number(d?.kpis?.spfPagar) || 0;
      }
    });

    const chart = this.ensureRetornoSpfChart();
    if (!chart) return;

    chart.data.labels = ['Retorno SPF', 'SPF a pagar'];
    chart.data.datasets = [{
      label: 'Valores',
      data: [totalRet, totalSpf],
      backgroundColor: ['#16A34A', '#F59E0B'],
      borderColor: '#ffffff',
      borderWidth: 2,
      borderRadius: 4,
      hoverOffset: 6
    }];

    chart.options = {
      ...this.getChartOptions(this.chartTypes.retornoSpf),
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        ...this.getChartOptions(this.chartTypes.retornoSpf).plugins,
        legend: {
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.raw) || 0;
              return ` ${context.label}: R$ ${value.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}`;
            }
          }
        }
      }
    };

    chart.resize();
    chart.update('none');
  }


  // =========================================================
  // GRÁFICO BANCO
  // =========================================================

  updateBancoChart(data) {

    const bankSet = new Set();

    data.forEach(d => {
      if (d.active === false) return;
      Object.keys(d.bancos || {}).forEach(bank => bankSet.add(bank));
    });

    const labels = Array.from(bankSet);
    const activeData = data.filter(d => d.active !== false);
    const chart = this.charts.get('banco');
    const currentType = this.chartTypes.banco;

    if (['pie', 'doughnut', 'polarArea'].includes(currentType)) {

      const totals = labels.map(bank => {
        return activeData.reduce((total, d) => {
          return total + (Number((d.bancos || {})[bank]) || 0);
        }, 0);
      });

      if (chart) {
        chart.data.labels = labels;
        chart.data.datasets = [{
          data: totals,
          backgroundColor: this.getDistinctColors(labels.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }];
        chart.update();
      }

      return;

    }

    const datasets = activeData.map((d, i) => ({
      label: d.label,
      data: labels.map(bank => (d.bancos || {})[bank] || 0),
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
      borderRadius: 4
    }));

    this.updateChartData('banco', labels, datasets);

  }


  // =========================================================
  // GRÁFICO R
  // =========================================================

  updateRTypeChart(data) {

    const rLabels = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R150', 'R100', 'R75', 'R50'];
    const activeData = data.filter(d => d.active !== false);
    const chart = this.charts.get('rType');
    const currentType = this.chartTypes.rType;

    if (['pie', 'doughnut', 'polarArea'].includes(currentType)) {

      const totals = rLabels.map(r => {
        let total = 0;
        activeData.forEach(d => {
          (d.sellers || []).forEach(s => {
            if (!this.isSellerActive(s.name)) return;
            total += Number(s[r]) || 0;
          });
        });
        return total;
      });

      if (chart) {
        chart.data.labels = rLabels;
        chart.data.datasets = [{
          data: totals,
          backgroundColor: this.getDistinctColors(rLabels.length),
          borderColor: '#ffffff',
          borderWidth: 2
        }];
        chart.update();
      }

      return;

    }

    const datasets = activeData.map((d, i) => ({
      label: d.label,
      data: rLabels.map(r => {
        let total = 0;
        (d.sellers || []).forEach(s => {
          if (!this.isSellerActive(s.name)) return;
          total += Number(s[r]) || 0;
        });
        return total;
      }),
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
      borderRadius: 4
    }));

    this.updateChartData('rType', rLabels, datasets);

  }


  // =========================================================
  // NOVO GRÁFICO: SPF GERAL
  // USA A PROPRIEDADE SPF (MAIÚSCULO) QUE É A QUANTIDADE DE SPF
  // =========================================================

  updateSpfGeralChart(data) {
    let comSpf = 0;
    let semSpf = 0;

    data.forEach(d => {
      if (d.active === false) return;

      (d.sellers || []).forEach(s => {
        if (!this.isSellerActive(s.name)) return;

        const spfCount = Number(s.SPF) || 0;
        const totalOperations = Number(s.operacoes) || 0;

        // SPF é contado por operação, não por vendedor.
        comSpf += spfCount;
        semSpf += Math.max(0, totalOperations - spfCount);
      });
    });

    console.log('SPF Geral:', {
      comSpf,
      semSpf,
      totalOperacoes: comSpf + semSpf
    });

    const chart = this.charts.get('spfGeral');
    if (!chart) return;

    chart.data.labels = ['Com SPF', 'Sem SPF'];
    chart.data.datasets = [{
      data: [comSpf, semSpf],
      backgroundColor: [this.spfColors.comSpf, this.spfColors.semSpf],
      borderColor: '#ffffff',
      borderWidth: 2
    }];

    chart.update();
  }

  // =========================================================
  // SPF POR VENDEDOR
  // =========================================================

  updateSpfVendedorChart(data) {
    const sellerMap = new Map();

    data.forEach(d => {
      if (d.active === false) return;

      (d.sellers || []).forEach(s => {
        if (!this.isSellerActive(s.name)) return;

        const nameKey = String(s.name || '')
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .trim();

        if (!nameKey) return;

        if (!sellerMap.has(nameKey)) {
          sellerMap.set(nameKey, {
            label: s.name,
            spfCount: 0,
            totalPropostas: 0
          });
        }

        const sellerData = sellerMap.get(nameKey);

        sellerData.spfCount += Number(s.SPF) || 0;
        sellerData.totalPropostas += Number(s.operacoes) || 0;
      });
    });

    const sellerEntries = Array.from(sellerMap.values())
      .sort((a, b) => {
        if (b.spfCount !== a.spfCount) {
          return b.spfCount - a.spfCount;
        }

        return a.label.localeCompare(b.label, 'pt-BR');
      });

    console.log('SPF por Vendedor:', sellerEntries);

    const chart = this.charts.get('spfVendedor');
    if (!chart) return;

    const currentType = this.chartTypes.spfVendedor;

    if (['pie', 'doughnut', 'polarArea'].includes(currentType)) {
      const filteredData = sellerEntries.filter(
        seller => seller.spfCount > 0
      );

      if (filteredData.length === 0) {
        chart.data.labels = ['Sem SPF'];
        chart.data.datasets = [{
          data: [1],
          backgroundColor: ['#e5e7eb'],
          borderColor: '#ffffff',
          borderWidth: 2
        }];

        chart.update();
        return;
      }

      chart.data.labels = filteredData.map(seller => seller.label);
      chart.data.datasets = [{
        data: filteredData.map(seller => seller.spfCount),
        backgroundColor: this.getDistinctColors(filteredData.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }];
    } else {
      chart.data.labels = sellerEntries.map(seller => seller.label);
      chart.data.datasets = [{
        label: 'Quantidade de SPF',
        data: sellerEntries.map(seller => seller.spfCount),
        backgroundColor: this.spfColors.comSpf,
        borderRadius: 4
      }];
    }

    chart.update();
  }

  // =========================================================
  // ATUALIZA DADOS DO GRÁFICO
  // =========================================================

  updateChartData(key, labels, datasets) {

    const chart = this.charts.get(key);

    if (!chart) return;

    const type = this.chartTypes[key];

    if (['pie', 'doughnut', 'polarArea'].includes(type)) {

      const source = datasets && datasets.length ? datasets[0] : null;

      if (!source) {
        chart.data.labels = labels || [];
        chart.data.datasets = [];
        chart.update();
        return;
      }

      const values = Array.isArray(source.data) ? source.data : [];

      chart.data.labels = labels || [];
      chart.data.datasets = [{
        ...source,
        data: [...values],
        backgroundColor: this.getDistinctColors(values.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }];

    } else {

      chart.data.labels = labels || [];
      chart.data.datasets = datasets || [];

    }

    chart.update();

  }


  // =========================================================
  // LIMPA TODOS OS GRÁFICOS
  // =========================================================

  clearCharts() {

    this.charts.forEach(chart => {
      chart.data.labels = [];
      chart.data.datasets = [];
      chart.update();
    });

  }

}