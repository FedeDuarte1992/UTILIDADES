/**
 * =================================================================
 * SCRIPT PARA CÁLCULO POR HORAS
 * =================================================================
 * 
 * Este archivo maneja toda la lógica específica para el cálculo
 * de salarios por horas trabajadas.
 * 
 * Funcionalidades principales:
 * - Selección de categoría y mes
 * - Cálculo automático de valor hora
 * - Entrada manual de valor hora
 * - Cálculo de antigüedad
 * - Cálculo de diferentes tipos de horas (normales, nocturnas, extras, etc.)
 * - Cálculo de presentismo
 * - Actualización automática de resultados
 */

// =================================================================
// VARIABLES GLOBALES
// =================================================================

// Control de modo manual de valor hora
let usandoValorManual = false;

// Elementos del DOM
const valorHoraManualInput = document.getElementById('valor-hora-manual');
const usarValorManualBtn = document.getElementById('usar-valor-manual');
const cancelarValorManualBtn = document.getElementById('cancelar-valor-manual');
const valorHoraMostrar = document.getElementById('valor-hora-mostrar');
const msgValorManual = document.getElementById('msg-valor-manual');

// =================================================================
// TABLA DE VALORES SALARIALES
// =================================================================

/**
 * Tabla de valores hora por categoría y mes
 * Actualizada según convenio vigente
 */
const valoresHoraCat = {
    "A": {"junio":2750, "julio":2804, "agosto":2858, "septiembre":2912, "octubre":2966, "noviembre":3020},
    "B": {"junio":2800, "julio":2855, "agosto":2910, "septiembre":2965, "octubre":3020, "noviembre":3074},
    "C": {"junio":2854, "julio":2910, "agosto":2966, "septiembre":3022, "octubre":3078, "noviembre":3134},
    "D": {"junio":2905, "julio":2962, "agosto":3019, "septiembre":3076, "octubre":3133, "noviembre":3190},
    "E": {"junio":2964, "julio":3022, "agosto":3080, "septiembre":3138, "octubre":3197, "noviembre":3255},
    "F": {"junio":3021, "julio":3080, "agosto":3140, "septiembre":3199, "octubre":3258, "noviembre":3317},
    "G": {"junio":3115, "julio":3176, "agosto":3237, "septiembre":3298, "octubre":3359, "noviembre":3420},
    "H": {"junio":3182, "julio":3245, "agosto":3307, "septiembre":3370, "octubre":3432, "noviembre":3494}
};

/**
 * Tabla de valores de antigüedad por años y mes
 */
const valoresAntiguedad = {
    1: {"junio": 25, "julio": 27, "agosto": 28, "septiembre": 28, "octubre": 28, "noviembre": 28},
    3: {"junio": 37, "julio": 39, "agosto": 41, "septiembre": 41, "octubre": 41, "noviembre": 41},
    5: {"junio": 50, "julio": 53, "agosto": 56, "septiembre": 56, "octubre": 56, "noviembre": 56},
    7: {"junio": 68, "julio": 72, "agosto": 76, "septiembre": 76, "octubre": 76, "noviembre": 76},
    9: {"junio": 81, "julio": 86, "agosto": 91, "septiembre": 91, "octubre": 91, "noviembre": 91},
    12: {"junio": 108, "julio": 114, "agosto": 121, "septiembre": 121, "octubre": 121, "noviembre": 121},
    15: {"junio": 130, "julio": 138, "agosto": 146, "septiembre": 146, "octubre": 146, "noviembre": 146},
    18: {"junio": 152, "julio": 161, "agosto": 170, "septiembre": 170, "octubre": 170, "noviembre": 170},
    22: {"junio": 175, "julio": 186, "agosto": 196, "septiembre": 196, "octubre": 196, "noviembre": 196},
    26: {"junio": 198, "julio": 210, "agosto": 222, "septiembre": 222, "octubre": 222, "noviembre": 222},
    30: {"junio": 217, "julio": 230, "agosto": 243, "septiembre": 243, "octubre": 243, "noviembre": 243},
    35: {"junio": 238, "julio": 252, "agosto": 267, "septiembre": 267, "octubre": 267, "noviembre": 267},
    40: {"junio": 261, "julio": 277, "agosto": 292, "septiembre": 292, "octubre": 292, "noviembre": 292}
};

