export class Footer {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  render(container) {
    container.innerHTML = `
      <footer class="dashboard-footer">
        <span>© 2026 </span>
        <a
          href="https://www.linkedin.com/in/raldineyr/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn de Raldiney Ribeiro"
        >Raldiney Ribeiro</a>
        <span>. Todos os direitos reservados.</span>
      </footer>
    `;
  }
}
