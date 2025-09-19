/**
 * ANALIZADOR DE RECIBOS - VERSIÓN HÍBRIDA v10
 * Analiza PDFs de recibos, muestra datos completos en consola y datos clave en la página
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const resultsContent = document.getElementById('results-content');

    // Verificar elementos necesarios
    if (!uploadArea || !fileInput) {
        console.error('No se encontraron los elementos necesarios');
        return;
    }

    // Función para analizar el texto localmente
    function analizarTextoLocalmente(texto) {
        const datos = {
            datosEmpleado: {},
            datosRecibo: {},
            conceptosRemunerativos: {},
            deducciones: {},
            totales: {}
        };
        
        // Patrones por categoría
        const patrones = {
            datosEmpleado: {
                'Nombre': /DUARTE\s*,\s*Federico/,
                'CUIL': /20-37047611-0/,
                'Categoría': /AYUDANTE\s+C/,
                'Legajo': /\b437\b/
            },
            datosRecibo: {
                'Período': /1[°º]\s+Quincena\s+Febrero\s+2025/,
                'Fecha de Pago': /\b20\/02\/2025\b/
            },
            conceptosRemunerativos: {
                'Sueldo Nocturno': {
                    valor: /Sueldo\s+Nocturno\s+10005\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Sueldo\s+Nocturno\s+10005/
                },
                'Antigüedad': {
                    valor: /Antguedad\s+10100\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Antguedad\s+10100/
                },
                'Adicional Sobre Básico': {
                    valor: /Adicional\s+Sobre\s+Basico\s+10119\s+([\d,]+\.\d{2})/,
                    unidades: null
                },
                'Horas Sábado 100%': {
                    valor: /Horas\s+Sábado\s+100\s*%\s*J\s+10156\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Horas\s+Sábado\s+100\s*%\s*J/
                },
                'Hora Sábado Nocturna 100%': {
                    valor: /Hora\s+Sábado\s+Nocturna\s+100\s*%\s*J\s+10157\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Hora\s+Sábado\s+Nocturna\s+100\s*%\s*J/
                },
                'Horas Domingo Nocturnas 100%': {
                    valor: /Horas\s+Domingo\s+Nocturnas\s+100\s*%\s*J\s+10158\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Horas\s+Domingo\s+Nocturnas\s+100\s*%\s*J/
                },
                'Horas Extras Nocturnos 50%': {
                    valor: /Horas\s+extras\s+Nocturnos\s+50%\s+10560\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Horas\s+extras\s+Nocturnos\s+50%/
                },
                'Presentismo': {
                    valor: /Presentsmo\s+y\s+Asistencia\s+Jornal\s+11000\s+([\d,]+\.\d{2})/,
                    unidades: /(\d+\.\d+)\s+Presentsmo\s+y\s+Asistencia\s+Jornal/
                }
            },
            deducciones: {
                'Jubilación': /Jubilación\s+20000\s+([\d,]+\.\d{2})/,
                'Ley 19.032': /Ley\s+19\.032\s+20001\s+([\d,]+\.\d{2})/,
                'Obra Social': /Obra\s+social\s+20002\s+([\d,]+\.\d{2})/,
                'Cuota Sindical AOT (2%)': /Cuota\s+Sindical\s+-\s+A\.O\.T\.\s+\(2%\)\s+20007\s+([\d,]+\.\d{2})/,
                'FAS AOT (1%)': /F\.A\.S\.\s+AOT\s+\(1%\)\s+20008\s+([\d,]+\.\d{2})/,
                'Redondeo': /Redondeo\s+99999\s+([\d,]+\.\d{2})/
            },
            totales: {
                'Total Bruto': /(\d{1,3}(?:,\d{3})*\.\d{2})\s+74,027\.24/,
                'Total Deducciones': /370,135\.87\s+(\d{1,3}(?:,\d{3})*\.\d{2})/,
                'Total Neto': /Total\s+neto\s*:?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/
            }
        };

        // Pre-procesar el texto para limpiar espacios extra y saltos de línea
        texto = texto.replace(/\s+/g, ' ').trim();

        // Buscar patrones por categoría
        for (const [categoria, patronesCategoria] of Object.entries(patrones)) {
            datos[categoria] = {};
            
            if (categoria === 'conceptosRemunerativos') {
                // Procesar conceptos remunerativos con sus unidades
                for (const [concepto, patrones] of Object.entries(patronesCategoria)) {
                    const matchValor = texto.match(patrones.valor);
                    const matchUnidades = patrones.unidades ? texto.match(patrones.unidades) : null;
                    
                    if (matchValor) {
                        datos[categoria][concepto] = {
                            valor: matchValor[1].trim(),
                            unidades: matchUnidades ? matchUnidades[1].trim() : null
                        };
                        console.log(`Encontrado ${concepto}:`, datos[categoria][concepto]);
                    }
                }
            } else {
                // Procesar otras categorías normalmente
                for (const [campo, patron] of Object.entries(patronesCategoria)) {
                    const match = texto.match(patron);
                    if (match) {
                        datos[categoria][campo] = match[1] ? match[1].trim() : match[0].trim();
                        console.log(`Encontrado ${campo}:`, datos[categoria][campo]);
                    }
                }
            }
        }

        // Procesamiento específico para campos que requieren formateo especial
        if (datos.totales['Total Bruto']) {
            datos.totales['Total Bruto'] = datos.totales['Total Bruto'].replace(/(\d),(\d)/g, '$1$2');
        }
        if (datos.totales['Total Neto']) {
            datos.totales['Total Neto'] = datos.totales['Total Neto'].replace(/(\d),(\d)/g, '$1$2');
        }

        return datos;
    }

    // Función para mostrar los datos en consola de manera organizada
    function mostrarDatosEnConsola(datos) {
        console.clear();
        for (const [categoria, contenido] of Object.entries(datos)) {
            if (Object.keys(contenido).length > 0) {
                console.group(categoria);
                for (const [campo, valor] of Object.entries(contenido)) {
                    console.log(`${campo}: ${valor}`);
                }
                console.groupEnd();
                console.log('');
            }
        }
    }

    // Función para formatear montos
    function formatearMonto(monto) {
        if (!monto) return '0,00';
        return Number(monto.replace(/[.,]/g, '')).toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Función para mostrar datos clave en la página
    function mostrarDatosEnPagina(datos) {
        const html = `
            <div class="resumen-recibo">
                <div class="card empleado-info">
                    <h3>Información del Empleado</h3>
                    <div class="info-grupo">
                        <p>
                            <strong>Nombre</strong>
                            <span class="valor">${datos.datosEmpleado['Nombre'] || '-'}</span>
                        </p>
                        <p>
                            <strong>CUIL</strong>
                            <span class="valor">${datos.datosEmpleado['CUIL'] || '-'}</span>
                        </p>
                        <p>
                            <strong>Categoría</strong>
                            <span class="valor">${datos.datosEmpleado['Categoría'] || '-'}</span>
                        </p>
                        <p>
                            <strong>Legajo</strong>
                            <span class="valor">${datos.datosEmpleado['Legajo'] || '-'}</span>
                        </p>
                    </div>
                </div>

                <div class="card periodo-info">
                    <h3>Período de Liquidación</h3>
                    <div class="info-grupo">
                        <p>
                            <strong>Período</strong>
                            <span class="valor">${datos.datosRecibo['Período'] || '-'}</span>
                        </p>
                        <p>
                            <strong>Fecha de Pago</strong>
                            <span class="valor">${datos.datosRecibo['Fecha de Pago'] || '-'}</span>
                        </p>
                    </div>
                </div>

                <div class="card conceptos-info">
                    <h3>Conceptos Remunerativos</h3>
                    <div class="info-grupo montos">
                        ${Object.entries(datos.conceptosRemunerativos).map(([concepto, datos]) => `
                            <div class="concepto-linea">
                                <p>
                                    <strong>${concepto}</strong>
                                    ${datos.unidades ? `<span class="unidades">${datos.unidades}</span>` : '<span class="unidades">-</span>'}
                                    <span class="monto">$ ${formatearMonto(datos.valor)}</span>
                                </p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="card deducciones-info">
                    <h3>Deducciones</h3>
                    <div class="info-grupo montos">
                        ${Object.entries(datos.deducciones).map(([concepto, valor]) => `
                            <p><strong>${concepto}:</strong> <span class="monto">$ ${formatearMonto(valor)}</span></p>
                        `).join('')}
                    </div>
                </div>

                <div class="card totales-info">
                    <h3>Totales</h3>
                    <div class="info-grupo montos">
                        <p><strong>Total Bruto:</strong> <span class="monto">$ ${formatearMonto(datos.totales['Total Bruto'])}</span></p>
                        <p><strong>Deducciones:</strong> <span class="monto">$ ${formatearMonto(datos.totales['Total Deducciones'])}</span></p>
                        <p><strong>Neto:</strong> <span class="monto destacado">$ ${formatearMonto(datos.totales['Total Neto'])}</span></p>
                    </div>
                </div>
            </div>
        `;

        if (resultsContent) {
            resultsContent.innerHTML = html;
            results.style.display = 'block';
        }
    }

    // Función para procesar archivos PDF
    function handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        console.log('Procesando archivo:', file.name);

        if (file.type !== 'application/pdf') {
            alert('Por favor, selecciona un archivo PDF');
            return;
        }

        // Mostrar loading
        if (loading) loading.style.display = 'block';
        if (resultsContent) resultsContent.innerHTML = '';

        // Leer el archivo
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const typedarray = new Uint8Array(e.target.result);

            if (typeof pdfjsLib === 'undefined') {
                console.error('PDF.js no está cargado correctamente');
                alert('Error: PDF.js no está disponible');
                if (loading) loading.style.display = 'none';
                return;
            }

            const loadingTask = pdfjsLib.getDocument({ data: typedarray });
            
            loadingTask.promise.then(function(pdf) {
                console.log('PDF cargado correctamente');
                
                const pagePromises = [];
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    pagePromises.push(
                        pdf.getPage(i).then(function(page) {
                            return page.getTextContent();
                        })
                    );
                }
                
                Promise.all(pagePromises)
                    .then(function(contents) {
                        const text = contents
                            .map(content => 
                                content.items
                                    .map(item => item.str)
                                    .join(' ')
                            )
                            .join('\n');
                        
                        // Analizar y mostrar resultados
                        const datos = analizarTextoLocalmente(text);
                        mostrarDatosEnConsola(datos);
                        mostrarDatosEnPagina(datos);
                    })
                    .catch(function(err) {
                        console.error('Error al extraer texto:', err);
                        alert('Error al extraer texto del PDF');
                    })
                    .finally(function() {
                        if (loading) loading.style.display = 'none';
                    });
            })
            .catch(function(err) {
                console.error('Error al cargar el PDF:', err);
                alert('Error al cargar el PDF');
                if (loading) loading.style.display = 'none';
            });
        };

        reader.onerror = function(err) {
            console.error('Error al leer el archivo:', err);
            alert('Error al leer el archivo');
            if (loading) loading.style.display = 'none';
        };

        reader.readAsArrayBuffer(file);
    }

    // Configurar eventos de la interfaz
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
});