// =================================================================
// FUNCIONES DE VALOR HORA
// =================================================================

/**
 * Obtiene el valor hora según el modo (automático o manual)
 * @returns {number} Valor hora calculado
 */
function obtenerValorHora() {
    if (usandoValorManual && valorHoraManualInput.value && parseFloat(valorHoraManualInput.value) > 0) {
        return parseFloat(valorHoraManualInput.value);
    }
    
    // Modo automático
    const mes = document.getElementById('mes').value;
    const categoria = document.getElementById('categoria').value;
    
    if (!mes || !categoria) return 0;
    
    if (valoresHoraCat[categoria] && valoresHoraCat[categoria][mes]) {
        return valoresHoraCat[categoria][mes];
    }
    
    return 0;
}

/**
 * Actualiza la visualización del valor hora
 */
function actualizarValorHoraMostrar() {
    const valor = obtenerValorHora();
    valorHoraMostrar.textContent = valor > 0 ? 
        `$${valor.toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}` : 
        '$0';
    valorHoraMostrar.dataset.valor = valor;
    
    // Agregar animación visual
    valorHoraMostrar.classList.remove('animated-flash');
    void valorHoraMostrar.offsetWidth; // Forzar reflow
    valorHoraMostrar.classList.add('animated-flash');
}



/**
 * Muestra mensaje visual cuando se activa el valor hora manual
 */
function mostrarMensajeValorManual() {
    if (!msgValorManual) return;
    
    msgValorManual.textContent = 'Usando valor hora manual';
    msgValorManual.style.display = 'block';
    msgValorManual.style.background = '#1976d2';
    msgValorManual.style.color = '#fff';
    msgValorManual.style.padding = '4px 16px';
    msgValorManual.style.borderRadius = '8px';
    msgValorManual.style.fontSize = '0.98em';
    msgValorManual.style.margin = '8px auto 0 auto';
    msgValorManual.style.maxWidth = '220px';
    msgValorManual.style.boxShadow = '0 2px 12px #1976d288';
    msgValorManual.style.opacity = '1';
    
    // Animación del input
    valorHoraManualInput.style.background = '#e3f2fd';
    valorHoraManualInput.style.transition = 'background 0.5s';
    
    // Ocultar mensaje después de 2 segundos
    setTimeout(() => {
        msgValorManual.style.opacity = '0';
        setTimeout(() => {
            msgValorManual.style.display = 'none';
        }, 300);
        valorHoraManualInput.style.background = '';
    }, 2000);
}

// =================================================================
// FUNCIONES DE CÁLCULO
// =================================================================

/**
 * Obtiene el valor de antigüedad desde la tabla según años y mes
 * @param {number} anos - Años de antigüedad
 * @param {string} mes - Mes para obtener el valor correspondiente
 * @returns {number} Valor de antigüedad según mes
 */
function obtenerValorAntiguedad(anos, mes = null) {
    if (!mes) {
        // Si no se proporciona mes, usar el mes seleccionado
        mes = document.getElementById('mes').value;
    }
    return valoresAntiguedad[anos] ? (valoresAntiguedad[anos][mes] || 0) : 0;
}

/**
 * Calcula el monto para horas de sábado (100%)
 * @param {number} horas - Cantidad de horas
 * @param {number} valorHora - Valor base por hora
 * @param {number} valorAntiguedad - Valor de antigüedad
 * @returns {number} Monto calculado
 */
function calcularHorasSabado(horas, valorHora, valorAntiguedad) {
    const base = valorHora + valorAntiguedad;
    return horas * base * 1.2 * 2; // (base + 20%) * 2
}

/**
 * Calcula el monto para horas nocturnas extras (50% o 100%)
 * @param {number} horas - Cantidad de horas
 * @param {number} valorHora - Valor base por hora
 * @param {number} valorAntiguedad - Valor de antigüedad
 * @param {number} multiplicador - 1.5 para 50%, 2 para 100%
 * @returns {number} Monto calculado
 */
