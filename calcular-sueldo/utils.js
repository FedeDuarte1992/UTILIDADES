/**
 * =================================================================
 * UTILIDADES COMUNES
 * =================================================================
 * 
 * Este archivo contiene funciones de utilidad que son compartidas
 * entre diferentes módulos del sistema.
 * 
 * Funcionalidades:
 * - Formateo de moneda
 * - Validaciones
 * - Manipulación de fechas
 * - Funciones matemáticas
 * - Helpers de DOM
 */

// =================================================================
// FORMATEO Y VALIDACIONES
// =================================================================

/**
 * Formatea un número como moneda argentina
 * @param {number} amount - Cantidad a formatear
 * @param {boolean} showDecimals - Si mostrar decimales (default: true)
 * @returns {string} Cantidad formateada
 */
function formatCurrency(amount, showDecimals = true) {
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '$0';
    }
    
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: showDecimals ? 2 : 0,
        maximumFractionDigits: showDecimals ? 2 : 0
    }).format(amount);
}

/**
 * Valida que un valor sea un número positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es válido
 */
function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Valida que un valor sea un número entero positivo
 * @param {any} value - Valor a validar
 * @returns {boolean} True si es válido
 */
function isPositiveInteger(value) {
    const num = parseInt(value);
    return !isNaN(num) && num >= 0 && Number.isInteger(num);
}

/**
 * Convierte un valor a número, retornando 0 si no es válido
 * @param {any} value - Valor a convertir
 * @returns {number} Número convertido
 */
function toNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

// =================================================================
// MANIPULACIÓN DE FECHAS
// =================================================================

/**
 * Genera una clave de fecha en formato YYYY-MM-DD
 * @param {Date} date - Fecha a convertir
 * @returns {string} Clave de fecha
 */
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Convierte una clave de fecha a objeto Date
 * @param {string} dateKey - Clave en formato YYYY-MM-DD
 * @returns {Date} Objeto Date
 */
function dateKeyToDate(dateKey) {
    const [year, month, day] = dateKey.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formatea una fecha para mostrar en español
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDate(date) {
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Formatea una hora para mostrar en formato HH:MM
 * @param {Date} date - Fecha con hora a formatear
 * @returns {string} Hora formateada
 */
function formatTime(date) {
    return date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
    }).substring(0, 5);
}

// =================================================================
// HELPERS DE DOM
// =================================================================

/**
 * Selecciona un elemento del DOM de forma segura
 * @param {string} selector - Selector CSS
 * @returns {Element|null} Elemento encontrado o null
 */
function $(selector) {
    return document.querySelector(selector);
}

/**
 * Selecciona múltiples elementos del DOM
 * @param {string} selector - Selector CSS
 * @returns {NodeList} Lista de elementos
 */
