import { App } from './app.js';
import './assets/styles/main.css';
// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});