// Patrón de módulo para evitar colisiones
(function() {
    'use strict';

    // Verificar si ya se cargó el script
    if (window._cambioContrasenaScriptLoaded) {
        return;
    }
    window._cambioContrasenaScriptLoaded = true;

    // Verificar si existe la base de datos de clientes global
    if (!window.clientesDB) {
        console.warn('No se encontró la base de datos de clientes en window.clientesDB');
        // Crear una base de datos de respaldo
        window.clientesDB = {
            '12345': {
                id: '12345',
                nombre: 'MAX',
                apellidoPaterno: 'VARGAS',
                apellidoMaterno: 'SANTIAGO',
                telefono: '7292553437',
                correo: 'maxfriday16@gmail.com'
            }
        };
        console.log('Se ha creado una base de datos de respaldo: ', window.clientesDB);
    }

    // Estado de la aplicación
    const estado = {
        pasoActual: 1,
        cliente: null,
        clienteId: null,
        datosFormulario: {},
        archivoCargado: false,
        nombreArchivo: ''
    };

    // Hacer el estado accesible globalmente para depuración
    window.estadoAplicacion = estado;

    // Variables para la ventana de la cámara
    let cameraWindow = null;
    let cameraCheckInterval = null;
    let manejarMensaje = null; // Variable para almacenar la referencia a la función de manejo de mensajes
    let stream = null; // Variable para almacenar el stream de la cámara
    let recognitionInterval = null; // Variable para el intervalo de reconocimiento facial

    // Función para abrir la ventana de la cámara
    function abrirVentanaCamara() {
        let cameraWindow = null;
        
        try {
            // Cerrar cualquier ventana de cámara existente
            if (window.cameraWindow && !window.cameraWindow.closed) {
                window.cameraWindow.close();
            }
            
            // Configurar dimensiones de la ventana
            const width = 500;
            const height = 600;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            
            // Abrir ventana
            cameraWindow = window.open(
                '/camera',
                'cameraWindow',
                `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=no,status=no`
            );
            
            // Guardar referencia globalmente para poder cerrarla después
            window.cameraWindow = cameraWindow;
            
            // Verificar si la ventana se abrió correctamente
            if (!cameraWindow) {
                throw new Error('No se pudo abrir la ventana de la cámara. Por favor, asegúrate de permitir ventanas emergentes para este sitio.');
            }
            
            // El manejo de mensajes se realiza en iniciarReconocimientoFacial
            // para mantener toda la lógica de reconocimiento en un solo lugar
            
            // Manejar cierre de la ventana
            const checkWindowClosed = setInterval(() => {
                if (!cameraWindow || cameraWindow.closed) {
                    clearInterval(checkWindowClosed);
                    finalizarReconocimiento();
                } 
            }, 500);
            
            return cameraWindow;
        } catch (error) {
            console.error('Error al abrir la ventana de la cámara:', error);
            mostrarError(error.message || 'Error al intentar abrir la cámara. Por favor, inténtalo de nuevo.');
            return null;
        }
    }

    // Función para finalizar el proceso de reconocimiento facial
    function finalizarReconocimiento(exito, mensaje) {
        // Limpiar intervalos
        if (cameraCheckInterval) {
            clearInterval(cameraCheckInterval);
            cameraCheckInterval = null;
        }
        
        // Cerrar la ventana de la cámara si está abierta
        if (cameraWindow && !cameraWindow.closed) {
            cameraWindow.close();
            cameraWindow = null;
        }
        
        // Eliminar manejador de mensajes
        if (manejarMensaje) {
            window.removeEventListener('message', manejarMensaje);
            manejarMensaje = null;
        }
        
        // Limpiar el intervalo de reconocimiento
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
            recognitionInterval = null;
        }
        
        // Mostrar mensaje al usuario
        if (exito) {
            mostrarMensaje(mensaje || 'Reconocimiento facial completado con éxito', 'success');
            // Aquí podrías avanzar al siguiente paso o realizar otras acciones necesarias
            estado.pasoActual = 4; // Por ejemplo, avanzar al paso 4
            actualizarInterfaz();
        } else {
            mostrarError(mensaje || 'Error en el reconocimiento facial');
        }
    }
    
    // Función para iniciar el reconocimiento facial
    function iniciarReconocimientoFacial(clienteId) {
        try {
            // Mostrar mensaje de carga
            const loading = mostrarCarga('Iniciando cámara para reconocimiento facial...');
            
            // Abrir la ventana de la cámara
        const cameraWindow = abrirVentanaCamara();
        
        if (!cameraWindow) {
            throw new Error('No se pudo abrir la cámara. Por favor, asegúrate de permitir los elementos emergentes.');
        }
        
        // Configurar el manejador de mensajes para recibir la foto
        if (manejarMensaje) {
            window.removeEventListener('message', manejarMensaje);
        }
        manejarMensaje = async function(event) {
            // Verificar el origen del mensaje para seguridad
            if (event.origin !== window.location.origin) {
                console.warn('Intento de acceso no autorizado desde:', event.origin);
                return;
            }
            
            if (event.data.type === 'FOTO_TOMADA') {
                try {
                    // Mostrar mensaje de carga
                    if (typeof loading === 'function') loading();
                    
                    // Verificar que la imagen sea válida
                    if (!event.data.imageData || event.data.imageData.length < 1000) {
                        throw new Error('La imagen recibida no es válida');
                    }
                    
                    console.log('Foto recibida, iniciando validación...');
                    
                    // Mostrar mensaje de procesamiento
                    mostrarMensaje('Validando identidad...', 'info');
                    
                    // Aquí iría la lógica para comparar con la INE
                    // Por ahora simulamos una validación exitosa después de 2 segundos
                    
                    // Simular procesamiento
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Si la validación es exitosa, subir la selfie
                    try {
                        // Convertir el data URL a Blob
                        const blob = await (await fetch(event.data.imageData)).blob();
                        // Subir la selfie al servidor
                        const resultado = await subirSelfie(blob, clienteId);
                        // Finalizar con éxito
                        finalizarReconocimiento(true, 'Reconocimiento facial exitoso');
                    } catch (error) {
                        console.error('Error al subir la selfie:', error);
                        finalizarReconocimiento(false, 'Error al procesar la selfie: ' + (error.message || 'Error desconocido'));
                    }
                    
                } catch (error) {
                    console.error('Error en el proceso de validación:', error);
                    mostrarError('Error al validar la imagen: ' + (error.message || 'Error desconocido'));
                } finally {
                    // Cerrar la ventana de la cámara en cualquier caso
                    if (cameraWindow && !cameraWindow.closed) {
                        console.log('Cerrando ventana de cámara...');
                        cameraWindow.close();
                    }
                }
            } else if (event.data.type === 'ERROR_CAMARA') {
                // Manejar error de la cámara
                if (typeof loading === 'function') loading();
                mostrarError('Error al acceder a la cámara: ' + event.data.mensaje);
                
                // Cerrar la ventana de la cámara si está abierta
                if (cameraWindow && !cameraWindow.closed) {
                    cameraWindow.close();
                }
            } else if (event.data.type === 'CANCELADO_POR_USUARIO') {
                // El usuario canceló la operación
                if (typeof loading === 'function') loading();
                console.log('Operación de cámara cancelada por el usuario');
            }
        };
        
        // Agregar el manejador de mensajes
        window.addEventListener('message', manejarMensaje);
        
        // Manejar cierre de la ventana
        cameraCheckInterval = setInterval(() => {
            if (cameraWindow.closed) {
                clearInterval(cameraCheckInterval);
                cameraCheckInterval = null;
                
                // Si la ventana se cierra sin tomar foto, mostrar mensaje
                if (typeof loading === 'function') loading();
                
                // Eliminar el manejador de mensajes si existe
                if (manejarMensaje) {
                    window.removeEventListener('message', manejarMensaje);
                    manejarMensaje = null;
                }
                
                // Limpiar el intervalo de reconocimiento si existe
                if (recognitionInterval) {
                    clearInterval(recognitionInterval);
                    recognitionInterval = null;
                }
                
                // Mostrar mensaje de error solo si no se completó el reconocimiento
                if (estado.pasoActual < 4) {
                    mostrarError('Reconocimiento facial cancelado por el usuario');
                }
            }
        }, 500);
        
        // Iniciar el intervalo de reconocimiento
        recognitionInterval = setInterval(() => {
            // Aquí iría la lógica de reconocimiento facial
            // Por ahora, solo lo mantenemos como un marcador de posición
        }, 1000); // Revisar cada segundo
        
    } catch (error) {
        console.error('Error en el reconocimiento facial:', error);
        mostrarError('Error al iniciar el reconocimiento facial: ' + error.message);
        
        // Asegurarse de cerrar cualquier ventana de cámara abierta
        if (cameraWindow && !cameraWindow.closed) {
            cameraWindow.close();
        }
    }
}

// Función para detectar caras en una imagen usando OpenCV.js
async function detectarCara(imagen) {
    return new Promise(async (resolve) => {
        try {
            // Cargar OpenCV.js si no está cargado
            if (typeof cv === 'undefined') {
                await loadOpenCV();
            }
            
            // Crear un canvas temporal
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = imagen.width;
            canvas.height = imagen.height;
            ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
            
            // Convertir la imagen a formato compatible con OpenCV
            const src = cv.imread(canvas);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
            
            // Cargar el clasificador de rostros
            const faceCascade = new cv.CascadeClassifier();
            await loadHaarFaceModel(faceCascade);
            
            // Detectar rostros
            const faces = new cv.RectVector();
            faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0);
            
            // Verificar si se detectó al menos un rostro
            const rostroDetectado = faces.size() > 0;
            
            // Liberar memoria
            src.delete();
            gray.delete();
            faces.delete();
            
            resolve(rostroDetectado);
        } catch (error) {
            console.error('Error en detección de rostros:', error);
            // Si hay un error, asumir que no hay rostro para ser más estricto
            resolve(false);
        }
    });
}

