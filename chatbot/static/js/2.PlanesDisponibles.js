// Variable para rastrear si la ventana tiene el foco
let windowHasFocus = true;

// Escuchar eventos de cambio de foco de la ventana
window.addEventListener('blur', () => {
    windowHasFocus = false;
    // Desvoltear todas las tarjetas al perder el foco
    document.querySelectorAll('.plan-card.flipped').forEach(card => {
        card.classList.remove('flipped');
        card.style.pointerEvents = 'auto';
    });
});

window.addEventListener('focus', () => {
    windowHasFocus = true;
});

// Función para voltear una tarjeta
function flipCard(card) {
    console.log('=== flipCard llamado ===');
    console.log('Tarjeta:', card);
    
    if (!card) {
        console.error('Error: No se proporcionó una tarjeta para voltear');
        return;
    }
    
    // Solo permitir voltear la tarjeta activa
    if (!card.classList.contains('active')) {
        console.log('Info: La tarjeta no está activa, no se puede voltear');
        return;
    }
    
    // Verificar si la tarjeta ya está volteada
    const isFlipped = card.classList.contains('flipped');
    
    // Obtener el elemento interno para aplicar la transición
    const inner = card.querySelector('.plan-inner');
    if (!inner) {
        console.error('Error: No se encontró el elemento interno de la tarjeta');
        return;
    }
    
    // Desactivar temporalmente los eventos para prevenir múltiples clics
    card.style.pointerEvents = 'none';
    
    // Si hay otra tarjeta volteada en el mismo carrusel, desvoltearla primero
    const track = card.closest('.carousel-track');
    if (track) {
        const otherFlipped = track.querySelector('.plan-card.flipped:not(.initialized)');
        if (otherFlipped && otherFlipped !== card) {
            console.log('Acción: Desvolteando otra tarjeta primero');
            // Desvoltear la otra tarjeta suavemente
            const otherInner = otherFlipped.querySelector('.plan-inner');
            if (otherInner) {
                otherInner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                otherInner.style.transform = 'rotateY(0deg)';
                
                setTimeout(() => {
                    otherFlipped.classList.remove('flipped');
                    otherFlipped.style.pointerEvents = 'auto';
                }, 300);
            }
        }
    }
     
    // Configurar la transición
    inner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Forzar un reflow
    void card.offsetWidth;
    
    if (isFlipped) {
        console.log('Acción: Desvolteando tarjeta');
        // Voltear a la posición frontal
        inner.style.transform = 'rotateY(0deg)';
        // Quitar la clase después de la transición
        setTimeout(() => {
            card.classList.remove('flipped');
            card.style.pointerEvents = 'auto';
        }, 600);
    } else {
        console.log('Acción: Volteando tarjeta');
        // Agregar la clase para voltear
        card.classList.add('flipped');
        // Aplicar la rotación después de agregar la clase
        setTimeout(() => {
            inner.style.transform = 'rotateY(180deg)';
            card.style.pointerEvents = 'auto';
        }, 10);
    }
    
    // Verificar si la clase se aplicó correctamente
    setTimeout(() => {
        console.log('Verificación: La tarjeta tiene clase flipped?', card.classList.contains('flipped'));
    }, 100);
}

