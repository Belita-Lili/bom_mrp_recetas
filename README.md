# bom_analysis_droneX100
# 📊 BOM Analysis – DroneX-100

Este proyecto presenta un análisis de datos sobre la Bill of Materials (BOM) del producto **DroneX-100**, un dron ensamblado con múltiples subcomponentes. El objetivo es identificar el costo total del producto, analizar la jerarquía de componentes y evaluar la dependencia de proveedores clave.

---

## 🧾 Contenido

- `bom_drone.csv`: Archivo CSV con datos hipotéticos del BOM (producto padre, componentes, costos, niveles, proveedores).
- `bom_analysis_droneX100.ipynb`: Notebook de Jupyter que realiza el análisis exploratorio de datos (EDA) del BOM.

---

## 📦 Estructura del BOM

El dron contiene una lista jerárquica de componentes (multinivel), como:
- **Nivel 0**: DroneX-100
- **Nivel 1**: Control System, Propulsion Unit, Frame
- **Nivel 2**: Microcontrolador, Sensores, Motores, ESCs, etc.

---

## 📈 Análisis Realizado

1. **Carga y visualización de datos**
2. **Cálculo del costo total del producto**
3. **Identificación de componentes más costosos**
4. **Visualización de la jerarquía de ensamble** mediante `networkx`
5. **Análisis de proveedores** (concentración de costos)

---

## 🖥️ Cómo ejecutar

1. Clona el repositorio o descarga los archivos `CSV` y `IPYNB`.
2. Abre el archivo `bom_analysis_droneX100.ipynb` en:
   - Jupyter Notebook
   - JupyterLab
   - Google Colab (recomendado)

> 📌 Asegúrate de tener instaladas las siguientes bibliotecas:
```bash
pip install pandas matplotlib networkx