function calcularHorasNocturnasExtras(horas, valorHora, valorAntiguedad, multiplicador) {
    const nocturnidad = valorHora * 0.3;
    const subtotal = valorHora + valorAntiguedad + nocturnidad;
    const baseFinal = subtotal * 1.2045; // + 20.45%
    return horas * baseFinal * multiplicador;
}

/**
 * Obtiene todos los valores de entrada de una vez
 * @returns {Object} Objeto con todos los valores de entrada
 */
function obtenerValoresEntrada() {
    return {
        valorHora: obtenerValorHora(),
        horasNormales: parseFloat(document.getElementById('horas-normales').value) || 0,
        horasSabado: parseFloat(document.getElementById('horas-sabado').value) || 0,
        horasNocturnas: parseFloat(document.getElementById('horas-nocturnas').value) || 0,
        horas50: parseFloat(document.getElementById('horas-50').value) || 0,
        horasNocturnas50: parseFloat(document.getElementById('horas-nocturnas-50').value) || 0,
        horasNocturnas100: parseFloat(document.getElementById('horas-nocturnas-100').value) || 0,
        horasFeriado: parseFloat(document.getElementById('horas-feriado').value) || 0,
        presentismo: parseFloat(document.getElementById('presentismo').value) || 0,
        adicionalPorcentaje: parseFloat(document.getElementById('adicional-basico').value) || 0,
        antiguedadAnios: parseFloat(document.getElementById('antiguedad').value) || 0
    };
}



/**
 * Activa o desactiva el modo manual de valor hora
 * @param {boolean} activar - True para activar modo manual
 */
function setModoManual(activar) {
    usandoValorManual = activar;
    
    // Solo deshabilitar categoría y mes, NO antigüedad
    document.querySelectorAll('.categoria-btn, .mes-btn').forEach(btn => {
        btn.disabled = activar;
        if (activar) {
            btn.classList.add('disabled');
            btn.classList.remove('active');
        } else {
            btn.classList.remove('disabled');
        }
    });
    
    // Configurar input manual y botones
    valorHoraManualInput.disabled = false;
    usarValorManualBtn.disabled = !(valorHoraManualInput.value && parseFloat(valorHoraManualInput.value) > 0);
    
    // Mostrar/ocultar botón cancelar
    if (cancelarValorManualBtn) {
        cancelarValorManualBtn.style.display = activar ? 'inline-block' : 'none';
    }
    
    if (!activar) {
        valorHoraManualInput.value = '';
        document.getElementById('categoria').value = '';
        document.getElementById('mes').value = '';
    }
    
    actualizarValorHoraMostrar();
    calcularTotal();
}

/**
 * Función principal de cálculo de total
 * Calcula el salario total basado en todos los parámetros ingresados
 */
