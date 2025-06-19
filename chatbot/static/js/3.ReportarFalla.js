// ReportarFalla.js - Modern JavaScript for reporting issues

// Base de datos de prueba
const clientesDB = {
    '12345': {
        nombre: 'Max Vargas Santiago',
        telefono: '7292553437',
        correo: 'maxfriday16@gmail.com',
        direccion: 'Calle Heriberto Enríquez 69',
        servicio: 'Internet 200 Mbps'
    }
};

// Función para generar horarios disponibles (de 9:00 AM a 5:00 PM de lunes a viernes, 9:00 AM a 3:00 PM sábados)
const generarHorariosDisponibles = (esSabado = false) => {
    const horas = [];
    const horaInicio = 9; // 9:00 AM
    const horaFin = esSabado ? 15 : 17; // 3:00 PM o 5:00 PM
    
    for (let hora = horaInicio; hora <= horaFin; hora++) {
        // No agregar horario si es después de la hora de cierre
        if (hora === horaFin && esSabado) {
            continue; // No agregar horario después de las 3:00 PM los sábados
        }
        
        // Agregar horario en punto (ej: 9:00 AM)
        const horaFormato = hora > 12 ? hora - 12 : hora;
        const ampm = hora >= 12 ? 'PM' : 'AM';
        
        // Solo agregar si no es la última hora del sábado
        if (!(esSabado && hora === horaFin - 1)) {
            horas.push({
                hora: `${horaFormato}:00 ${ampm}`,
                valor: `${hora}:00:00`
            });
        }
        
        // Agregar media hora (ej: 9:30 AM) excepto para la última hora
        if (hora < horaFin - 1 || (hora === horaFin - 1 && !esSabado)) {
            // Para sábados, no agregar 2:30 PM si es la última hora
            if (!(esSabado && hora === 14)) {
                horas.push({
                    hora: `${horaFormato}:30 ${ampm}`,
                    valor: `${hora}:30:00`
                });
            }
        }
    }
    
    return horas;
};

// Función para actualizar los horarios disponibles según la fecha seleccionada
const actualizarHorarios = (fechaSeleccionada, horariosDisponiblesElement) => {
    if (!fechaSeleccionada) {
        return;
    }
    
    const fecha = new Date(fechaSeleccionada);
    const diaSemana = fecha.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    
    // No mostrar horarios si es domingo
    if (diaSemana === 0) {
        horariosDisponiblesElement.innerHTML = '<p class="no-horarios">No hay horarios disponibles los domingos.</p>';
        return;
    }
    
    // Generar horarios según sea sábado o día de semana
    const esSabado = diaSemana === 6;
    const horarios = generarHorariosDisponibles(esSabado);
    
    // Limpiar horarios anteriores
    horariosDisponiblesElement.innerHTML = '';
    
    // Agregar horarios al DOM
    horarios.forEach(horario => {
        const botonHora = document.createElement('button');
        botonHora.type = 'button';
        botonHora.className = 'btn-horario';
        botonHora.textContent = horario.hora;
        botonHora.dataset.hora = horario.valor;
        
        botonHora.addEventListener('click', function() {
            // Remover selección previa
            document.querySelectorAll('.btn-horario').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            // Seleccionar este horario
            this.classList.add('selected');
            // Actualizar campo oculto o atributo de datos
            document.getElementById('hora-seleccionada')?.remove();
            const inputOculto = document.createElement('input');
            inputOculto.type = 'hidden';
            inputOculto.id = 'hora-seleccionada';
            inputOculto.name = 'hora_visita';
            inputOculto.value = `${fechaSeleccionada} ${horario.valor}`;
            this.closest('form').appendChild(inputOculto);
        });
        
        horariosDisponiblesElement.appendChild(botonHora);
    });
};

// Tipos de fallas disponibles con sus respectivos pasos de solución
const tiposFalla = [
    { 
        id: 1, 
        nombre: 'Internet lento', 
        descripcion: 'Las páginas tardan en cargar o los videos se traban',
        soluciones: [
            '1. Apaga el módem por 30 segundos y luego vuelve a encenderlo',
            '2. ¿Hay alguien más en casa usando internet? Pregunta si están descargando algo o viendo videos, esto puede hacer que vaya más lento.',
            '3. Intenta acercarte más al router o, si puedes, conecta tu computadora directamente con un cable de red.',
            '4. Prueba con otro celular o tableta para ver si el problema es solo con un dispositivo.',
            '5. Si usas WiFi, intenta apagarlo y volverlo a encender en tu dispositivo.'
        ]
    },
    { 
        id: 2, 
        nombre: 'No hay internet', 
        descripcion: 'No puedes navegar en ningún sitio',
        soluciones: [
            '1. Revisa que todos los cables estén bien conectados (el cable de corriente y el que va a la pared).',
            '2. Apaga el módem, espera 30 segundos y vuelve a encenderlo. Dale tiempo para que se conecte (2-3 minutos).',
            '3. Mira las luces del módem: si la luz de "Internet" o "Online" está roja o apagada, hay un problema con la señal.',
            '4. Prueba con otro dispositivo para ver si el problema es solo con uno.',
           '5. Conéctate directamente al módem con un cable de red (Ethernet) para ver si el problema es con el WiFi o con la conexión en general.'
        ]
    },
    { 
        id: 3, 
        nombre: 'El módem no prende', 
        descripcion: 'El módem no enciende o tiene luces rojas',
        soluciones: [
            '1. Verifica que el cable de corriente esté bien conectado tanto al módem como al enchufe de la pared.',
            '2. Prueba con otro enchufe para descartar que sea un problema de la corriente eléctrica.',
           '3. Asegúrate de que el botón de encendido (si tiene) esté presionado o activado.',
            '4. Si ves luces rojas o naranjas, es posible que necesites ayuda técnica.',
            '5. Si el módem está caliente, apágalo por 10 minutos para que se enfríe y luego inténtalo de nuevo.'
        ]
    },
    { 
        id: 4, 
        nombre: 'Internet se corta', 
        descripcion: 'La conexión se va y vuelve constantemente',
        soluciones: [
            '1. Revisa si el módem está en un lugar fresco y ventilado (no lo pongas en espacios cerrados).',
            '2. ¿Hay microondas, teléfonos inalámbricos o bocinas cerca? Aleja el módem de estos aparatos.',
            '3. Si usas WiFi, intenta acercarte al módem para ver si el problema es la distancia.',
            '4. ¿Notas que se corta a ciertas horas? Podría ser por mucha gente usando internet en tu zona.',
            '5. Prueba conectando un dispositivo con cable para ver si el problema es solo del WiFi.'
        ]
    }
];

// Estado de la aplicación
let estado = {
    pasoActual: 1, // 1: Identificación, 2: Selección de falla, 3: Programar visita, 4: Confirmación
    cliente: null,
    fallaSeleccionada: null,
    fechaVisita: null,
    horaVisita: null
};

// Elementos del DOM
let elementos = {
    // Paso 1: Identificación
    paso1: document.getElementById('paso1'),
    identificacionForm: document.getElementById('identificacionForm'),
    numeroCliente: document.getElementById('numeroCliente'),
    identificacionError: document.getElementById('identificacionError'),
    noTengoNumero: document.getElementById('noTengoNumero'),
    
    // Paso 2: Selección de falla
    paso2: document.getElementById('paso2'),
    opcionesFalla: document.getElementById('opcionesFalla'),
    
    // Paso 3: Programar visita
    paso3: document.getElementById('paso3'),
    fechaVisita: document.getElementById('fecha-visita'),
    horaContainer: document.getElementById('hora-container'),
    horariosDisponibles: document.getElementById('horarios-disponibles'),
    
    // Paso 4: Confirmación
    paso4: document.getElementById('paso4'),
    resumenCliente: document.getElementById('resumenCliente'),
    resumenFalla: document.getElementById('resumenFalla'),
    resumenFecha: document.getElementById('resumenFecha'),
    
    // Botones de navegación
    btnSiguiente: document.getElementById('btnSiguiente'),
    btnSiguiente3: document.getElementById('btnSiguiente3'),
    btnAtras: document.getElementById('btnAtras'),
    btnAtras3: document.getElementById('btnAtras3'),
    btnAtras4: document.getElementById('btnAtras4'),
    btnEnviarReporte: document.getElementById('btnEnviarReporte')
};

