// Verificar si ya se ha cargado este módulo
if (!window.contratarServicioLoaded) {
    console.log("1.ContratarServicio.js cargado correctamente");
    window.contratarServicioLoaded = true;

    // Objeto con los planes disponibles para cada categoría
    const planesPorCategoria = {
        'residencial': [
            { 
                nombre: '50 megas', 
                velocidad: '50 Mbps', 
                precio: '$300/mes', 
                caracteristicas: ['8-10 dispositivos conectados', '3 personas trabajando/estudiando', 'Streaming HD y gaming', 'Internet ilimitado']
            },
            { 
                nombre: '75 megas', 
                velocidad: '75 Mbps', 
                precio: '$400/mes', 
                caracteristicas: ['8-12 dispositivos conectados', '3 personas trabajando/estudiando', 'Alta calidad de video', 'Juego en línea', 'Transmisiones en vivo', 'Internet ilimitado']
            },
            { 
                nombre: '100 megas', 
                velocidad: '100 Mbps', 
                precio: '$500/mes', 
                caracteristicas: ['11-15 dispositivos conectados', '5 personas trabajando/estudiando', 'Alta calidad de video', 'Juego en línea', 'Transmisiones en vivo', 'Internet ilimitado']
            },
            { 
                nombre: '200 megas', 
                velocidad: '200 Mbps', 
                precio: '$600/mes', 
                caracteristicas: ['16-20 dispositivos conectados', '8 personas trabajando/estudiando', 'Video 4K', 'Juego en línea', 'Transmisiones en vivo', 'Internet ilimitado']
            },
            { 
                nombre: '500 megas', 
                velocidad: '500 Mbps', 
                precio: '$800/mes', 
                caracteristicas: ['21-25 dispositivos conectados', '16 personas trabajando/estudiando', 'Video 4K', 'Juego en línea', 'Transmisiones en vivo', 'Internet ilimitado']
            },
            { 
                nombre: '1000 megas', 
                velocidad: '1 Gbps', 
                precio: '$1,400/mes', 
                caracteristicas: ['Más de 25 dispositivos', 'Más de 16 personas trabajando/estudiando', 'Video 4K', 'Juego en línea', 'Transmisiones en vivo', 'Internet ilimitado']
            }
        ],
        'empresarial': [
            { 
                nombre: '100MB', 
                velocidad: '100 Mbps', 
                precio: '$1,500/mes', 
                caracteristicas: ['Empresas pequeñas/medianas', 'Internet simétrico', 'Soporte prioritario', 'IP fija incluida']
            },
            { 
                nombre: '200MB', 
                velocidad: '200 Mbps', 
                precio: '$2,000/mes', 
                caracteristicas: ['Empresas medianas', 'Internet simétrico', 'Soporte prioritario', 'IP fija incluida']
            },
            { 
                nombre: '500MB', 
                velocidad: '500 Mbps', 
                precio: '$3,500/mes', 
                caracteristicas: ['Empresas medianas/grandes', 'Internet simétrico', 'Soporte prioritario 24/7', 'IP fija incluida']
            },
            { 
                nombre: '1GB', 
                velocidad: '1 Gbps', 
                precio: '$5,000/mes', 
                caracteristicas: ['Empresas grandes', 'Internet simétrico', 'Soporte dedicado 24/7', 'IP fija incluida', 'Ancho de banda garantizado']
            }
        ],
        'telefonia': [
            { 
                nombre: 'Básico', 
                lineas: '1-5', 
                precio: '$300/mes por extensión', 
                caracteristicas: ['Llamadas ilimitadas MX/USA', 'Buzón de voz', '1 número virtual']
            },
            { 
                nombre: 'Premium', 
                lineas: '6+', 
                precio: '$500/mes por extensión', 
                caracteristicas: ['Llamadas ilimitadas MX/USA', 'Buzón de voz', 'Números virtuales ilimitados', 'Grabación de llamadas', 'IVR/Menú automático', 'Reportes detallados']
            }
        ],
        'videovigilancia': [
            { 
                nombre: 'Básico', 
                camaras: '4 cámaras HD', 
                precio: '$4,500', 
                caracteristicas: ['Grabación 24/7', 'App móvil', 'Instalación incluida']
            },
            { 
                nombre: 'Premium', 
                camaras: '8 cámaras HD', 
                precio: '$8,000', 
                caracteristicas: ['Grabación 24/7', 'App móvil', 'Visión nocturna', 'Detección de movimiento', 'Almacenamiento 30 días', 'Instalación incluida']
            }
        ]
    };

    // Función para manejar la selección de servicio
function handleServiceSelection(serviceType) {
    console.log('1. Iniciando handleServiceSelection con serviceType:', serviceType);
    
    // Mapeo de códigos de servicio a nombres mostrados al usuario
    const serviceNames = {
        'residencial': 'Internet Residencial',
        'empresarial': 'Internet Empresarial',
        'telefonia': 'Telefonía en la Nube',
        'videovigilancia': 'Videovigilancia'
    };
    
    // Si el servicio no está en el mapeo, usamos el valor original
    const serviceName = serviceNames[serviceType] || serviceType;
    console.log('2. Nombre del servicio:', serviceName);
    
    // Si el tipo de servicio no existe en los planes, mostramos un mensaje
    console.log('3. Verificando planes para:', serviceType, 'Planes disponibles:', Object.keys(planesPorCategoria));
    if (!planesPorCategoria[serviceType]) {
        const errorMessage = `Lo siento, actualmente no tenemos planes disponibles para ${serviceName}. Por favor, selecciona otra opción.`;
        
        const botMessage = document.createElement('div');
        botMessage.className = 'bot-message';
        botMessage.innerHTML = `
            <div class="message-content">
                <p>${errorMessage}</p>
            </div>
        `;
        chatMessages.appendChild(botMessage);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return;
    }
    const mensaje = `Has seleccionado: ${serviceName}`;
    console.log('4. Creando mensaje para el usuario:', mensaje);
    
    // Agregar mensaje del usuario
    const chatMessages = document.querySelector('.chat-messages');
    console.log('5. Elemento chatMessages encontrado:', chatMessages);
    
    // Crear contenedor para el mensaje del usuario
    const userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'user-message-container';
    
    // Crear y agregar el mensaje del usuario
    const userMessage = document.createElement('div');
    console.log('6. Elemento userMessage creado:', userMessage);
    userMessage.className = 'user-message';
    userMessage.textContent = mensaje;
    
    // Agregar el mensaje al contenedor
    userMessageContainer.appendChild(userMessage);
    // Agregar el contenedor del mensaje del usuario al chat
    chatMessages.appendChild(userMessageContainer);
    
    // Obtener planes para la categoría seleccionada
    const planes = planesPorCategoria[serviceType];
    console.log('7. Planes encontrados para', serviceType, ':', planes);
    
    // Crear contenedor para el mensaje del bot
    const botMessageContainer = document.createElement('div');
    botMessageContainer.className = 'bot-message-container';
    
    // Crear y agregar la respuesta del bot
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    console.log('8. Elemento botMessage creado:', botMessage);
    
    // Agregar el mensaje al contenedor
    botMessageContainer.appendChild(botMessage);
    
    // Construir el HTML de los planes
    let planesHTML = '';
    console.log('9. Iniciando construcción de planesHTML');
    planes.forEach((plan, index) => {
        console.log(`  9.${index + 1} Procesando plan:`, plan.nombre);
        const caracteristicasHTML = plan.caracteristicas.map(caract => 
            `<li><span>•</span><span>${caract}</span></li>`
        ).join('');
        
        const precio = `<p>${plan.precio}</p>`;
        
        const velocidadOCamaras = plan.velocidad ? 
            `<p>Velocidad: ${plan.velocidad}</p>` :
            plan.camaras ? 
            `<p>Cámaras: ${plan.camaras}</p>` :
            `<p>Líneas: ${plan.lineas}</p>`;
        
        planesHTML += `
            <div class="plan-card">
                <h3>${plan.nombre}</h3>
                ${velocidadOCamaras}
                ${precio}
                <ul>${caracteristicasHTML}</ul>
                <button class="contratar-btn" data-plan="${plan.nombre.replace(/"/g, '&quot;')}">
                    Contratar ${plan.nombre}
                </button>
            </div>`;
    });
    
    console.log('10. HTML de los planes generado:', planesHTML);
    botMessage.innerHTML = `
        <div class="message-content">
            <p style="font-size: 17px; margin-bottom: 20px; color: #1d1d1f;">¡Perfecto! Estos son los planes disponibles para <strong>${serviceName}</strong>:</p>
            <div class="planes-container" style="margin-top: 15px;">
                ${planesHTML}
            </div>
        </div>
    `;
    console.log('11. Contenido HTML asignado a botMessage:', botMessage.innerHTML);
    
    console.log('12. Agregando botMessage al DOM');
    chatMessages.appendChild(botMessageContainer);
    console.log('13. botMessage agregado al DOM');
    
    // Hacer scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    console.log('14. Scroll realizado al final del chat');
}

// Función para mostrar alerta con diseño tipo Apple
function showAlert(title, message, buttonText = 'Aceptar') {
    // Crear el contenedor de la alerta si no existe
    let alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'alert-container';
        alertContainer.innerHTML = `
            <div class="alert-dialog">
                <div class="alert-header">
                    <div class="alert-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                    </div>
                    <h3 class="alert-title">${title}</h3>
                    <p class="alert-message">${message}</p>
                </div>
                <div class="alert-actions">
                    <button class="alert-button primary" id="alert-ok-button">${buttonText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(alertContainer);
        
        // Agregar manejador de eventos al botón
        const okButton = document.getElementById('alert-ok-button');
        okButton.addEventListener('click', function() {
            hideAlert();
        });
    } else {
        // Actualizar el contenido si ya existe
        alertContainer.querySelector('.alert-title').textContent = title;
        alertContainer.querySelector('.alert-message').textContent = message;
        document.getElementById('alert-ok-button').textContent = buttonText;
    }
    
    // Mostrar la alerta con animación
    setTimeout(() => {
        alertContainer.classList.add('visible');
    }, 10);
    
    // Devolver una promesa que se resuelve cuando se cierra la alerta
    return new Promise(resolve => {
        alertContainer._resolve = resolve;
    });
}

// Función para ocultar la alerta
function hideAlert() {
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        alertContainer.classList.remove('visible');
        // Esperar a que termine la animación antes de eliminar
        setTimeout(() => {
            if (alertContainer._resolve) {
                alertContainer._resolve();
            }
        }, 300);
    }
}

// Función principal para manejar la contratación de un plan
window.contratarPlan = function(servicio, plan) {
    console.log('=== Función contratarPlan llamada ===');
    console.log('Servicio:', servicio);
    console.log('Plan:', plan);
    
    if (!servicio || !plan) {
        console.error('Error: Faltan parámetros en la función contratarPlan');
        return;
    }
    
    console.log(`Contratando plan: ${plan} de ${servicio}`);
    
    // Crear mensaje de confirmación
    const chatMessages = document.querySelector('.chat-messages');
    if (!chatMessages) {
        console.error('Error: No se encontró el elemento .chat-messages');
        return;
    }
    
    // Mensaje del usuario (lado derecho)
    const userMessageContainer = document.createElement('div');
    userMessageContainer.className = 'user-message-container';
    
    const userMessage = document.createElement('div');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `
        <p>Quiero contratar el plan ${plan} de ${servicio}</p>
    `;
    
    userMessageContainer.appendChild(userMessage);
    chatMessages.appendChild(userMessageContainer);
    
    // Mostrar mensaje de verificación de cobertura
    const botMessageContainer = document.createElement('div');
    botMessageContainer.className = 'bot-message-container';
    
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = `
        <div class="message-content">
            <div class="cobertura-loading">
                <div class="spinner"></div>
                <p>Verificando cobertura en tu zona para el plan <strong>${plan}</strong> de <strong>${servicio}</strong>...</p>
                <p style="margin-top: 10px; font-size: 14px; color: #0071e3;">Redirigiendo a la verificación de cobertura...</p>
            </div>
        </div>`;
    
    // Abrir el enlace de Google Maps en una nueva pestaña
    window.open('https://goo.gl/maps/SqhkvtGNMqAVDrLj9?g_st=aw', '_blank');
    
    botMessageContainer.appendChild(botMessage);
    chatMessages.appendChild(botMessageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Verificar cobertura después de un breve retraso
    setTimeout(() => {
        verificarCobertura().then((tieneCobertura) => {
            // Eliminar el mensaje de carga
            botMessageContainer.remove();
            
            if (tieneCobertura) {
                // Mostrar mensaje de cobertura confirmada
                const coberturaContainer = document.createElement('div');
                coberturaContainer.className = 'bot-message-container';
                
                const coberturaMessage = document.createElement('div');
                coberturaMessage.className = 'bot-message';
                coberturaMessage.innerHTML = `
                    <div class="message-content">
                        <div class="cobertura-confirmada">
                            <div class="cobertura-icon">✓</div>
                            <h3>¡Excelente noticia!</h3>
                            <p>Hemos verificado que tenemos cobertura en tu zona para el plan <strong>${plan}</strong> de <strong>${servicio}</strong>.</p>
                            <p>Por favor, completa el siguiente formulario para continuar con tu contratación:</p>
                        </div>
                    </div>`;
                
                coberturaContainer.appendChild(coberturaMessage);
                chatMessages.appendChild(coberturaContainer);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Mostrar el formulario después de un breve retraso
                setTimeout(() => {
                    mostrarFormularioContratacion(servicio, plan, chatMessages);
                }, 1000);
            } else {
                // Mostrar mensaje de que no hay cobertura
                const sinCoberturaContainer = document.createElement('div');
                sinCoberturaContainer.className = 'bot-message-container';
                
                const sinCoberturaMessage = document.createElement('div');
                sinCoberturaMessage.className = 'bot-message';
                sinCoberturaMessage.innerHTML = `
                    <div class="message-content">
                        <div class="sin-cobertura">
                            <div class="cobertura-icon">✗</div>
                            <h3>Lo sentimos</h3>
                            <p>Actualmente no tenemos cobertura en tu zona para el plan <strong>${plan}</strong> de <strong>${servicio}</strong>.</p>
                            <p>Te recomendamos consultar nuestros otros planes o comunicarte con nuestro equipo de atención a clientes al 55 1234 5678 para más información.</p>
                            <button class="btn-volver" onclick="window.location.reload()">Ver otros planes</button>
                        </div>
                    </div>`;
                
                sinCoberturaContainer.appendChild(sinCoberturaMessage);
                chatMessages.appendChild(sinCoberturaContainer);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }, 1500);
};

// Función para verificar cobertura en la zona
function verificarCobertura() {
    return new Promise((resolve) => {
        // Simulamos una verificación de cobertura con un retraso
        setTimeout(() => {
            // En una implementación real, aquí se haría una petición al servidor
            // para verificar la cobertura en la zona del usuario
            const tieneCobertura = true; // Por defecto asumimos que sí hay cobertura
            resolve(tieneCobertura);
        }, 1000);
    });
}

// Función para mostrar el formulario de contratación
function mostrarFormularioContratacion(servicio, plan, chatMessages) {
    const botMessageContainer = document.createElement('div');
    botMessageContainer.className = 'bot-message-container';
    
    const botMessage = document.createElement('div');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = `
        <div class="message-content">
            <h3 class="form-title">¡Excelente elección!</h3>
            <p class="form-subtitle">Para continuar con la contratación de <strong>${plan} - ${servicio}</strong>, por favor completa el siguiente formulario:</p>
            <div class="form-container">
                <form id="formulario-contratacion">
                    <!-- Nombre completo -->
                    <div class="form-group has-icon">
                        <span class="form-icon">👤</span>
                        <input type="text" id="nombre-completo" class="form-input" placeholder=" " required>
                        <label class="form-label" for="nombre-completo">Nombre completo <span>*</span></label>
                    </div>
                    
                    <!-- Teléfono -->
                    <div class="form-group has-icon">
                        <span class="form-icon">📱</span>
                        <input type="tel" id="telefono" class="form-input" placeholder="55 1234 5678" pattern="[0-9]{10}" maxlength="10" required>
                        <label class="form-label" for="telefono">Teléfono (10 dígitos) <span>*</span></label>
                    </div>
                    
                    <!-- Dirección completa -->
                    <div class="form-group">
                        <label class="form-label" for="direccion">Dirección completa <span>*</span></label>
                        <input type="text" id="direccion" class="form-input" placeholder="Ej: Av. Principal #123, Col. Centro, Ciudad de México" required>
                    </div>
                    
                    <!-- Código postal -->
                    <div class="form-group">
                        <label class="form-label" for="codigo-postal">Código postal <span>*</span></label>
                        <input type="text" id="codigo-postal" class="form-input" placeholder="Ej: 52600" pattern="[0-9]{5}" maxlength="5" required>
                    </div>
                    
                    <!-- Características del domicilio -->
                    <div class="form-group">
                        <label class="form-label" for="caracteristicas">Características del domicilio <small>(opcional)</small></label>
                        <input type="text" id="caracteristicas" class="form-input" placeholder="Ej: Casa blanca de 2 pisos, portón negro">
                    </div>
                    
                    <!-- Correo electrónico -->
                    <div class="form-group has-icon">
                        <span class="form-icon">✉️</span>
                        <input type="email" id="email" class="form-input" placeholder=" " required>
                        <label class="form-label" for="email">Correo electrónico <span>*</span></label>
                    </div>
                    
                    <!-- Fecha de instalación -->
                    <div class="form-group">
                        <label class="form-label" for="fecha-instalacion">Día para instalación <span>*</span></label>
                        <input type="text" id="fecha-instalacion" class="form-datetime" placeholder="Selecciona una fecha" required readonly>
                        <small style="display: block; margin-top: 5px; color: #86868b; font-size: 13px;">Horario de atención: L-V 9:00 AM - 6:00 PM | SÁB 9:00 AM - 3:00 PM</small>
                    </div>
                    
                    <!-- Hora de instalación -->
                    <div class="form-group" id="hora-container" style="display: none;">
                        <label class="form-label">Selecciona un horario <span>*</span></label>
                        <div class="time-slots" id="horarios-disponibles">
                            <!-- Los horarios se generarán dinámicamente -->
                        </div>
                    </div>
                    
                    <button type="submit" class="form-button">
                        Enviar solicitud de instalación
                    </button>
                    
                    <p style="font-size: 12px; color: #86868b; margin-top: 15px; text-align: center; line-height: 1.4;">
                        * Campos obligatorios<br>
                        Te contactaremos para confirmar tu cita de instalación.
                    </p>
                </form>
            </div>
        </div>`;
    
    botMessageContainer.appendChild(botMessage);
    chatMessages.appendChild(botMessageContainer);
    
    // Inicializar el selector de fecha
    inicializarSelectorFecha();
    
    // Agregar manejador de envío del formulario
    const formulario = document.getElementById('formulario-contratacion');
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            // Aquí iría la lógica para enviar el formulario
            alert('Solicitud de contratación enviada. Nos pondremos en contacto contigo pronto.');
        });
    }
    
    // Hacer scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Inicializar el selector de fecha
    const fechaInput = document.getElementById('fecha-instalacion');
    const horaContainer = document.getElementById('hora-container');
    const horariosDisponibles = document.getElementById('horarios-disponibles');
    
    // Generar horarios disponibles (de 9:00 AM a 6:00 PM de lunes a viernes, 9:00 AM a 3:00 PM sábados)
    const generarHorariosDisponibles = (esSabado = false) => {
        const horas = [];
        const horaInicio = 9; // 9:00 AM
        const horaFin = esSabado ? 15 : 18; // 3:00 PM o 6:00 PM
        
        for (let hora = horaInicio; hora <= horaFin; hora++) {
            // No agregar horario si es después de la hora de cierre
            if (hora === horaFin && esSabado) {
                continue; // No agregar horario después de las 3:00 PM los sábados
            }
            
            // Agregar horario en punto (ej: 9:00 AM)
            const horaFormato = hora > 12 ? hora - 12 : hora;
            const ampm = hora >= 12 ? 'PM' : 'AM';
            
            // Solo agregar si no es la última hora del sábado
            if (!(esSabado && hora === horaFin - 1)) {
                horas.push({
                    hora: `${horaFormato}:00 ${ampm}`,
                    valor: `${hora}:00:00`
                });
            }
            
            // Agregar media hora (ej: 9:30 AM) excepto para la última hora
            if (hora < horaFin - 1 || (hora === horaFin - 1 && !esSabado)) {
                // Para sábados, no agregar 2:30 PM si es la última hora
                if (!(esSabado && hora === 14)) {
                    horas.push({
                        hora: `${horaFormato}:30 ${ampm}`,
                        valor: `${hora}:30:00`
                    });
                }
            }
        }
        
        return horas;
    };
    
    // Mostrar u ocultar horarios según la fecha seleccionada
    const actualizarHorarios = (fechaSeleccionada) => {
        if (!fechaSeleccionada) {
            horaContainer.style.display = 'none';
            return;
        }
        
        const fecha = new Date(fechaSeleccionada);
        const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
        
        // No mostrar horarios si es domingo
        if (diaSemana === 0) {
            horaContainer.style.display = 'none';
            return;
        }
        
        // Generar horarios según sea sábado o día de semana
        const esSabado = diaSemana === 6;
        const horarios = generarHorariosDisponibles(esSabado);
        
        // Limpiar horarios anteriores
        horariosDisponibles.innerHTML = '';
        
        // Agregar horarios al DOM
        horarios.forEach(horario => {
            const botonHora = document.createElement('div');
            botonHora.className = 'time-slot';
            botonHora.textContent = horario.hora;
            botonHora.dataset.hora = horario.valor;
            
            botonHora.addEventListener('click', function() {
                // Remover selección previa
                document.querySelectorAll('.time-slot').forEach(btn => {
                    btn.classList.remove('selected');
                });
                
                // Seleccionar este horario
                this.classList.add('selected');
                // Actualizar campo oculto o atributo de datos
                document.getElementById('hora-seleccionada')?.remove();
                const inputOculto = document.createElement('input');
                inputOculto.type = 'hidden';
                inputOculto.id = 'hora-seleccionada';
                inputOculto.name = 'hora_instalacion';
                inputOculto.value = `${fechaSeleccionada} ${horario.valor}`;
                this.closest('form').appendChild(inputOculto);
            });
            
            horariosDisponibles.appendChild(botonHora);
        });
        
        horaContainer.style.display = 'block';
    };
    
    // Inicializar flatpickr para el selector de fechas
    if (fechaInput) {
        // Cargar flatpickr desde CDN
        const flatpickrScript = document.createElement('script');
        flatpickrScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
        flatpickrScript.onload = function() {
            // Cargar localización en español
            const flatpickrLocale = document.createElement('script');
            flatpickrLocale.src = 'https://npmcdn.com/flatpickr/dist/l10n/es.js';
            flatpickrLocale.onload = function() {
                flatpickr("#fecha-instalacion", {
                    locale: "es",
                    minDate: 'today',
                    dateFormat: 'Y-m-d',
                    disable: [
                        function(date) {
                            // Deshabilitar domingos
                            return (date.getDay() === 0);
                        }
                    ],
                    onChange: function(selectedDates, dateStr) {
                        actualizarHorarios(dateStr);
                    }
                });
            };
            document.head.appendChild(flatpickrLocale);
        };
        document.head.appendChild(flatpickrScript);
        
        // Cargar estilos de flatpickr
        const flatpickrStyles = document.createElement('link');
        flatpickrStyles.rel = 'stylesheet';
        flatpickrStyles.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
        document.head.appendChild(flatpickrStyles);
    }
    
    // Validación personalizada para el teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            // Solo permitir números
            this.value = this.value.replace(/\D/g, '');
            // Limitar a 10 dígitos
            if (this.value.length > 10) {
                this.value = this.value.slice(0, 10);
            }
        });
    }
    
    // Validación personalizada para el código postal
    const codigoPostalInput = document.getElementById('codigo-postal');
    if (codigoPostalInput) {
        codigoPostalInput.addEventListener('input', function(e) {
            // Solo permitir números
            this.value = this.value.replace(/\D/g, '');
            // Limitar a 5 dígitos
            if (this.value.length > 5) {
                this.value = this.value.slice(0, 5);
            }
        });
    }
    
    // Agregar manejador de envío del formulario
    const form = document.getElementById('formulario-contratacion');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar que se haya seleccionado un horario
            const fechaSeleccionada = fechaInput.value;
            const horaSeleccionadaElement = document.getElementById('hora-seleccionada');
            const horaSeleccionada = horaSeleccionadaElement?.value;
            
            if (!fechaSeleccionada) {
                showAlert('Fecha requerida', 'Por favor selecciona una fecha para la instalación.');
                return;
            }
            
            if (!horaSeleccionada) {
                showAlert('Horario requerido', 'Por favor selecciona un horario para la instalación.');
                return;
            }
            
            // Validar que el horario seleccionado esté dentro del horario laboral
            const fechaHoraSeleccionada = new Date(horaSeleccionada);
            const diaSemana = fechaHoraSeleccionada.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
            const hora = fechaHoraSeleccionada.getHours();
            const minutos = fechaHoraSeleccionada.getMinutes();
            
            // Verificar si es domingo
            if (diaSemana === 0) {
                showAlert(
                    'Domingo no disponible',
                    'Lo sentimos, no se realizan instalaciones los domingos. Por favor selecciona otro día de lunes a sábado.'
                );
                return;
            }
            
            // Verificar horario según el día
            const esSabado = diaSemana === 6;
            const horaCierre = esSabado ? 15 : 18; // 3:00 PM o 6:00 PM
            const minutosCierre = esSabado ? 0 : 0; // Minutos del cierre (0 para la hora en punto)
            
            // Crear objeto de fecha para la hora de cierre
            const fechaCierre = new Date(fechaHoraSeleccionada);
            fechaCierre.setHours(horaCierre, minutosCierre, 0, 0);
            
            // Verificar si la hora seleccionada es después de la hora de cierre
            if (fechaHoraSeleccionada >= fechaCierre) {
                const mensajeHorario = esSabado 
                    ? 'Los sábados nuestro horario de atención es de 9:00 AM a 3:00 PM. Por favor selecciona un horario dentro de este rango.'
                    : 'Nuestro horario de atención de lunes a viernes es de 9:00 AM a 6:00 PM. Por favor selecciona un horario dentro de este rango.';
                
                showAlert(
                    'Horario no disponible',
                    mensajeHorario,
                    'Entendido'
                );
                return;
            }
            
            // Mostrar mensaje de éxito
            const mensajeExito = document.createElement('div');
            mensajeExito.className = 'bot-message';
            mensajeExito.innerHTML = `
                <div class="confirmation-message">
                    <div class="confirmation-header">
                        <div class="confirmation-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                            </svg>
                        </div>
                        <h2 class="confirmation-title">¡Solicitud recibida!</h2>
                        <p class="confirmation-subtitle">Hemos recibido tu solicitud de instalación</p>
                    </div>
                    
                    <div class="confirmation-details">
                        <div class="confirmation-detail">
                            <div class="confirmation-detail-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div class="confirmation-detail-text">
                                <strong>Plan:</strong> ${plan} - ${servicio}
                            </div>
                        </div>
                        
                        <div class="confirmation-detail">
                            <div class="confirmation-detail-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </div>
                            <div class="confirmation-detail-text">
                                <strong>Fecha programada:</strong> ${fechaHoraSeleccionada.toLocaleString('es-MX', { 
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </div>
                        </div>
                        
                        <div class="confirmation-detail">
                            <div class="confirmation-detail-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div class="confirmation-detail-text">
                                <strong>Hora:</strong> ${fechaHoraSeleccionada.toLocaleString('es-MX', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}
                            </div>
                        </div>
                    </div>
                    
                    <div class="confirmation-footer">
                        <div>Te contactaremos pronto para confirmar los detalles</div>
                        <div style="margin-top: 8px; font-size: 13px; color: #a1a1a6;">
                            <span>Número de solicitud: #${Math.floor(100000 + Math.random() * 900000)}</span>
                            <span class="confirmation-divider"></span>
                            <span>${new Date().toLocaleDateString('es-MX')}</span>
                        </div>
                    </div>
                </div>`;
                
            const botMessageContainer = document.createElement('div');
            botMessageContainer.className = 'bot-message-container';
            botMessageContainer.appendChild(mensajeExito);
            chatMessages.appendChild(botMessageContainer);
            
            // Hacer scroll al final
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Limpiar formulario
            form.reset();
            horaContainer.style.display = 'none';
        });
    }
}

    // Función para manejar clics en la página
    function handleDocumentClick(e) {
        // Verificar si se hizo clic en un botón de servicio
        const serviceBtn = e.target.closest('.service-btn');
        if (serviceBtn) {
            console.log('Botón de servicio clickeado');
            const serviceType = serviceBtn.dataset.service;
            if (serviceType) {
                e.preventDefault();
                e.stopPropagation();
                handleServiceSelection(serviceType);
                return;
            }
        }

        // Verificar si se hizo clic en un botón de contratar
        const contratarBtn = e.target.closest('.contratar-btn');
        if (contratarBtn && !contratarBtn.hasAttribute('data-processing')) {
            e.preventDefault();
            e.stopPropagation();
            
            const planCard = contratarBtn.closest('.plan-card');
            if (!planCard) return;
            
            const planName = planCard.querySelector('h3')?.textContent.trim();
            if (!planName) return;
            
            // Encontrar el servicio al que pertenece este plan
            const container = planCard.closest('.message-content');
            if (!container) return;
            
            // Buscar el texto que indica el servicio
            const serviceText = container.querySelector('p strong')?.textContent;
            if (!serviceText) return;
            
            // Mapeo inverso de nombres de servicio a códigos
            const serviceCodes = {
                'Internet Residencial': 'residencial',
                'Internet Empresarial': 'empresarial',
                'Telefonía en la Nube': 'telefonia',
                'Videovigilancia': 'videovigilancia'
            };
            
            const serviceCode = Object.entries(serviceCodes).find(([name]) => 
                serviceText.includes(name)
            )?.[1];
            
            if (serviceCode) {
                contratarBtn.setAttribute('data-processing', 'true');
                setTimeout(() => {
                    contratarBtn.removeAttribute('data-processing');
                }, 1000);
                
                window.contratarPlan(serviceCode, planName);
            }
        }
    }

    // Agregar manejadores de eventos cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM completamente cargado');
        // Usar captura para asegurarnos de manejar el evento primero
        document.addEventListener('click', handleDocumentClick, true);
    });

    // Hacer las funciones disponibles globalmente
    window.handleServiceSelection = handleServiceSelection;
    window.contratarPlan = contratarPlan;
}

// Asegurarse de que el módulo se cierre correctamente