function calcularTotal() {
    // Obtener todos los valores de entrada
    const datos = obtenerValoresEntrada();

    // Validar que hay valor hora
    if (datos.valorHora <= 0) {
        document.getElementById('resultado-hora').innerHTML = 'Selecciona categoría y mes, o ingresa un valor hora manual';
        document.getElementById('desglose-hora').innerHTML = '';
        return;
    }

    // Variables para el cálculo
    let total = 0;
    let desglose = [];
    const mesSeleccionado = document.getElementById('mes').value;
    const valorAntiguedad = obtenerValorAntiguedad(datos.antiguedadAnios, mesSeleccionado);

    // Calcular horas normales
    let montoNormales = 0;
    if (datos.horasNormales > 0) {
        montoNormales = datos.horasNormales * datos.valorHora;
        desglose.push(`<div class="desglose-item">Normales: ${datos.horasNormales}h × $${formatearNumero(datos.valorHora)} = <b>$${formatearNumero(montoNormales)}</b></div>`);
        total += montoNormales;
    }

    // Calcular horas nocturnas
    let montoNocturnas = 0;
    if (datos.horasNocturnas > 0) {
        montoNocturnas = datos.horasNocturnas * (datos.valorHora * 1.3);
        desglose.push(`<div class="desglose-item">Nocturnas: ${datos.horasNocturnas}h × $${formatearNumero(datos.valorHora * 1.3)} = <b>$${formatearNumero(montoNocturnas)}</b></div>`);
        total += montoNocturnas;
    }

    // Calcular antigüedad sobre horas normales y nocturnas
    const totalHorasBasicas = datos.horasNormales + datos.horasNocturnas;
    if (totalHorasBasicas > 0 && valorAntiguedad > 0) {
        const montoAntiguedad = totalHorasBasicas * valorAntiguedad;
        desglose.push(`<div class="desglose-item">Antigüedad: ${totalHorasBasicas}h × $${formatearNumero(valorAntiguedad)} = <b>$${formatearNumero(montoAntiguedad)}</b></div>`);
        total += montoAntiguedad;
    }

    // Calcular adicional sobre básico
    const sumaBase = montoNormales + montoNocturnas;
    if (datos.adicionalPorcentaje > 0 && sumaBase > 0) {
        const adicionalBasico = sumaBase * (datos.adicionalPorcentaje / 100);
        desglose.push(`<div class="desglose-item">Adicional sobre básico (${datos.adicionalPorcentaje}%) <span class="aprox-icon" title="Valor aproximado">~</span>: <b>$${formatearNumero(adicionalBasico)}</b></div>`);
        total += adicionalBasico;
    }

    // Calcular horas 100% (sábado)
    if (datos.horasSabado > 0) {
        const monto = calcularHorasSabado(datos.horasSabado, datos.valorHora, valorAntiguedad);
        desglose.push(`<div class="desglose-item">Horas 100% (sábado): ${datos.horasSabado}h × [($${formatearNumero(datos.valorHora + valorAntiguedad)} + 20%) × 2] = <b>$${formatearNumero(monto)}</b></div>`);
        total += monto;
    }

    // Calcular horas nocturnas 50%
    if (datos.horasNocturnas50 > 0) {
        const monto = calcularHorasNocturnasExtras(datos.horasNocturnas50, datos.valorHora, valorAntiguedad, 1.5);
        desglose.push(`<div class="desglose-item">Nocturnas 50% <span class="aprox-icon" title="Valor aproximado">~</span>: ${datos.horasNocturnas50}h × [Base + 20.45% + 50%] = <b>$${formatearNumero(monto)}</b></div>`);
        total += monto;
    }

    // Calcular horas nocturnas 100%
    if (datos.horasNocturnas100 > 0) {
        const monto = calcularHorasNocturnasExtras(datos.horasNocturnas100, datos.valorHora, valorAntiguedad, 2);
        desglose.push(`<div class="desglose-item">Nocturnas 100% <span class="aprox-icon" title="Valor aproximado">~</span>: ${datos.horasNocturnas100}h × [Base + 20.45% + 100%] = <b>$${formatearNumero(monto)}</b></div>`);
        total += monto;
    }

    // Calcular horas de feriado
    if (datos.horasFeriado > 0) {
        const valorHoraFeriado = (datos.valorHora + valorAntiguedad) * 1.2;
        const montoFeriado = datos.horasFeriado * valorHoraFeriado;
        desglose.push(`<div class="desglose-item">Horas Feriado: ${datos.horasFeriado}h × $${formatearNumero(valorHoraFeriado)} = <b>$${formatearNumero(montoFeriado)}</b></div>`);
        total += montoFeriado;
    }

    // Calcular horas al 50%
    if (datos.horas50 > 0) {
        const monto = datos.horas50 * datos.valorHora * 1.5;
        desglose.push(`<div class="desglose-item">Horas 50%: ${datos.horas50}h × $${formatearNumero(datos.valorHora)} × 1.5 = <b>$${formatearNumero(monto)}</b></div>`);
        total += monto;
    }

    // Calcular presentismo
    if (datos.presentismo > 0) {
        const montoPresentismo = total * datos.presentismo;
        desglose.push(`<div class="desglose-item presentismo-item">Presentismo (${(datos.presentismo*100).toFixed(0)}%): <b>$${formatearNumero(montoPresentismo)}</b></div>`);
        total += montoPresentismo;
    }

    // Calcular total a cobrar (total sin retenciones menos 20%)
    const totalACobrar = total * 0.8;
    
    // Obtener valor del bono
    const bono = parseFloat(document.getElementById('bono').value) || 0;
    const totalConBono = totalACobrar + bono;
    
    // Mostrar resultados
    document.getElementById('desglose-hora').innerHTML = desglose.length ? desglose.join('') : '';
    
    let resultadoHTML = `
        Total sin retenciones: <b>$${total.toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</b><br>
        Total a cobrar: <b>$${totalACobrar.toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</b>
    `;
    
    if (bono > 0) {
        resultadoHTML += `<br>Total con bono: <b>$${totalConBono.toLocaleString('es-AR', {minimumFractionDigits:2, maximumFractionDigits:2})}</b>`;
    }
    
    document.getElementById('resultado-hora').innerHTML = resultadoHTML;
}

