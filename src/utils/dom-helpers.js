export class DOMHelper {
  static createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.assign(element.dataset, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      if (typeof content === 'string') {
        element.innerHTML = content;
      } else if (content instanceof Node) {
        element.appendChild(content);
      }
    }

    return element;
  }

  static createFragment(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  }

  static findAncestor(element, selector) {
    while (element) {
      if (element.matches?.(selector)) {
        return element;
      }
      element = element.parentElement;
    }
    return null;
  }

  static delegateEvent(parent, eventType, selector, handler) {
    parent.addEventListener(eventType, (e) => {
      const target = e.target.closest(selector);
      if (target && parent.contains(target)) {
        handler.call(target, e);
      }
    });
  }

  static toggleClass(element, className) {
    if (element) {
      element.classList.toggle(className);
    }
  }

  static show(element) {
    if (element) {
      element.style.display = '';
      element.style.visibility = 'visible';
    }
  }

  static hide(element) {
    if (element) {
      element.style.display = 'none';
    }
  }

  static isVisible(element) {
    return element && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0 &&
           window.getComputedStyle(element).visibility !== 'hidden' &&
           window.getComputedStyle(element).display !== 'none';
  }

  static scrollTo(element, options = {}) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        ...options
      });
    }
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static getDataSetValue(element, key, defaultValue = null) {
    return element?.dataset?.[key] || defaultValue;
  }

  static setLoading(element, isLoading, loadingText = 'Carregando...') {
    if (!element) return;
    
    if (isLoading) {
      element.dataset.originalHtml = element.innerHTML;
      element.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <i class="fas fa-spinner fa-spin"></i> ${loadingText}
        </div>
      `;
    } else if (element.dataset.originalHtml) {
      element.innerHTML = element.dataset.originalHtml;
      delete element.dataset.originalHtml;
    }
  }
}
