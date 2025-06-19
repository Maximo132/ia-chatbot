/**
 * Muestra las sucursales en el chat
 * @function
 * @param {Function} appendMessage - Función para agregar mensajes al chat
 */
window.mostrarSucursalesEnChat = function(appendMessage) {
  // Mostrar indicador de escritura con animación mejorada
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-dot" style="--delay: 0s"></div>
    <div class="typing-dot" style="--delay: 0.2s"></div>
    <div class="typing-dot" style="--delay: 0.4s"></div>
  `;
  
  const messageElement = document.createElement('div');
  messageElement.className = 'message bot-message typing-message';
  messageElement.appendChild(typingIndicator);
  
  const chatMessages = document.querySelector('.chat-messages');
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Datos de las sucursales
  const sucursales = [
    {
      nombre: 'Santiago Tianguistenco',
      direccion: ['ANDADOR CARLOS HANK GONZALEZ #304, SANTIAGO TIANGUISTENCO, ESTADO DE MEXICO', 'JUNTO AL BANCO SANTANDER'],
      horario: ['L-V 9:00 AM - 6:00 PM', 'Sábados: 9:00 AM - 3:00 PM'],
      telefono: '5551234567',
      mapa: 'https://www.google.com/maps/place/M-net+Sistemas+Computadoras+e+Internet/@19.1816993,-99.4694112,764m/data=!3m2!1e3!4b1!4m6!3m5!1s0x85cdf3d2a5c1d91f:0x59b36638210c9c11!8m2!3d19.1816993!4d-99.4668363!16s%2Fg%2F11c6112plc?entry=ttu&g_ep=EgoyMDI1MDUyMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D',
      whatsapp: 'https://wa.me/525587654321',
      destacado: true
    },
    {
      nombre: 'Santa Mónica',
      direccion: ['GALEANA #27 CARR. MEXICO-CHALMA COL. EL PICACHO, OCUILAN DE ARTEAGA, ESTADO DE MEXICO', 'JUNTO A FEDEX'],
      horario: ['L-V 9:00 AM - 6:00 PM', 'Sábados: 9:00 AM - 3:00 PM'],
      telefono: '5557654321',
      mapa: 'https://maps.app.goo.gl/bw4Q7EGeADY1Z6xd7',
      whatsapp: 'https://wa.me/525587654321'
    },
    {
      nombre: 'Cholula',
      direccion: ['JOSE MA. MORELOS S/N, ESQUINA CON BENITO JUAREZ GARCIA COL. MORELOS, SAN PEDRO CHOLULA, ESTADO DE MEXICO', 'DEBAJO DEL HOTEL CHOLULA'],
      horario: ['L-V 9:00 AM - 6:00 PM', 'Sábados: 9:00 AM - 3:00 PM'],
      telefono: '5559876543',
      mapa: 'https://maps.app.goo.gl/9A7pdCtpqeEQzSnf6',
      whatsapp: 'https://wa.me/525587654321'
    }
  ];

  // Eliminar el indicador de escritura después de un tiempo
  setTimeout(() => {
    messageElement.classList.add('fade-out');
    
    // Esperar a que termine la animación de fade out antes de eliminar
    setTimeout(() => {
      messageElement.remove();
      
      // Crear el mensaje con las sucursales
      let sucursalesHTML = `
      <div class="sucursales-message-container">
        <div class="sucursales-chat-message">
          <div class="sucursales-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>NUESTRAS SUCURSALES</span>
          </div>
    `;

    // Agregar horarios generales al final
    sucursalesHTML += `
      <div class="horarios-generales">
        <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg> Horarios de Atención</h3>
        <div class="horario-grid">
          <div class="horario-item">
            <span class="dias">Lunes a Viernes</span>
            <span class="horas">9:00 AM - 6:00 PM</span>
          </div>
          <div class="horario-item destacado">
            <span class="dias">Sábados</span>
            <span class="horas">9:00 AM - 3:00 PM</span>
          </div>
          <div class="horario-item cerrado">
            <span class="dias">Domingos</span>
            <span class="horas">Cerrado</span>
          </div>
        </div>
      </div>
    `;

    // Agregar cada sucursal con animación escalonada
    sucursales.forEach((sucursal, index) => {
      // Formatear el número de teléfono para mostrarlo de manera bonita
      const telefonoFormateado = sucursal.telefono.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      const destacadoClass = sucursal.destacado ? ' destacado' : '';
      
      sucursalesHTML += `
        <div class="sucursal-card${destacadoClass}" data-sucursal-id="sucursal-${index}" style="animation-delay: ${index * 0.1}s">
          <h3 class="sucursal-nombre">
            <span>${sucursal.nombre}</span>
            ${sucursal.destacado ? '<span class="badge">Recomendado</span>' : ''}
          </h3>
          <p class="sucursal-dir">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${sucursal.direccion.join('<br>')}
          </p>

          <p class="sucursal-tel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            ${telefonoFormateado}
          </p>
          <div class="sucursal-links">
            <a href="${sucursal.mapa}" target="_blank" class="sucursal-mapa">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Ver en Mapa</span>
            </a>
            <a href="${sucursal.whatsapp}" target="_blank" class="sucursal-whatsapp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.498 14.382l-1.72-1.72a1.1 1.1 0 00-1.555 1.555l1.72 1.72a7.35 7.35 0 11-2.6-2.6l1.72-1.72a1.1 1.1 0 10-1.555-1.555l-1.72 1.72a4.7 4.7 0 10-1.555 1.555l1.72-1.72a1.1 1.1 0 00-1.555-1.555l-1.72 1.72a7.35 7.35 0 1110.4-10.4l1.72 1.72a1.1 1.1 0 101.555-1.555l-1.72-1.72a9.8 9.8 0 10-13.86 13.86l1.72 1.72a1.1 1.1 0 101.555-1.555l-1.72-1.72a7.35 7.35 0 0110.4-10.4l1.72 1.72a1.1 1.1 0 101.555-1.555l-1.72-1.72a9.8 9.8 0 00-13.86 0l-1.72 1.72a1.1 1.1 0 001.555 1.555l1.72-1.72a7.35 7.35 0 0110.4 0l-1.72 1.72a1.1 1.1 0 001.555 1.555l1.72-1.72a9.8 9.8 0 000 13.86z"></path>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      `;
    });

    sucursalesHTML += `
        </div>
      </div>
    `;

      try {
        // Asegurarse de que el CSS esté cargado
        const cssId = 'sucursales-chat-styles';
        if (!document.getElementById(cssId)) {
          const link = document.createElement('link');
          link.id = cssId;
          link.rel = 'stylesheet';
          link.type = 'text/css';
          link.href = '/static/css/8.Sucursales.css';
          link.media = 'all';
          document.head.appendChild(link);
        }
        
        // Crear y agregar el mensaje al chat
        const messageElement = document.createElement('div');
        messageElement.className = 'message bot-message';
        messageElement.innerHTML = sucursalesHTML;
        
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
          chatMessages.appendChild(messageElement);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
          console.error('No se encontró el contenedor de mensajes del chat');
        }
      } catch (error) {
        console.error('Error al mostrar las sucursales:', error);
      }
    }, 300); // Cierre del setTimeout interno
  }, 1500); // Cierre del setTimeout externo
};
