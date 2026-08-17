export const CHART_TYPES = {
  VENDEDOR: [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Linhas' },
    { value: 'radar', label: 'Radar' },
    { value: 'polarArea', label: 'Área polar' },
    { value: 'doughnut', label: 'Rosca' }
  ],
  RETORNO_SPF: [
    { value: 'doughnut', label: 'Rosca' },
    { value: 'pie', label: 'Pizza' },
    { value: 'bar', label: 'Barras' },
    { value: 'polarArea', label: 'Área polar' },
    { value: 'line', label: 'Linhas' }
  ],
  BANCO: [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Linhas' },
    { value: 'radar', label: 'Radar' },
    { value: 'doughnut', label: 'Rosca' },
    { value: 'polarArea', label: 'Área polar' }
  ],
  R_TYPE: [
    { value: 'bar', label: 'Barras' },
    { value: 'line', label: 'Linhas' },
    { value: 'radar', label: 'Radar' },
    { value: 'doughnut', label: 'Rosca' },
    { value: 'polarArea', label: 'Área polar' }
  ]
};

export const CHART_COLORS = [
  '#2a6b9c', '#6f9bcb', '#4c8a64', '#b27b35', '#8a5aa8', 
  '#b94f5c', '#4b7287', '#e67e22', '#2ecc71', '#9b59b6'
];

export const R_CELL_COLORS = {
  R0: '#ff0000',
  R1: '#ffff00',
  R2: '#ffff00',
  R3: '#ffc000',
  R4: '#00c853',
  R5: '#00c853',
  R150: '#005b7a',
  R100: '#005b7a',
  R75: '#005b7a',
  R50: '#005b7a'
};

export const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 450 },
  plugins: {
    legend: { 
      position: 'bottom', 
      labels: { 
        boxWidth: 12, 
        padding: 12, 
        font: { size: 10 } 
      } 
    },
    tooltip: { 
      mode: 'index', 
      intersect: false 
    }
  }
};
