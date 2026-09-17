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


export const R_CHART_COLORS = {
  R0: '#DC2626',
  R1: '#FDE047',
  R2: '#FACC15',
  R3: '#F97316',
  R4: '#22C55E',
  R5: '#16A34A',
  R50: '#60A5FA',
  R75: '#3B82F6',
  R100: '#2563EB',
  R150: '#1D4ED8'
};

export const BANK_CHART_COLORS = {
  SANTANDER: '#DC2626',
  'BANCO SANTANDER': '#DC2626',
  VOLKSWAGEN: '#60A5FA',
  'BANCO VOLKSWAGEN': '#60A5FA',
  'VOLKSWAGEN BANK': '#60A5FA',
  STELLANTIS: '#1E3A8A',
  'BANCO STELLANTIS': '#1E3A8A',
  'STELLANTIS FINANCIAL SERVICES': '#1E3A8A',
  'C6 BANK': '#111111',
  C6: '#111111',
  ITAU: '#F97316',
  'ITAU UNIBANCO': '#F97316',
  SAFRA: '#2563EB',
  'BANCO SAFRA': '#2563EB',
  BRADESCO: '#B91C1C',
  BV: '#0EA5E9',
  'BANCO BV': '#0284C7'
};



// Cor fixa por mês para identificação visual consistente entre os gráficos.
export const MONTH_CHART_COLORS = {
  JANEIRO: '#2563EB',
  FEVEREIRO: '#16A34A',
  MARCO: '#F59E0B',
  ABRIL: '#7C3AED',
  MAIO: '#0891B2',
  JUNHO: '#EA580C',
  JULHO: '#DB2777',
  AGOSTO: '#65A30D',
  SETEMBRO: '#DC2626',
  OUTUBRO: '#0F766E',
  NOVEMBRO: '#9333EA',
  DEZEMBRO: '#B45309'
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
