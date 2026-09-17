# 📊 Dashboard Acompanhamento F&I

**Dashboard Acompanhamento F&I** é uma aplicação web para análise, acompanhamento e comparação de indicadores de **F&I — Financiamento & Seguros**.

O sistema foi desenvolvido para facilitar a análise de desempenho de **lojas, vendedores, meses, bancos, operações e indicadores financeiros**, permitindo importar dados de arquivos CSV e Excel e transformá-los em informações visuais, comparativos e indicadores de gestão.

**Desenvolvido por Raldiney Ribeiro.**

---

## 🚀 Visão geral

O Dashboard Acompanhamento F&I permite transformar arquivos operacionais em uma visão centralizada de desempenho.

A aplicação foi projetada para trabalhar com:

* múltiplas lojas;
* múltiplas marcas;
* múltiplos vendedores;
* múltiplos meses;
* múltiplos arquivos;
* diferentes bancos;
* diferentes tipos de operação;
* comparações entre períodos;
* comparações entre lojas;
* filtros dinâmicos;
* indicadores financeiros;
* gráficos interativos;
* tabelas detalhadas.

O sistema também permite carregar um único arquivo contendo dados de várias lojas e realizar a separação e análise dessas lojas individualmente.

---

# ✨ Principais funcionalidades

## 📁 Importação de dados

O dashboard permite importar dados diretamente através da interface.

### Formatos suportados

* CSV
* Excel (`.xlsx`)
* Excel (`.xls`)

É possível carregar:

* um único arquivo;
* vários arquivos simultaneamente;
* arquivos de meses diferentes;
* arquivos contendo diferentes lojas;
* arquivos contendo diferentes marcas.

Os dados carregados são processados automaticamente pela aplicação.

---

# 🏢 Gestão e identificação de lojas

O sistema identifica as lojas individualmente e mantém sua identidade através da combinação de marca e nome da loja.

Isso permite trabalhar, por exemplo, com:

* Terracota Feira de Santana
* Terracota Vitória da Conquista
* BY Feira de Santana
* MG
* outras lojas presentes nos arquivos carregados.

Mesmo quando duas ou mais lojas aparecem dentro do mesmo arquivo CSV, o sistema consegue tratá-las separadamente.

## 🎨 Identidade visual das lojas

Cada loja pode receber uma cor específica para facilitar sua identificação no dashboard.

O sistema possui cores fixas para determinadas lojas e também possui geração determinística de cores para lojas que não estejam previamente configuradas.

Isso evita que a mesma loja receba uma cor diferente de forma aleatória durante diferentes carregamentos.

---

# 🗓️ Controle de meses

O sistema identifica automaticamente os meses presentes nos dados.

Meses suportados:

* Janeiro
* Fevereiro
* Março
* Abril
* Maio
* Junho
* Julho
* Agosto
* Setembro
* Outubro
* Novembro
* Dezembro

Os meses são convertidos para uma ordem cronológica, permitindo:

* ordenação correta;
* comparação mensal;
* identificação do mês;
* análise de evolução;
* comparação entre períodos.

---

# 📊 KPIs

O dashboard apresenta indicadores principais de desempenho.

Atualmente são utilizados indicadores como:

### Total financiado

Valor total financiado considerando os dados ativos.

### Retorno total

Valor total de retorno gerado pelas operações.

### SPF a pagar

Valor relacionado ao SPF a pagar.

### Rentabilidade

Valor de rentabilidade/bruta calculado a partir dos dados disponíveis.

### Operações

Quantidade de operações/vendas ativas.

### Lojas

Quantidade de lojas ativas consideradas na análise.

Os KPIs são atualizados dinamicamente conforme:

* novos arquivos são carregados;
* dados são removidos;
* vendedores são filtrados;
* lojas são ativadas ou desativadas.

---

# 👥 Vendedores

O sistema possui gerenciamento e filtragem de vendedores.

É possível:

* identificar vendedores;
* visualizar vendedores ativos;
* filtrar vendedores;
* ativar ou desativar vendedores;
* atualizar tabelas automaticamente;
* atualizar gráficos de acordo com o filtro.

Quando um filtro de vendedor é aplicado, os componentes que dependem desses dados são atualizados de forma dinâmica.