// Función para inicializar una tarjeta
function initCard(card) {
    console.log('Inicializando tarjeta:', card);
    
    if (!card) {
        console.error('Error: No se proporcionó una tarjeta para inicializar');
        return;
    }
    
    // Verificar si la tarjeta ya está inicializada
    if (card.classList.contains('initialized')) {
        console.log('La tarjeta ya está inicializada');
        return;
    }
    
    // Marcar la tarjeta como inicializada
    card.classList.add('initialized');
    
    // Configurar solo las propiedades necesarias para la animación
    const inner = card.querySelector('.plan-inner');
    const front = card.querySelector('.plan-front');
    const back = card.querySelector('.plan-back');
    
    // Configurar el contenedor interno solo con propiedades necesarias
    if (inner) {
        inner.style.transformStyle = 'preserve-3d';
        inner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        inner.style.backfaceVisibility = 'hidden';
        inner.style.webkitBackfaceVisibility = 'hidden';
    }
    
    // Configurar solo las propiedades necesarias para la cara frontal
    if (front) {
        front.style.backfaceVisibility = 'hidden';
        front.style.webkitBackfaceVisibility = 'hidden';
        front.style.transform = 'rotateY(0deg)';
    }
    
    // Configurar solo las propiedades necesarias para la cara trasera
    if (back) {
        back.style.backfaceVisibility = 'hidden';
        back.style.webkitBackfaceVisibility = 'hidden';
        back.style.transform = 'rotateY(180deg)';
    }
    
    // Agregar eventos de clic a la tarjeta
    card.removeEventListener('click', handleCardClick);
    card.addEventListener('click', handleCardClick);
    
    // Agregar eventos a los botones dentro de la tarjeta
    const buttons = card.querySelectorAll('button, a');
    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Establecer la interactividad basada en si la tarjeta está activa
    const isActive = card.classList.contains('active');
    card.style.pointerEvents = isActive ? 'auto' : 'none';
    
    // Asegurar que las tarjetas no estén volteadas por defecto
    if (!isActive) {
        card.classList.remove('flipped');
        if (inner) inner.style.transform = 'rotateY(0deg)';
    } else if (card.classList.contains('flipped') && inner) {
        inner.style.transform = 'rotateY(180deg)';
    }
    
    // Forzar un reflow para asegurar que los estilos se apliquen
    void card.offsetWidth;
}

