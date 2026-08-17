import csvIcon from '../assets/images/csv.png';
import excelIcon from '../assets/images/excel.png';
import clearIcon from '../assets/images/clear.png';

export class Header {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  render(container) {
    if (!container) {
      console.error('Header: container não encontrado');
      return;
    }

    container.innerHTML = `
      <style>
        /* =====================================================
           HEADER — TECHNO / PROFESSIONAL
        ===================================================== */

        .app-header {
          width: 100%;
          position: relative;
          overflow: hidden;
          box-sizing: border-box;

          background:
            linear-gradient(
              135deg,
              #07111f 0%,
              #0b1728 50%,
              #10213a 100%
            );

          border: 1px solid rgba(74, 144, 226, 0.22);
          border-radius: 16px;

          box-shadow:
            0 12px 35px rgba(0, 0, 0, 0.20),
            inset 0 1px 0 rgba(255, 255, 255, 0.035);

          margin-bottom: 0;
        }


        /* =====================================================
           EFEITO TECNOLÓGICO
        ===================================================== */

        .app-header::before {
          content: "";

          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              transparent 0%,
              rgba(59, 130, 246, 0.035) 50%,
              transparent 100%
            );
        }


        .app-header::after {
          content: "";

          position: absolute;

          left: 4%;
          right: 4%;
          bottom: 0;

          height: 1px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(59, 130, 246, 0.55),
              transparent
            );

          pointer-events: none;
        }


        /* =====================================================
           LINHA PRINCIPAL
        ===================================================== */

        .header-main {
          position: relative;
          z-index: 2;

          width: 100%;

          min-height: 86px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          padding: 14px 18px;

          box-sizing: border-box;
        }


        /* =====================================================
           IDENTIDADE
        ===================================================== */

        .header-brand {
          display: flex;

          align-items: center;

          gap: 12px;

          min-width: 0;

          flex: 1 1 auto;
        }


        .header-brand-mark {
          width: 46px;
          height: 46px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              rgba(37, 99, 235, 0.25),
              rgba(14, 165, 233, 0.08)
            );

          border: 1px solid rgba(96, 165, 250, 0.32);

          box-shadow:
            inset 0 0 18px rgba(59, 130, 246, 0.08),
            0 0 20px rgba(37, 99, 235, 0.08);
        }


        .brand-mark-inner {
          width: 32px;
          height: 32px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          color: #ffffff;

          font-size: 14px;

          box-shadow:
            0 5px 16px rgba(37, 99, 235, 0.35);
        }


        /* =====================================================
           TEXTOS
        ===================================================== */

        .header-brand-content {
          min-width: 0;

          display: flex;

          flex-direction: column;

          justify-content: center;
        }


        .header-brand-title {
          color: #f8fafc;

          font-size: 1.05rem;

          line-height: 1.15;

          font-weight: 800;

          letter-spacing: 0.08em;

          white-space: nowrap;

          overflow: hidden;

          text-overflow: ellipsis;
        }


        .header-brand-subtitle {
          margin-top: 5px;

          color: #7f9ab8;

          font-size: 0.57rem;

          line-height: 1;

          font-weight: 700;

          letter-spacing: 0.14em;

          white-space: nowrap;
        }


        /* =====================================================
           ÁREA DIREITA
        ===================================================== */

        .header-right {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 7px;

          flex-shrink: 0;
        }


        /* =====================================================
           BOTÕES
        ===================================================== */

        .header-action {
          min-height: 44px;

          display: inline-flex;

          align-items: center;

          gap: 9px;

          padding: 6px 10px;

          border-radius: 10px;

          box-sizing: border-box;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;

          text-decoration: none;

          font-family: inherit;

          user-select: none;
        }


        .header-action:hover {
          transform: translateY(-1px);
        }


        /* =====================================================
           QUADRADO DO ÍCONE
        ===================================================== */

        .header-action-icon {
          width: 28px;
          height: 28px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 7px;

          flex-shrink: 0;

          overflow: hidden;
        }


        /*
         * IMAGENS DOS ARQUIVOS
         *
         * As imagens ficam pequenas e centralizadas
         * dentro do quadrado existente.
         */

        .header-action-icon img {
          width: 30px;
          height: 30px;

          max-width: 30px;
          max-height: 30px;

          object-fit: contain;

          display: block;

          margin: auto;
        }


        /* =====================================================
           TEXTO DOS BOTÕES
        ===================================================== */

        .header-action-content {
          display: flex;

          flex-direction: column;

          align-items: flex-start;

          justify-content: center;

          min-width: 0;
        }


        .header-action-title {
          font-size: 0.62rem;

          line-height: 1;

          font-weight: 800;

          letter-spacing: 0.055em;

          white-space: nowrap;
        }


        .header-action-subtitle {
          margin-top: 4px;

          font-size: 0.49rem;

          line-height: 1;

          font-weight: 600;

          letter-spacing: 0.07em;

          opacity: 0.62;

          white-space: nowrap;
        }


        /* =====================================================
           IMPORTAR
        ===================================================== */

        .header-action-import {
          color: #dbeafe;

          background:
            linear-gradient(
              135deg,
              rgba(37, 99, 235, 0.15),
              rgba(37, 99, 235, 0.07)
            );

          border: 1px solid rgba(59, 130, 246, 0.30);
        }


        .header-action-import .header-action-icon {
          background:
            rgba(37, 99, 235, 0.20);
        }


        .header-action-import:hover {
          background:
            linear-gradient(
              135deg,
              rgba(37, 99, 235, 0.23),
              rgba(37, 99, 235, 0.11)
            );

          border-color:
            rgba(96, 165, 250, 0.55);

          box-shadow:
            0 0 18px rgba(37, 99, 235, 0.12);
        }


        /* =====================================================
           LIMPAR
        ===================================================== */

        .header-action-clear {
          color: #cbd5e1;

          background:
            rgba(148, 163, 184, 0.055);

          border:
            1px solid rgba(148, 163, 184, 0.20);
        }


        .header-action-clear .header-action-icon {
          background:
            rgba(148, 163, 184, 0.10);
        }


        .header-action-clear:hover {
          color: #f1f5f9;

          background:
            rgba(239, 68, 68, 0.10);

          border-color:
            rgba(248, 113, 113, 0.35);

          box-shadow:
            0 0 18px rgba(239, 68, 68, 0.08);
        }


        /* =====================================================
           SISTEMA ONLINE
        ===================================================== */

        .header-status {
          display: flex;

          align-items: center;

          gap: 7px;

          min-height: 44px;

          padding:
            0 10px;

          border-radius: 10px;

          background:
            rgba(15, 23, 42, 0.48);

          border:
            1px solid rgba(71, 85, 105, 0.38);

          white-space: nowrap;

          flex-shrink: 0;
        }


        .header-status-indicator {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: #22c55e;

          box-shadow:
            0 0 8px rgba(34, 197, 94, 0.85);

          animation:
            headerPulse 2s ease-in-out infinite;
        }


        .header-status-text {
          color: #9fb4ca;

          font-size: 0.56rem;

          font-weight: 700;

          letter-spacing: 0.08em;
        }


        @keyframes headerPulse {

          0%,
          100% {
            opacity: 1;

            box-shadow:
              0 0 8px rgba(34, 197, 94, 0.85);
          }

          50% {
            opacity: 0.55;

            box-shadow:
              0 0 4px rgba(34, 197, 94, 0.45);
          }

        }


        /* =====================================================
           LINHA INFERIOR
        ===================================================== */

        .header-bottom-line {
          position: relative;

          z-index: 2;

          width: 100%;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 10px;

          padding:
            0 18px
            7px;

          box-sizing: border-box;
        }


        .header-system-line {
          height: 1px;

          flex: 1;

          max-width: 180px;

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(71, 120, 170, 0.28)
            );
        }


        .header-system-line:last-child {
          background:
            linear-gradient(
              90deg,
              rgba(71, 120, 170, 0.28),
              transparent
            );
        }


        .header-system-label {
          display: flex;

          align-items: center;

          gap: 6px;

          color: #4f6b89;

          font-size: 0.46rem;

          font-weight: 700;

          letter-spacing: 0.15em;

          white-space: nowrap;
        }


        .header-system-label i {
          font-size: 0.42rem;

          color: #3b82f6;
        }


        /* =====================================================
           RESPONSIVO
        ===================================================== */

        @media (max-width: 1050px) {

          .header-brand-subtitle {
            display: none;
          }

          .header-brand-title {
            font-size: 0.95rem;
          }

        }


        @media (max-width: 850px) {

          .header-main {
            flex-wrap: wrap;
          }

          .header-brand {
            flex: 1 1 100%;
          }

          .header-right {
            width: 100%;

            justify-content: flex-end;
          }

        }


        @media (max-width: 650px) {

          .header-main {
            padding: 13px;
          }

          .header-right {
            display: grid;

            grid-template-columns:
              repeat(2, minmax(0, 1fr));

            gap: 7px;
          }

          .header-action {
            width: 100%;

            justify-content: center;
          }

          .header-status {
            justify-content: center;
          }

          .header-bottom-line {
            padding:
              0 13px
              7px;
          }

        }


        @media (max-width: 430px) {

          .header-brand-title {
            font-size: 0.82rem;
          }

          .header-brand-mark {
            width: 40px;
            height: 40px;
          }

          .brand-mark-inner {
            width: 28px;
            height: 28px;
          }

          .header-action-subtitle {
            display: none;
          }

          .header-action {
            min-height: 40px;
          }

          .header-status-text {
            font-size: 0.50rem;
          }

        }
      </style>


      <header class="app-header">

        <!-- =================================================
             LINHA PRINCIPAL
        ================================================== -->

        <div class="header-main">


          <!-- ===============================================
               IDENTIDADE
          ================================================ -->

          <div class="header-brand">

            <div class="header-brand-mark">

              <div class="brand-mark-inner">
                <i class="fas fa-layer-group"></i>
              </div>

            </div>


            <div class="header-brand-content">

              <div class="header-brand-title">
                F&I ANALYTICS
              </div>

              <div class="header-brand-subtitle">
                PERFORMANCE • FINANCE &amp; INSURANCE
              </div>

            </div>

          </div>


          <!-- ===============================================
               AÇÕES + STATUS
               
               CSV → EXCEL → LIMPAR → SISTEMA ONLINE
          ================================================ -->

          <div class="header-right">


            <!-- =================================================
                 CSV
            ================================================== -->

            <div class="upload-btn-wrapper">

              <button
                class="header-action header-action-import"
                id="csvUploadBtn"
                type="button"
              >

                <span class="header-action-icon">

                  <img
                    src="${csvIcon}"
                    alt="CSV"
                  >

                </span>


                <span class="header-action-content">

                  <span class="header-action-title">
                    IMPORTAR CSV
                  </span>

                  <span class="header-action-subtitle">
                    CARREGAR DADOS
                  </span>

                </span>

              </button>


              <input
                type="file"
                id="csvUpload"
                accept=".csv"
                multiple
                hidden
              >

            </div>


            <!-- =================================================
                 EXCEL
            ================================================== -->

            <div class="upload-btn-wrapper">

              <button
                class="header-action header-action-import"
                id="excelUploadBtn"
                type="button"
              >

                <span class="header-action-icon">

                  <img
                    src="${excelIcon}"
                    alt="Excel"
                  >

                </span>


                <span class="header-action-content">

                  <span class="header-action-title">
                    IMPORTAR EXCEL
                  </span>

                  <span class="header-action-subtitle">
                    XLS / XLSX
                  </span>

                </span>

              </button>


              <input
                type="file"
                id="excelUpload"
                accept=".xlsx,.xls"
                multiple
                hidden
              >

            </div>


            <!-- =================================================
                 LIMPAR
            ================================================== -->

            <button
              class="header-action header-action-clear"
              id="clearAllBtn"
              type="button"
            >

              <span class="header-action-icon">

                <img
                  src="${clearIcon}"
                  alt="Limpar"
                >

              </span>


              <span class="header-action-content">

                <span class="header-action-title">
                  LIMPAR
                </span>

                <span class="header-action-subtitle">
                  RESETAR DADOS
                </span>

              </span>

            </button>


            <!-- =================================================
                 STATUS
            ================================================== -->

            <div class="header-status">

              <span class="header-status-indicator"></span>

              <span class="header-status-text">
                SISTEMA ONLINE
              </span>

            </div>


          </div>

        </div>


        <!-- =================================================
             LINHA INFERIOR
        ================================================== -->

        <div class="header-bottom-line">

          <span class="header-system-line"></span>

          <span class="header-system-label">

            <i class="fas fa-circle"></i>

            F&amp;I PERFORMANCE MONITORING SYSTEM BY RALDINEY RIBEIRO

          </span>

          <span class="header-system-line"></span>

        </div>

      </header>
    `;

