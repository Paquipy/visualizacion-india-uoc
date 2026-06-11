// Inicializamos la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
});

// Cargamos los datos e inicializamos los componentes
async function loadDashboardData() {
    const loader = document.getElementById("chart-loading-indicator");
    if (loader) loader.classList.add("active");

    try {
        const response = await fetch("../data/processed/india_data.json");
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        appData = await response.json();
    } catch (error) {
        // Cargamos la base de datos estática de respaldo en caso de fallo
        console.warn("Fetch falló. Cargando base de datos estática incorporada:", error);
        if (typeof INDIA_DATA !== 'undefined') {
            appData = INDIA_DATA;
        } else {
            console.error("Error al cargar los datos de la India:", error);
            alert("Ocurrió un problema al cargar los datos históricos. Asegúrate de servir el proyecto con un servidor local (ej. Live Server, Python http.server) para permitir peticiones HTTP locales.");
            if (loader) loader.classList.remove("active");
            return;
        }
    }

    try {
        // Inicializamos los componentes de la interfaz
        populateSelectors();
        initializeKPICards();
        setupEventListeners();

        // Lanzamos la historia inicial por defecto
        triggerStory("digital");
    } catch (err) {
        console.error("Error al inicializar los componentes:", err);
    } finally {
        if (loader) loader.classList.remove("active");
    }
}

// Llenamos dinámicamente los selectores
function populateSelectors() {
    const selectA = document.getElementById("select-indicator-a");
    const selectB = document.getElementById("select-indicator-b");

    if (!selectA || !selectB || !appData) return;

    selectA.innerHTML = "";
    selectB.innerHTML = "";

    appData.indicators.forEach(ind => {
        const optionA = document.createElement("option");
        optionA.value = ind.series_code;
        optionA.textContent = getIndicatorName(ind);
        selectA.appendChild(optionA);

        const optionB = document.createElement("option");
        optionB.value = ind.series_code;
        optionB.textContent = getIndicatorName(ind);
        selectB.appendChild(optionB);
    });
}

// Inicializamos los minigráficos (sparklines)
function initializeKPICards() {
    if (!appData) return;

    // Población Total
    const popInd = appData.indicators.find(i => i.series_code === "SP.POP.TOTL");
    if (popInd) {
        createSparkline("sparkline-pop", popInd, COLORS.primary);
    }

    // PIB Promedio
    const gdpInd = appData.indicators.find(i => i.series_code === "NY.GDP.MKTP.KD.ZG");
    if (gdpInd) {
        createSparkline("sparkline-gdp", gdpInd, COLORS.accent);
    }

    // Internet
    const netInd = appData.indicators.find(i => i.series_code === "IT.NET.USER.ZS");
    if (netInd) {
        createSparkline("sparkline-internet", netInd, COLORS.secondary);
    }

    // Electricidad
    const elcInd = appData.indicators.find(i => i.series_code === "EG.ELC.ACCS.ZS");
    if (elcInd) {
        createSparkline("sparkline-elect", elcInd, '#f59e0b');
    }
}

// Configuramos los escuchas de eventos
function setupEventListeners() {
    // Escuchamos los cambios en los selectores del explorador libre
    document.getElementById("select-indicator-a").addEventListener("change", () => {
        deactivateStoryHighlight();
        updateMainChart();
    });
    document.getElementById("select-indicator-b").addEventListener("change", () => {
        deactivateStoryHighlight();
        updateMainChart();
    });

    // Escuchamos el cambio de tipo de gráfico
    document.querySelectorAll(".chart-type-toggle button").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".chart-type-toggle button").forEach(b => b.classList.remove("active"));
            e.target.classList.add("active");
            deactivateStoryHighlight();
            updateMainChart();
        });
    });

    // Escuchamos los controles del stepper interactivo
    const btnStoryPrev = document.getElementById("btn-story-prev");
    if (btnStoryPrev) {
        btnStoryPrev.addEventListener("click", () => {
            const STORY_KEYS = ["digital", "gdp", "demo", "summary"];
            let activeIdx = STORY_KEYS.indexOf(activeStoryKey);
            if (activeIdx === -1) {
                triggerStory("digital");
            } else if (activeIdx > 0) {
                triggerStory(STORY_KEYS[activeIdx - 1]);
            }
        });
    }

    const btnStoryNext = document.getElementById("btn-story-next");
    if (btnStoryNext) {
        btnStoryNext.addEventListener("click", () => {
            const STORY_KEYS = ["digital", "gdp", "demo", "summary"];
            let activeIdx = STORY_KEYS.indexOf(activeStoryKey);
            if (activeIdx === -1) {
                triggerStory("digital");
            } else if (activeIdx < STORY_KEYS.length - 1) {
                triggerStory(STORY_KEYS[activeIdx + 1]);
            }
        });
    }

    // Escuchamos los clics directos en los pasos del stepper
    document.querySelectorAll(".step-indicators .step-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
            const dotNode = e.currentTarget;
            const storyKey = dotNode.getAttribute("data-story");
            if (storyKey) {
                triggerStory(storyKey);
            }
        });
    });

    // Escuchamos la apertura del explorador libre
    const btnOpenExplorer = document.getElementById("btn-open-explorer");
    if (btnOpenExplorer) {
        btnOpenExplorer.addEventListener("click", () => {
            openExplorerDrawer();
        });
    }

    // Escuchamos el cierre del explorador libre
    const btnCloseExplorer = document.getElementById("btn-close-explorer");
    if (btnCloseExplorer) {
        btnCloseExplorer.addEventListener("click", () => {
            closeExplorerDrawer();
        });
    }

    const drawerBackdrop = document.getElementById("drawer-backdrop");
    if (drawerBackdrop) {
        drawerBackdrop.addEventListener("click", () => {
            closeExplorerDrawer();
        });
    }

    // Escuchamos el conmutador de proyecciones futuras
    document.getElementById("btn-toggle-prediction").addEventListener("change", () => {
        updateMainChart();
    });

    // Escuchamos los deslizadores de rango temporal
    const sliderStart = document.getElementById("slider-start-year");
    const sliderEnd = document.getElementById("slider-end-year");

    sliderStart.addEventListener("input", handleSliderChange);
    sliderEnd.addEventListener("input", handleSliderChange);

    // Escuchamos los clics en la línea de tiempo decadal
    document.querySelectorAll(".timeline-col").forEach(col => {
        col.addEventListener("click", (e) => {
            const decadeKey = e.currentTarget.getAttribute("data-decade");
            triggerHito(decadeKey);
        });
    });
}