// Manejador de clic para las tarjetas
function handleCardClick(e) {
    console.log('=== handleCardClick llamado ===');
    
    // No hacer nada si el clic proviene de un botón o enlace
    if (e.target.closest('button') || e.target.closest('a')) {
        console.log('Info: Clic en botón o enlace, ignorando...');
        return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    
    console.log('Elemento clickeado:', e.target);
    
    // Obtener la tarjeta en la que se hizo clic
    const card = this.closest('.plan-card');
    if (!card) {
        console.error('Error: No se pudo encontrar la tarjeta padre');
        return;
    }
    
    console.log('Tarjeta encontrada:', card);
    console.log('Clases de la tarjeta:', card.className);
    console.log('¿Es activa?', card.classList.contains('active'));
    
    // Verificar si la tarjeta es la activa
    if (!card.classList.contains('active')) {
        console.log('Info: La tarjeta no está activa, no se puede voltear');
        return;
    }
    
    // Verificar si la tarjeta ya está en proceso de animación
    if (card.style.pointerEvents === 'none') {
        console.log('Info: La tarjeta está en proceso de animación, ignorando clic');
        return;
    }
    
    console.log('Acción: Llamando a flipCard');
    
    // Voltear la tarjeta
    flipCard(card);
}

// Función para navegar entre tarjetas
function navigateCarousel(carousel, direction) {
    if (!carousel) return;
    
    const cards = Array.from(carousel.querySelectorAll('.plan-card'));
    if (cards.length === 0) return;
    
    const activeIndex = cards.findIndex(card => card.classList.contains('active'));
    let newIndex = direction === 'next' ? activeIndex + 1 : activeIndex - 1;
    
    // Manejar el bucle del carrusel
    if (newIndex >= cards.length) newIndex = 0;
    if (newIndex < 0) newIndex = cards.length - 1;
    
    // Actualizar clases activas y desactivar eventos en las inactivas
    cards.forEach((card, index) => {
        if (index === newIndex) {
            card.classList.add('active');
            card.style.pointerEvents = 'auto';
        } else {
            card.classList.remove('active');
            card.classList.remove('flipped');
            card.style.pointerEvents = 'none';
        }
    });
}

// Inicialización de categorías y carruseles
function initPlanesCarrusel() {
    try {
        console.log('Inicializando carrusel de planes...');
        
        // Mostrar el contenedor principal si está oculto
        const planesContainer = document.querySelector('.planes-container');
        if (planesContainer) {
            planesContainer.style.display = 'block';
            planesContainer.style.visibility = 'visible';
            planesContainer.style.opacity = '1';
            console.log('Contenedor de planes mostrado');
        }
        
        // Verificar si hay carruseles en la página
        const carousels = document.querySelectorAll('.planes-carousel');
        if (carousels.length === 0) {
            console.warn('No se encontraron carruseles en la página');
            return false;
        }
        
        console.log(`Encontrados ${carousels.length} carruseles`);
        
        // Inicializar primera tarjeta como activa en cada carrusel
        carousels.forEach((carousel, carouselIndex) => {
            try {
                const cards = carousel.querySelectorAll('.plan-card');
                console.log(`Carrusel ${carouselIndex + 1}: ${cards.length} tarjetas encontradas`);
                
                if (cards.length === 0) {
                    console.warn(`Carrusel ${carouselIndex + 1}: No se encontraron tarjetas`);
                    return; // Continuar con el siguiente carrusel
                }
                
                // Activar solo la primera tarjeta
                cards.forEach((card, index) => {
                    try {
                        if (index === 0) {
                            card.classList.add('active');
                            card.style.pointerEvents = 'auto';
                            console.log(`Activada tarjeta 1 en carrusel ${carouselIndex + 1}`);
                        } else {
                            card.classList.remove('active');
                            card.classList.remove('flipped');
                            card.style.pointerEvents = 'none';
                        }
                        
                        // Inicializar eventos de la tarjeta
                        initCard(card);
                        
                        // Forzar la aplicación de estilos 3D
                        const inner = card.querySelector('.plan-inner');
                        if (inner) {
                            inner.style.transformStyle = 'preserve-3d';
                            inner.style.backfaceVisibility = 'hidden';
                            inner.style.webkitBackfaceVisibility = 'hidden';
                        }
                        
                        const front = card.querySelector('.plan-front');
                        const back = card.querySelector('.plan-back');
                        
                        if (front) {
                            front.style.backfaceVisibility = 'hidden';
                            front.style.webkitBackfaceVisibility = 'hidden';
                        }
                        
                        if (back) {
                            back.style.backfaceVisibility = 'hidden';
                            back.style.webkitBackfaceVisibility = 'hidden';
                            back.style.transform = 'rotateY(180deg)';
                        }
                    } catch (cardError) {
                        console.error(`Error al inicializar tarjeta ${index + 1} en carrusel ${carouselIndex + 1}:`, cardError);
                    }
                });
            } catch (carouselError) {
                console.error(`Error al inicializar carrusel ${carouselIndex + 1}:`, carouselError);
            }
        });
        
        console.log('Inicialización de carruseles completada');
        
        // Mostrar la categoría por defecto después de inicializar
        window.mostrarCategoria('residencial');
        
    } catch (error) {
        console.error('Error en initPlanesCarrusel:', error);
        return false;
    }
    
    // Forzar la inicialización de las tarjetas activas después de un breve retraso
    setTimeout(() => {
        const activeCards = document.querySelectorAll('.plan-card.active');
        activeCards.forEach(card => {
            initCard(card);
            // Forzar un reflow para asegurar que los estilos se apliquen
            void card.offsetWidth;
        });
    }, 100);
    
    // Inicializar controles de navegación
    document.querySelectorAll('.carousel-control').forEach(control => {
        control.addEventListener('click', function() {
            const carousel = this.closest('.planes-carousel');
            const direction = this.classList.contains('next') ? 'next' : 'prev';
            navigateCarousel(carousel, direction);
        });
    });
    
    // Configurar el observer para nuevas tarjetas que se agreguen dinámicamente
    const cardObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Solo elementos
                    if (node.classList && node.classList.contains('plan-card')) {
                        initCard(node);
                        // Forzar estilos 3D para nuevas tarjetas
                        const inner = node.querySelector('.plan-inner');
                        if (inner) {
                            inner.style.transformStyle = 'preserve-3d';
                            inner.style.backfaceVisibility = 'hidden';
                            inner.style.webkitBackfaceVisibility = 'hidden';
                        }
                    } else {
                        const cards = node.querySelectorAll('.plan-card');
                        cards.forEach(card => {
                            initCard(card);
                            // Forzar estilos 3D para nuevas tarjetas
                            const inner = card.querySelector('.plan-inner');
                            if (inner) {
                                inner.style.transformStyle = 'preserve-3d';
                                inner.style.backfaceVisibility = 'hidden';
                                inner.style.webkitBackfaceVisibility = 'hidden';
                            }
                        });
                    }
                }
            });
        });
    });
    
    // Observar cambios en el documento
    cardObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Agregar event listeners a todas las tarjetas
    function initCards() {
        console.log('Inicializando tarjetas...');
        const cards = document.querySelectorAll('.plan-card');
        console.log(`Encontradas ${cards.length} tarjetas`);
        
        cards.forEach((card, index) => {
            console.log(`Configurando tarjeta ${index + 1}`);
            
            // Remover cualquier manejador de eventos previo
            card.removeEventListener('click', handleCardClick);
            
            // Agregar el manejador de eventos
            card.addEventListener('click', handleCardClick);
            
            // Asegurarse de que solo el frente sea visible inicialmente
            const front = card.querySelector('.plan-front');
            const back = card.querySelector('.plan-back');
            
            if (front) {
                front.style.visibility = 'visible';
                front.style.opacity = '1';
            }
            
            if (back) {
                back.style.visibility = 'visible';
                back.style.opacity = '1';
            }
            
            console.log(`Tarjeta ${index + 1} configurada`);
        });
    }
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCards);
    } else {
        // Si el DOM ya está listo, inicializar de inmediato
        setTimeout(initCards, 100);
    }
    
    // También inicializar después de un pequeño retraso para asegurar que todo esté listo
    setTimeout(initCards, 500);

    // Inicializar carruseles
    function initCarousel(carousel) {
        if (!carousel) return null;
        
        const track = carousel.querySelector('.carousel-track');
        const items = Array.from(carousel.querySelectorAll('.carousel-item'));
        const prevBtn = carousel.querySelector('.prev');
        const nextBtn = carousel.querySelector('.next');
        const indicatorsContainer = carousel.querySelector('.carousel-indicators');
        
        if (!track || items.length === 0) return null;
        
        let currentIndex = 0;
        const itemWidth = carousel.offsetWidth;
        let isAnimating = false;
        let animationID = null;
        const animationDuration = 400;
        const easeOutQuart = 'cubic-bezier(0.25, 1, 0.5, 1)';
        const easeInOutQuart = 'cubic-bezier(0.4, 0, 0.2, 1)';
        
        // Asegurar que los controles siempre sean visibles
        if (prevBtn) {
            prevBtn.style.opacity = '1';
            prevBtn.style.visibility = 'visible';
            prevBtn.style.pointerEvents = 'auto';
        }
        
        if (nextBtn) {
            nextBtn.style.opacity = '1';
            nextBtn.style.visibility = 'visible';
            nextBtn.style.pointerEvents = 'auto';
        }
        
        // Configurar las tarjetas
        items.forEach((item, index) => {
            // Ocultar todas las tarjetas inicialmente
            item.classList.remove('active');
            
            // Configurar eventos de clic para voltear la tarjeta
            item.addEventListener('click', function(e) {
                if (e.target.closest('.contratar-btn')) return;
                this.classList.toggle('flipped');
            });
        });
        
        // Activar solo la primera tarjeta
        if (items.length > 0) {
            items[0].classList.add('active');
        }
        
        // Inicialización de carruseles
        function createIndicators() {
            if (!indicatorsContainer) return; // Salir si no hay contenedor de indicadores
            
            try {
                indicatorsContainer.innerHTML = '';
                items.forEach((_, index) => {
                    const indicator = document.createElement('button');
                    indicator.className = 'carousel-indicator';
                    indicator.setAttribute('aria-label', `Ir al slide ${index + 1}`);
                    if (index === currentIndex) {
                        indicator.classList.add('active');
                    }
                    indicator.addEventListener('click', () => goToIndex(index));
                    indicatorsContainer.appendChild(indicator);
                });
            } catch (error) {
                console.error('Error al crear indicadores:', error);
            }
        }
        
        // Actualizar indicadores
        function updateIndicators() {
            if (!indicatorsContainer) return; // Salir si no hay contenedor de indicadores
            
            try {
                const indicators = indicatorsContainer.querySelectorAll('.carousel-indicator');
                indicators.forEach((indicator, index) => {
                    if (index === currentIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            } catch (error) {
                console.error('Error al actualizar indicadores:', error);
            }
        }
        
        // Navegación entre tarjetas
        function goToIndex(index) {
            if (isAnimating || index < 0 || index >= items.length) return;
            
            // Desactivar la tarjeta actual
            const currentItem = items[currentIndex];
            if (currentItem) {
                currentItem.classList.add('fade-out');
            }
            
            // Actualizar el índice y activar la nueva tarjeta
            currentIndex = index;
            updateCarousel();
            
            // Asegurarse de que la tarjeta esté visible
            const currentCard = items[currentIndex];
            if (currentCard) {
                currentCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
                
                // Asegurarse de que los controles permanezcan visibles
                if (prevBtn) {
                    prevBtn.style.opacity = '1';
                    prevBtn.style.visibility = 'visible';
                }
                if (nextBtn) {
                    nextBtn.style.opacity = '1';
                    nextBtn.style.visibility = 'visible';
                }
            }
            
            // Resetear el estado de animación después de un pequeño retraso
            setTimeout(() => {
                isAnimating = false;
            }, 50);
        }

        // Función para actualizar la tarjeta activa
        function updateCarousel() {
            if (!track) return;
            
            isAnimating = true;
            
            // Ocultar todas las tarjetas
            items.forEach(item => {
                item.classList.remove('active');
            });
            
            // Mostrar solo la tarjeta activa
            const activeItem = items[currentIndex];
            if (activeItem) {
                activeItem.classList.add('active');
            }
            
            // Actualizar estado activo de las tarjetas
            items.forEach((item, index) => {
                const isActive = index === currentIndex;
                item.style.opacity = isActive ? '1' : '0';
                item.style.transform = isActive ? 'scale(1)' : 'scale(0.9)';
                item.style.pointerEvents = isActive ? 'auto' : 'none';
                item.style.transition = `all ${animationDuration}ms ${easeInOutQuart}`;
                
                // Actualizar accesibilidad
                item.setAttribute('aria-hidden', !isActive);
                item.setAttribute('tabindex', isActive ? '0' : '-1');
                
                // Asegurar que la tarjeta activa tenga el foco para accesibilidad
                if (isActive) {
                    item.focus({ preventScroll: true });
                }
            });
            
            // Actualizar indicadores
            updateIndicators();
            
            // Asegurarse de que la tarjeta esté visible
            const currentCard = items[currentIndex];
            if (currentCard) {
                currentCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
            
            // Habilitar botones después de la animación
            clearTimeout(animationID);
            animationID = setTimeout(() => {
                isAnimating = false;
                
                // Enfocar la tarjeta activa para mejor accesibilidad
                if (items[currentIndex]) {
                    items[currentIndex].focus();
                }
            }, animationDuration);
        }

        // Función para navegar a la tarjeta anterior
        function goToPrev() {
            if (isAnimating) return;
            isAnimating = true;
            
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                // Si estamos en la primera tarjeta, ir a la última
                currentIndex = items.length - 1;
            }
            
            // Forzar actualización del DOM
            requestAnimationFrame(() => {
                updateCarousel();
                isAnimating = false;
            });
        }

        // Función para navegar a la siguiente tarjeta
        function goToNext() {
            if (isAnimating) return;
            isAnimating = true;
            
            if (currentIndex < items.length - 1) {
                currentIndex++;
            } else {
                // Si estamos en la última tarjeta, regresar a la primera
                currentIndex = 0;
            }
            
            // Forzar actualización del DOM
            requestAnimationFrame(() => {
                updateCarousel();
                isAnimating = false;
            });
        }

        // Event listeners para los botones de navegación
        if (prevBtn) {
            prevBtn.onclick = function(e) {
                e.stopPropagation();
                goToPrev();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = function(e) {
                e.stopPropagation();
                goToNext();
            };
        }
        
        // Inicializar eventos táctiles
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50; // Mínimo de píxeles para considerar un deslizamiento
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            if (isAnimating) return;
            
            touchEndX = e.changedTouches[0].screenX;
            const swipeDistance = touchStartX - touchEndX;
            
            // Solo procesar si el deslizamiento es significativo
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    // Deslizamiento hacia la izquierda (siguiente)
                    goToNext();
                } else {
                    // Deslizamiento hacia la derecha (anterior)
                    goToPrev();
                }
            }
        }, { passive: true });

        // Habilitar navegación con teclado
        document.addEventListener('keydown', function(e) {
            if (document.activeElement.closest('.planes-carousel') === carousel) {
                if (e.key === 'ArrowLeft') {
                    goToPrev();
                } else if (e.key === 'ArrowRight') {
                    goToNext();
                }
            }
        });

        // Manejar teclado
        function handleKeyDown(e) {
            if (document.activeElement.closest('.planes-carousel') === carousel) {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        goToPrev();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        goToNext();
                        break;
                    case 'Home':
                        e.preventDefault();
                        goToIndex(0);
                        break;
                    case 'End':
                        e.preventDefault();
                        goToIndex(items.length - 1);
                        break;
                }
            }
        }
        
        // Inicializar el carrusel
        try {
            if (indicatorsContainer) {
                createIndicators();
            }
            updateCarousel();
        } catch (error) {
            console.error('Error al inicializar el carrusel:', error);
            // Asegurarse de que al menos la navegación básica funcione
            if (items.length > 0) {
                items[0].classList.add('active');
            }
        }
        
        // Manejar redimensionamiento de la ventana
        const handleResize = () => {
            updateCarousel();
        };
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        document.addEventListener('keydown', handleKeyDown);
        
        // Limpiar event listeners al destruir el carrusel
        const cleanup = () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('keydown', handleKeyDown);
            clearTimeout(animationID);
        };
        
        // Retornar objeto con función de limpieza y referencia al elemento
        return { cleanup, element: carousel };
    }
    


    // Inicializar todos los carruseles
    const carruseles = document.querySelectorAll('.planes-carousel');
    let carruselInstances = [];
    
    // Función para inicializar un carrusel
    const initCarouselInstance = (carousel) => {
        // Limpiar instancia anterior si existe
        const existingIndex = carruselInstances.findIndex(instance => instance && instance.element === carousel);
        if (existingIndex !== -1) {
            if (carruselInstances[existingIndex] && carruselInstances[existingIndex].cleanup) {
                carruselInstances[existingIndex].cleanup();
            }
            carruselInstances.splice(existingIndex, 1);
        }
        
        // Inicializar nuevo carrusel
        const newInstance = initCarousel(carousel);
        if (newInstance) {
            carruselInstances.push(newInstance);
            return newInstance;
        }
        return null;
    };
    
    // Inicializar carruseles visibles al cargar la página
    function initVisibleCarousels() {
        document.querySelectorAll('.categoria-content:not([style*="display: none"]) .planes-carousel').forEach(carousel => {
            // Asegurarse de que el carrusel esté visible antes de inicializarlo
            if (carousel.offsetParent !== null) {
                initCarouselInstance(carousel);
            }
        });
    }
    
    // Inicializar carruseles visibles
    initVisibleCarousels();

    // Manejar cambio de categoría
    function mostrarCategoria(categoria) {
        // Oculta todas las categorías
        document.querySelectorAll('.categoria-content').forEach(div => {
            div.style.display = 'none';
        });
        
        // Quita clase activa a los botones
        document.querySelectorAll('.categoria-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Muestra la categoría seleccionada
        const categoriaElement = document.getElementById('categoria-' + categoria);
        if (categoriaElement) {
            categoriaElement.style.display = 'block';
            
            // Usar setTimeout para asegurar que el DOM se haya actualizado
            setTimeout(() => {
                // Inicializar el carrusel de la categoría mostrada
                const carrusel = categoriaElement.querySelector('.planes-carousel');
                if (carrusel) {
                    // Forzar un reflow para asegurar que el carrusel esté visible
                    void carrusel.offsetHeight;
                    initCarouselInstance(carrusel);
                }
            }, 10);
        }
        
        // Marca el botón como activo
        const btn = document.querySelector(`.categoria-btn[data-categoria="${categoria}"]`);
        if (btn) btn.classList.add('active');
    }

    // Agregar event listeners a los botones de categoría
    document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const categoria = this.getAttribute('data-categoria');
            if (categoria) {
                mostrarCategoria(categoria);
            }
        });
    });
    
    // Manejar el evento de visibilidad de la página
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            // Si la página se vuelve visible, reinicializar los carruseles visibles
            initVisibleCarousels();
        }
    });
} // Cierre de la función initPlanesCarrusel