// Función para cargar OpenCV.js
function loadOpenCV() {
    return new Promise((resolve) => {
        if (window.cv) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
        script.async = true;
        script.onload = () => {
            cv['onRuntimeInitialized'] = () => {
                console.log('OpenCV.js está listo');
                resolve();
            };
        };
        script.onerror = () => {
            console.error('Error al cargar OpenCV.js');
            resolve();
        };
        document.body.appendChild(script);
    });
}

// Función para cargar el modelo Haar Cascade
async function loadHaarFaceModel(faceCascade) {
    return new Promise((resolve) => {
        // Intentar cargar el modelo desde el servidor
        fetch('haarcascade_frontalface_default.xml')
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(data => {
                const base64 = btoa(new XMLSerializer().serializeToString(data));
                const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
                const dataView = new DataView(bytes.buffer);
                const dataPtr = cv._malloc(bytes.length);
                
                const dataHeap = new Uint8Array(cv.HEAPU8.buffer, dataPtr, bytes.length);
                dataHeap.set(new Uint8Array(bytes.buffer));
                
                const fs = new cv.FileStorage();
                fs.open('haarcascade_frontalface_default.xml', 0, 'Face')
                
                // Liberar memoria
                cv._free(dataPtr);
                resolve(true);
            })
            .catch(error => {
                console.error('Error al cargar el modelo Haar Cascade:', error);
                resolve(false);
            });
    });
}

// Función para comparar rostros usando la API del servidor
async function compararRostros(imagen1, imagen2) {
    return new Promise((resolve) => {
        try {
            // Crear un canvas para la primera imagen
            const canvas1 = document.createElement('canvas');
            const ctx1 = canvas1.getContext('2d');
            canvas1.width = imagen1.width;
            canvas1.height = imagen1.height;
            ctx1.drawImage(imagen1, 0, 0);
            
            // Crear un canvas para la segunda imagen
            const canvas2 = document.createElement('canvas');
            const ctx2 = canvas2.getContext('2d');
            canvas2.width = imagen2.width;
            canvas2.height = imagen2.height;
            ctx2.drawImage(imagen2, 0, 0);
            
            // Obtener las imágenes en formato base64
            const imagen1Data = canvas1.toDataURL('image/jpeg', 0.9).split(',')[1];
            const imagen2Data = canvas2.toDataURL('image/jpeg', 0.9).split(',')[1];
            
            // Enviar las imágenes al servidor para comparación
            fetch('/comparar_rostros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imagen1: imagen1Data,
                    imagen2: imagen2Data
                })
            })
            .then(response => response.json())
            .then(data => {
                resolve({
                    coinciden: data.coinciden,
                    porcentaje: data.porcentaje
                });
            })
            .catch(error => {
                console.error('Error al comparar rostros:', error);
                resolve({
                    coinciden: false,
                    porcentaje: 0,
                    error: 'Error al comparar los rostros'
                });
            });
        } catch (error) {
            console.error('Error en la comparación de rostros:', error);
            resolve({
                coinciden: false,
                porcentaje: 0,
                error: error.message
            });
        }
    });
}

