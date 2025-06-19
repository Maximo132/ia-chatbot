// static/js/HorariosAtencionJs.js
// Módulo profesional y desacoplado para mostrar los Horarios de Atención

// Módulo profesional para mostrar los Horarios de Atención como mensaje del bot
(function() {
    /**
     * Inserta el mensaje de horarios de atención en el chat, con diseño Apple.
     * Usa el HTML de templates/7.HorariosAtencion.html y el CSS correspondiente.
     */
    function mostrarHorariosAtencion() {
        // 1. Cargar CSS si no está presente
        if (!document.getElementById('css-horarios-atencion')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'static/css/7.HorariosAtencion.css';
            link.id = 'css-horarios-atencion';
            document.head.appendChild(link);
        }

        // 2. Obtener el HTML de la tarjeta de horarios
        fetch('templates/7.HorariosAtencion.html')
            .then(response => response.text())
            .then(html => {
                // 3. Insertar como mensaje del bot en el chat usando appendMessage
                if (typeof window.appendMessage === 'function') {
                    window.appendMessage(html, 'bot');
                } else if (typeof appendMessage === 'function') {
                    appendMessage(html, 'bot');
                } else {
                    // Fallback: inserta directo si no existe appendMessage
                    const chatContainer = document.getElementById('chat-messages');
                    if (chatContainer) {
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        const card = tempDiv.firstElementChild;
                        card.style.opacity = 0;
                        chatContainer.appendChild(card);
                        setTimeout(() => {
                            card.style.transition = 'opacity 0.5s';
                            card.style.opacity = 1;
                        }, 50);
                        chatContainer.scrollTo({
                            top: chatContainer.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }
            });
    }
    // Registrar la función globalmente
    window.mostrarHorariosAtencion = mostrarHorariosAtencion;
})();