// Gestionamos el cambio del rango temporal
function handleSliderChange() {
    const sliderStart = document.getElementById("slider-start-year");
    const sliderEnd = document.getElementById("slider-end-year");
    const labelRange = document.getElementById("timeline-range-val");
    const track = document.getElementById("slider-bar-track");

    let valStart = parseInt(sliderStart.value);
    let valEnd = parseInt(sliderEnd.value);

    if (valStart >= valEnd - 3) {
        if (this.id === "slider-start-year") {
            sliderStart.value = valEnd - 3;
            valStart = valEnd - 3;
        } else {
            sliderEnd.value = valStart + 3;
            valEnd = valStart + 3;
        }
    }

    labelRange.textContent = `${valStart} - ${valEnd}`;

    const minVal = parseInt(sliderStart.min);
    const maxVal = parseInt(sliderStart.max);
    const pctStart = ((valStart - minVal) / (maxVal - minVal)) * 100;
    const pctEnd = ((valEnd - minVal) / (maxVal - minVal)) * 100;

    track.style.left = `${pctStart}%`;
    track.style.width = `${pctEnd - pctStart}%`;

    deactivateStoryHighlight();
    updateMainChart();
}

// Activamos la historia guiada seleccionada
function triggerStory(storyKey) {
    const story = STORIES[storyKey];
    if (!story || !appData) return;

    closeExplorerDrawer();

    activeStoryKey = storyKey;

    // Sincronizamos las pestañas y los controles
    document.querySelectorAll(".story-btn").forEach(btn => btn.classList.remove("active"));
    const activeTab = document.querySelector(`.story-btn[data-story="${storyKey}"]`);
    if (activeTab) activeTab.classList.add("active");

    const explorerPanel = document.getElementById("explorer-controls-panel");
    if (explorerPanel) explorerPanel.classList.add("inactive-panel");

    const narrativeCard = document.getElementById("interactive-narrative-card");
    if (narrativeCard) narrativeCard.classList.add("active-story-glow");
    const timelineHitos = document.getElementById("timeline-hitos");
    if (timelineHitos) timelineHitos.classList.remove("has-active");

    document.querySelectorAll(".timeline-col").forEach(c => c.classList.remove("active"));

    // Actualizamos los textos descriptivos
    const badgeLabel = document.getElementById("narrative-badge-label");
    if (badgeLabel) badgeLabel.textContent = story.badge;

    const titleLabel = document.getElementById("narrative-title");
    if (titleLabel) titleLabel.textContent = story.title;

    const textLabel = document.getElementById("narrative-text");
    if (textLabel) textLabel.textContent = story.text;
    document.getElementById("select-indicator-a").value = story.indicatorA;
    document.getElementById("select-indicator-b").value = story.indicatorB;

    document.querySelectorAll(".chart-type-toggle button").forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-type") === story.chartType) {
            b.classList.add("active");
        }
    });
    const sliderStart = document.getElementById("slider-start-year");
    const sliderEnd = document.getElementById("slider-end-year");
    sliderStart.value = story.startYear;
    sliderEnd.value = story.endYear;

    const labelRange = document.getElementById("timeline-range-val");
    labelRange.textContent = `${story.startYear} - ${story.endYear}`;

    const track = document.getElementById("slider-bar-track");
    const minVal = parseInt(sliderStart.min);
    const maxVal = parseInt(sliderStart.max);
    const pctStart = ((story.startYear - minVal) / (maxVal - minVal)) * 100;
    const pctEnd = ((story.endYear - minVal) / (maxVal - minVal)) * 100;
    track.style.left = `${pctStart}%`;
    track.style.width = `${pctEnd - pctStart}%`;

    document.getElementById("btn-toggle-prediction").checked = story.enablePrediction || false;

    updateMainChart();

    updateStepperUI(storyKey);
}