// Inicializar el datepicker cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Cargar flatpickr para el selector de fechas
    const flatpickrScript = document.createElement('script');
    flatpickrScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
    flatpickrScript.onload = function() {
        // Cargar localización en español
        const flatpickrLocale = document.createElement('script');
        flatpickrLocale.src = 'https://npmcdn.com/flatpickr/dist/l10n/es.js';
        flatpickrLocale.onload = function() {
            // Configuración de flatpickr
            flatpickr("#fecha-visita", {
                locale: "es",
                minDate: "today",
                dateFormat: "Y-m-d",
                disable: [
                    function(date) {
                        // Deshabilitar domingos
                        return (date.getDay() === 0);
                    }
                ],
                onChange: function(selectedDates, dateStr) {
                    const horariosDisponibles = document.getElementById('horarios-disponibles');
                    actualizarHorarios(dateStr, horariosDisponibles);
                    // Mostrar contenedor de horarios
                    document.getElementById('hora-container').style.display = 'block';
                    // Actualizar estado
                    estado.fechaVisita = dateStr;
                    estado.horaVisita = null; // Resetear hora al cambiar fecha
                    // Actualizar botón siguiente
                    elementos.btnSiguiente3.disabled = true;
                }
            });
        };
        document.head.appendChild(flatpickrLocale);
    };
    document.head.appendChild(flatpickrScript);
    
    // Cargar estilos de flatpickr
    const flatpickrStyles = document.createElement('link');
    flatpickrStyles.rel = 'stylesheet';
    flatpickrStyles.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
    document.head.appendChild(flatpickrStyles);
    
    // Inicializar la interfaz
    inicializarInterfaz();
    
    // Agregar manejador directo al botón de visita a domicilio
    document.addEventListener('click', function(e) {
        if (e.target && (e.target.id === 'btnVisitaDomicilio' || e.target.closest('#btnVisitaDomicilio'))) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Manejador directo del botón de visita a domicilio');
            
            const paso3 = document.getElementById('paso3');
            if (paso3) {
                // Ocultar otros pasos
                const pasos = document.querySelectorAll('.paso');
                pasos.forEach(paso => paso.style.display = 'none');
                
                // Mostrar paso 3
                paso3.style.display = 'block';
                console.log('Paso 3 mostrado por manejador directo');
                
                // Inicializar el calendario
                inicializarCalendario();
                
                // Desplazar al paso 3
                window.scrollTo({
                    top: paso3.offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
    
    // Inicializar el calendario
    function inicializarCalendario() {
        const currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();
        let selectedDate = null;
        let selectedTime = null;
        
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        const daysContainer = document.getElementById('calendarDays');
        const monthYearElement = document.getElementById('currentMonth');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const timeSlotsContainer = document.getElementById('timeSlots');
        const siguienteBtn = document.getElementById('btnSiguiente3');
        
        // Horarios disponibles
        const timeSlots = {
            weekday: [
                '09:00 - 11:00',
                '11:00 - 13:00',
                '13:00 - 15:00',
                '15:00 - 17:00'
            ],
            saturday: [
                '09:00 - 11:00',
                '11:00 - 13:00',
                '13:00 - 15:00'
            ]
        };
        
        // Función para formatear el texto del horario
        function formatearHora(timeStr) {
            // Dividir la cadena en hora de inicio y fin
            const [start, end] = timeStr.split(' - ');
            const [startHora, startMin] = start.split(':');
            const [endHora, endMin] = end.split(':');
            
            // Convertir a formato de 12 horas
            const formatHora = (h) => {
                const hora = parseInt(h, 10);
                if (hora === 0) return '12 AM';
                if (hora < 12) return `${hora} AM`;
                if (hora === 12) return '12 PM';
                return `${hora - 12} PM`;
            };
            
            return {
                start: formatHora(startHora),
                end: formatHora(endHora)
            };
        }
        
        // Renderizar horarios según el día seleccionado
        function renderTimeSlots(selectedDate) {
            timeSlotsContainer.innerHTML = '';
            
            // Determinar si es sábado (6) o día de semana (0-5, donde 0 es domingo)
            const isSaturday = selectedDate ? selectedDate.getDay() === 6 : false;
            const slots = isSaturday ? timeSlots.saturday : timeSlots.weekday;
            
            // Mostrar mensaje si es domingo
            if (selectedDate && selectedDate.getDay() === 0) {
                timeSlotsContainer.innerHTML = `
                    <div class="no-availability">
                        <i class="far fa-calendar-times"></i>
                        <p>No hay horarios disponibles los domingos</p>
                    </div>
                `;
                return;
            }
            
            // Crear contenedor de horarios
            const container = document.createElement('div');
            container.className = 'time-slots';
            
            // Mostrar horarios disponibles
            slots.forEach(time => {
                const timeSlot = document.createElement('div');
                const isSelected = selectedTime === time;
                const formattedTime = formatearHora(time);
                
                timeSlot.className = `time-slot${isSelected ? ' selected' : ''}`;
                
                // Crear estructura HTML mejorada
                timeSlot.innerHTML = `
                    <div class="time-slot-content">
                        <span class="time-start">${formattedTime.start}</span>
                        <span class="time-separator">-</span>
                        <span class="time-end">${formattedTime.end}</span>
                    </div>
                `;
                
                timeSlot.addEventListener('click', () => {
                    // Deseleccionar todos los demás horarios
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        slot.classList.remove('selected');
                    });
                    
                    // Seleccionar este horario
                    timeSlot.classList.add('selected');
                    selectedTime = time;
                    actualizarBotonSiguiente();
                });
                
                // Agregar efecto de presión táctil
                timeSlot.addEventListener('mousedown', () => {
                    if (!timeSlot.classList.contains('selected')) {
                        timeSlot.style.transform = 'scale(0.98)';
                    }
                });
                
                timeSlot.addEventListener('mouseup', () => {
                    timeSlot.style.transform = '';
                });
                
                timeSlot.addEventListener('mouseleave', () => {
                    timeSlot.style.transform = '';
                });
                
                container.appendChild(timeSlot);
            });
            
            timeSlotsContainer.appendChild(container);
        }
        
        // Renderizar calendario
        function renderCalendar() {
            // Actualizar mes y año
            monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
            
            // Obtener primer día del mes y último día del mes
            const firstDay = new Date(currentYear, currentMonth, 1).getDay();
            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
            
            daysContainer.innerHTML = '';
            
            // Días del mes anterior
            for (let i = firstDay - 1; i >= 0; i--) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day disabled';
                dayElement.textContent = daysInPrevMonth - i;
                daysContainer.appendChild(dayElement);
            }
            
            // Días del mes actual
            const today = new Date();
            const currentDay = today.getDate();
            const currentMonthToday = today.getMonth();
            const currentYearToday = today.getFullYear();
            
            for (let i = 1; i <= daysInMonth; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day';
                dayElement.textContent = i;
                
                // Marcar día actual
                if (i === currentDay && currentMonth === currentMonthToday && currentYear === currentYearToday) {
                    dayElement.classList.add('today');
                }
                
                // Verificar si es domingo (0) o un día pasado
                const dayOfWeek = new Date(currentYear, currentMonth, i).getDay();
                const isSunday = dayOfWeek === 0; // 0 es domingo
                const isPastDate = (currentYear < currentYearToday) || 
                                 (currentYear === currentYearToday && currentMonth < currentMonthToday) ||
                                 (currentYear === currentYearToday && currentMonth === currentMonthToday && i < currentDay);
                
                if (isPastDate || isSunday) {
                    dayElement.classList.add('disabled');
                    if (isSunday) {
                        dayElement.title = 'No hay disponibilidad los domingos';
                    }
                } else {
                    dayElement.addEventListener('click', () => {
                        document.querySelectorAll('.day').forEach(day => {
                            day.classList.remove('selected');
                        });
                        dayElement.classList.add('selected');
                        selectedDate = new Date(currentYear, currentMonth, i);
                        renderTimeSlots(selectedDate); // Actualizar horarios según el día seleccionado
                        actualizarBotonSiguiente();
                    });
                }
                
                daysContainer.appendChild(dayElement);
            }
            
            // Completar con días del siguiente mes
            const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
            const remainingDays = totalCells - (firstDay + daysInMonth);
            
            for (let i = 1; i <= remainingDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'day disabled';
                dayElement.textContent = i;
                daysContainer.appendChild(dayElement);
            }
        }
        
        // Actualizar estado del botón Siguiente
        function actualizarBotonSiguiente() {
            if (siguienteBtn) {
                siguienteBtn.disabled = !(selectedDate && selectedTime);
            }
        }
        
        // Manejadores de eventos
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendar();
            });
        }
        
        // Inicializar
        renderCalendar();
        renderTimeSlots();
        actualizarBotonSiguiente();
        
        // Manejador para el botón Siguiente
        if (siguienteBtn) {
            siguienteBtn.addEventListener('click', () => {
                if (selectedDate && selectedTime) {
                    // Formatear fecha seleccionada
                    const formattedDate = selectedDate.toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    // Guardar en el estado
                    estado.fechaVisita = {
                        fecha: selectedDate,
                        fechaFormateada: formattedDate,
                        horario: selectedTime,
                        comentarios: document.getElementById('comentariosVisita').value
                    };
                    
                    console.log('Fecha seleccionada:', estado.fechaVisita);
                    
                    // Ocultar el paso actual
                    const paso3 = document.getElementById('paso3');
                    if (paso3) {
                        paso3.style.display = 'none';
                    }
                    
                    // Mostrar el paso de confirmación (paso 4)
                    const paso4 = document.getElementById('paso4');
                    if (paso4) {
                        paso4.style.display = 'block';
                        
                        // Actualizar el resumen de la cita
                        const resumenFecha = document.getElementById('resumen-fecha');
                        const resumenHora = document.getElementById('resumen-hora');
                        const resumenComentarios = document.getElementById('resumen-comentarios');
                        
                        if (resumenFecha) resumenFecha.textContent = formattedDate;
                        if (resumenHora) resumenHora.textContent = selectedTime;
                        if (resumenComentarios) {
                            resumenComentarios.textContent = estado.fechaVisita.comentarios || 'Ninguno';
                        }
                        
                        // Desplazar al paso de confirmación
                        window.scrollTo({
                            top: paso4.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
        
        // Manejador para el botón Concluir
        const btnConcluir = document.getElementById('btnConcluir');
        if (btnConcluir) {
            btnConcluir.addEventListener('click', () => {
                // Validar que se haya seleccionado fecha y hora
                if (!selectedDate || !selectedTime) {
                    // Mostrar notificación estilo Apple
                    Swal.fire({
                        title: 'Selección requerida',
                        html: `
                            <div style="text-align: center;">
                                <i class="far fa-calendar-exclamation" style="font-size: 48px; color: #007AFF; margin-bottom: 15px;"></i>
                                <p style="font-size: 16px; color: #1c1c1e; margin: 10px 0 20px; line-height: 1.5;">
                                    Por favor, selecciona una fecha y hora para programar tu cita.
                                </p>
                            </div>
                        `,
                        showConfirmButton: true,
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#007AFF',
                        customClass: {
                            confirmButton: 'swal2-confirm-button',
                            popup: 'swal2-popup-custom'
                        },
                        buttonsStyling: true,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        allowEnterKey: false,
                        showCloseButton: false,
                        showCancelButton: false,
                        focusConfirm: true,
                        backdrop: `rgba(0,0,0,0.3)`
                    });
                    return;
                }
                
                // Obtener comentarios
                const comentarios = document.getElementById('comentariosVisita').value;
                
                // Formatear fecha seleccionada
                const formattedDate = selectedDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                
                // Actualizar estado con los datos de la cita
                estado.fechaVisita = {
                    fecha: selectedDate,
                    fechaFormateada: formattedDate,
                    horario: selectedTime,
                    comentarios: comentarios,
                    estado: 'pendiente',
                    fechaRegistro: new Date().toISOString()
                };
                
                console.log('Cita agendada:', estado.fechaVisita);
                
                // Aquí iría el código para enviar los datos al servidor
                // Por ejemplo:
                // fetch('/api/agendar-cita', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(estado.fechaVisita)
                // })
                // .then(response => response.json())
                // .then(data => {
                //     console.log('Cita guardada:', data);
                //     // Mostrar mensaje de éxito
                //     mostrarMensajeExito();
                // })
                // .catch(error => {
                //     console.error('Error al guardar la cita:', error);
                //     alert('Ocurrió un error al agendar la cita. Por favor, inténtalo de nuevo.');
                // });
                
                // Por ahora, mostramos un mensaje de éxito
                mostrarMensajeExito();
                
                function mostrarMensajeExito() {
                    // Crear el contenido HTML para la notificación
                    const htmlContent = `
                        <div style="text-align: left; margin: 10px 0 20px; font-size: 15px; color: #333;">
                            <div style="margin-bottom: 15px; display: flex; align-items: center;">
                                <div style="background: #4CAF50; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                                    <i class="fas fa-check" style="color: white; font-size: 18px;"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 600; font-size: 17px; margin-bottom: 2px;">Cita Agendada</div>
                                    <div style="font-size: 13px; color: #666;">Hemos programado tu cita con éxito</div>
                                </div>
                            </div>
                            <div style="background: #f8f9fa; border-radius: 12px; padding: 15px; margin-top: 15px;">
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <i class="far fa-calendar-alt" style="color: #007AFF; margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <div>
                                        <div style="font-size: 13px; color: #666;">Fecha</div>
                                        <div style="font-weight: 500;">${formattedDate}</div>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; margin-bottom: 10px;">
                                    <i class="far fa-clock" style="color: #007AFF; margin-right: 10px; width: 20px; text-align: center;"></i>
                                    <div>
                                        <div style="font-size: 13px; color: #666;">Hora</div>
                                        <div style="font-weight: 500;">${selectedTime}</div>
                                    </div>
                                </div>
                                ${comentarios ? `
                                <div style="display: flex; align-items: flex-start;">
                                    <i class="far fa-comment-alt" style="color: #007AFF; margin-right: 10px; margin-top: 3px; width: 20px; text-align: center;"></i>
                                    <div>
                                        <div style="font-size: 13px; color: #666;">Comentarios</div>
                                        <div style="font-weight: 500;">${comentarios}</div>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    `;

                    // Mostrar notificación con SweetAlert2
                    Swal.fire({
                        html: htmlContent,
                        showConfirmButton: true,
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#007AFF',
                        width: '400px',
                        padding: '20px',
                        customClass: {
                            popup: 'swal-custom-popup',
                            confirmButton: 'swal-custom-button'
                        },
                        didOpen: () => {
                            // Agregar estilos adicionales
                            const style = document.createElement('style');
                            style.textContent = `
                                .swal2-popup.swal2-modal {
                                    border-radius: 14px !important;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                }
                                .swal2-title {
                                    display: none;
                                }
                                .swal2-html-container {
                                    margin: 0 !important;
                                }
                                .swal-custom-button {
                                    border-radius: 10px !important;
                                    font-weight: 500 !important;
                                    padding: 10px 24px !important;
                                }
                            `;
                            document.head.appendChild(style);
                        }
                    }).then((result) => {
                        // Reiniciar el formulario después de aceptar
                        if (result.isConfirmed) {
                            // Aquí podrías redirigir a otra página o reiniciar el formulario
                            // Por ejemplo, para reiniciar:
                         window.location.reload();
                            
                            // O para ir al inicio:
                            // mostrarPaso(1);
                        }
                    });
                }
            });
        }
        
        // Manejador para el botón Atrás
        const btnAtras3 = document.getElementById('btnAtras3');
        if (btnAtras3) {
            btnAtras3.addEventListener('click', () => {
                // Ocultar el paso actual
                const paso3 = document.getElementById('paso3');
                if (paso3) {
                    paso3.style.display = 'none';
                }
                
                // Mostrar el paso anterior (paso 2)
                const paso2 = document.getElementById('paso2');
                if (paso2) {
                    paso2.style.display = 'block';
                    
                    // Desplazar al paso 2
                    window.scrollTo({
                        top: paso2.offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el datepicker
    if (typeof flatpickr !== 'undefined') {
        flatpickr("#fecha-visita", {
            locale: "es",
            minDate: "today",
            dateFormat: "Y-m-d",
            disable: [
                function(date) {
                    // Deshabilitar domingos
                    return (date.getDay() === 0);
                }
            ],
            onChange: function(selectedDates, dateStr) {
                const horariosDisponibles = document.getElementById('horarios-disponibles');
                actualizarHorarios(dateStr, horariosDisponibles);
                // Mostrar contenedor de horarios
                document.getElementById('hora-container').style.display = 'block';
                
                // Guardar la fecha seleccionada en el estado
                estado.fechaVisita = dateStr;
            }
        });
    }
    // Mapear elementos del DOM
    elementos = {
        // Paso 1: Identificación
        identificacionForm: document.getElementById('identificacionForm'),
        numeroCliente: document.getElementById('numeroCliente'),
        noTengoNumeroBtn: document.getElementById('noTengoNumero'),
        identificacionError: document.getElementById('identificacionError'),
        
        // Contenedores de pasos
        paso1: document.getElementById('paso1'),
        paso2: document.getElementById('paso2'),
        paso3: document.getElementById('paso3'),
        
        // Botones de navegación
        btnAtras: document.getElementById('btnAtras'),
        btnSiguiente: document.getElementById('btnSiguiente'),
        btnEnviarReporte: document.getElementById('btnEnviarReporte'),
        
        // Otros elementos
        opcionesFalla: document.getElementById('opcionesFalla')
    };
    
    console.log('Elementos iniciales:', elementos);
    
    console.log('Elementos iniciales:', elementos);
    
    // Inicializar la interfaz
    inicializarInterfaz();
    // Configurar manejadores de eventos
    configurarEventListeners();
});

/**
 * Inicializa los elementos de la interfaz
 */
function inicializarInterfaz() {
    // Generar el HTML para las opciones de falla
    if (elementos.opcionesFalla) {
        const opcionesHTML = tiposFalla.map(falla => {
            // Seleccionar ícono según el tipo de falla
            let icono = 'fa-wifi';
            switch(falla.id) {
                case 1: icono = 'fa-tachometer-alt'; break; // Internet lento
                case 2: icono = 'fa-wifi-slash'; break;     // Sin conexión
                case 3: icono = 'fa-ethernet'; break;       // Problemas con módem
                case 4: icono = 'fa-sync-alt'; break;       // Intermitencia
            }
            
            return `
                <div class="opcion-falla" data-id="${falla.id}">
                    <div class="opcion-icono">
                        <i class="fas ${icono}"></i>
                    </div>
                    <div class="opcion-contenido">
                        <h3>${falla.nombre}</h3>
                        <p>${falla.descripcion}</p>
                    </div>
                    <div class="opcion-seleccion">
                        <i class="fas fa-check"></i>
                    </div>
                </div>`;
        }).join('');
        
        elementos.opcionesFalla.innerHTML = opcionesHTML;
    }
    
    console.log('Interfaz inicializada');
    
    // Configurar el paso 3 (Confirmación)
    elementos.resumenCliente = document.getElementById('resumenCliente');
    elementos.resumenFalla = document.getElementById('resumenFalla');
    elementos.resumenFecha = document.getElementById('resumenFecha');
    elementos.descripcionFalla = document.getElementById('descripcionFalla');
    elementos.btnAtras2 = document.getElementById('btnAtras2');

    // Configurar manejadores de eventos para los botones
    if (elementos.btnAtras) {
        elementos.btnAtras.addEventListener('click', retrocederPaso);
    }
    
    if (elementos.btnAtras2) {
        elementos.btnAtras2.addEventListener('click', retrocederPaso);
    }
    
    if (elementos.btnSiguiente) {
        elementos.btnSiguiente.addEventListener('click', avanzarPaso);
    }
    
    if (elementos.btnEnviarReporte) {
        elementos.btnEnviarReporte.addEventListener('click', enviarReporte);
    }
    
    // Configurar eventos para las opciones de falla
    if (elementos.opcionesFalla) {
        elementos.opcionesFalla.addEventListener('click', function(e) {
            const opcion = e.target.closest('.opcion-falla');
            if (opcion) {
                seleccionarFalla(parseInt(opcion.dataset.id));
            }
        });
    }
}

/**
 * Configura los manejadores de eventos
 */
function configurarEventListeners() {
    // Enlace de ayuda para encontrar el número de cliente
    const helpLink = document.querySelector('.help-link');
    if (helpLink) {
        helpLink.addEventListener('click', function(e) {
            e.preventDefault();
            mostrarAyudaNumeroCliente();
        });
    }
    
    // Manejador para el formulario de identificación
    if (elementos.identificacionForm) {
        elementos.identificacionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validarNumeroCliente(e);
        });
    }
    
    // Manejador para el botón "No tengo número"
    const noTengoNumeroBtn = document.getElementById('noTengoNumero');
    if (noTengoNumeroBtn) {
        noTengoNumeroBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Mostrar formulario para ingresar datos del cliente con diseño estilo Apple
            Swal.fire({
                title: 'Validación de Cliente',
                html: `
                    <div class="swal2-html-container" style="text-align: left; color: #1d1d1f; width: 100%;">
                        <p style="font-size: 14px; color: #86868b; margin: 0 0 20px 0;">Por favor ingresa tus datos para continuar</p>
                        
                        <div class="input-group">
                            <label for="nombreCliente" class="input-label">Nombre completo</label>
                            <input type="text" id="nombreCliente" class="input-field" 
                                   placeholder="Ej: Juan Pérez García" autocomplete="name" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="telefonoCliente" class="input-label">Teléfono</label>
                            <input type="tel" id="telefonoCliente" class="input-field" 
                                   placeholder="000 000-0000" autocomplete="tel" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="emailCliente" class="input-label">Correo electrónico</label>
                            <input type="email" id="emailCliente" class="input-field" 
                                   placeholder="correo@ejemplo.com" autocomplete="email" required>
                        </div>
                        
                        <div class="input-group">
                            <label for="direccionCliente" class="input-label">Dirección completa</label>
                            <textarea id="direccionCliente" class="input-field" 
                                     rows="3" 
                                     placeholder="Calle, número, colonia, código postal" 
                                     required></textarea>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#007AFF',
                cancelButtonColor: 'transparent',
                showLoaderOnConfirm: true,
                customClass: {
                    popup: 'swal2-modal-apple',
                    confirmButton: 'swal2-confirm-apple',
                    cancelButton: 'swal2-cancel-apple',
                    actions: 'swal2-actions-apple'
                },
                didOpen: () => {
                    // Agregar validación en tiempo real
                    const nombreInput = document.getElementById('nombreCliente');
                    const telefonoInput = document.getElementById('telefonoCliente');
                    const emailInput = document.getElementById('emailCliente');
                    const direccionInput = document.getElementById('direccionCliente');
                    const confirmButton = document.querySelector('.swal2-confirm');
                    
                    // Función para validar el nombre
                    const validarNombre = (nombre) => {
                        if (!nombre) return 'Este campo es requerido';
                        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,50}$/.test(nombre)) {
                            return 'Solo letras y espacios (5-50 caracteres)';
                        }
                        return '';
                    };
                    
                    // Función para validar el teléfono
                    const validarTelefono = (telefono) => {
                        if (!telefono) return 'Este campo es requerido';
                        const soloNumeros = telefono.replace(/[^0-9]/g, '');
                        if (soloNumeros.length !== 10) {
                            return 'Debe tener 10 dígitos';
                        }
                        return '';
                    };
                    
                    // Función para validar el email
                    const validarEmail = (email) => {
                        if (!email) return 'Este campo es requerido';
                        if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
                            return 'Correo electrónico inválido';
                        }
                        return '';
                    };
                    
                    // Función para validar la dirección
                    const validarDireccion = (direccion) => {
                        if (!direccion) return 'Este campo es requerido';
                        if (direccion.length < 10) {
                            return 'Mínimo 10 caracteres';
                        }
                        return '';
                    };
                    
                    // Función para actualizar el estado del botón de confirmación
                    const actualizarEstadoBoton = () => {
                        const nombreError = validarNombre(nombreInput.value);
                        const telefonoError = validarTelefono(telefonoInput.value);
                        const emailError = validarEmail(emailInput.value);
                        const direccionError = validarDireccion(direccionInput.value);
                        
                        confirmButton.disabled = !!(nombreError || telefonoError || emailError || direccionError);
                    };
                    
                    // Función para mostrar/ocultar mensajes de error
                    const actualizarMensajeError = (input, error) => {
                        let errorElement = input.nextElementSibling;
                        if (error) {
                            input.style.borderColor = '#ff3b30';
                            if (!errorElement || !errorElement.classList.contains('error-message')) {
                                errorElement = document.createElement('div');
                                errorElement.className = 'error-message';
                                errorElement.style.color = '#ff3b30';
                                errorElement.style.fontSize = '12px';
                                errorElement.style.marginTop = '4px';
                                input.parentNode.insertBefore(errorElement, input.nextSibling);
                            }
                            errorElement.textContent = error;
                        } else {
                            input.style.borderColor = '#d2d2d7';
                            if (errorElement && errorElement.classList.contains('error-message')) {
                                errorElement.remove();
                            }
                        }
                    };
                    
                    // Configurar eventos de entrada para validación en tiempo real
                    nombreInput.addEventListener('input', (e) => {
                        const error = validarNombre(e.target.value);
                        actualizarMensajeError(nombreInput, error);
                        actualizarEstadoBoton();
                    });
                    
                    telefonoInput.addEventListener('input', (e) => {
                        // Formatear automáticamente el teléfono mientras se escribe
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 10) value = value.substring(0, 10);
                        
                        if (value.length > 6) {
                            value = `(${value.substring(0,3)}) ${value.substring(3,6)}-${value.substring(6)}`;
                        } else if (value.length > 3) {
                            value = `(${value.substring(0,3)}) ${value.substring(3)}`;
                        } else if (value.length > 0) {
                            value = `(${value}`;
                        }
                        
                        e.target.value = value;
                        const error = validarTelefono(value);
                        actualizarMensajeError(telefonoInput, error);
                        actualizarEstadoBoton();
                    });
                    
                    emailInput.addEventListener('input', (e) => {
                        const error = validarEmail(e.target.value);
                        actualizarMensajeError(emailInput, error);
                        actualizarEstadoBoton();
                    });
                    
                    direccionInput.addEventListener('input', (e) => {
                        const error = validarDireccion(e.target.value);
                        actualizarMensajeError(direccionInput, error);
                        actualizarEstadoBoton();
                    });
                    
                    // Validación inicial
                    actualizarEstadoBoton();
                },
                preConfirm: () => {
                    // Obtener referencias a los elementos del formulario
                    const nombreInput = document.getElementById('nombreCliente');
                    const telefonoInput = document.getElementById('telefonoCliente');
                    const emailInput = document.getElementById('emailCliente');
                    const direccionInput = document.getElementById('direccionCliente');
                    
                    // Obtener y limpiar los valores
                    const nombre = nombreInput.value.trim();
                    let telefono = telefonoInput.value.trim();
                    const email = emailInput.value.trim().toLowerCase();
                    const direccion = direccionInput.value.trim();
                    
                    // Función para mostrar mensaje de error y hacer focus en el campo
                    const mostrarError = (mensaje, elemento) => {
                        Swal.showValidationMessage(mensaje);
                        if (elemento) {
                            elemento.focus();
                            // Desplazar la vista hasta el elemento con error
                            elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                        return false;
                    };
                    
                    // Validar que todos los campos estén completos
                    if (!nombre) return mostrarError('Por favor ingresa tu nombre completo', nombreInput);
                    if (!telefono) return mostrarError('Por favor ingresa tu número de teléfono', telefonoInput);
                    if (!email) return mostrarError('Por favor ingresa tu correo electrónico', emailInput);
                    if (!direccion) return mostrarError('Por favor ingresa tu dirección completa', direccionInput);
                    
                    // Validar nombre (solo letras y espacios, entre 5 y 50 caracteres)
                    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,50}$/.test(nombre)) {
                        return mostrarError('El nombre debe contener solo letras y tener entre 5 y 50 caracteres', nombreInput);
                    }
                    
                    // Limpiar y validar teléfono (solo números, 10 dígitos)
                    const soloNumeros = telefono.replace(/[^0-9]/g, '');
                    if (!/^[0-9]{10}$/.test(soloNumeros)) {
                        return mostrarError('El teléfono debe tener 10 dígitos', telefonoInput);
                    }
                    
                    // Formatear teléfono
                    const telefonoFormateado = `(${soloNumeros.substring(0,3)}) ${soloNumeros.substring(3,6)}-${soloNumeros.substring(6)}`;
                    
                    // Validar email
                    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) {
                        return mostrarError('Por favor ingresa un correo electrónico válido (ejemplo@dominio.com)', emailInput);
                    }
                    
                    // Validar que el email tenga un dominio válido
                    const dominio = email.split('@')[1];
                    if (!dominio || dominio.indexOf('.') === -1) {
                        return mostrarError('El correo electrónico debe incluir un dominio válido (ejemplo@dominio.com)', emailInput);
                    }
                    
                    // Validar dirección (mínimo 10 caracteres, máximo 200)
                    if (direccion.length < 10) {
                        return mostrarError('La dirección debe tener al menos 10 caracteres', direccionInput);
                    }
                    
                    if (direccion.length > 200) {
                        return mostrarError('La dirección no puede exceder los 200 caracteres', direccionInput);
                    }
                    
                    // Validar que la dirección contenga al menos un número
                    if (!/\d/.test(direccion)) {
                        return mostrarError('La dirección debe incluir el número de calle', direccionInput);
                    }
                    
                    // Formatear nombre (primera letra de cada palabra en mayúscula)
                    const nombreFormateado = nombre
                        .split(' ')
                        .filter(word => word.length > 0)
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                    
                    // Formatear dirección (primera letra en mayúscula)
                    const direccionFormateada = direccion
                        .split(' ')
                        .map((word, index) => index === 0 
                            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            : word.toLowerCase())
                        .join(' ');
                    
                    // Retornar los datos validados y formateados
                    return { 
                        nombre: nombreFormateado, 
                        telefono: telefonoFormateado, 
                        email: email.toLowerCase(),
                        direccion: direccionFormateada 
                    };
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    const { nombre, telefono, email, direccion } = result.value;
                    
                    // Verificar si el cliente existe en la base de datos
                    let clienteEncontrado = null;
                    const telefonoLimpio = telefono.replace(/[^0-9]/g, ''); // Quitar formato del teléfono
                    
                    // Buscar en la base de datos
                    for (const [id, cliente] of Object.entries(clientesDB)) {
                        // Verificar si el teléfono o correo coinciden (sin formato)
                        const telefonoCliente = cliente.telefono ? cliente.telefono.replace(/[^0-9]/g, '') : '';
                        const correoCliente = (cliente.correo || '').toLowerCase().trim();
                        
                        if ((telefonoCliente && telefonoCliente === telefonoLimpio) || 
                            (correoCliente && correoCliente === email)) {
                            clienteEncontrado = { ...cliente, numero: id };
                            break;
                        }
                    }
                    
                    if (clienteEncontrado) {
                        // Cliente encontrado en la base de datos
                        estado.cliente = {
                            ...clienteEncontrado,
                            numero: clienteEncontrado.numero,
                            temporal: false
                        };
                        
                        // Mostrar mensaje de éxito
                        Swal.fire({
                            title: '¡Bienvenido de nuevo!',
                            html: `<div class="apple-success-message">Hemos encontrado tu cuenta: <strong>${clienteEncontrado.nombre}</strong></div>`,
                            icon: 'success',
                            confirmButtonText: 'Continuar',
                            confirmButtonColor: '#007AFF',
                            customClass: {
                                popup: 'apple-swal-popup',
                                title: 'apple-swal-title',
                                htmlContainer: 'apple-swal-html',
                                confirmButton: 'apple-confirm-button',
                                actions: 'apple-actions'
                            }
                        }).then(() => {
                            estado.pasoActual = 2;
                            actualizarInterfaz();
                        });
                    } else {
                        // Cliente no encontrado, mostrar mensaje de error
                        Swal.fire({
                            title: 'Datos no encontrados',
                            html: '<div class="apple-error-message">No encontramos una cuenta con los datos proporcionados. Por favor verifica o comunícate con soporte.</div>',
                            icon: 'error',
                            confirmButtonText: 'Entendido',
                            confirmButtonColor: '#007AFF',
                            customClass: {
                                popup: 'apple-swal-popup',
                                title: 'apple-swal-title',
                                htmlContainer: 'apple-swal-html',
                                confirmButton: 'apple-confirm-button',
                                actions: 'apple-actions'
                            }
                        });
                        
                        // Mostrar opción para volver a intentar o contactar a soporte
                        Swal.fire({
                            title: '¿Necesitas ayuda?',
                            text: 'Si necesitas asistencia, puedes contactar a nuestro equipo de soporte.',
                            icon: 'info',
                            showCancelButton: true,
                            confirmButtonText: 'Contactar soporte',
                            cancelButtonText: 'Volver a intentar',
                            confirmButtonColor: '#007AFF',
                            cancelButtonColor: '#8e8e93',
                            customClass: {
                                popup: 'apple-swal-popup',
                                title: 'apple-swal-title',
                                htmlContainer: 'apple-swal-html',
                                confirmButton: 'apple-confirm-button',
                                cancelButton: 'apple-cancel-button',
                                actions: 'apple-actions'
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                // Aquí podrías redirigir a una página de contacto o abrir un chat de soporte
                                window.location.href = '/contacto';
                            } else {
                                // Volver a mostrar el formulario
                                noTengoNumeroBtn.click();
                            }
                        });
                    }
                }
            });
        });
    }
}

