import requests
import json
import sys

# Configuración - Usar los mismos valores que en whatsapp_webhook_server.py
WHATSAPP_API_URL = "https://graph.facebook.com/v22.0"
WHATSAPP_BUSINESS_ACCOUNT_ID = "566794739787254"  # ID de la cuenta de WhatsApp Business
WHATSAPP_ACCESS_TOKEN = "EAAjuCiVx7tIBOy4qFZAZAwB7kPTZAeZCIkFbO6FJesaTYRWAdUhW5mFqYBOW2LfMpWTFo79DZAZCoRNnpPbZBv2AtPYrL4wS6ZB2uyLhMuwAhSnHCYmRnoRYiRZAVvqBx1hqNwMOy8ZBxvgjEs4kXUXjtKyOuf8WCSrh0o6FvDhozAdRHXeH57yZBoSAzVYRHYeZBdpk6H5JBpPuq6uoev78OLrEUWMOnwcZD"

# URL del webhook (reemplaza con tu URL de ngrok)
WEBHOOK_URL = input("Ingresa la URL de ngrok (por ejemplo, https://xxxx-xxxx-xxxx.ngrok.io): ")
VERIFY_TOKEN = "emenet_chatbot_verify_token_2023"

def configure_webhook():
    """
    Configura el webhook para WhatsApp Business
    """
    print("\n1. Configurando webhook para la aplicación...")
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_BUSINESS_ACCOUNT_ID}/subscribed_apps"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    }
    
    data = {
        "fields": ["messages", "message_status_updates"]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Código de respuesta: {response.status_code}")
        print(f"Respuesta: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error al configurar el webhook: {e}")

def get_phone_numbers():
    """
    Obtiene los números de teléfono asociados a la cuenta de WhatsApp Business
    """
    print("\n2. Obteniendo números de teléfono...")
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Código de respuesta: {response.status_code}")
        print(f"Respuesta: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error al obtener números de teléfono: {e}")

def get_webhook_info():
    """
    Obtiene información sobre la configuración actual del webhook
    """
    print("\n3. Obteniendo información del webhook...")
    
    url = f"{WHATSAPP_API_URL}/{WHATSAPP_BUSINESS_ACCOUNT_ID}/webhooks"
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        print(f"Código de respuesta: {response.status_code}")
        print(f"Respuesta: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error al obtener información del webhook: {e}")

def set_webhook_url():
    """
    Configura la URL del webhook
    """
    print("\n4. Configurando URL del webhook...")
    
    # Esta es una aproximación, ya que la API exacta puede variar
    url = f"{WHATSAPP_API_URL}/app/webhooks"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"
    }
    
    data = {
        "object": "whatsapp_business_account",
        "callback_url": WEBHOOK_URL,
        "verify_token": VERIFY_TOKEN,
        "fields": ["messages", "message_status_updates"]
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        print(f"Código de respuesta: {response.status_code}")
        try:
            print(f"Respuesta: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Respuesta: {response.text}")
    except Exception as e:
        print(f"Error al configurar URL del webhook: {e}")

# Ejecutar las funciones
print("=== Configuración del webhook para WhatsApp Business ===")
configure_webhook()
get_phone_numbers()
get_webhook_info()
set_webhook_url()

print("\n=== Configuración completada ===")
print("Verifica en el panel de desarrolladores de Meta si el webhook está configurado correctamente.")
print("Si encuentras problemas, intenta configurar el webhook manualmente a través de la interfaz de usuario.")
