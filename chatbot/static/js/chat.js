$(document).ready(function() {
    const chatMessages = $('#chat-messages');
    const userInput = $('#user-input');
    const sendButton = $('#send-button');

    // Función para agregar un mensaje al chat (disponible globalmente)
    window.addMessage = function(message, isUser = false) {
        const messageClass = isUser ? 'user-message' : 'bot-message';
        console.log('Añadiendo mensaje:', {message, isUser, messageClass});
        
        // Si el mensaje es del bot y contiene HTML de contratación, inserta como HTML real
        if (!isUser && /contratar-card|contratar-steps-bar|paso-contratar/.test(message)) {
            // Evita duplicados: elimina anteriores bloques de contratación
            chatMessages.find('.contratar-card').closest('.message').remove();
            chatMessages.append(message);
        } else {
            const messageHtml = `
                <div class="message ${messageClass}" style="float: ${isUser ? 'right' : 'left'}; clear: both; margin: 5px 0;">
                    <div class="message-content">${message}</div>
                </div>
            `;
            chatMessages.append($(messageHtml));
        }
        scrollToBottom();
    }

    // Función para desplazarse al final del chat
    function scrollToBottom() {
        chatMessages.scrollTop(chatMessages[0].scrollHeight);
    }

    // Función para manejar el envío de mensajes
    function handleSendMessage() {
        const message = userInput.val().trim();
        if (message === '') return;

        // Agregar mensaje del usuario
        addMessage(message, true);
        userInput.val('');

        // Mostrar indicador de escritura
        const typingIndicator = $('<div class="message bot-message typing-indicator">Escribiendo...</div>');
        chatMessages.append(typingIndicator);
        scrollToBottom();

        // Simular respuesta del bot (esto se reemplazará con la llamada real a la API)
        setTimeout(() => {
            $('.typing-indicator').remove();
            addMessage('Gracias por tu mensaje. Estoy procesando tu solicitud...');
        }, 1000);
    }

    // Event Listeners
    sendButton.on('click', handleSendMessage);
    userInput.on('keypress', function(e) {
        if (e.which === 13) {
            handleSendMessage();
        }
    });

    // Mensaje de bienvenida inicial
    setTimeout(() => {
        addMessage('¡Hola! Soy EmBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?', false);
    }, 500);
});
