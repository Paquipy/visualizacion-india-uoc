// Definimos la configuración, constantes e identidad cromática
// Definimos la paleta de colores corporativa
const COLORS = {
    primary: '#4f46e5',       // Índigo Intenso
    primaryAlpha: 'rgba(79, 70, 229, 0.08)',
    secondary: '#0ea5e9',     // Azul Celeste
    secondaryAlpha: 'rgba(14, 165, 233, 0.08)',
    accent: '#10b981',        // Verde Esmeralda
    gridColor: '#e2e8f0',     // Rejilla clara
    textColor: '#64748b',     // Gris slate suave
    titleColor: '#0f172a'     // Deep dark slate
};

// Definimos el mapa de historias guiadas
const STORIES = {
    digital: {
        badge: "HISTORIA 1",
        title: "La Revolución del Hilo Digital (Internet, Móviles y Red Física)",
        text: "En los años 90, la India era una nación desconectada. Menos de la mitad de la población tenía acceso a electricidad estable (49.8% en 1993) y la telefonía móvil era inexistente. La electrificación masiva de principios de siglo sentó las bases físicas. El abaratamiento drástico de la red de datos móvil en 2016 provocó una adopción de Internet sin parangón, disparando el indicador desde un 20% a un impresionante 70% en 2025, saltándose la telefonía fija de golpe.",
        indicatorA: "IT.NET.USER.ZS",
        indicatorB: "EG.ELC.ACCS.ZS",
        startYear: 1990,
        endYear: 2025,
        chartType: "line"
    },
    gdp: {
        badge: "HISTORIA 2",
        title: "Crecimiento e Inequidad (Gráfico de Burbujas Decadales)",
        text: "Este innovador gráfico de burbujas representa de un vistazo la relación de tres variables socioeconómicas críticas. El Eje X representa la tasa de crecimiento anual del PIB (%), el Eje Y la Tasa de Pobreza extrema a $3.00/día (%) y el tamaño de la burbuja representa la Población Total. Observa cómo a lo largo de las décadas (representadas por burbujas de colores del naranja al esmeralda), la burbuja se desplaza radicalmente hacia abajo a medida que crece de tamaño, ilustrando el milagro demográfico y el colapso de la miseria extrema del 47% a solo el 5.3%.",
        indicatorA: "NY.GDP.MKTP.KD.ZG",
        indicatorB: "SI.POV.DDAY",
        startYear: 1993,
        endYear: 2022,
        chartType: "bubble"
    },
    demo: {
        badge: "HISTORIA 3",
        title: "Transición Demográfica de la India (Líneas de Crecimiento)",
        text: "Este gráfico lineal de baja carga cognitiva muestra con máxima claridad la gran transición demográfica del subcontinente. La línea Naranja Oscuro muestra el decrecimiento paulatino de la tasa de crecimiento total de la población (del 2.2% al 0.79% anual), confirmando la estabilización demográfica del gigante. Por su parte, la línea Naranja Claro se mantiene sistemáticamente un 1% por encima, reflejando el masivo e imparable éxodo del campo a las urbes modernas.",
        indicatorA: "SP.POP.GROW",
        indicatorB: "SP.URB.GROW",
        startYear: 1990,
        endYear: 2024,
        chartType: "line"
    },
    summary: {
        badge: "HISTORIA 4",
        title: "La Convergencia del Desarrollo: Infraestructura y Sociedad",
        text: "El despegue de la India no se explica por un solo factor, sino por la confluencia de dos caminos paralelos nacidos de la electrificación rural de principios de siglo. Por un lado, la infraestructura de energía permitió desplegar antenas y universalizar el internet móvil barato a partir de 2016. Por el otro, iluminó hogares y comercios, dinamizando la economía local y reduciendo drásticamente la pobreza. Ambos caminos convergen en la revolución de la inclusión financiera digital, permitiendo que millones de ciudadanos interactúen hoy en una economía moderna, unificada y conectada.",
        indicatorA: "IT.NET.USER.ZS",
        indicatorB: "SI.POV.DDAY",
        startYear: 1993,
        endYear: 2025,
        chartType: "line",
        enablePrediction: true
    }
};