// Función para mostrar notificaciones
function mostrarNotificacion(titulo, mensaje, tipo = 'info', duracion = 5000) {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    
    // Determinar el ícono según el tipo
    let icono = 'info-circle';
    if (tipo === 'error') icono = 'exclamation-triangle';
    if (tipo === 'success') icono = 'check-circle';
    if (tipo === 'warning') icono = 'exclamation-circle';
    
    // Crear el contenido de la notificación
    notificacion.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${icono}"></i>
            </div>
            <div class="notification-text">
                <div class="notification-title">${titulo}</div>
                <div class="notification-message">${mensaje}</div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Agregar al cuerpo del documento
    document.body.appendChild(notificacion);
    
    // Forzar reflow para que la animación funcione
    void notificacion.offsetWidth;
    
    // Mostrar con animación
    notificacion.classList.add('show');
    
    // Configurar cierre automático
    let timeoutId = setTimeout(() => {
        cerrarNotificacion(notificacion);
    }, duracion);
    
    // Configurar botón de cierre
    const botonCerrar = notificacion.querySelector('.notification-close');
    botonCerrar.addEventListener('click', () => {
        clearTimeout(timeoutId);
        cerrarNotificacion(notificacion);
    });
    
    // Pausar el cierre al hacer hover
    notificacion.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    
    // Reanudar el contador al salir
    notificacion.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            cerrarNotificacion(notificacion);
        }, 1000);
    });
    
    return notificacion;
}

