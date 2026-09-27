/* ============================================================
   ZENTRO GAME ENGINE V4
   Main JavaScript
   ============================================================ */

"use strict";

/* ============================================================
   VARIABLES GLOBALES
============================================================ */

let currentPage = "create";
let currentProject = null;
let buildRunning = false;

let scene = null;
let camera = null;
let renderer = null;
let animationFrame = null;

let playerCar = null;
let carWheels = [];
let worldObjects = [];

let gameStarted = false;
let gamePaused = false;

let keys = {};

let carSpeed = 0;
let carRotation = 0;

let cameraYaw = 0;
let cameraPitch = 0.35;

let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;

let clock = null;
let fpsFrames = 0;
let fpsLastTime = performance.now();

let threeReady = false;


/* ============================================================
   DOM HELPER
============================================================ */

function $(id) {
    return document.getElementById(id);
}


/* ============================================================
   BOOT
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    startBoot();

});


function startBoot() {

    const progress = $("bootProgress");
    const status = $("bootStatus");

    let value = 0;

    const messages = [
        "Initialisation de ZENTRO...",
        "Chargement du Game Director...",
        "Initialisation des agents IA...",
        "Chargement du Realism Engine...",
        "Préparation du moteur 3D...",
        "Système prêt."
    ];

    let step = 0;

    const timer = setInterval(() => {

        value += 20;

        if (progress) {
            progress.style.width = `${Math.min(value, 100)}%`;
        }

        if (status) {
            status.textContent =
                messages[Math.min(step, messages.length - 1)];
        }

        step++;

        if (value >= 100) {

            clearInterval(timer);

            setTimeout(() => {

                const boot = $("bootScreen");
                const app = $("app");

                if (boot) {
                    boot.classList.add("hidden");
                }

                if (app) {
                    app.classList.remove("hidden");
                }

                initializeApplication();

            }, 400);

        }

    }, 250);

}


/* ============================================================
   INITIALISATION
============================================================ */

function initializeApplication() {

    setupNavigation();
    setupQuickPrompts();
    setupControls();
    setupCreateSystem();
    setupSettings();

    updateRealismValue();
    renderAgents();
    renderRealismDashboard();
    renderProjects();

    checkThreeJS();

}


/* ============================================================
   THREE.JS CHECK
============================================================ */

function checkThreeJS() {

    if (typeof THREE !== "undefined") {

        threeReady = true;

        console.log(
            "ZENTRO : Three.js disponible - revision",
            THREE.REVISION
        );

        updateRuntimeStatus(
            "Moteur 3D prêt"
        );

    } else {

        threeReady = false;

        console.error(
            "ZENTRO : Three.js non disponible."
        );

        updateRuntimeStatus(
            "Three.js indisponible"
        );

    }

}


/* ============================================================
   NAVIGATION
============================================================ */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".nav-item");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            navigateTo(page);

        });

    });

}


function navigateTo(page) {

    currentPage = page;

    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.page === page
            );

        });


    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active-page"
            );

        });


    const target =
        $("page-" + page);

    if (target) {

        target.classList.add(
            "active-page"
        );

    }


    const titles = {

        create: "Créer un jeu",
        preview: "Game Preview",
        projects: "Mes projets",
        agents: "Agents IA",
        realism: "Realism Engine",
        settings: "Paramètres"

    };


    const title =
        $("pageTitle");

    if (title) {

        title.textContent =
            titles[page] || "ZENTRO";

    }


    if (page === "preview") {

        setTimeout(() => {

            initializeGame3D();

        }, 100);

    }

}


/* ============================================================
   QUICK PROMPTS
============================================================ */

function setupQuickPrompts() {

    document
        .querySelectorAll(".quick-prompt")
        .forEach(button => {

            button.addEventListener("click", () => {

                const prompt =
                    button.dataset.prompt;

                const textarea =
                    $("gamePrompt");

                if (textarea) {

                    textarea.value =
                        prompt;

                    textarea.focus();

                }

            });

        });

}


/* ============================================================
   CONTROLS UI
============================================================ */

function setupControls() {

    const realism =
        $("realism");

    if (realism) {

        realism.addEventListener(
            "input",
            updateRealismValue
        );

    }


    const launch =
        $("launchGameButton");

    if (launch) {

        launch.addEventListener(
            "click",
            launchGame
        );

    }


    const reset =
        $("resetGameButton");

    if (reset) {

        reset.addEventListener(
            "click",
            resetGame
        );

    }


    const fullscreen =
        $("fullscreenGameButton");

    if (fullscreen) {

        fullscreen.addEventListener(
            "click",
            toggleFullscreen
        );

    }

}


/* ============================================================
   REALISM SLIDER
============================================================ */

function updateRealismValue() {

    const slider =
        $("realism");

    const value =
        $("realismValue");

    if (!slider || !value) {
        return;
    }

    value.textContent =
        slider.value + "%";

}


/* ============================================================
   CREATE SYSTEM
============================================================ */

function setupCreateSystem() {

    const analyze =
        $("analyzeButton");

    if (analyze) {

        analyze.addEventListener(
            "click",
            analyzeGameIdea
        );

    }


    const edit =
        $("editButton");

    if (edit) {

        edit.addEventListener(
            "click",
            () => {

                const panel =
                    $("approvalPanel");

                if (panel) {
                    panel.classList.add("hidden");
                }

            }
        );

    }


    const generate =
        $("generateButton");

    if (generate) {

        generate.addEventListener(
            "click",
            startGeneration
        );

    }

}


