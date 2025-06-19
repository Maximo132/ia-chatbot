// Variables globales
let stream = null;
let animationTimeline = null;
let isFaceIDActive = false;
let recognitionInterval = null;
let video = null;
let canvas = null;
let ctx = null;
let streaming = false;
let faceidStatus = null;
let faceidSubtext = null;
let btnTomarFoto = null;
let btnCerrar = null;
let faceidDots = null;
let faceidContainer = null;
let dots = [];
let facePositionIndicator = null;
let isProcessing = false;
let faceDetector = null;
let faceCascade = null;
let opencvReady = false;
let lastFacePosition = { x: 0, y: 0, width: 0, height: 0 };
let faceInPosition = false;
let faceInPositionStartTime = 0;
let autoCaptureTimer = null;
let isAutoCaptureInProgress = false;
let modoSoloCaptura = true; // Modo para solo capturar sin detección de rostros

// Configuración
const DETECTION_INTERVAL = 300; // ms
const FACE_POSITION_THRESHOLD = 20; // px de margen para considerar el rostro centrado
const FACE_SIZE_THRESHOLD = 0.3; // Tamaño mínimo del rostro respecto al círculo
const FACE_HOLD_TIME = 1000; // ms que el rostro debe estar en posición para capturar
const SUCCESS_DELAY = 1500; // ms
const CIRCLE_RADIUS = 120; // Radio del círculo de detección en píxeles
const CIRCLE_CENTER = { x: 320, y: 240 }; // Centro del círculo (ajustar según diseño)

// Variables para el seguimiento de la rotación de la cabeza
let lastHeadRotationPosition = { x: 0, y: 0 };
let rotationProgress = 0;
let isRotating = false;
let rotationStartTime = 0;
const ROTATION_THRESHOLD = 10;
const ROTATION_COMPLETE_TIME = 3000;

/**
 * Crea los puntos de guía para la rotación de la cabeza
 */
function crearPuntosGuia() {
    try {
        console.log('Creando puntos de guía...');
        
        // Verificar si faceidDots existe
        if (!faceidDots) {
            console.warn('No se encontró el contenedor de puntos de guía');
            faceidDots = document.getElementById('faceidDots');
            
            if (!faceidDots) {
                console.error('No se pudo encontrar el contenedor de puntos de guía');
                return;
            }
        }
        
        // Limpiar puntos existentes
        faceidDots.innerHTML = '';
        
        const dotCount = 4; // Solo necesitamos 4 puntos fijos
        const positions = [
            { top: '20%', left: '50%' },  // Arriba
            { top: '50%', left: '20%' },  // Izquierda
            { top: '80%', left: '50%' },  // Abajo
            { top: '50%', left: '80%' }   // Derecha
        ];
        
        positions.forEach((pos, i) => {
            const dot = document.createElement('div');
            dot.className = 'faceid-dot';
            dot.dataset.angle = i * 90; // 0°, 90°, 180°, 270°
            dot.style.top = pos.top;
            dot.style.left = pos.left;
            faceidDots.appendChild(dot);
        });
        
        console.log('Puntos de guía creados correctamente');
    } catch (error) {
        console.error('Error al crear puntos de guía:', error);
    }
}

/**
 * Actualiza los puntos de guía según el progreso de la rotación
 * @param {number} progress - Progreso de la rotación (0 a 1)
 */
