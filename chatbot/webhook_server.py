import os
import sys
import requests
from flask import Flask, request, jsonify

# Configuración del webhook
VERIFY_TOKEN = "emenet_chatbot_verify_token_2023"
WHATSAPP_API_TOKEN = "EAAjuCiVx7tIBO1RFN3x6xZAAHo3S4q6mLFTBi1qFr7p302EYH9HrOi9xdg79VtZBHiBpg8OBpLmab75QQbVc5AC7vtEtjT4mrBTw3IpCe0sNnkTidpecOR0rgVlizj69lfOZBzx9OpvpBLS6mLaJ1Rr6LjDiaE1vm82HLQIZCB4wZBEZATXuSjxGt27jw0J4qM5xBNZBHLHiLJeCduHDeopRDtRZC5UZD"
WHATSAPP_PHONE_NUMBER_ID = "643050535559127"
WHATSAPP_API_URL = f"https://graph.facebook.com/v22.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"

# Importar el chatbot
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from chatbot.hybrid_chatbot import procesar_consulta
except ImportError:
    # Si no se puede importar, definir una función simple
    def procesar_consulta(mensaje):
        return f"Respuesta simulada a: {mensaje}"

# Inicializar la aplicación Flask
app = Flask(__name__)

# Función para enviar mensajes de WhatsApp
def enviar_mensaje_whatsapp(numero_telefono, mensaje):
    """
    Envía un mensaje de texto a través de la API de WhatsApp

    Args:
        numero_telefono (str): Número de teléfono del destinatario en formato internacional (ej: "527292553437")
        mensaje (str): Mensaje a enviar

    Returns:
        dict: Respuesta de la API de WhatsApp
    """
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json"
    }

    data = {
        "messaging_product": "whatsapp",
        "to": numero_telefono,
        "type": "text",
        "text": {
            "body": mensaje
        }
    }

    try:
        response = requests.post(WHATSAPP_API_URL, headers=headers, json=data)
        return response.json()
    except Exception as e:
        print(f"Error al enviar mensaje de WhatsApp: {e}")
        return {"error": str(e)}

# Ruta para verificar el webhook
@app.route('/webhook', methods=['GET'])
def verificar_webhook():
    """
    Verifica el webhook cuando WhatsApp intenta suscribirse
    """
    # Parámetros de la solicitud
    mode = request.args.get('hub.mode')
    token = request.args.get('hub.verify_token')
    challenge = request.args.get('hub.challenge')

    # Verificar que el modo y el token sean correctos
    if mode == 'subscribe' and token == VERIFY_TOKEN:
        print("Webhook verificado!")
        return challenge, 200
    else:
        print("Verificación fallida")
        return "Verificación fallida", 403

# Ruta para recibir mensajes
@app.route('/webhook', methods=['POST'])
def recibir_mensaje():
    """
    Recibe mensajes de WhatsApp
    """
    # Obtener datos de la solicitud
    data = request.get_json()
    print(f"Datos recibidos: {data}")

    try:
        # Verificar si es un mensaje de WhatsApp
        if 'object' in data and data['object'] == 'whatsapp_business_account':
            # Procesar cada entrada
            for entry in data.get('entry', []):
                # Procesar cada cambio
                for change in entry.get('changes', []):
                    # Verificar si es un mensaje
                    if change.get('field') == 'messages':
                        # Procesar cada mensaje
                        for message in change.get('value', {}).get('messages', []):
                            # Verificar si es un mensaje de texto
                            if message.get('type') == 'text':
                                # Obtener el número de teléfono del remitente
                                sender = message.get('from')
                                # Obtener el texto del mensaje
                                text = message.get('text', {}).get('body', '')

                                print(f"Mensaje recibido de {sender}: {text}")

                                # Procesar el mensaje con el chatbot
                                respuesta = procesar_consulta(text)

                                # Enviar la respuesta
                                enviar_mensaje_whatsapp(sender, respuesta)

                                print(f"Respuesta enviada a {sender}: {respuesta}")

            return "OK", 200
        else:
            return "No es un mensaje de WhatsApp", 404
    except Exception as e:
        print(f"Error al procesar mensaje: {e}")
        return "Error", 500

# Ruta para probar el webhook
@app.route('/test_webhook', methods=['GET'])
def test_webhook():
    """
    Ruta para probar el webhook
    """
    return jsonify({
        "status": "online",
        "verify_token": VERIFY_TOKEN,
        "whatsapp_api_url": WHATSAPP_API_URL
    }), 200

# Ruta para simular la recepción de un mensaje
@app.route('/simulate_message', methods=['POST'])
def simulate_message():
    """
    Simula la recepción de un mensaje de WhatsApp
    """
    data = request.get_json()
    message = data.get('message')
    phone = data.get('phone', "527292553437")

    if not message:
        return jsonify({"error": "Se requiere un mensaje"}), 400

    # Procesar el mensaje con el chatbot
    respuesta = procesar_consulta(message)

    # Enviar la respuesta al usuario
    result = enviar_mensaje_whatsapp(phone, respuesta)

    return jsonify({
        "status": "success",
        "message": message,
        "response": respuesta,
        "api_result": result
    }), 200

if __name__ == '__main__':
    # Ejecutar la aplicación Flask
    print("=" * 50)
    print(f"Iniciando servidor webhook en http://localhost:5000/webhook")
    print(f"Token de verificación: {VERIFY_TOKEN}")
    print("=" * 50)
    print("Para verificar el webhook, usa la siguiente URL en la configuración de WhatsApp:")
    print(f"URL de devolución de llamada: http://localhost:5000/webhook")
    print(f"Token de verificación: {VERIFY_TOKEN}")
    print("=" * 50)
    print("Presiona Ctrl+C para detener el servidor")
    print("=" * 50)

    # Intentar ejecutar el servidor
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except Exception as e:
        print(f"Error al iniciar el servidor: {e}")
        # Intentar con otro puerto
        try:
            print("Intentando con el puerto 8080...")
            app.run(host='0.0.0.0', port=8080, debug=True)
        except Exception as e:
            print(f"Error al iniciar el servidor en el puerto 8080: {e}")
            # Intentar con localhost
            try:
                print("Intentando con localhost...")
                app.run(host='localhost', port=5000, debug=True)
            except Exception as e:
                print(f"Error al iniciar el servidor en localhost: {e}")
                print("No se pudo iniciar el servidor. Por favor, verifica que no haya otro servidor ejecutándose en el mismo puerto.")
