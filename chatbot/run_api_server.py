from whatsapp_api import app

if __name__ == '__main__':
    print("Iniciando servidor de API para WhatsApp...")
    print("Webhook URL: http://tu-dominio.com/webhook")
    print("Para probar localmente, usa ngrok: ngrok http 5000")
    app.run(host='0.0.0.0', port=5000)