/* ============================================================
   ANALYSE DE L'IDÉE
============================================================ */

function analyzeGameIdea() {

    const prompt =
        $("gamePrompt");

    if (!prompt) {
        return;
    }

    const text =
        prompt.value.trim();


    if (!text) {

        showUnderstanding(
            "Écris d'abord une description de ton jeu."
        );

        return;

    }


    const status =
        $("understandingStatus");

    if (status) {

        status.textContent =
            "Analyse en cours...";

    }


    const content =
        $("understandingContent");

    if (content) {

        content.innerHTML = `
            <div class="analysis-loading">
                <div class="empty-icon">✦</div>
                <p>ZENTRO analyse ta vision...</p>
            </div>
        `;

    }


    setTimeout(() => {

        const data =
            analyzePrompt(text);

        currentProject = {

            id: Date.now(),

            prompt: text,

            title:
                generateGameTitle(text),

            platform:
                getValue("platform", "web"),

            dimension:
                getValue("dimension", "3d"),

            priority:
                getValue("priority", "realism"),

            realism:
                getValue("realism", "90"),

            analysis:
                data,

            createdAt:
                new Date().toLocaleString("fr-FR")

        };


        displayAnalysis(
            currentProject
        );


        const approval =
            $("approvalPanel");

        if (approval) {

            approval.classList.remove(
                "hidden"
            );

        }


        const specification =
            $("projectSpecification");

        if (specification) {

            specification.classList.remove(
                "hidden"
            );

        }


        renderSpecification(
            currentProject
        );


    }, 700);

}


/* ============================================================
   ANALYSE DU PROMPT
============================================================ */

function analyzePrompt(text) {

    const lower =
        text.toLowerCase();


    const features = [];


    if (
        lower.includes("voiture") ||
        lower.includes("automobile") ||
        lower.includes("conduite") ||
        lower.includes("course")
    ) {

        features.push(
            "Système de véhicules"
        );

    }


    if (
        lower.includes("ville") ||
        lower.includes("urbain") ||
        lower.includes("monde ouvert") ||
        lower.includes("open world")
    ) {

        features.push(
            "Monde ouvert"
        );

    }


    if (
        lower.includes("npc") ||
        lower.includes("pnj") ||
        lower.includes("trafic") ||
        lower.includes("population")
    ) {

        features.push(
            "PNJ et trafic"
        );

    }


    if (
        lower.includes("météo") ||
        lower.includes("pluie") ||
        lower.includes("orage")
    ) {

        features.push(
            "Météo dynamique"
        );

    }


    if (
        lower.includes("jour") ||
        lower.includes("nuit")
    ) {

        features.push(
            "Cycle jour/nuit"
        );

    }


    if (
        lower.includes("mission") ||
        lower.includes("livraison")
    ) {

        features.push(
            "Système de missions"
        );

    }


    if (
        lower.includes("garage") ||
        lower.includes("tuning") ||
        lower.includes("personnalisation")
    ) {

        features.push(
            "Garage et personnalisation"
        );

    }


    if (
        lower.includes("réaliste") ||
        lower.includes("realiste") ||
        lower.includes("réalisme")
    ) {

        features.push(
            "Réalisme avancé"
        );

    }


    if (features.length === 0) {

        features.push(
            "Gameplay personnalisé"
        );

    }


    return {

        summary:
            "ZENTRO a identifié la direction générale de ton jeu et va construire une base cohérente autour de ta vision.",

        features: features,

        world:
            detectWorldType(lower),

        gameplay:
            detectGameplay(lower),

        technical:
            detectTechnical(lower)

    };

}


/* ============================================================
   DETECTIONS
============================================================ */

function detectWorldType(text) {

    if (
        text.includes("ville") ||
        text.includes("urbain")
    ) {

        return "Environnement urbain 3D";

    }

    if (
        text.includes("campagne") ||
        text.includes("rural")
    ) {

        return "Environnement rural";

    }

    if (
        text.includes("île") ||
        text.includes("ile") ||
        text.includes("tropical")
    ) {

        return "Île / environnement tropical";

    }

    return "Monde 3D personnalisé";

}


function detectGameplay(text) {

    if (
        text.includes("course")
    ) {

        return "Course et conduite";

    }

    if (
        text.includes("exploration")
    ) {

        return "Exploration libre";

    }

    if (
        text.includes("mission")
    ) {

        return "Missions et progression";

    }

    return "Gameplay libre";

}


function detectTechnical(text) {

    const result = [];

    result.push(
        "Moteur 3D temps réel"
    );

    result.push(
        "Système de caméra troisième personne"
    );

    result.push(
        "Éclairage dynamique"
    );

    result.push(
        "Architecture évolutive"
    );

    return result;

}


/* ============================================================
   DISPLAY ANALYSIS
============================================================ */

