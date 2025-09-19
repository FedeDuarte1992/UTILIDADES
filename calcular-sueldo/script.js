/**
 * =================================================================
 * SCRIPT PRINCIPAL - CONTROL DE ASISTENCIA Y SALARIO
 * =================================================================
 * 
 * Este archivo maneja la funcionalidad principal del sistema de
 * control de asistencia y cálculo de salarios por día.
 * 
 * Funcionalidades principales:
 * - Registro de asistencia diaria
 * - Cálculo de salarios por turno
 * - Gestión de calendario
 * - Cálculo de quincenas
 * - Manejo de feriados
 * - Almacenamiento local de datos
 */

// =================================================================
// ELEMENTOS DEL DOM
// =================================================================
const stepSelectTurno = document.getElementById('step-select-turno');
const stepFichajeStatus = document.getElementById('step-fichaje-status');
const stepInputHora = document.getElementById('input-hora-ingreso');
const inputHoraIngreso = document.getElementById('input-hora-ingreso');
const stepSelectCategory = document.getElementById('step-select-category');
const stepSelectAntiguedad = document.getElementById('step-select-antiguedad');
const antiguedadOptionsContainer = document.getElementById('antiguedad-options');
const stepAdicionalBasico = document.getElementById('step-adicional-basico');
const inputAdicionalBasico = document.getElementById('input-adicional-basico');
const stepExtraHours = document.getElementById('step-extra-hours');
const extraHoursInputGroup = document.getElementById('extra-hours-input-group');
const inputExtraHours = document.getElementById('input-extra-hours');
const resultDisplay = document.getElementById('result');
const historyList = document.getElementById('history-list');
const quincenaDisplay = document.getElementById('quincena-display');
const editingMessage = document.getElementById('editing-message');
const editingDateDisplay = document.getElementById('editing-date-display');
const deleteRecordBtn = document.getElementById('delete-record-btn');
const currentMonthYearDisplay = document.getElementById('current-month-year');
const calendarDaysGrid = document.getElementById('calendar-days');
// =================================================================
// VARIABLES DE ESTADO GLOBAL
// =================================================================

// Variables para el flujo de registro de asistencia
let selectedTurno = null;
let entryTime = null;
let selectedCategory = null;
let selectedAntiguedad = null;
let adicionalBasico = 0;
let extraHoursMade = 0;

let editingDateKey = null;
let isEditingMode = false;

let currentCalendarDate = new Date(); // Controla el mes y año que se muestra en el calendario

// Variable global para marcar si el registro actual es feriado
let isFeriadoRegistro = false;

// =================================================================
// CONFIGURACIÓN DEL SISTEMA
// =================================================================

/**
 * Configuración básica del sistema de cálculo de salarios
 */
const JORNADA_HORAS = 8;
const MINUTOS_TOLERANCIA_TARDE = 15;

/**
 * Tabla salarial por categoría y mes
 * Valores actualizados según convenio vigente
 */
const TABLA_SALARIAL = {
    'A': {
        'junio': 2750, 'julio': 2804, 'agosto': 2858, 'septiembre': 2912, 'octubre': 2966, 'noviembre': 3020
    },
    'B': {
        'junio': 2800, 'julio': 2855, 'agosto': 2910, 'septiembre': 2965, 'octubre': 3020, 'noviembre': 3074
    },
    'C': {
        'junio': 2854, 'julio': 2910, 'agosto': 2966, 'septiembre': 3022, 'octubre': 3078, 'noviembre': 3134
    },
    'D': {
        'junio': 2905, 'julio': 2962, 'agosto': 3019, 'septiembre': 3076, 'octubre': 3133, 'noviembre': 3190
    },
    'E': {
        'junio': 2964, 'julio': 3022, 'agosto': 3080, 'septiembre': 3138, 'octubre': 3197, 'noviembre': 3255
    },
    'F': {
        'junio': 3021, 'julio': 3080, 'agosto': 3140, 'septiembre': 3199, 'octubre': 3258, 'noviembre': 3317
    },
    'G': {
        'junio': 3115, 'julio': 3176, 'agosto': 3237, 'septiembre': 3298, 'octubre': 3359, 'noviembre': 3420
    },
    'H': {
        'junio': 3182, 'julio': 3245, 'agosto': 3307, 'septiembre': 3370, 'octubre': 3432, 'noviembre': 3494
    }
};

/**
 * Suma no remunerativa por mes
 * Montos adicionales que no forman parte del salario básico
 */
const SUMA_NO_REMUN = {
    'enero': 210000,
    'febrero': 210000,
    'marzo': 210000,
    'abril': 210000,
    'mayo': 210000,
    'junio': 315000, // 210000 + 105000
    'julio': 210000,
    'agosto': 210000,
    'septiembre': 210000,
    'octubre': 210000,
    'noviembre': 210000,
    'diciembre': 210000
};

/**
 * Tabla de bonificación por antigüedad
 * Valores fijos por años de antigüedad
 */
const TABLA_ANTIGUEDAD = {
    1: 25,
    3: 37,
    5: 50,
    7: 68,
    9: 81,
    12: 108,
    15: 130,
    18: 152,
    22: 175,
    26: 198,
    30: 217,
    35: 238,
    40: 261
};


/**
 * Horarios estándar de ingreso por turno
 */
const HORAS_ESTANDAR_INGRESO = {
    'manana': '06:00',
    'tarde': '14:00',
    'noche': '22:00'
};

/**
 * Nombres de los meses en español
 */
const MONTH_NAMES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

/**
 * Almacenamiento local de registros de trabajo
 * Se guarda en localStorage del navegador
 */
const workRecords = JSON.parse(localStorage.getItem('workRecords')) || {};

// =================================================================
// FUNCIONES DE CÁLCULO CORRECTAS
// =================================================================

/**
 * Calcula el salario diario según el turno y día de la semana
 * Basado en el cuadro de turnos proporcionado
 */
/**
 * FUNCIÓN PRINCIPAL DE CÁLCULO DE SALARIO DIARIO
 * Usa exactamente las mismas fórmulas que calcular_hora.js
 */
function calcularSalarioDiario(turno, valorHora, valorAntiguedad, adicionalBasicoPct, dayOfWeek, extraHours = 0) {
    // Determinar horas según turno
    const horas = obtenerHorasPorTurno(turno, dayOfWeek);
    
    // Usar la misma función de cálculo que calcular_hora
    const datos = {
        valorHora: valorHora,
        horasNormales: horas.normales,
        horasNocturnas: horas.nocturnas,
        horasSabado: horas.sabado,
        horasNocturnas50: horas.nocturnas50,
        horasNocturnas100: horas.nocturnas100,
        horasFeriado: horas.feriado,
        horas50: extraHours, // Horas extras como horas al 50%
        presentismo: 0.20, // 20% automático
        adicionalPorcentaje: adicionalBasicoPct,
        antiguedadAnios: obtenerAniosAntiguedad(valorAntiguedad)
    };
    
    return calcularTotalComoHora(datos);
}

/**
 * Determina las horas según turno y día (igual que calcular_hora)
 */
function obtenerHorasPorTurno(turno, dayOfWeek) {
    const horas = {
        normales: 0,
        nocturnas: 0,
        sabado: 0,
        nocturnas50: 0,
        nocturnas100: 0,
        feriado: 0
    };
    
    switch (turno) {
        case 'manana':
            if (dayOfWeek === 6) {
                horas.normales = 7;
                horas.sabado = 1;
            } else {
                horas.normales = 8;
            }
            break;
            
        case 'tarde':
            if (dayOfWeek === 6) {
                horas.sabado = 7;
                horas.nocturnas100 = 1;
            } else {
                horas.normales = 7;
                horas.nocturnas = 1;
            }
            break;
            
        case 'noche':
            if (dayOfWeek === 0) {
                horas.nocturnas = 6;
                horas.nocturnas100 = 2;
            } else {
                horas.nocturnas = 7;
                horas.nocturnas50 = 1;
            }
            break;
            
        case 'feriado':
            horas.feriado = 8;
            break;
    }
    
    return horas;
}

/**
 * Obtiene años de antigüedad desde el valor
 */
function obtenerAniosAntiguedad(valorAntiguedad) {
    for (const [anos, valor] of Object.entries(TABLA_ANTIGUEDAD)) {
        if (valor === valorAntiguedad) {
            return parseInt(anos);
        }
    }
    return 0;
}

/**
 * CÁLCULO TOTAL USANDO LAS MISMAS FÓRMULAS QUE CALCULAR_HORA
 */
