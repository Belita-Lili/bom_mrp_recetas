# bom_analysis_droneX100
# 📊 Análisis MRP de Proyecto Fotovoltaico en Media Tensión
📌 Descripción General
Este proyecto realiza un análisis de planificación de requerimientos de materiales (MRP) para un sistema fotovoltaico de media tensión. A partir de una base de datos que incluye componentes eléctricos, electrónicos, estructurales y civiles, se identifican cuellos de botella, costos críticos y sincronización de compras para una instalación eficiente.

📂 Estructura del Proyecto
```bash
📁 MRP-Fotovoltaico/
├── data/
│   └── inventario_componentes.csv   # Datos base de componentes
├── src/
│   └── analisis_mrp.py              # Código de análisis y generación de gráficas
├── output/
│   └── graficas/                    # Gráficas generadas en el análisis
├── README.md                        # Este archivo
│   
└── PaletaDeColores                 # Colores utilizados en las graficas
```

# ⚙️ Tecnologías utilizadas
Python 3.x

Pandas

Matplotlib

Seaborn (opcional)

Jupyter Notebook (opcional para exploración interactiva)

# 📈 Análisis realizado
Clasificación de componentes por nivel del sistema (de generación a obras civiles).

Cálculo de costos totales por nivel.

Identificación de componentes críticos con baja disponibilidad.

Visualización de:

Distribución de costos por sistema.

Componentes con mayor peso económico.

Tiempo de entrega promedio por proveedor.

Detección de riesgos logísticos por tiempos de espera y sincronización.

# 📊 Gráficas generadas
Pie chart de distribución de costos por sistema.

Bar plot de inventario disponible vs requerido.

Heatmap de niveles y tiempos de espera.

# 📥 Instalación
```bash
git clone https://github.com/tu_usuario/MRP-Fotovoltaico.git
cd MRP-Fotovoltaico
pip install -r requirements.txt
```

# 🚀 Ejecución
Puedes correr el análisis desde el script principal:

```bash
python src/analisis_mrp.py
O explorar los datos desde un notebook Jupyter si prefieres:
```
```bash
jupyter notebook
```
# 📚 Datos de entrada
El archivo inventario_componentes.csv contiene las siguientes columnas clave:

Código, Descripción, Componentes

Disponibilidad, Costo unitario, Proveedor

Tiempo de espera (semanas), Nivel, Tamaño del lote, Recepciones, Subtotal

# ✅ Requerimientos
nginx
Copiar
Editar
pandas
matplotlib
seaborn