// Función auxiliar para cerrar notificaciones
function cerrarNotificacion(notificacion) {
    if (!notificacion) return;
    
    notificacion.classList.remove('show');
    notificacion.classList.add('hide');
    
    // Eliminar después de la animación
    setTimeout(() => {
        if (notificacion && notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 300);
}

// Función para mostrar un indicador de carga
function mostrarCarga(mensaje) {
    // Ocultar cualquier notificación previa
    const notificaciones = document.querySelectorAll('.notification');
    notificaciones.forEach(notif => {
        cerrarNotificacion(notif);
    });

    // Crear elemento de carga
    const carga = document.createElement('div');
    carga.className = 'notification loading info';
    carga.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <div class="notification-spinner"></div>
            </div>
            <div class="notification-text">
                <div class="notification-title">Procesando</div>
                <div class="notification-message">${mensaje}</div>
            </div>
        </div>
    `;
    
    // Agregar al documento
    document.body.appendChild(carga);
    
    // Forzar reflow
    void carga.offsetWidth;
    
    // Mostrar con animación
    carga.classList.add('show');
    
    // Retornar función para ocultar
    return function ocultarCarga() {
        cerrarNotificacion(carga);
    };
}

// Función para subir la selfie al servidor
async function subirSelfie(selfieBlob, clienteId) {
    const ocultarCarga = mostrarCarga('Verificando tu identidad...');
    
    try {
        const formData = new FormData();
        formData.append('selfie', selfieBlob, 'selfie.jpg');
        formData.append('cliente_id', clienteId);
        
        console.log('1. Preparando para enviar solicitud de subida de selfie...');
        
        try {
            console.log('2. Enviando solicitud POST a /upload-selfie');
            const response = await fetch('/upload-selfie', {
                method: 'POST',
                body: formData
            });
            
            console.log('3. Respuesta HTTP recibida, estado:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error en la respuesta HTTP:', response.status, errorText);
                throw new Error(`Error HTTP ${response.status}: ${errorText}`);
            }
            
            console.log('4. Convirtiendo respuesta a JSON...');
            const data = await response.json();
            console.log('5. Datos de respuesta JSON:', data);
            
            if (!data.success) {
                console.error('6. Error en la respuesta del servidor:', data.error);
                throw new Error(data.error || 'Error al subir la selfie');
            }
            
            // Si recibimos una URL de WhatsApp, redirigir a ella
            console.log('7. URL de WhatsApp recibida:', data.whatsapp_url);
            if (data.whatsapp_url) {
                // Mostrar notificación de éxito
                mostrarNotificacion(
                    '¡Verificación exitosa!',
                    'Tu verificación ha sido exitosa. Redirigiendo a WhatsApp...',
                    'success',
                    3000
                );
                
                // Redirigir a WhatsApp después de un breve retraso
                setTimeout(() => {
                    console.log('Abriendo WhatsApp con URL:', data.whatsapp_url);
                    window.open(data.whatsapp_url, '_blank');
                }, 1500);
            }
            
            return data;
        } catch (error) {
            console.error('Error al procesar la respuesta del servidor:', error);
            mostrarNotificacion(
                'Error de conexión',
                `Error al procesar la respuesta: ${error.message}`,
                'error',
                5000
            );
            throw error;
        }
    } catch (error) {
        console.error('Error al subir la selfie:', error);
        mostrarNotificacion(
            'Error de verificación',
            `No se pudo completar la verificación: ${error.message}`,
            'error',
            5000
        );
        return { success: false, error: error.message };
    } finally {
        // Asegurarse de ocultar el indicador de carga
        if (typeof ocultarCarga === 'function') {
            ocultarCarga();
        }
    }
}

// Función para tomar una foto y procesarla
async function tomarFoto(video, ineImagePromise, timer, stopFaceDetection) {
    const estadoElement = document.getElementById('estadoReconocimiento');
    const btnTomarFoto = document.getElementById('btnTomarFoto');
    
    try {
        // Deshabilitar el botón para evitar múltiples clics
        if (btnTomarFoto) btnTomarFoto.disabled = true;
        
        // Actualizar estado
        if (estadoElement) {
            estadoElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando imagen...';
        }
        
        // Detener la detección de caras
        if (stopFaceDetection) stopFaceDetection();
        
        // Detener el temporizador
        if (timer) clearInterval(timer);
        
        // Crear un canvas para capturar la foto
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        
        // Dibujar el frame actual del video en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir el canvas a blob para enviarlo al servidor
        const selfieBlob = await new Promise(resolve => {
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9);
        });
        
        // Crear imagen de la cámara desde el canvas para el procesamiento
        const camImage = new Image();
        camImage.src = URL.createObjectURL(selfieBlob);
        
        // Esperar a que cargue la imagen de la cámara
        await new Promise((resolve) => {
            camImage.onload = resolve;
            camImage.onerror = () => {
                throw new Error('Error al procesar la imagen de la cámara');
            };
        });
        
        // Verificar si hay un rostro en la imagen
        const hayRostro = await detectarCara(camImage);
        if (!hayRostro) {
            throw new Error('No se detectó ningún rostro en la imagen. Por favor, intente de nuevo.');
        }
        
        // Obtener la imagen de INE
        const ineImage = await ineImagePromise;
        
        // Verificar que ambas imágenes estén cargadas
        if (!ineImage || !camImage) {
            throw new Error('Error al cargar las imágenes para comparación');
        }
        
        // Verificar si hay un rostro en la imagen de INE
        const hayRostroINE = await detectarCara(ineImage);
        if (!hayRostroINE) {
            throw new Error('No se pudo detectar un rostro en la imagen de identificación.');
        }
        
        // Actualizar estado
        if (estadoElement) {
            estadoElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando identidad...';
        }
        
        // Comparar los rostros
        const resultado = await compararRostros(ineImage, camImage);
        
        if (resultado.error) {
            throw new Error(resultado.error);
        }
        
        if (!resultado.coinciden) {
            throw new Error(`Los rostros no coinciden (${resultado.porcentaje.toFixed(1)}% de similitud).`);
        }
        
        // Si llegamos aquí, la verificación fue exitosa
        // Ahora subimos la selfie al servidor
        const clienteInput = document.getElementById('numeroCliente');
        const clienteId = clienteInput ? clienteInput.value.trim() : 'desconocido';
        
        // Mostrar mensaje de que se está enviando la verificación
        if (estadoElement) {
            estadoElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando verificación...';
        }
        
        // Subir la selfie al servidor
        const uploadResult = await subirSelfie(selfieBlob, clienteId);
        
        if (!uploadResult.success) {
            console.warn('No se pudo enviar la selfie por WhatsApp:', uploadResult.error);
            // Continuamos a pesar del error de WhatsApp
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al tomar la foto:', error);
        mostrarError(error.message || 'Error al procesar la imagen. Por favor, intente de nuevo.');
        finalizarReconocimiento(false, error.message || 'Error en la verificación');
        return false;
    } finally {
        // Re-habilitar el botón en caso de error
        if (btnTomarFoto) btnTomarFoto.disabled = false;
    }
}

// Función para finalizar el reconocimiento facial
function finalizarReconocimiento(exito, mensaje) {
    // Cerrar la ventana de la cámara si está abierta
    if (cameraWindow && !cameraWindow.closed) {
        cameraWindow.close();
        cameraWindow = null;
    }
    
    // Limpiar el intervalo de verificación
    if (cameraCheckInterval) {
        clearInterval(cameraCheckInterval);
        cameraCheckInterval = null;
    }
    
    // Detener la cámara si está activa
    if (window.stream) {
        window.stream.getTracks().forEach(track => track.stop());
        window.stream = null;
    } else if (stream) {
        // Para compatibilidad hacia atrás
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // Limpiar intervalos
    if (window.recognitionInterval) {
        clearInterval(window.recognitionInterval);
        window.recognitionInterval = null;
    } else if (recognitionInterval) {
        // Para compatibilidad hacia atrás
        clearInterval(recognitionInterval);
        recognitionInterval = null;
    }
    
    // No necesitamos ocultar el modal aquí ya que lo manejamos con el contenedor fullscreen
    setTimeout(() => {
        const modal = document.getElementById('modalReconocimientoFacial');
        if (modal) {
            // Restaurar el modal para futuros usos
            modal.style.display = 'none';
            
            // Limpiar el estado de verificación
            if (window.estadoAplicacion) {
                window.estadoAplicacion.verificacionEnProgreso = false;
            }
        }
        
        // Restablecer el estado del botón de tomar foto
        const btnTomarFoto = document.getElementById('btnTomarFoto');
        if (btnTomarFoto) {
            btnTomarFoto.disabled = false;
        }
        
        // Mostrar notificación al usuario
        if (mensaje) {
            mostrarNotificacion(mensaje, exito ? 'success' : 'error');
        }
        
        // Si el reconocimiento fue exitoso, habilitar el botón de continuar
        if (exito) {
            const btnContinuarVerificacion = document.getElementById('btnContinuarVerificacion');
            if (btnContinuarVerificacion) {
                btnContinuarVerificacion.disabled = false;
                btnContinuarVerificacion.classList.remove('disabled');
                
                // Desplazarse al botón de continuar
                btnContinuarVerificacion.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }
            
            // Actualizar la interfaz para reflejar que el reconocimiento fue exitoso
            if (window.estadoAplicacion) {
                window.estadoAplicacion.pasoActual = 3; // Avanzar al siguiente paso
                actualizarInterfaz();
            }
        }
    }, exito ? 1000 : 0); // Esperar un segundo antes de cerrar si fue exitoso
}

// Función para manejar el botón continuar
function manejarContinuar() {
    // Asegurarse de que el estado global existe
    if (!window.estadoAplicacion) {
        window.estadoAplicacion = {
            pasoActual: 1,
            cliente: null,
            clienteId: null,
            datosFormulario: {},
            archivoCargado: false,
            nombreArchivo: ''
        };
    }
    
    const estado = window.estadoAplicacion;
    const pasoActual = estado.pasoActual;
    const siguientePaso = pasoActual + 1;

    // Validaciones antes de continuar
    if (pasoActual === 1) {
        const numeroCliente = document.getElementById('numeroCliente')?.value.trim();
        if (!numeroCliente) {
            mostrarNotificacion('Por favor ingrese su número de cliente', 'error');
            return;
        }
        
        // Verificar si el cliente existe
        const cliente = window.clientesDB?.[numeroCliente];
        if (!cliente) {
            mostrarNotificacion('Número de cliente no encontrado', 'error');
            return;
        }
        
        // Guardar datos del cliente
        estado.cliente = cliente;
        estado.clienteId = numeroCliente;
        estado.datosFormulario = estado.datosFormulario || {};
        estado.datosFormulario.numeroCliente = numeroCliente;
        
        // Mostrar mensaje de bienvenida
        mostrarMensajeBienvenida(cliente);
        
        // Deshabilitar el campo de número de cliente
        const inputNumeroCliente = document.getElementById('numeroCliente');
        if (inputNumeroCliente) {
            inputNumeroCliente.disabled = true;
        }
    }
    
    // Actualizar el paso actual
    estado.pasoActual = siguientePaso;
    console.log('Avanzando al paso:', siguientePaso);
    
    // Actualizar la interfaz
    actualizarInterfaz();
    
    // Mostrar el paso correspondiente
    mostrarPaso(siguientePaso);
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la base de datos de clientes si no está definida
    if (!window.clientesDB) {
        console.warn('No se encontró la base de datos de clientes en window.clientesDB');
        window.clientesDB = {};
    }
    
    // Inicializar el estado si no existe
    if (!window.estadoAplicacion) {
        window.estadoAplicacion = {
            pasoActual: 1,
            cliente: null,
            clienteId: null,
            datosFormulario: {},
            archivoCargado: false,
            nombreArchivo: ''
        };
    }
    
    inicializarEventos();
    mostrarBienvenida();
    
    // Cerrar modal al hacer clic fuera del contenido
    window.onclick = function(event) {
        const modal = document.getElementById('modalReconocimientoFacial');
        if (event.target === modal) {
            finalizarReconocimiento(false, 'Reconocimiento facial cancelado');
        }
    };
});

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
    const btnContinuar = document.getElementById('btnContinuarVerificacion');
    
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
        btnContinuar.addEventListener('click', manejarContinuar);
    }
}

// Prevenir el comportamiento por defecto de los eventos de arrastre
function prevenirComportamiento(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Resaltar la zona de arrastre
function resaltarZona() {
    document.getElementById('zonaArrastre').classList.add('zona-arrastre-resaltada');
}

// Quitar resaltado de la zona de arrastre
function quitarResaltado() {
    document.getElementById('zonaArrastre').classList.remove('zona-arrastre-resaltada');
}

// Manejar archivo soltado
function manejarSoltado(e) {
    const dt = e.dataTransfer;
    const archivos = dt.files;
    
    if (archivos.length) {
        manejarArchivo(archivos[0]);
    }
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
    const tiposPermitidos = ['image/jpeg', 'image/png'];
    const tamanoMaximo = 8 * 1024 * 1024; // 8MB
    
    if (!tiposPermitidos.includes(archivo.type)) {
        mostrarError('Por favor, selecciona una imagen JPG o PNG.');
        return;
    }
    
    if (archivo.size > tamanoMaximo) {
        mostrarError('La imagen es demasiado grande. El tamaño máximo permitido es 8MB.');
        return;
    }
    
    // No mostrar el indicador de carga ya que el modal de reconocimiento manejará la retroalimentación
    let ocultarCarga = null;  
    
    try {
        // Obtener el ID del cliente del input
        const clienteInput = document.getElementById('numeroCliente');
        if (!clienteInput || !clienteInput.value) {
            throw new Error('Por favor ingrese su número de cliente.');
        }
        
        const clienteId = clienteInput.value.trim();
        estado.clienteId = clienteId;
        
        if (!/^\d{5,6}$/.test(clienteId)) {
            throw new Error('El número de cliente debe tener 5 o 6 dígitos.');
        }
        
        // Crear FormData para enviar el archivo al servidor
        const formData = new FormData();
        formData.append('ine', archivo);
        formData.append('cliente_id', clienteId);
        
        console.log('Enviando archivo para el cliente ID:', clienteId);
        
        // Enviar archivo al servidor
        const uploadResponse = await fetch('/upload-ine', {
            method: 'POST',
            body: formData
        });
        
        const uploadData = await uploadResponse.json();
        
        if (!uploadResponse.ok) {
            throw new Error(uploadData.error || 'Error en la respuesta del servidor');
        }
        
        // Verificar si la respuesta contiene datos válidos
        if (!uploadData.success) {
            throw new Error(uploadData.error || 'Error al procesar la imagen');
        }
        
        // Obtener referencias a los elementos
        const zonaArrastre = document.getElementById('zonaArrastre');
        const elementosOcultar = zonaArrastre.querySelectorAll('.icono-camara, .texto-arrastre, .texto-formato');
        
        // Ocultar elementos innecesarios
        elementosOcultar.forEach(el => el.style.display = 'none');
        
        // Crear contenedor para el mensaje de éxito
        const mensajeExito = document.createElement('div');
        mensajeExito.className = 'mensaje-exito';
        mensajeExito.innerHTML = `
            <i class="fas fa-check-circle" style="color: #34c759; font-size: 32px;"></i>
            <h5>Documento cargado</h5>
            <p>${archivo.name}</p>
            <div class="progreso-verificacion">
                <div class="barra-progreso">
                    <div class="progreso"></div>
                </div>
                <p class="texto-progreso">Verificando identidad...</p>
            </div>
        `;
        
        // Limpiar la zona de arrastre
        zonaArrastre.innerHTML = '';
        
        // Crear y configurar la previsualización
        const preview = document.createElement('img');
        preview.id = 'previewImagenINE';
        preview.src = URL.createObjectURL(archivo);
        preview.className = 'preview-imagen';
        preview.style.maxWidth = '100%';
        preview.style.maxHeight = '200px';
        preview.style.marginBottom = '15px';
        preview.style.borderRadius = '8px';
        
        // Agregar elementos al contenedor
        zonaArrastre.appendChild(preview);
        zonaArrastre.appendChild(mensajeExito);
        
        // Guardar la URL del objeto para liberarla después
        estado.previewImageUrl = preview.src;
        
        // Actualizar estado
        estado.archivoCargado = true;
        estado.nombreArchivo = archivo.name;
        estado.verificacionEnProgreso = true;  // Marcar que la verificación está en progreso
        
        // Mostrar notificación de éxito
        mostrarNotificacion('¡Documento cargado con éxito! Iniciando verificación facial...', 'success');
        
        // Iniciar reconocimiento facial si el servidor lo indica
        if (uploadData.shouldStartFacialRecognition) {
            // No mostrar el mensaje de carga ya que el modal de reconocimiento lo manejará
            setTimeout(() => {
                iniciarReconocimientoFacial(uploadData.clienteId || clienteId);
            }, 100);
        }
    } catch (error) {
        console.error('Error al procesar el archivo:', error);
        
        // Ocultar indicador de carga si existe
        if (ocultarCarga && typeof ocultarCarga === 'function') {
            ocultarCarga();
        }
        
        // Mostrar mensaje de error al usuario
        const errorMessage = error.message || 'Error al procesar el archivo';
        mostrarNotificacion(errorMessage, 'error');
        
        // Restaurar la zona de arrastre con un mensaje más claro
        if (zonaArrastre) {
            zonaArrastre.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #FF9500; font-size: 32px;"></i>
                <h5>Documento no válido</h5>
                <p>Por favor, sube una imagen clara de tu INE/IFE</p>
                <button class="btn btn-outline-primary btn-sm mt-2" style="font-size: 13px;">
                    <i class="fas fa-redo"></i> Intentar de nuevo
                </button>
            `;
        
            // Agregar evento al botón de intentar de nuevo
            const btnReintentar = zonaArrastre.querySelector('button');
            if (btnReintentar) {
                btnReintentar.addEventListener('click', function() {
                    inputArchivo.value = '';
                    inputArchivo.click();
                });
            }
            
            // Deshabilitar botón de continuar
            const btnContinuar = document.getElementById('btnContinuarVerificacion');
            if (btnContinuar) {
                btnContinuar.disabled = true;
            }
            
            // Restaurar eventos de arrastre
            configurarArrastreYSoltar();
        }
    }
}