// Hacer las funciones accesibles globalmente
window.mostrarCategoria = function(categoria) {
    console.log('Mostrando categoría:', categoria);
    // Esta función debería ser implementada según la lógica de tu aplicación
    // Por ahora, solo mostramos un mensaje en consola
    const categorias = document.querySelectorAll('.categoria-content');
    categorias.forEach(cat => {
        if (cat.id.includes(categoria)) {
            cat.style.display = 'block';
        } else {
            cat.style.display = 'none';
        }
    });
};
window.initCarouselInstance = initCarouselInstance;
    
// Verificar si ya se agregó el manejador de eventos
if (!window.contratarBtnHandlerAdded) {
    console.log('Manejador de clic para botones de contratar registrado');
    // Marcar que ya se agregó el manejador
    window.contratarBtnHandlerAdded = true;
    
    // Manejar clic en botones de contratar
    document.addEventListener('click', function handleContratarClick(e) {
        console.log('Evento de clic detectado');
        const contratarBtn = e.target.closest('.contratar-btn');
        if (!contratarBtn) {
            console.log('No es un botón de contratar');
            return;
        }
        
        console.log('Botón de contratar clickeado');
        e.preventDefault();
        e.stopImmediatePropagation();
        
        // Verificar si ya se está procesando un clic
        if (contratarBtn.hasAttribute('data-processing')) {
            console.log('Ya se está procesando un clic en este botón');
            return;
        }
        contratarBtn.setAttribute('data-processing', 'true');
        
        console.log('Iniciando proceso de contratación...');
        
        try {
                // Encontrar el plan y la categoría
                const planCard = contratarBtn.closest('.plan-card');
                if (!planCard) return;
                
                const planName = planCard.querySelector('h3').textContent.trim();
                const categoriaContainer = planCard.closest('.categoria-content');
                if (!categoriaContainer) return;
                
                // Determinar la categoría basada en el ID del contenedor
                let categoria = '';
                const categoriaId = categoriaContainer.id;
                if (categoriaId.includes('residencial')) {
                    categoria = 'Internet Residencial';
                } else if (categoriaId.includes('empresarial')) {
                    categoria = 'Internet Empresarial';
                } else if (categoriaId.includes('telefonia')) {
                    categoria = 'Telefonía en la Nube';
                } else if (categoriaId.includes('videovigilancia')) {
                    categoria = 'Videovigilancia';
                }
                
                console.log(`Intentando contratar: ${planName} de ${categoria}`);
                
                // Llamar a la función de contratación
                console.log('Llamando a window.contratarPlan con:', categoria, planName);
                if (typeof window.contratarPlan === 'function') {
                    try {
                        window.contratarPlan(categoria, planName);
                    } catch (error) {
                        console.error('Error al llamar a contratarPlan:', error);
                    }
                } else {
                    console.error('La función contratarPlan no está disponible');
                    console.log('window.contratarPlan:', window.contratarPlan);
                }
            } finally {
                // Asegurarse de limpiar el estado de procesamiento
                setTimeout(() => {
                    contratarBtn.removeAttribute('data-processing');
                }, 1000);
            }
        }, true); // Usar captura para asegurar que se ejecute primero
}

