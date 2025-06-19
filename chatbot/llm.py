import os
import json
import random
import traceback
import requests
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict
import hashlib
from typing import Optional, Dict, Any, List, Union
from llama_cpp import Llama
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Cargar intents.json
def cargar_intents() -> Dict[str, Any]:
    """Carga el archivo de intenciones desde intents.json"""
    try:
        intents_path = os.path.join(os.path.dirname(__file__), 'intents.json')
        with open(intents_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error al cargar intents.json: {str(e)}")
        return {"intents": []}

# Cargar la información de la empresa desde intents.json
def cargar_info_empresa() -> Dict[str, Any]:
    """Extrae la información de la empresa de las intenciones"""
    try:
        intents = cargar_intents()
        empresa_info = {
            'nombre': 'Emenet',
            'horario_atencion': 'Lunes a Domingo, 8:00 AM - 10:00 PM',
            'contacto': {
                'telefono': '729 179 2524',
                'email': 'soporte@emenet.com.mx',
                'soporte_tecnico': 'soporte@emenet.com.mx'
            }
        }
        
        # Buscar información en las intenciones
        for intent in intents.get('intents', []):
            if intent.get('tag') == 'horario_atencion' and intent.get('responses'):
                empresa_info['horario_atencion'] = intent['responses'][0].split('\n')[0]
                break
                
        return empresa_info
    except Exception as e:
        logger.error(f"Error al cargar información de la empresa: {str(e)}")
        return {
            'nombre': 'Emenet',
            'horario_atencion': 'Lunes a Domingo, 8:00 AM - 10:00 PM',
            'contacto': {
                'telefono': '729 179 2524',
                'email': 'soporte@emenet.com.mx',
                'soporte_tecnico': 'soporte@emenet.com.mx'
            }
        }

# Configuración por defecto del modelo
DEFAULT_MODEL_DIR = os.path.expanduser("~/.lmstudio/models/bartowski/Llama-3.2-1B-Instruct-GGUF")
DEFAULT_MODEL_FILENAME = "Llama-3.2-1B-Instruct-f16.gguf"

class LLMHandler:
    def __init__(self, model_path: str):
        """
        Inicializa el modelo Llama con la ruta al archivo GGUF.
        
        Args:
            model_path (str): Ruta al archivo .gguf del modelo
        """
        self.model = None
        self.model_path = model_path
        self.context_window = 4096  # Tamaño de ventana de contexto
        self.max_tokens = 512      # Máximo de tokens a generar
        self.temperature = 0.7     # Controla la aleatoriedad (0.0 a 1.0)
        self.top_p = 0.9           # Muestreo de núcleo (nucleus sampling)
        self.top_k = 40            # Top-k sampling
        
    def load_model(self):
        """Carga el modelo en memoria"""
        try:
            logger.info(f"Cargando modelo desde: {self.model_path}")
            self.model = Llama(
                model_path=self.model_path,
                n_ctx=self.context_window,
                n_threads=4,  # Ajusta según los núcleos de tu CPU
                n_gpu_layers=0  # 0 para usar solo CPU, ajusta si tienes GPU compatible
            )
            logger.info("Modelo cargado exitosamente")
            return True
        except Exception as e:
            logger.error(f"Error al cargar el modelo: {str(e)}")
            return False
    
    def generate_response(self, prompt: str, system_prompt: Optional[str] = None, use_streaming: bool = False) -> str:
        """
        Genera una respuesta a partir del prompt dado.
        
        Args:
            prompt (str): El mensaje del usuario
            system_prompt (str, optional): Instrucciones del sistema. Por defecto es None.
            use_streaming (bool, optional): Si es True, usa streaming para la generación. Por defecto es False.
            
        Returns:
            str: La respuesta generada por el modelo o un mensaje de error
        """
        if not self.model:
            if not self.load_model():
                return "Lo siento, no pude cargar el modelo de lenguaje."
        
        try:
            # Construir el mensaje completo con instrucciones del sistema si se proporcionan
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            
            messages.append({"role": "user", "content": prompt})
            
            # Configuración común para la generación
            gen_params = {
                "messages": messages,
                "max_tokens": self.max_tokens,
                "temperature": self.temperature,
                "top_p": self.top_p,
                "top_k": self.top_k,
                "stop": ["</s>", "<|endoftext|"]
            }
            
            # Generar respuesta (con o sin streaming)
            if use_streaming:
                response = self.model.create_chat_completion(
                    **gen_params,
                    stream=True
                )
                
                # Construir la respuesta final a partir del stream
                final_response = ""
                for chunk in response:
                    if "choices" in chunk and len(chunk["choices"]) > 0:
                        delta = chunk["choices"][0].get("delta", {})
                        if "content" in delta:
                            final_response += delta["content"]
                
                return final_response if final_response else "No se pudo generar una respuesta. Por favor, inténtalo de nuevo."
            else:
                # Generación sin streaming
                response = self.model.create_chat_completion(
                    **gen_params,
                    stream=False
                )
                
                # Extraer la respuesta del formato de la API
                if "choices" in response and len(response["choices"]) > 0:
                    return response["choices"][0].get("message", {}).get("content", "No se pudo generar una respuesta.")
                else:
                    return "No se pudo generar una respuesta. Por favor, inténtalo de nuevo."
                    
        except Exception as e:
            error_msg = f"Error al generar respuesta: {str(e)}"
            logger.error(f"{error_msg}\n{traceback.format_exc()}")
            return "Lo siento, hubo un error al generar la respuesta. Por favor, inténtalo de nuevo más tarde."
    
    def get_response(self, user_message: str, system_prompt: Optional[str] = None, use_streaming: bool = False) -> str:
        """
        Obtiene una respuesta para el mensaje del usuario.
        
        Args:
            user_message (str): Mensaje del usuario
            system_prompt (str, optional): Instrucciones del sistema. Si es None, se usa el prompt por defecto.
            use_streaming (bool, optional): Si es True, usa streaming para la generación. Por defecto es False.
            
        Returns:
            str: Respuesta generada o mensaje de error
        """
        if not user_message or not isinstance(user_message, str):
            return "Por favor, proporciona un mensaje válido."
            
        try:
            # Si no se proporciona un system_prompt, usar uno por defecto
            if system_prompt is None:
                system_prompt = (
                    "Eres un asistente de atención al cliente de una empresa de telecomunicaciones. "
                    "Responde de manera amable, concisa y profesional. Si no sabes la respuesta, "
                    "ofrece contactar con un agente humano. "
                    "Las respuestas deben ser breves y directas, de 1-3 oraciones como máximo."
                )
                
            # Usar el modo sin streaming por defecto (más confiable)
            logger.info(f"Generando respuesta para: {user_message[:100]}...")
            
            message_lower = user_message.lower()
            
            # Manejar consultas sobre horarios de atención
            if any(palabra in message_lower for palabra in ['horario', 'horarios', 'atención', 'atencion', 'abierto', 'cierran', 'abren', 'disponible', 'oficina', 'sucursal']):
                return _obtener_horarios_atencion()
            
            # Manejar consultas sobre emergencias
            if any(palabra in message_lower for palabra in ['emergencia', 'urgencia', 'falla grave', 'problema urgente', 'fuera de horario']):
                return (
                    "🚨 *Soporte de Emergencia 24/7* 🚨\r\n\r\n"
                    "Para reportar una emergencia técnica fuera del horario de atención, comunícate a:\r\n\r\n"
                    "📞 *Teléfono de Emergencias*: 55-9999-8888\r\n\r\n"
                    "*Nota*: Este servicio está disponible las 24 horas solo para:\r\n"
                    "• Fallas totales del servicio\r\n"
                    "• Problemas críticos que afecten a múltiples usuarios\r\n"
                    "• Situaciones de seguridad\r\n\r\n"
                    "Para consultas generales, te atenderemos en nuestro horario habitual de atención. 😊"
                )
            
            # Manejar consultas sobre pagos
            if any(palabra in message_lower for palabra in ['pago', 'pagar', 'factura', 'recibo', 'vencimiento']):
                return (
                    "💳 *Información de Pagos* 💳\r\n\r\n"
                    "Puedes realizar tus pagos de las siguientes formas:\r\n\r\n"
                    "1. *Transferencia bancaria* (Disponible 24/7)\r\n"
                    "2. *Depósito en ventanilla* (En horario bancario)\r\n"
                    "3. *Pago en línea* a través de nuestra página web\r\n\r\n"
                    "📅 *Fechas de pago*:\r\n"
                    "• Facturación: Del 1ro al 5 de cada mes\r\n"
                    "¿Necesitas ayuda con algún pago en específico?"
                )
            
            # Usar el modelo de lenguaje para otras consultas
            try:
                # Crear un prompt para el modelo de lenguaje
                prompt = f"""Eres un asistente virtual de Emenet, una empresa de telecomunicaciones. 
                Responde de manera amable y profesional. Si no estás seguro de algo, pide más información.
                
                Usuario: {user_message}
                
                Respuesta:"""
                
                # Generar respuesta usando el modelo de lenguaje
                response = self.generate_response(
                    prompt=prompt, 
                    system_prompt=system_prompt,
                    use_streaming=use_streaming
                )
                
                # Limpiar la respuesta
                response_text = response.strip()
                
                # Reemplazar saltos de línea para asegurar formato consistente
                return response_text.replace('\n', '\r\n')
                
            except Exception as e:
                print(f"Error al generar respuesta: {str(e)}")
                return "Lo siento, estoy teniendo problemas para procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
            
            logger.info(f"Respuesta generada: {response[:200]}..." if response else "Respuesta vacía")
            return response if response else "No pude generar una respuesta en este momento. ¿Podrías reformular tu pregunta?"
            
        except Exception as e:
            error_msg = f"Error en get_response: {str(e)}"
            logger.error(f"{error_msg}\n{traceback.format_exc()}")
            return "Lo siento, hubo un error al procesar tu mensaje. Por favor, inténtalo de nuevo más tarde."


def initialize_llm_handler() -> LLMHandler:
    """
    Inicializa y devuelve una instancia de LLMHandler.
    
    Returns:
        LLMHandler: Instancia configurada del manejador LLM
    """
    try:
        # Construir la ruta al modelo
        model_path = os.path.join(DEFAULT_MODEL_DIR, DEFAULT_MODEL_FILENAME)
        
        # Verificar si el directorio existe
        if not os.path.exists(DEFAULT_MODEL_DIR):
            os.makedirs(DEFAULT_MODEL_DIR, exist_ok=True)
            logger.warning(f"Se creó el directorio para el modelo en: {DEFAULT_MODEL_DIR}")
        
        # Verificar si el archivo existe
        if not os.path.exists(model_path):
            logger.warning(f"No se encontró el archivo del modelo en: {model_path}")
            # Intentar encontrar cualquier archivo .gguf en el directorio
            try:
                if os.path.exists(DEFAULT_MODEL_DIR):
                    files = [f for f in os.listdir(DEFAULT_MODEL_DIR) if f.endswith('.gguf')]
                    if files:
                        model_path = os.path.join(DEFAULT_MODEL_DIR, files[0])
                        logger.info(f"Usando modelo alternativo: {model_path}")
                    else:
                        logger.warning("No se encontraron archivos .gguf en el directorio del modelo")
                else:
                    logger.error(f"El directorio del modelo no existe: {DEFAULT_MODEL_DIR}")
            except Exception as e:
                logger.error(f"Error al buscar archivos de modelo: {str(e)}")
        
        # Crear la instancia
        handler = LLMHandler(model_path=model_path)
        
        # Intentar cargar el modelo
        try:
            if not handler.load_model():
                logger.error("No se pudo cargar el modelo LLM")
                # Configurar un manejador de respuestas básico
                handler.get_response = lambda msg, **kwargs: "El sistema de respuestas avanzado no está disponible en este momento. Por favor, intente más tarde."
        except Exception as e:
            logger.error(f"Error al cargar el modelo: {str(e)}")
            # Configurar un manejador de respuestas básico
            handler.get_response = lambda msg, **kwargs: "El sistema de respuestas avanzado no está disponible en este momento. Por favor, intente más tarde."
        
        return handler
        
    except Exception as e:
        logger.error(f"Error al inicializar LLMHandler: {str(e)}\n{traceback.format_exc()}")
        # Devolver un manejador básico que no requiere modelo
        dummy_handler = LLMHandler(model_path="")
        dummy_handler.get_response = lambda msg, **kwargs: "El sistema de respuestas avanzado no está disponible en este momento. Por favor, intente más tarde."
        return dummy_handler

# Inicializar una instancia global
llm_handler = initialize_llm_handler()

def _obtener_respuesta_por_tag(tag: str) -> str:
    """Obtiene una respuesta aleatoria de un tag específico en intents.json"""
    try:
        intents = cargar_intents()
        for intent in intents.get('intents', []):
            if intent.get('tag') == tag and 'responses' in intent and intent['responses']:
                return random.choice(intent['responses'])
        return f"No tengo información sobre {tag} en este momento."
    except Exception as e:
        logger.error(f"Error al obtener respuesta para tag {tag}: {str(e)}")
        return "No pude obtener la información solicitada en este momento."

def _formatear_respuesta(titulo: str, lineas: List[str]) -> str:
    """
    Formatea una respuesta con un título y una lista de líneas.
    
    Args:
        titulo (str): Título de la sección
        lineas (List[str]): Lista de líneas de contenido
        
    Returns:
        str: Texto formateado con título y lista
    """
    # Construir la respuesta con formato mejorado
    respuesta = [f"\n{titulo}", ""]
    
    # Agregar cada línea con viñetas y sangría
    for linea in lineas:
        respuesta.append(f"• {linea.strip()}")
    
    # Agregar espacio al final para mejor legibilidad
    respuesta.append("")
    
    return "\n".join(respuesta)

def _obtener_plan_economico() -> str:
    """
    Devuelve información sobre el plan de internet más económico.
    
    Returns:
        str: Respuesta formateada con el plan más económico.
    """
    # Obtener todos los planes residenciales
    planes_residenciales = _obtener_planes_por_categoria('residencial')
    
    if not planes_residenciales:
        return "No se encontraron planes disponibles en este momento."
    
    # Encontrar el plan más económico
    plan_economico = min(planes_residenciales, key=lambda x: x['precio'])
    
    # Construir recomendaciones
    recomendaciones = [
        f"• Dispositivos conectados: {plan_economico.get('dispositivos', 'Hasta ' + str(plan_economico.get('dispositivos', '')) + ' dispositivos')}",
        f"• {plan_economico.get('trabajo_estudio', '')}",
        f"• {plan_economico.get('video', '')}",
        "• Internet ilimitado"
    ]
    
    respuesta = [
        "🟣 *••• PLAN ECONÓMICO RECOMENDADO •••* 🟣\r\n\r\n",
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n",
        f"💎 *{plan_economico['nombre']}*\r\n",
        f"   ━━━━━━━━━━━━━━━━━━━━━━━\r\n",
        f"   • 🚀 *Velocidad*: `{plan_economico['velocidad']}`\r\n",
        f"   • 💵 *Precio*: `${plan_economico['precio']}`\r\n",
        f"   • 📦 *Incluye*:\r\n",
        "     - 📶 WiFi incluido\r\n",
        "     - 🛠️ Soporte técnico 24/7\r\n",
        "     - ∞ Sin límite de datos\r\n\r\n",
        "\r\n🔹 *¿Te gustaría contratar este plan o necesitas más información?*\r\n",
        "   • 📞 Llama al `800-123-4567`\r\n",
    ]
    
    return "".join(respuesta)

def _obtener_planes_por_categoria(categoria: str) -> list:
    """
    Devuelve los planes según la categoría especificada.
    
    Args:
        categoria (str): Categoría de los planes ('residencial', 'empresarial', etc.)
        
    Returns:
        list: Lista de diccionarios con la información de los planes
    """
    # Datos de los planes residenciales
    if categoria == 'residencial':
        return [
            {
                'nombre': '50 megas',
                'velocidad': '50 Mbps',
                'precio': 300,
                'dispositivos': '8-10 dispositivos conectados',
                'trabajo_estudio': '3 personas trabajando/estudiando',
                'video': 'Streaming HD y gaming',
                'internet': 'Internet ilimitado'
            },
            {
                'nombre': '75 megas',
                'velocidad': '75 Mbps',
                'precio': 400,
                'dispositivos': '8-12 dispositivos conectados',
                'trabajo_estudio': '3 personas trabajando/estudiando',
                'video': 'Alta calidad',
                'internet': 'Internet ilimitado'
            },
            {
                'nombre': '100 megas',
                'velocidad': '100 Mbps',
                'precio': 500,
                'dispositivos': '11-15 dispositivos conectados',
                'trabajo_estudio': '5 personas trabajando/estudiando',
                'video': 'Alta calidad',
                'internet': 'Internet ilimitado'
            },
            {
                'nombre': '200 megas',
                'velocidad': '200 Mbps',
                'precio': 600,
                'dispositivos': '16-20 dispositivos conectados',
                'trabajo_estudio': '8 personas trabajando/estudiando',
                'video': '4K',
                'internet': 'Internet ilimitado'
            },
            {
                'nombre': '500 megas',
                'velocidad': '500 Mbps',
                'precio': 800,
                'dispositivos': '21-25 dispositivos conectados',
                'trabajo_estudio': '16 personas trabajando/estudiando',
                'video': '4K',
                'internet': 'Internet ilimitado'
            },
            {
                'nombre': '1000 megas',
                'velocidad': '1000 Mbps',
                'precio': 1400,
                'dispositivos': 'Más de 25 dispositivos conectados',
                'trabajo_estudio': 'Más de 16 personas trabajando/estudiando',
                'video': '4K',
                'internet': 'Internet ilimitado'
            }
        ]
    # Datos de los planes empresariales
    elif categoria == 'empresarial':
        return [
            {
                'nombre': '100 MB',
                'velocidad': '100 Mbps',
                'precio': 1500,
                'descripcion': 'Empresas pequeñas/medianas',
                'detalles': [
                    'Videollamadas HD simultáneas: 5',
                    'Internet simétrico',
                    'Soporte técnico prioritario',
                    'IP fija incluida'
                ]
            },
            {
                'nombre': '200 MB',
                'velocidad': '200 Mbps',
                'precio': 2000,
                'descripcion': 'Empresas pequeñas/medianas',
                'detalles': [
                    'Videollamadas HD simultáneas: 10',
                    'Internet simétrico',
                    'Soporte técnico prioritario',
                    'IP fija incluida',
                    'Servicio de respaldo'
                ]
            },
            {
                'nombre': '500 MB',
                'velocidad': '500 Mbps',
                'precio': 3000,
                'descripcion': 'Empresas medianas',
                'detalles': [
                    'Videollamadas HD simultáneas: 20',
                    'Internet simétrico',
                    'Soporte técnico prioritario',
                    'IP fija incluida',
                    'Servicio de respaldo',
                    'Ancho de banda garantizado'
                ]
            },
            {
                'nombre': '1 GB',
                'velocidad': '1000 Mbps',
                'precio': 5000,
                'descripcion': 'Empresas grandes',
                'detalles': [
                    'Videollamadas HD simultáneas: ilimitadas',
                    'Internet simétrico',
                    'Soporte técnico prioritario 24/7',
                    'IP fija incluida',
                    'Servicio de respaldo',
                    'Ancho de banda garantizado',
                    'SLA 99.9%'
                ]
            }
        ]
    return []

def _obtener_plan_maxima_velocidad() -> str:
    """
    Devuelve información sobre el plan de internet con mayor velocidad.
    
    Returns:
        str: Respuesta formateada con el plan de máxima velocidad.
    """
    # Obtener todos los planes residenciales
    planes_residenciales = _obtener_planes_por_categoria('residencial')
    
    if not planes_residenciales:
        return "No se encontraron planes disponibles en este momento."
    
    # Convertir velocidad a entero para comparación
    for plan in planes_residenciales:
        plan['velocidad_num'] = int(plan['velocidad'].split()[0])
    
    # Encontrar el plan con mayor velocidad
    plan_max_velocidad = max(planes_residenciales, key=lambda x: x['velocidad_num'])
    
    # Construir recomendaciones
    recomendaciones = [
        f"• Dispositivos conectados: {plan_max_velocidad.get('dispositivos', '')}",
        f"• {plan_max_velocidad.get('trabajo_estudio', '')}",
        f"• {plan_max_velocidad.get('video', '')}",
        "• Internet ilimitado"
    ]
    
    respuesta = [
        "🟣 *••• PLAN MÁXIMA VELOCIDAD •••* 🟣\r\n\r\n",
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n",
        f"⚡ *{plan_max_velocidad['nombre']}*\r\n",
        f"   ━━━━━━━━━━━━━━━━━━━━━━━\r\n",
        f"   • 🚀 *Velocidad*: `{plan_max_velocidad['velocidad']}`\r\n",
        f"   • 💎 *Precio*: `${plan_max_velocidad['precio']}`\r\n",
        f"   • 🎁 *Beneficios exclusivos*:\r\n",
        "     - 📶 WiFi 6 de última generación\r\n",
        "     - ⭐ Soporte técnico prioritario 24/7\r\n",
        "     - ∞ Sin límite de datos\r\n",
        "     - 🖥️ 3 meses de servicio de streaming incluido\r\n",
        "     - 🎮 Ideal para teletrabajo, streaming y gaming\r\n\r\n",
        "\r\n🔹 *¿Te gustaría contratar este plan o necesitas más información?*\r\n",
        "   • 📞 Llama al `800-123-4567`\r\n",
        "   • 🌐 Visita: [www.emenet.com.mx/contratar](https://www.emenet.com.mx/contratar)"
    ]
    
    return "".join(respuesta)

def _generar_respuesta_planes_internet() -> str:
    """
    Genera una respuesta formateada con todos los planes de internet residenciales disponibles.
    
    Returns:
        str: Respuesta formateada con los planes de internet.
    """
    # Obtener todos los planes residenciales
    planes_residenciales = _obtener_planes_por_categoria('residencial')
    
    if not planes_residenciales:
        return "No se encontraron planes disponibles en este momento."
    
    # Ordenar planes por velocidad (de menor a mayor)
    for plan in planes_residenciales:
        plan['velocidad_num'] = int(plan['velocidad'].split()[0])
    planes_ordenados = sorted(planes_residenciales, key=lambda x: x['velocidad_num'])
    
    # Construir la respuesta formateada
    respuesta = [
        "🟣 *••• PLANES DE INTERNET RESIDENCIAL •••* 🟣\r\n\r\n",
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n",
        "¡Hola! Aquí tienes los planes de internet residencial que ofrecemos:\r\n\r\n"
    ]
    
    # Agregar cada plan con su información
    for plan in planes_ordenados:
        recomendaciones = [
            f"• Dispositivos: {plan.get('dispositivos', '')}",
            f"• {plan.get('trabajo_estudio', '')}",
            f"• {plan.get('video', '')}",
            "• Internet ilimitado"
        ]
        
        respuesta.extend([
            f"🔹 *{plan['nombre']}*\r\n",
            f"   ━━━━━━━━━━━━━━━━━━━━━━━\r\n",
            f"   • 🚀 *Velocidad*: `{plan['velocidad']}`\r\n",
            f"   • 💵 *Precio*: `${plan['precio']}`\r\n",
            f"   • 📦 *Incluye*:\r\n",
            "\r\n".join(recomendaciones) + "\r\n"
        ])
    
    # Agregar características generales
    respuesta.extend([
        "\r\n*Beneficios incluidos en todos los planes:*\r\n",
        "• Conexión simétrica (misma velocidad de subida y bajada)\r\n",
        "• Internet ilimitado\r\n",
        "• Router WiFi incluido\r\n",
        "• Soporte técnico 24/7\r\n",
        "• Instalación profesional sin costo\r\n\r\n",
        "¿Te gustaría contratar alguno de estos planes o necesitas más información? 😊"
    ])
    
    return "".join(respuesta)

def _obtener_horarios_atencion() -> str:
    """
    Devuelve información sobre los horarios de atención y contacto de emergencia.
    
    Returns:
        str: Respuesta formateada con los horarios de atención.
    """
    return (
        "🟣 *••• HORARIOS DE ATENCIÓN •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "🕒 *HORARIO DE ATENCIÓN*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • 📅 *Lunes a Viernes*: 09:00 a.m. - 06:00 p.m.\r\n"
        "   • 📅 *Sábados*: 09:00 a.m. - 03:00 p.m.\r\n"
        "   • ❌ *Domingos*: Cerrado\r\n\r\n"
        "\r\n💳 *PAGOS 24/7*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   Realiza tus pagos en cualquier momento a través de:\r\n"
        "   • 🌐 *Página web*: [www.emenet.com.mx/pagos](https://www.emenet.com.mx/pagos)\r\n"
        "   • 📱 *Aplicación móvil* (disponible en App Store y Google Play)\r\n\r\n"
        "\r\n🚨 *EMERGENCIAS TÉCNICAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   Para reportar fallas técnicas graves fuera de horario:\r\n"
        "   • 📞 *Teléfono de Emergencias*: 55-9999-8888\r\n"
        "   • 💬 *WhatsApp*: `55-1234-5678`\r\n\r\n"
        "\r\n🔹 *¿En qué más puedo ayudarte hoy?* 🔹"
    )

def _obtener_categorias_servicios() -> str:
    """
    Devuelve información sobre las diferentes categorías de servicios disponibles.
    
    Returns:
        str: Respuesta formateada con las categorías de servicios.
    """
    return (
        "🟣 *••• CATEGORÍAS DE SERVICIOS •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "¡Claro! Estos son los tipos de servicios que ofrecemos:\r\n\r\n"
        "🔹 *1. INTERNET RESIDENCIAL*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Planes desde 50 Mbps hasta 1 Gbps\r\n"
        "   • Conexión simétrica (misma velocidad de subida y bajada)\r\n"
        "   • Ideal para hogares con múltiples dispositivos\r\n\r\n"
        "🔹 *2. INTERNET EMPRESARIAL*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Soluciones a medida para empresas\r\n"
        "   • Conectividad dedicada\r\n"
        "   • Soporte prioritario 24/7\r\n\r\n"
        "🔹 *3. TELEFONÍA IP*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Líneas telefónicas virtuales\r\n"
        "   • Llamadas ilimitadas\r\n"
        "   • Incluye servicios de voz sobre IP\r\n\r\n"
        "🔹 *4. VIDEOVIGILANCIA*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Cámaras de seguridad HD\r\n"
        "   • Monitoreo remoto 24/7\r\n"
        "   • Almacenamiento en la nube\r\n\r\n"
        "¿Te gustaría más información sobre alguna de estas categorías en particular?"
        " Por ejemplo, puedes preguntar por 'planes de internet residencial' o 'servicios de videovigilancia'."
    )

def _obtener_planes_internet_residencial() -> str:
    """
    Devuelve información detallada sobre los planes de internet residencial.
    
    Returns:
        str: Respuesta formateada con los planes de internet residencial.
    """
    return (
        "🟣 *••• PLANES DE INTERNET RESIDENCIAL •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "🌐 *Conecta tu hogar con la mejor velocidad y estabilidad*\r\n\r\n"
        "🔹 *50 MEGAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $300/mes\r\n"
        "   • Ideal para: 8-10 dispositivos conectados\r\n"
        "   • Hasta 3 personas trabajando/estudiando\r\n"
        "   • Streaming HD y gaming sin interrupciones\r\n"
        "   • Internet ilimitado\r\n\r\n"
        "🔹 *75 MEGAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $400/mes\r\n"
        "   • Ideal para: 8-12 dispositivos conectados\r\n"
        "   • Hasta 3 personas trabajando/estudiando\r\n"
        "   • Reproducción de video en alta calidad\r\n"
        "   • Juegos en línea sin lag\r\n\r\n"
        "🔹 *100 MEGAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $500/mes\r\n"
        "   • Ideal para: 11-15 dispositivos conectados\r\n"
        "   • Hasta 5 personas trabajando/estudiando\r\n"
        "   • Streaming 4K sin interrupciones\r\n"
        "   • Transmisiones en vivo fluidas\r\n\r\n"
        "🔹 *200 MEGAS* (RECOMENDADO)\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $600/mes\r\n"
        "   • Ideal para: 16-20 dispositivos conectados\r\n"
        "   • Hasta 8 personas trabajando/estudiando\r\n"
        "   • Streaming 4K en múltiples dispositivos\r\n"
        "   • Juegos en línea sin interrupciones\r\n\r\n"
        "🔹 *500 MEGAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $800/mes\r\n"
        "   • Ideal para: 21-25 dispositivos conectados\r\n"
        "   • Hasta 16 personas trabajando/estudiando\r\n"
        "   • Conexión ultrarrápida para múltiples usos\r\n\r\n"
        "🔹 *1000 MEGAS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $1,400/mes\r\n"
        "   • Ideal para: Más de 25 dispositivos\r\n"
        "   • Para hogares con muchas necesidades de conectividad\r\n"
        "   • La máxima velocidad para tu hogar inteligente\r\n\r\n"
        "📞 *¿Necesitas ayuda para elegir el mejor plan para tu hogar?*"
        " Estamos aquí para asesorarte."
    )

def _obtener_planes_internet_empresarial() -> str:
    """
    Devuelve información sobre los planes de internet empresarial.
    
    Returns:
        str: Respuesta formateada con los planes de internet empresarial.
    """
    return (
        "🟣 *••• PLANES DE INTERNET EMPRESARIAL •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "🏢 *Conectividad empresarial de alto rendimiento*\r\n"
        "Soluciones diseñadas para el crecimiento de tu negocio.\r\n\r\n"
        "🔹 *100 MB DEDICADOS*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $1,500/mes\r\n"
        "   • Ideal para: Pequeñas/medianas empresas\r\n"
        "   • Incluye:\r\n"
        "     - IP pública fija\r\n"
        "     - Soporte técnico prioritario\r\n"
        "     - Hasta 5 videollamadas HD simultáneas\r\n"
        "     - Internet simétrico (misma velocidad de subida y bajada)\r\n\r\n"
        "🔹 *200 MB DEDICADOS* (PRÓXIMAMENTE)\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $2,500/mes\r\n"
        "   • Ideal para: Medianas empresas\r\n"
        "   • Incluye:\r\n"
        "     - Múltiples IPs públicas\r\n"
        "     - Soporte VIP 24/7\r\n"
        "     - Hasta 10 videollamadas HD simultáneas\r\n"
        "     - Conectividad redundante\r\n\r\n"
        "🔹 *1 GB DEDICADO* (PRÓXIMAMENTE)\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $4,500/mes\r\n"
        "   • Ideal para: Grandes empresas y corporativos\r\n"
        "   • Incluye:\r\n"
        "     - Múltiples IPs públicas\r\n"
        "     - Soporte dedicado 24/7 con respuesta inmediata\r\n"
        "     - Videoconferencias ilimitadas\r\n"
        "     - Enlaces redundantes\r\n\r\n"
        "💼 *Beneficios para todas las empresas*\r\n"
        "   • Instalación sin costo\r\n"
        "   • Sin límite de datos\r\n"
        "   • Facturación electrónica\r\n"
        "   • Asesoría técnica especializada\r\n"
        "   • Soluciones personalizadas según necesidades\r\n\r\n"
        "📞 *Contáctanos* para una asesoría personalizada y cotización a la medida de tu negocio."
    )

def _obtener_planes_telefonia() -> str:
    """
    Devuelve información sobre los planes de telefonía IP.
    
    Returns:
        str: Respuesta formateada con los planes de telefonía IP.
    """
    return (
        "🟣 *••• PLANES DE TELEFONÍA EN LA NUBE •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "📞 *Comunica a tu negocio con tecnología de vanguardia*\r\n\r\n"
        "🔹 *PLAN BÁSICO*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $300/mes por extensión\r\n"
        "   • Ideal para: Pequeñas empresas y emprendedores\r\n"
        "   • Incluye:\r\n"
        "     - Llamadas ilimitadas a México y USA\r\n"
        "     - Buzón de voz incluido\r\n"
        "     - 1 número virtual gratuito\r\n"
        "     - Transferencia de llamadas\r\n"
        "     - Mensajería de voz a correo\r\n\r\n"
        "🔹 *PLAN PREMIUM* (RECOMENDADO)\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Precio: $500/mes\r\n"
        "   • Ideal para: Empresas en crecimiento\r\n"
        "   • Incluye:\r\n"
        "     - Hasta 50 extensiones\r\n"
        "     - Grabación de llamadas\r\n"
        "     - Integración con CRM\r\n"
        "     - Soporte VIP 24/7\r\n"
        "     - IVR/Menú automático\r\n"
        "     - Reportes detallados\r\n\r\n"
        "📱 *Beneficios de nuestra telefonía en la nube*\r\n"
        "   • Sin inversión en equipos costosos\r\n"
        "   • Escalable según tus necesidades\r\n"
        "   • Acceso desde cualquier dispositivo\r\n"
        "   • Configuración remota y sencilla\r\n"
        "   • Actualizaciones automáticas\r\n\r\n"
        "📞 *Contáctanos* para una demostración personalizada de nuestra solución de telefonía en la nube."
    )

def _obtener_planes_videovigilancia() -> str:
    """
    Devuelve información sobre los servicios de videovigilancia.
    
    Returns:
        str: Respuesta formateada con los planes de videovigilancia.
    """
    return (
        "🟣 *••• SERVICIOS DE VIDEOVIGILANCIA •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "👁️ *Tranquilidad y seguridad para tu negocio o hogar*\r\n\r\n"
        "🔹 *PAQUETE BÁSICO*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Inversión inicial: $4,500\r\n"
        "   • Ideal para: Pequeños negocios y hogares\r\n"
        "   • Incluye:\r\n"
        "     - 4 cámaras HD 1080p\r\n"
        "     - Grabación continua 24/7\r\n"
        "     - App móvil para monitoreo\r\n"
        "     - Almacenamiento por 7 días\r\n"
        "     - Soporte técnico incluido\r\n\r\n"
        "🔹 *PAQUETE PREMIUM* (RECOMENDADO)\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • Inversión inicial: $8,000\r\n"
        "   • Ideal para: Empresas medianas y residencias de lujo\r\n"
        "   • Incluye:\r\n"
        "     - 8 cámaras HD 4K\r\n"
        "     - Visión nocturna avanzada\r\n"
        "     - Detección de movimiento inteligente\r\n"
        "     - Almacenamiento por 30 días\r\n"
        "     - Soporte prioritario 24/7\r\n"
        "     - Análisis de video con IA\r\n\r\n"
        "🔒 *Beneficios de nuestros sistemas de videovigilancia*\r\n"
        "   • Instalación profesional sin cargo adicional\r\n"
        "   - Mantenimiento preventivo incluido\r\n"
        "   - Actualizaciones de firmware gratuitas\r\n"
        "   - Monitoreo remoto desde cualquier dispositivo\r\n"
        "   - Soluciones personalizadas según tus necesidades\r\n\r\n"
        "📞 *¡Protege lo que más te importa!* Contáctanos para una asesoría personalizada sin costo."
    )

def _obtener_direccion_por_ip() -> str:
    """
    Intenta obtener la ubicación aproximada del usuario basada en su IP pública.
    """
    try:
        response = requests.get('https://api.ipify.org?format=json', timeout=5)
        ip_publica = response.json().get('ip', '')
        if not ip_publica:
            raise Exception("No se pudo obtener la IP pública")
            
        geo_response = requests.get(f'https://ipapi.co/{ip_publica}/json/', timeout=5)
        geo_data = geo_response.json()
        
        ciudad = geo_data.get('city', '').strip() or 'desconocida'
        estado = geo_data.get('region', '').strip() or 'desconocido'
        pais = geo_data.get('country_name', '').strip() or 'desconocido'
        
        mensaje = (
            f"🌍 *Hemos detectado que estás en:*\r\n"
            f"📍 {ciudad}, {estado}, {pais}\r\n\r\n"
            "¿Es correcta esta ubicación? Por favor confírmame para verificar la cobertura en tu zona.\r\n"
            "O si prefieres, puedes proporcionarme tu dirección completa manualmente."
        )
        
        return {
            'mensaje': mensaje,
            'ciudad': ciudad,
            'estado': estado,
            'pais': pais,
            'exito': True
        }
        
    except Exception as e:
        logging.error(f"Error al obtener ubicación por IP: {str(e)}")
        return {
            'mensaje': (
                "🔍 No pudimos detectar automáticamente tu ubicación. "
                "Por favor, compártenos tu dirección completa para verificar la cobertura en tu zona."
            ),
            'ciudad': '',
            'estado': '',
            'pais': '',
            'exito': False
        }

def _obtener_metodos_pago() -> str:
    """
    Devuelve información detallada sobre los métodos de pago disponibles.
    
    Returns:
        str: Respuesta formateada con la información de métodos de pago.
    """
    return (
        "🟣 *••• MÉTODOS DE PAGO DISPONIBLES •••* 🟣\r\n\r\n"
        "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
        "🔵 *1. PAGO EN VENTANILLA HSBC*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   💳 *Número de cuenta:* `4062 4091 31`\r\n"
        "   👤 *Beneficiario:* IPTVTEL COMUNICACIONES S DE RL DE CV\r\n\r\n"
        "\r\n🔵 *2. TRANSFERENCIA ELECTRÓNICA*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   🏦 *CLABE interbancaria:* `0214 5304 0624 0913 11`\r\n"
        "   🏛️ *Banco:* HSBC\r\n"
        "   👤 *Beneficiario:* IPTVTEL COMUNICACIONES S DE RL DE CV\r\n\r\n"
        "\r\n🔵 *3. DEPÓSITO EN OXXO Y FARMACIAS DEL AHORRO*\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   💳 *Tarjeta de débito:* `4741 7640 0198 2278`\r\n\r\n"
        "\r\n🔷 *INFORMACIÓN IMPORTANTE* 🔷\r\n"
        "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
        "   • 📌 Asegúrate de incluir tu *número de cliente* o *referencia* en el concepto de pago.\r\n"
        "   • ⏱️ Los pagos pueden tardar hasta *24 horas hábiles* en reflejarse.\r\n"
        "   • 📋 Guarda tu comprobante de pago por cualquier aclaración.\r\n\r\n"
        "💡 *¿Necesitas ayuda con algún otro método de pago o tienes alguna duda?* 😊"
    )

def _obtener_informacion_sucursales(sucursal_buscada: str = None) -> str:
    """
    Devuelve información sobre las sucursales disponibles.
    
    Args:
        sucursal_buscada (str, optional): Nombre de la sucursal específica a buscar. 
                                         Si es None, devuelve todas las sucursales.
    
    Returns:
        str: Respuesta formateada con la información de las sucursales.
    """
    # Base de datos de sucursales
    sucursales = [
        {
            'nombre': 'Santiago Tianguistenco',
            'direccion': 'ANDADOR CARLOS HANK GONZALEZ #304, SANTIAGO TIANGUISTENCO, ESTADO DE MEXICO',
            'referencia': 'JUNTO AL BANCO SANTANDER',
            'horario': 'L-V 9:00 AM - 6:00 PM\r\nSábados: 9:00 AM - 3:00 PM',
            'telefono': '55-8765-4321',
            'whatsapp': 'https://wa.me/525587654321',
            'mapa': 'https://www.google.com/maps/place/M-net+Sistemas+Computadoras+e+Internet/@19.1816993,-99.4694112,764m/data=!3m2!1e3!4b1!4m6!3m5!1s0x85cdf3d2a5c1d91f:0x59b36638210c9c11!8m2!3d19.1816993!4d-99.4668363!16s%2Fg%2F11c6112plc?entry=ttu&g_ep=EgoyMDI1MDUyMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D',
            'palabras_clave': ['santiago', 'tianguistenco', 'santander']
        },
        {
            'nombre': 'Santa Mónica',
            'direccion': 'GALEANA #27 CARR. MEXICO-CHALMA COL. EL PICACHO, OCUILAN DE ARTEAGA, ESTADO DE MEXICO',
            'referencia': 'JUNTO A FEDEX',
            'horario': 'L-V 9:00 AM - 6:00 PM\r\nSábados: 9:00 AM - 3:00 PM',
            'telefono': '55-1234-5678',
            'whatsapp': 'https://wa.me/525587654321',
            'mapa': 'https://maps.app.goo.gl/bw4Q7EGeADY1Z6xd7',
            'palabras_clave': ['santa', 'monica', 'fedex', 'chalma']
        },
        {
            'nombre': 'Cholula',
            'direccion': 'JOSE MA. MORELOS S/N, ESQUINA CON BENITO JUAREZ GARCIA COL. MORELOS, SAN PEDRO CHOLULA, ESTADO DE MEXICO',
            'referencia': 'DEBAJO DEL HOTEL CHOLULA',
            'horario': 'L-V 9:00 AM - 6:00 PM\r\nSábados: 9:00 AM - 3:00 PM',
            'telefono': '55-8765-4321',
            'whatsapp': 'https://wa.me/525587654321',
            'mapa': 'https://maps.app.goo.gl/9A7pdCtpqeEQzSnf6',
            'palabras_clave': ['cholula', 'morelos', 'hotel']
        }
    ]
    
    # Filtrar sucursales si se especifica una búsqueda
    if sucursal_buscada:
        sucursal_buscada = sucursal_buscada.lower()
        sucursales_filtradas = [
            s for s in sucursales 
            if (sucursal_buscada in s['nombre'].lower() or 
                any(palabra in sucursal_buscada for palabra in s['palabras_clave']))
        ]
        
        if not sucursales_filtradas:
            return (
                f"🔍 No encontré una sucursal que coincida con '{sucursal_buscada}'. "
                "Aquí tienes información de todas nuestras sucursales:\r\n\r\n"
            )
    else:
        sucursales_filtradas = sucursales
    
    # Construir la respuesta
    respuesta = ["🏢 *Nuestras Sucursales* 🏢\r\n\r\n"]
    
    for i, sucursal in enumerate(sucursales_filtradas, 1):
        respuesta.extend([
            f"📍 *{sucursal['nombre']}*\r\n",
            f"📌 *Dirección:* {sucursal['direccion']}\r\n",
            f"   {sucursal['referencia']}\r\n",
            f"🕒 *Horario:* {sucursal['horario']}\r\n",
            f"📞 *Teléfono:* {sucursal['telefono']}\r\n",
            f"🌐 *Ver en mapa:* {sucursal['mapa']}\r\n"
        ])
        
        # Agregar separador si no es la última sucursal
        if i < len(sucursales_filtradas):
            respuesta.append("\r\n➖➖➖➖➖➖➖➖➖➖➖➖➖\r\n\r\n")
    
    # Agregar información de contacto general
    respuesta.extend([
        "\r\n📱 *Contacto General:*\r\n",
        "• WhatsApp: https://wa.me/525587654321\r\n",
        "• Teléfono: 55-1234-5678\r\n",
        "• Email: contacto@ejemplo.com\r\n\r\n",
        "💡 *Servicios disponibles en todas las sucursales:*\r\n",
        "• Oficinas profesionales\r\n",
        "• Estacionamiento disponible\r\n",
        "• Pago con tarjeta de débito o crédito\r\n",
        "• Accesible para todo público\r\n\r\n",
        "¿Necesitas más información sobre alguna sucursal en particular? 😊"
    ])
    
    return "".join(respuesta)

def _obtener_solucion_falla(problema: str) -> str:
    """
    Devuelve soluciones para problemas comunes de internet.
    
    Args:
        problema (str): Descripción del problema reportado por el usuario.
        
    Returns:
        str: Respuesta con pasos para solucionar el problema.
    """
    problema = problema.lower()
    
    if any(palabra in problema for palabra in ['lento', 'lenta', 'despacio', 'velocidad']):
        # Primero ofrecer soluciones para mejorar la velocidad
        return (
            "🟣 *••• SOLUCIÓN: INTERNET LENTO •••* 🟣\r\n\r\n"
            "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
            "🐌 *Síntomas detectados*:\r\n"
            "   • Velocidad de internet más lenta de lo normal\r\n"
            "   • Carga lenta de páginas web\r\n"
            "   • Buffering en videos o juegos\r\n\r\n"
            "🔧 *Solución recomendada*:\r\n"
            "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
            "   1. *Reinicia tu módem*\r\n"
            "      🔄 Desconecta el cable de energía, espera 30 segundos y vuelve a conectarlo.\r\n\r\n"
            "   2. *Verifica dispositivos conectados*\r\n"
            "      📱 Cierra aplicaciones que consuman mucho ancho de banda (streaming, descargas, actualizaciones).\r\n\r\n"
            "   3. *Prueba con cable de red*\r\n"
            "      🔌 Conecta tu computadora directamente al módem con un cable Ethernet para descartar problemas de WiFi.\r\n\r\n"
            "   4. *Optimiza tu red WiFi*\r\n"
            "      📡 Coloca el router en un lugar central, lejos de dispositivos electrónicos y paredes gruesas.\r\n\r\n"
            "   5. *Verifica la hora del día*\r\n"
            "      ⏰ La velocidad puede variar en horas pico (7-11 PM). Intenta tu actividad en otro horario.\r\n\r\n"
            "📌 *Si el problema persiste después de estos pasos*, es posible que necesites un plan con mayor velocidad. "
            "Para recomendarte la mejor opción, por favor indícanos:\r\n"
            "   • ¿Cuántas personas usan internet en tu hogar?\r\n"
            "   • ¿Qué actividades realizan (trabajo, estudio, streaming, juegos)?\r\n"
            "   • ¿Cuál es tu plan actual de velocidad?"
        )
    elif any(palabra in problema for palabra in ['no funciona', 'no tengo', 'no hay', 'se cayó', 'se cae', 'inestable']):
        return (
            "🟣 *••• SOLUCIÓN: SIN CONEXIÓN A INTERNET •••* 🟣\r\n\r\n"
            "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
            "❌ *Síntomas detectados*:\r\n"
            "   • No hay acceso a internet\r\n"
            "   • Luces del módem apagadas o en rojo\r\n"
            "   • Red WiFi no disponible\r\n\r\n"
            "🔧 *Solución recomendada*:\r\n"
            "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
            "   1. *Revisa las luces del módem*\r\n"
            "      💡 Debes ver al menos 3 luces encendidas (Power, DS/Online y US).\r\n\r\n"
            "   2. *Reinicia el módem*\r\n"
            "      🔄 Desconecta el cable de energía por 1 minuto y vuelve a conectarlo.\r\n\r\n"
            "   3. *Verifica cables*\r\n"
            "      🔌 Asegúrate de que todos los cables estén bien conectados.\r\n\r\n"
            "   4. *Prueba otro dispositivo*\r\n"
            "      📱 Verifica si el problema es con un solo dispositivo o con todos.\r\n\r\n"
            "📌 *Si después de estos pasos sigues sin conexión*, por favor proporciona tu número de cliente para reportar la falla."
        )
    elif any(palabra in problema for palabra in ['módem', 'modem', 'router', 'no prende', 'no enciende']):
        return (
            "🟣 *••• SOLUCIÓN: MÓDEM NO ENCIENDE •••* 🟣\r\n\r\n"
            "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
            "🔌 *Síntomas detectados*:\r\n"
            "   • El módem no muestra luces encendidas\r\n"
            "   • No hay respuesta al presionar el botón de encendido\r\n"
            "   • El transformador puede estar caliente\r\n\r\n"
            "🔧 *Solución recomendada*:\r\n"
            "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
            "   1. *Verifica la conexión eléctrica*\r\n"
            "      🔌 Asegúrate de que el cable de poder esté bien conectado.\r\n\r\n"
            "   2. *Prueba otro enchufe*\r\n"
            "      🔌 Conecta el módem en un enchufe diferente.\r\n\r\n"
            "   3. *Revisa el transformador*\r\n"
            "      🔋 El adaptador debe estar frío al tacto y sin ruidos.\r\n\r\n"
            "   4. *Espera 5 minutos*\r\n"
            "      ⏱️ A veces los módems necesitan tiempo para reiniciarse.\r\n\r\n"
            "📌 *Si el módem sigue sin encender*, podría ser necesario un reemplazo. Por favor proporciona tu número de cliente para asistirte."
        )
    elif any(palabra in problema for palabra in ['intermitente', 'se va y viene', 'inestable']):
        return (
            "🟣 *••• SOLUCIÓN: CONEXIÓN INTERMITENTE •••* 🟣\r\n\r\n"
            "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
            "🔁 *Síntomas detectados*:\r\n"
            "   • La conexión se cae y vuelve\r\n"
            "   • Velocidad inconsistente\r\n"
            "   • Pérdida de señal intermitente\r\n\r\n"
            "🔧 *Solución recomendada*:\r\n"
            "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
            "   1. *Revisa la temperatura del módem*\r\n"
            "      🌡️ El sobrecalentamiento puede causar desconexiones.\r\n\r\n"
            "   2. *Verifica interferencias inalámbricas*\r\n"
            "      📡 Aleja el módem de microondas, teléfonos inalámbricos, etc.\r\n\r\n"
            "   3. *Cambia el canal WiFi*\r\n"
            "      🔄 Usa una aplicación para encontrar el canal menos saturado.\r\n\r\n"
            "   4. *Actualiza el firmware*\r\n"
            "      💻 Verifica si hay actualizaciones disponibles.\r\n\r\n"
            "📌 *Si el problema persiste*, por favor proporciona tu número de cliente para revisar tu conexión."
        )
    else:
        return (
            "🟣 *••• ASISTENCIA TÉCNICA •••* 🟣\r\n\r\n"
            "〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️\r\n\r\n"
            "🔍 *Necesitamos más información*\r\n"
            "Para brindarte la mejor asistencia, por favor indícanos:\r\n\r\n"
            "1. *Tipo de problema* 📝\r\n"
            "   ¿Qué está sucediendo exactamente?\r\n\r\n"
            "2. *Tiempo del problema* ⏰\r\n"
            "   ¿Desde cuándo comenzó el problema?\r\n\r\n"
            "3. *Acciones realizadas* 🔄\r\n"
            "   ¿Ya intentaste reiniciar tu módem?\r\n\r\n"
            "Con estos detalles podré ayudarte de manera más efectiva. 😊\r\n\r\n"
            "🔹 *Ejemplo de información útil*:\r\n"
            "   \"No tengo internet desde ayer. Ya reinicié el módem dos veces.\""
        )

class ChatMemory:
    """Clase para manejar la memoria y contexto del chatbot."""
    
    def __init__(self, user_id: str = "default", memory_file: str = "chat_memory.pkl"):
        """
        Inicializa la memoria del chat.
        
        Args:
            user_id: Identificador único del usuario
            memory_file: Archivo para persistir la memoria
        """
        self.user_id = user_id
        self.memory_file = memory_file
        self.context = {
            'last_category': None,          # Última categoría consultada
            'preferred_services': [],       # Servicios que el usuario prefiere
            'last_interaction': None,       # Fecha de la última interacción
            'interaction_count': 0,         # Número total de interacciones
            'known_addresses': [],          # Direcciones conocidas del usuario
            'preferred_payment_method': None,# Método de pago preferido
            'conversation_history': []      # Historial de la conversación (últimos 10 mensajes)
        }
        self._load_memory()
    
    def _load_memory(self) -> None:
        """Carga la memoria desde el archivo si existe."""
        try:
            if os.path.exists(self.memory_file):
                with open(self.memory_file, 'rb') as f:
                    saved_memory = pickle.load(f)
                    if self.user_id in saved_memory:
                        self.context = saved_memory[self.user_id]
        except Exception as e:
            logger.error(f"Error al cargar la memoria: {str(e)}")
    
    def _save_memory(self) -> None:
        """Guarda la memoria en el archivo."""
        try:
            all_memories = {}
            if os.path.exists(self.memory_file):
                with open(self.memory_file, 'rb') as f:
                    all_memories = pickle.load(f)
            
            all_memories[self.user_id] = self.context
            
            with open(self.memory_file, 'wb') as f:
                pickle.dump(all_memories, f)
        except Exception as e:
            logger.error(f"Error al guardar la memoria: {str(e)}")
    
    def update_last_category(self, category: str) -> None:
        """Actualiza la última categoría consultada."""
        self.context['last_category'] = category
        self._update_interaction()
    
    def get_last_category(self) -> Optional[str]:
        """Obtiene la última categoría consultada."""
        return self.context.get('last_category')
    
    def add_preferred_service(self, service: str) -> None:
        """Añade un servicio a los preferidos del usuario."""
        if service not in self.context['preferred_services']:
            self.context['preferred_services'].append(service)
            self._update_interaction()
    
    def get_preferred_services(self) -> List[str]:
        """Obtiene los servicios preferidos del usuario."""
        return self.context.get('preferred_services', [])
    
    def set_payment_method(self, method: str) -> None:
        """Establece el método de pago preferido."""
        self.context['preferred_payment_method'] = method
        self._update_interaction()
    
    def add_known_address(self, address: str) -> None:
        """Añade una dirección a las conocidas."""
        if address and address not in self.context['known_addresses']:
            self.context['known_addresses'].append(address)
            self._update_interaction()
    
    def get_known_addresses(self) -> List[str]:
        """Obtiene las direcciones conocidas."""
        return self.context.get('known_addresses', [])
    
    def add_to_history(self, role: str, message: str) -> None:
        """Añade un mensaje al historial de la conversación."""
        self.context['conversation_history'].append({
            'role': role,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        # Mantener solo los últimos 10 mensajes
        self.context['conversation_history'] = self.context['conversation_history'][-10:]
        self._update_interaction()
    
    def get_recent_history(self, limit: int = 5) -> List[Dict]:
        """Obtiene el historial reciente de la conversación."""
        return self.context.get('conversation_history', [])[-limit:]
    
    def _update_interaction(self) -> None:
        """Actualiza el contador y la fecha de la última interacción."""
        self.context['last_interaction'] = datetime.now().isoformat()
        self.context['interaction_count'] = self.context.get('interaction_count', 0) + 1
        self._save_memory()

# Inicializar la memoria del chat
chat_memory = ChatMemory(user_id="default")

def get_chat_response(message: str, intents: List[Dict[str, Any]], user_id: str = "default") -> str:
    """
    Obtiene una respuesta para un mensaje del chat, usando primero las intenciones
    y luego el modelo de lenguaje si es necesario.
    
    Args:
        message (str): Mensaje del usuario
        intents (List[Dict]): Lista de intenciones definidas
        user_id (str): Identificador único del usuario
        
    Returns:
        str: Respuesta generada
    """
    global chat_memory
    
    # Actualizar la memoria con el mensaje del usuario
    chat_memory.add_to_history('user', message)
    
    if not message or not isinstance(message, str):
        return "Por favor, proporciona un mensaje válido."
        
    logger.info(f"Procesando mensaje: {message}")
    message_lower = message.lower().strip()
    
    # Cargar información de la empresa para usar en las respuestas
    empresa_info = cargar_info_empresa()
    telefono_contacto = empresa_info.get('telefono_contacto', 'el número de soporte')
    
    try:
        # Verificar si el mensaje está vacío o es solo espacios
        if not message_lower:
            return "No he recibido tu mensaje. ¿En qué puedo ayudarte hoy?"
            
        # Manejar saludos
        if any(saludo in message_lower for saludo in ['hola', 'buenos días', 'buenas tardes', 'buenas noches']):
            saludos = [
                f"¡Hola! Bienvenido a {empresa_info['nombre']}. ¿En qué puedo ayudarte hoy?",
                f"¡Hola! Soy el asistente de {empresa_info['nombre']}. ¿En qué te puedo ayudar?",
                f"¡Buen día! ¿En qué puedo asistirte hoy?"
            ]
            return random.choice(saludos)
            
        # Manejar despedidas
        if any(despedida in message_lower for despedida in ['adiós', 'hasta luego', 'chao', 'nos vemos', 'gracias']):
            despedidas = [
                "¡Gracias por contactarnos! Que tengas un excelente día.",
                "¡Hasta luego! Si tienes más preguntas, no dudes en consultarnos.",
                "¡Fue un placer ayudarte! Que tengas un gran día."
            ]
            return random.choice(despedidas)
        
        # Manejar consultas sobre internet lento
        if any(palabra in message_lower for palabra in ['lento', 'lenta', 'despacio', 'velocidad baja', 'carga lenta', 'buffering', 'se traba']):
            # Primero ofrecer soluciones para internet lento
            return _obtener_solucion_falla(message_lower)
            
        # Mapeo de categorías a sus respectivas funciones y nombres de categoría
        categorias = {
            '1': (_obtener_planes_internet_residencial, 'residencial'),
            'internet residencial': (_obtener_planes_internet_residencial, 'residencial'),
            'residencial': (_obtener_planes_internet_residencial, 'residencial'),
            '2': (_obtener_planes_internet_empresarial, 'empresarial'),
            'internet empresarial': (_obtener_planes_internet_empresarial, 'empresarial'),
            'empresarial': (_obtener_planes_internet_empresarial, 'empresarial'),
            '3': (_obtener_planes_telefonia, 'telefonía'),
            'telefonía': (_obtener_planes_telefonia, 'telefonía'),
            'telefonia': (_obtener_planes_telefonia, 'telefonía'),
            'telefonía ip': (_obtener_planes_telefonia, 'telefonía'),
            'telefonia ip': (_obtener_planes_telefonia, 'telefonía'),
            '4': (_obtener_planes_videovigilancia, 'videovigilancia'),
            'videovigilancia': (_obtener_planes_videovigilancia, 'videovigilancia'),
            'cámaras': (_obtener_planes_videovigilancia, 'videovigilancia'),
            'camaras': (_obtener_planes_videovigilancia, 'videovigilancia'),
            'seguridad': (_obtener_planes_videovigilancia, 'videovigilancia')
        }
        
        # Manejar consultas sobre categorías de servicios
        if any(palabra in message_lower for palabra in ['qué planes tienes', 'que planes tienes', 'qué servicios ofrecen', 'que servicios ofrecen', 
                                                       'qué categorías manejan', 'que categorias manejan', 'tipos de planes', 'qué otros planes', 'que otros planes']):
            # Verificar si el mensaje contiene una categoría específica
            for key, (func, nombre_categoria) in categorias.items():
                if key in message_lower and key.isalpha():  # Solo para nombres de categoría, no números
                    # Actualizar la memoria con la categoría seleccionada
                    chat_memory.update_last_category(nombre_categoria)
                    chat_memory.context['categoria_actual'] = nombre_categoria
                    return func()
            
            # Si no se mencionó una categoría específica, mostrar todas las categorías
            return _obtener_categorias_servicios()
        
        # Manejar solicitud específica de planes de internet empresarial
        if any(palabra in message_lower for palabra in ['planes de internet empresarial', 'internet empresarial', 'planes empresariales', 'empresarial']):
            chat_memory.update_last_category('empresarial')
            chat_memory.context['categoria_actual'] = 'empresarial'
            return _obtener_planes_internet_empresarial()
            
        # Si no se encontró una categoría específica, verificar si se está pidiendo ver planes
        if any(palabra in message_lower for palabra in ['ver planes', 'mostrar planes', 'planes de internet', 'planes']):
            # Usar la última categoría consultada o mostrar opciones
            ultima_categoria = chat_memory.context.get('categoria_actual') or chat_memory.get_last_category()
            
            if ultima_categoria and ultima_categoria in [v[1] for v in categorias.values()]:
                # Obtener la función correspondiente a la última categoría
                for key, (func, cat) in categorias.items():
                    if cat == ultima_categoria:
                        # Actualizar la categoría actual en el contexto
                        chat_memory.context['categoria_actual'] = ultima_categoria
                        return func()
            
            # Si no hay categoría reciente o no se encontró, mostrar opciones
            return _obtener_categorias_servicios()
            
        # Manejar consultas sobre planes de internet específicamente
        if any(palabra in message_lower for palabra in ['plan', 'planes', 'internet', 'conexión', 'conexion']):
            # Verificar si se pregunta por el plan más básico o económico
            if any(palabra in message_lower for palabra in ['más económico', 'mas economico', 'más barato', 'mas barato', 'menor precio', 'más básico', 'mas basico']):
                return _obtener_plan_economico()
            # Verificar si se pregunta por el plan con mayor velocidad
            elif any(palabra in message_lower for palabra in ['mayor velocidad', 'más rápido', 'mas rapido', 'máxima velocidad', 'maxima velocidad']):
                return _obtener_plan_maxima_velocidad()
            # Si no es una consulta específica, devolver todos los planes
            else:
                respuesta = _generar_respuesta_planes_internet()
                return respuesta.replace('\r\n', '\n').replace('\n', '\r\n')
        # Manejar consultas sobre horarios de atención
        if any(palabra in message_lower for palabra in ['horario', 'horarios', 'atención', 'atencion', 'abierto', 'cierran', 'abren', 'disponible', 'oficina', 'sucursal']):
            return _obtener_horarios_atencion()
        
        # Manejar consultas sobre emergencias
        if any(palabra in message_lower for palabra in ['emergencia', 'urgencia', 'falla grave', 'problema urgente', 'fuera de horario']):
            return (
                "🚨 *Soporte de Emergencia 24/7* 🚨\r\n\r\n"
                "Para reportar una emergencia técnica fuera del horario de atención, comunícate a:\r\n\r\n"
                "📞 *Teléfono de Emergencias*: 55-9999-8888\r\n\r\n"
                "*Nota*: Este servicio está disponible las 24 horas solo para:\r\n"
                "• Fallas totales del servicio\r\n"
                "• Problemas críticos que afecten a múltiples usuarios\r\n"
                "• Situaciones de seguridad\r\n\r\n"
                "Para consultas generales, te atenderemos en nuestro horario habitual de atención. 😊"
            )
        
        # Manejar consultas sobre sucursales
        if any(palabra in message_lower for palabra in ['sucursal', 'sucursales', 'oficina', 'oficinas', 'dirección', 'direccion', 'ubicación', 'ubicacion', 'dónde están', 'donde estan']):
            # Extraer el nombre de la sucursal si se menciona
            sucursales = ['santiago', 'tianguistenco', 'santa', 'monica', 'cholula', 'morelos', 'santander', 'fedex']
            sucursal_buscada = next((s for s in sucursales if s in message_lower), None)
            return _obtener_informacion_sucursales(sucursal_buscada)
            
        # Función auxiliar para manejar la contratación de un plan específico
        def manejar_contratacion(plan_seleccionado=None):
            # Obtener la categoría de la memoria o usar la predeterminada
            ultima_categoria = chat_memory.get_last_category() or 'internet residencial'
            
            # Intentar obtener la ubicación por IP
            resultado_ubicacion = _obtener_direccion_por_ip()
            
            # Construir la respuesta con la ubicación detectada
            respuesta = [
                f"¡Excelente elección! Estamos verificando la cobertura para el servicio de {ultima_categoria} "
            ]
            
            # Si se especificó un plan, añadirlo al mensaje
            if plan_seleccionado:
                respuesta.append(f"del plan de {plan_seleccionado} ")
                chat_memory.context['ultimo_plan_consultado'] = plan_seleccionado
            
            respuesta.extend([
                f"en tu zona...\r\n\r\n",
                f"{resultado_ubicacion['mensaje']}\r\n\r\n"
            ])
            
            # Si hay una categoría de consulta previa, mencionarla
            respuesta.append(f"*Servicio seleccionado:* {ultima_categoria.capitalize()}\r\n")
            if plan_seleccionado:
                respuesta.append(f"*Plan seleccionado:* {plan_seleccionado}\r\n")
            respuesta.append("\r\n")
                
            respuesta.append(
                "Una vez confirmada la disponibilidad, podremos agendar la instalación en la fecha que mejor te convenga. "
                "La instalación generalmente se realiza en un plazo de 2 a 3 días hábiles.\r\n\r\n"
            )
            
            # Si se detectó una dirección, guardarla en la memoria
            if resultado_ubicacion['exito'] and 'ciudad' in resultado_ubicacion:
                direccion = f"{resultado_ubicacion['ciudad']}, {resultado_ubicacion['estado']}, {resultado_ubicacion['pais']}"
                chat_memory.add_known_address(direccion)
            
            # Si se pudo detectar la ubicación, agregar el formulario de contratación
            if resultado_ubicacion['exito']:
                respuesta.extend([
                    "🔹 *Formulario de Contratación* 🔹\r\n\r\n",
                    "Por favor, completa el siguiente formulario para continuar con tu solicitud:\r\n\r\n",
                    "1. *Nombre completo*\r\n",
                    "2. *Teléfono de contacto*\r\n",
                    "3. *Correo electrónico*\r\n",
                    "4. *Dirección exacta de instalación*\r\n",
                    "5. *Código postal*\r\n\r\n"
                ])
                
                # Si hay una dirección detectada, mostrarla
                if 'ciudad' in resultado_ubicacion:
                    respuesta.extend([
                        "*Ubicación detectada automáticamente:*\r\n",
                        f"📍 {resultado_ubicacion['ciudad']}, {resultado_ubicacion['estado']}, {resultado_ubicacion['pais']}\r\n\r\n",
                        "¿Deseas continuar con esta ubicación? (Sí/No)\r\n\r\n"
                    ])
                
                respuesta.extend([
                    "O si prefieres, puedes proporcionar los datos manualmente.\r\n\r\n",
                    "*Nota*: Un asesor se pondrá en contacto contigo para confirmar los detalles de tu contratación."
                ])
            
            return ''.join(respuesta)
        
        def obtener_planes_disponibles() -> list:
            """Obtiene la lista de planes disponibles con sus precios."""
            # Obtener la categoría actual o usar la predeterminada
            categoria = chat_memory.get_last_category() or 'residencial'
            
            # Obtener los planes para la categoría actual
            planes = _obtener_planes_por_categoria(categoria)
            
            # Si no hay planes para la categoría, buscar en todas las categorías
            if not planes:
                planes = []
                for cat in ['residencial', 'empresarial', 'telefonia', 'videovigilancia']:
                    planes.extend(_obtener_planes_por_categoria(cat) or [])
            
            return planes
            
        def buscar_plan_por_precio(mensaje: str) -> Optional[dict]:
            """Busca un plan por el precio mencionado en el mensaje."""
            # Buscar cantidades de dinero en el mensaje (ej: $500, 500 pesos, 500 mxn)
            patron_precio = r'\$?\s*(\d+(?:[.,]\d+)?)\s*(?:pesos?|mxn|dólares?|dolares?|USD)?'
            coincidencias = re.findall(patron_precio, mensaje.lower())
            
            if not coincidencias:
                return None
                
            # Obtener todos los planes disponibles
            planes = obtener_planes_disponibles()
            
            # Buscar coincidencias de precio
            for precio_str in coincidencias:
                try:
                    # Convertir el precio a float, manejando tanto . como , como separador decimal
                    precio = float(precio_str.replace(',', '.'))
                    
                    # Buscar el plan con el precio más cercano (dentro de un margen del 10%)
                    mejor_coincidencia = None
                    mejor_diferencia = float('inf')
                    
                    for plan in planes:
                        if 'precio' in plan:
                            try:
                                precio_plan = float(str(plan['precio']).replace('$', '').replace(',', '').strip())
                                diferencia = abs(precio_plan - precio)
                                
                                # Si la diferencia es menor al 10% del precio mencionado
                                if diferencia < (precio * 0.1) and diferencia < mejor_diferencia:
                                    mejor_coincidencia = plan
                                    mejor_diferencia = diferencia
                            except (ValueError, TypeError):
                                continue
                    
                    if mejor_coincidencia:
                        return mejor_coincidencia
                        
                except (ValueError, TypeError):
                    continue
                    
            return None
            
        def normalizar_velocidad(texto_velocidad: str) -> str:
            """Normaliza diferentes formatos de velocidad a un formato estándar."""
            # Si ya es un diccionario (plan encontrado por precio), devolver la velocidad formateada
            if isinstance(texto_velocidad, dict) and 'velocidad' in texto_velocidad:
                return texto_velocidad['velocidad']
                
            # Convertir a minúsculas y quitar espacios
            texto = str(texto_velocidad).lower().replace(' ', '')
            
            # Mapeo de sinónimos
            sinonimos = {
                'mbps': 'Mbps',
                'mb': 'Mbps',
                'megas': 'Mbps',
                'mega': 'Mbps',
                'gbps': 'Gbps',
                'gb': 'Gbps',
                'gigas': 'Gbps',
                'giga': 'Gbps'
            }
            
            # Buscar patrones como "100mb", "500 mbps", "1 gb", etc.
            patron = r'(\d+)(mbps?|gbps?|megas?|gigas?)'
            coincidencia = re.search(patron, texto)
            
            if coincidencia:
                numero = coincidencia.group(1)
                unidad = coincidencia.group(2)
                
                # Normalizar la unidad
                for key, valor in sinonimos.items():
                    if key in unidad:
                        unidad = valor
                        break
                
                # Convertir todo a Mbps para comparación
                if 'Gbps' in unidad:
                    valor_mbps = float(numero) * 1000
                    # Si es menor a 1000, mostrarlo en Mbps, de lo contrario en Gbps
                    if valor_mbps < 1000:
                        return f"{int(valor_mbps)} Mbps"
                    else:
                        return f"{numero} {unidad}"
                else:
                    return f"{numero} {unidad}"
            
            return texto_velocidad  # Retornar el texto original si no se pudo normalizar
        
        # Manejar intención de contratación de un plan específico (ej: "quiero contratar el de 200 megas" o "quiero el plan de $500")
        if any(palabra in message_lower for palabra in ['contratar', 'quiero contratar', 'deseo contratar', 'me interesa contratar', 'quiero el plan de', 'quiero el de', 'el de']):
            import re
            
            # 1. Verificar si hay un plan en el historial reciente
            ultimo_plan = chat_memory.context.get('ultimo_plan_consultado')
            if ultimo_plan and isinstance(ultimo_plan, dict):
                # Usar la categoría del último plan consultado
                categoria_actual = ultimo_plan.get('categoria', 'residencial')
                logger.info(f"Usando categoría del último plan consultado: {categoria_actual}")
                return manejar_contratacion(plan_seleccionado=f"{ultimo_plan.get('nombre', '')} - {ultimo_plan.get('velocidad', '')} - {ultimo_plan.get('precio', '')}")
            
            # 2. Si no hay un plan reciente, verificar el contexto de la conversación
            categoria_actual = chat_memory.context.get('categoria_actual') or chat_memory.get_last_category() or 'residencial'
            logger.info(f"Categoría actual para contratación: {categoria_actual}")
            
            # 3. Forzar categoría empresarial si se menciona en el mensaje o en el contexto
            if 'empresarial' in message_lower or 'empresarial' in categoria_actual.lower():
                categoria_actual = 'empresarial'
                logger.info("Forzando categoría empresarial por contexto")
            
            # 4. Obtener planes de la categoría actual
            logger.info(f"Buscando planes en la categoría: {categoria_actual}")
            planes_categoria = _obtener_planes_por_categoria(categoria_actual)
            
            # Primero, buscar si se menciona un precio específico
            plan_por_precio = buscar_plan_por_precio(message_lower)
            if plan_por_precio:
                # Guardar el plan completo en el contexto
                chat_memory.context['ultimo_plan_consultado'] = plan_por_precio
                chat_memory.context['ultima_categoria_consulta'] = categoria_actual
                return manejar_contratacion(plan_seleccionado=f"{plan_por_precio.get('nombre', '')} - {plan_por_precio.get('velocidad', '')} - {plan_por_precio.get('precio', '')}")
            
            # Si no se encontró por precio, buscar por velocidad
            patron_velocidad = r'(\d+\s*(?:mbps?|gbps?|megas?|gigas?|mega|giga|mb|gb))'
            coincidencias = re.finditer(patron_velocidad, message_lower, re.IGNORECASE)
            
            # Procesar todas las coincidencias
            velocidades_encontradas = []
            for match in coincidencias:
                velocidad = match.group(1).strip()
                velocidad_normalizada = normalizar_velocidad(velocidad)
                velocidades_encontradas.append(velocidad_normalizada)
            
            # Si se encontraron velocidades, buscar coincidencia en la categoría actual
            if velocidades_encontradas:
                logger.info(f"Buscando planes de {categoria_actual} que coincidan con velocidades: {velocidades_encontradas}")
                
                # Función para verificar si una velocidad coincide con un plan
                def velocidad_coincide(plan_velocidad, velocidades_buscadas):
                    plan_velocidad = str(plan_velocidad or '').lower().replace(' ', '')
                    for velocidad in velocidades_buscadas:
                        velocidad = velocidad.lower().replace(' ', '')
                        # Verificar coincidencia exacta o si la velocidad del plan contiene la buscada
                        if (velocidad in plan_velocidad) or (plan_velocidad in velocidad):
                            return True
                        # Verificar si son numéricamente iguales (ej: '100' en '100mbps')
                        try:
                            num_buscado = int(''.join(filter(str.isdigit, velocidad)))
                            num_plan = int(''.join(filter(str.isdigit, plan_velocidad)))
                            if num_buscado == num_plan:
                                return True
                        except:
                            continue
                    return False
                
                # Buscar planes que coincidan con la velocidad solicitada
                if isinstance(planes_categoria, list):
                    for plan in planes_categoria:
                        plan_velocidad = plan.get('velocidad', '')
                        if velocidad_coincide(plan_velocidad, velocidades_encontradas):
                            logger.info(f"Plan encontrado en {categoria_actual}: {plan.get('nombre')} - {plan_velocidad}")
                            # Guardar el plan completo en el contexto con su categoría
                            plan_con_categoria = plan.copy()
                            plan_con_categoria['categoria'] = categoria_actual
                            chat_memory.context['ultimo_plan_consultado'] = plan_con_categoria
                            chat_memory.context['categoria_actual'] = categoria_actual
                            return manejar_contratacion(plan_seleccionado=f"{plan.get('nombre', '')} - {plan_velocidad} - {plan.get('precio', '')}")
                
                # Si no se encontró coincidencia exacta, buscar en todas las categorías
                logger.info(f"No se encontró coincidencia exacta en {categoria_actual}, buscando en todas las categorías")
                for cat in ['residencial', 'empresarial', 'telefonía', 'videovigilancia']:
                    if cat == categoria_actual:
                        continue  # Ya buscamos aquí
                        
                    planes = _obtener_planes_por_categoria(cat)
                    if isinstance(planes, list):
                        for plan in planes:
                            plan_velocidad = plan.get('velocidad', '')
                            if velocidad_coincide(plan_velocidad, velocidades_encontradas):
                                logger.info(f"Plan encontrado en {cat}: {plan.get('nombre')} - {plan_velocidad}")
                                chat_memory.context['ultimo_plan_consultado'] = plan
                                chat_memory.context['ultima_categoria_consulta'] = cat
                                return manejar_contratacion(plan_seleccionado=f"{plan.get('nombre', '')} - {plan_velocidad} - {plan.get('precio', '')}")
            
            # Si no se encontró coincidencia, verificar si hay un plan en el historial reciente
            ultimo_plan = chat_memory.context.get('ultimo_plan_consultado')
            if ultimo_plan:
                if isinstance(ultimo_plan, dict):
                    return manejar_contratacion(plan_seleccionado=f"{ultimo_plan.get('nombre', '')} - {ultimo_plan.get('velocidad', '')} - {ultimo_plan.get('precio', '')}")
                return manejar_contratacion(plan_seleccionado=ultimo_plan)
            
            # Si no hay plan específico, continuar con la contratación normal
            logger.info("No se encontró plan específico, iniciando contratación genérica")
            return manejar_contratacion()
            
        # Manejar consultas sobre planes específicos (sin intención de contratar)
        if any(palabra in message_lower for palabra in ['plan de', 'plan de', 'cuánto cuesta', 'cuanto cuesta', 'qué incluye', 'que incluye']):
            # Obtener la categoría actual o usar 'residencial' como predeterminada
            categoria_actual = chat_memory.get_last_category() or 'residencial'
            
            # Buscar si se menciona un precio específico
            plan_por_precio = buscar_plan_por_precio(message_lower)
            if plan_por_precio:
                # Mostrar solo los detalles del plan sin iniciar el proceso de contratación
                return _obtener_planes_por_categoria(categoria_actual)
                    
            # Si no se encontró por precio, buscar por velocidad
            patron_velocidad = r'(\d+\s*(?:mbps?|gbps?|megas?|gigas?|mega|giga|mb|gb))'
            if re.search(patron_velocidad, message_lower, re.IGNORECASE):
                # Mantener la categoría actual al mostrar los planes
                return _obtener_planes_por_categoria(categoria_actual)
            
        # Manejar consultas sobre métodos de pago
        if any(palabra in message_lower for palabra in ['método de pago', 'metodo de pago', 'formas de pago', 'cómo pagar', 'como pagar', 'dónde pagar', 'donde pagar', 'número de cuenta', 'numero de cuenta', 'clabe', 'transferencia', 'depósito', 'deposito', 'oxxo', 'farmacias del ahorro']):
            # Verificar si el usuario mencionó un método de pago específico
            metodos_pago = ['tarjeta', 'efectivo', 'transferencia', 'depósito', 'oxxo', 'farmacias del ahorro']
            for metodo in metodos_pago:
                if metodo in message_lower:
                    chat_memory.set_payment_method(metodo)
                    break
                    
            return _obtener_metodos_pago()
            
        # Manejar consultas sobre fechas de pago
        if any(palabra in message_lower for palabra in ['cuándo pagar', 'cuando pagar', 'fecha de pago', 'fecha límite', 'fecha limite', 'vencimiento', 'cuándo vence', 'cuando vence']):
            return (
                "📅 *••• FECHAS DE PAGO •••* 📅\r\n\r\n"
                "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n\r\n"
                "📆 *PERÍODO DE FACTURACIÓN*\r\n"
                "   Del 1ro al 5 de cada mes\r\n\r\n"
                "💡 *RECOMENDACIONES*\r\n"
                "   ━━━━━━━━━━━━━━━━━━━━━━━\r\n"
                "   • ⏰ Realiza tu pago con anticipación para evitar cargos por mora.\r\n"
                "   • Guarda tu comprobante de pago por cualquier aclaración.\r\n\r\n"
                "💭 *¿Necesitas información sobre los métodos de pago disponibles?*"
                )
                
        # Buscar coincidencias exactas en los patrones de las intenciones
        for intent in intents:
            if not isinstance(intent, dict):
                continue
                
            try:
                patterns = intent.get('patterns', [])
                if not patterns or not isinstance(patterns, list):
                    continue
                    
                # Primero verificar coincidencia exacta
                if message_lower in [p.lower() for p in patterns]:
                    logger.info(f"Coincidencia exacta encontrada para: {message}")
                    responses = intent.get('responses', [])
                    if responses and isinstance(responses, list) and responses:
                        return random.choice(responses)
                    break
            except Exception as e:
                logger.error(f"Error al buscar en intenciones: {str(e)}\n{traceback.format_exc()}")
        
        # Si no se encontró coincidencia en las intenciones, intentar usar el modelo de lenguaje
        try:
            # Obtener contexto relevante de la memoria
            contexto_usuario = []
            
            # Añadir servicios preferidos si existen
            servicios_preferidos = chat_memory.get_preferred_services()
            if servicios_preferidos:
                contexto_usuario.append(f"El usuario ha mostrado interés en: {', '.join(servicios_preferidos)}.")
            
            # Añadir método de pago preferido si existe
            if chat_memory.context.get('preferred_payment_method'):
                contexto_usuario.append(f"Método de pago preferido: {chat_memory.context['preferred_payment_method']}.")
            
            # Añadir historial reciente de la conversación
            historial_reciente = chat_memory.get_recent_history(3)  # Últimos 3 mensajes
            if historial_reciente:
                contexto_usuario.append("Historial reciente de la conversación:")
                for msg in historial_reciente:
                    rol = "Usuario" if msg['role'] == 'user' else "Asistente"
                    contexto_usuario.append(f"- {rol}: {msg['message']}")
            
            # Crear un prompt de sistema que incluya información de la empresa y contexto del usuario
            system_prompt = (
                f"Eres un asistente de {empresa_info['nombre']}, una empresa de servicios de internet.\n"
                f"Horario de atención: {empresa_info['horario_atencion']}.\n"
                f"Teléfono de contacto: {telefono_contacto}.\n"
                "Sé amable, conciso y profesional en tus respuestas.\n"
                "Si no estás seguro de algo, ofrece contactar al soporte técnico.\n\n"
                "Información importante sobre nuestros servicios:\n"
                "- Ofrecemos planes de internet residencial desde 50 Mbps hasta 1 Gbps\n"
                "- Brindamos soporte técnico 24/7 para todos nuestros clientes\n\n"
                "Contexto del usuario:\n" + "\n".join(contexto_usuario)
            )
            
            # Usar el modelo para generar una respuesta
            response = llm_handler.get_response(
                user_message=message,
                system_prompt=system_prompt,
                use_streaming=False
            )
            
            # Guardar la respuesta en el historial
            if response:
                chat_memory.add_to_history('assistant', response)
                return response
            else:
                return "No pude generar una respuesta. ¿Podrías reformular tu pregunta?"
            
        except Exception as e:
            logger.error(f"Error al generar respuesta con el modelo: {str(e)}\n{traceback.format_exc()}")
            return ("Lo siento, estoy teniendo dificultades para procesar tu solicitud. "
                    f"Ponte en contacto con nuestro equipo de soporte al {telefono_contacto}.")
        
    except Exception as e:
        logger.error(f"Error inesperado en get_chat_response: {str(e)}\n{traceback.format_exc()}")
        return "Lo siento, ha ocurrido un error inesperado. Por favor, inténtalo de nuevo más tarde."