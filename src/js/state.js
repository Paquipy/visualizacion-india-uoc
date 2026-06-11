// Gestionamos el estado global y los paneles modales
let appData = null;
let mainChartInstance = null;
let sparklinesInstances = {};
let activeStoryKey = "digital";

// Abrimos el explorador libre y activamos el fondo difuminado
function openExplorerDrawer() {
    const drawer = document.getElementById("explorer-controls-panel");
    const backdrop = document.getElementById("drawer-backdrop");
    const btnOpen = document.getElementById("btn-open-explorer");

    if (drawer) drawer.classList.add("open");
    if (backdrop) backdrop.classList.add("active");

    // Sincronizamos los estilos de los botones
    document.querySelectorAll(".story-btn").forEach(btn => btn.classList.remove("active"));
    if (btnOpen) btnOpen.classList.add("active");

    // Activamos los controles del panel
    if (drawer) drawer.classList.remove("inactive-panel");
}

// Cerramos el explorador libre y desactivamos el fondo
function closeExplorerDrawer() {
    const drawer = document.getElementById("explorer-controls-panel");
    const backdrop = document.getElementById("drawer-backdrop");
    const btnOpen = document.getElementById("btn-open-explorer");

    if (drawer) drawer.classList.remove("open");
    if (backdrop) backdrop.classList.remove("active");

    if (btnOpen) btnOpen.classList.remove("active");
}

// Desactivamos la historia activa y restauramos el panel del explorador
function deactivateStoryHighlight() {
    document.querySelectorAll(".story-btn").forEach(btn => btn.classList.remove("active"));

    const drawer = document.getElementById("explorer-controls-panel");
    if (drawer && drawer.classList.contains("open")) {
        const btnOpen = document.getElementById("btn-open-explorer");
        if (btnOpen) btnOpen.classList.add("active");
    }

    const explorerPanel = document.getElementById("explorer-controls-panel");
    if (explorerPanel) {
        if (!explorerPanel.classList.contains("open")) {
            explorerPanel.classList.remove("inactive-panel");
        }
    }

    const narrativeCard = document.getElementById("interactive-narrative-card");
    if (narrativeCard) narrativeCard.classList.remove("active-story-glow");

    const timelineHitos = document.getElementById("timeline-hitos");
    if (timelineHitos) timelineHitos.classList.remove("has-active");

    document.querySelectorAll(".timeline-col").forEach(c => c.classList.remove("active"));

    activeStoryKey = null;

    // Sincronizamos el stepper en modo atenuado
    if (typeof updateStepperUI === "function") {
        updateStepperUI(null);
    }
}