function calcularTotalComoHora(datos) {
    let total = 0;
    const valorAntiguedad = TABLA_ANTIGUEDAD[datos.antiguedadAnios] || 0;
    
    // Calcular horas normales
    let montoNormales = 0;
    if (datos.horasNormales > 0) {
        montoNormales = datos.horasNormales * datos.valorHora;
        total += montoNormales;
    }
    
    // Calcular horas nocturnas
    let montoNocturnas = 0;
    if (datos.horasNocturnas > 0) {
        montoNocturnas = datos.horasNocturnas * (datos.valorHora * 1.3);
        total += montoNocturnas;
    }
    
    // Calcular antigüedad sobre horas normales y nocturnas
    const totalHorasBasicas = datos.horasNormales + datos.horasNocturnas;
    if (totalHorasBasicas > 0 && valorAntiguedad > 0) {
        const montoAntiguedad = totalHorasBasicas * valorAntiguedad;
        total += montoAntiguedad;
    }
    
    // Calcular adicional sobre básico
    const sumaBase = montoNormales + montoNocturnas;
    if (datos.adicionalPorcentaje > 0 && sumaBase > 0) {
        const adicionalBasico = sumaBase * (datos.adicionalPorcentaje / 100);
        total += adicionalBasico;
    }
    
    // Calcular horas 100% (sábado)
    if (datos.horasSabado > 0) {
        const base = datos.valorHora + valorAntiguedad;
        const monto = datos.horasSabado * base * 1.2 * 2;
        total += monto;
    }
    
    // Calcular horas nocturnas 50%
    if (datos.horasNocturnas50 > 0) {
        const nocturnidad = datos.valorHora * 0.3;
        const subtotal = datos.valorHora + valorAntiguedad + nocturnidad;
        const baseFinal = subtotal * 1.2045;
        const monto = datos.horasNocturnas50 * baseFinal * 1.5;
        total += monto;
    }
    
    // Calcular horas nocturnas 100%
    if (datos.horasNocturnas100 > 0) {
        const nocturnidad = datos.valorHora * 0.3;
        const subtotal = datos.valorHora + valorAntiguedad + nocturnidad;
        const baseFinal = subtotal * 1.2045;
        const monto = datos.horasNocturnas100 * baseFinal * 2;
        total += monto;
    }
    
    // Calcular horas de feriado
    if (datos.horasFeriado > 0) {
        const valorHoraFeriado = (datos.valorHora + valorAntiguedad) * 1.2;
        const montoFeriado = datos.horasFeriado * valorHoraFeriado;
        total += montoFeriado;
    }
    
    // Calcular horas al 50% (extras)
    if (datos.horas50 > 0) {
        const monto = datos.horas50 * datos.valorHora * 1.5;
        total += monto;
    }
    
    // Calcular presentismo
    if (datos.presentismo > 0) {
        const montoPresentismo = total * datos.presentismo;
        total += montoPresentismo;
    }
    
    // Generar desglose para mostrar en UI
    let detallesHTML = '<strong>Total sin retenciones:</strong> $' + formatCurrency(total) + '<br>';
    detallesHTML += '<strong>Total a cobrar:</strong> $' + formatCurrency(total * 0.8) + '<br><br>';
    
    if (datos.horasNormales > 0) detallesHTML += `Normales: ${datos.horasNormales}h × $${formatCurrency(datos.valorHora)} = $${formatCurrency(montoNormales)}<br>`;
    if (datos.horasNocturnas > 0) detallesHTML += `Nocturnas: ${datos.horasNocturnas}h × $${formatCurrency(datos.valorHora * 1.3)} = $${formatCurrency(montoNocturnas)}<br>`;
    if (totalHorasBasicas > 0 && valorAntiguedad > 0) detallesHTML += `Antigüedad: ${totalHorasBasicas}h × $${formatCurrency(valorAntiguedad)} = $${formatCurrency(totalHorasBasicas * valorAntiguedad)}<br>`;
    if (datos.adicionalPorcentaje > 0) detallesHTML += `Adicional sobre básico (${datos.adicionalPorcentaje}%) ~: $${formatCurrency(sumaBase * (datos.adicionalPorcentaje / 100))}<br>`;
    if (datos.presentismo > 0) detallesHTML += `Presentismo (${(datos.presentismo*100).toFixed(0)}%): $${formatCurrency(total * datos.presentismo / (1 + datos.presentismo))}`;
    
    // Actualizar el contenedor de detalles
    const detailsContainer = document.getElementById('calculation-details');
    if (detailsContainer) {
        detailsContainer.innerHTML = detallesHTML;
    }
    
    // Mostrar botón de detalles
    const toggleBtn = document.getElementById('toggle-details-btn');
    if (toggleBtn) {
        toggleBtn.style.display = 'block';
    }
    
    return total * 0.8; // Retorna total a cobrar (sin retenciones)
}

/**
 * TURNO MAÑANA - Lunes a Viernes: 8hs normales | Sábados: 7hs normales + 1h al 100%
 */
function calcularTurnoManana(valorHora, valorAntiguedad, adicionalBasicoPct, dayOfWeek, desglose) {
    let total = 0;
    
    if (dayOfWeek === 6) { // SÁBADO
        // 7 horas normales: (valorHora + antigüedad) × 7 × 1.2
        const horasNormales = (valorHora + valorAntiguedad) * 7 * 1.2;
        total += horasNormales;
        desglose.push(`7h normales sábado: (${valorHora} + ${valorAntiguedad}) × 7 × 1.2 = $${formatCurrency(horasNormales)}`);
        
        // 1 hora al 100%: (valorHora + antigüedad) × 1.2 × 2
        const hora100 = (valorHora + valorAntiguedad) * 1.2 * 2;
        total += hora100;
        desglose.push(`1h al 100%: (${valorHora} + ${valorAntiguedad}) × 1.2 × 2 = $${formatCurrency(hora100)}`);
        
    } else { // LUNES A VIERNES
        // 8 horas normales: (valorHora + antigüedad) × 8 × 1.2
        total = (valorHora + valorAntiguedad) * 8 * 1.2;
        desglose.push(`8h normales: (${valorHora} + ${valorAntiguedad}) × 8 × 1.2 = $${formatCurrency(total)}`);
    }
    
    // Aplicar adicional sobre básico al total
    if (adicionalBasicoPct > 0) {
        const adicional = total * (adicionalBasicoPct / 100);
        total += adicional;
        desglose.push(`Adicional ${adicionalBasicoPct}%: $${formatCurrency(adicional)}`);
    }
    
    return total;
}

/**
 * TURNO TARDE - Lunes a Viernes: 7hs normales + 1h nocturna | Sábados: 7hs al 100% + 1h nocturna al 100%
 */
function calcularTurnoTarde(valorHora, valorAntiguedad, adicionalBasicoPct, dayOfWeek, desglose) {
    let total = 0;
    
    if (dayOfWeek === 6) { // SÁBADO
        // 7 horas al 100%: (valorHora + antigüedad) × 1.2 × 2 × 7
        const horas100 = (valorHora + valorAntiguedad) * 1.2 * 2 * 7;
        total += horas100;
        desglose.push(`7h al 100% sábado: (${valorHora} + ${valorAntiguedad}) × 1.2 × 2 × 7 = $${formatCurrency(horas100)}`);
        
        // 1 hora nocturna al 100%: [(valorHora + antigüedad + nocturnidad) × 1.2045] × 2
        const nocturnidad = valorHora * 0.3;
        const subtotal = valorHora + valorAntiguedad + nocturnidad;
        const horaNocturna100 = subtotal * 1.2045 * 2;
        total += horaNocturna100;
        desglose.push(`1h nocturna 100%: [(${valorHora} + ${valorAntiguedad} + ${nocturnidad.toFixed(2)}) × 1.2045] × 2 = $${formatCurrency(horaNocturna100)}`);
        
    } else { // LUNES A VIERNES
        // 7 horas normales: (valorHora + antigüedad) × 7 × 1.2
        const horasNormales = (valorHora + valorAntiguedad) * 7 * 1.2;
        total += horasNormales;
        desglose.push(`7h normales: (${valorHora} + ${valorAntiguedad}) × 7 × 1.2 = $${formatCurrency(horasNormales)}`);
        
        // 1 hora nocturna: [(valorHora + 30%) + antigüedad] × 1.2
        const valorHoraNocturna = valorHora * 1.3;
        const horaNocturna = (valorHoraNocturna + valorAntiguedad) * 1.2;
        total += horaNocturna;
        desglose.push(`1h nocturna: [(${valorHora} + 30%) + ${valorAntiguedad}] × 1.2 = $${formatCurrency(horaNocturna)}`);
    }
    
    // Aplicar adicional sobre básico
    if (adicionalBasicoPct > 0) {
        const adicional = total * (adicionalBasicoPct / 100);
        total += adicional;
        desglose.push(`Adicional ${adicionalBasicoPct}%: $${formatCurrency(adicional)}`);
    }
    
    return total;
}

/**
 * TURNO NOCHE - Lunes a Viernes: 7hs nocturnas + 1h nocturna al 50% | Domingos: 6hs nocturnas + 2hs nocturnas al 100%
 */
function calcularTurnoNoche(valorHora, valorAntiguedad, adicionalBasicoPct, dayOfWeek, desglose) {
    let total = 0;
    
    if (dayOfWeek === 0) { // DOMINGO
        // 6 horas nocturnas: (valorHora × 1.3 + antigüedad) × 6 × 1.2
        const horasNocturnas = (valorHora * 1.3 + valorAntiguedad) * 6 * 1.2;
        total += horasNocturnas;
        desglose.push(`6h nocturnas domingo: (${valorHora} × 1.3 + ${valorAntiguedad}) × 6 × 1.2 = $${formatCurrency(horasNocturnas)}`);
        
        // 2 horas nocturnas al 100%: [(valorHora + antigüedad + nocturnidad) × 1.2045] × 2 × 2
        const nocturnidad = valorHora * 0.3;
        const subtotal = valorHora + valorAntiguedad + nocturnidad;
        const horasNocturnas100 = subtotal * 1.2045 * 2 * 2;
        total += horasNocturnas100;
        desglose.push(`2h nocturnas 100%: [(${valorHora} + ${valorAntiguedad} + ${nocturnidad.toFixed(2)}) × 1.2045] × 2 × 2 = $${formatCurrency(horasNocturnas100)}`);
        
    } else { // LUNES A VIERNES
        // 7 horas nocturnas: (valorHora × 1.3 + antigüedad) × 7 × 1.2
        const horasNocturnas = (valorHora * 1.3 + valorAntiguedad) * 7 * 1.2;
        total += horasNocturnas;
        desglose.push(`7h nocturnas: (${valorHora} × 1.3 + ${valorAntiguedad}) × 7 × 1.2 = $${formatCurrency(horasNocturnas)}`);
        
        // 1 hora nocturna al 50%: [(valorHora + antigüedad + nocturnidad) × 1.2045] × 1.5
        const nocturnidad = valorHora * 0.3;
        const subtotal = valorHora + valorAntiguedad + nocturnidad;
        const horaNocturna50 = subtotal * 1.2045 * 1.5;
        total += horaNocturna50;
        desglose.push(`1h nocturna 50%: [(${valorHora} + ${valorAntiguedad} + ${nocturnidad.toFixed(2)}) × 1.2045] × 1.5 = $${formatCurrency(horaNocturna50)}`);
    }
    
    // Aplicar adicional sobre básico
    if (adicionalBasicoPct > 0) {
        const adicional = total * (adicionalBasicoPct / 100);
        total += adicional;
        desglose.push(`Adicional ${adicionalBasicoPct}%: $${formatCurrency(adicional)}`);
    }
    
    return total;
}

