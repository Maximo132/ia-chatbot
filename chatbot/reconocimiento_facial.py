import cv2
import numpy as np
from datetime import datetime
import os
import time
from PIL import Image, ImageDraw, ImageFont
import math

def inicializar_camara():
    # Inicializar la cámara
    cap = cv2.VideoCapture(0)
    
    # Verificar si la cámara se abrió correctamente
    if not cap.isOpened():
        print("Error: No se pudo acceder a la cámara")
        return None
    
    # Configurar la resolución de la cámara (opcional)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    return cap

def dibujar_instrucciones(frame, texto, pos_y, color=(100, 255, 255)):
    # Función auxiliar para dibujar texto con estilo futurista
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.9
    thickness = 2
    
    # Obtener el tamaño del texto
    (text_width, text_height), _ = cv2.getTextSize(texto, font, font_scale, thickness)
    
    # Calcular posición X para centrar el texto
    x = (frame.shape[1] - text_width) // 2
    
    # Dibujar fondo con efecto de neón
    overlay = frame.copy()
    cv2.rectangle(overlay, (x - 10, pos_y - text_height - 5), 
                  (x + text_width + 10, pos_y + 5), (20, 20, 40), -1)
    alpha = 0.7
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
    
    # Dibujar texto con efecto de neón
    cv2.putText(frame, texto, (x + 2, pos_y + 2), 
                font, font_scale, (0, 0, 0), thickness + 1, cv2.LINE_AA)
    cv2.putText(frame, texto, (x, pos_y), 
                font, font_scale, color, thickness, cv2.LINE_AA)
    
    # Línea decorativa inferior
    cv2.line(frame, (x - 5, pos_y + 5), 
            (x + text_width + 5, pos_y + 5), 
            color, 1, cv2.LINE_AA)

def mostrar_estado(frame, estado, color=(100, 255, 255)):
    # Mostrar el estado con estilo futurista
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.9
    thickness = 2
    
    # Texto del estado
    texto_estado = f"» {estado} «"
    (text_width, text_height), _ = cv2.getTextSize(texto_estado, font, font_scale, thickness)
    
    # Posición centrada en la parte superior
    x = (frame.shape[1] - text_width) // 2
    y = 40
    
    # Fondo con efecto de neón
    overlay = frame.copy()
    cv2.rectangle(overlay, (x - 15, y - 25), 
                  (x + text_width + 15, y + 10), (10, 10, 30), -1)
    alpha = 0.8
    cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
    
    # Borde decorativo
    cv2.rectangle(frame, (x - 15, y - 25), 
                 (x + text_width + 15, y + 10), 
                 color, 1, cv2.LINE_AA)
    
    # Texto con efecto de neón
    cv2.putText(frame, texto_estado, (x + 2, y + 2), 
                font, font_scale, (0, 0, 0), thickness + 1, cv2.LINE_AA)
    cv2.putText(frame, texto_estado, (x, y), 
                font, font_scale, color, thickness, cv2.LINE_AA)

def get_screen_resolution():
    """Obtiene la resolución de la pantalla principal"""
    try:
        import tkinter as tk
        root = tk.Tk()
        width = root.winfo_screenwidth()
        height = root.winfo_screenheight()
        root.destroy()
        return width, height
    except:
        # Valores por defecto si no se puede obtener la resolución
        return 1920, 1080

