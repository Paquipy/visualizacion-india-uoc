// Gestionamos los gráficos y cálculos estadísticos

// Calculamos el coeficiente de correlación de Pearson
function calculateCorrelation(xValues, yValues) {
    const alignedX = [];
    const alignedY = [];

    for (let i = 0; i < xValues.length; i++) {
        if (xValues[i] !== null && xValues[i] !== undefined &&
            yValues[i] !== null && yValues[i] !== undefined) {
            alignedX.push(xValues[i]);
            alignedY.push(yValues[i]);
        }
    }

    const n = alignedX.length;
    if (n <= 2) return null;

    const meanX = alignedX.reduce((a, b) => a + b, 0) / n;
    const meanY = alignedY.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
        const diffX = alignedX[i] - meanX;
        const diffY = alignedY[i] - meanY;
        num += diffX * diffY;
        denX += diffX * diffX;
        denY += diffY * diffY;
    }

    if (denX === 0 || denY === 0) return 0;

    return num / Math.sqrt(denX * denY);
}

// Calculamos la predicción mediante regresión lineal
function calculatePrediction(years, values, predictYears) {
    const x = [];
    const y = [];
    for (let i = 0; i < years.length; i++) {
        if (values[i] !== null && values[i] !== undefined) {
            x.push(years[i]);
            y.push(values[i]);
        }
    }

    // Seleccionamos los últimos 6 puntos para la tendencia
    const recentX = x.length > 6 ? x.slice(-6) : x;
    const recentY = y.length > 6 ? y.slice(-6) : y;

    const n = recentX.length;
    if (n < 2) return predictYears.map(() => null);

    const sumX = recentX.reduce((a, b) => a + b, 0);
    const sumY = recentY.reduce((a, b) => a + b, 0);
    const sumXY = recentX.reduce((sum, curr, idx) => sum + curr * recentY[idx], 0);
    const sumXX = recentX.reduce((sum, curr) => sum + curr * curr, 0);

    const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    return predictYears.map(year => m * year + c);
}

// Creamos un minigráfico (sparkline) para los KPIs
function createSparkline(canvasId, indicator, colorRGB) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const years = appData.years;
    const dataValues = years.map(y => indicator.values[y]).filter(v => v !== null);
    const labels = years.filter(y => indicator.values[y] !== null);

    if (sparklinesInstances[canvasId]) {
        sparklinesInstances[canvasId].destroy();
    }

    const ctx = canvas.getContext('2d');
    sparklinesInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                borderColor: colorRGB,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            }
        }
    });
}