---

# 📋 Tabela de vendedores

O dashboard possui uma tabela detalhada de desempenho por vendedor.

A tabela apresenta:

| Coluna       |
| ------------ |
| Vendedor     |
| Loja         |
| Mês          |
| R0           |
| R1           |
| R2           |
| R3           |
| R4           |
| R5           |
| R150         |
| R100         |
| R75          |
| R50          |
| SPF          |
| Receita (R$) |

A tabela permite analisar individualmente o desempenho dos vendedores em cada loja e período.

---

# 🔽 Ordenação da tabela

A tabela possui ordenação dinâmica.

É possível ordenar por:

* R0
* R1
* R2
* R3
* R4
* R5
* R150
* R100
* R75
* R50
* SPF
* Receita
* Vendedor
* Mês

A ordenação pode ser:

* maior → menor;
* menor → maior;
* A → Z;
* Z → A;
* mais antigo → mais recente;
* mais recente → mais antigo.

---

# 📈 Gráficos

O dashboard utiliza **Chart.js** para apresentar gráficos interativos.

Atualmente existem quatro áreas principais.

## 👤 Rentabilidade por Vendedor

Apresenta a receita/rentabilidade associada aos vendedores.

Permite visualizar diferenças de desempenho entre vendedores e períodos.

---

## 💰 Retorno vs SPF

Apresenta uma comparação entre:

* Retorno;
* SPF a pagar.

Essa visualização facilita a análise da relação entre os dois indicadores.

---

## 🏦 Financiado por Banco

Apresenta os valores financiados agrupados por banco.

Isso permite identificar a participação e distribuição dos financiamentos entre as instituições presentes nos dados.

---

## 🏷️ Comissão por Tipo R

Apresenta os valores associados aos diferentes tipos de R:

* R0
* R1
* R2
* R3
* R4
* R5
* R150
* R100
* R75
* R50

---

# 🔄 Tipos de visualização

Os gráficos possuem suporte para diferentes formas de visualização, de acordo com a configuração disponível.

Entre elas:

* Barras;
* Linhas;
* Radar;
* Pizza;
* Rosca/Doughnut;
* Área Polar.

O usuário pode alternar a visualização através dos controles disponíveis em cada gráfico.

---

# 🏪 Comparativo mensal por loja

O sistema possui uma área dedicada à comparação de desempenho.

O modo padrão permite analisar a evolução da **mesma loja em meses diferentes**.

Por exemplo:

```text
Terracota Feira de Santana

Janeiro
Fevereiro
Março
Abril
```

A aplicação organiza os meses cronologicamente e apresenta os indicadores para comparação.

---

# 🔀 Comparação entre lojas diferentes

Além da comparação tradicional entre meses, o sistema também permite comparar lojas diferentes.

Essa funcionalidade não fica limitada à mesma marca.

É possível realizar comparações como:

```text
Terracota Feira de Santana
        ×
Terracota Vitória da Conquista
```

ou:

```text
BY
        ×
Terracota
```

ou ainda:

```text
Terracota
        ×
MG
```

Portanto, lojas de marcas diferentes também podem ser comparadas.

Essa funcionalidade permite uma análise mais ampla de desempenho entre operações, lojas e marcas.

---

# 📊 Indicadores do comparativo

O comparativo utiliza indicadores como:

* Financiado;
* Retorno;
* SPF a pagar;
* Rentabilidade;
* Operações.

Além dos valores absolutos, o sistema calcula a variação percentual entre períodos quando aplicável.

Exemplo:

```text
Janeiro      R$ 100.000,00
Fevereiro    R$ 120.000,00
             +20,0%
```

Isso permite identificar rapidamente crescimento, redução ou estabilidade.

---

# 📉 Análise de evolução

O comparativo mensal permite analisar:

* evolução de faturamento;
* evolução do financiamento;
* evolução do retorno;
* evolução do SPF;
* evolução da rentabilidade;
* evolução da quantidade de operações.

Essa estrutura permite utilizar o dashboard não apenas como ferramenta de consulta, mas também como ferramenta de acompanhamento de desempenho.

---

# 🧹 Limpeza dos dados

A aplicação possui uma função de limpeza dos dados carregados.