// =================================================================
// FUNCIONES DE INTERFAZ
// =================================================================

/**
 * Configura los event listeners para los botones de selección
 */
function configurarEventListeners() {
    // Función genérica para manejar botones de selección
    const configurarBotones = (selector, inputId, callback = null) => {
        const botones = document.querySelectorAll(selector);
        botones.forEach(btn => {
            btn.addEventListener('click', function() {
                if (usandoValorManual && (selector.includes('categoria') || selector.includes('mes'))) {
                    setModoManual(false);
                }
                
                const input = document.getElementById(inputId);
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    input.value = '';
                } else {
                    botones.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    input.value = btn.getAttribute('data-value');
                }
                
                actualizarValorHoraMostrar();
                if (callback) callback();
                calcularTotal();
                saveConfiguration();
            });
        });
    };

    // Configurar todos los tipos de botones
    configurarBotones('.categoria-btn', 'categoria');
    configurarBotones('.mes-btn', 'mes', mostrarTablaAntiguedad);
    configurarBotones('.antiguedad-btn', 'antiguedad', mostrarMontoAntiguedad);
    configurarBotones('.presentismo-btn', 'presentismo');
    configurarBotones('.bono-btn', 'bono');



    // Valor hora manual
    if (usarValorManualBtn && valorHoraManualInput) {
        usarValorManualBtn.addEventListener('click', () => {
            if (valorHoraManualInput.value && parseFloat(valorHoraManualInput.value) > 0) {
                setModoManual(true);
                mostrarMensajeValorManual();
            } else {
                valorHoraManualInput.focus();
                valorHoraManualInput.style.background = '#ffe0e0';
                setTimeout(() => valorHoraManualInput.style.background = '#fff', 800);
            }
        });

        valorHoraManualInput.addEventListener('input', () => {
            usarValorManualBtn.disabled = !(valorHoraManualInput.value && parseFloat(valorHoraManualInput.value) > 0);
            if (usandoValorManual) {
                actualizarValorHoraMostrar();
                calcularTotal();
            }
        });
    }
    
    // Botón cancelar valor manual
    if (cancelarValorManualBtn) {
        cancelarValorManualBtn.addEventListener('click', () => {
            setModoManual(false);
        });
    }

    // Inputs numéricos - recalcular automáticamente
    const inputsNumericos = [
        'horas-normales', 'horas-sabado', 'horas-nocturnas',
        'horas-50', 'horas-nocturnas-50', 'horas-nocturnas-100', 
        'horas-feriado', 'adicional-basico'
    ];
    
    inputsNumericos.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                calcularTotal();
                saveConfiguration();
            });
        }
    });
}

/**
 * Muestra la tabla de valores de antigüedad
 */
