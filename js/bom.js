// Actualizar gráfico de categorías
function actualizarGraficoCategorias() {
  // Agrupar ingredientes por categoría
  const categorias = {};
  datosDespensa.recetas.forEach(receta => {
    receta.ingredientes.forEach(ing => {
      const categoria = datosDespensa.ingredientes_base.find(i => i.nombre === ing.ingrediente)?.categoria || 'Otros';
      categorias[categoria] = (categorias[categoria] || 0) + 1;
    });
  });
  
  // Configurar datos para el gráfico
  const labels = Object.keys(categorias);
  const data = Object.values(categorias);
  const backgroundColors = [
    '#ff548f', '#9061c2', '#be80ff', '#63d3ff', '#02779e', '#ff9e7d'
  ];
  
  // Actualizar gráfico
  window.graficoCategorias.data = {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: backgroundColors,
      borderWidth: 1
    }]
  };
  window.graficoCategorias.update();
}

// Filtrar recetas
function filtrarRecetas() {
  const dia = document.getElementById('filtroDia').value;
  const categoria = document.getElementById('filtroCategoria').value;
  const dificultad = document.getElementById('filtroDificultad').value;
  
  let recetasFiltradas = datosDespensa.recetas;
  
  if (dia) {
    const recetasDia = datosDespensa.calendario_comidas
      .filter(c => c.dia.toLowerCase().includes(dia))
      .map(c => c.receta);
    
    recetasFiltradas = recetasFiltradas.filter(r => recetasDia.includes(r.nombre));
  }
  
  if (categoria) {
    recetasFiltradas = recetasFiltradas.filter(r => r.categoria.toLowerCase().includes(categoria));
  }
  
  if (dificultad) {
    recetasFiltradas = recetasFiltradas.filter(r => r.dificultad.toLowerCase().includes(dificultad));
  }
  
  // Mostrar recetas filtradas
  const contenedor = document.getElementById('contenedor-recetas');
  contenedor.innerHTML = '';
  
  recetasFiltradas.forEach(receta => {
    const ingredientesHTML = receta.ingredientes.map(ing => 
      `<li class="list-group-item d-flex justify-content-between align-items-center ps-0">
        ${ing.ingrediente}
        <span class="badge bg-secondary">${ing.cantidad} ${ing.unidad}</span>
      </li>`
    ).join('');
    
    const cardHTML = `
    <div class="col-md-4 mb-4">
      <div class="card-custom h-100">
        <img src="images/receta-${receta.nombre.toLowerCase().replace(/ /g, '-')}.jpg" 
             class="recipe-img mb-3" alt="${receta.nombre}" onerror="this.src='images/receta-default.jpg'">
        <h5>${receta.nombre}</h5>
        <p><small class="text-muted">${receta.categoria} - ${receta.tiempo_preparacion} min</small></p>
        <div class="mb-2">
          <span class="badge ${receta.dificultad === 'Fácil' ? 'bg-success' : receta.dificultad === 'Medio' ? 'bg-warning' : 'bg-danger'} me-1">
            ${receta.dificultad}
          </span>
        </div>
        <h6>Ingredientes:</h6>
        <ul class="list-group list-group-flush mb-3">
          ${ingredientesHTML}
        </ul>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-primary flex-grow-1" 
                  onclick="mostrarDetallesReceta('${receta.nombre}')">
            <i class="bi bi-eye"></i> Detalles
          </button>
          <button class="btn btn-sm btn-outline-secondary" 
                  onclick="mostrarFormularioReceta('${receta.nombre}')">
            <i class="bi bi-pencil"></i>
          </button>
        </div>
      </div>
    </div>`;
    
    contenedor.insertAdjacentHTML('beforeend', cardHTML);
  });
}