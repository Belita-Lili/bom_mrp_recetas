// Mostrar todas las recetas
function cargarRecetas() {
    const contenedor = document.getElementById('contenedor-recetas');
    contenedor.innerHTML = '';
    
    datosDespensa.recetas.forEach(receta => {
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
                <p><small class="text-muted">${receta.categoria} - ${receta.tiempo_preparacion} min - ${receta.porciones || 4} porciones</small></p>
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
                    <button class="btn btn-sm btn-outline-secondary btn-editar-receta" 
                            data-id="${receta.nombre}">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger" 
                            onclick="eliminarReceta('${receta.nombre}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
        
        contenedor.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Configurar eventos de los botones de edición
    configurarBotonesEdicion();
}

// Mostrar detalles de receta en modal
function mostrarDetallesReceta(nombreReceta) {
  const receta = datosDespensa.recetas.find(r => r.nombre === nombreReceta);
  
  // Configurar modal
  document.getElementById('modalRecetaTitulo').textContent = receta.nombre;
  document.getElementById('modalRecetaImagen').src = `images/receta-${receta.nombre.toLowerCase().replace(/ /g, '-')}.jpg`;
  
  // Ingredientes
  const ingredientesList = document.getElementById('modalRecetaIngredientes');
  ingredientesList.innerHTML = '';
  receta.ingredientes.forEach(ing => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between';
    li.innerHTML = `
      ${ing.ingrediente}
      <span class="badge bg-primary">${ing.cantidad} ${ing.unidad}</span>
    `;
    ingredientesList.appendChild(li);
  });
  
  // Instrucciones
  document.getElementById('modalRecetaInstrucciones').textContent = 
    receta.instrucciones || 'Instrucciones no disponibles.';
  
  // Generar diagrama BOM
  generarDiagramaBOM(receta);
  
  // Mostrar modal
  new bootstrap.Modal(document.getElementById('modalReceta')).show();
}

// Generar diagrama BOM con Mermaid
function generarDiagramaBOM(receta) {
  const bomDiagram = document.getElementById('bomDiagram');
  
  let mermaidCode = `graph TD\n`;
  mermaidCode += `  A[${receta.nombre}]\n`;
  
  receta.ingredientes.forEach((ing, index) => {
    mermaidCode += `  A --> B${index}[${ing.ingrediente}\\n${ing.cantidad} ${ing.unidad}]\n`;
  });
  
  // Renderizar diagrama
  bomDiagram.innerHTML = `<div class="mermaid">${mermaidCode}</div>`;
  
  // Si Mermaid está cargado, inicializar
  if (window.mermaid) {
    mermaid.init(undefined, bomDiagram.querySelector('.mermaid'));
  }
}

// Mostrar formulario para nueva receta o edición
function mostrarFormularioReceta(recetaId = null) {
  const form = document.getElementById('formReceta');
  form.reset();
  
  if (recetaId) {
    // Modo edición
    const receta = datosDespensa.recetas.find(r => r.nombre === recetaId);
    document.getElementById('modalEditarRecetaTitulo').textContent = 'Editar Receta';
    document.getElementById('recetaId').value = receta.nombre;
    document.getElementById('recetaNombre').value = receta.nombre;
    document.getElementById('recetaCategoria').value = receta.categoria;
    document.getElementById('recetaDificultad').value = receta.dificultad;
    document.getElementById('recetaTiempo').value = receta.tiempo_preparacion;
    document.getElementById('recetaInstrucciones').value = receta.instrucciones || '';
    
    // Mostrar ingredientes
    const container = document.getElementById('ingredientesContainer');
    container.innerHTML = '';
    receta.ingredientes.forEach((ing, index) => {
      agregarIngrediente(ing.ingrediente, ing.cantidad, ing.unidad, index);
    });
    
    // Mostrar botón eliminar
    document.getElementById('btnEliminarReceta').style.display = 'inline-block';
    document.getElementById('btnEliminarReceta').onclick = () => eliminarReceta(receta.nombre);
  } else {
    // Modo nueva
    document.getElementById('modalEditarRecetaTitulo').textContent = 'Nueva Receta';
    document.getElementById('recetaId').value = '';
    document.getElementById('ingredientesContainer').innerHTML = '';
    document.getElementById('btnEliminarReceta').style.display = 'none';
  }
  
  new bootstrap.Modal(document.getElementById('modalEditarReceta')).show();
}

// Añadir campo de ingrediente al formulario
function agregarIngrediente(nombre = '', cantidad = '', unidad = 'kg', index = null) {
  const container = document.getElementById('ingredientesContainer');
  const ingredienteId = index ?? Date.now();
  
  const div = document.createElement('div');
  div.className = 'row g-2 mb-2 ingrediente-row';
  div.dataset.id = ingredienteId;
  div.innerHTML = `
    <div class="col-md-5">
      <input type="text" class="form-control" placeholder="Ingrediente" 
             value="${nombre}" id="ingredienteNombre_${ingredienteId}" required>
    </div>
    <div class="col-md-3">
      <input type="number" step="0.01" class="form-control" placeholder="Cantidad" 
             value="${cantidad}" id="ingredienteCantidad_${ingredienteId}" required>
    </div>
    <div class="col-md-3">
      <select class="form-select" id="ingredienteUnidad_${ingredienteId}">
        <option value="kg" ${unidad === 'kg' ? 'selected' : ''}>kg</option>
        <option value="g" ${unidad === 'g' ? 'selected' : ''}>g</option>
        <option value="lt" ${unidad === 'lt' ? 'selected' : ''}>lt</option>
        <option value="ml" ${unidad === 'ml' ? 'selected' : ''}>ml</option>
        <option value="unidad" ${unidad === 'unidad' ? 'selected' : ''}>unidad</option>
        <option value="taza" ${unidad === 'taza' ? 'selected' : ''}>taza</option>
      </select>
    </div>
    <div class="col-md-1">
      <button type="button" class="btn btn-outline-danger w-100" 
              onclick="eliminarIngrediente(${ingredienteId})">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;
  container.appendChild(div);
}

// Eliminar ingrediente del formulario
function eliminarIngrediente(id) {
  document.querySelector(`.ingrediente-row[data-id="${id}"]`).remove();
}

// Guardar receta (nueva o editada)
function guardarReceta() {
  const form = document.getElementById('formReceta');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  
  // Obtener datos del formulario
  const nombre = document.getElementById('recetaNombre').value;
  const recetaId = document.getElementById('recetaId').value;
  const receta = {
    nombre: nombre,
    categoria: document.getElementById('recetaCategoria').value,
    dificultad: document.getElementById('recetaDificultad').value,
    tiempo_preparacion: parseInt(document.getElementById('recetaTiempo').value),
    instrucciones: document.getElementById('recetaInstrucciones').value,
    ingredientes: []
  };
  
  // Obtener ingredientes
  document.querySelectorAll('.ingrediente-row').forEach(row => {
    const id = row.dataset.id;
    receta.ingredientes.push({
      ingrediente: document.getElementById(`ingredienteNombre_${id}`).value,
      cantidad: parseFloat(document.getElementById(`ingredienteCantidad_${id}`).value),
      unidad: document.getElementById(`ingredienteUnidad_${id}`).value
    });
  });
  
  // Validar que haya al menos un ingrediente
  if (receta.ingredientes.length === 0) {
    alert('Debe añadir al menos un ingrediente');
    return;
  }
  
  // Actualizar o añadir receta
  if (recetaId) {
    // Editar receta existente
    const index = datosDespensa.recetas.findIndex(r => r.nombre === recetaId);
    datosDespensa.recetas[index] = receta;
  } else {
    // Añadir nueva receta
    datosDespensa.recetas.push(receta);
  }
  
  // Actualizar calendario si es necesario
  actualizarCalendarioConReceta(receta);
  
  // Actualizar lista de compras
  actualizarListaCompras();
  
  // Recargar vista
  cargarRecetas();
  
  // Cerrar modal
  bootstrap.Modal.getInstance(document.getElementById('modalEditarReceta')).hide();
}

// Eliminar receta
function eliminarReceta(nombreReceta) {
    if (confirm(`¿Estás seguro de eliminar la receta "${nombreReceta}"? Esta acción no se puede deshacer.`)) {
        // Eliminar de la lista de recetas
        datosDespensa.recetas = datosDespensa.recetas.filter(r => r.nombre !== nombreReceta);
        
        // Eliminar del calendario de comidas
        datosDespensa.calendario_comidas = datosDespensa.calendario_comidas.filter(c => c.receta !== nombreReceta);
        
        // Actualizar la vista
        cargarRecetas();
        cargarCalendario();
        actualizarListaCompras();
        actualizarKPIs();
    }
}

// Actualizar calendario cuando se añade/edita una receta
function actualizarCalendarioConReceta(receta) {
  // Implementación según tu lógica de calendario
}
// Variables globales
let editandoRecetaId = null;

// Mostrar formulario para editar/agregar receta
function mostrarFormularioReceta(recetaId = null) {
    editandoRecetaId = recetaId;
    const formulario = document.getElementById('formulario-receta');
    const overlay = document.getElementById('overlay-receta');
    const titulo = document.getElementById('titulo-formulario-receta');
    
    // Limpiar formulario
    document.getElementById('receta-form').reset();
    document.getElementById('lista-ingredientes').innerHTML = '';
    
    if (recetaId) {
        // Modo edición - cargar datos de la receta
        const receta = datosDespensa.recetas.find(r => r.nombre === recetaId);
        if (receta) {
            titulo.textContent = "Editar Receta";
            document.getElementById('receta-id').value = receta.nombre;
            document.getElementById('nombre-receta').value = receta.nombre;
            document.getElementById('categoria-receta').value = receta.categoria;
            document.getElementById('dificultad-receta').value = receta.dificultad;
            document.getElementById('tiempo-receta').value = receta.tiempo_preparacion;
            document.getElementById('porciones-receta').value = receta.porciones || 4;
            document.getElementById('instrucciones-receta').value = receta.instrucciones || '';
            
            // Cargar ingredientes
            receta.ingredientes.forEach(ing => {
                agregarIngrediente(ing.ingrediente, ing.cantidad, ing.unidad);
            });
        }
    } else {
        // Modo nuevo
        titulo.textContent = "Agregar Nueva Receta";
        document.getElementById('receta-id').value = "";
        // Añadir un ingrediente por defecto
        agregarIngrediente();
    }
    
    formulario.style.display = "block";
    overlay.style.display = "block";
}

// Ocultar formulario
function ocultarFormularioReceta() {
    document.getElementById('formulario-receta').style.display = "none";
    document.getElementById('overlay-receta').style.display = "none";
    editandoRecetaId = null;
}

// Añadir campo de ingrediente al formulario
function agregarIngrediente(nombre = '', cantidad = '', unidad = 'unidad') {
    const container = document.getElementById('lista-ingredientes');
    const ingredienteId = Date.now();
    
    const div = document.createElement('div');
    div.className = 'row g-3 mb-3 ingrediente-form';
    div.dataset.id = ingredienteId;
    div.innerHTML = `
        <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Nombre del ingrediente" 
                   value="${nombre}" required>
        </div>
        <div class="col-md-3">
            <input type="number" step="0.01" class="form-control" placeholder="Cantidad" 
                   value="${cantidad}" required min="0.01">
        </div>
        <div class="col-md-3">
            <select class="form-select">
                <option value="unidad" ${unidad === 'unidad' ? 'selected' : ''}>Unidad</option>
                <option value="kg" ${unidad === 'kg' ? 'selected' : ''}>Kilogramos (kg)</option>
                <option value="g" ${unidad === 'g' ? 'selected' : ''}>Gramos (g)</option>
                <option value="lt" ${unidad === 'lt' ? 'selected' : ''}>Litros (lt)</option>
                <option value="ml" ${unidad === 'ml' ? 'selected' : ''}>Mililitros (ml)</option>
                <option value="taza" ${unidad === 'taza' ? 'selected' : ''}>Tazas</option>
                <option value="cda" ${unidad === 'cda' ? 'selected' : ''}>Cucharadas</option>
                <option value="cdta" ${unidad === 'cdta' ? 'selected' : ''}>Cucharaditas</option>
            </select>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-outline-danger w-100" 
                    onclick="eliminarIngredienteForm(${ingredienteId})">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
}

// Eliminar ingrediente del formulario
function eliminarIngredienteForm(id) {
    const ingrediente = document.querySelector(`.ingrediente-form[data-id="${id}"]`);
    if (ingrediente) {
        ingrediente.remove();
    }
}

// Guardar receta (nueva o editada)
document.getElementById('receta-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar que haya al menos un ingrediente
    if (document.querySelectorAll('.ingrediente-form').length === 0) {
        alert('Debes agregar al menos un ingrediente');
        return;
    }
    
    // Obtener datos del formulario
    const receta = {
        nombre: document.getElementById('nombre-receta').value,
        categoria: document.getElementById('categoria-receta').value,
        dificultad: document.getElementById('dificultad-receta').value,
        tiempo_preparacion: parseInt(document.getElementById('tiempo-receta').value),
        porciones: parseInt(document.getElementById('porciones-receta').value) || 4,
        instrucciones: document.getElementById('instrucciones-receta').value,
        ingredientes: []
    };
    
    // Obtener ingredientes
    document.querySelectorAll('.ingrediente-form').forEach(ingDiv => {
        const inputs = ingDiv.querySelectorAll('input, select');
        receta.ingredientes.push({
            ingrediente: inputs[0].value,
            cantidad: parseFloat(inputs[1].value),
            unidad: inputs[2].value
        });
    });
    
    // Guardar o actualizar la receta
    if (editandoRecetaId) {
        // Editar receta existente
        const index = datosDespensa.recetas.findIndex(r => r.nombre === editandoRecetaId);
        if (index !== -1) {
            datosDespensa.recetas[index] = receta;
            
            // Actualizar también en el calendario si el nombre cambió
            if (receta.nombre !== editandoRecetaId) {
                datosDespensa.calendario_comidas.forEach(comida => {
                    if (comida.receta === editandoRecetaId) {
                        comida.receta = receta.nombre;
                    }
                });
            }
        }
    } else {
        // Agregar nueva receta
        datosDespensa.recetas.push(receta);
    }
    
    // Actualizar la vista
    cargarRecetas();
    cargarCalendario();
    actualizarListaCompras();
    actualizarKPIs();
    
    // Ocultar formulario
    ocultarFormularioReceta();
});

// Modificar los botones "Editar" en las cards de receta
function configurarBotonesEdicion() {
    document.querySelectorAll('.btn-editar-receta').forEach(btn => {
        btn.addEventListener('click', function() {
            const recetaId = this.dataset.id;
            mostrarFormularioReceta(recetaId);
        });
    });
}