// Sincronizamos el stepper
function updateStepperUI(storyKey) {
    const STORY_KEYS = ["digital", "gdp", "demo", "summary"];
    const dots = document.querySelectorAll(".step-indicators .step-dot");
    const lines = document.querySelectorAll(".step-indicators .step-line");
    const btnPrev = document.getElementById("btn-story-prev");
    const btnNext = document.getElementById("btn-story-next");

    if (!storyKey) {
        dots.forEach(dot => dot.classList.remove("active"));
        lines.forEach(line => line.classList.remove("active"));
        if (btnPrev) btnPrev.disabled = false;
        if (btnNext) btnNext.disabled = false;
        return;
    }

    const activeIdx = STORY_KEYS.indexOf(storyKey);

    dots.forEach((dot, idx) => {
        if (idx <= activeIdx) {
            dot.classList.add("active");
        } else {
            dot.classList.remove("active");
        }
    });

    lines.forEach((line, idx) => {
        if (idx < activeIdx) {
            line.classList.add("active");
        } else {
            line.classList.remove("active");
        }
    });

    if (btnPrev) btnPrev.disabled = (activeIdx === 0);
    if (btnNext) btnNext.disabled = (activeIdx === STORY_KEYS.length - 1);
}

// Activamos el hito decadal seleccionado
function triggerHito(decadeKey) {
    const hito = HITOS[decadeKey];
    if (!hito || !appData) return;

    closeExplorerDrawer();
    deactivateStoryHighlight();

    // Sincronizamos los elementos de la línea de tiempo
    const timelineHitos = document.getElementById("timeline-hitos");
    if (timelineHitos) timelineHitos.classList.add("has-active");

    const colId = decadeKey === "prediction" ? "col-decade-2030" : `col-decade-${decadeKey}`;
    const activeColNode = document.getElementById(colId);
    if (activeColNode) activeColNode.classList.add("active");
    const selectA = document.getElementById("select-indicator-a");
    if (selectA) selectA.value = hito.indicatorA;
    const selectB = document.getElementById("select-indicator-b");
    if (selectB) selectB.value = hito.indicatorB;
    const sliderStart = document.getElementById("slider-start-year");
    const sliderEnd = document.getElementById("slider-end-year");
    if (sliderStart) sliderStart.value = hito.startYear;
    if (sliderEnd) sliderEnd.value = hito.endYear;

    const labelRange = document.getElementById("timeline-range-val");
    if (labelRange) labelRange.textContent = `${hito.startYear} - ${hito.endYear}`;

    const track = document.getElementById("slider-bar-track");
    if (track && sliderStart) {
        const minVal = parseInt(sliderStart.min);
        const maxVal = parseInt(sliderStart.max);
        const pctStart = ((hito.startYear - minVal) / (maxVal - minVal)) * 100;
        const pctEnd = ((hito.endYear - minVal) / (maxVal - minVal)) * 100;
        track.style.left = `${pctStart}%`;
        track.style.width = `${pctEnd - pctStart}%`;
    }
    const btnPrediction = document.getElementById("btn-toggle-prediction");
    if (btnPrediction) btnPrediction.checked = hito.enablePrediction;

    // Actualizamos la tarjeta narrativa
    const narrativeCard = document.getElementById("interactive-narrative-card");
    if (narrativeCard) {
        narrativeCard.classList.add("active-story-glow");

        const badgeLabel = document.getElementById("narrative-badge-label");
        if (badgeLabel) badgeLabel.textContent = decadeKey === "prediction" ? "SIMULACIÓN" : `⚡ DÉCADA ${decadeKey}s`;

        const titleLabel = document.getElementById("narrative-title");
        if (titleLabel) titleLabel.textContent = hito.title;

        const textLabel = document.getElementById("narrative-text");
        if (textLabel) textLabel.textContent = hito.desc;
    }

    document.querySelectorAll(".chart-type-toggle button").forEach(b => {
        b.classList.remove("active");
        if (b.getAttribute("data-type") === "line") {
            b.classList.add("active");
        }
    });

    updateMainChart();
}