function $$(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Agrega una clase a un elemento de forma segura
 * @param {Element} element - Elemento DOM
 * @param {string} className - Nombre de la clase
 */
function addClass(element, className) {
    if (element && element.classList) {
        element.classList.add(className);
    }
}

/**
 * Remueve una clase de un elemento de forma segura
 * @param {Element} element - Elemento DOM
 * @param {string} className - Nombre de la clase
 */
function removeClass(element, className) {
    if (element && element.classList) {
        element.classList.remove(className);
    }
}

/**
 * Alterna una clase en un elemento de forma segura
 * @param {Element} element - Elemento DOM
 * @param {string} className - Nombre de la clase
 */
function toggleClass(element, className) {
    if (element && element.classList) {
        element.classList.toggle(className);
    }
}

/**
 * Establece el contenido de texto de un elemento de forma segura
 * @param {Element} element - Elemento DOM
 * @param {string} text - Texto a establecer
 */
function setText(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Establece el contenido HTML de un elemento de forma segura
 * @param {Element} element - Elemento DOM
 * @param {string} html - HTML a establecer
 */
function setHTML(element, html) {
    if (element) {
        element.innerHTML = html;
    }
}

// =================================================================
// FUNCIONES MATEMÁTICAS
// =================================================================

/**
 * Redondea un número a una cantidad específica de decimales
 * @param {number} num - Número a redondear
 * @param {number} decimals - Cantidad de decimales (default: 2)
 * @returns {number} Número redondeado
 */
function roundTo(num, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * Calcula un porcentaje de un valor
 * @param {number} value - Valor base
 * @param {number} percentage - Porcentaje a calcular
 * @returns {number} Resultado del cálculo
 */
function calculatePercentage(value, percentage) {
    return (value * percentage) / 100;
}

/**
 * Suma una lista de números de forma segura
 * @param {...number} numbers - Números a sumar
 * @returns {number} Suma total
 */
function safeSum(...numbers) {
    return numbers.reduce((sum, num) => sum + toNumber(num), 0);
}

// =================================================================
// ALMACENAMIENTO LOCAL
// =================================================================

/**
 * Guarda datos en localStorage de forma segura
 * @param {string} key - Clave de almacenamiento
 * @param {any} data - Datos a guardar
 * @returns {boolean} True si se guardó correctamente
 */
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return false;
    }
}

/**
 * Carga datos desde localStorage de forma segura
 * @param {string} key - Clave de almacenamiento
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} Datos cargados o valor por defecto
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Error cargando desde localStorage:', error);
        return defaultValue;
    }
}

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error eliminando de localStorage:', error);
        return false;
    }
}

// =================================================================
// NOTIFICACIONES Y MENSAJES
// =================================================================

/**
 * Muestra un mensaje de éxito
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 3000)
 */
function showSuccess(message, duration = 3000) {
    showNotification(message, 'success', duration);
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 5000)
 */
function showError(message, duration = 5000) {
    showNotification(message, 'error', duration);
}

/**
 * Muestra un mensaje de información
 * @param {string} message - Mensaje a mostrar
 * @param {number} duration - Duración en ms (default: 3000)
 */
function showInfo(message, duration = 3000) {
    showNotification(message, 'info', duration);
}

// Variable global para rastrear la posición del cursor
let lastCursorPosition = { x: 0, y: 0 };

// Rastrear posición del cursor
document.addEventListener('mousemove', (e) => {
    lastCursorPosition.x = e.clientX;
    lastCursorPosition.y = e.clientY;
});

/**
 * Función base para mostrar notificaciones
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, info)
 * @param {number} duration - Duración en ms
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Calcular posición cerca del cursor
    const offsetX = 15; // Desplazamiento horizontal desde el cursor
    const offsetY = -10; // Desplazamiento vertical desde el cursor
    
    let left = lastCursorPosition.x + offsetX;
    let top = lastCursorPosition.y + offsetY;
    
    // Ajustar si se sale de la pantalla
    const maxWidth = 300;
    if (left + maxWidth > window.innerWidth) {
        left = lastCursorPosition.x - maxWidth - offsetX;
    }
    if (top < 0) {
        top = lastCursorPosition.y + 20;
    }
    
    // Estilos inline para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        left: left + 'px',
        top: top + 'px',
        padding: '12px 20px',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: '500',
        zIndex: '10000',
        opacity: '0',
        transform: 'scale(0.8)',
        transition: 'all 0.3s ease',
        maxWidth: maxWidth + 'px',
        wordWrap: 'break-word',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
    });
    
    // Colores según el tipo
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'scale(1)';
    }, 10);
    
    // Ocultar después del tiempo especificado
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// =================================================================
// DEBUGGING Y LOGGING
// =================================================================

/**
 * Log de debug que solo se muestra en desarrollo
 * @param {...any} args - Argumentos a loggear
 */
function debugLog(...args) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[DEBUG]', ...args);
    }
}

/**
 * Log de error que siempre se muestra
 * @param {...any} args - Argumentos a loggear
 */
function errorLog(...args) {
    console.error('[ERROR]', ...args);
}

/**
 * Log de información
 * @param {...any} args - Argumentos a loggear
 */
function infoLog(...args) {
    console.info('[INFO]', ...args);
}

// =================================================================
// EXPORTAR FUNCIONES (si se usa como módulo)
// =================================================================

// Si el entorno soporta módulos ES6, exportar las funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatCurrency,
        isPositiveNumber,
        isPositiveInteger,
        toNumber,
        getDateKey,
        dateKeyToDate,
        formatDate,
        formatTime,
        $,
        $$,
        addClass,
        removeClass,
        toggleClass,
        setText,
        setHTML,
        roundTo,
        calculatePercentage,
        safeSum,
        saveToStorage,
        loadFromStorage,
        removeFromStorage,
        showSuccess,
        showError,
        showInfo,
        debugLog,
        errorLog,
        infoLog
    };
}

// Log de inicialización
debugLog('Utilidades comunes cargadas correctamente');