// Definimos la base de datos de los hitos decadales
const HITOS = {
    "1990": {
        title: "Liberalización y Celular (1990s)",
        desc: "Las reformas de 1991 abrieron la economía disparando el PIB. En 1995 se realiza la primera llamada móvil, sembrando la era digital.",
        comment: "La economía gana velocidad mientras el crecimiento poblacional empieza a perder fuerza.",
        indicatorA: "NY.GDP.MKTP.KD.ZG",
        indicatorB: "SP.POP.GROW",
        startYear: 1990,
        endYear: 1999,
        enablePrediction: false
    },
    "2005": {
        title: "Infraestructura Física y Luz (2000s)",
        desc: "Plan Eléctrico de 2005. Electrificación rural masiva acelerando la cobertura del 50% al 75% rural, la plataforma física para el salto digital.",
        comment: "Más acceso eléctrico significa también más capacidad de consumo, producción y desarrollo.",
        indicatorA: "EG.ELC.ACCS.ZS",
        indicatorB: "EG.USE.ELEC.KH.PC",
        startYear: 2000,
        endYear: 2009,
        enablePrediction: false
    },
    "2016": {
        title: "Revolución 4G Jio (2010s)",
        desc: " Reliance Jio desploma tarifas en 2016. La adopción de Internet explota verticalmente de 20% a 55% nacional por la bancarización móvil.",
        comment: "La electricidad prepara el terreno, internet acelera el cambio.",
        indicatorA: "IT.NET.USER.ZS",
        indicatorB: "EG.ELC.ACCS.ZS",
        startYear: 2010,
        endYear: 2019,
        enablePrediction: false
    },
    "2023": {
        title: "Líder Poblacional Mundial (2020s)",
        desc: "India supera a China en población (~1.43B). Sin embargo, el crecimiento se frena al 0.79% anual confirmando su transición demográfica.",
        comment: "India se consolida como el país más poblado con una transición demográfica ya estabilizada.",
        indicatorA: "SP.POP.TOTL",
        indicatorB: "SP.POP.GROW",
        startYear: 2018,
        endYear: 2025,
        enablePrediction: false
    },
    "prediction": {
        title: "Futurología Predictiva (2030s)",
        desc: "Modelado predictivo de regresión lineal. Se proyecta la cobertura universal del internet móvil y la consolidación digital hacia 2035.",
        comment: "Tras décadas construyendo infraestructura, India se acerca a una nueva etapa: energía casi universal y una sociedad cada vez más conectada.",
        indicatorA: "IT.NET.USER.ZS",
        indicatorB: "EG.ELC.ACCS.ZS",
        startYear: 2015,
        endYear: 2025,
        enablePrediction: true
    }
};

// Traducimos los indicadores al español
const INDICATOR_TRANSLATIONS = {
    "EG.USE.ELEC.KH.PC": "Consumo de energía eléctrica (kWh per cápita)",
    "NY.GDP.MKTP.KD.ZG": "Crecimiento del PIB (% anual)",
    "TX.VAL.TECH.MF.ZS": "Exportaciones de alta tecnología (% de exportaciones industriales)",
    "SI.DST.FRST.20": "Porcentaje de ingresos del 20% más pobre",
    "IT.CEL.SETS.P2": "Líneas de telefonía móvil (por cada 100 personas)",
    "SP.POP.GROW": "Crecimiento de la población (% anual)",
    "SP.POP.TOTL": "Población total",
    "SI.POV.DDAY": "Tasa de Pobreza a $3.00/día (% de la población)",
    "SI.POV.NAHC": "Tasa de pobreza según líneas nacionales (% de la población)",
    "SP.URB.GROW": "Crecimiento de la población urbana (% anual)",
    "IT.NET.USER.ZS": "Uso de Internet (% de la población)",
    "EG.ELC.ACCS.ZS": "Acceso a la electricidad (% de la población)"
};

// Traducimos las unidades al español
const UNIT_TRANSLATIONS = {
    "kilowatt-hour (kWh) per capita": "kWh per cápita",
    "number of subscriptions*100/population": "Líneas por 100 hab.",
    "Percentage": "%",
    "Unit": "Habitantes",
    "% of GDP": "% del PIB",
    "% of population": "% de la población",
    "% (share) of population": "% de la población",
    "%": "%"
};

// Definimos las funciones de traducción
function getIndicatorName(indicator) {
    if (!indicator) return "";
    return INDICATOR_TRANSLATIONS[indicator.series_code] || indicator.series_name;
}

function getIndicatorUnit(indicator) {
    if (!indicator) return "";
    return UNIT_TRANSLATIONS[indicator.unit] || indicator.unit;
}