    this.setupEventListeners();
  }


  setupEventListeners() {

    const csvUpload =
      document.getElementById('csvUpload');

    const csvUploadBtn =
      document.getElementById('csvUploadBtn');

    const excelUpload =
      document.getElementById('excelUpload');

    const excelUploadBtn =
      document.getElementById('excelUploadBtn');

    const clearAllBtn =
      document.getElementById('clearAllBtn');


    /* =====================================================
       CSV
    ===================================================== */

    if (csvUpload && csvUploadBtn) {

      csvUploadBtn.addEventListener(
        'click',
        () => {

          csvUpload.click();

        }
      );


      csvUpload.addEventListener(
        'change',
        (e) => {

          if (e.target.files.length) {

            this.eventBus.emit(
              'file:uploaded',
              Array.from(e.target.files)
            );

            e.target.value = '';

          }

        }
      );

    }


    /* =====================================================
       EXCEL
    ===================================================== */

    if (excelUpload && excelUploadBtn) {

      excelUploadBtn.addEventListener(
        'click',
        () => {

          excelUpload.click();

        }
      );


      excelUpload.addEventListener(
        'change',
        (e) => {

          if (e.target.files.length) {

            this.eventBus.emit(
              'file:uploaded',
              Array.from(e.target.files)
            );

            e.target.value = '';

          }

        }
      );

    }


    /* =====================================================
       LIMPAR
    ===================================================== */

    if (clearAllBtn) {

      clearAllBtn.addEventListener(
        'click',
        () => {

          if (
            confirm(
              'Remover todos os arquivos carregados?'
            )
          ) {

            this.eventBus.emit(
              'data:cleared'
            );

          }

        }
      );

    }

  }
}