// Función para mostrar notificaciones al estilo Apple
function mostrarNotificacion(mensaje, tipo = 'error', duracion = 5000) {
    // Crear contenedor de notificación
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-apple ${tipo}`;
        
    // Determinar el ícono según el tipo
    let icono = 'info-circle';
    if (tipo === 'error') icono = 'exclamation-triangle';
    if (tipo === 'success') icono = 'check-circle';
    if (tipo === 'warning') icono = 'exclamation-circle';
        
    // Crear el contenido de la notificación
    notificacion.innerHTML = `
        <div class="notificacion-contenido">
            <div class="notificacion-icono">
                <i class="fas fa-${icono}"></i>
            </div>
            <div class="notificacion-texto">
                <p>${mensaje}</p>
            </div>
            <button class="notificacion-cerrar">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
        
    // Agregar al cuerpo del documento
    document.body.appendChild(notificacion);
        
    // Animación de entrada
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 10);
        
    // Configurar cierre automático
    let timeoutId = setTimeout(() => {
        cerrarNotificacion(notificacion);
    }, duracion);
        
    // Configurar botón de cierre
    const botonCerrar = notificacion.querySelector('.notificacion-cerrar');
    botonCerrar.addEventListener('click', () => {
        clearTimeout(timeoutId);
        cerrarNotificacion(notificacion);
    });
        
    // Pausar el cierre al hacer hover
    notificacion.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
        
    // Reanudar el contador al salir
    notificacion.addEventListener('mouseleave', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            cerrarNotificacion(notificacion);
        }, 1000);
    });
}