/**
 * TURNO FERIADO - 8 horas normales con bonificación
 */
function calcularTurnoFeriado(valorHora, valorAntiguedad, adicionalBasicoPct, desglose) {
    // Feriado: (valorHora + antigüedad) × 1.2 × 8
    let total = (valorHora + valorAntiguedad) * 1.2 * 8;
    desglose.push(`8h feriado: (${valorHora} + ${valorAntiguedad}) × 1.2 × 8 = $${formatCurrency(total)}`);
    
    // Aplicar adicional sobre básico
    if (adicionalBasicoPct > 0) {
        const adicional = total * (adicionalBasicoPct / 100);
        total += adicional;
        desglose.push(`Adicional ${adicionalBasicoPct}%: $${formatCurrency(adicional)}`);
    }
    
    return total;
}

/**
 * CÁLCULO DE HORAS EXTRAS - 50% adicional sobre valor base
 */
function calcularHorasExtras(turno, valorHora, valorAntiguedad, adicionalBasicoPct, extraHours) {
    const valorHoraConAdicional = valorHora + (valorHora * adicionalBasicoPct / 100);
    
    if (turno === 'noche') {
        // Horas extras nocturnas: (valorHora + adicional + antigüedad) × 1.3 × 1.5
        return extraHours * (valorHoraConAdicional + valorAntiguedad) * 1.3 * 1.5;
    } else {
        // Horas extras normales: (valorHora + adicional + antigüedad) × 1.5
        return extraHours * (valorHoraConAdicional + valorAntiguedad) * 1.5;
    }
}

// =================================================================
// FUNCIONES DE UTILIDAD
// =================================================================
// Helper para formatear moneda sin decimales y con separador de miles
function formatCurrency(number) {
    if (typeof number !== 'number') {
        return number;
    }
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}
// Obtiene la bonificación por antigüedad según años
function getBonificacionAntiguedad(antiguedad_anos) {
    return TABLA_ANTIGUEDAD[antiguedad_anos] || 0;
}
// Función para ocultar todos los pasos de entrada
function hideAllSteps() {
    stepSelectTurno.style.display = 'none';
    stepFichajeStatus.style.display = 'none';
    stepInputHora.style.display = 'none';
    stepSelectCategory.style.display = 'none';
    stepSelectAntiguedad.style.display = 'none';
    stepAdicionalBasico.style.display = 'none';
    stepExtraHours.style.display = 'none';
    extraHoursInputGroup.style.display = 'none';
    editingMessage.style.display = 'none';
}

// Función para reiniciar el estado de la interfaz y variables globales
function resetInterface() {
    hideAllSteps();
    stepSelectTurno.style.display = 'block';
    selectedTurno = null;
    entryTime = null;
    selectedCategory = null;
    selectedAntiguedad = null;
    adicionalBasico = 0;
    extraHoursMade = 0;
    isEditingMode = false;
    editingDateKey = null;
    inputHoraIngreso.value = '';
    inputAdicionalBasico.value = '';
    inputExtraHours.value = '1';
    resultDisplay.textContent = 'Selecciona un día en el calendario o tu turno para empezar un nuevo registro.';
    deleteRecordBtn.style.display = 'none';
}

//------------------------------------------------------ Función para seleccionar el turno (Paso 1)------------------------------------------------------
function selectTurno(turno) {
    selectedTurno = turno;
    hideAllSteps();
    stepFichajeStatus.style.display = 'block';
    resultDisplay.textContent = `Turno seleccionado: ${turno.charAt(0).toUpperCase() + turno.slice(1)}.`;
}

//------------------------------------------------------ Función para manejar el estado del fichaje (temprano/tarde) (Paso 2)------------------------------------------------------
function fichajeStatus(status) {
    if (!selectedTurno || !HORAS_ESTANDAR_INGRESO[selectedTurno]) {
        resultDisplay.textContent = 'Error: Debes seleccionar un turno antes de continuar.';
        return;
    }
    let dateToUse;
    if (isEditingMode && editingDateKey) {
        const [year, month, day] = editingDateKey.split('-').map(Number);
        dateToUse = new Date(year, month - 1, day, 12, 0, 0);
    } else {
        dateToUse = new Date();
    }
    if (status === 'temprano') {
        const standardTime = HORAS_ESTANDAR_INGRESO[selectedTurno];
        const [hours, minutes] = standardTime.split(':').map(Number);
        entryTime = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), dateToUse.getDate(), hours, minutes, 0);
        hideAllSteps();
        stepSelectCategory.style.display = 'block';
        resultDisplay.textContent = '¡Ingreso registrado! Ahora, selecciona tu categoría.';
    } else {
        hideAllSteps();
        stepInputHora.style.display = 'block';
        resultDisplay.textContent = 'Por favor, ingresa la hora exacta en la que ingresaste (Ej: 06:15).';
    }
}

//------------------------------------------------------ Función para registrar la hora de ingreso personalizada (cuando fichó tarde) (Paso 2b)------------------------------------------------------
function registerCustomEntryTime() {
    const customTime = inputHoraIngreso.value;
    if (!customTime) {
        alert('Por favor, ingresa una hora válida (Ej: 06:15).');
        return;
    }

    let dateToUse;
    if (isEditingMode && editingDateKey) {
        const [year, month, day] = editingDateKey.split('-').map(Number);
        dateToUse = new Date(year, month - 1, day, 12, 0, 0); 
    } else {
        dateToUse = new Date();
    }

    const [hours, minutes] = customTime.split(':').map(Number);
    
    entryTime = new Date(dateToUse.getFullYear(), dateToUse.getMonth(), dateToUse.getDate(), hours, minutes, 0); 

    hideAllSteps();
    stepSelectCategory.style.display = 'block';
    resultDisplay.textContent = 'Hora de ingreso personalizada registrada. Ahora, selecciona tu categoría.';
}

//------------------------------------------------------ Función para seleccionar la categoría (Paso 3)------------------------------------------------------
function selectCategory(category) {
    selectedCategory = category;
    hideAllSteps();
    stepSelectAntiguedad.style.display = 'block';
    resultDisplay.textContent = `Categoría seleccionada: ${category}. Ahora, selecciona tus años de antigüedad.`;
}

// ------------------------------------------------------Función para seleccionar la antigüedad (Paso 4)------------------------------------------------------
function selectAntiguedad(anos) {
    selectedAntiguedad = anos;
    hideAllSteps();
    stepAdicionalBasico.style.display = 'block';
    resultDisplay.textContent = `Antigüedad seleccionada: ${anos} años. Ahora ingresa tu adicional sobre básico.`;
}

// ------------------------------------------------------Función para seleccionar el adicional sobre básico (Paso 5)------------------------------------------------------
function selectAdicionalBasico() {
    const valor = parseFloat(inputAdicionalBasico.value);
    if (isNaN(valor) || valor < 0) {
        alert('Por favor, ingresa un porcentaje válido (0 o mayor).');
        return;
    }
    adicionalBasico = valor;
    hideAllSteps();
    stepExtraHours.style.display = 'block';
    resultDisplay.textContent = `Adicional sobre básico: ${valor}%. ¿Realizaste horas extras?`;
}

//------------------------------------------------------ Función para manejar las horas extras (Paso 6)------------------------------------------------------
function handleExtraHours(hasExtras) {
    if (hasExtras) {
        extraHoursInputGroup.style.display = 'block';
        resultDisplay.textContent = 'Por favor, ingresa la cantidad de horas extras realizadas.';
    } else {
        extraHoursMade = 0;
        recordAttendance();
    }
}

// ------------------------------------------------------Función para registrar la cantidad de horas extras------------------------------------------------------
function registerExtraHours() {
    const hours = parseInt(inputExtraHours.value);
    if (isNaN(hours) || hours <= 0) {
        alert('Por favor, ingresa un número válido de horas extras.');
        return;
    }
    extraHoursMade = hours;
    recordAttendance();
}

function calculateLateMinutes(actualEntryTime, standardTurnoTimeStr) {
    const [standardHours, standardMinutes] = standardTurnoTimeStr.split(':').map(Number);
    
    const standardEntryDate = new Date(actualEntryTime.getFullYear(), actualEntryTime.getMonth(), actualEntryTime.getDate(), standardHours, standardMinutes, 0);

    if (actualEntryTime.getTime() > standardEntryDate.getTime()) {
        const diffMs = actualEntryTime.getTime() - standardEntryDate.getTime();
        return Math.floor(diffMs / (1000 * 60));
    }
    return 0;
}