function displayAnalysis(project) {

    const status =
        $("understandingStatus");

    if (status) {

        status.textContent =
            "Vision comprise";

    }


    const content =
        $("understandingContent");

    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="analysis-result">

            <div class="analysis-block">

                <strong>
                    🎯 Vision comprise
                </strong>

                <p>
                    ${escapeHTML(
                        project.analysis.summary
                    )}
                </p>

            </div>


            <div class="analysis-grid">


                <div class="analysis-card">

                    <span>
                        Monde
                    </span>

                    <strong>
                        ${escapeHTML(
                            project.analysis.world
                        )}
                    </strong>

                </div>


                <div class="analysis-card">

                    <span>
                        Gameplay
                    </span>

                    <strong>
                        ${escapeHTML(
                            project.analysis.gameplay
                        )}
                    </strong>

                </div>


                <div class="analysis-card">

                    <span>
                        Plateforme
                    </span>

                    <strong>
                        ${escapeHTML(
                            project.platform
                        ).toUpperCase()}
                    </strong>

                </div>


                <div class="analysis-card">

                    <span>
                        Réalisme
                    </span>

                    <strong>
                        ${project.realism}%
                    </strong>

                </div>


            </div>


            <div class="feature-list">

                <strong>
                    Systèmes identifiés
                </strong>

                ${project.analysis.features
                    .map(
                        item =>
                            `<span>${escapeHTML(item)}</span>`
                    )
                    .join("")
                }

            </div>

        </div>

    `;

}


/* ============================================================
   SPECIFICATION
============================================================ */

function renderSpecification(project) {

    const container =
        $("specificationContent");

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="spec-grid">

            <div class="spec-item">

                <span>
                    Projet
                </span>

                <strong>
                    ${escapeHTML(project.title)}
                </strong>

            </div>


            <div class="spec-item">

                <span>
                    Dimension
                </span>

                <strong>
                    ${escapeHTML(project.dimension).toUpperCase()}
                </strong>

            </div>


            <div class="spec-item">

                <span>
                    Priorité
                </span>

                <strong>
                    ${escapeHTML(project.priority)}
                </strong>

            </div>


            <div class="spec-item">

                <span>
                    Realism Engine
                </span>

                <strong>
                    ${project.realism}%
                </strong>

            </div>

        </div>


        <div class="spec-features">

            <h3>
                Systèmes prévus
            </h3>

            <div>

                ${project.analysis.features
                    .map(
                        feature =>
                            `<span>${escapeHTML(feature)}</span>`
                    )
                    .join("")
                }

            </div>

        </div>

    `;

}


/* ============================================================
   GENERATION
============================================================ */

function startGeneration() {

    if (buildRunning) {
        return;
    }

    buildRunning = true;


    const panel =
        $("generationPanel");

    if (panel) {

        panel.classList.remove(
            "hidden"
        );

    }


    const log =
        $("buildLog");

    if (log) {

        log.innerHTML = "";

    }


    const pipeline =
        $("agentPipeline");

    if (pipeline) {

        pipeline.innerHTML = "";

    }


    const progress =
        $("buildProgress");

    const progressBar =
        $("buildProgressBar");

    const status =
        $("buildStatus");


    const agents = [

        "ZENTRO DIRECTOR",
        "GAME DESIGNER",
        "WORLD BUILDER",
        "VEHICLE SYSTEM",
        "NPC SYSTEM",
        "MISSION DESIGNER",
        "GRAPHICS ENGINE",
        "AUDIO ENGINE",
        "PHYSICS ENGINE",
        "QA TESTER",
        "OPTIMIZER"

    ];


    agents.forEach((agent, index) => {

        setTimeout(() => {

            addAgentToPipeline(
                agent,
                index === 0
            );

        }, index * 180);

    });


    let step = 0;


    const interval =
        setInterval(() => {

            step++;


            const percent =
                Math.min(
                    100,
                    Math.round(
                        step / agents.length * 100
                    )
                );


            if (progress) {

                progress.textContent =
                    percent + "%";

            }


            if (progressBar) {

                progressBar.style.width =
                    percent + "%";

            }


            if (status) {

                status.textContent =
                    percent >= 100
                        ? "Construction terminée"
                        : "Génération...";

            }


            addBuildLog(
                getBuildMessage(
                    step,
                    agents
                )
            );


            if (step >= agents.length) {

                clearInterval(interval);

                buildRunning = false;

                finishGeneration();

            }

        }, 650);

}


/* ============================================================
   AGENTS PIPELINE
============================================================ */

function addAgentToPipeline(
    name,
    active
) {

    const pipeline =
        $("agentPipeline");

    if (!pipeline) {
        return;
    }


    const element =
        document.createElement("div");

    element.className =
        "pipeline-agent";


    element.innerHTML = `

        <span class="pipeline-dot">
            ${active ? "●" : "○"}
        </span>

        <span>
            ${escapeHTML(name)}
        </span>

    `;


    pipeline.appendChild(
        element
    );

}


function getBuildMessage(
    step,
    agents
) {

    const messages = [

        "Analyse de la vision du joueur...",
        "Construction du Game Design Document...",
        "Création de la structure du monde...",
        "Initialisation des véhicules...",
        "Configuration des PNJ et du trafic...",
        "Création des missions...",
        "Configuration des matériaux et lumières...",
        "Configuration du système audio...",
        "Configuration de la physique...",
        "Recherche de problèmes...",
        "Optimisation de la scène..."

    ];


    return messages[
        Math.min(
            step - 1,
            messages.length - 1
        )
    ];

}


function addBuildLog(message) {

    const log =
        $("buildLog");

    if (!log) {
        return;
    }


    const line =
        document.createElement("div");

    line.className =
        "log-line";


    const time =
        new Date().toLocaleTimeString(
            "fr-FR"
        );


    line.textContent =
        `[${time}] ${message}`;


    log.appendChild(
        line
    );


    log.scrollTop =
        log.scrollHeight;

}