// Función auxiliar para cerrar notificaciones
function cerrarNotificacion(notificacion) {
    notificacion.classList.remove('mostrar');
    notificacion.classList.add('ocultar');
        
    // Eliminar después de la animación
    setTimeout(() => {
        if (notificacion && notificacion.parentNode) {
            notificacion.parentNode.removeChild(notificacion);
        }
    }, 300);
}

// Función para mostrar un indicador de carga
function mostrarCarga(mensaje) {
    // Ocultar cualquier notificación previa
    const notificaciones = document.querySelectorAll('.notificacion-apple');
    notificaciones.forEach(notif => {
        notif.classList.remove('mostrar');
        notif.classList.add('ocultar');
        setTimeout(() => notif.remove(), 300);
    });

    // Crear elemento de carga
    const carga = document.createElement('div');
    carga.className = 'notificacion-apple cargando';
    carga.innerHTML = `
        <div class="notificacion-contenido">
            <div class="notificacion-icono">
                <div class="spinner"></div>
            </div>
            <div class="notificacion-texto">
                <div class="notificacion-titulo">Procesando</div>
                <div class="notificacion-mensaje">${mensaje}</div>
            </div>
        </div>
    `;
    
    // Agregar al documento
    document.body.appendChild(carga);
    
    // Forzar reflow
    void carga.offsetWidth;
    
    // Mostrar con animación
    carga.classList.add('mostrar');
    
    // Retornar función para ocultar
    return function ocultarCarga() {
        carga.classList.remove('mostrar');
        carga.classList.add('ocultar');
        setTimeout(() => {
            if (carga && carga.parentNode) {
                carga.parentNode.removeChild(carga);
            }
        }, 300);
    };
}

// Función para mostrar mensajes al usuario
function mostrarMensaje(mensaje, tipo = 'info') {
    const mensajeElement = document.getElementById('mensaje-validacion');
    if (!mensajeElement) {
        console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
        return;
    }

    // Limpiar clases anteriores
    mensajeElement.className = 'alert';
    mensajeElement.classList.add(`alert-${tipo}`);
    
    // Establecer el mensaje
    mensajeElement.textContent = mensaje;
    mensajeElement.style.display = 'block';
    
    // Ocultar después de 5 segundos si es un mensaje informativo
    if (tipo === 'info' || tipo === 'success') {
        setTimeout(() => {
            mensajeElement.style.opacity = '0';
            setTimeout(() => {
                mensajeElement.style.display = 'none';
                mensajeElement.style.opacity = '1';
            }, 500);
        }, 5000);
    }
}

// Función para mostrar errores
function mostrarError(mensaje) {
    // Primero intentar con SweetAlert2 si está disponible
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#007AFF',
            customClass: {
                popup: 'swal2-modal-apple',
                confirmButton: 'apple-confirm-button'
            }
        });
    } 
    // Si no, intentar con jQuery
    else if (typeof $ !== 'undefined' && $('#errorMensaje').length) {
        const errorElement = $('#errorMensaje');
        errorElement.text(mensaje).fadeIn();
        setTimeout(() => errorElement.fadeOut(), 5000);
    } 
    // Si nada más está disponible, usar alert nativo
    else {
        alert(mensaje);
    }
}

/**
 * Valida el número de cliente ingresado
 */