//------------------------------------------------------ Función principal para registrar asistencia y calcular salario------------------------------------------------------
function recordAttendance() {
    // Si hay días seleccionados, aplicar a todos; si no, solo al día actual
    let daysToRegister = selectedDates.length > 0 ? [...selectedDates] : null;
    if (daysToRegister) {
        // Registrar para cada día seleccionado
        daysToRegister.forEach(dateKey => {
            // Asegura formato consistente de dateKey
            const [year, month, day] = dateKey.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const fixedDateKey = getDateKey(dateObj);
            // ...usar fixedDateKey en vez de dateKey en todo el bloque...
            const recordDayDate = new Date(year, month - 1, day, 12, 0, 0);
            let entryTimeToUse = entryTime;
            if (entryTime) {
                entryTimeToUse = new Date(year, month - 1, day, entryTime.getHours(), entryTime.getMinutes(), 0);
            } else {
                const standardTime = HORAS_ESTANDAR_INGRESO[selectedTurno];
                const [h, m] = standardTime.split(':').map(Number);
                entryTimeToUse = new Date(year, month - 1, day, h, m, 0);
            }
            const currentMonthIndex = recordDayDate.getMonth();
            const currentMonthName = MONTH_NAMES[currentMonthIndex];
            const dayOfWeek = recordDayDate.getDay();
            const valorHoraBase = getValorHoraBase(selectedCategory, currentMonthName);
            const bonificacionPorAntiguedad = getBonificacionAntiguedad(selectedAntiguedad, currentMonthName);
            if (valorHoraBase === undefined) return;
            // --- Lógica de feriado ---
            const feriado = isFeriado(recordDayDate);
            let jornalDiario = 0;
            let valorHoraNormalCalculado = 0;
            let horaNocturnaCalculada = 0;
            let horaExtraDiurnaCalculada = 0;
            let horaExtraNocturnaCalculada = 0;
            let feriadoDiurnoCalculado = 0;
            let feriadoNocturnoCalculado = 0;
            let valorHoraBaseDiurna = valorHoraBase;
            let valorHoraBaseNocturna20pct = valorHoraBase * 1.20;
            let valorHoraBaseNocturna7pct = valorHoraBase * 1.07;
            if (dayOfWeek === 6) {
                if (selectedTurno === 'tarde') {
                    valorHoraBaseDiurna = valorHoraBase * (1 + 1.33);
                    valorHoraBaseNocturna20pct = (valorHoraBase * 1.20) * (1 + 1.53);
                    valorHoraBaseNocturna7pct = 0;
                } else if (selectedTurno === 'noche') {
                    valorHoraBaseNocturna20pct = (valorHoraBase * 1.20) * (1 + 1.53);
                    valorHoraBaseNocturna7pct = 0;
                    valorHoraBaseDiurna = 0;
                }
            }
            let horaDiurnaConAntiguedad = valorHoraBaseDiurna + bonificacionPorAntiguedad;
            let horaNocturna20pctConAntiguedad = valorHoraBaseNocturna20pct + bonificacionPorAntiguedad;
            let horaNocturna7pctConAntiguedad = valorHoraBaseNocturna7pct + bonificacionPorAntiguedad;
            switch (selectedTurno) {
                case 'manana':
                    jornalDiario = JORNADA_HORAS * horaDiurnaConAntiguedad;
                    valorHoraNormalCalculado = horaDiurnaConAntiguedad;
                    horaNocturnaCalculada = horaNocturna20pctConAntiguedad;
                    break;
                case 'tarde':
                    let salarioDiurnoTarde = 7 * horaDiurnaConAntiguedad;
                    let salarioNocturnoTarde = 1 * horaNocturna20pctConAntiguedad;
                    jornalDiario = salarioDiurnoTarde + salarioNocturnoTarde;
                    valorHoraNormalCalculado = horaDiurnaConAntiguedad;
                    horaNocturnaCalculada = horaNocturna20pctConAntiguedad;
                    break;
                case 'noche':
                    jornalDiario = JORNADA_HORAS * horaNocturna7pctConAntiguedad;
                    valorHoraNormalCalculado = horaNocturna7pctConAntiguedad;
                    horaNocturnaCalculada = horaNocturna7pctConAntiguedad;
                    break;
                default:
                    jornalDiario = 0;
                    break;
            }
            horaExtraDiurnaCalculada = valorHoraNormalCalculado * 1.50;
            horaExtraNocturnaCalculada = horaNocturnaCalculada * 1.50;
            feriadoDiurnoCalculado = valorHoraNormalCalculado * 2.00;
            feriadoNocturnoCalculado = horaNocturnaCalculada * 2.00;
            // --- Si es feriado, el jornal es doble ---
            if (feriado) {
                jornalDiario = jornalDiario * 2;
            }
            let salarioBrutoSinPresentismo = jornalDiario;
            if (extraHoursMade > 0) {
                if (selectedTurno === 'noche' || (selectedTurno === 'tarde' && entryTimeToUse.getHours() >= 21) || (dayOfWeek === 6 && selectedTurno === 'noche')) {
                    salarioBrutoSinPresentismo += (extraHoursMade * horaExtraNocturnaCalculada);
                } else {
                    salarioBrutoSinPresentismo += (extraHoursMade * horaExtraDiurnaCalculada);
                }
            }
            let montoPresentismo = salarioBrutoSinPresentismo * 0.20;
            let salarioDiarioBruto = salarioBrutoSinPresentismo + montoPresentismo;
            const standardTurnoTime = HORAS_ESTANDAR_INGRESO[selectedTurno];
            const lateMinutes = calculateLateMinutes(entryTimeToUse, standardTurnoTime);
            const isAbsentDueToLateness = lateMinutes > MINUTOS_TOLERANCIA_TARDE;
            saveWorkRecord(recordDayDate, selectedTurno, JORNADA_HORAS, extraHoursMade, entryTimeToUse, selectedCategory, selectedAntiguedad, valorHoraBase, bonificacionPorAntiguedad, jornalDiario, salarioDiarioBruto, lateMinutes, isAbsentDueToLateness, valorHoraNormalCalculado, horaNocturnaCalculada, horaExtraDiurnaCalculada, horaExtraNocturnaCalculada, feriadoDiurnoCalculado, feriadoNocturnoCalculado, dayOfWeek, montoPresentismo, feriado);
        });
        // Mensaje y limpieza
        resultDisplay.textContent = `¡Registro exitoso! Se aplicó a ${daysToRegister.length} día(s) seleccionado(s).`;
        selectedDates = [];
        resetInterface();
        generateCalendar();
        calculateQuincenaTotal();
        return;
    }
    let recordDayDate;
    if (isEditingMode && editingDateKey) {
        const [year, month, day] = editingDateKey.split('-').map(Number);
        recordDayDate = new Date(year, month - 1, day, 12, 0, 0);
    } else {
        recordDayDate = entryTime || new Date();
    }
    
    if (!selectedTurno || !selectedCategory || !selectedAntiguedad || adicionalBasico === null || !entryTime) {
        resultDisplay.textContent = 'Error: Faltan datos para el registro. Por favor, completa todos los pasos.';
        if (!isEditingMode) {
            resetInterface();
        }
        return;
    }

    const currentMonthIndex = recordDayDate.getMonth();
    const currentMonthName = MONTH_NAMES[currentMonthIndex];
    const dayOfWeek = recordDayDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    const valorHoraBase = getValorHoraBase(selectedCategory, currentMonthName);
    const bonificacionPorAntiguedad = getBonificacionAntiguedad(selectedAntiguedad);
    if (valorHoraBase === undefined) {
        resultDisplay.textContent = `Error: No se encontraron datos salariales para la categoría ${selectedCategory} en el mes de ${currentMonthName}. Por favor, verifica la configuración.`;
        if (!isEditingMode) {
            resetInterface();
        }
        return;
    }
    // Usar la nueva función de cálculo simplificada
    const feriado = isFeriado(recordDayDate);
    const turnoParaCalculo = feriado ? 'feriado' : selectedTurno;
    
    let salarioBrutoSinPresentismo = calcularSalarioDiario(
        turnoParaCalculo, 
        valorHoraBase, 
        bonificacionPorAntiguedad, 
        adicionalBasico,
        dayOfWeek, 
        extraHoursMade
    );
    
    // El cálculo ya incluye presentismo y retorna total a cobrar
    let salarioDiarioBruto = salarioBrutoSinPresentismo / 0.8; // Convertir a total sin retenciones
    
    let extraHoursInfo = extraHoursMade > 0 ? ` (+${extraHoursMade}hs extras)` : "";
    
    // Valores para compatibilidad con el sistema existente
    let valorHoraNormalCalculado = valorHoraBase;
    let horaNocturnaCalculada = valorHoraBase * 1.3;
    let horaExtraDiurnaCalculada = valorHoraBase * 1.5;
    let horaExtraNocturnaCalculada = valorHoraBase * 1.3 * 1.5;
    let feriadoDiurnoCalculado = (valorHoraBase + bonificacionPorAntiguedad) * 1.2;
    let feriadoNocturnoCalculado = feriadoDiurnoCalculado;
    let jornalDiario = salarioBrutoSinPresentismo;


    const formattedEntryTime = entryTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).substring(0,5);
    const formattedDate = recordDayDate.toLocaleDateString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const standardTurnoTime = HORAS_ESTANDAR_INGRESO[selectedTurno];
    const lateMinutes = calculateLateMinutes(entryTime, standardTurnoTime);
    const isAbsentDueToLateness = lateMinutes > MINUTOS_TOLERANCIA_TARDE;

    // Ajustar presentismo si hay ausencias
    if (isAbsentDueToLateness) {
        // En tus ejemplos, el presentismo se calcula primero y luego se suma.
        // Si el presentismo se pierde por la tardanza, hay que ajustar esto.
        // Por ahora, tu ejemplo lo suma, pero la lógica de pérdida por tardanza (Ausencia) es previa.
        // Mantenemos la lógica de la quincena para el presentismo general.
        // Para el cálculo DIARIO de salarioBruto, asumimos que si hay "Ausencia", el presentismo de ese día NO se suma.
        // Sin embargo, tus ejemplos muestran presentismo sumado incluso con tardanza, lo cual es contradictorio.
        // Por la simplicidad de tus ejemplos, el presentismo se suma al final del día.
        // La lógica de "absencesCount" en `calculateQuincenaTotal` ya maneja la pérdida del porcentaje.
    }


    const entryStatusText = isAbsentDueToLateness ? `Tarde (${lateMinutes} min) - AUSENCIA` :
                            (lateMinutes > 0 ? `Tarde (${lateMinutes} min)` : 'Temprano/A tiempo');
    
    resultDisplay.textContent = `¡Registro exitoso! Fecha: ${formattedDate} - Ingreso: ${formattedEntryTime} - Estado: ${entryStatusText} - Turno: ${selectedTurno.charAt(0).toUpperCase() + selectedTurno.slice(1)} (${JORNADA_HORAS}hs)${extraHoursInfo} - Categoría: ${selectedCategory} - Antigüedad: ${selectedAntiguedad} años`;
    
    // Guardar en workRecords los valores separados para el cálculo final
    saveWorkRecord(recordDayDate, selectedTurno, JORNADA_HORAS, extraHoursMade, entryTime, selectedCategory, selectedAntiguedad, valorHoraBase, bonificacionPorAntiguedad, jornalDiario, salarioDiarioBruto, lateMinutes, isAbsentDueToLateness, valorHoraNormalCalculado, horaNocturnaCalculada, horaExtraDiurnaCalculada, horaExtraNocturnaCalculada, feriadoDiurnoCalculado, feriadoNocturnoCalculado, dayOfWeek, montoPresentismo);

    addRecordToHistory(resultDisplay.textContent);

    resetInterface();
    generateCalendar();
    calculateQuincenaTotal();
}

