// Evitar carga múltiple del script
if (typeof window._comprobanteScriptLoaded === 'undefined') {
    window._comprobanteScriptLoaded = true;

    // Estado de la aplicación
    const estado = {
        pasoActual: 1,
        cliente: null,
        datosFormulario: {},
        archivoCargado: false,
        nombreArchivo: '',
        tipoArchivo: '',
        archivo: null
    };

    // Función para inicializar con la base de datos
    function inicializarConDatos(clientesDB) {
        console.log('Inicializando con base de datos de clientes');
        
        // Guardar la base de datos en el ámbito global
        window.clientesDB = clientesDB || {};
        console.log('Clientes disponibles:', Object.keys(window.clientesDB));
        
        // Inicializar la interfaz
        inicializarEventos();
        mostrarBienvenida();
    }

    // Función para manejar mensajes entrantes
    function manejarMensaje(event) {
        // Verificar que el mensaje sea para nosotros y tenga la estructura esperada
        if (event.data && event.data.type === 'initComprobante') {
            console.log('Datos de cliente recibidos');
            
            // Si recibimos la base de datos, inicializar con ella
            if (event.data.clientesDB) {
                // Remover el manejador después de recibir los datos
                window.removeEventListener('message', manejarMensaje);
                
                // Inicializar con los datos recibidos
                inicializarConDatos(event.data.clientesDB);
            }
        }
    }

    // Función para inicializar el módulo
    function inicializarModulo() {
        console.log('Inicializando módulo de comprobante...');
        
        // Configurar el manejador de mensajes primero
        window.addEventListener('message', manejarMensaje);
        
        // Notificar al padre que estamos listos para recibir datos
        if (window.parent) {
            console.log('Solicitando base de datos al padre...');
            window.parent.postMessage({ type: 'comprobanteReady' }, '*');
            
            // Enviar de nuevo después de un breve retraso
            setTimeout(() => {
                if (!window.clientesDB) {
                    console.log('Reintentando solicitar base de datos...');
                    window.parent.postMessage({ type: 'comprobanteReady' }, '*');
                }
            }, 500);
        }
        
        // Si ya tenemos la base de datos, inicializar de inmediato
        if (window.clientesDB) {
            console.log('Base de datos ya disponible');
            inicializarConDatos(window.clientesDB);
        }
    }
    
    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', inicializarModulo);

    // Mostrar mensaje de bienvenida personalizado al cargar la página
    function mostrarBienvenida() {
        // Verificar si ya hay un número de cliente en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const numeroCliente = urlParams.get('cliente');
        
        // Si hay un número de cliente en la URL, intentar cargar los datos
        if (numeroCliente) {
            // Buscar el cliente en la base de datos global
            const cliente = window.clientesDB && window.clientesDB[numeroCliente];
            
            if (cliente && cliente.nombre) {
                // Actualizar el estado con la información del cliente
                estado.cliente = cliente;
                estado.datosFormulario.numeroCliente = numeroCliente;
                
                // Mostrar mensaje de bienvenida con el objeto completo del cliente
                mostrarMensajeBienvenida(cliente);
                
                // Mostrar el número de cliente en el campo correspondiente
                const inputNumeroCliente = document.getElementById('numeroCliente');
                if (inputNumeroCliente) {
                    inputNumeroCliente.value = numeroCliente;
                    inputNumeroCliente.disabled = true;
                    
                    // Avanzar al paso 2 automáticamente
                    estado.pasoActual = 2;
                    actualizarInterfaz();
                }
            }
        } else {
            // Si no hay número de cliente en la URL, asegurarse de que el mensaje de bienvenida esté oculto
            const contenedorBienvenida = document.getElementById('bienvenidaUsuario');
            if (contenedorBienvenida) {
                contenedorBienvenida.style.display = 'none';
            }
        }
    }

    // Inicializar eventos de la interfaz
    function inicializarEventos() {
        const zonaArrastre = document.getElementById('zonaArrastre');
        const inputArchivo = document.getElementById('inputArchivo');
        const formularioIdentificacion = document.getElementById('identificacionForm');
        const btnContinuar = document.getElementById('btnContinuarVerificacion');
        const btnMostrarAyuda = document.getElementById('mostrarAyuda');
        const btnCambiarArchivo = document.getElementById('btnCambiarArchivo');
        
        // Validar número de cliente al enviar el formulario
        if (formularioIdentificacion) {
            formularioIdentificacion.addEventListener('submit', validarNumeroCliente);
        }
        
        // Si hay un botón de ayuda, agregar el manejador de eventos
        if (btnMostrarAyuda) {
            btnMostrarAyuda.addEventListener('click', mostrarAyudaNumeroCliente);
        }
        
        // Manejar clic en la zona de arrastre
        if (zonaArrastre) {
            zonaArrastre.addEventListener('click', () => inputArchivo.click());
            
            // Prevenir el comportamiento por defecto para los eventos de arrastre
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                zonaArrastre.addEventListener(eventName, prevenirComportamiento, false);
                document.body.addEventListener(eventName, prevenirComportamiento, false);
            });
            
            // Resaltar la zona de arrastre
            ['dragenter', 'dragover'].forEach(eventName => {
                zonaArrastre.addEventListener(eventName, resaltarZona, false);
            });
            
            // Quitar resaltado
            ['dragleave', 'drop'].forEach(eventName => {
                zonaArrastre.addEventListener(eventName, quitarResaltado, false);
            });
            
            // Manejar archivo soltado
            zonaArrastre.addEventListener('drop', manejarSoltado, false);
        }
        
        // Manejar selección de archivo
        if (inputArchivo) {
            inputArchivo.addEventListener('change', manejarSeleccionArchivo);
        }
        
        // Manejar clic en el botón de continuar
        if (btnContinuar) {
            btnContinuar.addEventListener('click', manejarEnvioComprobante);
        }
        
        // Manejar clic en el botón de cambiar archivo
        if (btnCambiarArchivo) {
            btnCambiarArchivo.addEventListener('click', () => inputArchivo.click());
        }
    }

    // Prevenir el comportamiento por defecto de los eventos de arrastre
    function prevenirComportamiento(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Resaltar la zona de arrastre
    function resaltarZona() {
        const zonaArrastre = document.getElementById('zonaArrastre');
        if (zonaArrastre) zonaArrastre.classList.add('zona-arrastre-resaltada');
    }

    // Quitar resaltado de la zona de arrastre
    function quitarResaltado() {
        const zonaArrastre = document.getElementById('zonaArrastre');
        if (zonaArrastre) zonaArrastre.classList.remove('zona-arrastre-resaltada');
    }

    // Manejar archivo soltado
    function manejarSoltado(e) {
        const dt = e.dataTransfer;
        const archivos = dt.files;
        
        if (archivos.length) {
            manejarArchivo(archivos[0]);
        }
    }

    // Manejar selección de archivo
    function manejarSeleccionArchivo(e) {
        const archivos = e.target.files;
        if (archivos.length) {
            manejarArchivo(archivos[0]);
        }
    }

    // Manejar el archivo seleccionado
    async function manejarArchivo(archivo) {
        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/png', 'application/pdf'];
        const tamanoMaximo = 8 * 1024 * 1024; // 8MB
        
        if (!tiposPermitidos.includes(archivo.type) && 
            !archivo.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
            mostrarError('Por favor, selecciona un archivo JPG, PNG o PDF.');
            return;
        }
        
        if (archivo.size > tamanoMaximo) {
            mostrarError('El archivo es demasiado grande. El tamaño máximo permitido es 8MB.');
            return;
        }
        
        // Actualizar estado
        estado.archivoCargado = true;
        estado.nombreArchivo = archivo.name;
        estado.tipoArchivo = archivo.type;
        estado.archivo = archivo;
        
        // Actualizar la interfaz
        const zonaArrastre = document.getElementById('zonaArrastre');
        const vistaPrevia = document.getElementById('vistaPrevia');
        const nombreArchivo = document.getElementById('nombreArchivo');
        const tamanoArchivo = document.getElementById('tamanoArchivo');
        
        if (zonaArrastre && vistaPrevia && nombreArchivo && tamanoArchivo) {
            // Ocultar zona de arrastre y mostrar vista previa
            zonaArrastre.style.display = 'none';
            vistaPrevia.style.display = 'block';
            
            // Mostrar información del archivo
            nombreArchivo.textContent = archivo.name;
            tamanoArchivo.textContent = `${(archivo.size / 1024 / 1024).toFixed(2)} MB`;
        }
        
        // Habilitar botón de continuar
        const btnContinuar = document.getElementById('btnContinuarVerificacion');
        if (btnContinuar) {
            btnContinuar.disabled = false;
        }
        
        // Mostrar notificación de éxito
        mostrarNotificacion('Archivo cargado correctamente', 'success');
    }

    // Manejar el envío del comprobante
    async function manejarEnvioComprobante() {
        if (!estado.archivoCargado || !estado.cliente) {
            mostrarError('Por favor, selecciona un archivo para continuar.');
            return;
        }
        
        const btnContinuar = document.getElementById('btnContinuarVerificacion');
        
        // Mostrar estado de carga
        btnContinuar.disabled = true;
        btnContinuar.innerHTML = '<span class="loading">Enviando...</span>';
        
        try {
            // Simular envío a la API (reemplazar con tu endpoint real)
            const formData = new FormData();
            formData.append('comprobante', estado.archivo);
            formData.append('cliente_id', estado.cliente.id);
            
            // Aquí iría la llamada real a la API
            // const response = await fetch('/api/enviar-comprobante', {
            //     method: 'POST',
            //     body: formData
            // });
            // const resultado = await response.json();
            
            // Simular respuesta exitosa después de 1.5 segundos
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Mostrar confirmación exitosa
            estado.pasoActual = 3;
            actualizarInterfaz();
            
            // Actualizar detalles en la confirmación
            document.getElementById('clienteNumero').textContent = estado.cliente.id || 'N/A';
            document.getElementById('nombreArchivoConfirmacion').textContent = estado.nombreArchivo;
            document.getElementById('fechaEnvio').textContent = new Date().toLocaleString('es-MX');
            
            // Hacer scroll hasta arriba
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error('Error al enviar el comprobante:', error);
            mostrarError('Ocurrió un error al enviar el comprobante. Por favor, inténtalo de nuevo más tarde.');
            btnContinuar.disabled = false;
            btnContinuar.innerHTML = 'Enviar Comprobante <i class="fas fa-paper-plane" style="margin-left: 8px;"></i>';
        }
    }

    // Valida el número de cliente ingresado
    function validarNumeroCliente(e) {
        if (e) e.preventDefault();
        
        const inputNumeroCliente = document.getElementById('numeroCliente');
        const errorCliente = document.getElementById('errorCliente');
        const numeroCliente = inputNumeroCliente ? inputNumeroCliente.value.trim() : '';
        
        // Limpiar errores previos
        if (inputNumeroCliente) inputNumeroCliente.classList.remove('error');
        if (errorCliente) errorCliente.style.display = 'none';
        
        // Validar que se haya ingresado un número
        if (!numeroCliente) {
            if (inputNumeroCliente) inputNumeroCliente.classList.add('error');
            if (errorCliente) {
                errorCliente.textContent = 'Por favor ingresa tu número de cliente';
                errorCliente.style.display = 'block';
            }
            return false;
        }
        
        // Validar formato (5-6 dígitos)
        if (!/^\d{5,6}$/.test(numeroCliente)) {
            if (inputNumeroCliente) inputNumeroCliente.classList.add('error');
            if (errorCliente) {
                errorCliente.textContent = 'El número de cliente debe tener entre 5 y 6 dígitos';
                errorCliente.style.display = 'block';
            }
            return false;
        }
        
        // Verificar si la base de datos de clientes está disponible
        if (typeof window.clientesDB === 'undefined') {
            console.error('La base de datos de clientes no está disponible');
            if (inputNumeroCliente) inputNumeroCliente.classList.add('error');
            if (errorCliente) {
                errorCliente.textContent = 'Error al cargar la base de datos. Por favor, recarga la página e inténtalo de nuevo.';
                errorCliente.style.display = 'block';
            }
            return false;
        }
        
        // Verificar si el cliente existe en la base de datos
        const cliente = window.clientesDB[numeroCliente];
        
        if (!cliente) {
            console.log('Cliente no encontrado en la base de datos:', numeroCliente);
            console.log('Clientes disponibles:', Object.keys(window.clientesDB));
            
            if (inputNumeroCliente) inputNumeroCliente.classList.add('error');
            if (errorCliente) {
                errorCliente.innerHTML = 'No se encontró un cliente con este número. ';
                errorCliente.innerHTML += '<a href="#" id="mostrarAyuda" class="enlace-ayuda">¿Necesitas ayuda para encontrarlo?</a>';
                errorCliente.style.display = 'block';
                
                // Agregar manejador de clic al enlace de ayuda
                const enlaceAyuda = document.getElementById('mostrarAyuda');
                if (enlaceAyuda) {
                    enlaceAyuda.addEventListener('click', function(e) {
                        e.preventDefault();
                        mostrarAyudaNumeroCliente(e);
                    });
                }
            }
            return false;
        }
        
        // Cliente válido
        if (inputNumeroCliente) inputNumeroCliente.classList.remove('error');
        if (errorCliente) errorCliente.style.display = 'none';
        
        // Actualizar estado
        estado.cliente = cliente;
        estado.datosFormulario = estado.datosFormulario || {};
        estado.datosFormulario.numeroCliente = numeroCliente;
        
        // Mostrar mensaje de bienvenida
        mostrarMensajeBienvenida(cliente);
        
        // Avanzar al siguiente paso
        estado.pasoActual = 2;
        actualizarInterfaz();
        
        // Hacer scroll hasta arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        return true;
    }

    // Muestra el mensaje de bienvenida con el nombre completo del cliente
    function mostrarMensajeBienvenida(cliente) {
        const contenedorBienvenida = document.getElementById('bienvenidaUsuario');
        if (!contenedorBienvenida) return;
        
        let nombreMostrar = 'Cliente';
        
        if (cliente.nombreCompleto) {
            nombreMostrar = cliente.nombreCompleto;
        } else if (cliente.nombre) {
            nombreMostrar = cliente.nombre;
            if (cliente.apellidoPaterno || cliente.apellidoMaterno) {
                nombreMostrar = `${cliente.nombre} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim();
            }
        }
        
        // Crear el mensaje de bienvenida
        contenedorBienvenida.innerHTML = `
            <div class="mensaje-bienvenida">
                <i class="fas fa-user-circle"></i>
                <div>
                    <p class="saludo">¡Bienvenido!</p>
                    <p class="nombre-cliente">${nombreMostrar}</p>
                </div>
            </div>
        `;
        
        contenedorBienvenida.style.display = 'block';
    }

    // Muestra ayuda para encontrar el número de cliente
    function mostrarAyudaNumeroCliente(e) {
        if (e) e.preventDefault();
        
        // Crear el contenido HTML
        const content = document.createElement('div');
        content.style.maxHeight = '60vh';
        content.style.overflowY = 'auto';
        content.style.padding = '0 10px';
        content.style.margin = '0 -10px';
        
        content.innerHTML = `
            <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f;">
                <div style="background: #f5f5f7; border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #1d1d1f; margin-bottom: 12px; text-align: left;">
                        <p style="margin: 0 0 12px 0; display: flex; align-items: flex-start;">
                            <span style="background: #007AFF; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: 600;">1</span>
                            Busca tu ticket de pago más reciente
                        </p>
                        <p style="margin: 0 0 12px 0; display: flex; align-items: flex-start;">
                            <span style="background: #007AFF; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: 600;">2</span>
                            Localiza el número en la esquina superior izquierda
                        </p>
                        <p style="margin: 0; display: flex; align-items: flex-start;">
                            <span style="background: #007AFF; color: white; width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px; font-weight: 600;">3</span>
                            Ingresa el número de 5 a 6 dígitos
                        </p>
                    </div>
                </div>
                <div style="background: #f5f5f7; border-radius: 12px; padding: 12px; margin-bottom: 15px; text-align: center;">
                    <div style="position: relative; display: inline-block; margin: 0 auto; max-width: 280px;">
                        <img src="/static/ticket.jpeg" alt="Ejemplo de ticket" style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); display: block;">
                        <div style="position: absolute; top: 10%; left: 10%; background: rgba(255, 204, 0, 0.3); border: 2px dashed #FFCC00; border-radius: 4px; padding: 2px 6px;">
                            <span style="font-family: monospace; font-size: 12px; font-weight: 600; color: #1d1d1f;">12345</span>
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 13px; color: #86868b; padding: 0 10px;">
                        El número de cliente está resaltado en amarillo en tu ticket
                    </div>
                </div>
                <div style="background: #f8f8fa; border-left: 4px solid #007AFF; padding: 10px; border-radius: 0 8px 8px 0; margin: 0 0 10px 0;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #1d1d1f; font-weight: 500;">¿No encuentras tu número?</p>
                    <p style="margin: 0; font-size: 13px; color: #86868b;">Comunícate con nuestro centro de atención al <a href="tel:8001234567" style="color: #007AFF; text-decoration: none; font-weight: 500;">800-123-4567</a></p>
                </div>
            </div>
        `;

        // Configuración de SweetAlert2
        Swal.fire({
            title: '¿Dónde encuentro mi número de cliente?',
            html: content,
            showConfirmButton: true,
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#007AFF',
            width: '90%',
            maxWidth: '420px',
            padding: '15px',
            background: '#ffffff',
            backdrop: 'rgba(0, 0, 0, 0.5)',
            showCloseButton: true
        });
    }

    // Actualiza la interfaz según el paso actual
    function actualizarInterfaz() {
        // Obtener el paso anterior
        const pasoAnterior = document.querySelector('.paso.activo');
        const pasoAnteriorNum = pasoAnterior ? parseInt(pasoAnterior.id.replace('paso', '')) : 1;
        
        // Ocultar todos los pasos
        document.querySelectorAll('.paso').forEach(paso => {
            paso.classList.remove('activo');
        });
        
        // Mostrar el paso actual
        const pasoActual = document.getElementById(`paso${estado.pasoActual}`);
        if (pasoActual) {
            pasoActual.classList.add('activo');
            
            // Si estamos pasando al paso 2, hacer scroll al inicio del módulo
            if (estado.pasoActual === 2 && pasoAnteriorNum === 1) {
                // Pequeño retraso para asegurar que la transición del paso se complete
                setTimeout(() => {
                    const moduloContainer = document.querySelector('.modulo-container');
                    if (moduloContainer) {
                        // Hacer scroll al inicio del contenedor
                        moduloContainer.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
                }, 50);
            }
        }
        
        // Actualizar el botón de continuar según el paso
        const btnContinuar = document.getElementById('btnContinuarVerificacion');
        if (btnContinuar) {
            btnContinuar.disabled = estado.pasoActual !== 2 || !estado.archivoCargado;
        }
    }

    // Función para mostrar notificaciones al estilo Apple
    function mostrarNotificacion(mensaje, tipo = 'error', duracion = 5000) {
        // Crear el contenedor de notificaciones si no existe
        let notificaciones = document.querySelector('.notificaciones');
        if (!notificaciones) {
            notificaciones = document.createElement('div');
            notificaciones.className = 'notificaciones';
            document.body.appendChild(notificaciones);
        }
        
        // Crear la notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        
        // Ícono según el tipo
        let icono = '';
        switch(tipo) {
            case 'success':
                icono = '<i class="fas fa-check-circle"></i>';
                break;
            case 'warning':
                icono = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'info':
                icono = '<i class="fas fa-info-circle"></i>';
                break;
            default: // error
                icono = '<i class="fas fa-times-circle"></i>';
        }
        
        notificacion.innerHTML = `
            <div class="notificacion-icono">${icono}</div>
            <div class="notificacion-contenido">${mensaje}</div>
            <button class="notificacion-cerrar">&times;</button>
        `;
        
        // Agregar al DOM
        notificaciones.appendChild(notificacion);
        
        // Forzar reflow para la animación
        void notificacion.offsetWidth;
        
        // Mostrar con animación
        notificacion.classList.add('mostrar');
        
        // Cerrar al hacer clic en el botón
        const btnCerrar = notificacion.querySelector('.notificacion-cerrar');
        btnCerrar.addEventListener('click', () => {
            cerrarNotificacion(notificacion);
        });
        
        // Cerrar automáticamente después del tiempo especificado
        if (duracion > 0) {
            setTimeout(() => {
                cerrarNotificacion(notificacion);
            }, duracion);
        }
        
        return notificacion;
    }
    
    // Función auxiliar para cerrar notificaciones
    function cerrarNotificacion(notificacion) {
        if (!notificacion) return;
        
        notificacion.classList.remove('mostrar');
        notificacion.classList.add('ocultar');
        
        // Eliminar después de la animación
        setTimeout(() => {
            if (notificacion && notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }
    
    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Verificar si el contenedor ya está en el DOM
        if (document.querySelector('.modulo-container')) {
            initComprobante();
        } else {
            // Si no está en el DOM, esperar a que se agregue dinámicamente
            const observer = new MutationObserver(function(mutations, obs) {
                if (document.querySelector('.modulo-container')) {
                    initComprobante();
                    obs.disconnect();
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    });
    
    // Función para inicializar el módulo de comprobante
    function initComprobante() {
        console.log('Inicializando módulo de envío de comprobantes');
        
        // Verificar si estamos en un iframe
        const isInIframe = window.self !== window.top;
        
        // Si estamos en un iframe, notificar al padre que estamos listos
        if (isInIframe) {
            window.parent.postMessage({ type: 'comprobanteReady' }, '*');
        }
        
        // Inicializar eventos
        inicializarEventos();
        
        // Mostrar mensaje de bienvenida si hay un cliente
        mostrarBienvenida();
        
        // Verificar si hay un número de cliente en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const numeroCliente = urlParams.get('cliente');
        
        if (numeroCliente) {
            // Buscar el cliente en la base de datos global
            const cliente = window.clientesDB && window.clientesDB[numeroCliente];
            
            if (cliente) {
                // Actualizar el estado con la información del cliente
                estado.cliente = cliente;
                estado.datosFormulario.numeroCliente = numeroCliente;
                
                // Mostrar mensaje de bienvenida
                mostrarMensajeBienvenida(cliente);
                
                // Actualizar el campo de número de cliente
                const inputNumeroCliente = document.getElementById('numeroCliente');
                if (inputNumeroCliente) {
                    inputNumeroCliente.value = numeroCliente;
                    inputNumeroCliente.disabled = true;
                    
                    // Avanzar al paso 2 automáticamente
                    estado.pasoActual = 2;
                    actualizarInterfaz();
                }
            }
        }
    }
    
    // Hacer la función accesible globalmente
    window.initComprobante = initComprobante;
}