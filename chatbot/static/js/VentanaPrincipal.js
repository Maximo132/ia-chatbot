// --- VentanaPrincipal.js ---

// Base de datos global de clientes
window.clientesDB = {
    '12345': {
        // ID del cliente (debe coincidir con la clave del objeto)
        id: '12345',
        
        // Información personal (según INE)
        nombre: 'MAX',
        apellidoPaterno: 'VARGAS',
        apellidoMaterno: 'SANTIAGO',
        sexo: 'H',
        fechaNacimiento: '27/05/2001',
        
        // Información de contacto
        telefono: '7292553437',
        correo: 'maxfriday16@gmail.com',
        
        // Dirección (según INE)
        calle: 'HERIBERTO ENRÍQUEZ',
        numero: '69',
        colonia: 'CENTRO',
        municipio: 'TOLUCA',
        ciudad: 'TOLUCA',
        estado: 'MÉXICO',
        pais: 'MÉXICO',
        codigoPostal: '52540',
        
        // Documentos de identificación (según INE)
        claveElector: 'VASM850616HDFRNG09',
        curp: 'VASM010527HDFRNX09',
        
        // Información del servicio (datos adicionales del sistema)
        servicio: 'Internet 200 Mbps',
        plan: 'Plan Básico',
        fechaContratacion: '2023-01-15',
        
        // Configuración de cuenta
        estatus: 'Activo',
        notificaciones: true,
        ultimoAcceso: '2023-10-26T15:30:00',
        
        // Metadatos
        tipoIdentificacion: 'INE',
        numeroIdentificacion: 'VASM850616HDFRNG09' // Mismo que claveElector
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const imageButton = document.getElementById('image-button');
    const imageUpload = document.getElementById('image-upload');
    const menuItems = document.querySelectorAll('.menu-item');

    // Manejar la selección de menú
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("recibe mensaje")
            // Remover clase active de todos los ítems del menú
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Agregar clase active al ítem seleccionado
            this.classList.add('active');
            
            // Obtener el template a cargar
            const template = this.getAttribute('data-template');
            if (template) {
                // Limpiar el área de chat
                const chatMessages = document.getElementById('chat-messages');
                if (!chatMessages) {
                    console.error('No se encontró el contenedor de mensajes');
                    return;
                }
                
                // Mostrar el contenedor de chat si está oculto
                const chatContainer = document.querySelector('.chat-container');
                if (chatContainer) {
                    chatContainer.style.display = 'flex';
                    chatContainer.style.flexDirection = 'column';
                }
                
                // Mostrar el área de entrada de mensajes por defecto
                const chatInput = document.querySelector('.chat-input');
                if (chatInput) {
                    chatInput.style.display = 'flex';
                }
                
                // Limpiar el área de chat
                chatMessages.innerHTML = '';
                
                // Cargar el template correspondiente
                if (template === '1.ContratarServicio') {
                    fetch('/contratar-servicio')
                        .then(response => response.text())
                        .then(html => {
                            // Insertar el HTML directamente en el área de mensajes
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            chatMessages.appendChild(tempDiv.firstElementChild);
                            
                            // Asegurarse de que el scroll vaya al final
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                            
                            // Cargar el CSS de ContratarServicio si no está cargado
                            if (!document.getElementById('contratar-servicio-css')) {
                                const link = document.createElement('link');
                                link.id = 'contratar-servicio-css';
                                link.rel = 'stylesheet';
                                link.type = 'text/css';
                                link.href = '/static/css/1.ContratarServicio.css';
                                document.head.appendChild(link);
                            }
                            
                            // Cargar el script de ContratarServicio si no está cargado
                            if (!window._contratarScriptLoaded) {
                                const script = document.createElement('script');
                                script.src = '/static/js/1.ContratarServicio.js';
                                script.onload = () => { 
                                    window._contratarScriptLoaded = true; 
                                    console.log('Script de ContratarServicio cargado correctamente');
                                };
                                script.onerror = (error) => {
                                    console.error('Error al cargar el script de ContratarServicio:', error);
                                };
                                document.body.appendChild(script);
                            }
                        })
                        .catch((error) => {
                            console.error('Error al cargar el formulario de contratación:', error);
                            appendMessage('No se pudo cargar el formulario de contratación.', 'bot');
                        });
                }
                else if (template === '2.PlanesDisponibles') {
                    // Limpiar el área de chat
                    chatMessages.innerHTML = '';
                    
                    // Cargar el contenido de Planes Disponibles
                    console.log('Iniciando carga de Planes Disponibles...');
                    fetch('/planes-disponibles')
                        .then(response => {
                            console.log('Respuesta recibida, estado:', response.status);
                            if (!response.ok) {
                                throw new Error(`Error HTTP: ${response.status}`);
                            }
                            return response.text();
                        })
                        .then(html => {
                            console.log('Contenido HTML recibido:', html.substring(0, 100) + '...');
                            if (!html || html.trim() === '') {
                                throw new Error('El contenido recibido está vacío');
                            }
                            
                            // Crear un contenedor para el contenido
                            const contentContainer = document.createElement('div');
                            contentContainer.className = 'planes-disponibles-container';
                            contentContainer.style.width = '100%';
                            contentContainer.style.overflow = 'hidden';
                            
                            // Insertar el HTML en el contenedor
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            
                            // Mover el contenido al contenedor
                            while (tempDiv.firstChild) {
                                contentContainer.appendChild(tempDiv.firstChild);
                            }
                            
                            // Limpiar y agregar el nuevo contenido
                            chatMessages.innerHTML = '';
                            chatMessages.appendChild(contentContainer);
                            
                            // Asegurarse de que el scroll vaya al final
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                            
                            // Cargar el CSS de PlanesDisponibles si no está cargado
                            if (!document.getElementById('planes-disponibles-css')) {
                                const link = document.createElement('link');
                                link.id = 'planes-disponibles-css';
                                link.rel = 'stylesheet';
                                link.type = 'text/css';
                                link.href = '/static/css/2.PlanesDisponibles.css';
                                document.head.appendChild(link);
                            }
                            
                            // Mostrar el contenedor de planes y cargar el script
                            const planesContainer = contentContainer.querySelector('.planes-container');
                            if (planesContainer) {
                                planesContainer.style.display = 'block';
                                console.log('Mostrando el contenedor de planes');
                                
                                // Cargar el script de PlanesDisponibles si no está cargado
                                if (!window._planesScriptLoaded) {
                                    const script = document.createElement('script');
                                    script.src = '/static/js/2.PlanesDisponibles.js';
                                    script.onload = () => { 
                                        window._planesScriptLoaded = true; 
                                        console.log('Script de PlanesDisponibles cargado correctamente');
                                        
                                        // Inicializar el carrusel después de cargar el script
                                        if (typeof window.initPlanesCarrusel === 'function') {
                                            console.log('Inicializando el carrusel...');
                                            window.initPlanesCarrusel();
                                        } else {
                                            console.warn('La función initPlanesCarrusel no está disponible');
                                        }
                                    };
                                    script.onerror = (error) => {
                                        console.error('Error al cargar el script de PlanesDisponibles:', error);
                                        // Mostrar un mensaje de error al usuario
                                        const errorMessage = document.createElement('div');
                                        errorMessage.className = 'error-message';
                                        errorMessage.textContent = 'Error al cargar la funcionalidad de planes. Por favor, recargue la página.';
                                        chatMessages.appendChild(errorMessage);
                                    };
                                    document.body.appendChild(script);
                                } else if (typeof window.initPlanesCarrusel === 'function') {
                                    // Si ya está cargado, inicializar el carrusel
                                    console.log('El script ya estaba cargado, inicializando...');
                                  initPlanesCarrusel();
                                }
                            } else {
                                console.warn('No se encontró el contenedor de planes');
                            }
                            
                            console.log('Contenido de planes disponibles cargado exitosamente');
                        })
                        .catch((error) => {
                            console.error('Error al cargar los planes disponibles:', error);
                            // Mostrar mensaje de error detallado
                            const errorMessage = document.createElement('div');
                            errorMessage.className = 'error-message';
                            errorMessage.style.color = '#d32f2f';
                            errorMessage.style.padding = '15px';
                            errorMessage.style.margin = '10px';
                            errorMessage.style.border = '1px solid #ffcdd2';
                            errorMessage.style.borderRadius = '4px';
                            errorMessage.style.backgroundColor = '#ffebee';
                            errorMessage.innerHTML = `
                                <strong>Error al cargar los planes disponibles</strong><br>
                                ${error.message || 'Error desconocido'}<br>
                                <small>Por favor, intente nuevamente más tarde o recargue la página.</small>
                            `;
                            chatMessages.appendChild(errorMessage);
                            
                            // También mostrar en consola para depuración
                            console.error('Detalles del error:', {
                                error: error.message,
                                stack: error.stack,
                                timestamp: new Date().toISOString()
                            });
                        });
                }
                else if (template === '8.Sucursales') {
                    if (!window._sucursalesScriptLoaded) {
                        const script = document.createElement('script');
                        script.src = '/static/js/8.Sucursales.js';
                        script.onload = function() {
                            window._sucursalesScriptLoaded = true;
                            if (typeof window.mostrarSucursalesEnChat === 'function') {
                                window.mostrarSucursalesEnChat(appendMessage);
                            } else {
                                appendMessage('Error al cargar la función de sucursales.', 'bot');
                            }
                        };
                        script.onerror = function() {
                            appendMessage('Error al cargar el script de sucursales.', 'bot');
                        };
                        document.body.appendChild(script);
                    } else if (typeof window.mostrarSucursalesEnChat === 'function') {
                        window.mostrarSucursalesEnChat(appendMessage);
                    } else {
                        appendMessage('No se pudo mostrar la información de sucursales.', 'bot');
                    }
                } else if (template === '2.PlanesDisponibles') {
                    // This block has been moved to the beginning of the file
                    // to handle the Planes Disponibles template loading
                } 
                // Si es el template de métodos de pago, cargar el HTML
                else if (template === '3.ReportarFalla') {
                    // Limpiar el área de chat
                    chatMessages.innerHTML = '';
                    chatMessages.style.padding = '20px';
                    chatMessages.style.overflowY = 'auto';
                    chatMessages.style.height = 'calc(100% - 60px)';
                    chatMessages.style.display = 'flex';
                    chatMessages.style.justifyContent = 'center';
                    chatMessages.style.alignItems = 'flex-start';
                    
                    // Crear un iframe para cargar la página de reporte de falla
                    const iframe = document.createElement('iframe');
                    iframe.src = '/reportar-falla';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.borderRadius = '12px';
                    iframe.style.overflow = 'auto';
                    iframe.style.backgroundColor = 'transparent';
                    
                    // Limpiar y agregar el iframe al área de chat
                    chatMessages.innerHTML = '';
                    chatMessages.appendChild(iframe);
                    
                    // Asegurarse de que el scroll vaya al final
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                else if (template === '7.HorariosAtencion') {
    if (!window._horariosAtencionScriptLoaded) {
        const script = document.createElement('script');
        script.src = '/static/js/7.HorariosAtencionJs.js';
        script.onload = function() {
            window._horariosAtencionScriptLoaded = true;
            if (typeof window.mostrarHorariosAtencion === 'function') {
                window.mostrarHorariosAtencion();
            } else {
                appendMessage('Error al cargar la función de horarios de atención.', 'bot');
            }
        };
        script.onerror = function() {
            appendMessage('Error al cargar el script de horarios de atención.', 'bot');
        };
        document.body.appendChild(script);
    } else if (typeof window.mostrarHorariosAtencion === 'function') {
        window.mostrarHorariosAtencion();
    } else {
        appendMessage('No se pudo mostrar la información de horarios de atención.', 'bot');
    }
} else if (template === '9.MetodosPago') {
                    fetch('/get_metodos_pago')
                        .then(response => response.text())
                        .then(html => {
                            // Insertar el HTML de los métodos de pago como mensaje tipo 'bot' en el chat
                            appendMessage(html, 'bot');
                            // Cargar el CSS de métodos de pago
                            const cssLink = document.createElement('link');
                            cssLink.rel = 'stylesheet';
                            cssLink.href = '/static/css/9.MetodosPago.css';
                            document.head.appendChild(cssLink);
                            
                            // Cargar el JS de métodos de pago
                            const script = document.createElement('script');
                            script.src = '/static/js/9.MetodosPago.js';
                            document.body.appendChild(script);
                        })
                        .catch(error => {
                            console.error('Error al cargar los métodos de pago:', error);
                            appendMessage('Ocurrió un error al cargar los métodos de pago. Por favor, inténtalo de nuevo más tarde.', 'bot');
                        });
                }
                else if (template === '3.ReportarFalla') {
                    // Cargar el formulario de reporte de falla
                    fetch('/reportar-falla')
                        .then(response => response.text())
                        .then(html => {
                            // Insertar el HTML directamente en el área de mensajes
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = html;
                            chatMessages.appendChild(tempDiv.firstElementChild);
                            
                            // Asegurarse de que el scroll vaya al final
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                            
                            // Cargar el CSS de ReportarFalla si no está cargado
                            if (!document.getElementById('reportar-falla-css')) {
                                const link = document.createElement('link');
                                link.id = 'reportar-falla-css';
                                link.rel = 'stylesheet';
                                link.type = 'text/css';
                                link.href = '/static/css/3.ReportarFalla.css';
                                document.head.appendChild(link);
                            }
                            
                            // Cargar el script de ReportarFalla si no está cargado
                            if (!window._reportarFallaScriptLoaded) {
                                const script = document.createElement('script');
                                script.src = '/static/js/3.ReportarFalla.js';
                                script.onload = () => { 
                                    window._reportarFallaScriptLoaded = true;
                                    console.log('Script de ReportarFalla cargado correctamente');
                                };
                                script.onerror = (error) => {
                                    console.error('Error al cargar el script de ReportarFalla:', error);
                                };
                                document.body.appendChild(script);
                            }
                        })
                        .catch(error => {
                            console.error('Error al cargar el formulario de reporte de falla:', error);
                            appendMessage('No se pudo cargar el formulario de reporte de falla. Por favor, inténtalo de nuevo más tarde.', 'bot');
                        });
                }
                else if (template === '5.CambioContrasena') {
                    // Limpiar el área de chat
                    chatMessages.innerHTML = '';
                    chatMessages.style.padding = '20px';
                    chatMessages.style.overflowY = 'auto';
                    chatMessages.style.height = 'calc(100% - 60px)';
                    chatMessages.style.display = 'flex';
                    chatMessages.style.justifyContent = 'center';
                    chatMessages.style.alignItems = 'flex-start';
                    
                    // Crear un iframe para cargar la página de cambio de contraseña
                    const iframe = document.createElement('iframe');
                    iframe.src = '/cambio-contrasena';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.borderRadius = '12px';
                    iframe.style.overflow = 'hidden';
                    
                    // Agregar el iframe al área de mensajes
                    chatMessages.appendChild(iframe);
                    
                    // Manejar la carga del iframe
                    iframe.onload = function() {
                        console.log('Iframe de Cambio de Contraseña cargado correctamente');
                        // Asegurarse de que el scroll vaya al final
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    };
                    
                    iframe.onerror = function(error) {
                        console.error('Error al cargar el iframe de Cambio de Contraseña:', error);
                        appendMessage('No se pudo cargar el formulario de cambio de contraseña. Por favor, inténtalo de nuevo más tarde.', 'bot');
                    };
                }
                else if (template === '4.Comprobante') {
                    console.log("EStoy en comproibantes")
                    // Limpiar el área de chat
                    chatMessages.innerHTML = '';
                    chatMessages.style.padding = '0';
                    chatMessages.style.overflow = 'hidden';
                    chatMessages.style.height = '100%';
                    chatMessages.style.display = 'flex';
                    chatMessages.style.flexDirection = 'column';
                    
                    // Obtener el número de cliente de la URL si existe
                    const urlParams = new URLSearchParams(window.location.search);
                    const numeroCliente = urlParams.get('cliente');
                    
                    // Crear un iframe para cargar el módulo de forma aislada
                    const iframe = document.createElement('iframe');
                    iframe.id = 'comprobante-iframe';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                    iframe.style.border = 'none';
                    iframe.style.borderRadius = '0';
                    iframe.style.overflow = 'auto';
                    iframe.style.display = 'block';
                    iframe.style.backgroundColor = '#f5f5f7';
                    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
                    iframe.loading = 'eager';
                    iframe.src = '/comprobante' + (numeroCliente ? `?cliente=${encodeURIComponent(numeroCliente)}` : '');
                    
                    // Ajustar el contenedor de mensajes
                    chatMessages.style.padding = '0';
                    chatMessages.style.margin = '0';
                    chatMessages.style.width = '100%';
                    chatMessages.style.height = '100%';
                    chatMessages.style.overflow = 'hidden';
                    chatMessages.style.display = 'flex';
                    chatMessages.style.flexDirection = 'column';
                    chatMessages.style.alignItems = 'center';
                    chatMessages.style.justifyContent = 'flex-start';
                    
                    // Agregar el iframe al contenedor de mensajes
                    chatMessages.appendChild(iframe);
                    
                    // Función para manejar mensajes del iframe
                    function handleIframeMessage(event) {
                        console.log('Mensaje recibido del iframe:', event.data);
                        
                        if (event.data && event.data.type === 'comprobanteReady') {
                            console.log('El iframe de comprobante está listo, enviando base de datos...');
                            
                            // El iframe está listo, enviar los datos del cliente
                            if (window.clientesDB) {
                                console.log('Enviando base de datos al iframe...');
                                iframe.contentWindow.postMessage({
                                    type: 'initComprobante',
                                    clientesDB: window.clientesDB
                                }, '*');
                                
                                // Enviar de nuevo después de un breve retraso para asegurar la recepción
                                setTimeout(() => {
                                    iframe.contentWindow.postMessage({
                                        type: 'initComprobante',
                                        clientesDB: window.clientesDB
                                    }, '*');
                                }, 500);
                            } else {
                                console.error('La base de datos de clientes no está disponible');
                            }
                        }
                    }
                    
                    // Escuchar mensajes del iframe
                    window.addEventListener('message', handleIframeMessage, false);
                    
                    // Limpiar el event listener cuando se desmonte el iframe
                    iframe.addEventListener('unload', function() {
                        console.log('Iframe de comprobante se está cerrando');
                        window.removeEventListener('message', handleIframeMessage, false);
                    });
                    
                    // Enviar la base de datos cuando el iframe esté cargado
                    iframe.addEventListener('load', function() {
                        console.log('Iframe de comprobante cargado, enviando datos...');
                        if (window.clientesDB) {
                            iframe.contentWindow.postMessage({
                                type: 'initComprobante',
                                clientesDB: window.clientesDB
                            }, '*');
                        }
                    });
                    
                    // Manejar errores
                    iframe.onerror = function(error) {
                        console.error('Error al cargar el módulo de comprobante:', error);
                        appendMessage('No se pudo cargar el formulario de comprobante. Por favor, inténtalo de nuevo más tarde.', 'bot');
                    };
                }
                else {
                    // Para otros templates, limpiar el área de chat
                    chatMessages.innerHTML = '';
                }
            }
        });
    });

    // Enviar mensaje al presionar botón o Enter
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Manejar la carga de imágenes
    imageButton.addEventListener('click', () => imageUpload.click());
    
    imageUpload.addEventListener('change', handleImageUpload);
    
    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            appendMessage('Por favor, selecciona un archivo de imagen válido.', 'bot');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Mostrar vista previa de la imagen
            const imgPreview = document.createElement('div');
            imgPreview.className = 'message user';
            imgPreview.innerHTML = `
                <div class="image-preview">
                    <img src="${e.target.result}" alt="Imagen enviada">
                    <div class="image-name">${file.name}</div>
                </div>
            `;
            chatMessages.appendChild(imgPreview);
            chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
            
            // Aquí podrías enviar la imagen al servidor
            // Por ejemplo: uploadImageToServer(file);
        };
        
        reader.readAsDataURL(file);
        
        // Limpiar el input para permitir cargar la misma imagen de nuevo si es necesario
        event.target.value = '';
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message === '') return;
        appendMessage(message, 'user');
        userInput.value = '';
        userInput.focus();
        // Aquí puedes hacer fetch/ajax al backend Flask para obtener respuesta
        fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        })
        .then(response => response.json())
        .then(data => {
            appendMessage(data.response, 'bot');
        })
        .catch(() => {
            appendMessage('Ocurrió un error. Intenta de nuevo.', 'bot');
        });
    }

    function getCurrentTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // La hora '0' debe ser '12'
        return `${hours}:${minutes} ${ampm}`;
    }

    function appendMessage(text, sender) {
        const msgContainer = document.createElement('div');
        msgContainer.className = 'message-container ' + sender + '-container';
        
        const msgDiv = document.createElement('div');
        msgDiv.className = 'message ' + sender;
        
        // Contenido del mensaje
        if (text.startsWith('<') && text.endsWith('>')) {
            msgDiv.innerHTML = text;
        } else {
            // Reemplazar saltos de línea con <br> y espacios con &nbsp;
            const formattedText = text
                .replace(/\n/g, '<br>')
                .replace(/  /g, ' &nbsp;');
            msgDiv.innerHTML = formattedText;
        }
        
        // Añadir la hora
        const timeSpan = document.createElement('span');
        timeSpan.className = 'message-time';
        timeSpan.textContent = getCurrentTime();
        
        // Añadir check azul si es mensaje del usuario
        if (sender === 'user') {
            const checkIcon = document.createElement('span');
            checkIcon.className = 'message-status';
            checkIcon.innerHTML = '✓✓';
            timeSpan.appendChild(checkIcon);
        }
        
        msgDiv.appendChild(timeSpan);
        msgContainer.appendChild(msgDiv);
        chatMessages.appendChild(msgContainer);
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }

    // Auto-scroll al cargar
    chatMessages.scrollTo({ top: chatMessages.scrollHeight });
});