function finishGeneration() {

    if (currentProject) {

        currentProject.status =
            "Généré";

        saveProject(
            currentProject
        );

    }


    addBuildLog(
        "✓ Projet prêt à être testé dans Game Preview."
    );


    setTimeout(() => {

        navigateTo(
            "preview"
        );

        setTimeout(() => {

            launchGame();

        }, 500);

    }, 700);

}


/* ============================================================
   PROJECTS
============================================================ */

function saveProject(project) {

    const projects =
        getProjects();


    const existing =
        projects.findIndex(
            item =>
                item.id === project.id
        );


    if (existing >= 0) {

        projects[existing] =
            project;

    } else {

        projects.unshift(
            project
        );

    }


    localStorage.setItem(
        "zentro_projects",
        JSON.stringify(projects)
    );


    renderProjects();

}


function getProjects() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "zentro_projects"
            )
        ) || [];

    } catch {

        return [];

    }

}


function renderProjects() {

    const container =
        $("projectsList");

    if (!container) {
        return;
    }


    const projects =
        getProjects();


    if (projects.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ▣
                </div>

                <p>
                    Aucun projet pour le moment.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        projects.map(project => `

            <div class="project-card">

                <div>

                    <span class="project-card-kicker">
                        ZENTRO PROJECT
                    </span>

                    <h3>
                        ${escapeHTML(project.title)}
                    </h3>

                    <p>
                        ${escapeHTML(project.createdAt || "")}
                    </p>

                </div>


                <button
                    class="secondary-button project-open"
                    data-project-id="${project.id}"
                    type="button"
                >
                    Ouvrir
                </button>

            </div>

        `).join("");


    document
        .querySelectorAll(".project-open")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.projectId
                        );

                    openProject(id);

                }
            );

        });

}


function openProject(id) {

    const project =
        getProjects().find(
            item => item.id === id
        );


    if (!project) {
        return;
    }


    currentProject =
        project;


    const prompt =
        $("gamePrompt");

    if (prompt) {

        prompt.value =
            project.prompt;

    }


    navigateTo(
        "create"
    );


    displayAnalysis(
        project
    );


    renderSpecification(
        project
    );


    const approval =
        $("approvalPanel");

    if (approval) {

        approval.classList.remove(
            "hidden"
        );

    }


    const specification =
        $("projectSpecification");

    if (specification) {

        specification.classList.remove(
            "hidden"
        );

    }

}


/* ============================================================
   AGENTS DASHBOARD
============================================================ */

function renderAgents() {

    const container =
        $("agentCards");

    if (!container) {
        return;
    }


    const agents = [

        [
            "ZENTRO DIRECTOR",
            "Comprend la vision du joueur."
        ],

        [
            "GAME DESIGNER",
            "Transforme l'idée en architecture de gameplay."
        ],

        [
            "WORLD BUILDER",
            "Construit les environnements."
        ],

        [
            "VEHICLE SYSTEM",
            "Gère les véhicules et leur physique."
        ],

        [
            "NPC SYSTEM",
            "Gère les personnages et le trafic."
        ],

        [
            "MISSION DESIGNER",
            "Crée les missions et objectifs."
        ],

        [
            "GRAPHICS ENGINE",
            "Gère les matériaux, lumières et effets."
        ],

        [
            "AUDIO ENGINE",
            "Gère les sons et l'ambiance."
        ],

        [
            "PHYSICS ENGINE",
            "Gère les interactions physiques."
        ],

        [
            "QA TESTER",
            "Recherche les bugs."
        ],

        [
            "OPTIMIZER",
            "Optimise les performances."
        ]

    ];


    container.innerHTML =
        agents.map(agent => `

            <div class="agent-card">

                <div class="agent-icon">
                    ◎
                </div>

                <div>

                    <strong>
                        ${agent[0]}
                    </strong>

                    <p>
                        ${agent[1]}
                    </p>

                </div>

                <span class="agent-status">
                    PRÊT
                </span>

            </div>

        `).join("");

}


/* ============================================================
   REALISM DASHBOARD
============================================================ */

function renderRealismDashboard() {

    const container =
        $("realismDashboard");

    if (!container) {
        return;
    }


    const systems = [

        [
            "🌍",
            "Monde",
            "Environnements détaillés"
        ],

        [
            "🚗",
            "Véhicules",
            "Physique et comportement"
        ],

        [
            "💡",
            "Éclairage",
            "Lumières dynamiques"
        ],

        [
            "🌦️",
            "Météo",
            "Conditions dynamiques"
        ],

        [
            "🌙",
            "Jour / Nuit",
            "Cycle temporel"
        ],

        [
            "👥",
            "PNJ",
            "Comportements dynamiques"
        ],

        [
            "🔊",
            "Audio",
            "Ambiance et spatialisation"
        ],

        [
            "⚙️",
            "Physique",
            "Interactions temps réel"
        ]

    ];


    container.innerHTML =
        systems.map(system => `

            <div class="realism-card">

                <div class="realism-card-icon">
                    ${system[0]}
                </div>

                <div>

                    <strong>
                        ${system[1]}
                    </strong>

                    <p>
                        ${system[2]}
                    </p>

                </div>

                <span>
                    ACTIF
                </span>

            </div>

        `).join("");

}


/* ============================================================
   SETTINGS
============================================================ */