O botão **Limpar** permite remover os dados atuais e retornar a aplicação ao estado inicial.

Os componentes são atualizados automaticamente após a limpeza.

---

# ⚡ Atualização dinâmica

O projeto utiliza uma arquitetura baseada em eventos através do `EventBus`.

Isso permite que diferentes partes da aplicação sejam atualizadas automaticamente.

Exemplo de fluxo:

```text
Upload de arquivo
       ↓
Processamento dos dados
       ↓
EventBus
       ↓
┌───────────────┬───────────────┬───────────────┐
│               │               │               │
KPIs          Gráficos        Tabela       Comparativo
│               │               │               │
└───────────────┴───────────────┴───────────────┘
```

Isso reduz a necessidade de recarregar a página e mantém os componentes sincronizados.

---

# 📱 Interface responsiva

A interface foi estruturada para diferentes tamanhos de tela.

O sistema possui estilos específicos para:

* Desktop;
* Notebook;
* Tablet;
* Smartphone;
* telas menores.

Os componentes possuem comportamento adaptativo para preservar a usabilidade em diferentes resoluções.

---

# 🎨 Arquitetura visual

Os estilos são organizados por responsabilidade.

```text
src/assets/styles/

├── main.css
│
├── components/
│   ├── header.css
│   ├── kpi-cards.css
│   ├── charts.css
│   ├── tables.css
│   ├── seller-filter.css
│   ├── file-tags.css
│   ├── comparison.css
│   └── buttons.css
│
└── base/
    ├── reset.css
    ├── variables.css
    └── utilities.css
```

Essa organização facilita a manutenção e evolução da interface.

---

# 🧩 Arquitetura do projeto

O projeto utiliza uma arquitetura modular baseada em componentes.

```text
src/
│
├── main.js
├── app.js
│
├── assets/
│   └── styles/
│
├── components/
│   ├── Header.js
│   ├── FileBar.js
│   ├── StoreLegend.js
│   ├── SellerFilter.js
│   ├── KPICards.js
│   ├── ComparisonSection.js
│   ├── SellerTable.js
│   ├── Footer.js
│   │
│   └── Charts/
│       ├── ChartManager.js
│       ├── SellerChart.js
│       ├── ReturnSPFChart.js
│       ├── BankChart.js
│       └── RTypeChart.js
│
├── core/
│   ├── DataManager.js
│   ├── StoreManager.js
│   ├── SellerManager.js
│   └── EventBus.js
│
├── parsers/
│   ├── CSVParser.js
│   ├── ExcelParser.js
│   └── DataExtractor.js
│
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   ├── constants.js
│   ├── colors.js
│   └── dom-helpers.js
│
└── config/
    ├── chart.config.js
    ├── store.config.js
    └── month.config.js
```

---

# 🛠️ Tecnologias utilizadas

O projeto utiliza tecnologias web modernas.

Principais tecnologias:

* HTML5
* CSS3
* JavaScript
* Vite
* Chart.js
* CSV
* Excel
* Node.js
* npm
* Git
* GitHub

---

# 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de possuir:

* **Node.js 16 ou superior**
* **npm** ou **Yarn**
* Git

Para verificar a versão do Node.js:

```bash
node --version
```

Para verificar o npm:

```bash
npm --version
```

---

# 🔧 Instalação

Clone o repositório:

```bash
git clone [URL-DO-REPOSITORIO]
```

Entre no diretório:

```bash
cd dashboard-f-i
```

Instale as dependências:

```bash
npm install
```

---

# ▶️ Executando em desenvolvimento

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local disponível para acesso.

Normalmente:

```text
http://localhost:5173
```

---

# 🏗️ Build de produção

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos de produção serão gerados no diretório configurado pelo Vite.

---

# 🔍 Preview da versão de produção

Depois de realizar o build, é possível testar a versão de produção localmente:

```bash
npm run preview
```

---

# 🌐 Deploy

O projeto pode ser utilizado em servidores web estáticos compatíveis com aplicações Vite.

Entre os ambientes possíveis estão:

* GitHub Pages;
* Vercel;
* servidores web estáticos;
* outras plataformas compatíveis com aplicações frontend.

Antes de publicar, recomenda-se executar:

```bash
npm run build
```

e verificar se não existem erros no console.

---

# 🔄 Controle de versão

O projeto utiliza Git para controle de versão.

Para verificar alterações:

```bash
git status
```

Adicionar alterações:

```bash
git add .
```

Criar um commit:

```bash
git commit -m "feat: improve monthly store comparison and KPI layout"
```

Enviar para o GitHub:

```bash
git push origin main
```

---

# 📁 Estrutura geral

A estrutura principal do projeto é:

```text
dashboard-f-i/
│
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── main.js
│   ├── app.js
│   │
│   ├── assets/
│   │   └── styles/
│   │
│   ├── components/
│   │
│   ├── core/
│   │
│   ├── parsers/
│   │
│   ├── utils/
│   │
│   └── config/
│
└── tests/
    ├── parsers/
    ├── utils/
    └── components/
```

---

# 🧪 Testes

O projeto possui uma estrutura preparada para testes:

```text
tests/
├── parsers/
├── utils/
└── components/
```

Essa estrutura permite adicionar testes específicos para:

* processamento de CSV;
* processamento de Excel;
* formatação;
* validações;
* componentes;
* regras de negócio.

---

# 🔐 Tratamento dos dados

O dashboard foi estruturado para processar os dados no frontend.

Os arquivos carregados pelo usuário são utilizados pela aplicação para gerar os indicadores e visualizações disponíveis.

O sistema trabalha com:

* validação;
* normalização;
* identificação de lojas;
* identificação de vendedores;
* identificação de meses;
* agrupamentos;
* cálculos;
* formatação dos valores.

---

# 📌 Resumo das funcionalidades

| Funcionalidade                 | Status |
| ------------------------------ | ------ |
| Upload CSV                     | ✅      |
| Upload Excel                   | ✅      |
| Múltiplos arquivos             | ✅      |
| Múltiplas lojas                | ✅      |
| Múltiplas marcas               | ✅      |
| Múltiplos meses                | ✅      |
| KPIs                           | ✅      |
| Filtro de vendedores           | ✅      |
| Ativar/desativar vendedores    | ✅      |
| Tabela de vendedores           | ✅      |
| Ordenação da tabela            | ✅      |
| Rentabilidade por vendedor     | ✅      |
| Retorno vs SPF                 | ✅      |
| Financiado por banco           | ✅      |
| Comissão por tipo R            | ✅      |
| Gráficos interativos           | ✅      |
| Diferentes tipos de gráficos   | ✅      |
| Comparativo mensal             | ✅      |
| Comparação entre lojas         | ✅      |
| Comparação entre marcas        | ✅      |
| Variação percentual            | ✅      |
| Identificação visual das lojas | ✅      |
| Limpeza dos dados              | ✅      |
| Interface responsiva           | ✅      |
| Arquitetura modular            | ✅      |
| Git/GitHub                     | ✅      |
| Build de produção              | ✅      |

---

# 🚀 Possíveis evoluções futuras

A arquitetura atual permite evoluir o dashboard para funcionalidades ainda mais avançadas, como:

* Ranking de vendedores;
* Ranking de lojas;
* Metas por vendedor;
* Metas por loja;
* Comparativo anual;
* Comparativo entre períodos personalizados;
* Exportação de relatórios;
* Exportação para Excel;
* Exportação para PDF;
* Dashboard específico por loja;
* Dashboard específico por vendedor;
* Indicadores de conversão;
* Indicadores de produtividade;
* Histórico de desempenho;
* filtros avançados;
* análise de tendências;
* indicadores de atingimento de metas;
* relatórios gerenciais;
* painel executivo;
* permissões de usuários;
* integração com APIs;
* armazenamento persistente de dados.

---

# 👨‍💻 Autor

**Raldiney Ribeiro**

Dashboard desenvolvido para acompanhamento e análise de indicadores de **F&I — Financiamento & Seguros**.

---

# 📄 Licença

Este projeto é de uso definido pelo proprietário do repositório.

Consulte o responsável pelo projeto antes de redistribuir, modificar ou utilizar o código em outros ambientes.

---

## 📊 Dashboard Acompanhamento F&I

**Transformando dados operacionais em informação para tomada de decisão.**