// Función para inicializar completamente las tarjetas
function initializeAllCards() {
    console.log('Inicializando todas las tarjetas...');
    const allCards = document.querySelectorAll('.plan-card');
    
    // Si no hay tarjetas, salir
    if (allCards.length === 0) {
        console.warn('No se encontraron tarjetas para inicializar');
        return;
    }
    
    allCards.forEach((card, index) => {
        console.log(`Inicializando tarjeta ${index + 1}/${allCards.length}`);
        
        // Asegurarse de que la tarjeta esté inicializada
        if (!card.classList.contains('initialized')) {
            initCard(card);
        }
        
        // Solo aplicar transformaciones necesarias para la animación
        const inner = card.querySelector('.plan-inner');
        const front = card.querySelector('.plan-front');
        const back = card.querySelector('.plan-back');
        
        // Aplicar solo los estilos necesarios para el efecto 3D
        if (inner) {
            inner.style.transformStyle = 'preserve-3d';
            inner.style.backfaceVisibility = 'hidden';
            inner.style.webkitBackfaceVisibility = 'hidden';
            inner.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            // Asegurar la posición inicial correcta
            if (card.classList.contains('flipped')) {
                inner.style.transform = 'rotateY(180deg)';
            } else {
                inner.style.transform = 'rotateY(0deg)';
            }
        }
        
        // Configuración mínima para las caras
        if (front) {
            front.style.backfaceVisibility = 'hidden';
            front.style.webkitBackfaceVisibility = 'hidden';
            front.style.transform = 'rotateY(0deg)';
        }
        
        if (back) {
            back.style.backfaceVisibility = 'hidden';
            back.style.webkitBackfaceVisibility = 'hidden';
            back.style.transform = 'rotateY(180deg)';
        }
        
        // Forzar un reflow para asegurar que los estilos se apliquen
        void card.offsetWidth;
    });
    
    console.log(`Se han inicializado ${allCards.length} tarjetas correctamente`);
}