function validarNumeroCliente(e) {
    e.preventDefault();
    
    const numeroCliente = document.getElementById('numeroCliente').value.trim();
    const errorElement = document.getElementById('errorCliente');
    
    console.log('Validando número de cliente:', numeroCliente);
    console.log('Base de datos de clientes:', window.clientesDB);
    
    // Validar que el campo no esté vacío
    if (!numeroCliente) {
        errorElement.textContent = 'Por favor ingresa tu número de cliente';
        errorElement.style.display = 'block';
        return false;
    }
    
    // Validar formato (5-6 dígitos)
    if (!/^\d{5,6}$/.test(numeroCliente)) {
        errorElement.textContent = 'Por favor ingresa un número de cliente válido (5-6 dígitos)';
        errorElement.style.display = 'block';
        return false;
    }
    
    // Verificar si la base de datos de clientes está disponible
    if (!window.clientesDB) {
        console.error('Error: La base de datos de clientes no está disponible');
        errorElement.textContent = 'Error al validar el número de cliente. Por favor, recarga la página e intenta nuevamente.';
        errorElement.style.display = 'block';
        return false;
    }
    
    // Buscar el cliente en la base de datos
    console.log('Buscando cliente con número:', numeroCliente);
    console.log('Base de datos de clientes:', window.clientesDB);
    
    const clienteEncontrado = window.clientesDB[numeroCliente];
    console.log('Cliente encontrado:', clienteEncontrado);
    
    if (clienteEncontrado) {
        // Cliente encontrado
        errorElement.style.display = 'none';
        
        // Asegurarse de que el ID del cliente esté presente
        if (!clienteEncontrado.id) {
            clienteEncontrado.id = numeroCliente; // Usar el número de cliente como ID si no hay uno
        }
        
        // Actualizar el estado global
        if (window.estadoAplicacion) {
            window.estadoAplicacion.cliente = clienteEncontrado;
            window.estadoAplicacion.datosFormulario = window.estadoAplicacion.datosFormulario || {};
            window.estadoAplicacion.datosFormulario.numeroCliente = numeroCliente;
            
            console.log('Estado actualizado con el cliente:', window.estadoAplicacion);
            console.log('ID del cliente a enviar:', window.estadoAplicacion.cliente.id);
            
            // Mostrar mensaje de bienvenida con el objeto completo del cliente
            console.log('Mostrando mensaje de bienvenida...');
            mostrarMensajeBienvenida(window.estadoAplicacion.cliente);
            
            // Deshabilitar el campo de número de cliente
            const inputNumeroCliente = document.getElementById('numeroCliente');
            if (inputNumeroCliente) {
                inputNumeroCliente.disabled = true;
            }
            
            // Avanzar al siguiente paso
            window.estadoAplicacion.pasoActual = 2;
            actualizarInterfaz();
        }
        return true;
    } else {
        // Cliente no encontrado
        console.log('Cliente no encontrado en la base de datos');
        errorElement.textContent = 'Número de cliente no encontrado. Por favor, verifica el número o contacta a soporte si necesitas ayuda.';
        errorElement.style.display = 'block';
        return false;
    }
}