// Actualizamos el gráfico principal según los filtros
function updateMainChart() {
    const canvas = document.getElementById("main-interactive-chart");
    if (!canvas || !appData) return;

    const codeA = document.getElementById("select-indicator-a").value;
    const codeB = document.getElementById("select-indicator-b").value;

    const indA = appData.indicators.find(i => i.series_code === codeA);
    const indB = appData.indicators.find(i => i.series_code === codeB);
    if (!indA || !indB) return;

    const startYear = parseInt(document.getElementById("slider-start-year").value);
    const endYear = parseInt(document.getElementById("slider-end-year").value);

    const enablePrediction = document.getElementById("btn-toggle-prediction").checked;

    if (mainChartInstance) {
        mainChartInstance.destroy();
    }

    const activeChartTypeBtn = document.querySelector(".chart-type-toggle button.active");
    let chartLayoutType = activeChartTypeBtn ? activeChartTypeBtn.getAttribute("data-type") : "line";

    if (activeStoryKey === "gdp") {
        chartLayoutType = "bubble";
    } else if (activeStoryKey === "demo") {
        chartLayoutType = "line";
    }

    // Seleccionamos colores dinámicos para los indicadores
    let colorA = COLORS.primary;
    let colorAlphaA = COLORS.primaryAlpha;
    let colorB = COLORS.secondary;
    let colorAlphaB = COLORS.secondaryAlpha;

    if (activeStoryKey === "demo" || (codeA === "SP.POP.GROW" && codeB === "SP.URB.GROW")) {
        colorA = '#ea580c';
        colorAlphaA = 'rgba(234, 88, 12, 0.08)';
        colorB = '#f59e0b';
        colorAlphaB = 'rgba(245, 158, 11, 0.08)';
    }

    // Sincronizamos las leyendas y la correlación
    const dotA = document.querySelector(".dot-indigo");
    const dotB = document.querySelector(".dot-cyan");
    const legendItemC = document.getElementById("legend-item-c");
    const correlationPanel = document.getElementById("correlation-panel");

    if (chartLayoutType === "bubble") {
        if (dotA) dotA.style.backgroundColor = "#f97316";
        if (dotB) dotB.style.backgroundColor = "#10b981";

        const legendLabelA = document.getElementById("legend-label-a");
        if (legendLabelA) legendLabelA.textContent = "Eje X: Crecimiento del PIB (% anual)";

        const legendLabelB = document.getElementById("legend-label-b");
        if (legendLabelB) legendLabelB.textContent = "Eje Y: Tasa de Pobreza a $3.00/día (% de la población)";

        if (legendItemC) {
            legendItemC.style.display = "inline-flex";
        }
        if (correlationPanel) {
            correlationPanel.style.display = "none";
        }
    } else {
        if (dotA) dotA.style.backgroundColor = colorA;
        if (dotB) dotB.style.backgroundColor = colorB;

        const legendLabelA = document.getElementById("legend-label-a");
        if (legendLabelA) legendLabelA.textContent = getIndicatorName(indA);

        const legendLabelB = document.getElementById("legend-label-b");
        if (legendLabelB) legendLabelB.textContent = getIndicatorName(indB);

        if (legendItemC) {
            legendItemC.style.display = "none";
        }
        if (correlationPanel) {
            correlationPanel.style.display = "";
        }
    }

    // Actualizamos el título de la cabecera
    const chartDisplayTitle = document.getElementById("chart-display-title");
    if (chartDisplayTitle) {
        chartDisplayTitle.textContent =
            chartLayoutType === "bubble"
                ? "Crecimiento PIB vs. Tasa de Pobreza extrema (Burbujas)"
                : `${getIndicatorName(indA)} vs. ${getIndicatorName(indB)}`;
    }

    // Mostramos la tarjeta de la historia 1
    const insightCard = document.getElementById("chart-insight-card");
    if (insightCard) {
        if (activeStoryKey === "digital" || (codeA === "IT.NET.USER.ZS" && codeB === "EG.ELC.ACCS.ZS")) {
            insightCard.classList.add("active");
        } else {
            insightCard.classList.remove("active");
        }
    }

    // Mostramos la tarjeta de la historia 2
    const insightCardBubble = document.getElementById("chart-insight-card-bubble");
    if (insightCardBubble) {
        if (activeStoryKey === "gdp" || chartLayoutType === "bubble") {
            insightCardBubble.classList.add("active");
        } else {
            insightCardBubble.classList.remove("active");
        }
    }

    // Mostramos la tarjeta de la historia 3
    const insightCardDemo = document.getElementById("chart-insight-card-demo");
    if (insightCardDemo) {
        if (activeStoryKey === "demo" || (codeA === "SP.POP.GROW" && codeB === "SP.URB.GROW")) {
            insightCardDemo.classList.add("active");
        } else {
            insightCardDemo.classList.remove("active");
        }
    }

    // Mostramos la tarjeta de la historia 4
    const insightCardSummary = document.getElementById("chart-insight-card-summary");
    if (insightCardSummary) {
        if (activeStoryKey === "summary" || (codeA === "IT.NET.USER.ZS" && codeB === "SI.POV.DDAY")) {
            insightCardSummary.classList.add("active");
        } else {
            insightCardSummary.classList.remove("active");
        }
    }

    // Mostramos la tarjeta del hito decadal
    const cardHito = document.getElementById("chart-insight-card-hito");
    if (cardHito) {
        const activeColNode = document.querySelector(".timeline-col.active");
        if (activeColNode) {
            const decadeKey = activeColNode.getAttribute("data-decade");
            const hito = HITOS[decadeKey];
            const textHito = document.getElementById("chart-insight-text-hito");
            if (hito && textHito && hito.comment) {
                textHito.textContent = hito.comment;
                const colorsDecade = {
                    "1990": "rgba(139, 92, 246, 0.96)",
                    "2005": "rgba(14, 165, 233, 0.96)",
                    "2016": "rgba(16, 185, 129, 0.96)",
                    "2023": "rgba(234, 179, 8, 0.96)",
                    "prediction": "rgba(249, 115, 22, 0.96)"
                };
                cardHito.style.backgroundColor = colorsDecade[decadeKey] || "rgba(79, 70, 229, 0.96)";
                cardHito.style.borderLeftColor = "rgba(255, 255, 255, 0.45)";

                // Reiniciamos los estilos anteriores
                cardHito.style.left = "";
                cardHito.style.right = "";
                cardHito.style.top = "";
                cardHito.style.bottom = "";
                cardHito.style.transform = "";

                // Posicionamos la tarjeta del hito decadal
                if (decadeKey === "1990") {
                    cardHito.style.left = "40%";
                    cardHito.style.right = "auto";
                    cardHito.style.top = "auto";
                    cardHito.style.bottom = "65px";
                    cardHito.style.transform = "translateX(-50%)";
                } else if (decadeKey === "2005") {
                    cardHito.style.left = "685px";
                    cardHito.style.right = "auto";
                    cardHito.style.top = "auto";
                    cardHito.style.bottom = "70px";
                    cardHito.style.transform = "none";
                } else if (decadeKey === "2016") {
                    cardHito.style.left = "auto";
                    cardHito.style.right = "85px";
                    cardHito.style.top = "auto";
                    cardHito.style.bottom = "170px";
                    cardHito.style.transform = "none";
                } else if (decadeKey === "2023") {
                    cardHito.style.left = "185px";
                    cardHito.style.right = "auto";
                    cardHito.style.top = "315px";
                    cardHito.style.bottom = "auto";
                    cardHito.style.transform = "none";
                } else if (decadeKey === "prediction") {
                    cardHito.style.left = "calc(50% + 100px)";
                    cardHito.style.right = "auto";
                    cardHito.style.top = "auto";
                    cardHito.style.bottom = "35px";
                    cardHito.style.transform = "translateX(-50%)";
                }

                // Destacamos el hito predictivo
                if (decadeKey === "prediction") {
                    cardHito.classList.add("prediction-active");
                } else {
                    cardHito.classList.remove("prediction-active");
                }
                cardHito.classList.add("active");

                // Ocultamos las demás tarjetas
                if (insightCard) insightCard.classList.remove("active");
                if (insightCardBubble) insightCardBubble.classList.remove("active");
                if (insightCardDemo) insightCardDemo.classList.remove("active");
                if (insightCardSummary) insightCardSummary.classList.remove("active");
            } else {
                cardHito.classList.remove("active");
                cardHito.classList.remove("prediction-active");
            }
        } else {
            cardHito.classList.remove("active");
            cardHito.classList.remove("prediction-active");
        }
    }

    // Renderizamos el gráfico de burbujas
    if (chartLayoutType === "bubble") {
        renderBubbleChart(canvas);
        return;
    }

    // Renderizamos el gráfico lineal o de barras
    const filteredYears = appData.years.map(Number).filter(y => y >= startYear && y <= endYear);
    const labels = filteredYears.map(String);

    let dataValuesA = filteredYears.map(y => indA.values[String(y)]);
    let dataValuesB = filteredYears.map(y => indB.values[String(y)]);

    // Sincronizamos la correlación lineal
    const corrCoef = calculateCorrelation(dataValuesA, dataValuesB);
    const corrBadge = document.getElementById("correlation-badge");
    const valCorr = document.getElementById("val-correlation");
    const textCorr = document.getElementById("text-correlation");

    if (corrCoef !== null && !isNaN(corrCoef)) {
        valCorr.textContent = (corrCoef >= 0 ? "+" : "") + corrCoef.toFixed(2);

        corrBadge.className = "correlation-badge";
        const absVal = Math.abs(corrCoef);
        if (absVal >= 0.7) {
            if (corrCoef > 0) {
                corrBadge.classList.add("corr-strong-pos");
                textCorr.textContent = "Fuerte Positiva";
            } else {
                corrBadge.classList.add("corr-strong-neg");
                textCorr.textContent = "Fuerte Negativa";
            }
        } else if (absVal >= 0.3) {
            corrBadge.classList.add("corr-moderate");
            textCorr.textContent = "Moderada";
        } else {
            corrBadge.classList.add("corr-weak");
            textCorr.textContent = "Débil / Nula";
        }
    } else {
        valCorr.textContent = "--";
        textCorr.textContent = "Sin datos suficientes";
        corrBadge.className = "correlation-badge corr-weak";
    }

    const isSparseA = codeA.startsWith("SI.POV") || codeA === "SI.DST.FRST.20";
    const isSparseB = codeB.startsWith("SI.POV") || codeB === "SI.DST.FRST.20";

    let chartDatasets = [];

    const isDemographySingleAxis = activeStoryKey === "demo";
    // Indicadores con escala real 0–100% de población (no tasas de crecimiento ni unidades distintas)
    const POPULATION_PCT_CODES = new Set([
        "IT.NET.USER.ZS",   // Uso de Internet
        "EG.ELC.ACCS.ZS",  // Acceso a electricidad
        "SI.POV.DDAY",      // Tasa de pobreza $3/día
        "SI.POV.NAHC",      // Tasa de pobreza nacional
        "SI.DST.FRST.20",   // Participación ingresos 20% más pobre
        "TX.VAL.TECH.MF.ZS" // Exportaciones alta tecnología
    ]);
    const isSingleAxisPct =
        !isDemographySingleAxis &&
        chartLayoutType !== "bubble" &&
        POPULATION_PCT_CODES.has(indA.series_code) &&
        POPULATION_PCT_CODES.has(indB.series_code);

    if (enablePrediction) {
        const futureYears = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035];
        const futureLabels = futureYears.map(String);

        // Conectamos el histórico con la predicción
        let lastNonNullIdxA = dataValuesA.length - 1;
        while (lastNonNullIdxA >= 0 && dataValuesA[lastNonNullIdxA] === null) {
            lastNonNullIdxA--;
        }
        let lastNonNullIdxB = dataValuesB.length - 1;
        while (lastNonNullIdxB >= 0 && dataValuesB[lastNonNullIdxB] === null) {
            lastNonNullIdxB--;
        }

        const lastValA = lastNonNullIdxA >= 0 ? dataValuesA[lastNonNullIdxA] : null;
        const lastValB = lastNonNullIdxB >= 0 ? dataValuesB[lastNonNullIdxB] : null;

        // Definimos los años a proyectar
        const yearsToPredictA = [];
        for (let i = lastNonNullIdxA + 1; i < dataValuesA.length; i++) {
            yearsToPredictA.push(filteredYears[i]);
        }
        yearsToPredictA.push(...futureYears);

        const yearsToPredictB = [];
        for (let i = lastNonNullIdxB + 1; i < dataValuesB.length; i++) {
            yearsToPredictB.push(filteredYears[i]);
        }
        yearsToPredictB.push(...futureYears);

        let predValuesA = calculatePrediction(filteredYears, dataValuesA, yearsToPredictA);
        let predValuesB = calculatePrediction(filteredYears, dataValuesB, yearsToPredictB);

        const isPctA = indA.unit.includes("%") || getIndicatorUnit(indA).includes("%");
        const isPctB = indB.unit.includes("%") || getIndicatorUnit(indB).includes("%");

        if (isPctA) predValuesA = predValuesA.map(v => v !== null ? Math.min(100, Math.max(0, v)) : null);
        if (isPctB) predValuesB = predValuesB.map(v => v !== null ? Math.min(100, Math.max(0, v)) : null);

        labels.push(...futureLabels);

        const histNulls = futureYears.map(() => null);

        // Alineamos los datasets en la línea temporal
        const finalHistA = [...dataValuesA, ...histNulls];
        const finalHistB = [...dataValuesB, ...histNulls];

        const finalPredA = new Array(filteredYears.length + futureYears.length).fill(null);
        if (lastNonNullIdxA >= 0) {
            finalPredA[lastNonNullIdxA] = lastValA;
            for (let i = 0; i < yearsToPredictA.length; i++) {
                finalPredA[lastNonNullIdxA + 1 + i] = predValuesA[i];
            }
        }

        const finalPredB = new Array(filteredYears.length + futureYears.length).fill(null);
        if (lastNonNullIdxB >= 0) {
            finalPredB[lastNonNullIdxB] = lastValB;
            for (let i = 0; i < yearsToPredictB.length; i++) {
                finalPredB[lastNonNullIdxB + 1 + i] = predValuesB[i];
            }
        }

        chartDatasets.push({
            label: `${getIndicatorName(indA)} (Histórico)`,
            data: finalHistA,
            yAxisID: 'y-axis-a',
            borderColor: colorA,
            backgroundColor: chartLayoutType === 'area' ? colorAlphaA : colorA,
            borderWidth: 4.5,
            tension: 0.3,
            fill: chartLayoutType === 'area',
            spanGaps: isSparseA,
            borderDash: [],
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: colorA
        });

        chartDatasets.push({
            label: `${getIndicatorName(indA)} (Proyección)`,
            data: finalPredA,
            yAxisID: 'y-axis-a',
            borderColor: '#ef4444',
            borderWidth: 4,
            tension: 0.1,
            fill: false,
            pointRadius: 0,
            spanGaps: true
        });

        chartDatasets.push({
            label: `${getIndicatorName(indB)} (Histórico)`,
            data: finalHistB,
            yAxisID: (isDemographySingleAxis || isSingleAxisPct) ? 'y-axis-a' : 'y-axis-b',
            borderColor: colorB,
            backgroundColor: chartLayoutType === 'area' ? colorAlphaB : colorB,
            borderWidth: 4.5,
            tension: 0.3,
            fill: chartLayoutType === 'area',
            spanGaps: isSparseB,
            borderDash: [],
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: colorB
        });

        chartDatasets.push({
            label: `${getIndicatorName(indB)} (Proyección)`,
            data: finalPredB,
            yAxisID: (isDemographySingleAxis || isSingleAxisPct) ? 'y-axis-a' : 'y-axis-b',
            borderColor: '#ef4444',
            borderWidth: 4,
            tension: 0.1,
            fill: false,
            pointRadius: 0,
            spanGaps: true
        });

        // Calculamos la regresión OLS para ambos indicadores
        const allYears = [...filteredYears, ...futureYears];
        let trendA = calculatePrediction(filteredYears, dataValuesA, allYears);
        let trendB = calculatePrediction(filteredYears, dataValuesB, allYears);

        // Limitamos las tendencias OLS a 0–100 cuando la escala es compartida
        if (isSingleAxisPct) {
            trendA = trendA.map(v => v !== null ? Math.min(100, Math.max(0, v)) : null);
            trendB = trendB.map(v => v !== null ? Math.min(100, Math.max(0, v)) : null);
        }


        chartDatasets.push({
            label: `${getIndicatorName(indA)} (Regresión OLS)`,
            data: trendA,
            yAxisID: 'y-axis-a',
            borderColor: colorA,
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0,
            spanGaps: true
        });

        chartDatasets.push({
            label: `${getIndicatorName(indB)} (Regresión OLS)`,
            data: trendB,
            yAxisID: (isDemographySingleAxis || isSingleAxisPct) ? 'y-axis-a' : 'y-axis-b',
            borderColor: colorB,
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0,
            spanGaps: true
        });

    } else {
        chartDatasets.push({
            label: getIndicatorName(indA),
            data: dataValuesA,
            yAxisID: 'y-axis-a',
            borderColor: colorA,
            backgroundColor: chartLayoutType === 'area' ? colorAlphaA : colorA,
            borderWidth: 4.5,
            tension: 0.3,
            fill: chartLayoutType === 'area',
            spanGaps: isSparseA,
            borderDash: [],
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: colorA
        });

        // Calculamos la regresión lineal para la variable A
        const trendA = calculatePrediction(filteredYears, dataValuesA, filteredYears);
        chartDatasets.push({
            label: `${getIndicatorName(indA)} (Regresión)`,
            data: trendA,
            yAxisID: 'y-axis-a',
            borderColor: colorA,
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0,
            spanGaps: true
        });

        chartDatasets.push({
            label: getIndicatorName(indB),
            data: dataValuesB,
            yAxisID: (isDemographySingleAxis || isSingleAxisPct) ? 'y-axis-a' : 'y-axis-b',
            borderColor: colorB,
            backgroundColor: chartLayoutType === 'area' ? colorAlphaB : colorB,
            borderWidth: 4.5,
            tension: 0.3,
            fill: chartLayoutType === 'area',
            spanGaps: isSparseB,
            borderDash: [],
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: colorB
        });

        // Calculamos la regresión lineal para la variable B
        const trendB = calculatePrediction(filteredYears, dataValuesB, filteredYears);
        chartDatasets.push({
            label: `${getIndicatorName(indB)} (Regresión)`,
            data: trendB,
            yAxisID: (isDemographySingleAxis || isSingleAxisPct) ? 'y-axis-a' : 'y-axis-b',
            borderColor: colorB,
            borderWidth: 2.5,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0,
            spanGaps: true
        });
    }

    const typeMapping = chartLayoutType === 'bar' ? 'bar' : 'line';

    const chartScales = {
        x: {
            grid: { color: COLORS.gridColor, borderColor: COLORS.gridColor },
            ticks: { color: COLORS.titleColor, font: { family: 'Inter', size: 11, weight: '600' } }
        },
        'y-axis-a': {
            type: 'linear',
            position: 'left',
            grid: { color: COLORS.gridColor, borderColor: COLORS.gridColor },
            ticks: { color: colorA, font: { family: 'Inter', size: 11, weight: '700' } },
            title: {
                display: true,
                text: getIndicatorUnit(indA),
                color: colorA,
                font: { family: 'Outfit', size: 12, weight: 'bold' }
            }
        }
    };

    // Definimos los indicadores con valores negativos permitidos
    const canBeNegative = ["NY.GDP.MKTP.KD.ZG", "SP.POP.GROW", "SP.URB.GROW"];

    // Forzamos el mínimo a cero si no admite valores negativos
    if (!canBeNegative.includes(indA.series_code)) {
        chartScales['y-axis-a'].min = 0;
    }

    // Cuando ambos son % de población: eje único 0–100%, color neutro
    if (isSingleAxisPct) {
        chartScales['y-axis-a'].max = 100;
        chartScales['y-axis-a'].ticks.color = COLORS.titleColor;
        chartScales['y-axis-a'].title.text = '% de la población';
        chartScales['y-axis-a'].title.color = COLORS.titleColor;
    }

    if (!isDemographySingleAxis && !isSingleAxisPct) {
        chartScales['y-axis-b'] = {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false, borderColor: COLORS.gridColor },
            ticks: { color: colorB, font: { family: 'Inter', size: 11, weight: '700' } },
            title: {
                display: true,
                text: getIndicatorUnit(indB),
                color: colorB,
                font: { family: 'Outfit', size: 12, weight: 'bold' }
            }
        };

        if (!canBeNegative.includes(indB.series_code)) {
            chartScales['y-axis-b'].min = 0;
        }
    }

    const ctx = canvas.getContext('2d');
    mainChartInstance = new Chart(ctx, {
        type: typeMapping,
        data: {
            labels: labels,
            datasets: chartDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#0f172a',
                    bodyColor: '#334155',
                    titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Inter', size: 12 },
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            const datasetLabel = context.dataset.label || '';
                            const val = context.raw;
                            const isA = context.datasetIndex === 0 || context.datasetIndex === 1;
                            const unit = (isDemographySingleAxis || isA) ? getIndicatorUnit(indA) : getIndicatorUnit(indB);

                            if (val === null || val === undefined) {
                                return `${datasetLabel}: Sin medición oficial`;
                            }

                            if (val >= 1000000000) {
                                return `${datasetLabel}: ${(val / 1000000000).toFixed(3)} miles de millones (${unit})`;
                            } else if (val >= 1000000) {
                                return `${datasetLabel}: ${(val / 1000000).toFixed(1)} M (${unit})`;
                            }

                            return `${datasetLabel}: ${val.toFixed(2)} ${unit}`;
                        }
                    }
                }
            },
            scales: chartScales
        }
    });
}