// Función para inicializar la aplicación
function initApp() {
    console.log('Inicializando aplicación...');
    
    try {
        // Mostrar el contenedor principal si está oculto
        const planesContainer = document.querySelector('.planes-container');
        if (planesContainer) {
            planesContainer.style.display = 'block';
            planesContainer.style.visibility = 'visible';
            planesContainer.style.opacity = '1';
            console.log('Contenedor de planes mostrado en initApp');
        }
        
        // Primero, asegurarse de que el DOM esté completamente cargado
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            console.log('DOM ya está listo, inicializando aplicación...');
            setTimeout(initializeApplication, 100); // Pequeño retraso para asegurar que todo esté listo
        } else {
            console.log('Esperando a que el DOM se cargue completamente...');
            // Si el DOM no está completamente cargado, esperar a que lo esté
            window.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
                window.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
                console.log('DOM cargado, inicializando aplicación...');
                setTimeout(initializeApplication, 100); // Pequeño retraso para asegurar que todo esté listo
            });
            
            // También escuchar el evento load por si acaso
            window.addEventListener('load', function onWindowLoad() {
                window.removeEventListener('load', onWindowLoad);
                console.log('Ventana completamente cargada, inicializando aplicación...');
                initializeApplication();
            });
        }
    } catch (error) {
        console.error('Error en initApp:', error);
        // Intentar inicializar de todos modos
        setTimeout(initializeApplication, 500);
    }
}

