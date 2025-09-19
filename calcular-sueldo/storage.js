// Funciones de almacenamiento
const STORAGE_KEY = 'recibos_analizados';

function guardarDatosRecibo(datos) {
    // Obtener datos existentes
    let recibosGuardados = obtenerTodosLosRecibos();
    
    // Agregar nuevo recibo con timestamp
    const reciboConMeta = {
        ...datos,
        fechaAnalisis: new Date().toISOString(),
        id: Date.now().toString()
    };
    
    recibosGuardados.push(reciboConMeta);
    
    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recibosGuardados));
    return reciboConMeta;
}

function obtenerTodosLosRecibos() {
    const recibosStr = localStorage.getItem(STORAGE_KEY);
    return recibosStr ? JSON.parse(recibosStr) : [];
}

function buscarEnRecibos(criterio) {
    const recibos = obtenerTodosLosRecibos();
    return recibos.filter(recibo => {
        // Buscar en el texto completo
        const textoCompleto = recibo.textoCompleto.toLowerCase();
        const criterioLower = criterio.toLowerCase();
        
        // Búsqueda por período
        if (criterioLower.includes('periodo')) {
            const periodoMatch = textoCompleto.match(/per[ií]odo[:\s]*([^,\n]+)/i);
            return periodoMatch && periodoMatch[1].toLowerCase().includes(criterioLower);
        }
        
        // Búsqueda general en el texto
        return textoCompleto.includes(criterioLower);
    });
}

function extraerValorPorClave(texto, clave) {
    const patrones = {
        'periodo': /per[ií]odo[:\s]*([^,\n]+)/i,
        'legajo': /legajo[:\s]*(\d+)/i,
        'cuil': /c\.?u\.?i\.?l\.?[:\s]*([0-9-]+)/i,
        'categoria': /categor[ií]a[:\s]*([A-Z0-9]+)/i,
        'nombre': /(?:empleado|nombre)[:\s]+([A-ZÁÉÍÓÚ\s,]+)/i
    };

    const patron = patrones[clave.toLowerCase()];
    if (!patron) return null;

    const match = texto.match(patron);
    return match ? match[1].trim() : null;
}

// Función para mostrar resultados de búsqueda
function mostrarResultadosBusqueda(resultados) {
    const container = document.getElementById('search-results') || crearContenedorBusqueda();
    container.innerHTML = '';

    if (resultados.length === 0) {
        container.innerHTML = '<p>No se encontraron resultados</p>';
        return;
    }

    resultados.forEach(recibo => {
        const reciboDiv = document.createElement('div');
        reciboDiv.className = 'receipt-result';
        reciboDiv.innerHTML = `
            <div class="receipt-summary">
                <h4>Recibo ${new Date(recibo.fechaAnalisis).toLocaleDateString()}</h4>
                <div class="receipt-details">
                    <p><strong>Período:</strong> ${recibo.empleado.periodo || 'No especificado'}</p>
                    <p><strong>Empleado:</strong> ${recibo.empleado.nombre || 'No especificado'}</p>
                    <p><strong>Legajo:</strong> ${recibo.empleado.legajo || 'No especificado'}</p>
                    <p><strong>CUIL:</strong> ${recibo.empleado.cuil || 'No especificado'}</p>
                </div>
                <div class="receipt-totals">
                    <p><strong>Total Haberes:</strong> ${formatearMoneda(recibo.totales.haberes)}</p>
                    <p><strong>Total Descuentos:</strong> ${formatearMoneda(recibo.totales.descuentos)}</p>
                    <p><strong>Neto:</strong> ${formatearMoneda(recibo.totales.neto)}</p>
                </div>
            </div>
        `;
        container.appendChild(reciboDiv);
    });
}

function crearContenedorBusqueda() {
    const container = document.createElement('div');
    container.id = 'search-results';
    container.className = 'search-results-container';
    document.querySelector('.container').appendChild(container);
    return container;
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(valor);
}

// Crear campo de búsqueda
function crearBuscador() {
    const buscadorDiv = document.createElement('div');
    buscadorDiv.className = 'search-box';
    buscadorDiv.innerHTML = `
        <input type="text" id="search-input" placeholder="Buscar en recibos...">
        <select id="search-type">
            <option value="periodo">Período</option>
            <option value="legajo">Legajo</option>
            <option value="cuil">CUIL</option>
            <option value="categoria">Categoría</option>
            <option value="nombre">Nombre</option>
        </select>
        <button id="search-button">Buscar</button>
    `;
    
    document.querySelector('.step-box').insertBefore(buscadorDiv, document.getElementById('results'));
    
    // Eventos del buscador
    document.getElementById('search-button').addEventListener('click', realizarBusqueda);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') realizarBusqueda();
    });
}

function realizarBusqueda() {
    const tipoBusqueda = document.getElementById('search-type').value;
    const textoBusqueda = document.getElementById('search-input').value.trim();
    
    if (!textoBusqueda) return;
    
    const recibos = obtenerTodosLosRecibos();
    const resultados = recibos.filter(recibo => {
        const valor = extraerValorPorClave(recibo.textoCompleto, tipoBusqueda);
        return valor && valor.toLowerCase().includes(textoBusqueda.toLowerCase());
    });
    
    mostrarResultadosBusqueda(resultados);
}