// --- FUNCIÓN GLOBAL: Guardar registro de trabajo ---
function saveWorkRecord(date, turno, jornadaHoras, extraHours, actualEntryTime, category, selectedAntiguedad, valorHoraBase, bonificacionPorAntiguedad, jornalDiario, salarioDiarioBruto, lateMinutes, isAbsentDueToLateness, valorHoraNormal, horaNocturna, horaExtraDiurna, horaExtraNocturna, feriadoDiurno, feriadoNocturno, dayOfWeek, montoPresentismo, feriado) {
    const dateKey = getDateKey(date);

    let exitTime = new Date(actualEntryTime.getTime());
    exitTime.setHours(actualEntryTime.getHours() + jornadaHoras);

    const formattedEntryTime = actualEntryTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).substring(0,5);
    const formattedExitTime = exitTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).substring(0,5);

    workRecords[dateKey] = {
        turno: turno,
        horas_trabajadas: jornadaHoras,
        horas_extras: extraHours,
        entrada: formattedEntryTime,
        salida: formattedExitTime,
        category: category,
        antiguedad_anos: selectedAntiguedad,
        valor_hora_base: valorHoraBase,
        bonificacion_antiguedad: bonificacionPorAntiguedad,
        jornal_diario: jornalDiario,
        salario_diario_bruto: salarioDiarioBruto,
        monto_presentismo_diario: montoPresentismo, // Nuevo campo para el presentismo diario
        late_minutes: lateMinutes,
        is_absent_due_to_lateness: isAbsentDueToLateness,
        day_of_week: dayOfWeek, // Guardamos el día de la semana
        // Nuevos campos para los valores de conceptos
        valor_hora_normal: valorHoraNormal,
        hora_nocturna: horaNocturna,
        hora_extra_diurna: horaExtraDiurna,
        hora_extra_nocturna: horaExtraNocturna,
        feriado_diurno: feriadoDiurno,
        feriado_nocturno: feriadoNocturno,
        feriado: !!feriado
    };
    localStorage.setItem('workRecords', JSON.stringify(workRecords));
    generateCalendar();
}

// --------------------------------------------------------- Funciones del Calendario ---------------------------------------------------------
// Variable global para almacenar los días seleccionados.
// Asegúrate de que esta línea esté al inicio de tu script, fuera de cualquier función.
let selectedDates = [];

// --- NUEVO: Lista de feriados editables (formato YYYY-MM-DD) ---
const FERIADOS = [
    // Ejemplo: '2025-07-09', '2025-07-20'
];

function isFeriado(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return FERIADOS.includes(`${year}-${month}-${day}`);
}