function actualizarPuntosGuia(progress) {
    const dots = document.querySelectorAll('.faceid-dot');
    const activeCount = Math.ceil(progress * dots.length);
    
    dots.forEach((dot, index) => {
        if (index < activeCount) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

/**
 * Inicializa la cámara y comienza la transmisión de video
 */
/**
 * Función auxiliar para esperar a que un elemento esté disponible en el DOM
 */
function esperarElemento(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Tiempo de espera agotado para el selector: ${selector}`));
            } else {
                setTimeout(checkElement, 100);
            }
        };
        checkElement(); 
    });
}

async function inicializarCamara() {
    try {
        console.log('Inicializando cámara...');
        
        // Esperar a que los elementos del DOM estén disponibles
        try {
            video = document.querySelector('#video');
            canvas = document.querySelector('#canvas');
            
            if (!video || !canvas) {
                throw new Error('Elementos video o canvas no encontrados');
            }
            
            console.log('Elementos del DOM encontrados:', { video, canvas });
            
            // Configurar dimensiones
            video.width = 640;
            video.height = 480;
            canvas.width = 640;
            canvas.height = 480;
            
            // Inicializar contexto del canvas
            ctx = canvas.getContext('2d');
            
        } catch (error) {
            console.error('Error al buscar elementos del DOM:', error);
            throw new Error('No se encontraron los elementos de video o canvas en la página. Asegúrate de que el HTML se haya cargado correctamente.');
        }
        
        ctx = canvas.getContext('2d');
        
        // Mostrar mensaje de estado
        actualizarUI('Iniciando cámara...', 'Solicitando acceso a la cámara', false);
        
        // Verificar si el navegador soporta getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Tu navegador no soporta el acceso a la cámara o está desactualizado');
        }
        
        // Verificar permisos de la cámara
        let stream;
        try {
            // Primero intentar con la cámara trasera (puede que no esté disponible en todos los dispositivos)
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'  // Primero intentar con la cámara trasera
                },
                audio: false
            });
        } catch (rearCameraError) {
            console.log('No se pudo acceder a la cámara trasera, intentando con la frontal...', rearCameraError);
            
            // Si falla, intentar con la cámara frontal
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user'  // Cámara frontal
                    },
                    audio: false
                });
            } catch (frontCameraError) {
                console.error('Error al acceder a la cámara frontal:', frontCameraError);
                throw new Error('No se pudo acceder a ninguna cámara. Asegúrate de que la cámara esté conectada y los permisos estén habilitados.');
            }
        }
        
        // Configurar el stream de video
        video.srcObject = stream;
        
        // Esperar a que el video esté listo para reproducir
        await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                video.play().then(resolve).catch(reject);
            };
            video.onerror = reject;
            
            // Timeout por si el video no se carga
            setTimeout(() => {
                if (!streaming) {
                    reject(new Error('Tiempo de espera agotado al cargar el video'));
                }
            }, 5000);
        });
        
        // Cuando el video esté listo
        streaming = true;
        actualizarUI('Cámara lista', 'Presiona el botón para tomar la foto', true);
        
        return true;
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        
        let mensajeError = 'No se pudo acceder a la cámara. ';
        
        // Mensajes de error más específicos
        if (error.name === 'NotAllowedError') {
            mensajeError = 'Permiso denegado. Por favor, permite el acceso a la cámara en la configuración de tu navegador.';
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            mensajeError = 'No se encontró ninguna cámara disponible. Asegúrate de que la cámara esté conectada.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            mensajeError = 'La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que puedan estar usando la cámara.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
            mensajeError = 'No se pudo configurar la cámara con los parámetros solicitados. Intenta con una resolución más baja.';
        } else if (error.message.includes('timeout')) {
            mensajeError = 'Tiempo de espera agotado al intentar acceder a la cámara. Intenta recargar la página.';
        } else {
            mensajeError = `Error: ${error.message || 'Error desconocido al acceder a la cámara'}`;
        }
        
        actualizarUI('Error', mensajeError, false);
        
        // Mostrar botón de reintento
        const botonReintentar = document.createElement('button');
        botonReintentar.textContent = 'Reintentar';
        botonReintentar.className = 'btn-reintentar';
        botonReintentar.onclick = () => window.location.reload();
        
        const contenedorMensaje = document.querySelector('.faceid-message');
        if (contenedorMensaje) {
            contenedorMensaje.appendChild(document.createElement('br'));
            contenedorMensaje.appendChild(botonReintentar);
        }
        
        throw new Error(mensajeError);
    }
}

/**
 * Inicia la detección de rostros en el video (desactivada)
 */
function iniciarDeteccionRostros() {
    // No hacer nada, la detección está desactivada
    console.log('Detección de rostros desactivada');
}

/**
 * Toma una foto del video y la envía para su procesamiento
 */
async function tomarFoto() {
    try {
        console.log('Iniciando captura de foto...');
        
        // Mostrar mensaje de procesamiento
        actualizarUI('Procesando...', 'Validando la imagen', false);
        
        // Pequeña pausa antes de capturar para estabilizar la imagen
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Crear un canvas temporal para la captura
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        
        // Dibujar el frame actual del video en el canvas
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // Validar iluminación básica primero
        if (!validarIluminacion(tempCtx, tempCanvas.width, tempCanvas.height)) {
            throw new Error('La imagen no tiene suficiente iluminación. Asegúrate de estar en un lugar bien iluminado.');
        }
        
        // Validar que haya un rostro con Face-API.js
        const validacion = await validarImagenConRostro(tempCanvas);
        if (!validacion.valido) {
            throw new Error(validacion.mensaje || 'No se pudo validar la imagen. Por favor, inténtalo de nuevo.');
        }
        
        // Obtener la imagen en formato base64
        const imageData = tempCanvas.toDataURL('image/jpeg', 0.8);
        
        if (!imageData) {
            throw new Error('No se pudo capturar la imagen de la cámara');
        }
        
        console.log('Imagen capturada, tamaño:', imageData.length, 'bytes');
        
        // Mostrar mensaje de éxito
        actualizarUI('¡Listo!', 'Imagen capturada correctamente', true);
        
        // Mostrar la animación de confirmación
        const confirmationAnimation = document.getElementById('confirmation-animation');
        const faceIdWrapper = confirmationAnimation.querySelector('.face-id-wrapper');
        
        // Mostrar la animación
        confirmationAnimation.style.display = 'flex';
        faceIdWrapper.classList.add('active');
        
        // Esperar a que termine la animación
        await new Promise(resolve => {
            // Iniciar la animación de completado después de 1.7 segundos
            setTimeout(() => {
                faceIdWrapper.classList.add('completed');
                // Esperar a que termine la animación del check (0.6s)
                setTimeout(resolve, 800);
            }, 1700);
        });
        
        // Ocultar la animación
        confirmationAnimation.style.display = 'none';
        faceIdWrapper.classList.remove('active', 'completed');
        
        // Enviar la imagen de vuelta a la ventana principal
        if (window.opener) {
            try {
                console.log('Enviando imagen a la ventana principal...');
                
                // Enviar el mensaje a la ventana principal
                window.opener.postMessage({
                    type: 'FOTO_TOMADA',
                    imageData: imageData,
                    timestamp: Date.now()
                }, window.location.origin);
                
                console.log('Imagen enviada correctamente');
                
            } catch (error) {
                console.error('Error al enviar la imagen:', error);
                throw new Error('Error al procesar la imagen. Por favor, inténtalo de nuevo.');
            }
        } else {
            console.warn('No se encontró la ventana principal');
            throw new Error('Error de conexión con la ventana principal');
        }
        
    } catch (error) {
        console.error('Error al tomar la foto:', error);
        mostrarError(error.message || 'Ocurrió un error al validar tu rostro');
        
        // Pequeño retraso antes de reiniciar la detección
        setTimeout(() => {
            try {
                if (!isProcessing) {  // Solo si no hay otro proceso en curso
                    iniciarDeteccionContinua();
                }
            } catch (e) {
                console.error('Error al reiniciar la detección:', e);
            }
        }, 2000);
        
        // No relanzar el error para evitar bucles infinitos
    } finally {
        isProcessing = false;
    }
}

/**
 * Detecta si hay un rostro en una imagen estática
 */
async function detectarRostroEnImagen(imagen) {
    if (!faceDetector) {
        const inicializado = await inicializarDetectorRostros();
        if (!inicializado) {
            console.warn('No se pudo inicializar el detector de rostros');
            return false;
        }
    }

    try {
        // Crear un canvas temporal
        const canvas = document.createElement('canvas');
        canvas.width = imagen.width;
        canvas.height = imagen.height;
        const ctx = canvas.getContext('2d');
        
        // Dibujar la imagen en el canvas
        ctx.drawImage(imagen, 0, 0, canvas.width, canvas.height);
        
        // Detectar rostros
        const faces = await faceDetector.detect(canvas);
        
        // Verificar si se detectó al menos un rostro
        return faces && faces.length > 0;
    } catch (error) {
        console.error('Error al detectar rostro en imagen:', error);
        return false;
    }
}

/**
 * Cierra la cámara y limpia los recursos
 */
function cerrarCamara() {
    console.log('Cerrando cámara...');
    
    // Detener la detección de caras
    detenerDeteccionContinua();
    
    // Detener la transmisión de la cámara
    if (stream) {
        try {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log('Track detenido:', track.kind);
            });
            stream = null;
        } catch (error) {
            console.error('Error al detener la transmisión:', error);
        }
    }
    
    // Limpiar el elemento de video
    if (video) {
        try {
            video.pause();
            video.srcObject = null;
            video.load(); // Forzar recarga del elemento
        } catch (error) {
            console.error('Error al limpiar el video:', error);
        }
    }
    
    // Limpiar el indicador de posición
    if (facePositionIndicator && facePositionIndicator.parentNode) {
        try {
            facePositionIndicator.parentNode.removeChild(facePositionIndicator);
        } catch (error) {
            console.error('Error al eliminar el indicador de posición:', error);
        }
    }
    
    console.log('Cámara cerrada correctamente');
}

/**
 * Muestra un mensaje de error en la interfaz
 * @param {string} mensaje - Mensaje de error a mostrar
 */
function mostrarError(mensaje) {
    faceidStatus.textContent = 'Error';
    faceidSubtext.textContent = mensaje;
    faceidStatus.style.color = '#ff3b30';
    
    // Restaurar después de 3 segundos
    setTimeout(() => {
        faceidStatus.textContent = 'Coloca tu rostro en el círculo';
        faceidSubtext.textContent = 'Asegúrate de tener buena iluminación';
        faceidStatus.style.color = '';
    }, 3000);
}

// Función para actualizar la interfaz de usuario
function actualizarUI(estado, subtexto, esExito = false) {
    if (!faceidStatus || !faceidSubtext || !faceidContainer) return;
    
    faceidStatus.textContent = estado;
    faceidSubtext.textContent = subtexto;
    
    // Actualizar clases según el estado
    faceidContainer.className = 'faceid-container';
    if (esExito) {
        faceidContainer.classList.add('faceid-success');
    } else if (estado.includes('Error') || estado.includes('error')) {
        faceidContainer.classList.add('faceid-error');
    } else if (estado.includes('Ajusta') || estado.includes('Mueve')) {
        faceidContainer.classList.add('faceid-warning');
    }
}

// Control de la animación Face ID
function initFaceIDAnimation() {
    const startBtn = document.getElementById('start-face-id');
    const faceIDContainer = document.getElementById('face-id-setup-container');
    const face = document.getElementById('face');
    const loading = document.getElementById('loading');
    
    if (!startBtn) return;
    
    startBtn.addEventListener('click', async () => {
        console.log('Iniciando animación Face ID...');
        
        // Animación de inicio
        startBtn.disabled = true;
        startBtn.textContent = 'Iniciando...';
        
        // Crear timeline de animación
        const tl = new TimelineMax({
            onComplete: async () => {
                faceIDContainer.style.display = 'none';
                isFaceIDActive = true;
                await inicializarCamara();
            }
        });
        
        // Animación de carga
        tl.to(loading, 0.5, { opacity: 1 })
          .to(face, 0.5, { opacity: 1 }, '-=0.3')
          .to(loading, 1, { rotation: 360, transformOrigin: 'center', repeat: 1, ease: Linear.easeNone }, '-=0.3')
          .to(loading, 0.5, { opacity: 0 })
          .to(face, 0.5, { scale: 1.1, y: 20, repeat: 1, yoyo: true, ease: Power1.easeInOut });
    });
}

// Función para inicializar la aplicación
async function inicializarAplicacion() {
    try {
        console.log('Inicializando aplicación...');
        
        // Inicializar referencias al DOM
        faceidStatus = document.getElementById('faceidStatus');
        faceidSubtext = document.getElementById('faceidSubtext');
        btnTomarFoto = document.getElementById('btnTomarFoto');
        btnCerrar = document.getElementById('btnCerrar');
        faceidDots = document.getElementById('faceidDots');
        faceidContainer = document.querySelector('.faceid-container');
        dots = Array.from(document.querySelectorAll('.faceid-dot'));
        
        // Inicializar indicador de posición de la cara
        facePositionIndicator = document.createElement('div');
        facePositionIndicator.id = 'facePositionIndicator';
        document.body.appendChild(facePositionIndicator);
        
        // Mostrar mensaje de carga
        actualizarUI('Iniciando...', 'Cargando módulos de seguridad', false);
        
        // Cargar modelos de detección facial
        console.log('Cargando modelos de detección facial...');
        const modelosCargados = await cargarModelosDeteccion();
        
        if (!modelosCargados) {
            console.warn('No se pudieron cargar los modelos de detección facial');
            actualizarUI('Error', 'No se pudieron cargar los módulos de seguridad. Por favor, recarga la página.', false);
            return false;
        }
        
        // Cargar OpenCV como respaldo
        console.log('Inicializando OpenCV...');
        try {
            await cargarOpenCV();
        } catch (error) {
            console.warn('No se pudo cargar OpenCV, algunas funciones podrían estar limitadas:', error);
        }
        
        // Inicializar el botón de captura
        if (btnTomarFoto) {
            btnTomarFoto.addEventListener('click', async () => {
                if (!isProcessing) {
                    try {
                        await tomarFoto();
                    } catch (error) {
                        console.error('Error al tomar la foto:', error);
                        mostrarError('Error al capturar la foto. Intenta de nuevo.');
                    }
                } else {
                    console.log('Ya hay una captura en proceso');
                }
            });
        }
        
        // Inicializar el botón de cierre
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => {
                cerrarCamara();
                window.close();
            });
        }
        
        // Iniciar la cámara
        console.log('Iniciando cámara...');
        await inicializarCamara();
        
        // Iniciar detección continua
        iniciarDeteccionContinua();
        
        return true;
        
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        actualizarUI('Error', 'Error al inicializar la aplicación. Por favor, recarga la página.', false);
        return false;
    }
}

/**
 * Valida que la imagen tenga suficiente iluminación
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} width - Ancho del canvas
 * @param {number} height - Alto del canvas
 * @returns {boolean} - True si la iluminación es adecuada
 */
function validarIluminacion(ctx, width, height) {
    // Tomar una muestra de la imagen (no es necesario analizar todos los píxeles)
    const sampleSize = 2000; // Aumentamos el tamaño de la muestra
    const xStep = Math.max(1, Math.floor(width / Math.sqrt(sampleSize)));
    const yStep = Math.max(1, Math.floor(height / Math.sqrt(sampleSize)));
    
    let totalLuminance = 0;
    let pixelCount = 0;
    let darkPixelCount = 0;
    let brightPixelCount = 0;
    let minR = 255, minG = 255, minB = 255;
    let maxR = 0, maxG = 0, maxB = 0;
    
    // Analizar píxeles en una cuadrícula
    for (let y = 0; y < height; y += yStep) {
        for (let x = 0; x < width; x += xStep) {
            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];
            
            // Actualizar valores mínimos y máximos
            minR = Math.min(minR, r);
            minG = Math.min(minG, g);
            minB = Math.min(minB, b);
            maxR = Math.max(maxR, r);
            maxG = Math.max(maxG, g);
            maxB = Math.max(maxB, b);
            
            // Calcular luminosidad (fórmula estándar para convertir RGB a luminosidad)
            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            
            // Contar píxeles oscuros y brillantes
            if (luminance < 0.1) darkPixelCount++;
            if (luminance > 0.8) brightPixelCount++;
            
            totalLuminance += luminance;
            pixelCount++;
        }
    }
    
    const averageLuminance = totalLuminance / pixelCount;
    const darkPixelRatio = darkPixelCount / pixelCount;
    const brightPixelRatio = brightPixelCount / pixelCount;
    const contrast = (maxR + maxG + maxB - minR - minG - minB) / 3 / 255;
    
    console.log('Validación de imagen:', {
        luminosidadPromedio: averageLuminance,
        proporcionOscuros: darkPixelRatio,
        proporcionBrillantes: brightPixelRatio,
        contraste: contrast
    });
    
    // Condiciones de rechazo:
    // 1. Demasiados píxeles oscuros (cámara tapada)
    if (darkPixelRatio > 0.85) {
        console.log('Imagen rechazada: Demasiados píxeles oscuros (cámara tapada)');
        return false;
    }
    
    // 2. Demasiados píxeles brillantes (sobrexposición)
    if (brightPixelRatio > 0.9) {
        console.log('Imagen rechazada: Demasiados píxeles brillantes (sobrexposición)');
        return false;
    }
    
    // 3. Contraste muy bajo (imagen plana)
    if (contrast < 0.1) {
        console.log('Imagen rechazada: Contraste demasiado bajo');
        return false;
    }
    
    // 4. Luminosidad promedio fuera de rango
    const minLuminance = 0.15;
    const maxLuminance = 0.9;
    
    if (averageLuminance < minLuminance || averageLuminance > maxLuminance) {
        console.log('Imagen rechazada: Luminosidad fuera de rango');
        return false;
    }
    
    // Si pasa todas las validaciones
    return true;
}

/**
 * Valida que haya al menos un rostro en la imagen
 * @param {HTMLCanvasElement} canvas - Canvas con la imagen a validar
 * @returns {Promise<boolean>} - True si se detecta al menos un rostro
 */
async function validarRostro(canvas) {
    try {
        // Usar la API de FaceDetector si está disponible
        if ('FaceDetector' in window) {
            const faceDetector = new FaceDetector({
                maxDetectedFaces: 1,
                fastMode: true
            });
            
            try {
                const faces = await faceDetector.detect(canvas);
                return faces.length > 0;
            } catch (e) {
                console.warn('Error al detectar rostros con FaceDetector:', e);
                // Continuar con OpenCV si falla
            }
        }
        
        // Usar OpenCV como respaldo
        if (window.cv) {
            const src = cv.imread(canvas);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            
            // Cargar el clasificador de rostros frontal
            const faceCascade = new cv.CascadeClassifier();
            const faceCascadeFile = 'haarcascade_frontalface_default.xml';
            
            // Cargar el clasificador (debe estar en la ruta correcta)
            faceCascade.load(faceCascadeFile);
            
            // Detectar rostros
            const faces = new cv.RectVector();
            const msize = new cv.Size(0, 0);
            faceCascade.detectMultiScale(gray, faces, 1.1, 3, 0, msize, msize);
            
            // Liberar memoria
            src.delete();
            gray.delete();
            faceCascade.delete();
            faces.delete();
            
            return faces.size() > 0;
        }
        
        // Si no hay ningún método de detección disponible, asumir que la validación es exitosa
        console.warn('No se pudo cargar ningún método de detección de rostros');
        return true;
        
    } catch (error) {
        console.error('Error en la validación de rostro:', error);
        return false;
    }
}

// Variables globales
let faceDetectionModelLoaded = false;
let faceDetectionInProgress = false;

/**
 * Carga los modelos de Face-API.js
 */
async function cargarModelosDeteccion() {
    try {
        console.log('Cargando modelos de detección facial...');
        
        // Cargar los modelos necesarios (versión ligera para mejor rendimiento)
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/static/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/static/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/static/models')
        ]);
        
        console.log('Modelos de detección facial cargados correctamente');
        faceDetectionModelLoaded = true;
        return true;
    } catch (error) {
        console.error('Error al cargar los modelos de detección facial:', error);
        faceDetectionModelLoaded = false;
        return false;
    }
}

/**
 * Valida que la imagen contenga un rostro con suficiente claridad y tamaño
 * @param {HTMLCanvasElement} canvas - Canvas con la imagen a validar
 * @returns {Promise<{valido: boolean, mensaje?: string}>} - Resultado de la validación
 */
async function validarImagenConRostro(canvas) {
    if (!faceDetectionModelLoaded) {
        console.warn('Modelos de detección facial no cargados, omitiendo validación');
        return { valido: false, mensaje: 'Error en la validación de seguridad' };
    }

    try {
        // Detectar todas las caras en la imagen
        const detecciones = await faceapi.detectAllFaces(
            canvas, 
            new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,  // Tamaño de entrada más pequeño para mejor rendimiento
                scoreThreshold: 0.4  // Umbral de confianza más estricto
            })
        ).withFaceLandmarks();

        console.log('Detecciones de rostros:', detecciones);

        // Verificar que se detectó exactamente un rostro
        if (detecciones.length === 0) {
            return { 
                valido: false, 
                mensaje: 'No se detectó ningún rostro en la imagen. Por favor, asegúrate de que tu rostro sea claramente visible.' 
            };
        }

        if (detecciones.length > 1) {
            return { 
                valido: false, 
                mensaje: 'Se detectó más de un rostro. Por favor, asegúrate de que solo aparezcas tú en la imagen.' 
            };
        }

        const deteccion = detecciones[0];
        
        // Verificar el tamaño del rostro (debe ocupar al menos el 15% de la imagen)
        const box = deteccion.detection.box;
        const areaRostro = box.width * box.height;
        const areaImagen = canvas.width * canvas.height;
        const proporcionRostro = areaRostro / areaImagen;
        
        console.log('Proporción del rostro en la imagen:', proporcionRostro);
        
        if (proporcionRostro < 0.1) {
            return { 
                valido: false, 
                mensaje: 'El rostro detectado es demasiado pequeño. Por favor, acércate más a la cámara.' 
            };
        }
        
        // Verificar la claridad del rostro usando los landmarks
        const landmarks = deteccion.landmarks;
        const ojos = landmarks.getLeftEye().concat(landmarks.getRightEye());
        
        // Calcular la distancia entre los ojos como referencia de claridad
        const ojoIzquierdo = ojos[0];
        const ojoDerecho = ojos[3];
        const distanciaOjos = Math.sqrt(
            Math.pow(ojoDerecho.x - ojoIzquierdo.x, 2) + 
            Math.pow(ojoDerecho.y - ojoIzquierdo.y, 2)
        );
        
        // Si la distancia es muy pequeña, la imagen podría estar desenfocada
        if (distanciaOjos < 30) {
            return { 
                valido: false, 
                mensaje: 'La imagen está desenfocada. Por favor, mantén la cámara estable.' 
            };
        }
        
        // Verificar la orientación del rostro
        const angulo = Math.atan2(
            ojoDerecho.y - ojoIzquierdo.y,
            ojoDerecho.x - ojoIzquierdo.x
        ) * 180 / Math.PI;
        
        if (Math.abs(angulo) > 20) {
            return { 
                valido: false, 
                mensaje: 'Por favor, mira directamente a la cámara.' 
            };
        }
        
        // Si pasa todas las validaciones
        return { valido: true };
        
    } catch (error) {
        console.error('Error en la validación de la imagen:', error);
        return { 
            valido: false, 
            mensaje: 'Error al procesar la imagen. Por favor, inténtalo de nuevo.' 
        };
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async () => {
    // Iniciar la aplicación dentro de un IIFE asíncrono
    (async () => {
        try {
            await inicializarAplicacion();
            
            // Iniciar la cámara después de la inicialización
            try {
                await iniciarCamara();
                console.log('Cámara iniciada correctamente');
                // Iniciar detección de caras después de que la cámara esté lista
                iniciarDeteccionCara();
            } catch (error) {
                console.error('Error al iniciar la cámara:', error);
                mostrarError('No se pudo acceder a la cámara: ' + error.message);
            }
        } catch (error) {
            console.error('Error no manejado en la inicialización:', error);
            mostrarError('Error crítico. Por favor recarga la página.');
        }
    })();
    
    // Cargar GSAP si no está disponible
    if (typeof TweenMax === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js';
        script.onload = initFaceIDAnimation;
        document.head.appendChild(script);
    } else {
        initFaceIDAnimation();
    }
    console.log('DOM cargado, iniciando...');
    
    // Inicializar elementos de la interfaz
    video = document.getElementById('video');
    faceidStatus = document.getElementById('faceidStatus');
    
    // Configurar cámara y animación
    const startBtn = document.getElementById('start-face-id');
    const faceIDContainer = document.getElementById('face-id-setup-container');
    
    // Mostrar la interfaz de Face ID si está presente
    if (faceIDContainer) {
        faceIDContainer.style.display = 'flex';
    }
    
    // Inicializar animación Face ID
    initFaceIDAnimation();
    
    // Si no hay botón de inicio, ocultar el contenedor
    if (!startBtn && faceIDContainer) {
        faceIDContainer.style.display = 'none';
    }
    faceidSubtext = document.getElementById('faceidSubtext');
    btnTomarFoto = document.getElementById('btnTomarFoto');
    btnCerrar = document.getElementById('btnCerrar');
    faceidDots = document.getElementById('faceidDots');
    faceidContainer = document.querySelector('.faceid-container');
    
    console.log('Elementos de la interfaz inicializados');
    // Configurar el botón de tomar foto
    if (btnTomarFoto) {
        // Remover cualquier event listener existente para evitar duplicados
        const newBtn = btnTomarFoto.cloneNode(true);
        btnTomarFoto.parentNode.replaceChild(newBtn, btnTomarFoto);
        btnTomarFoto = newBtn;
        
        btnTomarFoto.style.display = 'flex';
        
        // Configurar un solo event listener
        btnTomarFoto.addEventListener('click', async () => {
            if (isProcessing) return;
            isProcessing = true;
            try {
                await tomarFoto();
            } catch (error) {
                console.error('Error al tomar la foto:', error);
                mostrarError('Error al procesar la foto. Intenta de nuevo.');
            } finally {
                isProcessing = false;
            }
        });
    }
    
    btnCerrar.addEventListener('click', () => {
        cerrarCamara();
        // Notificar a la ventana principal que se canceló
        if (window.opener) {
            window.opener.postMessage({
                type: 'CANCELADO_POR_USUARIO'
            }, window.location.origin);
        }
    });
    // Hacer visible el círculo de Face ID
    
    const faceidCircle = document.querySelector('.faceid-circle');
    if (faceidCircle) {
        faceidCircle.style.display = 'block';
    }
    
    // Configurar estado inicial
    actualizarUI('Acerca tu rostro', 'Coloca tu cara dentro del área');
    
    // La cámara ahora se inicia en el IIFE principal
    
    // Configurar el evento beforeunload para limpiar recursos
    window.addEventListener('beforeunload', () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        if (recognitionInterval) {
            clearInterval(recognitionInterval);
        }
    });
});