function mostrarTablaAntiguedad() {
    const container = document.getElementById('tabla-antiguedad');
    
    if (!container) return;
    
    let html = '<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;box-shadow:0 1px 6px #1976d222;margin-top:8px;">';
    html += '<tr style="background:#e3eaf3;color:#1976d2;font-weight:bold;"><td style="padding:6px 8px;">Años</td><td style="padding:6px 8px;">Valor Hora Antigüedad</td></tr>';
    
    Object.keys(valoresAntiguedad).forEach(anos => {
        html += `<tr><td style='padding:4px 8px;text-align:center;'>${anos}</td><td style='padding:4px 8px;text-align:center;'>$${valoresAntiguedad[anos]}</td></tr>`;
    });
    
    html += '</table>';
    container.innerHTML = html;
}

/**
 * Muestra el monto de antigüedad calculado
 */
function mostrarMontoAntiguedad() {
    const antig = parseFloat(document.getElementById('antiguedad').value) || 0;
    const mesSeleccionado = document.getElementById('mes').value;
    const valorAntiguedad = obtenerValorAntiguedad(antig, mesSeleccionado);
    
    const container = document.getElementById('tabla-antiguedad');
    if (container && mesSeleccionado) {
        container.innerHTML = `<div style='font-size:1.15em;color:#1976d2;font-weight:500;text-align:center;padding:8px;background:#f8f9fa;border-radius:8px;margin-top:8px;'>Valor Antigüedad por Hora (${mesSeleccionado}): <span style='color:#1976d2;font-weight:bold;'>$${valorAntiguedad.toFixed(2)}</span><br><small style='color:#666;'>Se multiplica por total de horas normales + nocturnas</small></div>`;
    }
}

// =================================================================
// INICIALIZACIÓN
// =================================================================

/**
 * Inicializa la aplicación cuando se carga el DOM
 */
function inicializar() {
    // Cargar configuración guardada
    loadSavedConfiguration();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Configurar estado inicial si no hay guardado
    if (!localStorage.getItem('salaryCalcConfig')) {
        document.getElementById('categoria').value = '';
        document.getElementById('mes').value = '';
    }
    
    // Activar primer botón de antigüedad por defecto
    const primerAntiguedadBtn = document.querySelector('.antiguedad-btn');
    if (primerAntiguedadBtn) {
        primerAntiguedadBtn.classList.add('active');
    }
    
    // Activar primer botón de presentismo por defecto
    const primerPresentismoBtn = document.querySelector('.presentismo-btn');
    if (primerPresentismoBtn) {
        primerPresentismoBtn.classList.add('active');
    }
    
    // Activar primer botón de bono por defecto
    const primerBonoBtn = document.querySelector('.bono-btn');
    if (primerBonoBtn) {
        primerBonoBtn.classList.add('active');
    }
    
    // Configurar modo inicial
    setModoManual(false);
    actualizarValorHoraMostrar();
    calcularTotal();
    
    // Configurar tooltips como modales
    document.querySelectorAll('.tooltip-trigger').forEach(trigger => {
        const tooltip = trigger.querySelector('.tooltip');
        
        if (tooltip) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                mostrarModal(tooltip.innerHTML);
            });
        }
    });
    
    console.log('Script de cálculo por horas inicializado correctamente');
}

// Guardar configuración en localStorage
function saveConfiguration() {
    const config = {
        categoria: document.getElementById('categoria').value,
        mes: document.getElementById('mes').value,
        antiguedad: document.getElementById('antiguedad').value,
        adicionalBasico: document.getElementById('adicional-basico').value,
        presentismo: document.getElementById('presentismo').value,
        bono: document.getElementById('bono').value
    };
    localStorage.setItem('salaryCalcConfig', JSON.stringify(config));
}