def comparar_rostros(imagen1_path, imagen2_path):
    """
    Compara dos imágenes de rostros usando el método de histogramas de color y características estructurales
    :param imagen1_path: Ruta a la primera imagen
    :param imagen2_path: Ruta a la segunda imagen
    :return: (bool, float) Si coinciden y el porcentaje de similitud
    """
    try:
        # Cargar las imágenes
        img1 = cv2.imread(imagen1_path)
        img2 = cv2.imread(imagen2_path)
        
        if img1 is None or img2 is None:
            print("Error: No se pudo cargar una o ambas imágenes")
            return False, 0.0
        
        # Redimensionar imágenes al mismo tamaño
        img1 = cv2.resize(img1, (200, 200))
        img2 = cv2.resize(img2, (200, 200))
        
        # Convertir a escala de grises
        gray1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        gray2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
        
        # Calcular histogramas de color
        hist1 = cv2.calcHist([img1], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        hist2 = cv2.calcHist([img2], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        
        # Normalizar los histogramas
        hist1 = cv2.normalize(hist1, hist1).flatten()
        hist2 = cv2.normalize(hist2, hist2).flatten()
        
        # Calcular la correlación entre los histogramas
        correlacion = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)
        
        # Usar el clasificador LBPH para comparar rasgos faciales
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        
        # Crear etiquetas para el entrenamiento
        labels = np.array([1, 2])
        
        # Entrenar con las dos imágenes
        try:
            recognizer.train([gray1, gray2], labels)
            
            # Predecir la similitud
            label1, confidence1 = recognizer.predict(gray1)
            label2, confidence2 = recognizer.predict(gray2)
            
            # Calcular la confianza promedio (invertir porque menor es mejor en LBPH)
            conf_promedio = 100 - ((confidence1 + confidence2) / 2)
            
            # Combinar ambas métricas (peso mayor al LBPH)
            similitud = (correlacion * 30 + conf_promedio * 70) / 100
            
            # Ajustar umbral de coincidencia (reducido a 40% para mayor tolerancia)
            return similitud > 40, similitud
            
        except Exception as e:
            print(f"Error en reconocimiento facial: {e}")
            # Si falla el reconocimiento, usar solo la correlación de histogramas
            return correlacion > 0.4, correlacion * 100
        
    except Exception as e:
        print(f"Error al comparar rostros: {e}")
        return False, 0.0

extraer_rostro_ine = None  # Esta función ya no es necesaria con el nuevo enfoque

def main():
    try:
        # Inicializar el clasificador de rostros
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Verificar si se cargó correctamente el clasificador
        if face_cascade.empty():
            print("Error: No se pudo cargar el clasificador de rostros.")
            print("Asegúrate de que opencv-contrib-python esté instalado correctamente.")
            return
    except Exception as e:
        print(f"Error al cargar el clasificador de rostros: {e}")
        return
        
    # Ruta de la foto del INE
    ine_path = "ine.jpg"
    rostro_ine_path = ine_path  # Usamos la imagen completa para comparación
    
    # Verificar si el archivo del INE existe
    if not os.path.exists(ine_path):
        print(f"Error: No se encontró el archivo {ine_path}")
        print("Por favor, asegúrate de tener un archivo 'ine.jpg' en la misma carpeta.")
        print("Puedes arrastrar tu foto de INE a la carpeta y renombrarla como 'ine.jpg'")
        return
    
    # Inicializar la cámara
    try:
        cap = inicializar_camara()
        if cap is None:
            return
    except Exception as e:
        print(f"Error al inicializar la cámara: {e}")
        return
    
    # Configurar la ventana
    window_name = 'Reconocimiento Facial - Presiona ESC para salir'
    cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
    
    # Tamaño inicial deseado
    cap_width, cap_height = 1280, 720
    
    # Obtener resolución de la pantalla y centrar ventana
    screen_width, screen_height = get_screen_resolution()
    print(f"Resolución de pantalla detectada: {screen_width}x{screen_height}")
    
    # Posición inicial centrada
    pos_x = (screen_width - cap_width) // 2
    pos_y = (screen_height - cap_height) // 2
    
    # Configurar tamaño y posición inicial
    cv2.resizeWindow(window_name, cap_width, cap_height)
    cv2.moveWindow(window_name, pos_x, pos_y)
    
    # Variables para controlar el redimensionamiento
    last_size = (cap_width, cap_height)
    aspect_ratio = cap_width / cap_height
    
    # Estados del reconocimiento
    ESTADOS = {
        'INICIO': 'Coloca tu rostro en el círculo',
        'CENTRANDO': 'Centrando rostro...',
        'CAPTURANDO': '¡Sonríe! Tomando foto...',
        'CAPTURADO': '¡Foto tomada con éxito!',
        'ERROR': 'No se detectó rostro'
    }
    estado_actual = 'INICIO'
    
    # Tiempo de espera para la detección (en segundos)
    tiempo_deteccion = 3
    tiempo_inicio = None
    tiempo_captura = None
    captura_realizada = False
    
    # Bucle principal
    while True:
        # Capturar frame por frame
        ret, frame = cap.read()
        if not ret:
            print("Error: No se pudo capturar el frame")
            break
        
        # Voltear la imagen horizontalmente para que sea como un espejo
        frame = cv2.flip(frame, 1)
         
        # Obtener el tamaño actual de la ventana
        try:
            win_rect = cv2.getWindowImageRect(window_name)
            if win_rect[2] > 0 and win_rect[3] > 0:  # Verificar dimensiones válidas
                win_width = win_rect[2]
                win_height = win_rect[3]
            else:
                win_width = cap_width
                win_height = cap_height
        except:
            win_width = cap_width
            win_height = cap_height
        
        # Si el tamaño de la ventana cambió, mantener la relación de aspecto
        if (win_width, win_height) != last_size and win_width > 0 and win_height > 0:
            # Mantener relación de aspecto
            new_width = win_width
            new_height = int(new_width / aspect_ratio)
            
            # Si la altura calculada es mayor que la disponible, ajustar por altura
            if new_height > screen_height - 50:  # 50px de margen
                new_height = screen_height - 50
                new_width = int(new_height * aspect_ratio)
                
            # Solo redimensionar si hay un cambio significativo
            if abs(new_width - win_width) > 5 or abs(new_height - win_height) > 5:
                cv2.resizeWindow(window_name, new_width, new_height)
                last_size = (new_width, new_height)
        
        # Obtener dimensiones del frame
        height, width = frame.shape[:2]
        
        # Configuración del círculo perfectamente centrado
        centro_x = width // 2
        centro_y = height // 2
        centro = (centro_x, centro_y)
        radio = int(min(width, height) * 0.25)  # 25% del lado más pequeño
        
        # Dibujar líneas de referencia para verificar el centro
        cv2.line(frame, (centro_x, 0), (centro_x, height), (0, 255, 0), 1)  # Línea vertical
        cv2.line(frame, (0, centro_y), (width, centro_y), (0, 255, 0), 1)  # Línea horizontal
        
        # Mostrar información de depuración
        debug_text = [
            f"Centro: ({centro_x}, {centro_y})",
            f"Ventana: {win_width}x{win_height}",
            f"Frame: {width}x{height}",
            f"Relación de aspecto: {aspect_ratio:.2f}"
        ]
        
        for i, text in enumerate(debug_text):
            cv2.putText(frame, text, (10, 30 + i * 25), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
        
        # Crear una máscara para el efecto de desenfoque exterior
        mask = np.zeros_like(frame, dtype=np.uint8)
        cv2.circle(mask, centro, radio + 10, (255, 255, 255), -1)
        
        # Aplicar desenfoque gaussiano al área fuera del círculo
        # Reducir el desenfoque para no afectar tanto la imagen
        blurred = cv2.GaussianBlur(frame, (15, 15), 0)
        frame = np.where(mask == 255, frame, blurred)
        
        # Dibujar un punto rojo en el centro del círculo (más visible)
        cv2.circle(frame, centro, 6, (0, 0, 255), -1)
        cv2.circle(frame, centro, 8, (0, 0, 255), 2)
        
        # Círculo exterior con efecto de neón
        cv2.circle(frame, centro, radio + 5, (0, 255, 255), 2)  # Borde exterior amarillo
        cv2.circle(frame, centro, radio, (0, 165, 255), 2)      # Círculo principal naranja
        
        # Efecto de escaneo circular (animación)
        tiempo_actual = datetime.now().timestamp()
        angulo = (tiempo_actual * 100) % 360
        punto_final = (
            int(centro[0] + radio * np.cos(np.radians(angulo))),
            int(centro[1] + radio * np.sin(np.radians(angulo)))
        )
        cv2.line(frame, centro, punto_final, (0, 255, 255), 2)
        
        # Líneas guía diagonales con efecto de brillo
        line_length = int(radio * 0.9)
        for i in range(0, 360, 90):
            x = int(centro[0] + line_length * np.cos(np.radians(i + tiempo_actual * 50 % 360)))
            y = int(centro[1] + line_length * np.sin(np.radians(i + tiempo_actual * 50 % 360)))
            cv2.line(frame, centro, (x, y), (0, 255, 255, 0.7), 1, cv2.LINE_AA)
        
        # Puntos de referencia en el círculo
        for i in range(0, 360, 30):
            x = int(centro[0] + radio * np.cos(np.radians(i)))
            y = int(centro[1] + radio * np.sin(np.radians(i)))
            cv2.circle(frame, (x, y), 3, (0, 255, 255), -1)
        
        # Convertir a escala de grises para la detección de rostros
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detectar rostros
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(100, 100)
        )
        
        # Procesar detección de rostros
        rostro_detectado = False
        for (x, y, w, h) in faces:
            # Calcular el centro del rostro detectado
            centro_rostro = (x + w // 2, y + h // 2)
            
            # Verificar si el rostro está dentro del círculo
            distancia = np.sqrt((centro_rostro[0] - centro[0])**2 + (centro_rostro[1] - centro[1])**2)
            
            if distancia < radio - 20:  # Margen de 20 píxeles
                color = (0, 255, 0)  # Verde: rostro bien posicionado
                rostro_detectado = True
                
                # Iniciar o actualizar el temporizador
                if estado_actual != 'CENTRANDO' and estado_actual != 'CAPTURANDO' and estado_actual != 'CAPTURADO':
                    estado_actual = 'CENTRANDO'
                    tiempo_inicio = datetime.now()
                elif estado_actual == 'CENTRANDO':
                    tiempo_transcurrido = (datetime.now() - tiempo_inicio).total_seconds()
                    if tiempo_transcurrido >= tiempo_deteccion:
                        estado_actual = 'CAPTURANDO'
                        cv2.imwrite('rostro_detectado.jpg', frame)
                        tiempo_captura = datetime.now()
                        captura_realizada = True
            else:
                color = (0, 0, 255)  # Rojo: rostro fuera del círculo
                
            # Dibujar rectángulo alrededor del rostro
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        
        # Actualizar estado si no se detecta ningún rostro
        if not rostro_detectado and estado_actual != 'CAPTURADO':
            estado_actual = 'INICIO'
        
        # Mostrar instrucciones según el estado
        if estado_actual == 'INICIO':
            # Fondo semitransparente centrado en la parte inferior
            overlay = frame.copy()
            cv2.rectangle(overlay, (width//4, height - 100), 
                         (3*width//4, height - 20), (0, 0, 0), -1)
            alpha = 0.7  # Factor de transparencia
            cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0, frame)
            
            # Texto de instrucciones centrado
            mostrar_estado(frame, ESTADOS['INICIO'], (0, 255, 255))  # Amarillo
            cv2.putText(frame, "Asegúrate de tener buena iluminación", 
                       (width//3, height - 65), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.7, (0, 255, 255), 2)
            cv2.putText(frame, "Coloca tu rostro en el círculo rojo", 
                       (width//3 + 20, height - 35), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.7, (0, 255, 255), 2)
        elif estado_actual == 'CENTRANDO':
            tiempo_restante = tiempo_deteccion - (datetime.now() - tiempo_inicio).total_seconds()
            mostrar_estado(frame, f"{ESTADOS['CENTRANDO']} ({max(0, int(tiempo_restante))}s)", (255, 255, 0))
        elif estado_actual == 'CAPTURANDO':
            mostrar_estado(frame, ESTADOS['CAPTURANDO'], (0, 0, 255))  # Azul
        elif estado_actual == 'CAPTURADO':
            mostrar_estado(frame, ESTADOS['CAPTURADO'], (0, 255, 0))  # Verde
            # Mostrar mensaje de éxito por 3 segundos
            if (datetime.now() - tiempo_captura).total_seconds() < 3:
                cv2.putText(frame, "¡Foto guardada con éxito!", 
                           (centro_x - 150, centro_y + 50), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
            else:
                # Después de 3 segundos, volver al inicio
                estado_actual = 'INICIO'
                captura_realizada = False
        elif estado_actual == 'ERROR':
            mostrar_estado(frame, ESTADOS['ERROR'], (0, 0, 255))  # Rojo
        else:
            mostrar_estado(frame, ESTADOS[estado_actual], (0, 255, 255))  # Amarillo
        
        # Mostrar el frame
        cv2.imshow('Reconocimiento Facial - Presiona ESC para salir', frame)
        
        # Manejo de teclas
        key = cv2.waitKey(1) & 0xFF
        
        # Manejo de teclas
        if key == 27:  # Salir con ESC
            break
        elif key == 32:  # Tomar foto con ESPACIO
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f'foto_{timestamp}.jpg'
            cv2.imwrite(filename, frame)
            print(f"Foto guardada como {filename}")
            
            # Comparar con el rostro del INE si está disponible
            if rostro_ine_path and os.path.exists(rostro_ine_path):
                print("Comparando con el rostro del INE...")
                
                # Guardar temporalmente la imagen del rostro detectado
                temp_path = "temp_rostro.jpg"
                cv2.imwrite(temp_path, frame)
                
                try:
                    # Comparar las imágenes
                    coinciden, porcentaje = comparar_rostros(rostro_ine_path, temp_path)
                    
                    if coinciden:
                        mensaje = f"¡COINCIDENCIA! ({porcentaje:.1f}% de similitud)"
                        color = (0, 255, 0)  # Verde
                        print(f"¡Los rostros coinciden! Similitud: {porcentaje:.1f}%")
                    else:
                        mensaje = f"NO COINCIDEN ({porcentaje:.1f}% de similitud)"
                        color = (0, 0, 255)  # Rojo
                        print(f"Los rostros no coinciden. Similitud: {porcentaje:.1f}%")
                    
                    # Mostrar el resultado en la ventana
                    cv2.putText(frame, mensaje, 
                              (centro_x - 150, centro_y + 100), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)
                    
                    # Dibujar un rectángulo alrededor del rostro detectado
                    try:
                        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                        rostros = face_cascade.detectMultiScale(gray, 1.3, 5)
                        for (x, y, w, h) in rostros:
                            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
                    except Exception as e:
                        print(f"Advertencia: No se pudo dibujar el rectángulo: {e}")
                        
                except Exception as e:
                    print(f"Error al comparar rostros: {e}")
                    cv2.putText(frame, "Error al comparar rostros", 
                              (centro_x - 150, centro_y + 100), 
                              cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                finally:
                    # Eliminar el archivo temporal
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
            
            estado_actual = 'CAPTURADO'
            tiempo_captura = datetime.now()
            captura_realizada = True
        elif key in (ord('r'), ord('R')):  # Reiniciar con 'r' o 'R'
            estado_actual = 'INICIO'
            captura_realizada = False
        elif key in (ord('s'), ord('S')) and estado_actual == 'CAPTURADO':  # Guardar con 's' o 'S'
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f'rostro_guardado_{timestamp}.jpg'
            cv2.imwrite(filename, frame)
            print(f"Imagen guardada como {filename}")
    
    # Mostrar instrucciones de teclado
    cv2.putText(frame, "[ESPACIO] Tomar foto | [R] Reiniciar | [ESC] Salir", 
               (10, height - 10), cv2.FONT_HERSHEY_SIMPLEX, 
               0.6, (255, 255, 255), 1, cv2.LINE_AA)
    
    # Liberar recursos al salir
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()