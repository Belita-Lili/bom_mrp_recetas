// Cargar lista de compras (MRP)
function cargarListaCompras() {
  const tabla = document.querySelector('#tabla-compras tbody');
  tabla.innerHTML = '';
  
  datosDespensa.lista_compras.forEach(item => {
    const prioridadClass = item.prioridad === 'Alta' ? 'bg-danger' : item.prioridad === 'Media' ? 'bg-warning' : 'bg-primary';
    
    const row = `
    <tr class="ingredient-card">
      <td><strong>${item.ingrediente}</strong></td>
      <td>${item.unidad}</td>
      <td>${item.necesidad_total}</td>
      <td>${item.stock_actual}</td>
      <td><span class="badge ${prioridadClass}">${item.comprar}</span></td>
      <td><span class="badge ${prioridadClass}">${item.prioridad}</span></td>
      <td>${item.proveedor}</td>
    </tr>`;
    
    tabla.insertAdjacentHTML('beforeend', row);
  });
  
  // Actualizar lista detallada
  actualizarListaComprasDetalle();
}

// Actualizar lista de compras detallada
function actualizarListaComprasDetalle() {
  const lista = document.getElementById('lista-compras-detalle');
  lista.innerHTML = '';
  
  // Agrupar por proveedor
  const comprasPorProveedor = {};
  datosDespensa.lista_compras.forEach(item => {
    if (!comprasPorProveedor[item.proveedor]) {
      comprasPorProveedor[item.proveedor] = [];
    }
    comprasPorProveedor[item.proveedor].push(item);
  });
  
  // Mostrar por proveedor
  Object.entries(comprasPorProveedor).forEach(([proveedor, items]) => {
    const proveedorItem = document.createElement('a');
    proveedorItem.className = 'list-group-item list-group-item-action';
    proveedorItem.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        ${proveedor}
        <span class="badge bg-primary rounded-pill">${items.length} items</span>
      </div>
    `;
    lista.appendChild(proveedorItem);
    
    // Items del proveedor
    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'list-group-item';
    items.forEach(item => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'd-flex justify-content-between';
      itemDiv.innerHTML = `
        <span>${item.ingrediente} (${item.comprar} ${item.unidad})</span>
        <span class="text-muted">$${(item.precio_estimado || 0).toFixed(2)}</span>
      `;
      itemsContainer.appendChild(itemDiv);
    });
    lista.appendChild(itemsContainer);
  });
  
  // Actualizar total
  const total = datosDespensa.lista_compras.reduce((sum, item) => sum + (item.precio_estimado || 0), 0);
  document.getElementById('total-compras').textContent = `$${total.toFixed(2)}`;
}

// Actualizar gráfico de costos
function actualizarGraficoCostos() {
  const labels = datosDespensa.lista_compras.map(item => item.ingrediente);
  const data = datosDespensa.lista_compras.map(item => item.precio_estimado || 0);
  
  window.graficoCostos.data = {
    labels: labels,
    datasets: [{
      label: 'Costo estimado',
      data: data,
      backgroundColor: '#be80ff',
      borderWidth: 1
    }]
  };
  window.graficoCostos.options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Costo ($)'
        }
      }
    }
  };
  window.graficoCostos.update();
}

// Actualizar lista de compras (MRP)
function actualizarListaCompras() {
  // Calcular necesidades totales por ingrediente
  const necesidades = {};
  
  datosDespensa.recetas.forEach(receta => {
    receta.ingredientes.forEach(ing => {
      const nombre = ing.ingrediente;
      const cantidad = ing.cantidad;
      
      if (necesidades[nombre]) {
        necesidades[nombre].cantidad_necesaria += cantidad;
      } else {
        const ingredienteBase = datosDespensa.ingredientes_base.find(i => i.nombre === nombre) || 
                              { unidad: 'unidad', categoria: 'Otros', precio: 1.0 };
        necesidades[nombre] = {
          cantidad_necesaria: cantidad,
          unidad: ing.unidad || ingredienteBase.unidad,
          categoria: ingredienteBase.categoria,
          precio: ingredienteBase.precio
        };
      }
    });
  });
  
  // Calcular compras necesarias
  datosDespensa.lista_compras = [];
  
  Object.entries(necesidades).forEach(([nombre, datos]) => {
    // Buscar stock actual
    const stockActual = datosDespensa.inventario.find(item => item.ingrediente === nombre)?.stock_actual || 0;
    const compraNecesaria = Math.max(0, datos.cantidad_necesaria - stockActual);
    
    if (compraNecesaria > 0) {
      // Asignar prioridad
      let prioridad;
      if (compraNecesaria > 1 || stockActual === 0) {
        prioridad = "Alta";
      } else if (compraNecesaria > 0.5) {
        prioridad = "Media";
      } else {
        prioridad = "Baja";
      }
      
      // Asignar proveedor según categoría
      let proveedor;
      if (datos.categoria.includes('Lácteo') || datos.categoria.includes('Carne')) {
        proveedor = "Supermercado";
      } else if (datos.categoria.includes('Vegetal')) {
        proveedor = "Mercado Local";
      } else {
        proveedor = "Tienda de Barrio";
      }
      
      // Calcular precio estimado
      const precioTotal = datos.precio * compraNecesaria;
      
      datosDespensa.lista_compras.push({
        ingrediente: nombre,
        unidad: datos.unidad,
        necesidad_total: datos.cantidad_necesaria,
        stock_actual: stockActual,
        comprar: compraNecesaria,
        prioridad: prioridad,
        proveedor: proveedor,
        precio_estimado: precioTotal
      });
    }
  });
  
  // Actualizar vista
  cargarListaCompras();
  actualizarKPIs();
}

// Generar lista de compras optimizada
function generarListaCompras() {
  const container = document.getElementById('alertas-ingredientes');
  container.innerHTML = '';
  
  // Ingredientes críticos (prioridad alta)
  const criticos = datosDespensa.lista_compras.filter(item => item.prioridad === 'Alta');
  
  if (criticos.length > 0) {
    criticos.forEach(item => {
      const alerta = document.createElement('div');
      alerta.className = 'alert alert-warning-custom mb-2';
      alerta.innerHTML = `
        <strong>${item.ingrediente}</strong> - Necesitas ${item.necesidad_total} ${item.unidad} 
        (tienes ${item.stock_actual}, faltan ${item.comprar})
      `;
      container.appendChild(alerta);
    });
  } else {
    const alerta = document.createElement('div');
    alerta.className = 'alert alert-info-custom mb-2';
    alerta.textContent = 'No hay ingredientes críticos esta semana. ¡Buen trabajo!';
    container.appendChild(alerta);
  }
  
  // Proveedores recomendados
  const proveedoresContainer = document.getElementById('lista-proveedores');
  proveedoresContainer.innerHTML = '';
  
  const proveedores = [...new Set(datosDespensa.lista_compras.map(item => item.proveedor))];
  proveedores.forEach(proveedor => {
    const items = datosDespensa.lista_compras.filter(item => item.proveedor === proveedor);
    const total = items.reduce((sum, item) => sum + (item.precio_estimado || 0), 0);
    
    const item = document.createElement('a');
    item.className = 'list-group-item list-group-item-action';
    item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        ${proveedor}
        <span class="badge bg-primary rounded-pill">${items.length} items</span>
      </div>
      <small class="text-muted">Total estimado: $${total.toFixed(2)}</small>
    `;
    proveedoresContainer.appendChild(item);
  });
}

// Cargar calendario de comidas
function cargarCalendario() {
  const tabla = document.getElementById('tabla-calendario');
  tabla.innerHTML = '';
  
  // Agrupar por día
  const diasAgrupados = datosDespensa.calendario_comidas.reduce((acc, comida) => {
    if (!acc[comida.dia]) acc[comida.dia] = {};
    acc[comida.dia][comida.comida] = comida.receta;
    return acc;
  }, {});
  
  // Mostrar en tabla
  Object.entries(diasAgrupados).forEach(([dia, comidas]) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${dia}</td>
      <td><span class="badge bg-primary">${comidas.Desayuno || '-'}</span></td>
      <td><span class="badge bg-success">${comidas.Almuerzo || '-'}</span></td>
      <td><span class="badge bg-warning">${comidas.Cena || '-'}</span></td>
    `;
    tabla.appendChild(row);
  });
}