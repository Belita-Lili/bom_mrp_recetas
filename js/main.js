// Datos globales
let datosDespensa = {};

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
  cargarDatosIniciales();
  inicializarGraficos();
  inicializarEventListeners();
});

// Cargar datos iniciales desde JSON
function cargarDatosIniciales() {
  fetch('data/datos_despensa.json')
    .then(response => response.json())
    .then(data => {
      datosDespensa = data;
      actualizarVistaCompleta();
    })
    .catch(error => {
      console.error('Error cargando datos:', error);
      // Datos de ejemplo si falla la carga
      datosDespensa = {
        recetas: [],
        inventario: [],
        lista_compras: [],
        calendario_comidas: [],
        ingredientes_base: []
      };
    });
}

// Actualizar toda la vista
function actualizarVistaCompleta() {
  actualizarKPIs();
  cargarRecetas();
  cargarListaCompras();
  cargarCalendario();
  actualizarGraficos();
}

// Inicializar event listeners
function inicializarEventListeners() {
  // Filtros
  document.getElementById('filtroDia').addEventListener('change', filtrarRecetas);
  document.getElementById('filtroCategoria').addEventListener('change', filtrarRecetas);
  document.getElementById('filtroDificultad').addEventListener('change', filtrarRecetas);
  
  // Tabs
  const tabEls = document.querySelectorAll('button[data-bs-toggle="tab"]');
  tabEls.forEach(tabEl => {
    tabEl.addEventListener('shown.bs.tab', function (event) {
      if (event.target.id === 'compras-tab') {
        actualizarGraficoCostos();
      }
    });
  });
}

// Actualizar KPIs
function actualizarKPIs() {
  document.getElementById('kpi-recetas').textContent = datosDespensa.recetas.length;
  document.getElementById('kpi-ingredientes').textContent = datosDespensa.ingredientes_base.length;
  
  const itemsComprar = datosDespensa.lista_compras.filter(item => item.comprar > 0).length;
  document.getElementById('kpi-compras').textContent = itemsComprar;
  
  // Prioridad alta
  const prioridadAlta = datosDespensa.lista_compras.filter(item => item.prioridad === 'Alta').length;
  document.getElementById('kpi-compras-prioridad').textContent = `Prioridad alta: ${prioridadAlta}`;
  
  // Inventario
  const totalIngredientes = datosDespensa.ingredientes_base.length;
  const enInventario = datosDespensa.inventario.filter(item => item.stock_actual > 0).length;
  const porcentaje = Math.round((enInventario / totalIngredientes) * 100);
  document.getElementById('kpi-inventario').textContent = `${porcentaje}%`;
  
  // Trend (simulado)
  const trend = porcentaje > 50 ? '+5% vs semana pasada' : '-10% vs semana pasada';
  document.getElementById('kpi-inventario-trend').textContent = trend;
  
  // Progress bars
  document.getElementById('progress-stock').style.width = `${porcentaje}%`;
  document.getElementById('progress-needed').style.width = `${100 - porcentaje}%`;
}

// Inicializar gráficos
function inicializarGraficos() {
  window.graficoCategorias = new Chart(
    document.getElementById('graficoCategorias'),
    { type: 'doughnut' }
  );
  
  window.graficoCostos = new Chart(
    document.getElementById('graficoCostos'),
    { type: 'bar' }
  );
}

// Actualizar gráficos con datos
function actualizarGraficos() {
  actualizarGraficoCategorias();
  actualizarGraficoCostos();
}

// Función para exportar a PDF
function generarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Lista de Compras - Despensa Semanal', 15, 20);
  
  // Fecha
  doc.setFontSize(12);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 15, 30);
  
  // Encabezados de tabla
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Ingrediente', 15, 45);
  doc.text('Cantidad', 80, 45);
  doc.text('Prioridad', 120, 45);
  doc.text('Proveedor', 150, 45);
  
  // Datos
  doc.setFont(undefined, 'normal');
  let y = 55;
  datosDespensa.lista_compras.forEach(item => {
    doc.text(item.ingrediente, 15, y);
    doc.text(`${item.comprar} ${item.unidad}`, 80, y);
    doc.text(item.prioridad, 120, y);
    doc.text(item.proveedor, 150, y);
    y += 10;
    
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });
  
  // Total
  const total = datosDespensa.lista_compras.reduce((sum, item) => sum + item.precio_estimado, 0);
  doc.setFont(undefined, 'bold');
  doc.text(`Total estimado: $${total.toFixed(2)}`, 15, y + 10);
  
  doc.save('lista_compras_despensa.pdf');
}