// Botón "Solicitar visita a domicilio"
const btnVisitaDomicilio = document.getElementById('btnVisitaDomicilio');
if (btnVisitaDomicilio) {
    btnVisitaDomicilio.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Botón de visita a domicilio clickeado');
        
        // Solución directa - Forzar la visualización del paso 3
        const paso1 = document.getElementById('paso1');
        const paso2 = document.getElementById('paso2');
        const paso3 = document.getElementById('paso3');
        
        if (paso3) {
            // Ocultar otros pasos
            if (paso1) paso1.style.display = 'none';
            if (paso2) paso2.style.display = 'none';
            
            // Mostrar paso 3
            paso3.style.display = 'block';
            
            // Actualizar estado
            estado.pasoActual = 3;
            estado.requiereVisita = true;
            
            // Desplazar al paso 3
            window.scrollTo({
                top: paso3.offsetTop,
                behavior: 'smooth'
            });
            
            // Inicializar flatpickr si está disponible
            if (typeof flatpickr !== 'undefined') {
                flatpickr("#fechaVisita", {
                    minDate: 'today',
                    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
                    locale: 'es',
                    disable: [
                        function(date) {
                            return (date.getDay() === 0); // Deshabilitar domingos
                        }
                    ]
                });
            }
        } else {
            console.error('No se pudo encontrar el elemento #paso3');
        }
    });
    
    // Inicialmente deshabilitar el botón hasta que se seleccione una falla
    btnVisitaDomicilio.disabled = true;
    
    // Botón "Asistencia telefónica"
    const btnAsistenciaTelefonica = document.getElementById('btnAsistenciaTelefonica');
    if (btnAsistenciaTelefonica) {
        btnAsistenciaTelefonica.addEventListener('click', function(e) {
            e.preventDefault();
            // Aquí puedes agregar la lógica para la asistencia telefónica
            alert('Próximamente: Se abrirá la opción de asistencia telefónica');
        });
    }
    
    // Botones de navegación restantes
    if (elementos.btnSiguiente3) {
        elementos.btnSiguiente3.addEventListener('click', avanzarPaso);
    }
    
    if (elementos.btnAtras3) {
        elementos.btnAtras3.addEventListener('click', retrocederPaso);
    }
    
    if (elementos.btnAtras4) {
        elementos.btnAtras4.addEventListener('click', retrocederPaso);
    }
    
    if (elementos.btnEnviarReporte) {
        elementos.btnEnviarReporte.addEventListener('click', enviarReporte);
    }
}