function setupSettings() {

    const ids = [

        "autonomousMode",
        "autoFix",
        "autoOptimize",
        "ipGuard"

    ];


    ids.forEach(id => {

        const element =
            $(id);

        if (!element) {
            return;
        }


        const saved =
            localStorage.getItem(
                "zentro_" + id
            );


        if (saved !== null) {

            element.checked =
                saved === "true";

        }


        element.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    "zentro_" + id,
                    element.checked
                );

            }
        );

    });

}


/* ============================================================
   GAME 3D
============================================================ */

function initializeGame3D() {

    if (!threeReady) {

        checkThreeJS();

        if (!threeReady) {

            updateRuntimeStatus(
                "Moteur 3D indisponible"
            );

            return;

        }

    }


    const viewport =
        $("gameViewport");

    const canvas =
        $("gameCanvas");


    if (!viewport || !canvas) {
        return;
    }


    /*
     * Si le moteur existe déjà, on ne le recrée pas.
     */

    if (renderer) {

        resizeRenderer();

        return;

    }


    try {

        scene =
            new THREE.Scene();


        scene.background =
            new THREE.Color(
                0x86b7d8
            );


        scene.fog =
            new THREE.Fog(
                0x86b7d8,
                80,
                350
            );


        camera =
            new THREE.PerspectiveCamera(
                60,
                viewport.clientWidth /
                Math.max(
                    viewport.clientHeight,
                    1
                ),
                0.1,
                1000
            );


        camera.position.set(
            0,
            6,
            12
        );


        renderer =
            new THREE.WebGLRenderer({

                canvas: canvas,

                antialias: true,

                powerPreference:
                    "high-performance"

            });


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            )
        );


        renderer.setSize(
            Math.max(viewport.clientWidth, 1),
            Math.max(viewport.clientHeight, 1),
            false
        );


        renderer.shadowMap.enabled =
            true;


        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        clock =
            new THREE.Clock();


        createLighting();
        createWorld();
        createRoads();
        createBuildings();
        createTrees();
        createStreetLights();

        playerCar =
            createPlayerCar();


        scene.add(
            playerCar
        );


        setupGameMouse();
        setupGameKeyboard();

        window.addEventListener(
            "resize",
            resizeRenderer
        );


        updateRuntimeStatus(
            "Moteur 3D prêt"
        );


        const loading =
            $("gameLoading");

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }


        startRenderLoop();


        console.log(
            "ZENTRO : scène 3D initialisée."
        );

    } catch (error) {

        console.error(
            "ZENTRO 3D ERROR:",
            error
        );


        updateRuntimeStatus(
            "Erreur du moteur 3D"
        );

    }

}


/* ============================================================
   LIGHTING
============================================================ */

function createLighting() {

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x405060,
            2
        );


    scene.add(
        ambient
    );


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3
        );


    sun.position.set(
        80,
        120,
        50
    );


    sun.castShadow =
        true;


    sun.shadow.mapSize.width =
        2048;

    sun.shadow.mapSize.height =
        2048;


    sun.shadow.camera.left =
        -150;

    sun.shadow.camera.right =
        150;

    sun.shadow.camera.top =
        150;

    sun.shadow.camera.bottom =
        -150;


    scene.add(
        sun
    );

}


/* ============================================================
   WORLD
============================================================ */

function createWorld() {

    const groundGeometry =
        new THREE.PlaneGeometry(
            600,
            600
        );


    const groundMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x4d7048,

            roughness:
                1

        });


    const ground =
        new THREE.Mesh(
            groundGeometry,
            groundMaterial
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.receiveShadow =
        true;


    scene.add(
        ground
    );


    worldObjects.push(
        ground
    );

}


/* ============================================================
   ROADS
============================================================ */

function createRoads() {

    createRoad(
        0,
        0,
        600,
        18,
        0
    );


    createRoad(
        0,
        0,
        18,
        600,
        0
    );


    for (
        let x = -180;
        x <= 180;
        x += 60
    ) {

        createRoad(
            x,
            0,
            10,
            600,
            0
        );

    }

}


function createRoad(
    x,
    z,
    width,
    depth,
    rotation
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            0.12,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x24282d,

            roughness:
                0.95

        });


    const road =
        new THREE.Mesh(
            geometry,
            material
        );


    road.position.set(
        x,
        0.06,
        z
    );


    road.rotation.y =
        rotation;


    road.receiveShadow =
        true;


    scene.add(
        road
    );


    /*
     * Marquage central.
     */

    if (width > depth) {

        for (
            let i = -250;
            i < 250;
            i += 18
        ) {

            createRoadMark(
                i,
                z,
                true
            );

        }

    } else {

        for (
            let i = -250;
            i < 250;
            i += 18
        ) {

            createRoadMark(
                x,
                i,
                false
            );

        }

    }

}


function createRoadMark(
    x,
    z,
    horizontal
) {

    const geometry =
        new THREE.BoxGeometry(
            horizontal ? 8 : 0.25,
            0.03,
            horizontal ? 0.25 : 8
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0xf4f0d0
        });


    const mark =
        new THREE.Mesh(
            geometry,
            material
        );


    mark.position.set(
        x,
        0.14,
        z
    );


    scene.add(
        mark
    );

}


/* ============================================================
   BUILDINGS
============================================================ */