// Muestra el mensaje de bienvenida con el nombre completo del cliente
function mostrarMensajeBienvenida(cliente) {
    console.log('Mostrando mensaje de bienvenida para:', cliente);
    
    const contenedorBienvenida = document.getElementById('bienvenidaUsuario');
    if (!contenedorBienvenida) {
        console.error('No se encontró el contenedor de bienvenida');
        return;
    }
    
    if (!cliente) {
        console.error('No se proporcionó un objeto de cliente');
        contenedorBienvenida.style.display = 'none';
        return;
    }
    
    // Depuración: Mostrar todas las propiedades del cliente
    console.log('Propiedades del cliente:', Object.keys(cliente));
    
    // Manejar diferentes formatos de nombre
    let nombreMostrar = '';
    
    if (cliente.nombreCompleto) {
        // Si ya existe nombreCompleto, usarlo
        nombreMostrar = cliente.nombreCompleto;
    } else if (cliente.nombre) {
        // Si solo tenemos nombre, usarlo
        nombreMostrar = cliente.nombre;
        
        // Si hay apellidos, concatenarlos
        if (cliente.apellidoPaterno || cliente.apellidoMaterno) {
            nombreMostrar = `${cliente.nombre} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim();
        }
    } else {
        // Si no hay nombre, mostrar un mensaje genérico
        nombreMostrar = 'Cliente';
    }
    
    console.log('Nombre a mostrar:', nombreMostrar);
    
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
    console.log('Mensaje de bienvenida mostrado');
}

/**
 * Muestra ayuda para encontrar el número de cliente
 */
function mostrarAyudaNumeroCliente() {
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
        showCloseButton: true,
        showClass: {
            popup: 'swal2-show',
            backdrop: 'swal2-backdrop-show',
            icon: 'swal2-icon-show'
        },
        hideClass: {
            popup: 'swal2-hide',
            backdrop: 'swal2-backdrop-hide',
            icon: 'swal2-icon-hide'
        }
    });
}

/**
 * Actualiza la interfaz según el paso actual
 */
function actualizarInterfaz() {
    // Obtener el estado actual
    const estadoActual = window.estadoAplicacion || {
        pasoActual: 1,
        cliente: null,
        clienteId: null,
        datosFormulario: {},
        archivoCargado: false,
        nombreArchivo: ''
    };
    
    console.log('Actualizando interfaz al paso:', estadoActual.pasoActual);
    
    // Ocultar todos los pasos
    const pasos = document.querySelectorAll('.paso');
    pasos.forEach(paso => {
        paso.style.display = 'none';
        paso.classList.remove('activo');
    });
    
    // Mostrar el paso actual sin el guion
    const pasoActual = document.getElementById(`paso${estadoActual.pasoActual}`);
    if (pasoActual) {
        pasoActual.style.display = 'block';
        pasoActual.classList.add('activo');
        
        // Desplazar al encabezado del módulo si existe
        setTimeout(() => {
            const moduloHeader = document.querySelector('.modulo-header');
            if (moduloHeader) {
                const headerOffset = 20; // Ajusta este valor según sea necesario
                const elementPosition = moduloHeader.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            } else {
                // Si no se encuentra el encabezado, ir al inicio de la página
             window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
    } else {
        console.error('No se encontró el paso:', estadoActual.pasoActual);
    }
    
    // Actualizar información del cliente si está disponible
    if (estadoActual.cliente) {
        const elementosNombre = document.querySelectorAll('.nombre-cliente');
        const elementosNumero = document.querySelectorAll('.numero-cliente');
        
        elementosNombre.forEach(elemento => {
            elemento.textContent = estadoActual.cliente.nombre || '';
        });
        
        elementosNumero.forEach(elemento => {
            elemento.textContent = estadoActual.datosFormulario.numeroCliente || '';
        });
    }
    
    // Si estamos en el paso 2, asegurarse de que el mensaje de bienvenida esté visible
    if (estadoActual.pasoActual === 2 && estadoActual.cliente) {
        console.log('Mostrando mensaje de bienvenida desde actualizarInterfaz');
        mostrarMensajeBienvenida(estadoActual.cliente);
        
        // No es necesario desplazarse al mensaje de bienvenida
        // ya que el desplazamiento principal ya se encarga de posicionar en el encabezado
    }
}

// Función para cambiar entre pasos
function mostrarPaso(numeroPaso) {
    // Actualizar el estado global
    if (window.estadoAplicacion) {
        window.estadoAplicacion.pasoActual = numeroPaso;
    }
    
    // Ocultar todos los pasos
    document.querySelectorAll('.paso').forEach(paso => {
        paso.classList.remove('activo');
    });
    
    // Mostrar el paso actual
    const pasoActual = document.getElementById(`paso${numeroPaso}`);
    if (pasoActual) {
        pasoActual.classList.add('activo');
        // Ajustar el scroll al inicio del formulario
        const moduloContent = document.querySelector('.modulo-content');
        if (moduloContent) {
            moduloContent.scrollTop = 0;
        }
    }
}

// Función para inicializar el módulo de cambio de contraseña
function initCambioContrasena() {
    console.log('Inicializando módulo de cambio de contraseña');
    
    // Mostrar solo el primer paso al inicio
    mostrarPaso(1);
    
    // Configurar el foco en el campo de número de cliente
    const inputNumeroCliente = document.getElementById('numeroCliente');
    if (inputNumeroCliente) {
        inputNumeroCliente.focus();
    }
    
    // Configurar el manejador del formulario de identificación
    const formulario = document.getElementById('identificacionForm');
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            validarNumeroCliente(e);
        });
    }
    
    // Configurar el botón de ayuda
    const botonAyuda = document.getElementById('mostrarAyuda');
    if (botonAyuda) {
        botonAyuda.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarAyudaNumeroCliente();
        });
    }
    
    // Manejador para el botón de no tener número de cliente
    const botonNoTengoNumero = document.getElementById('noTengoNumero');
    if (botonNoTengoNumero) {
        botonNoTengoNumero.addEventListener('click', function(e) {
            e.preventDefault();
            if (typeof addMessage === 'function') {
                addMessage('Por favor, comunícate con nuestro equipo de soporte al 800-123-4567 para obtener tu número de cliente.', false);
            } else {
                Swal.fire({
                    title: 'Atención',
                    text: 'Por favor, comunícate con nuestro equipo de soporte al 800-123-4567 para obtener tu número de cliente.',
                    icon: 'info',
                    confirmButtonText: 'Entendido',
                    confirmButtonColor: '#007AFF',
                    customClass: {
                        popup: 'swal2-modal-apple',
                        confirmButton: 'apple-confirm-button'
                    }
                });
            }
        });
    }
    
    // Manejador para el botón de siguiente en el paso 2
    $(document).on('click', '#btnSiguiente2', function() {
        const redSeleccionada = $('#redWifi').val();
        if (redSeleccionada) {
            estado.pasoActual = 3;
            actualizarInterfaz();
        }
    });
    
    // Manejador para el botón de atrás en el paso 2
    $(document).on('click', '#btnAtras2', function() {
        estado.pasoActual = 1;
        actualizarInterfaz();
    });
    
    // Manejador para el botón de atrás en el paso 3
    $(document).on('click', '#btnAtras3', function() {
        estado.pasoActual = 2;
        actualizarInterfaz();
    });
    
    // Manejador para el botón de mostrar/ocultar contraseña
    $(document).on('click', '.toggle-password', function() {
        const passwordField = $(this).closest('.input-group').find('input');
        const icon = $(this).find('i');
        
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            icon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            icon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    });
    
    // Manejador para el formulario de nueva contraseña
    $(document).on('submit', '#formNuevaContrasena', function(e) {
        e.preventDefault();
        
        // Validar que las contraseñas coincidan
        const nuevaContrasena = $('#nuevaContrasena').val();
        const confirmarContrasena = $('#confirmarContrasena').val();
        
        if (nuevaContrasena !== confirmarContrasena) {
            $('#contrasenaError').text('Las contraseñas no coinciden').show();
            return;
        }
        
        // Aquí iría la lógica para enviar la nueva contraseña al servidor
        // Por ahora, simulamos un envío exitoso
        estado.pasoActual = 4;
        actualizarInterfaz();
    });
    
    // Manejador para el botón de confirmar en el paso 4
    $(document).on('click', '#btnConfirmar', function() {
        // Aquí iría la lógica para confirmar el cambio de contraseña
        estado.pasoActual = 5;
        actualizarInterfaz();
        
        // Ocultar el mensaje de éxito después de 5 segundos
        setTimeout(function() {
            // Aquí podrías redirigir al usuario o limpiar el formulario
            if (typeof addMessage === 'function') {
                addMessage('Tu contraseña ha sido cambiada exitosamente. ¿En qué más puedo ayudarte?', false);
            }
            // Limpiar el formulario
            $('#identificacionForm')[0].reset();
            $('#formNuevaContrasena')[0].reset();
            // Volver al paso 1
            $('.paso').hide();
            $('#paso1').show();
        }, 5000);
    });
}

// Configurar la funcionalidad de arrastrar y soltar
function configurarArrastreYSoltar() {
    const zonaArrastre = document.getElementById('zonaArrastre');
    const inputArchivo = document.getElementById('inputArchivo');
    
    if (!zonaArrastre || !inputArchivo) return;
    
    // Prevenir comportamientos por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        zonaArrastre.addEventListener(eventName, prevenirComportamiento, false);
    });
    
    // Resaltar la zona cuando el archivo está sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        zonaArrastre.addEventListener(eventName, resaltarZona, false);
    });
    
    // Quitar resaltado cuando el archivo sale de la zona
    ['dragleave', 'drop'].forEach(eventName => {
        zonaArrastre.addEventListener(eventName, quitarResaltado, false);
    });
    
    // Manejar el archivo soltado
    zonaArrastre.addEventListener('drop', manejarSoltado, false);
    
    // Manejar la selección de archivo
    inputArchivo.addEventListener('change', manejarSeleccionArchivo, false);
}

// Inicializar el módulo cuando el contenido esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Configurar arrastrar y soltar
    configurarArrastreYSoltar();
    
    // Verificar si el contenedor ya está en el DOM
    if (document.querySelector('.modulo-container')) {
        initCambioContrasena();
    } else {
        // Si no está en el DOM, configurar un observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1 && node.matches('.modulo-container')) {
                            initCambioContrasena();
                            observer.disconnect();
                            return;
                        }
                    }
                }
            });
        });

        // Comenzar a observar el documento con los parámetros configurados
        observer.observe(document.body, { childList: true, subtree: true });
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el contenedor ya está en el DOM
    if (document.querySelector('.modulo-container')) {
        initCambioContrasena();
    } else {
        // Si no está en el DOM, configurar un observador
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === 1 && node.matches('.modulo-container')) {
                            initCambioContrasena();
                            observer.disconnect();
                            return;
                        }
                    }
                }
            });
        });

        // Comenzar a observar el documento con los parámetros configurados
        observer.observe(document.body, { childList: true, subtree: true });
    }
});
})(); // Cierre de la función autoinvocada