// Función para inicializar la aplicación después de que todo esté cargado
function initializeApplication() {
    console.log('=== Inicializando aplicación de planes disponibles ===');
    
    try {
        // Verificar si ya se está inicializando para evitar múltiples inicializaciones
        if (window._isInitializingPlanes) {
            console.log('La inicialización ya está en curso, omitiendo...');
            return;
        }
        
        window._isInitializingPlanes = true;
        
        // Mostrar el contenedor principal si está oculto
        const planesContainer = document.querySelector('.planes-container');
        if (planesContainer) {
            planesContainer.style.display = 'block';
            planesContainer.style.visibility = 'visible';
            planesContainer.style.opacity = '1';
            console.log('Contenedor de planes mostrado en initializeApplication');
        }
        
        // Inicializar el carrusel
        console.log('Inicializando carrusel de planes...');
        const carruselInicializado = initPlanesCarrusel();
        
        if (!carruselInicializado) {
            console.warn('No se pudo inicializar el carrusel, reintentando...');
            // Reintentar después de un breve retraso
            setTimeout(() => {
                window._isInitializingPlanes = false;
                initializeApplication();
            }, 500);
            return;
        }
        
        // Inicializar tarjetas después de un pequeño retraso para asegurar que el DOM esté listo
        console.log('Programando inicialización de tarjetas...');
        setTimeout(function() {
            try {
                console.log('Inicializando tarjetas...');
                const initialized = initializeAllCards();
                
                if (!initialized) {
                    console.warn('No se pudieron inicializar las tarjetas, reintentando...');
                    // Reintentar después de un breve retraso
                    setTimeout(() => {
                        window._isInitializingPlanes = false;
                        initializeApplication();
                    }, 500);
                    return;
                }
                
                console.log('Aplicación de planes inicializada correctamente');
                
                // Forzar un reflow para asegurar que los estilos se apliquen correctamente
                console.log('Aplicando estilos finales...');
                document.querySelectorAll('.plan-card').forEach(card => {
                    void card.offsetWidth;
                });
                
                console.log('Tarjetas inicializadas correctamente');
                
                // Marcar como inicialización completada
                window._isInitializingPlanes = false;
            } catch (initError) {
                console.error('Error durante la inicialización de tarjetas:', initError);
                window._isInitializingPlanes = false;
                
                // Reintentar después de un breve retraso
                setTimeout(() => {
                    initializeApplication();
                }, 1000);
            }
        }, 100);
    } catch (error) {
        console.error('Error crítico en initializeApplication:', error);
        window._isInitializingPlanes = false;
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    // Si el DOM ya está listo, ejecutar inmediatamente
    setTimeout(initApp, 0);
}

// Configurar el observer para cambios en el DOM
const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            shouldUpdate = true;
        }
    });
    
    if (shouldUpdate) {
        console.log('Se detectaron cambios en el DOM, reinicializando tarjetas...');
        setTimeout(initializeAllCards, 100);
    }
});

// Comenzar a observar el documento con los parámetros configurados
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
});

// Exportar funciones al ámbito global
window.initializeAllCards = initializeAllCards;
window.initPlanesCarrusel = initPlanesCarrusel;