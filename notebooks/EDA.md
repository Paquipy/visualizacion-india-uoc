# Exploración de Datos (EDA) – India (1990-2025)

Antes de diseñar el dashboard, inspeccionamos el dataset del Banco Mundial para entender qué datos teníamos disponibles, dónde había huecos y qué historias permitían contar.

---

## 1. El dataset

**Fuente:** Banco Mundial – World Development Indicators (WDI).  
**Período:** 1990 a 2025 (36 años).  
**País:** India (`IND`).  
**Variables exploradas:** 12 indicadores socioeconómicos sobre demografía, economía, energía y telecomunicaciones.

### Calidad de los datos

La mayoría de indicadores tienen cobertura excelente. Las excepciones son los datos de pobreza e ingresos, que solo existen en los años en que el gobierno realiza encuestas oficiales de hogares:

| Indicador | Cobertura | Observación |
| :--- | :---: | :--- |
| Población total, crecimiento demográfico y urbano | ≈ 97% | Prácticamente completo |
| Crecimiento del PIB | ≈ 97% | Incluye la caída de 2020 (COVID) |
| Acceso a electricidad | ≈ 86% | Sin datos en los primeros años 90 |
| Suscripciones móviles, uso de Internet | ≈ 97% | Serie completa desde 1995 / 2000 |
| Consumo eléctrico (kWh per cápita) | ≈ 94% | Faltan los dos últimos años |
| Pobreza extrema ($3/día) y pobreza nacional | ≈ 12-14% | Solo años con encuesta oficial |
| Participación de ingresos del 20% más pobre | ≈ 14% | Muy pocos puntos disponibles |

---

## 2. Qué descubrimos explorando los datos

### A. La electricidad llegó antes que Internet
El acceso a electricidad pasó del 49% (1993) al 99% (2022) a lo largo de casi tres décadas. Internet, en cambio, se mantuvo por debajo del 20% hasta 2017 y luego se disparó hasta el 70% en 2025. La electricidad fue el requisito previo: sin ella, el salto digital no habría sido posible.

### B. El crecimiento económico sí redujo la pobreza extrema
Con un crecimiento medio del PIB del 6% anual, la pobreza extrema cayó del 47.5% al 5.3% en treinta años. Sin embargo, la distribución de la riqueza apenas cambió: el 20% más pobre sigue recibiendo entre el 9.7% y el 10.4% del ingreso nacional. Creció el pastel, pero no se repartió de forma distinta.

### C. La India está cambiando demográficamente
El crecimiento de la población se frenó a la mitad, del 2.2% al 0.79% anual. Al mismo tiempo, la migración del campo a la ciudad no para: el crecimiento urbano supera sistemáticamente al crecimiento total. El país se estabiliza en número, pero se reordena en el territorio.

---

## 3. Cómo tratamos los datos incompletos

Los indicadores de pobreza tienen muchos años sin medición. En el dashboard se representan como líneas que interpolan entre los puntos reales conocidos, y las proyecciones futuras se trazan con trazo discontinuo para distinguirlas visualmente de los datos históricos reales.