/**
 * Valida el número de cliente ingresado
 */
function validarNumeroCliente(e) {
    e.preventDefault();
    console.log('Validando número de cliente...');
    
    const numeroCliente = elementos.numeroCliente.value.trim();
    console.log('Número ingresado:', numeroCliente);
    
    // Validar formato (5-6 dígitos)
    if (!/^\d{5,6}$/.test(numeroCliente)) {
        console.log('Formato de número inválido');
        mostrarError('Por favor ingresa un número de cliente válido de 5 a 6 dígitos');
        return false;
    }
    
    // Verificar en la base de datos
    console.log('Buscando en la base de datos...');
    console.log('Clientes disponibles:', Object.keys(clientesDB));
    
    if (clientesDB[numeroCliente]) {
        console.log('Cliente encontrado:', clientesDB[numeroCliente]);
        // Cliente encontrado
        estado.cliente = {
            numero: numeroCliente,
            ...clientesDB[numeroCliente]
        };
        
        // Avanzar al siguiente paso
        console.log('Avanzando al siguiente paso...');
        estado.pasoActual = 2;
        actualizarInterfaz();
        return true;
    } else {
        console.log('Cliente no encontrado');
        mostrarError('Número de cliente no encontrado. Por favor verifica e intenta nuevamente.');
        return false;
    }
}