function createBuildings() {

    const positions = [

        [-55, -55],
        [-25, -70],
        [35, -65],
        [65, -45],

        [-70, 30],
        [-45, 55],
        [50, 45],
        [75, 75],

        [-100, -120],
        [100, -120],
        [-120, 100],
        [120, 110]

    ];


    positions.forEach(
        ([x, z], index) => {

            const height =
                10 +
                (index % 5) * 7;


            createBuilding(
                x,
                z,
                16 + (index % 3) * 5,
                height,
                16 + (index % 2) * 5
            );

        }
    );

}


function createBuilding(
    x,
    z,
    width,
    height,
    depth
) {

    const geometry =
        new THREE.BoxGeometry(
            width,
            height,
            depth
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x59616a,

            roughness:
                0.75,

            metalness:
                0.05

        });


    const building =
        new THREE.Mesh(
            geometry,
            material
        );


    building.position.set(
        x,
        height / 2,
        z
    );


    building.castShadow =
        true;


    building.receiveShadow =
        true;


    scene.add(
        building
    );


    createWindows(
        building,
        width,
        height,
        depth
    );

}


function createWindows(
    building,
    width,
    height,
    depth
) {

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x9ed7ff
        });


    const rows =
        Math.max(
            2,
            Math.floor(height / 4)
        );


    const columns =
        Math.max(
            2,
            Math.floor(width / 3)
        );


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let col = 0;
            col < columns;
            col++
        ) {

            if (
                (row + col) % 3 === 0
            ) {
                continue;
            }


            const windowGeometry =
                new THREE.BoxGeometry(
                    0.8,
                    1.2,
                    0.08
                );


            const window =
                new THREE.Mesh(
                    windowGeometry,
                    material
                );


            const px =
                -width / 2 +
                1.7 +
                col * (
                    width /
                    Math.max(columns, 1)
                );


            const py =
                -height / 2 +
                2.2 +
                row * 3.5;


            window.position.set(
                px,
                py,
                depth / 2 + 0.05
            );


            building.add(
                window
            );

        }

    }

}


/* ============================================================
   TREES
============================================================ */

function createTrees() {

    const positions = [

        [-35, -30],
        [35, -30],
        [-35, 30],
        [35, 30],
        [-90, -35],
        [90, 35],
        [-90, 70],
        [90, -70]

    ];


    positions.forEach(
        ([x, z]) => {

            createTree(
                x,
                z
            );

        }
    );

}


function createTree(
    x,
    z
) {

    const trunkGeometry =
        new THREE.CylinderGeometry(
            0.5,
            0.7,
            4,
            8
        );


    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x5a3926
        });


    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );


    trunk.position.set(
        x,
        2,
        z
    );


    trunk.castShadow =
        true;


    scene.add(
        trunk
    );


    const crownGeometry =
        new THREE.SphereGeometry(
            2.8,
            12,
            10
        );


    const crownMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x2f7038
        });


    const crown =
        new THREE.Mesh(
            crownGeometry,
            crownMaterial
        );


    crown.position.set(
        x,
        5.5,
        z
    );


    crown.castShadow =
        true;


    scene.add(
        crown
    );

}


/* ============================================================
   STREET LIGHTS
============================================================ */

function createStreetLights() {

    const positions = [

        [-10, -40],
        [10, -40],
        [-10, 40],
        [10, 40],
        [-40, -10],
        [-40, 10],
        [40, -10],
        [40, 10]

    ];


    positions.forEach(
        ([x, z]) => {

            const poleGeometry =
                new THREE.CylinderGeometry(
                    0.08,
                    0.12,
                    6,
                    8
                );


            const poleMaterial =
                new THREE.MeshStandardMaterial({
                    color: 0x25282c
                });


            const pole =
                new THREE.Mesh(
                    poleGeometry,
                    poleMaterial
                );


            pole.position.set(
                x,
                3,
                z
            );


            pole.castShadow =
                true;


            scene.add(
                pole
            );


            const lampGeometry =
                new THREE.SphereGeometry(
                    0.25,
                    8,
                    8
                );


            const lampMaterial =
                new THREE.MeshBasicMaterial({
                    color: 0xffe6a3
                });


            const lamp =
                new THREE.Mesh(
                    lampGeometry,
                    lampMaterial
                );


            lamp.position.set(
                x,
                6,
                z
            );


            scene.add(
                lamp
            );

        }
    );

}


/* ============================================================
   PLAYER CAR
============================================================ */

function createPlayerCar() {

    const car =
        new THREE.Group();


    car.position.set(
        0,
        0.65,
        0
    );


    /*
     * Corps
     */

    const bodyGeometry =
        new THREE.BoxGeometry(
            2.4,
            0.65,
            4.4
        );


    const bodyMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x111318,

            metalness:
                0.7,

            roughness:
                0.25

        });


    const body =
        new THREE.Mesh(
            bodyGeometry,
            bodyMaterial
        );


    body.castShadow =
        true;


    body.receiveShadow =
        true;


    car.add(
        body
    );


    /*
     * Habitacle
     */

    const cabinGeometry =
        new THREE.BoxGeometry(
            1.9,
            0.65,
            2
        );


    const cabinMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x111d2b,

            metalness:
                0.3,

            roughness:
                0.15

        });


    const cabin =
        new THREE.Mesh(
            cabinGeometry,
            cabinMaterial
        );


    cabin.position.y =
        0.58;


    cabin.position.z =
        -0.15;


    cabin.castShadow =
        true;


    car.add(
        cabin
    );


    /*
     * Roues
     */

    const wheelPositions = [

        [-1.25, 0.05, -1.45],
        [1.25, 0.05, -1.45],
        [-1.25, 0.05, 1.45],
        [1.25, 0.05, 1.45]

    ];


    wheelPositions.forEach(
        position => {

            const wheel =
                createWheel();


            wheel.position.set(
                position[0],
                position[1],
                position[2]
            );


            car.add(
                wheel
            );


            carWheels.push(
                wheel
            );

        }
    );


    /*
     * Phares
     */

    const headlightMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffffff
        });


    [-0.72, 0.72].forEach(
        x => {

            const lightGeometry =
                new THREE.BoxGeometry(
                    0.35,
                    0.18,
                    0.08
                );


            const light =
                new THREE.Mesh(
                    lightGeometry,
                    headlightMaterial
                );


            light.position.set(
                x,
                0.25,
                2.22
            );


            car.add(
                light
            );

        }
    );


    return car;

}


