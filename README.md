# Evolución en India (1990-2035)
## Población, recursos y revolución digital (1990-2035) · Proyecto Final de Visualización de Datos UOC

Este repositorio contiene el proyecto final de la asignatura de Visualización de Datos. El objetivo es explorar cómo ha cambiado la India en los últimos 35 años usando datos del Banco Mundial.

- **Dashboard (online):** [https://paquipy.github.io/visualizacion-india-uoc/src/](https://paquipy.github.io/visualizacion-india-uoc/src/)
- **Repositorio:** [https://github.com/Paquipy/visualizacion-india-uoc](https://github.com/Paquipy/visualizacion-india-uoc)
- **Análisis exploratorio:** [notebooks/EDA.md](notebooks/EDA.md)
- **Script de limpieza de datos:** [notebooks/eda_and_cleaning.py](notebooks/eda_and_cleaning.py)

---

## 1. Introducción y Objetivos

Me llamó la atención la India como tema porque en pocas décadas ha pasado de ser una economía cerrada y mayoritariamente agrícola a convertirse en una de las más importantes del mundo. Quería entender cómo se relacionan el crecimiento económico, la electricidad, el internet y la demografía, y si los datos lo confirman.

El objetivo es responder visualmente a esas preguntas con datos reales.

---

## 2. Preguntas de Investigación

1. **P1 – Infraestructura digital:** ¿Tiene relación el acceso a la electricidad con la adopción de Internet y el móvil? ¿Uno precedió al otro?
2. **P2 – Crecimiento y pobreza:** ¿Ha reducido el crecimiento del PIB la pobreza extrema? ¿Y a qué escala, teniendo en cuenta que hablamos de más de 1.000 millones de personas?
3. **P3 – Demografía:** ¿Cómo evoluciona el crecimiento de la población frente al crecimiento urbano? ¿Se está estabilizando el país demográficamente?
4. **P4 – Industrialización:** ¿Se refleja el mayor consumo energético en una mayor exportación de productos tecnológicos?

---

## 3. Dataset y Licencia

- **Fuente:** Banco Mundial – World Development Indicators (WDI)
- **Licencia:** CC BY-4.0
- **Cobertura:** 12 indicadores socioeconómicos, de 1990 a 2025

**Variables usadas:**
- Población total y tasas de crecimiento demográfico y urbano
- Crecimiento del PIB (% anual)
- Acceso a electricidad (% de la población)
- Suscripciones móviles (por cada 100 personas)
- Uso de Internet (% de la población)
- Consumo eléctrico (kWh per cápita)
- Exportaciones de alta tecnología (% del total manufacturero)
- Tasa de pobreza extrema ($3.00/día) y pobreza nacional
- Participación en el ingreso del 20% más pobre

---

## 4. Limpieza y Preparación de los Datos

El script `notebooks/eda_and_cleaning.py` transforma el Excel original del Banco Mundial en un JSON limpio que usa el dashboard. Los pasos principales:

1. Los encabezados de columna venían en formato `1990 [YR1990]` — extraje solo el año.
2. Los valores vacíos venían como `..` — los convertí a `null`.
3. Eliminé las filas de metadatos que el Banco Mundial añade al final del archivo.
4. Crucé los datos con la hoja de metadatos para añadir definiciones y unidades a cada indicador.

---

## 5. Decisiones de Diseño Visual

El dashboard está organizado en cuatro historias guiadas que responden a las preguntas de investigación:

- **Historia 1 – Revolución digital:** Gráfico de líneas con doble eje Y para comparar electricidad e Internet. Los colores de cada línea coinciden con los de su eje para facilitar la lectura.
- **Historia 2 – Crecimiento y pobreza:** Gráfico de burbujas donde cada burbuja representa una década. El eje X es el PIB, el eje Y la pobreza extrema y el tamaño refleja la población total.
- **Historia 3 – Demografía:** Gráfico de líneas con un único eje que compara el crecimiento total de la población con el crecimiento urbano.
- **Línea de tiempo decadal:** Permite navegar por hitos históricos (apertura económica de los 90, plan eléctrico de 2005, revolución 4G de 2016...) y ver los datos de cada periodo.

Además hay un explorador libre donde se puede combinar cualquier par de indicadores, cambiar el tipo de gráfico y ajustar el rango de años. Las proyecciones futuras (2026-2035) se calculan mediante regresión lineal y se muestran con trazo discontinuo para distinguirlas de los datos históricos.

---

## 6. Conclusiones

1. **La electricidad habilitó el salto digital.** El acceso a la electricidad pasó del 50% al 99% entre 1993 y 2022. Eso sentó las bases para que el internet móvil creciera de forma exponencial a partir de 2016, llegando al 70% de la población en 2025.
2. **El crecimiento económico sí redujo la pobreza extrema.** La tasa bajó del 47.5% al 5.3% en tres décadas. Pero la distribución de la riqueza apenas cambió: el 20% más pobre mantiene la misma proporción del ingreso nacional.
3. **La India se estabiliza demográficamente.** El crecimiento de la población cayó del 2.2% al 0.79% anual. Al mismo tiempo, el crecimiento urbano se mantiene por encima, lo que indica una migración campo-ciudad que no se ha detenido.

---

## 7. Limitaciones

- Los datos de pobreza y desigualdad solo están disponibles en los años con encuesta oficial, lo que deja muchos años sin datos.
- Los datos de exportación de alta tecnología no están disponibles antes de 2009, lo que limita el análisis histórico de ese indicador.