// Cargar configuración guardada
function loadSavedConfiguration() {
    const saved = localStorage.getItem('salaryCalcConfig');
    if (saved) {
        const config = JSON.parse(saved);
        
        // Restaurar categoría
        if (config.categoria) {
            document.getElementById('categoria').value = config.categoria;
            document.querySelector(`[data-value="${config.categoria}"]`)?.classList.add('active');
        }
        
        // Restaurar mes
        if (config.mes) {
            document.getElementById('mes').value = config.mes;
            document.querySelector(`[data-value="${config.mes}"]`)?.classList.add('active');
        }
        
        // Restaurar antigüedad
        if (config.antiguedad) {
            document.getElementById('antiguedad').value = config.antiguedad;
            document.querySelector(`[data-value="${config.antiguedad}"]`)?.classList.add('active');
        }
        
        // Restaurar adicional básico
        if (config.adicionalBasico) {
            document.getElementById('adicional-basico').value = config.adicionalBasico;
        }
        
        // Restaurar presentismo
        if (config.presentismo) {
            document.getElementById('presentismo').value = config.presentismo;
            document.querySelector(`[data-value="${config.presentismo}"]`)?.classList.add('active');
        }
        
        // Restaurar bono
        if (config.bono) {
            document.getElementById('bono').value = config.bono;
            document.querySelector(`[data-value="${config.bono}"]`)?.classList.add('active');
        }
        
        actualizarValorHoraMostrar();
        mostrarTablaAntiguedad();
        mostrarMontoAntiguedad();
        calcularTotal();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    inicializar();
    loadFromURL();
});

// Cargar datos desde URL (para integración con analizador de recibos)
function loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('categoria')) {
        const categoria = urlParams.get('categoria');
        document.getElementById('categoria').value = categoria;
        document.querySelector(`[data-value="${categoria}"]`)?.classList.add('active');
    }
    
    if (urlParams.has('valorHora')) {
        const valorHora = urlParams.get('valorHora');
        valorHoraManualInput.value = valorHora;
        setModoManual(true);
    }
    
    if (urlParams.has('antiguedad')) {
        const antiguedad = urlParams.get('antiguedad');
        document.getElementById('antiguedad').value = antiguedad;
        document.querySelector(`[data-value="${antiguedad}"]`)?.classList.add('active');
    }
    
    if (urlParams.has('adicional')) {
        const adicional = urlParams.get('adicional');
        document.getElementById('adicional-basico').value = adicional;
    }
    
    // Actualizar cálculos si se cargaron datos
    if (urlParams.size > 0) {
        actualizarValorHoraMostrar();
        mostrarTablaAntiguedad();
        mostrarMontoAntiguedad();
        calcularTotal();
        showNotification('Datos cargados desde el analizador de recibos', 'success');
    }
}

// Variable para rastrear posición del cursor
let mousePos = { x: 0, y: 0 };
document.addEventListener('mousemove', (e) => {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };
    
    // Posicionar cerca del cursor
    let left = mousePos.x + 15;
    let top = mousePos.y - 10;
    
    if (left + 300 > window.innerWidth) left = mousePos.x - 315;
    if (top < 0) top = mousePos.y + 20;
    
    notification.style.cssText = `
        position: fixed; left: ${left}px; top: ${top}px; z-index: 10000;
        background: ${colors[type]}; color: white; padding: 12px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 500; max-width: 300px; pointer-events: none;
        opacity: 0; transform: scale(0.8); transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'scale(1)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'scale(0.8)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// =================================================================
// FUNCIONES DE UTILIDAD
// =================================================================

/**
 * Formatea un número como moneda argentina
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
function formatearMoneda(amount) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Valida que un valor sea un número positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es válido
 */
function esNumeroPositivo(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Formatea un número para mostrar con separadores de miles
 * @param {number} numero - Número a formatear
 * @returns {string} Número formateado
 */
function formatearNumero(numero) {
    return numero.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

/**
 * Muestra un modal centrado con el contenido especificado
 * @param {string} contenido - HTML del contenido a mostrar
 */
function mostrarModal(contenido) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 100000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Crear modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #fffde7;
        border: 2px solid #ffe082;
        border-radius: 12px;
        padding: 20px;
        max-width: 400px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        position: relative;
    `;
    
    // Botón cerrar
    const btnCerrar = document.createElement('button');
    btnCerrar.innerHTML = '×';
    btnCerrar.style.cssText = `
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    `;
    
    // Agregar contenido
    modal.innerHTML = contenido;
    modal.appendChild(btnCerrar);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Cerrar modal
    const cerrarModal = () => {
        document.body.removeChild(overlay);
    };
    
    btnCerrar.addEventListener('click', cerrarModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) cerrarModal();
    });
    
    // Cerrar con ESC
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}