function createWheel() {

    const geometry =
        new THREE.CylinderGeometry(
            0.48,
            0.48,
            0.35,
            20
        );


    const material =
        new THREE.MeshStandardMaterial({

            color:
                0x101010,

            roughness:
                0.8

        });


    const wheel =
        new THREE.Mesh(
            geometry,
            material
        );


    wheel.rotation.z =
        Math.PI / 2;


    wheel.castShadow =
        true;


    return wheel;

}


/* ============================================================
   GAME KEYBOARD
============================================================ */

function setupGameKeyboard() {

    window.addEventListener(
        "keydown",
        event => {

            keys[
                event.key.toLowerCase()
            ] = true;


            if (
                [
                    " ",
                    "arrowup",
                    "arrowdown",
                    "arrowleft",
                    "arrowright"
                ].includes(
                    event.key.toLowerCase()
                )
            ) {

                event.preventDefault();

            }

        }
    );


    window.addEventListener(
        "keyup",
        event => {

            keys[
                event.key.toLowerCase()
            ] = false;

        }
    );

}


/* ============================================================
   MOUSE CAMERA
============================================================ */

function setupGameMouse() {

    const viewport =
        $("gameViewport");

    if (!viewport) {
        return;
    }


    viewport.addEventListener(
        "mousedown",
        event => {

            mouseDown = true;

            lastMouseX =
                event.clientX;

            lastMouseY =
                event.clientY;

        }
    );


    window.addEventListener(
        "mouseup",
        () => {

            mouseDown = false;

        }
    );


    window.addEventListener(
        "mousemove",
        event => {

            if (!mouseDown) {
                return;
            }


            const dx =
                event.clientX -
                lastMouseX;


            const dy =
                event.clientY -
                lastMouseY;


            lastMouseX =
                event.clientX;

            lastMouseY =
                event.clientY;


            cameraYaw -=
                dx * 0.006;


            cameraPitch -=
                dy * 0.004;


            cameraPitch =
                Math.max(
                    0.05,
                    Math.min(
                        0.9,
                        cameraPitch
                    )
                );

        }
    );

}


/* ============================================================
   GAME LOOP
============================================================ */

function startRenderLoop() {

    if (animationFrame) {
        return;
    }


    animationFrame =
        requestAnimationFrame(
            renderLoop
        );

}


function renderLoop() {

    animationFrame =
        requestAnimationFrame(
            renderLoop
        );


    if (
        !renderer ||
        !scene ||
        !camera
    ) {

        return;

    }


    const delta =
        clock
            ? Math.min(
                clock.getDelta(),
                0.05
            )
            : 0.016;


    if (
        gameStarted &&
        !gamePaused
    ) {

        updatePlayer(
            delta
        );

    }


    updateCamera(
        delta
    );


    updateFPS();


    renderer.render(
        scene,
        camera
    );

}


/* ============================================================
   PLAYER UPDATE
============================================================ */

function updatePlayer(delta) {

    if (!playerCar) {
        return;
    }


    const forward =
        keys["z"] ||
        keys["w"] ||
        keys["arrowup"];


    const backward =
        keys["s"] ||
        keys["arrowdown"];


    const left =
        keys["q"] ||
        keys["a"] ||
        keys["arrowleft"];


    const right =
        keys["d"] ||
        keys["arrowright"];


    const boost =
        keys["shift"];


    const acceleration =
        boost
            ? 24
            : 14;


    const maxSpeed =
        boost
            ? 35
            : 24;


    const braking =
        22;


    if (forward) {

        carSpeed +=
            acceleration *
            delta;

    }


    if (backward) {

        carSpeed -=
            braking *
            delta;

    }


    if (!forward && !backward) {

        carSpeed *=
            Math.pow(
                0.08,
                delta
            );

    }


    carSpeed =
        Math.max(
            -10,
            Math.min(
                maxSpeed,
                carSpeed
            )
        );


    /*
     * Direction
     */

    if (Math.abs(carSpeed) > 0.15) {

        const direction =
            carSpeed >= 0
                ? 1
                : -1;


        const steering =
            (left ? 1 : 0) -
            (right ? 1 : 0);


        carRotation +=
            steering *
            1.9 *
            delta *
            direction;


        playerCar.rotation.y =
            carRotation;

    }


    /*
     * Déplacement
     */

    const direction =
        new THREE.Vector3(
            Math.sin(carRotation),
            0,
            Math.cos(carRotation)
        );


    playerCar.position.addScaledVector(
        direction,
        carSpeed * delta
    );


    /*
     * Limites de la carte
     */

    playerCar.position.x =
        Math.max(
            -285,
            Math.min(
                285,
                playerCar.position.x
            )
        );


    playerCar.position.z =
        Math.max(
            -285,
            Math.min(
                285,
                playerCar.position.z
            )
        );


    /*
     * Rotation des roues
     */

    carWheels.forEach(
        wheel => {

            wheel.rotation.x +=
                carSpeed *
                delta *
                1.8;

        }
    );

}