function generateCalendar() {
    calendarDaysGrid.innerHTML = '';

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    currentMonthYearDisplay.textContent = `${MONTH_NAMES[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1);
    let startDay = firstDayOfMonth.getDay();
    // Ajustar para que el calendario comience en lunes (0=lunes, 6=domingo)
    startDay = (startDay === 0) ? 6 : startDay - 1;

    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day');
        calendarDaysGrid.appendChild(emptyDay);
    }

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        // Distinción de quincena eliminada
        const currentDayDate = new Date(year, month, day);
        const today = new Date();

        if (currentDayDate.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        const dayNumberSpan = document.createElement('span');
        dayNumberSpan.classList.add('day-number');
        dayNumberSpan.textContent = day;
        dayElement.appendChild(dayNumberSpan);

        const dateKey = getDateKey(new Date(year, month, day));
        dayElement.setAttribute('data-date-key', dateKey);

        if (selectedDates.includes(dateKey)) {
            dayElement.classList.add('selected-day');
        }

        if (workRecords[dateKey]) {
            dayElement.classList.add('recorded-day');
            dayElement.addEventListener('click', (e) => {
                e.stopPropagation();
                editDayRecord(dateKey);
            });
        } else {
            dayElement.addEventListener('click', () => toggleDaySelection(dateKey, dayElement));
        }

        if (workRecords[dateKey]) {
            const record = workRecords[dateKey];
            const workedHoursSpan = document.createElement('span');
            workedHoursSpan.classList.add('worked-hours');
            workedHoursSpan.classList.add(record.turno);
            
            // Mostrar letra del turno en lugar de horarios
            let turnoLetter = '';
            switch(record.turno) {
                case 'manana': turnoLetter = 'M'; break;
                case 'tarde': turnoLetter = 'T'; break;
                case 'noche': turnoLetter = 'N'; break;
                case 'feriado': turnoLetter = 'F'; break;
                default: turnoLetter = record.turno.charAt(0).toUpperCase();
            }
            
            workedHoursSpan.textContent = `${turnoLetter} (${record.horas_trabajadas}hs)`;
            dayElement.appendChild(workedHoursSpan);
            if (record.horas_extras > 0) {
                const extraHoursSpan = document.createElement('span');
                extraHoursSpan.classList.add('worked-hours', 'extra');
                extraHoursSpan.textContent = `+${record.horas_extras}hs extras`;
                dayElement.appendChild(extraHoursSpan);
            }
            if (record.is_absent_due_to_lateness) {
                const absenceSpan = document.createElement('span');
                absenceSpan.classList.add('absence-indicator');
                absenceSpan.textContent = `(Ausencia por ${record.late_minutes} min)`;
                dayElement.appendChild(absenceSpan);
            }
            if (record.salario_diario_bruto !== undefined) {
                const dailyWageSpan = document.createElement('span');
                dailyWageSpan.classList.add('daily-wage');
                dailyWageSpan.textContent = `Ganado: ${formatCurrency(record.salario_diario_bruto)}`;
                dayElement.appendChild(dailyWageSpan);
            }
            if (record.feriado) {
                const feriadoSpan = document.createElement('span');
                feriadoSpan.classList.add('feriado-indicator');
                feriadoSpan.textContent = 'FERIADO';
                dayElement.appendChild(feriadoSpan);
            }
        }
        calendarDaysGrid.appendChild(dayElement);
    }
}
function toggleDaySelection(dateKey, dayElement) {
    const index = selectedDates.indexOf(dateKey);

    if (index > -1) {
        // El día ya estaba seleccionado, lo deseleccionamos
        selectedDates.splice(index, 1);
        dayElement.classList.remove('selected-day');
    } else {
        // El día NO estaba seleccionado, lo seleccionamos
        selectedDates.push(dateKey);
        dayElement.classList.add('selected-day');
    }

    console.log('Días seleccionados:', selectedDates); // Para depuración en la consola
    // Aquí podrías actualizar un indicador visual en tu UI que muestre cuántos días están seleccionados.
}
function applyScheduleToSelectedDays() {
    if (selectedDates.length === 0) {
        alert('Por favor, selecciona al menos un día en el calendario.');
        return;
    }

    // Obtener datos del formulario
    const turno = document.getElementById('multi-turno').value;
    const categoria = document.getElementById('multi-categoria').value;
    const antiguedad = parseInt(document.getElementById('multi-antiguedad').value);
    const horaIngreso = document.getElementById('multi-hora-ingreso').value;
    const horasExtras = parseInt(document.getElementById('multi-horas-extras').value) || 0;
    if (!turno || !categoria || !antiguedad || !horaIngreso) {
        alert('Completa todos los campos requeridos.');
        return;
    }
    let count = 0;
    selectedDates.forEach(dateKey => {
        // Preparar la fecha y hora de ingreso
        const [year, month, day] = dateKey.split('-').map(Number);
        const entryTime = new Date(year, month - 1, day, ...horaIngreso.split(':').map(Number));
        // Obtener mes y día de la semana
        const currentMonthName = MONTH_NAMES[entryTime.getMonth()];
        const dayOfWeek = entryTime.getDay();
        // Calcular valores base
        const valorHoraBase = TABLA_SALARIAL[categoria]?.[currentMonthName];
        const bonificacionPorAntiguedad = getBonificacionAntiguedad(antiguedad);
        if (valorHoraBase === undefined) return;
        // Lógica de cálculo igual que en recordAttendance
        let valorHoraBaseDiurna = valorHoraBase;
        let valorHoraBaseNocturna20pct = valorHoraBase * 1.20;
        let valorHoraBaseNocturna7pct = valorHoraBase * 1.07;
        if (dayOfWeek === 6) {
            if (turno === 'tarde') {
                valorHoraBaseDiurna = valorHoraBase * (1 + 1.33);
                valorHoraBaseNocturna20pct = (valorHoraBase * 1.20) * (1 + 1.53);
                valorHoraBaseNocturna7pct = 0;
            } else if (turno === 'noche') {
                valorHoraBaseNocturna20pct = (valorHoraBase * 1.20) * (1 + 1.53);
                valorHoraBaseNocturna7pct = 0;
                valorHoraBaseDiurna = 0;
            }
        }
        let horaDiurnaConAntiguedad = valorHoraBaseDiurna + bonificacionPorAntiguedad;
        let horaNocturna20pctConAntiguedad = valorHoraBaseNocturna20pct + bonificacionPorAntiguedad;
        let horaNocturna7pctConAntiguedad = valorHoraBaseNocturna7pct + bonificacionPorAntiguedad;
        let jornalDiario = 0;
        let valorHoraNormalCalculado = 0;
        let horaNocturnaCalculada = 0;
        switch (turno) {
            case 'manana':
                jornalDiario = JORNADA_HORAS * horaDiurnaConAntiguedad;
                valorHoraNormalCalculado = horaDiurnaConAntiguedad;
                horaNocturnaCalculada = horaNocturna20pctConAntiguedad;
                break;
            case 'tarde':
                let salarioDiurnoTarde = 7 * horaDiurnaConAntiguedad;
                let salarioNocturnoTarde = 1 * horaNocturna20pctConAntiguedad;
                jornalDiario = salarioDiurnoTarde + salarioNocturnoTarde;
                valorHoraNormalCalculado = horaDiurnaConAntiguedad;
                horaNocturnaCalculada = horaNocturna20pctConAntiguedad;
                break;
            case 'noche':
                jornalDiario = JORNADA_HORAS * horaNocturna7pctConAntiguedad;
                valorHoraNormalCalculado = horaNocturna7pctConAntiguedad;
                horaNocturnaCalculada = horaNocturna7pctConAntiguedad;
                break;
            default:
                jornalDiario = 0;
        }
        let horaExtraDiurnaCalculada = valorHoraNormalCalculado * 1.50;
        let horaExtraNocturnaCalculada = horaNocturnaCalculada * 1.50;
        let feriadoDiurnoCalculado = valorHoraNormalCalculado * 2.00;
        let feriadoNocturnoCalculado = horaNocturnaCalculada * 2.00;
        let salarioBrutoSinPresentismo = jornalDiario;
        if (horasExtras > 0) {
            if (turno === 'noche' || (turno === 'tarde' && entryTime.getHours() >= 21) || (dayOfWeek === 6 && turno === 'noche')) {
                salarioBrutoSinPresentismo += (horasExtras * horaExtraNocturnaCalculada);
            } else {
                salarioBrutoSinPresentismo += (horasExtras * horaExtraDiurnaCalculada);
            }
        }
        let montoPresentismo = salarioBrutoSinPresentismo * 0.20;
        let salarioDiarioBruto = salarioBrutoSinPresentismo + montoPresentismo;
        // Calcular tardanza
        const standardTurnoTime = HORAS_ESTANDAR_INGRESO[turno];
        const lateMinutes = calculateLateMinutes(entryTime, standardTurnoTime);
        const isAbsentDueToLateness = lateMinutes > MINUTOS_TOLERANCIA_TARDE;
        // Guardar registro usando la fecha correcta para cada día
        saveWorkRecord(new Date(year, month - 1, day), turno, JORNADA_HORAS, horasExtras, entryTime, categoria, antiguedad, valorHoraBase, bonificacionPorAntiguedad, jornalDiario, salarioDiarioBruto, lateMinutes, isAbsentDueToLateness, valorHoraNormalCalculado, horaNocturnaCalculada, horaExtraDiurnaCalculada, horaExtraNocturnaCalculada, feriadoDiurnoCalculado, feriadoNocturnoCalculado, dayOfWeek, montoPresentismo, feriado);
        count++;
    });
    // Limpiar selección y actualizar solo una vez
    selectedDates = [];
    generateCalendar();
    calculateQuincenaTotal();
    exitTime.setHours(actualEntryTime.getHours() + jornadaHoras);

    const formattedEntryTime = actualEntryTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).substring(0,5);
    const formattedExitTime = exitTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }).substring(0,5);

    workRecords[dateKey] = {
        turno: turno,
        horas_trabajadas: jornadaHoras,
        horas_extras: extraHours,
        entrada: formattedEntryTime,
        salida: formattedExitTime,
        category: category,
        antiguedad_anos: selectedAntiguedad,
        valor_hora_base: valorHoraBase,
        bonificacion_antiguedad: bonificacionPorAntiguedad,
        jornal_diario: jornalDiario,
        salario_diario_bruto: salarioDiarioBruto,
        monto_presentismo_diario: montoPresentismo, // Nuevo campo para el presentismo diario
        late_minutes: lateMinutes,
        is_absent_due_to_lateness: isAbsentDueToLateness,
        day_of_week: dayOfWeek, // Guardamos el día de la semana
        // Nuevos campos para los valores de conceptos
        valor_hora_normal: valorHoraNormal,
        hora_nocturna: horaNocturna,
        hora_extra_diurna: horaExtraDiurna,
        hora_extra_nocturna: horaExtraNocturna,
        feriado_diurno: feriadoDiurno,
        feriado_nocturno: feriadoNocturno,
        feriado: !!feriado
    };
    localStorage.setItem('workRecords', JSON.stringify(workRecords));
    generateCalendar();
}

function addRecordToHistory(recordText) {
    const listItem = document.createElement('li');
    listItem.textContent = recordText;
    historyList.prepend(listItem);
}

function calculateQuincenaTotal() {
    const currentMonth = currentCalendarDate.getMonth();
    const currentYear = currentCalendarDate.getFullYear();
    const currentMonthName = MONTH_NAMES[currentMonth];
    // Fechas de inicio y fin de quincenas
    const primeraQuincenaStart = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    const primeraQuincenaEnd = new Date(currentYear, currentMonth, 15, 12, 0, 0);
    const segundaQuincenaStart = new Date(currentYear, currentMonth, 16, 12, 0, 0);
    const segundaQuincenaEnd = new Date(currentYear, currentMonth + 1, 0, 12, 0, 0);
    // Mes completo
    const mesStartDate = new Date(currentYear, currentMonth, 1, 12, 0, 0);
    const mesEndDate = new Date(currentYear, currentMonth + 1, 0, 12, 0, 0);

    // Acumuladores para cada bloque
    let totalPrimera = 0, totalSegunda = 0, totalMes = 0;
    let diasPrimera = 0, diasSegunda = 0, diasMes = 0;
    let ausenciasPrimera = 0, ausenciasSegunda = 0, ausenciasMes = 0;
    let sumaNoRemunerativaSegunda = SUMA_NO_REMUN[currentMonthName] || 0;

    // Detalle de horas y valores por bloque
    function getDetalleHoras(records, start, end) {
        let detalle = {
            manana: { horas: 0, valor: 0 },
            tarde: { horas: 0, valor: 0 },
            noche: { horas: 0, valor: 0 },
            extraDiurna: { horas: 0, valor: 0 },
            extraNocturna: { horas: 0, valor: 0 },
            feriadoDiurno: { horas: 0, valor: 0 },
            feriadoNocturno: { horas: 0, valor: 0 }
        };
        for (const dateKey in records) {
            const [rYear, rMonth, rDay] = dateKey.split('-').map(Number);
            const recordDate = new Date(rYear, rMonth - 1, rDay, 12, 0, 0);
            if (recordDate >= start && recordDate <= end) {
                const rec = records[dateKey];
                if (!rec || rec.salario_diario_bruto === undefined) continue;
                // Horas normales
                if (rec.turno === 'manana') {
                    detalle.manana.horas += rec.horas_trabajadas;
                    detalle.manana.valor = rec.valor_hora_normal;
                } else if (rec.turno === 'tarde') {
                    detalle.tarde.horas += rec.horas_trabajadas;
                    detalle.tarde.valor = rec.valor_hora_normal;
                } else if (rec.turno === 'noche') {
                    detalle.noche.horas += rec.horas_trabajadas;
                    detalle.noche.valor = rec.valor_hora_normal;
                }
                // Horas extras
                if (rec.horas_extras > 0) {
                    if (rec.turno === 'noche' || rec.hora_nocturna === rec.valor_hora_normal) {
                        detalle.extraNocturna.horas += rec.horas_extras;
                        detalle.extraNocturna.valor = rec.hora_extra_nocturna;
                    } else {
                        detalle.extraDiurna.horas += rec.horas_extras;
                        detalle.extraDiurna.valor = rec.hora_extra_diurna;
                    }
                }
                // Feriados
                if (rec.feriado) {
                    if (rec.turno === 'noche') {
                        detalle.feriadoNocturno.horas += rec.horas_trabajadas;
                        detalle.feriadoNocturno.valor = rec.feriado_nocturno;
                    } else {
                        detalle.feriadoDiurno.horas += rec.horas_trabajadas;
                        detalle.feriadoDiurno.valor = rec.feriado_diurno;
                    }
                }
            }
        }
        return detalle;
    }
    // Obtener detalles
    const detallePrimera = getDetalleHoras(workRecords, primeraQuincenaStart, primeraQuincenaEnd);
    const detalleSegunda = getDetalleHoras(workRecords, segundaQuincenaStart, segundaQuincenaEnd);
    const detalleMes = getDetalleHoras(workRecords, mesStartDate, mesEndDate);

    // Función para renderizar el detalle de horas y valores de forma más específica y visual
    function renderDetalle(det) {
        let html = '<table class="detalle-horas-table" style="margin:8px 0 12px 0; border-collapse:collapse;">';
        html += '<tr style="background:#f0f0f0;"><th style="padding:2px 8px; border:1px solid #ccc;">Tipo</th><th style="padding:2px 8px; border:1px solid #ccc;">Horas</th><th style="padding:2px 8px; border:1px solid #ccc;">Valor unitario</th></tr>';
        if (det.manana.horas > 0) html += `<tr><td>Mañana</td><td style="text-align:center;">${det.manana.horas}</td><td style="text-align:right;">${formatCurrency(det.manana.valor)}</td></tr>`;
        if (det.tarde.horas > 0) html += `<tr><td>Tarde</td><td style="text-align:center;">${det.tarde.horas}</td><td style="text-align:right;">${formatCurrency(det.tarde.valor)}</td></tr>`;
        if (det.noche.horas > 0) html += `<tr><td>Noche</td><td style="text-align:center;">${det.noche.horas}</td><td style="text-align:right;">${formatCurrency(det.noche.valor)}</td></tr>`;
        if (det.extraDiurna.horas > 0) html += `<tr><td>Extra diurna</td><td style="text-align:center;">${det.extraDiurna.horas}</td><td style="text-align:right;">${formatCurrency(det.extraDiurna.valor)}</td></tr>`;
        if (det.extraNocturna.horas > 0) html += `<tr><td>Extra nocturna</td><td style="text-align:center;">${det.extraNocturna.horas}</td><td style="text-align:right;">${formatCurrency(det.extraNocturna.valor)}</td></tr>`;
        if (det.feriadoDiurno.horas > 0) html += `<tr><td>Feriado diurno</td><td style="text-align:center;">${det.feriadoDiurno.horas}</td><td style="text-align:right;">${formatCurrency(det.feriadoDiurno.valor)}</td></tr>`;
        if (det.feriadoNocturno.horas > 0) html += `<tr><td>Feriado nocturno</td><td style="text-align:center;">${det.feriadoNocturno.horas}</td><td style="text-align:right;">${formatCurrency(det.feriadoNocturno.valor)}</td></tr>`;
        html += '</table>';
        return html;
    }

    // ...acumuladores y totales...
    for (const dateKey in workRecords) {
        const [rYear, rMonth, rDay] = dateKey.split('-').map(Number);
        const recordDate = new Date(rYear, rMonth - 1, rDay, 12, 0, 0);
        const record = workRecords[dateKey];
        if (record.salario_diario_bruto !== undefined) {
            // Mes completo
            if (recordDate >= mesStartDate && recordDate <= mesEndDate) {
                totalMes += record.salario_diario_bruto;
                diasMes++;
                if (record.is_absent_due_to_lateness) ausenciasMes++;
            }
            // Primera quincena
            if (recordDate >= primeraQuincenaStart && recordDate <= primeraQuincenaEnd) {
                totalPrimera += record.salario_diario_bruto;
                diasPrimera++;
                if (record.is_absent_due_to_lateness) ausenciasPrimera++;
            }
            // Segunda quincena
            if (recordDate >= segundaQuincenaStart && recordDate <= segundaQuincenaEnd) {
                totalSegunda += record.salario_diario_bruto;
                diasSegunda++;
                if (record.is_absent_due_to_lateness) ausenciasSegunda++;
            }
        }
    }
    function presentismoImpact(ausencias) {
        if (ausencias === 0) return ' (0 ausencias)';
        if (ausencias === 1) return ' (1 ausencia impacta presentismo)';
        if (ausencias === 2) return ' (2 ausencias impactan presentismo)';
        return ` (${ausencias} ausencias impactan presentismo)`;
    }
    const totalSegundaConNoRemun = totalSegunda + sumaNoRemunerativaSegunda;
    quincenaDisplay.innerHTML = `
        <div class="resumen-bloque resumen-primera" style="border:2px solid #1976d2; border-radius:8px; margin-bottom:18px; background:linear-gradient(90deg,#e3f0ff 60%,#fafdff 100%); box-shadow:0 2px 8px #1976d22a; padding:12px 16px;">
            <h3 style="margin:0 0 8px 0; color:#1976d2;">Primera Quincena (1 al 15)</h3>
            <p>Total: <strong>${formatCurrency(totalPrimera)}</strong></p>
            <p> días trabajados: <strong>${diasPrimera}</strong></p>
            <p>Ausencias: <strong>${ausenciasPrimera}</strong>${presentismoImpact(ausenciasPrimera)}</p>
            <div><strong>Detalle de horas y valores:</strong>${renderDetalle(detallePrimera)}</div>
        </div>
        <div class="resumen-bloque resumen-segunda" style="border:2px solid #388e3c; border-radius:8px; margin-bottom:18px; background:linear-gradient(90deg,#e8f5e9 60%,#fafdff 100%); box-shadow:0 2px 8px #388e3c22; padding:12px 16px;">
            <h3 style="margin:0 0 8px 0; color:#388e3c;">Segunda Quincena (16 al fin de mes)</h3>
            <p>Total (sin suma no remunerativa): <strong>${formatCurrency(totalSegunda)}</strong></p>
            <p>Suma No Remunerativa: <strong>${formatCurrency(sumaNoRemunerativaSegunda)}</strong></p>
            <p>Total con suma no remunerativa: <strong>${formatCurrency(totalSegundaConNoRemun)}</strong></p>
            <p> días trabajados: <strong>${diasSegunda}</strong></p>
            <p>Ausencias: <strong>${ausenciasSegunda}</strong>${presentismoImpact(ausenciasSegunda)}</p>
            <div><strong>Detalle de horas y valores:</strong>${renderDetalle(detalleSegunda)}</div>
        </div>
        <div class="resumen-bloque resumen-mes" style="border:2px solid #f9a825; border-radius:8px; background:linear-gradient(90deg,#fffde7 60%,#fffbe7 100%); box-shadow:0 2px 8px #f9a82522; padding:12px 16px;">
            <h3 style="margin:0 0 8px 0; color:#f9a825;">Resumen Mensual (${currentMonthName} ${currentYear})</h3>
            <p>Total de Salario del Mes: <strong>${formatCurrency(totalMes)}</strong></p>
            <p> días trabajados: <strong>${diasMes}</strong></p>
            <p>Ausencias por tardanza: <strong>${ausenciasMes}</strong></p>
            <div><strong>Detalle de horas y valores:</strong>${renderDetalle(detalleMes)}</div>
        </div>
        <div class="resumen-bloque resumen-calculos" style="border:2px solid #bdbdbd; border-radius:8px; background:linear-gradient(90deg,#f5f5f5 60%,#fafdff 100%); box-shadow:0 2px 8px #bdbdbd22; padding:12px 16px; margin-top:12px;">
            <h3 style="margin:0 0 8px 0; color:#616161;">Cálculos realizados</h3>
            <div id="calculos-detalle" style="font-size:0.97em;">
                <ul style="margin:0; padding-left:18px;">
                    <li><strong>Horas normales:</strong> ${detalleMes.manana.horas + detalleMes.tarde.horas + detalleMes.noche.horas}</li>
                    <li><strong>Horas extras diurnas:</strong> ${detalleMes.extraDiurna.horas}</li>
                    <li><strong>Horas extras nocturnas:</strong> ${detalleMes.extraNocturna.horas}</li>
                    <li><strong>Feriado diurno:</strong> ${detalleMes.feriadoDiurno.horas}</li>
                    <li><strong>Feriado nocturno:</strong> ${detalleMes.feriadoNocturno.horas}</li>
                    <li><strong>Días trabajados:</strong> ${diasMes}</li>
                    <li><strong>Ausencias:</strong> ${ausenciasMes}</li>
                    <li><strong>Salario base total:</strong> ${formatCurrency(totalMes)}</li>
                    <li><strong>Suma no remunerativa:</strong> ${formatCurrency(sumaNoRemunerativaSegunda)}</li>
                    <li><strong>Salario total con suma no remunerativa:</strong> ${formatCurrency(totalMes + sumaNoRemunerativaSegunda)}</li>
                </ul>
                <ul style="margin:0; padding-left:18px;">
                </ul>
            </div>
        </div>
    `;
}

// ------------------------------------------------------Función para iniciar la edición de un registro de día (o agregar uno nuevo para ese día)------------------------------------------------------
function editDayRecord(dateKey) {
    hideAllSteps();
    editingMessage.style.display = 'block';
    const [year, month, day] = dateKey.split('-').map(Number);
    const displayDate = new Date(year, month - 1, day, 12, 0, 0); 
    editingDateDisplay.textContent = displayDate.toLocaleDateString('es-AR');
    isEditingMode = true;
    editingDateKey = dateKey;
    const record = workRecords[dateKey];
    if (record) {
        selectedTurno = record.turno;
        const [recordedHours, recordedMinutes] = record.entrada.split(':').map(Number);
        entryTime = new Date(year, month - 1, day, recordedHours, recordedMinutes, 0);
        selectedCategory = record.category;
        selectedAntiguedad = record.antiguedad_anos;
        adicionalBasico = record.adicional_basico || 0;
        extraHoursMade = record.horas_extras;
        deleteRecordBtn.style.display = 'block'; // Mostrar botón eliminar
        deleteRecordBtn.onclick = deleteRecord; // Asegurar funcionalidad
        resultDisplay.textContent = `Editando registro para el ${displayDate.toLocaleDateString('es-AR')}. Modifica los datos y guarda para actualizar, o elimina el registro.`;
        stepSelectTurno.style.display = 'block'; 
    } else {
        selectedTurno = null;
        entryTime = null;
        selectedCategory = null;
        selectedAntiguedad = null;
        adicionalBasico = 0;
        extraHoursMade = 0;
        inputHoraIngreso.value = '';
        inputAdicionalBasico.value = '';
        inputExtraHours.value = '1';
        deleteRecordBtn.style.display = 'none';
        resultDisplay.textContent = `Agregando registro para el ${displayDate.toLocaleDateString('es-AR')}.`;
        stepSelectTurno.style.display = 'block';
    }
}

//------------------------------------------------------ Función para cancelar el modo edición y reiniciar la interfaz------------------------------------------------------
function cancelEditing() {
    resetInterface();
    resultDisplay.textContent = 'Edición cancelada. Selecciona tu turno para empezar un nuevo registro.';
    generateCalendar();
    calculateQuincenaTotal();
}

//------------------------------------------------------ Función para eliminar un registro------------------------------------------------------
function deleteRecord() {
    if (confirm(`¿Estás seguro de que quieres eliminar el registro para el día ${editingDateDisplay.textContent}?`)) {
        delete workRecords[editingDateKey];
        localStorage.setItem('workRecords', JSON.stringify(workRecords));
        resetInterface();
        generateCalendar();
        calculateQuincenaTotal();
        resultDisplay.textContent = `Registro para el ${editingDateDisplay.textContent} eliminado.`;
    }
}

function generateAntiguedadOptions() {
    antiguedadOptionsContainer.innerHTML = '';
    const years = Object.keys(TABLA_ANTIGUEDAD).map(key => parseInt(key)).sort((a, b) => a - b);

    years.forEach(year => {
        const button = document.createElement('button');
        button.textContent = `${year} años`;
        button.onclick = () => selectAntiguedad(year);
        antiguedadOptionsContainer.appendChild(button);
    });
}


// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    generateAntiguedadOptions();
    generateCalendar();
    calculateQuincenaTotal();
    resetInterface();
});

// Cambia el mes actual del calendario y regenera la vista
function changeMonth(delta) {
    // Siempre poner el día en 1 para evitar problemas con meses cortos (ej: febrero)
    currentCalendarDate.setDate(1);
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    generateCalendar();
    calculateQuincenaTotal();
}

// CIERRE DE FUNCIONES Y ARCHIVO
// Aseguramos que todas las funciones estén correctamente cerradas
// y agregamos la llave final si falta
// El resto del código permanece igual, pero ahora TABLA_ANTIGUEDAD y getBonificacionAntiguedad son coherentes y simples.
// Si en algún lugar se usaba 'Enero 2025', 'Febrero 2025', etc., para antigüedad, ahora solo se debe pasar el mes simple (por ejemplo, 'Mayo'.

// Helper para generar dateKey consistente (YYYY-MM-DD)
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper para obtener valor salarial y suma no remunerativa por mes simple
function getValorHoraBase(category, currentMonthName) {
    return TABLA_SALARIAL[category]?.[currentMonthName.toLowerCase()];
}
function getSumaNoRemunerativa(currentMonthName) {
    return SUMA_NO_REMUN[currentMonthName] || 0;
}

// --- UI para marcar/desmarcar feriados desde el calendario ---
function toggleFeriado(dateKey) {
    const idx = FERIADOS.indexOf(dateKey);
    if (idx === -1) {
        FERIADOS.push(dateKey);
    } else {
        FERIADOS.splice(idx, 1);
    }
    localStorage.setItem('FERIADOS', JSON.stringify(FERIADOS));
    generateCalendar();
    calculateQuincenaTotal();
}
// Al cargar, restaurar feriados guardados
if (localStorage.getItem('FERIADOS')) {
    const guardados = JSON.parse(localStorage.getItem('FERIADOS'));
    if (Array.isArray(guardados)) {
        FERIADOS.length = 0;
        FERIADOS.push(...guardados);
    }
}

// Función para mostrar/ocultar detalles de cálculo
function toggleCalculationDetails() {
    const detailsContainer = document.getElementById('calculation-details');
    const toggleBtn = document.getElementById('toggle-details-btn');
    
    if (detailsContainer.style.display === 'none' || detailsContainer.style.display === '') {
        detailsContainer.style.display = 'block';
        toggleBtn.textContent = 'Ocultar Detalles';
    } else {
        detailsContainer.style.display = 'none';
        toggleBtn.textContent = 'Mostrar Detalles';
    }
}

// =================================================================
// FUNCIONES PARA MODAL DE DÍAS MÚTIPLES
// =================================================================

function openMultiDayScheduleModal() {
    if (selectedDates.length === 0) {
        alert('Selecciona al menos un día en el calendario.');
        return;
    }
    
    document.getElementById('multi-day-selected-dates-display').textContent = selectedDates.length;
    document.getElementById('multiDayScheduleModal').style.display = 'block';
    
    // Llenar select de antigüedad
    const antiguedadSelect = document.getElementById('multi-antiguedad-select');
    antiguedadSelect.innerHTML = '<option value="">Selecciona antigüedad</option>';
    Object.keys(TABLA_ANTIGUEDAD).forEach(years => {
        const option = document.createElement('option');
        option.value = years;
        option.textContent = `${years} años`;
        antiguedadSelect.appendChild(option);
    });
}

function closeMultiDayScheduleModal() {
    document.getElementById('multiDayScheduleModal').style.display = 'none';
}

function clearSelectedDatesAndCloseModal() {
    selectedDates = [];
    generateCalendar();
    updateSelectedDaysButton();
    closeMultiDayScheduleModal();
}

function applyMultiDaySchedule() {
    const turno = document.getElementById('multi-turno-select').value;
    const categoria = document.getElementById('multi-category-select').value;
    const antiguedad = parseInt(document.getElementById('multi-antiguedad-select').value);
    const horaEntrada = document.getElementById('multi-entrada-input').value;
    const horasExtras = parseInt(document.getElementById('multi-extra-hours-input').value) || 0;
    
    if (!turno || !categoria || !antiguedad || !horaEntrada) {
        alert('Completa todos los campos requeridos.');
        return;
    }
    
    selectedDates.forEach(dateKey => {
        const [year, month, day] = dateKey.split('-').map(Number);
        const entryTime = new Date(year, month - 1, day, ...horaEntrada.split(':').map(Number));
        const currentMonthName = MONTH_NAMES[entryTime.getMonth()];
        const dayOfWeek = entryTime.getDay();
        
        const valorHoraBase = TABLA_SALARIAL[categoria]?.[currentMonthName];
        const bonificacionPorAntiguedad = getBonificacionAntiguedad(antiguedad);
        
        if (valorHoraBase === undefined) return;
        
        const feriado = isFeriado(entryTime);
        const turnoParaCalculo = feriado ? 'feriado' : turno;
        
        let salarioBrutoSinPresentismo = calcularSalarioDiario(
            turnoParaCalculo, 
            valorHoraBase, 
            bonificacionPorAntiguedad, 
            adicionalBasico,
            dayOfWeek, 
            horasExtras
        );
        
        let montoPresentismo = salarioBrutoSinPresentismo * 0.20;
        let salarioDiarioBruto = salarioBrutoSinPresentismo + montoPresentismo;
        
        const standardTurnoTime = HORAS_ESTANDAR_INGRESO[turno];
        const lateMinutes = calculateLateMinutes(entryTime, standardTurnoTime);
        const isAbsentDueToLateness = lateMinutes > MINUTOS_TOLERANCIA_TARDE;
        
        // Valores para compatibilidad
        let valorHoraNormalCalculado = valorHoraBase;
        let horaNocturnaCalculada = valorHoraBase * 1.3;
        let horaExtraDiurnaCalculada = valorHoraBase * 1.5;
        let horaExtraNocturnaCalculada = valorHoraBase * 1.3 * 1.5;
        let feriadoDiurnoCalculado = (valorHoraBase + bonificacionPorAntiguedad) * 1.2;
        let feriadoNocturnoCalculado = feriadoDiurnoCalculado;
        
        saveWorkRecord(
            new Date(year, month - 1, day), 
            turno, 
            JORNADA_HORAS, 
            horasExtras, 
            entryTime, 
            categoria, 
            antiguedad, 
            valorHoraBase, 
            bonificacionPorAntiguedad, 
            salarioBrutoSinPresentismo, 
            salarioDiarioBruto, 
            lateMinutes, 
            isAbsentDueToLateness, 
            valorHoraNormalCalculado, 
            horaNocturnaCalculada, 
            horaExtraDiurnaCalculada, 
            horaExtraNocturnaCalculada, 
            feriadoDiurnoCalculado, 
            feriadoNocturnoCalculado, 
            dayOfWeek, 
            montoPresentismo, 
            feriado
        );
    });
    
    selectedDates = [];
    generateCalendar();
    calculateQuincenaTotal();
    updateSelectedDaysButton();
    closeMultiDayScheduleModal();
    
    resultDisplay.textContent = `¡Horario aplicado exitosamente a los días seleccionados!`;
}

function updateSelectedDaysButton() {
    const button = document.getElementById('open-multi-day-modal-btn');
    const countSpan = document.getElementById('selected-days-count');
    
    if (selectedDates.length > 0) {
        button.style.display = 'block';
        countSpan.textContent = selectedDates.length;
    } else {
        button.style.display = 'none';
    }
}

// Actualizar la función toggleDaySelection para mostrar/ocultar el botón
const originalToggleDaySelection = toggleDaySelection;
toggleDaySelection = function(dateKey, dayElement) {
    originalToggleDaySelection(dateKey, dayElement);
    updateSelectedDaysButton();
};