/**
 * Muestra ayuda para encontrar el número de cliente
 */
function mostrarAyudaNumeroCliente() {
    Swal.fire({
        title: '¿Dónde encuentro mi número de cliente?',
        html: `
            <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1d1d1f;">
                <div style="background: #f5f5f7; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: center;">
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
                <div style="background: #f5f5f7; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
                    <div style="position: relative; display: inline-block; margin: 0 auto;">
                        <img src="/static/ticket.jpeg" alt="Ejemplo de ticket" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1);">
                        <div style="position: absolute; top: 10%; left: 5%; background: rgba(255, 204, 0, 0.3); border: 2px dashed #FFCC00; border-radius: 4px; padding: 4px 8px;">
                            <span style="font-family: monospace; font-size: 14px; font-weight: 600; color: #1d1d1f;">12345</span>
                        </div>
                    </div>
                    <div style="margin-top: 12px; font-size: 13px; color: #86868b;">
                        El número de cliente está resaltado en amarillo en tu ticket
                    </div>
                </div>
                <div style="background: #f8f8fa; border-left: 4px solid #007AFF; padding: 12px; border-radius: 0 8px 8px 0; margin-top: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1d1d1f; font-weight: 500;">¿No encuentras tu número?</p>
                    <p style="margin: 0; font-size: 13px; color: #86868b;">Comunícate con nuestro centro de atención al <a href="tel:8001234567" style="color: #007AFF; text-decoration: none; font-weight: 500;">800-123-4567</a></p>
                </div>
            </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#007AFF',
        customClass: {
            popup: 'swal2-modal-apple',
            title: 'apple-swal-title',
            confirmButton: 'apple-confirm-button',
            htmlContainer: 'apple-swal-html'
        },
        width: 420,
        padding: '20px',
        background: '#ffffff',
        backdrop: 'rgba(0, 0, 0, 0.5)'
    });
}

/**
 * Selecciona una falla del listado
 */
function seleccionarFalla(idFalla) {
    // Deseleccionar cualquier otra falla seleccionada
    document.querySelectorAll('.opcion-falla').forEach(opcion => {
        opcion.classList.remove('seleccionada');
    });
    
    // Seleccionar la falla actual
    const opcionSeleccionada = document.querySelector(`.opcion-falla[data-id="${idFalla}"]`);
    if (opcionSeleccionada) {
        opcionSeleccionada.classList.add('seleccionada');
        const fallaSeleccionada = tiposFalla.find(f => f.id === idFalla);
        estado.fallaSeleccionada = fallaSeleccionada;
        
        // Mostrar los pasos de solución
        if (fallaSeleccionada) {
            mostrarPasosSolucion(fallaSeleccionada);
        }
    } else {
        estado.fallaSeleccionada = null;
        
        // Ocultar cualquier solución mostrada anteriormente
        const solucionContainer = document.getElementById('solucionContainer');
        if (solucionContainer) {
            solucionContainer.remove();
        }
        
        // Limpiar el estado de los botones de asistencia
        const botonesAsistencia = document.getElementById('botonesAsistencia');
        if (botonesAsistencia) {
            botonesAsistencia.style.display = 'none';
        }
    }
}

/**
 * Muestra los pasos de solución para la falla seleccionada
 */
function mostrarPasosSolucion(falla) {
    // Primero, limpiar cualquier solución previa
    const contenedorAnterior = document.getElementById('solucionContainer');
    if (contenedorAnterior) {
        contenedorAnterior.remove();
    }
    
    // Crear el contenedor principal si no existe
    let reporteContent = document.querySelector('.reporte-content');
    if (!reporteContent) {
        reporteContent = document.createElement('div');
        reporteContent.className = 'reporte-content';
        document.querySelector('.reporte-falla-container').appendChild(reporteContent);
    }
    
    // Crear el HTML para los pasos de solución
    const solucionHTML = `
        <div class="solucion-container" id="solucionContainer">
            <h3>Solución para: ${falla.nombre}</h3>
            <div class="pasos-solucion">
                ${falla.soluciones.map((paso, index) => `
                    <div class="paso-solucion" data-paso="${index + 1}">
                        <div class="numero-paso">${index + 1}</div>
                        <div class="contenido-paso">
                            <p>${paso}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="retroalimentacion-container" id="retroalimentacionContainer" style="display: none;">
                <p>¿Se solucionó tu problema?</p>
                <div class="botones-retroalimentacion">
                    <button type="button" class="btn btn-outline" id="btnNoSolucionado">
                        <i class="fas fa-times"></i> No, no se solucionó
                    </button>
                    <button type="button" class="btn btn-primary" id="btnSolucionado">
                        <i class="fas fa-check"></i> Sí, se solucionó
                    </button>
                </div>
            </div>
            <div class="acciones-adicionales" id="accionesAdicionales" style="display: none;">
                <h4>¿Necesitas más ayuda?</h4>
                <div class="botones-asistencia" style="margin-top: 15px;">
                    <p style="margin-bottom: 15px; font-weight: 500;">Selecciona una opción de asistencia:</p>
                    <button type="button" class="btn btn-outline" style="width: 100%; margin-bottom: 10px;" id="btnAsistenciaTelefonica">
                        <i class="fas fa-phone"></i> Asistencia telefónica
                    </button>
                    <button type="button" class="btn btn-primary" style="width: 100%;" id="btnVisitaDomicilio">
                        <i class="fas fa-home"></i> Solicitar visita a domicilio
                    </button>
                </div>
            </div>
            <div class="formulario-visita" id="formularioVisita" style="display: none;">
                <h4>Programar visita a domicilio</h4>
                <div class="form-group">
                    <label for="fechaVisita">Fecha de visita:</label>
                    <input type="date" id="fechaVisita" class="form-control" min="">
                </div>
                <div class="form-group">
                    <label for="comentariosVisita">Comentarios adicionales:</label>
                    <textarea id="comentariosVisita" class="form-control" rows="3" placeholder="Describe brevemente el problema"></textarea>
                </div>
                <div class="botones-formulario">
                    <button type="button" class="btn btn-outline" id="btnCancelarVisita">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" id="btnConfirmarVisita">
                        <i class="fas fa-calendar-check"></i> Confirmar visita
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insertar el HTML en el DOM
    reporteContent.insertAdjacentHTML('beforeend', solucionHTML);
    
    // Hacer scroll suave al contenedor de la solución
    const solucionContainer = document.getElementById('solucionContainer');
    if (solucionContainer) {
        solucionContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Configurar eventos para los botones de retroalimentación
    document.getElementById('btnSolucionado')?.addEventListener('click', () => {
        mostrarMensajeFinal('¡Excelente! Nos alegra haberte ayudado a resolver el problema. Si necesitas más asistencia, no dudes en contactarnos.');
    });
    
    document.getElementById('btnNoSolucionado')?.addEventListener('click', () => {
        const retroalimentacion = document.getElementById('retroalimentacionContainer');
        const accionesAdicionales = document.getElementById('accionesAdicionales');
        
        if (retroalimentacion && accionesAdicionales) {
            retroalimentacion.style.display = 'none';
            accionesAdicionales.style.display = 'block';
        }
    });
    
    // Configurar eventos para las acciones adicionales
    document.getElementById('btnAsistenciaTelefonica')?.addEventListener('click', () => {
        mostrarMensajeFinal('Nuestro equipo de soporte técnico se comunicará contigo al número registrado en los próximos minutos. Graza por tu paciencia.');
    });
    
    document.getElementById('btnVisitaDomicilio')?.addEventListener('click', () => {
        const accionesAdicionales = document.getElementById('accionesAdicionales');
        const formularioVisita = document.getElementById('formularioVisita');
        
        if (accionesAdicionales && formularioVisita) {
            accionesAdicionales.style.display = 'none';
            formularioVisita.style.display = 'block';
            
            // Configurar restricciones de fecha y hora
            const fechaInput = document.getElementById('fechaVisita');
            const horaSelect = document.getElementById('horaVisita');
            
            // Función para crear una fecha local sin problemas de zona horaria
            const createLocalDate = (year, month, day) => {
                // Crear fecha en la zona horaria local
                const date = new Date(year, month - 1, day);
                // Ajustar por la diferencia de zona horaria
                const tzOffset = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() - tzOffset);
            };
            
            // Función para formatear fecha en formato YYYY-MM-DD
            const formatDate = (date) => {
                const d = new Date(date);
                // Ajustar por la diferencia de zona horaria
                d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            // Obtener fecha actual en la zona horaria local
            const hoy = new Date();
            const hoyLocal = createLocalDate(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
            
            // Establecer fecha mínima (mañana) y máxima (30 días en el futuro)
            const mañana = new Date(hoyLocal);
            mañana.setDate(hoyLocal.getDate() + 1);
            
            // Si mañana es domingo, pasamos al lunes
            if (mañana.getDay() === 0) {
                mañana.setDate(mañana.getDate() + 1);
            }
            
            const fechaMaxima = new Date(hoyLocal);
            fechaMaxima.setDate(hoyLocal.getDate() + 30);
            
            // Establecer fechas mínima y máxima en el input
            fechaInput.min = formatDate(mañana);
            fechaMaxima.setDate(fechaMaxima.getDate() + 1); // Incluir el último día
            fechaInput.max = formatDate(fechaMaxima);
            
            // Función para verificar si una fecha es domingo
            const esDomingo = (fecha) => {
                const d = new Date(fecha);
                return d.getDay() === 0; // 0 = Domingo
            };
            
            // Deshabilitar domingos en el datepicker
            fechaInput.addEventListener('input', function() {
                if (!this.value) return;
                
                const fechaSeleccionada = new Date(this.value);
                
                // Ajustar por zona horaria
                const fechaLocal = createLocalDate(
                    fechaSeleccionada.getFullYear(),
                    fechaSeleccionada.getMonth() + 1,
                    fechaSeleccionada.getDate()
                );
                
                if (fechaLocal.getDay() === 0) {
                    mostrarError('No se programan visitas los domingos. Por favor selecciona otro día.');
                    this.value = '';
                }
            });
            
            // Función para configurar los horarios según el día seleccionado
            const configurarHorarios = (fecha) => {
                // Limpiar opciones actuales
                while (horaSelect.options.length > 1) {
                    horaSelect.remove(1);
                }
                
                // Verificar si es domingo
                if (esDomingo(fecha)) {
                    // Obtener fecha del próximo lunes
                    const lunes = new Date(fecha);
                    lunes.setDate(lunes.getDate() + 1);
                    
                    // Formatear fecha del lunes
                    const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
                    const fechaLunes = lunes.toLocaleDateString('es-ES', opciones);
                    
                    mostrarError(`No atendemos los domingos. Su cita se ha pospuesto para el lunes ${fechaLunes}.`);
                    
                    // Establecer automáticamente la fecha del lunes
                    fechaInput.valueAsDate = lunes;
                    configurarHorarios(lunes);
                    return;
                }
                
                // Obtener día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
                const diaSemana = new Date(fecha).getDay();
                
                // Definir horarios según el día
                let horarios = [];
                
                if (diaSemana === 6) { // Sábado
                    horarios = [
                        '09:00 - 11:00',
                        '11:00 - 13:00',
                        '13:00 - 14:00' // Último horario a las 2:00 PM
                    ];
                } else { // Lunes a Viernes
                    horarios = [
                        '09:00 - 11:00',
                        '11:00 - 13:00',
                        '13:00 - 15:00',
                        '15:00 - 17:00'
                    ];
                }
                
                // Agregar horarios al select
                horarios.forEach(hora => {
                    const option = document.createElement('option');
                    option.value = hora;
                    option.textContent = hora;
                    horaSelect.appendChild(option);
                });
            };
            
            // Configurar evento para cuando cambie la fecha
            fechaInput.addEventListener('change', function() {
                if (!this.value) return;
                
                const fechaSeleccionada = new Date(this.value);
                // Ajustar por zona horaria
                const fechaLocal = createLocalDate(
                    fechaSeleccionada.getFullYear(),
                    fechaSeleccionada.getMonth() + 1,
                    fechaSeleccionada.getDate()
                );
                
                // Verificar si es domingo
                if (fechaLocal.getDay() === 0) {
                    mostrarError('No se programan visitas los domingos. Por favor selecciona otro día.');
                    this.value = '';
                    return;
                }
                
                // Configurar horarios para la fecha seleccionada
                configurarHorarios(fechaLocal);
            });
            
            // Configurar horarios iniciales para mañana
            configurarHorarios(mañana);
            
            // Establecer la fecha inicial como mañana (si no es domingo)
            if (mañana.getDay() !== 0) {
                fechaInput.value = formatDate(mañana);
            }
        }
    });
    
    document.getElementById('btnCancelarVisita')?.addEventListener('click', () => {
        const accionesAdicionales = document.getElementById('accionesAdicionales');
        const formularioVisita = document.getElementById('formularioVisita');
        
        if (accionesAdicionales && formularioVisita) {
            formularioVisita.style.display = 'none';
            accionesAdicionales.style.display = 'block';
        }
    });
    
    document.getElementById('btnConfirmarVisita')?.addEventListener('click', () => {
        const fechaVisita = document.getElementById('fechaVisita').value;
        const horaVisita = document.getElementById('horaVisita').value;
        
        if (!fechaVisita || !horaVisita) {
            mostrarError('Por favor selecciona una fecha y hora para la visita.');
            return;
        }
        
        // Validar la hora seleccionada
        const fechaSeleccionada = new Date(fechaVisita);
        const diaSemana = fechaSeleccionada.getDay();
        const horaFin = parseInt(horaVisita.split(' - ')[1]);
        
        // Validar que no sea domingo (por si acaso)
        if (diaSemana === 0) {
            mostrarError('Lo sentimos, no se programan visitas los domingos.');
            return;
        }
        
        // Validar horario para sábados
        if (diaSemana === 6) {
            // Verificar que no sea después de las 2:00 PM
            if (horaFin >= 14) {
                mostrarError('Los sábados el horario de atención es de 9:00 AM a 2:00 PM.');
                return;
            }
        }
        
        // Validar que no sea fuera de horario laboral
        if (horaFin > 17) {
            mostrarError('El horario de atención es hasta las 5:00 PM.');
            return;
        }
        
        // Mostrar mensaje de confirmación
        mostrarMensajeFinal(`¡Listo! Hemos programado una visita para el ${formatearFecha(fechaVisita)} en el horario de ${horaVisita}. Recibirás una confirmación por correo electrónico.`);
    });
    
    // Mostrar el contenedor de retroalimentación después de 3 segundos
    setTimeout(() => {
        const retroalimentacion = document.getElementById('retroalimentacionContainer');
        if (retroalimentacion) {
            retroalimentacion.style.display = 'block';
        }
    }, 3000);
}

/**
 * Muestra un mensaje final al usuario
 */
function mostrarMensajeFinal(mensaje) {
    const solucionContainer = document.getElementById('solucionContainer');
    if (solucionContainer) {
        solucionContainer.innerHTML = `
            <div class="mensaje-final">
                <div class="icono-mensaje">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>¡Gracias por contactarnos!</h3>
                <p>${mensaje}</p>
                <button type="button" class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-home"></i> Volver al inicio
                </button>
            </div>
        `;
    }
}

/**
 * Formatea una fecha en formato legible en español
 */
function formatearFecha(fechaISO) {
    // Asegurarse de que la fecha se maneje correctamente en la zona horaria local
    const fecha = new Date(fechaISO);
    
    // Ajustar por la diferencia de zona horaria
    const fechaAjustada = new Date(fecha.getTime() + (fecha.getTimezoneOffset() * 60000));
    
    // Días de la semana en español
    const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    
    // Meses en español
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const diaSemana = dias[fechaAjustada.getDay()];
    const dia = fechaAjustada.getDate();
    const mes = meses[fechaAjustada.getMonth()];
    const año = fechaAjustada.getFullYear();
    
    return `${diaSemana}, ${dia} de ${mes} de ${año}`;
}

/**
 * Valida el paso actual del formulario
 */
function validarPasoActual() {
    switch(estado.pasoActual) {
        case 1: // Validar identificación
            if (!elementos.numeroCliente.value.trim()) {
                mostrarError('Por favor ingresa tu número de cliente');
                return false;
            }
            // Verificar si el número de cliente existe
            if (!clientesDB[elementos.numeroCliente.value.trim()]) {
                mostrarError('Número de cliente no encontrado. Por favor verifica e intenta nuevamente.');
                return false;
            }
            return true;
            
        case 2: // Validar selección de falla
            if (!estado.fallaSeleccionada) {
                mostrarError('Por favor selecciona un tipo de falla');
                return false;
            }
            return true;
            
        case 3: // Validar programación de visita
            // Si se requiere visita, validar que se haya seleccionado fecha y hora
            if (estado.requiereVisita) {
                const fechaVisita = document.getElementById('fechaVisita');
                const horaVisita = document.getElementById('horaVisita');
                
                if (!fechaVisita || !fechaVisita.value) {
                    mostrarError('Por favor selecciona una fecha para la visita');
                    return false;
                }
                
                if (!horaVisita || !horaVisita.value) {
                    mostrarError('Por favor selecciona un horario para la visita');
                    return false;
                }
                
                // Guardar los valores seleccionados
                estado.fechaVisita = fechaVisita.value;
                estado.horaVisita = horaVisita.value;
            }
            return true;
            
        default:
            return true;
    }
}

/**
 * Actualiza la interfaz según el paso actual
 */
function actualizarInterfaz() {
    console.log('Actualizando interfaz, paso actual:', estado.pasoActual);
    
    // Ocultar todos los pasos primero
    document.querySelectorAll('.paso').forEach(paso => {
        paso.style.display = 'none';
    });

    // Mostrar solo el paso actual
    const pasoActual = document.getElementById(`paso${estado.pasoActual}`);
    if (pasoActual) {
        console.log('Mostrando paso:', estado.pasoActual);
        pasoActual.style.display = 'block';
        
        // Manejar el scroll según el paso actual
        if (estado.pasoActual === 2) {
            // Para el paso 2, hacer scroll al inicio de la página con animación suave
            const scrollToTop = () => {
                const start = window.pageYOffset;
                const startTime = performance.now();
                const duration = 800; // Aumentamos la duración para mayor suavidad
                
                const animateScroll = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Usar una función de easing personalizada para un movimiento más natural
                    const easeInOutCubic = t => t < 0.5 
                        ? 4 * t * t * t 
                        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    
                    window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
                    
                    if (elapsed < duration) {
                        window.requestAnimationFrame(animateScroll);
                    }
                };
                
                window.requestAnimationFrame(animateScroll);
            };
            
            // Usar requestAnimationFrame para asegurar que la animación sea suave
            if ('requestAnimationFrame' in window) {
                requestAnimationFrame(scrollToTop);
            } else {
                scrollToTop();
            }
            
        } else if (estado.pasoActual === 3) {
            // Para el paso 3, hacer scroll al encabezado del formulario
            const scrollToFormHeader = () => {
                const formHeader = document.querySelector('#formularioVisita h3');
                if (formHeader) {
                    // Esperar a que el DOM se actualice
                    setTimeout(() => {
                        // Obtener la posición del header
                        const headerTop = formHeader.offsetTop;
                        const container = document.querySelector('.reporte-falla-container');
                        
                        if (container) {
                            // Función de easing personalizada para scroll suave
                            const easeInOutCubic = t => t < 0.5 
                                ? 4 * t * t * t 
                                : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                            
                            const start = container.scrollTop;
                            const change = (headerTop - 20) - start;
                            const duration = 800; // Aumentamos la duración para mayor suavidad
                            let startTime = null;
                            
                            const animateScroll = (currentTime) => {
                                if (!startTime) startTime = currentTime;
                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);
                                
                                container.scrollTop = start + (change * easeInOutCubic(progress));
                                
                                if (progress < 1) {
                                    window.requestAnimationFrame(animateScroll);
                                }
                            };
                            
                            window.requestAnimationFrame(animateScroll);
                        } else {
                            // Fallback: usar scroll de ventana
                            // Scroll suave personalizado para el fallback
                            const start = window.pageYOffset;
                            const change = (headerTop - 20) - start;
                            const duration = 800;
                            let startTime = null;
                            
                            const animateScroll = (currentTime) => {
                                if (!startTime) startTime = currentTime;
                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);
                                
                                const easeInOutCubic = t => t < 0.5 
                                    ? 4 * t * t * t 
                                    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                                
                                window.scrollTo(0, start + (change * easeInOutCubic(progress)));
                                
                                if (progress < 1) {
                                    window.requestAnimationFrame(animateScroll);
                                }
                            };
                            
                            window.requestAnimationFrame(animateScroll);
                        }
                    }, 10);
                } else {
                    // Si no se encuentra el encabezado, hacer scroll al inicio del paso 3
                    const paso3 = document.getElementById('paso3');
                    if (paso3) {
                        paso3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            };
            
            // Esperar un momento para asegurar que el DOM se haya actualizado
            setTimeout(scrollToFormHeader, 50);
        }
        
        // Si es el paso 3 (calendario), inicializar el datepicker si no se ha hecho
        if (estado.pasoActual === 3 && window.flatpickr) {
            const fechaVisita = document.getElementById('fechaVisita');
            if (fechaVisita && !fechaVisita._flatpickr) {
                flatpickr("#fechaVisita", {
                    minDate: "today",
                    maxDate: new Date().fp_incr(30), // 30 días a partir de hoy
                    dateFormat: "Y-m-d",
                    disable: [
                        function(date) {
                            // Deshabilitar domingos
                            return (date.getDay() === 0);
                        }
                    ],
                    locale: {
                        firstDayOfWeek: 1 // Lunes
                    },
                    onChange: function(selectedDates, dateStr) {
                        // Actualizar horarios cuando cambia la fecha
                        const horariosDisponibles = document.getElementById('horariosDisponibles');
                        if (horariosDisponibles) {
                            actualizarHorarios(dateStr, horariosDisponibles);
                        }
                    }
                });
            }
        }
    } else {
        console.error('No se encontró el elemento para el paso:', estado.pasoActual);
    }

    // Actualizar botones de navegación según el paso actual
    const btnAtras = document.getElementById('btnAtras');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnAtras3 = document.getElementById('btnAtras3');
    const btnSiguiente3 = document.getElementById('btnSiguiente3');
    
    if (btnAtras) {
        btnAtras.style.display = estado.pasoActual === 1 ? 'none' : 'inline-flex';
    }
    
    if (btnSiguiente) {
        btnSiguiente.style.display = estado.pasoActual === 3 ? 'none' : 'inline-flex';
        btnSiguiente.disabled = !validarPasoActual();
    }
    
    if (btnAtras3) {
        btnAtras3.style.display = estado.pasoActual === 3 ? 'inline-flex' : 'none';
    }
    
    if (btnSiguiente3) {
        btnSiguiente3.style.display = estado.pasoActual === 3 ? 'inline-flex' : 'none';
        btnSiguiente3.disabled = !validarPasoActual();
    }
}

/**
 * Avanza al siguiente paso del formulario
 */
function avanzarPaso() {
    // Validar el paso actual antes de avanzar
    if (!validarPasoActual()) {
        return;
    }
    
    // Si estamos en el paso 3 (calendario) y todo está correcto, ir a confirmación
    if (estado.pasoActual === 3) {
        estado.pasoActual = 4; // Ir a confirmación
        actualizarResumen();
    } 
    // Si estamos en el paso 1 (identificación), ir a selección de falla
    else if (estado.pasoActual === 1) {
        estado.pasoActual = 2;
    }
    // Para otros casos, simplemente avanzar
    else {
        estado.pasoActual++;
    }
    
    // Actualizar la interfaz
    actualizarInterfaz();
}

/**
 * Retrocede al paso anterior del formulario
 */
function retrocederPaso() {
    console.log('Retrocediendo desde el paso:', estado.pasoActual);
    
    // Si hay un contenedor de solución abierto, cerrarlo
    const solucionContainer = document.getElementById('solucionContainer');
    const opcionesFalla = document.getElementById('opcionesFalla');
    const botonesNavegacion = document.querySelector('.botones-navegacion');
    
    if (solucionContainer) {
        solucionContainer.remove();
        if (opcionesFalla) opcionesFalla.style.display = 'block';
        if (botonesNavegacion) botonesNavegacion.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    
    // Si estamos en el paso de confirmación (4), volver al paso de programación de visita (3)
    if (estado.pasoActual === 4) {
        estado.pasoActual = 3;
    } 
    // Si estamos en el paso de programación de visita (3), volver al paso de selección de falla (2)
    else if (estado.pasoActual === 3) {
        estado.pasoActual = 2;
        
        // Limpiar la selección de fecha y hora
        const fechaVisita = document.getElementById('fechaVisita');
        const horaVisita = document.getElementById('horaVisita');
        const horariosDisponibles = document.getElementById('horariosDisponibles');
        
        if (fechaVisita) fechaVisita.value = '';
        if (horaVisita) horaVisita.value = '';
        if (horariosDisponibles) horariosDisponibles.innerHTML = '';
    } 
    // Si estamos en el paso de selección de falla (2), volver al paso de identificación (1)
    else if (estado.pasoActual === 2) {
        estado.pasoActual = 1;
    }
    // Si estamos en el paso de identificación (1), no hacemos nada
    
    console.log('Nuevo paso después de retroceder:', estado.pasoActual);
    
    // Actualizar la interfaz
    actualizarInterfaz();
    
    // Desplazarse al inicio del formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Envía el reporte de falla
 */
function enviarReporte() {
    if (!estado.cliente || !estado.fallaSeleccionada) {
        mostrarError('No se pudo enviar el reporte. Por favor verifica la información.');
        return;
    }
    
    // Validar que se haya seleccionado fecha y hora de visita
    if (!estado.fechaVisita || !estado.horaVisita) {
        mostrarError('Por favor selecciona una fecha y hora para la visita.');
        // Volver al paso de programación de visita
        estado.pasoActual = 3;
        actualizarInterfaz();
        return;
    }
    
    // Simular envío del reporte
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div><p>Enviando reporte...</p>';
    
    const contenido = document.querySelector('#paso4 .contenido');
    if (contenido) {
        contenido.innerHTML = '';
        contenido.appendChild(loading);
    }
    
    // Redirigir al inicio después de 3 segundos
    setTimeout(() => {
        window.location.href = '/';
    }, 3000);
}

/**
 * Muestra un mensaje de error
 */
function mostrarError(mensaje) {
    if (elementos.identificacionError) {
        elementos.identificacionError.textContent = mensaje;
        elementos.identificacionError.style.display = 'block';
        
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            elementos.identificacionError.style.display = 'none';
        }, 5000);
    } else {
        alert(mensaje);
    }
}

/**
 * Configura los estilos para la página de confirmación
 */
function configurarEstilosConfirmacion() {
    const style = document.createElement('style');
    style.innerHTML = `
        #step-confirmation {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
        }
        
        .confirmation-actions,
        .back-button {
            display: none !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Maneja la retroalimentación del usuario sobre si la solución funcionó o no
 */
function manejarRetroalimentacion(solucionado) {
    const retroalimentacionContainer = document.getElementById('retroalimentacionContainer');
    const accionesAdicionales = document.getElementById('accionesAdicionales');
    const pasosSolucion = document.querySelector('.pasos-solucion');
    
    if (solucionado) {
        // Si la solución funcionó, mostrar mensaje de éxito
        mostrarMensajeFinal('¡Excelente! Nos alegra que hayas podido resolver el problema. Si necesitas más ayuda, no dudes en contactarnos.');
    } else {
        // Si la solución no funcionó, mostrar la sección de acciones adicionales
        const accionesAdicionales = document.getElementById('accionesAdicionales');
        if (accionesAdicionales) {
            accionesAdicionales.style.display = 'block';
            accionesAdicionales.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Mostrar mensaje de continuar con los siguientes pasos
        const mensajeContinuar = document.createElement('div');
        mensajeContinuar.className = 'mensaje-ayuda';
        mensajeContinuar.innerHTML = `
            <p><i class="fas fa-info-circle"></i> Continuemos con los siguientes pasos de solución...</p>
        `;
        
        // Insertar después de los pasos actuales
        if (pasosSolucion && pasosSolucion.parentNode) {
            pasosSolucion.parentNode.insertBefore(mensajeContinuar, pasosSolucion.nextSibling);
            
            // Desplazarse al mensaje
            setTimeout(() => {
                mensajeContinuar.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
        
        // Mostrar acciones adicionales después de un breve retraso
        if (accionesAdicionales) {
            setTimeout(() => {
                accionesAdicionales.style.display = 'block';
                accionesAdicionales.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
}

// Configurar manejadores de eventos para los botones de retroalimentación
document.addEventListener('click', function(e) {
    if (e.target.closest('#btnSolucionado')) {
        manejarRetroalimentacion(true);
    } else if (e.target.closest('#btnNoSolucionado')) {
        manejarRetroalimentacion(false);
    }
});

configurarEstilosConfirmacion();
