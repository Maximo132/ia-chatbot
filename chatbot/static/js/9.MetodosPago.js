// Función para copiar texto al portapapeles
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    
    // Cambiar el ícono a check
    const icon = button.querySelector('i');
    const originalIcon = icon.className;
    
    // Mostrar feedback visual
    button.classList.add('copied');
    icon.className = 'fas fa-check';
    
    // Restaurar después de 2 segundos
    setTimeout(() => {
      button.classList.remove('copied');
      icon.className = originalIcon;
    }, 2000);
    
    return true;
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    return false;
  }
}

// Función para alternar la visibilidad de un método de pago
function toggleMetodo(metodo) {
  const isExpanded = metodo.getAttribute('aria-expanded') === 'true';
  const targetId = metodo.getAttribute('data-target');
  if (!targetId) return;
  
  const detalles = document.getElementById(targetId);
  if (!detalles) return;
  
  // Si ya está expandido, contraerlo
  if (isExpanded) {
    metodo.setAttribute('aria-expanded', 'false');
    detalles.style.maxHeight = `${detalles.scrollHeight}px`;
    
    // Forzar repintado
    void detalles.offsetHeight;
    
    // Iniciar animación de colapso
    detalles.style.maxHeight = '0';
    detalles.style.opacity = '0';
    
    // Manejar el final de la transición
    const onTransitionEnd = () => {
      detalles.removeEventListener('transitionend', onTransitionEnd);
      if (metodo.getAttribute('aria-expanded') === 'false') {
        detalles.style.visibility = 'hidden';
      }
    };
    
    detalles.addEventListener('transitionend', onTransitionEnd, { once: true });
    return;
  }
  
  // Cerrar otros métodos abiertos
  document.querySelectorAll('.payment-method[aria-expanded="true"]').forEach(otroMetodo => {
    if (otroMetodo !== metodo) {
      const otroTargetId = otroMetodo.getAttribute('data-target');
      const otrosDetalles = document.getElementById(otroTargetId);
      
      if (otrosDetalles) {
        otroMetodo.setAttribute('aria-expanded', 'false');
        otrosDetalles.style.maxHeight = `${otrosDetalles.scrollHeight}px`;
        
        // Forzar repintado
        void otrosDetalles.offsetHeight;
        
        // Iniciar animación de colapso
        otrosDetalles.style.maxHeight = '0';
        otrosDetalles.style.opacity = '0';
        
        // Manejar el final de la transición
        const onOtherTransitionEnd = () => {
          otrosDetalles.removeEventListener('transitionend', onOtherTransitionEnd);
          if (otroMetodo.getAttribute('aria-expanded') === 'false') {
            otrosDetalles.style.visibility = 'hidden';
          }
        };
        
        otrosDetalles.addEventListener('transitionend', onOtherTransitionEnd, { once: true });
      }
    }
  });
  
  // Expandir este método
  metodo.setAttribute('aria-expanded', 'true');
  detalles.style.visibility = 'visible';
  detalles.style.display = 'block';
  
  // Forzar el cálculo del alto total
  const height = detalles.scrollHeight;
  detalles.style.maxHeight = '0';
  detalles.style.opacity = '0';
  
  // Forzar repintado
  void detalles.offsetHeight;
  
  // Iniciar animación de expansión
  requestAnimationFrame(() => {
    detalles.style.maxHeight = `${height}px`;
    detalles.style.opacity = '1';
    
    // Manejar el final de la transición
    const onExpandEnd = () => {
      detalles.removeEventListener('transitionend', onExpandEnd);
      if (metodo.getAttribute('aria-expanded') === 'true') {
        detalles.style.maxHeight = '';
      }
    };
    
    detalles.addEventListener('transitionend', onExpandEnd, { once: true });
    
    // Hacer scroll al método expandido
    setTimeout(() => {
      metodo.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }, 50);
  });
}