/* ============================================================
   CAMERA
============================================================ */

function updateCamera() {

    if (!playerCar || !camera) {
        return;
    }


    const distance =
        9;


    const height =
        4.5 +
        cameraPitch * 2;


    const offsetX =
        Math.sin(
            cameraYaw
        ) * distance;


    const offsetZ =
        Math.cos(
            cameraYaw
        ) * distance;


    const target =
        new THREE.Vector3(
            playerCar.position.x,
            playerCar.position.y + 1,
            playerCar.position.z
        );


    const desired =
        new THREE.Vector3(

            target.x -
            offsetX,

            target.y +
            height,

            target.z -
            offsetZ

        );


    camera.position.lerp(
        desired,
        0.08
    );


    camera.lookAt(
        target
    );

}


/* ============================================================
   LAUNCH
============================================================ */

function launchGame() {

    if (!threeReady) {

        checkThreeJS();

        if (!threeReady) {

            updateRuntimeStatus(
                "Three.js indisponible"
            );

            return;

        }

    }


    if (!renderer) {

        initializeGame3D();

    }


    gameStarted =
        true;

    gamePaused =
        false;


    updateRuntimeStatus(
        "Jeu en cours"
    );


    const button =
        $("launchGameButton");

    if (button) {

        button.textContent =
            "⏸ Jeu en cours";

    }

}


/* ============================================================
   RESET
============================================================ */

function resetGame() {

    if (!playerCar) {

        initializeGame3D();

        return;

    }


    playerCar.position.set(
        0,
        0.65,
        0
    );


    playerCar.rotation.set(
        0,
        0,
        0
    );


    carRotation =
        0;

    carSpeed =
        0;

    cameraYaw =
        0;

    cameraPitch =
        0.35;


    gameStarted =
        false;


    gamePaused =
        false;


    updateRuntimeStatus(
        "Moteur 3D prêt"
    );


    const button =
        $("launchGameButton");

    if (button) {

        button.textContent =
            "▶ Lancer le jeu";

    }

}


/* ============================================================
   FULLSCREEN
============================================================ */

function toggleFullscreen() {

    const viewport =
        $("gameViewport");

    if (!viewport) {
        return;
    }


    if (!document.fullscreenElement) {

        if (
            viewport.requestFullscreen
        ) {

            viewport.requestFullscreen();

        }

    } else {

        document.exitFullscreen();

    }

}


/* ============================================================
   RESIZE
============================================================ */

function resizeRenderer() {

    if (
        !renderer ||
        !camera
    ) {

        return;

    }


    const viewport =
        $("gameViewport");


    if (!viewport) {
        return;
    }


    const width =
        Math.max(
            viewport.clientWidth,
            1
        );


    const height =
        Math.max(
            viewport.clientHeight,
            1
        );


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );

}


/* ============================================================
   FPS
============================================================ */

function updateFPS() {

    fpsFrames++;


    const now =
        performance.now();


    if (
        now -
        fpsLastTime >=
        500
    ) {

        const fps =
            Math.round(
                fpsFrames /
                (
                    (now -
                        fpsLastTime) /
                    1000
                )
            );


        const element =
            $("hudFPS");


        if (element) {

            element.textContent =
                Math.min(
                    120,
                    fps
                );

        }


        fpsFrames =
            0;

        fpsLastTime =
            now;

    }

}


/* ============================================================
   RUNTIME STATUS
============================================================ */

function updateRuntimeStatus(
    message
) {

    const element =
        $("gameRuntimeStatus");

    if (element) {

        element.textContent =
            message;

    }

}


/* ============================================================
   UTILITIES
============================================================ */

function getValue(
    id,
    fallback
) {

    const element =
        $(id);

    return element
        ? element.value
        : fallback;

}


function generateGameTitle(
    text
) {

    const lower =
        text.toLowerCase();


    if (
        lower.includes("voiture") ||
        lower.includes("conduite") ||
        lower.includes("course")
    ) {

        return "ZENTRO DRIVE";

    }


    if (
        lower.includes("ville") ||
        lower.includes("monde ouvert")
    ) {

        return "ZENTRO WORLD";

    }


    if (
        lower.includes("exploration")
    ) {

        return "ZENTRO EXPLORER";

    }


    return "ZENTRO GAME";

}


function showUnderstanding(
    message
) {

    const content =
        $("understandingContent");

    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ⚠️
            </div>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   KEYBOARD SHORTCUT
============================================================ */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Ctrl + K
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            const prompt =
                $("gamePrompt");

            if (prompt) {

                navigateTo(
                    "create"
                );

                prompt.focus();

            }

        }


        /*
         * Escape
         */

        if (
            event.key === "Escape"
        ) {

            mouseDown =
                false;

        }

    }
);


/* ============================================================
   FIN
============================================================ */

console.log(
    "%cZENTRO GAME ENGINE",
    "font-size:24px;font-weight:bold"
);

console.log(
    "ZENTRO Runtime initialisé."
);