// Renderizamos el gráfico de burbujas decadal
function renderBubbleChart(canvas) {
    const indGDP = appData.indicators.find(i => i.series_code === "NY.GDP.MKTP.KD.ZG");
    const indPov = appData.indicators.find(i => i.series_code === "SI.POV.DDAY");
    const indPop = appData.indicators.find(i => i.series_code === "SP.POP.TOTL");

    // Interpolamos los valores para los años sin encuestas
    function getInterpolatedPoverty(yearStr) {
        const known = [
            { y: 1993, v: 47.5 },
            { y: 2004, v: 46.4 },
            { y: 2009, v: 34.6 },
            { y: 2011, v: 27.1 },
            { y: 2022, v: 5.3 }
        ];
        const target = parseInt(yearStr);
        if (target <= 1993) return 47.5;
        if (target >= 2022) return 5.3;

        for (let i = 0; i < known.length - 1; i++) {
            const p1 = known[i];
            const p2 = known[i + 1];
            if (target >= p1.y && target <= p2.y) {
                const ratio = (target - p1.y) / (p2.y - p1.y);
                return p1.v + ratio * (p2.v - p1.v);
            }
        }
        return 5.3;
    }

    // Definimos los 10 hitos secuenciales cada 3 años
    const surveyYears = ["1993", "1996", "1999", "2002", "2005", "2008", "2011", "2014", "2017", "2022"];

    // Definimos los colores cromáticos para cada década
    const bubbleColors = [
        "rgba(249, 115, 22, 0.65)",
        "rgba(249, 140, 22, 0.65)",
        "rgba(245, 158, 11, 0.65)",
        "rgba(234, 179, 8, 0.65)",
        "rgba(200, 204, 22, 0.65)",
        "rgba(132, 204, 22, 0.65)",
        "rgba(74, 222, 128, 0.65)",
        "rgba(34, 197, 94, 0.65)",
        "rgba(16, 185, 129, 0.65)",
        "rgba(4, 120, 87, 0.7)"
    ];

    const bubbleBorderColors = [
        "#f97316", "#f98c16", "#f59e0b", "#eab308", "#c8cc16", "#84cc16", "#4ade80", "#22c55e", "#10b981", "#047857"
    ];

    const bubblePoints = surveyYears.map((year, idx) => {
        const xVal = indGDP.values[year];
        const yVal = getInterpolatedPoverty(year);
        const popVal = indPop.values[year];

        // Escalamos las burbujas por la población
        const rVal = 8 + (popVal / 1000000) / 20;

        return {
            x: xVal,
            y: yVal,
            r: rVal,
            year: year,
            population: popVal,
            color: bubbleColors[idx],
            borderColor: bubbleBorderColors[idx]
        };
    });

    const bubbleDatasets = bubblePoints.map(pt => {
        return {
            label: `Año ${pt.year}`,
            data: [{ x: pt.x, y: pt.y, r: pt.r }],
            backgroundColor: pt.color,
            borderColor: pt.borderColor,
            borderWidth: 2,
            hoverBackgroundColor: pt.color,
            hoverBorderWidth: 3
        };
    });

    const yearLabelsPlugin = {
        id: 'yearLabels',
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            ctx.save();
            chart.data.datasets.forEach((dataset, idx) => {
                const meta = chart.getDatasetMeta(idx);
                if (meta.hidden) return;

                meta.data.forEach((element) => {
                    const { x, y } = element.tooltipPosition();
                    const year = surveyYears[idx];

                    // Dibujamos la etiqueta del año dentro de la burbuja
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px Outfit, Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // Aplicamos una sombra de texto para mayor contraste
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                    ctx.shadowBlur = 4;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1.5;

                    ctx.fillText(year, x, y);
                });
            });
            ctx.restore();
        }
    };

    document.getElementById("correlation-badge").className = "correlation-badge corr-weak";
    document.getElementById("val-correlation").textContent = "--";
    document.getElementById("text-correlation").textContent = "N/A en Burbujas";

    const ctx = canvas.getContext('2d');
    mainChartInstance = new Chart(ctx, {
        type: 'bubble',
        data: {
            datasets: bubbleDatasets
        },
        plugins: [yearLabelsPlugin], // Registramos el plugin de etiquetas
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Ocultamos la leyenda
                },
                tooltip: {
                    backgroundColor: '#ffffff',
                    titleColor: '#0f172a',
                    bodyColor: '#334155',
                    titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
                    bodyFont: { family: 'Inter', size: 12 },
                    borderColor: '#e2e8f0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function (context) {
                            const datasetIndex = context[0].datasetIndex;
                            return `Perfil de Desarrollo - Año ${surveyYears[datasetIndex]}`;
                        },
                        label: function (context) {
                            const pt = bubblePoints[context.datasetIndex];
                            return [
                                `Crecimiento PIB: ${pt.x.toFixed(2)}% anual`,
                                `Tasa de Pobreza ($3.00/día): ${pt.y.toFixed(1)}% de pob.`,
                                `Población Total: ${(pt.population / 1000000).toFixed(1)} M (Tamaño)`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: COLORS.gridColor, borderColor: COLORS.gridColor },
                    ticks: { color: COLORS.titleColor, font: { family: 'Inter', size: 11, weight: '600' } },
                    title: {
                        display: true,
                        text: 'Crecimiento del PIB (% anual)',
                        color: COLORS.titleColor,
                        font: { family: 'Outfit', size: 12, weight: 'bold' }
                    },
                    // Ajustamos los límites de la escala X
                    min: 2,
                    max: 10
                },
                y: {
                    grid: { color: COLORS.gridColor, borderColor: COLORS.gridColor },
                    ticks: { color: COLORS.titleColor, font: { family: 'Inter', size: 11, weight: '600' } },
                    title: {
                        display: true,
                        text: 'Tasa de Pobreza a $3.00/día (% de la población)',
                        color: COLORS.titleColor,
                        font: { family: 'Outfit', size: 12, weight: 'bold' }
                    },
                    min: 0,
                    max: 55
                }
            }
        }
    });
}
