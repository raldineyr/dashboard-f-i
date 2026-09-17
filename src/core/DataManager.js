import {
  CSVParser
} from '../parsers/CSVParser.js';

import {
  ExcelParser
} from '../parsers/ExcelParser.js';

import {
  DataExtractor
} from '../parsers/DataExtractor.js';


export class DataManager {


  constructor(
    eventBus
  ) {

    this.eventBus =
      eventBus;

    this.datasets = [];
  }


  // ============================================================
  // CARREGAMENTO
  // ============================================================

  async loadFiles(
    files
  ) {

    const newData = [];


    for (
      const file of files
    ) {

      try {

        console.groupCollapsed(
          `[DataManager] PROCESSANDO: ${file.name}`
        );


        // ======================================================
        // PARSER
        // ======================================================

        const parser =
          this.getParser(
            file
          );


        const rows =
          await parser.parse(
            file
          );


        console.log(
          'Linhas recebidas pelo DataExtractor:',
          rows.length
        );


        // ======================================================
        // REMOVE SOMENTE O MESMO ARQUIVO
        // ======================================================

        this.datasets =
          this.datasets.filter(
            dataset =>
              dataset.sourceFile !==
              file.name
          );


        // ======================================================
        // EXTRAI
        // ======================================================

        const extracted =
          DataExtractor.extract(
            rows,
            file.name
          );


        if (
          !extracted.length
        ) {

          console.warn(
            `[DataManager] Nenhum dataset extraído de ${file.name}.`
          );


          console.groupEnd();


          alert(
            `Não foi possível identificar dados de operações no arquivo:\n${file.name}`
          );


          continue;
        }


        // ======================================================
        // CRIA IDENTIDADE ÚNICA
        // ======================================================

        const prepared =
          extracted.map(
            (
              dataset,
              sectionIndex
            ) => ({

              ...dataset,


              datasetId:
                [
                  dataset.storeKey ||
                    dataset.label ||
                    'LOJA',

                  dataset.periodKey ||
                    'SEM-PERIODO',

                  file.name,

                  sectionIndex

                ].join(
                  '::'
                ),


              sourceFile:
                file.name,


              kpis: {

                ...(dataset.kpis || {})

              },


              sellers:
                Array.isArray(
                  dataset.sellers
                )

                  ? dataset.sellers.map(
                      seller => ({
                        ...seller
                      })
                    )

                  : []

            })
          );


        // ======================================================
        // AUDITORIA DO ARQUIVO
        // ======================================================

        console.table(

          prepared.map(
            dataset => ({

              arquivo:
                dataset.sourceFile,

              datasetId:
                dataset.datasetId,

              loja:
                dataset.label,

              storeKey:
                dataset.storeKey,

              mes:
                dataset.monthLabel,

              periodo:
                dataset.periodKey,

              financiado:
                dataset.kpis?.financiado ??
                0,

              retornoSPF:
                dataset.kpis?.retorno ??
                0,

              retornoRentab:
                dataset.kpis?.retornoRentab ??
                0,

              spfAPagar:
                dataset.kpis?.spfPagar ??
                0,

              rentabilidadeTotal:
                dataset.kpis?.rentab ??
                0,

              operacoes:
                dataset.kpis?.operacoes ??
                0

            })
          )

        );


        newData.push(
          ...prepared
        );


        console.groupEnd();

      } catch (
        error
      ) {

        console.error(
          `[DataManager] Erro ao processar ${file.name}:`,
          error
        );


        console.groupEnd();


        alert(
          `Erro ao ler o arquivo ${file.name}.\n\n${
            error.message ||
            error
          }`
        );
      }
    }


    // ============================================================
    // ADICIONA NOVOS DATASETS
    // ============================================================

    if (
      newData.length
    ) {

      this.datasets.push(
        ...newData
      );
    }


    // ============================================================
    // SNAPSHOT FINAL
    // ============================================================

    console.groupCollapsed(
      '[DataManager] SNAPSHOT FINAL DOS DATASETS'
    );


    console.table(

      this.datasets.map(
        dataset => ({

          datasetId:
            dataset.datasetId,

          arquivo:
            dataset.sourceFile,

          loja:
            dataset.label,

          mes:
            dataset.monthLabel,

          periodo:
            dataset.periodKey,

          financiado:
            dataset.kpis?.financiado ??
            0,

          retornoSPF:
            dataset.kpis?.retorno ??
            0,

          retornoRentab:
            dataset.kpis?.retornoRentab ??
            0,

          rentabilidadeTotal:
            dataset.kpis?.rentab ??
            0,

          operacoes:
            dataset.kpis?.operacoes ??
            0

        })
      )

    );


    console.groupEnd();


    // ============================================================
    // ATUALIZA A APLICAÇÃO
    // ============================================================

    this.eventBus.emit(
      'data:updated',
      this.getAllData()
    );
  }


  // ============================================================
  // PARSER
  // ============================================================

  getParser(
    file
  ) {

    return /\.csv$/i.test(
      file.name
    )

      ? new CSVParser()

      : new ExcelParser();
  }


  // ============================================================
  // DADOS ATIVOS
  // ============================================================

  getActiveData() {

    return this.datasets.filter(
      dataset =>
        dataset.active !== false
    );
  }


  // ============================================================
  // TODOS OS DADOS
  // ============================================================

  getAllData() {

    return [
      ...this.datasets
    ];
  }


  // ============================================================
  // ATIVA/DESATIVA DATASET
  // ============================================================

  toggleDataset(
    index
  ) {

    if (
      index < 0 ||
      index >= this.datasets.length
    ) {

      return;
    }


    this.datasets[index].active =
      this.datasets[index].active ===
      false;


    this.eventBus.emit(
      'data:updated',
      this.getAllData()
    );
  }


  // ============================================================
  // REMOVE DATASET
  // ==============================================================

  removeDataset(
    index
  ) {

    if (
      index < 0 ||
      index >= this.datasets.length
    ) {

      return;
    }


    this.datasets.splice(
      index,
      1
    );


    this.eventBus.emit(
      'data:updated',
      this.getAllData()
    );
  }


  // ============================================================
  // ATIVA TODOS
  // ============================================================

  activateAll() {

    this.datasets.forEach(
      dataset => {

        dataset.active =
          true;
      }
    );


    this.eventBus.emit(
      'data:updated',
      this.getAllData()
    );
  }


  // ============================================================
  // DESATIVA TODOS
  // ============================================================

  deactivateAll() {

    this.datasets.forEach(
      dataset => {

        dataset.active =
          false;
      }
    );


    this.eventBus.emit(
      'data:updated',
      this.getAllData()
    );
  }


  // ============================================================
  // LIMPA TUDO
  // ============================================================

  clearAll() {

    this.datasets = [];


    this.eventBus.emit(
      'data:updated',
      []
    );
  }

}