// Función para inicializar tooltips
function initTooltips() {
  // Crear estilos para los tooltips
  const style = document.createElement('style');
  style.textContent = `
    .tooltip {
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      z-index: 1000;
      transform: translateY(5px);
    }
    
    .tooltip::after {
      content: '';
      position: absolute;
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 5px 5px 5px;
      border-style: solid;
      border-color: transparent transparent #1f2937 transparent;
    }
    
    .copy-button:hover .tooltip {
      opacity: 1;
      transform: translateY(0);
    }
    
    .copy-button.copied {
      background-color: #10b981 !important;
      color: white !important;
    }
    
    .copy-button.copied:hover {
      transform: scale(1) !important;
    }
  `;
  document.head.appendChild(style);
  
  // Agregar tooltips a los botones de copiar
  document.querySelectorAll('.copy-button').forEach(button => {
    const tooltip = document.createElement('span');
    tooltip.className = 'tooltip';
    tooltip.textContent = 'Copiar al portapapeles';
    button.appendChild(tooltip);
    
    // Posicionar el tooltip
    button.addEventListener('mouseenter', () => {
      const rect = button.getBoundingClientRect();
      tooltip.style.left = `${rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `-${tooltip.offsetHeight + 5}px`;
    });
  });
}

// Función para inicializar la funcionalidad de los métodos de pago
function initMetodosPago() {
  // Agregar manejadores de clic a los métodos de pago
  document.querySelectorAll('.payment-method').forEach(metodo => {
    const header = metodo.querySelector('.method-header');
    if (!header) return;
    
    // Manejar clic en el encabezado
    header.addEventListener('click', (e) => {
      // No hacer nada si se hace clic en un botón de copiar
      if (e.target.closest('.copy-button')) {
        return;
      }
      toggleMetodo(metodo);
    });
    
    // Mejorar accesibilidad
    header.setAttribute('role', 'button');
    header.setAttribute('tabindex', '0');
    header.setAttribute('aria-expanded', 'false');
    
    // Manejar teclado para accesibilidad
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMetodo(metodo);
      } else if (e.key === 'Escape') {
        // Cerrar si está abierto
        if (metodo.getAttribute('aria-expanded') === 'true') {
          toggleMetodo(metodo);
        }
      }
    });
  });
  
  // Inicializar tooltips para botones de copiar
  initTooltips();
}

// Inicializar cuando el DOM esté listo
function init() {
  initMetodosPago();
  
  // Agregar clase de carga para animaciones
  document.documentElement.classList.add('js-loaded');
  
  // Mejorar accesibilidad para lectores de pantalla
  document.querySelectorAll('.payment-method').forEach(method => {
    method.setAttribute('role', 'button');
    method.setAttribute('tabindex', '0');
  });
  
  // Manejar clics en botones de copiar
  document.addEventListener('click', async (e) => {
    const copyButton = e.target.closest('.copy-button');
    if (!copyButton) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const copyable = copyButton.closest('.copyable');
    if (!copyable) return;
    
    const textToCopy = copyable.getAttribute('data-clipboard-text');
    if (!textToCopy) return;
    
    await copyToClipboard(textToCopy, copyButton);
  });
  
  // Navegación con teclado
  document.addEventListener('keydown', (e) => {
    // Solo manejar si estamos en un método de pago
    const activeElement = document.activeElement;
    if (!activeElement.closest('.payment-method')) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeElement.getAttribute('role') === 'button') {
        toggleMetodo(activeElement);
      }
    } else if (e.key === 'Escape') {
      const expanded = document.querySelector('.payment-method[aria-expanded="true"]');
      if (expanded) {
        toggleMetodo(expanded);
        expanded.focus();
      }
    }
  });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // Si el DOM ya está listo, ejecutar inmediatamente
  setTimeout(init, 0);
}

// Manejar cambios en las preferencias del sistema
if (window.matchMedia) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  // Aplicar preferencias de reducción de movimiento
  function handleMotionPreference() {
    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }
  
  // Escuchar cambios en las preferencias
  prefersReducedMotion.addListener(handleMotionPreference);
  handleMotionPreference();
}
