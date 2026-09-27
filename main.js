/* =========================================================
   ZENTRO GAME ENGINE V3
   MAIN.JS — VERSION COMPLETE
========================================================= */

"use strict";

/* =========================================================
   VARIABLES
========================================================= */

let currentPage = "create";
let currentProject = null;
let buildRunning = false;

let scene = null;
let camera = null;
let renderer = null;
let animationFrame = null;

let playerCar = null;
let roadGroup = null;

let gameRunning = false;
let gameInitialized = false;

const keys = {};

let carSpeed = 0;
let cameraAngle = 0;
let cameraDistance = 8;

let lastTime = performance.now();
let frameCount = 0;
let fpsTimer = performance.now();


/* =========================================================
   DOM HELPER
========================================================= */

function $(id) {
    return document.getElementById(id);
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}


/* =========================================================
   BOOT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    bootSequence();

});


function bootSequence() {

    const bootScreen = $("bootScreen");
    const app = $("app");
    const progress = $("bootProgress");
    const status = $("bootStatus");

    if (!bootScreen || !app) {
        initializeApp();
        return;
    }

    const messages = [
        "Initialisation du moteur...",
        "Chargement de Zentro Director...",
        "Chargement du World Builder...",
        "Préparation du Realism Engine...",
        "Initialisation des agents IA...",
        "Préparation du Runtime 3D...",
        "Zentro est prêt."
    ];

    let step = 0;

    const timer = setInterval(() => {

        step++;

        const percentage = Math.min(
            100,
            Math.round((step / messages.length) * 100)
        );

        if (progress) {
            progress.style.width = percentage + "%";
        }

        if (status) {
            status.textContent =
                messages[Math.min(step, messages.length) - 1];
        }

        if (step >= messages.length) {

            clearInterval(timer);

            setTimeout(() => {

                bootScreen.classList.add("hidden");
                app.classList.add("visible");

                initializeApp();

            }, 400);
        }

    }, 180);
}


/* =========================================================
   INITIALISATION
========================================================= */

function initializeApp() {

    setupNavigation();
    setupQuickPrompts();
    setupRealismSlider();
    setupCreateSystem();
    setupSettings();
    setupKeyboardShortcuts();

    renderProjects();
    renderAgents();
    renderRealismDashboard();

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const buttons = qsa(".nav-item");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const page = button.dataset.page;

            if (!page) return;

            navigateTo(page);

        });

    });

}


function navigateTo(page) {

    currentPage = page;

    qsa(".nav-item").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.page === page
        );

    });

    qsa(".page").forEach(section => {

        section.classList.toggle(
            "active",
            section.id === "page-" + page
        );

    });

    updatePageTitle(page);

    if (page === "preview") {

        setTimeout(() => {

            initialize3D();

            resize3D();

        }, 100);

    }

}


function updatePageTitle(page) {

    const title = $("pageTitle");

    if (!title) return;

    const titles = {

        create: "Créer un jeu",
        preview: "Game Preview",
        projects: "Mes projets",
        agents: "Agents IA",
        realism: "Realism Engine",
        settings: "Paramètres"

    };

    title.textContent =
        titles[page] || "Zentro Game Engine";
}


/* =========================================================
   QUICK PROMPTS
========================================================= */

function setupQuickPrompts() {

    qsa(".quick-prompt").forEach(button => {

        button.addEventListener("click", () => {

            const prompt = button.dataset.prompt;

            if (!prompt) return;

            const textarea = $("gamePrompt");

            if (textarea) {

                textarea.value = prompt;

                textarea.focus();

            }

        });

    });

}


/* =========================================================
   REALISM SLIDER
========================================================= */

function setupRealismSlider() {

    const slider = $("realism");
    const value = $("realismValue");

    if (!slider) return;

    slider.addEventListener("input", () => {

        if (value) {
            value.textContent =
                slider.value + "%";
        }

    });

}


/* =========================================================
   CREATION SYSTEM
========================================================= */

function setupCreateSystem() {

    const analyzeButton = $("analyzeButton");

    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            analyzeGameIdea
        );

    }

    const editButton = $("editButton");

    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                const approval =
                    $("approvalPanel");

                if (approval) {
                    approval.classList.add("hidden");
                }

                const textarea =
                    $("gamePrompt");

                if (textarea) {
                    textarea.focus();
                }

            }
        );

    }

    const generateButton =
        $("generateButton");

    if (generateButton) {

        generateButton.addEventListener(
            "click",
            startGeneration
        );

    }

}


/* =========================================================
   ANALYSE DE L'IDEE
========================================================= */

function analyzeGameIdea() {

    const textarea = $("gamePrompt");

    if (!textarea) return;

    const prompt =
        textarea.value.trim();

    if (!prompt) {

        textarea.focus();

        showTemporaryMessage(
            "Décris d'abord le jeu que tu veux créer."
        );

        return;
    }


    const understandingPanel =
        $("understandingPanel");

    const understandingStatus =
        $("understandingStatus");

    const understandingContent =
        $("understandingContent");

    const approvalPanel =
        $("approvalPanel");

    const specification =
        $("projectSpecification");


    if (understandingPanel) {

        understandingPanel.classList.remove(
            "hidden"
        );

    }


    if (approvalPanel) {

        approvalPanel.classList.add(
            "hidden"
        );

    }


    if (understandingStatus) {

        understandingStatus.textContent =
            "Zentro analyse ta vision...";
    }


    if (understandingContent) {

        understandingContent.innerHTML = `
            <div class="understanding-item">
                <div class="understanding-item-title">
                    Vision
                </div>
                <div class="understanding-item-value">
                    Analyse du concept en cours...
                </div>
            </div>

            <div class="understanding-item">
                <div class="understanding-item-title">
                    Univers
                </div>
                <div class="understanding-item-value">
                    Détection du monde de jeu...
                </div>
            </div>

            <div class="understanding-item">
                <div class="understanding-item-title">
                    Gameplay
                </div>
                <div class="understanding-item-value">
                    Identification des mécaniques...
                </div>
            </div>

            <div class="understanding-item">
                <div class="understanding-item-title">
                    Réalisme
                </div>
                <div class="understanding-item-value">
                    Préparation du Realism Engine...
                </div>
            </div>
        `;

    }


    setTimeout(() => {

        const analysis =
            buildAnalysis(prompt);

        if (understandingStatus) {

            understandingStatus.textContent =
                "Analyse terminée ✓";

        }


        if (understandingContent) {

            understandingContent.innerHTML = `

                <div class="understanding-item">

                    <div class="understanding-item-title">
                        Vision détectée
                    </div>

                    <div class="understanding-item-value">
                        ${escapeHTML(analysis.vision)}
                    </div>

                </div>


                <div class="understanding-item">

                    <div class="understanding-item-title">
                        Monde
                    </div>

                    <div class="understanding-item-value">
                        ${escapeHTML(analysis.world)}
                    </div>

                </div>


                <div class="understanding-item">

                    <div class="understanding-item-title">
                        Gameplay
                    </div>

                    <div class="understanding-item-value">
                        ${escapeHTML(analysis.gameplay)}
                    </div>

                </div>


                <div class="understanding-item">

                    <div class="understanding-item-title">
                        Réalisme
                    </div>

                    <div class="understanding-item-value">
                        ${analysis.realism}%
                    </div>

                </div>

            `;

        }


        currentProject = {

            id: Date.now(),

            prompt: prompt,

            title: generateGameTitle(prompt),

            platform:
                $("platform")?.value || "web",

            dimension:
                $("dimension")?.value || "3d",

            priority:
                $("priority")?.value || "realism",

            realism:
                Number(
                    $("realism")?.value || 90
                ),

            analysis: analysis,

            createdAt:
                new Date().toLocaleString("fr-FR")

        };


        if (specification) {

            specification.innerHTML = `

                <div class="spec-item">

                    <strong>
                        🎮 Projet
                    </strong>

                    <span>
                        ${escapeHTML(currentProject.title)}
                    </span>

                </div>


                <div class="spec-item">

                    <strong>
                        🌍 Monde
                    </strong>

                    <span>
                        ${escapeHTML(analysis.world)}
                    </span>

                </div>


                <div class="spec-item">

                    <strong>
                        🕹️ Gameplay
                    </strong>

                    <span>
                        ${escapeHTML(analysis.gameplay)}
                    </span>

                </div>


                <div class="spec-item">

                    <strong>
                        ✨ Réalisme
                    </strong>

                    <span>
                        ${currentProject.realism}%
                    </span>

                </div>

            `;

        }


        if (approvalPanel) {

            approvalPanel.classList.remove(
                "hidden"
            );

            approvalPanel.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    }, 900);

}


/* =========================================================
   ANALYSE
========================================================= */

function buildAnalysis(prompt) {

    const text =
        prompt.toLowerCase();

    let world =
        "Monde 3D à construire";

    let gameplay =
        "Exploration et interaction";

    let vision =
        "Jeu vidéo original";

    if (
        text.includes("ville") ||
        text.includes("city") ||
        text.includes("urbain")
    ) {

        world =
            "Grande ville 3D avec rues et bâtiments";

    }

    if (
        text.includes("voiture") ||
        text.includes("course") ||
        text.includes("conduite")
    ) {

        gameplay =
            "Conduite, véhicules et exploration";

    }

    if (
        text.includes("mission") ||
        text.includes("missions")
    ) {

        gameplay +=
            " avec système de missions";

    }

    if (
        text.includes("open world") ||
        text.includes("monde ouvert")
    ) {

        vision =
            "Jeu original en monde ouvert";

    }

    if (
        text.includes("réaliste") ||
        text.includes("realiste")
    ) {

        world +=
            " avec priorité au réalisme";

    }

    return {

        vision,
        world,
        gameplay,

        realism:
            Number(
                $("realism")?.value || 90
            )

    };

}


/* =========================================================
   TITRE
========================================================= */

function generateGameTitle(prompt) {

    const text =
        prompt.toLowerCase();

    if (
        text.includes("voiture") ||
        text.includes("course") ||
        text.includes("conduite")
    ) {

        return "Zentro Drive";

    }

    if (
        text.includes("ville") ||
        text.includes("monde ouvert")
    ) {

        return "Zentro Open World";

    }

    return "Nouveau projet Zentro";

}


/* =========================================================
   GENERATION
========================================================= */

function startGeneration() {

    if (buildRunning) return;

    if (!currentProject) {

        analyzeGameIdea();

        return;

    }

    buildRunning = true;

    const generationPanel =
        $("generationPanel");

    const approvalPanel =
        $("approvalPanel");

    if (approvalPanel) {

        approvalPanel.classList.add(
            "hidden"
        );

    }

    if (generationPanel) {

        generationPanel.classList.remove(
            "hidden"
        );

        generationPanel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    buildAgents();

    runBuildSequence();

}


/* =========================================================
   AGENTS
========================================================= */

const BUILD_AGENTS = [

    {
        icon: "🧠",
        name: "Zentro Director"
    },

    {
        icon: "🌍",
        name: "World Builder"
    },

    {
        icon: "🚗",
        name: "Vehicle AI"
    },

    {
        icon: "👤",
        name: "NPC AI"
    },

    {
        icon: "🎨",
        name: "Visual Engine"
    },

    {
        icon: "⚙️",
        name: "Systems Agent"
    },

    {
        icon: "🎵",
        name: "Audio Agent"
    },

    {
        icon: "🧪",
        name: "QA Agent"
    },

    {
        icon: "🚀",
        name: "Optimizer"
    }

];


function buildAgents() {

    const container =
        $("agentPipeline");

    if (!container) return;

    container.innerHTML = "";

    BUILD_AGENTS.forEach((agent, index) => {

        const element =
            document.createElement("div");

        element.className =
            "agent-step";

        element.id =
            "build-agent-" + index;

        element.innerHTML = `

            <div class="agent-icon">
                ${agent.icon}
            </div>

            <div class="agent-name">
                ${agent.name}
            </div>

            <div class="agent-status">
                En attente
            </div>

        `;

        container.appendChild(element);

    });

}


/* =========================================================
   BUILD SEQUENCE
========================================================= */

function runBuildSequence() {

    const status =
        $("buildStatus");

    const progress =
        $("buildProgress");

    const log =
        $("buildLog");

    let index = 0;


    if (log) {

        log.innerHTML =
            `[ZENTRO] Démarrage du build...<br>`;

    }


    const interval =
        setInterval(() => {

            if (index >= BUILD_AGENTS.length) {

                clearInterval(interval);

                if (progress) {
                    progress.style.width = "100%";
                }

                if (status) {
                    status.textContent =
                        "Build terminé avec succès ✓";
                }

                if (log) {

                    log.innerHTML +=
                        `[${timeNow()}] Build terminé avec succès.<br>`;

                    log.scrollTop =
                        log.scrollHeight;

                }

                buildRunning = false;

                saveCurrentProject();

                return;
            }


            const agent =
                BUILD_AGENTS[index];

            const element =
                $("build-agent-" + index);

            if (element) {

                element.classList.add(
                    "active"
                );

                const state =
                    element.querySelector(
                        ".agent-status"
                    );

                if (state) {

                    state.textContent =
                        "Construction...";

                }

            }


            if (status) {

                status.textContent =
                    agent.name +
                    " travaille...";

            }


            if (log) {

                log.innerHTML +=
                    `[${timeNow()}] ${agent.name} : démarrage.<br>`;

                log.scrollTop =
                    log.scrollHeight;

            }


            setTimeout(() => {

                if (element) {

                    element.classList.remove(
                        "active"
                    );

                    element.classList.add(
                        "done"
                    );

                    const state =
                        element.querySelector(
                            ".agent-status"
                        );

                    if (state) {

                        state.textContent =
                            "Terminé ✓";

                    }

                }


                if (log) {

                    log.innerHTML +=
                        `[${timeNow()}] ${agent.name} : terminé ✓<br>`;

                    log.scrollTop =
                        log.scrollHeight;

                }

            }, 350);


            index++;

            const percentage =
                Math.round(
                    (index /
                        BUILD_AGENTS.length) *
                    100
                );

            if (progress) {

                progress.style.width =
                    percentage + "%";

            }

        }, 650);

}


/* =========================================================
   PROJECT STORAGE
========================================================= */

function saveCurrentProject() {

    if (!currentProject) return;

    let projects = [];

    try {

        projects =
            JSON.parse(
                localStorage.getItem(
                    "zentroProjects"
                )
            ) || [];

    } catch {

        projects = [];

    }


    const exists =
        projects.findIndex(
            project =>
                project.id ===
                currentProject.id
        );


    if (exists >= 0) {

        projects[exists] =
            currentProject;

    } else {

        projects.unshift(
            currentProject
        );

    }


    localStorage.setItem(
        "zentroProjects",
        JSON.stringify(projects)
    );


    renderProjects();

}


/* =========================================================
   PROJECTS
========================================================= */

function renderProjects() {

    const container =
        $("projectsList");

    if (!container) return;

    let projects = [];

    try {

        projects =
            JSON.parse(
                localStorage.getItem(
                    "zentroProjects"
                )
            ) || [];

    } catch {

        projects = [];

    }


    if (!projects.length) {

        container.innerHTML = `

            <div class="card">

                <div class="card-title">
                    📁 Aucun projet
                </div>

                <div class="card-subtitle">
                    Analyse ton premier jeu pour commencer.
                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        projects.map(project => `

            <div class="project-card">

                <div class="project-card-title">
                    🎮 ${escapeHTML(project.title)}
                </div>

                <div class="project-card-meta">
                    ${escapeHTML(project.createdAt || "")}
                </div>

                <div class="project-card-meta">
                    ${escapeHTML(project.prompt)}
                </div>

            </div>

        `).join("");

}


/* =========================================================
   AGENTS DASHBOARD
========================================================= */

function renderAgents() {

    const container =
        $("agentCards");

    if (!container) return;

    container.innerHTML =
        BUILD_AGENTS.map(agent => `

            <div class="agent-card">

                <div class="agent-card-icon">
                    ${agent.icon}
                </div>

                <div class="agent-card-title">
                    ${agent.name}
                </div>

                <div class="agent-card-description">
                    Agent spécialisé Zentro chargé
                    de participer à la construction
                    et à l'optimisation du jeu.
                </div>

            </div>

        `).join("");

}


/* =========================================================
   REALISM DASHBOARD
========================================================= */

function renderRealismDashboard() {

    const container =
        $("realismDashboard");

    if (!container) return;

    const systems = [

        ["🌍", "Monde", 94],
        ["🚗", "Véhicules", 92],
        ["👤", "PNJ", 88],
        ["💡", "Éclairage", 96],
        ["🌧️", "Météo", 85],
        ["🔊", "Audio", 82],
        ["⚙️", "Physique", 90],
        ["🎨", "Graphismes", 93]

    ];


    container.innerHTML =
        systems.map(system => `

            <div class="realism-card">

                <div class="realism-card-title">
                    ${system[0]} ${system[1]}
                </div>

                <div class="realism-card-value">
                    ${system[2]}%
                </div>

                <div class="realism-card-bar">

                    <div
                        style="width:${system[2]}%"
                    ></div>

                </div>

            </div>

        `).join("");

}


/* =========================================================
   SETTINGS
========================================================= */

function setupSettings() {

    [
        "settingValidation",
        "settingQA",
        "settingOptimization"
    ].forEach(id => {

        const input = $(id);

        if (!input) return;

        const saved =
            localStorage.getItem(id);

        if (saved !== null) {

            input.checked =
                saved === "true";

        }


        input.addEventListener(
            "change",
            () => {

                localStorage.setItem(
                    id,
                    String(input.checked)
                );

            }
        );

    });

}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            keys[event.key.toLowerCase()] =
                true;

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                const prompt =
                    $("gamePrompt");

                if (prompt) {

                    prompt.focus();

                }

            }

            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                const activePage =
                    $("page-create");

                if (
                    activePage &&
                    activePage.classList.contains(
                        "active"
                    )
                ) {

                    analyzeGameIdea();

                }

            }

        }
    );


    document.addEventListener(
        "keyup",
        event => {

            keys[event.key.toLowerCase()] =
                false;

        }
    );

}


/* =========================================================
   3D ENGINE
========================================================= */

function initialize3D() {

    if (gameInitialized) {

        resize3D();

        return;

    }


    const canvas =
        $("gameCanvas");

    const viewport =
        $("gameViewport");

    if (!canvas || !viewport) return;


    if (
        typeof THREE === "undefined"
    ) {

        setRuntimeStatus(
            "🔴 Three.js indisponible"
        );

        show3DError();

        return;

    }


    try {

        scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(0x8eb6d8);


        scene.fog =
            new THREE.Fog(
                0x8eb6d8,
                35,
                180
            );


        camera =
            new THREE.PerspectiveCamera(
                60,
                1,
                0.1,
                500
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
                window.devicePixelRatio,
                1.8
            )
        );


        renderer.shadowMap.enabled =
            true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        renderer.outputColorSpace =
            THREE.SRGBColorSpace;


        createWorld();

        createPlayerCar();

        setup3DControls();

        resize3D();

        window.addEventListener(
            "resize",
            resize3D
        );


        gameInitialized = true;

        setRuntimeStatus(
            "🟢 Moteur 3D prêt"
        );


        const loading =
            $("gameLoading");

        if (loading) {

            loading.classList.add(
                "hidden"
            );

        }


        render3D();

    } catch (error) {

        console.error(
            "ZENTRO 3D ERROR:",
            error
        );

        setRuntimeStatus(
            "🔴 Erreur moteur 3D"
        );

        show3DError();

    }

}


/* =========================================================
   WORLD
========================================================= */

function createWorld() {

    /* CIEL */

    const sky =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                250,
                32,
                16
            ),
            new THREE.MeshBasicMaterial({
                color: 0x9ec7e8,
                side: THREE.BackSide
            })
        );

    scene.add(sky);


    /* LUMIERE */

    const ambient =
        new THREE.HemisphereLight(
            0xffffff,
            0x4b5360,
            2.1
        );

    scene.add(ambient);


    const sun =
        new THREE.DirectionalLight(
            0xffffff,
            3.2
        );

    sun.position.set(
        40,
        70,
        20
    );

    sun.castShadow = true;

    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;

    sun.shadow.camera.left = -100;
    sun.shadow.camera.right = 100;
    sun.shadow.camera.top = 100;
    sun.shadow.camera.bottom = -100;

    scene.add(sun);


    /* SOL */

    const ground =
        new THREE.Mesh(

            new THREE.PlaneGeometry(
                500,
                500
            ),

            new THREE.MeshStandardMaterial({
                color: 0x3e5b42,
                roughness: 1
            })

        );

    ground.rotation.x =
        -Math.PI / 2;

    ground.receiveShadow = true;

    scene.add(ground);


    createRoads();

    createBuildings();

    createTrees();

    createStreetLights();

}


/* =========================================================
   ROADS
========================================================= */

function createRoads() {

    roadGroup =
        new THREE.Group();

    scene.add(roadGroup);


    const roadMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x242832,
            roughness: 0.9
        });


    const roadPositions = [

        {
            x: 0,
            z: 0,
            w: 16,
            d: 180
        },

        {
            x: 0,
            z: 0,
            w: 180,
            d: 16
        },

        {
            x: 55,
            z: 0,
            w: 12,
            d: 180
        },

        {
            x: -55,
            z: 0,
            w: 12,
            d: 180
        }

    ];


    roadPositions.forEach(data => {

        const road =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    data.w,
                    0.12,
                    data.d
                ),

                roadMaterial

            );

        road.position.set(
            data.x,
            0.06,
            data.z
        );

        road.receiveShadow = true;

        roadGroup.add(road);


        /* MARQUAGE */

        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xf5d96c
            });


        if (data.w < data.d) {

            for (
                let z = -85;
                z <= 85;
                z += 9
            ) {

                const line =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            0.18,
                            0.04,
                            4
                        ),

                        lineMaterial

                    );

                line.position.set(
                    data.x,
                    0.14,
                    z
                );

                roadGroup.add(line);

            }

        } else {

            for (
                let x = -85;
                x <= 85;
                x += 9
            ) {

                const line =
                    new THREE.Mesh(

                        new THREE.BoxGeometry(
                            4,
                            0.04,
                            0.18
                        ),

                        lineMaterial

                    );

                line.position.set(
                    x,
                    0.14,
                    data.z
                );

                roadGroup.add(line);

            }

        }

    });

}


/* =========================================================
   BUILDINGS
========================================================= */

function createBuildings() {

    const buildingMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x707887,
            roughness: 0.75
        });


    const windowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x9edcff
        });


    const positions = [];

    for (
        let x = -90;
        x <= 90;
        x += 18
    ) {

        for (
            let z = -90;
            z <= 90;
            z += 18
        ) {

            if (
                Math.abs(x) < 13 ||
                Math.abs(z) < 13
            ) {
                continue;
            }

            positions.push({
                x,
                z
            });

        }

    }


    positions.forEach(position => {

        const width =
            8 + Math.random() * 6;

        const depth =
            8 + Math.random() * 6;

        const height =
            8 + Math.random() * 30;


        const building =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    width,
                    height,
                    depth
                ),

                buildingMaterial.clone()

            );


        building.position.set(
            position.x,
            height / 2,
            position.z
        );


        building.castShadow = true;
        building.receiveShadow = true;


        scene.add(building);


        /* FENETRES */

        for (
            let y = 5;
            y < height - 2;
            y += 4
        ) {

            const window =
                new THREE.Mesh(

                    new THREE.BoxGeometry(
                        width * 0.55,
                        0.65,
                        0.08
                    ),

                    windowMaterial

                );


            window.position.set(
                position.x,
                y,
                position.z -
                depth / 2 -
                0.05
            );


            scene.add(window);

        }

    });

}


/* =========================================================
   TREES
========================================================= */

function createTrees() {

    const trunkMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x5b3925
        });

    const leavesMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x2d7c45
        });


    for (
        let i = 0;
        i < 70;
        i++
    ) {

        const x =
            -100 +
            Math.random() * 200;

        const z =
            -100 +
            Math.random() * 200;


        if (
            Math.abs(x) < 10 ||
            Math.abs(z) < 10
        ) {

            continue;

        }


        const trunk =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.35,
                    0.45,
                    3,
                    8
                ),

                trunkMaterial

            );


        trunk.position.set(
            x,
            1.5,
            z
        );


        trunk.castShadow = true;

        scene.add(trunk);


        const leaves =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    2.3,
                    12,
                    10
                ),

                leavesMaterial

            );


        leaves.position.set(
            x,
            4.2,
            z
        );


        leaves.castShadow = true;

        scene.add(leaves);

    }

}


/* =========================================================
   STREET LIGHTS
========================================================= */

function createStreetLights() {

    const poleMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x252a31,
            metalness: 0.7,
            roughness: 0.4
        });


    for (
        let z = -80;
        z <= 80;
        z += 20
    ) {

        createLamp(
            -10,
            z,
            poleMaterial
        );

        createLamp(
            10,
            z,
            poleMaterial
        );

    }

}


function createLamp(
    x,
    z,
    material
) {

    const pole =
        new THREE.Mesh(

            new THREE.CylinderGeometry(
                0.12,
                0.15,
                5,
                8
            ),

            material

        );


    pole.position.set(
        x,
        2.5,
        z
    );


    pole.castShadow = true;

    scene.add(pole);


    const lamp =
        new THREE.PointLight(
            0xffe6aa,
            1.5,
            12
        );


    lamp.position.set(
        x,
        5.2,
        z
    );


    scene.add(lamp);

}


/* =========================================================
   PLAYER CAR
========================================================= */

function createPlayerCar() {

    playerCar =
        new THREE.Group();


    /* CARROSSERIE */

    const bodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111217,
            metalness: 0.75,
            roughness: 0.24
        });


    const body =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                2.2,
                0.55,
                4.4
            ),

            bodyMaterial

        );


    body.position.y =
        0.75;

    body.castShadow = true;

    playerCar.add(body);


    /* HABITACLE */

    const cabinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111827,
            metalness: 0.4,
            roughness: 0.15
        });


    const cabin =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                1.55,
                0.62,
                2.1
            ),

            cabinMaterial

        );


    cabin.position.set(
        0,
        1.2,
        -0.15
    );


    cabin.castShadow = true;

    playerCar.add(cabin);


    /* ROUES */

    const wheelMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x090a0c,
            metalness: 0.5,
            roughness: 0.7
        });


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.42,
            0.42,
            0.3,
            20
        );


    const wheelPositions = [

        [-1.05, 0.43, -1.35],
        [1.05, 0.43, -1.35],
        [-1.05, 0.43, 1.35],
        [1.05, 0.43, 1.35]

    ];


    wheelPositions.forEach(position => {

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                wheelMaterial
            );


        wheel.rotation.z =
            Math.PI / 2;


        wheel.position.set(
            position[0],
            position[1],
            position[2]
        );


        wheel.castShadow = true;

        playerCar.add(wheel);

    });


    /* PHARES */

    const headlightMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xeaf7ff
        });


    [-0.65, 0.65].forEach(x => {

        const light =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    0.35,
                    0.16,
                    0.06
                ),

                headlightMaterial

            );


        light.position.set(
            x,
            0.84,
            -2.22
        );


        playerCar.add(light);

    });


    playerCar.position.set(
        0,
        0,
        5
    );


    scene.add(playerCar);


    camera.position.set(
        0,
        4.5,
        12
    );

}


/* =========================================================
   CONTROLES 3D
========================================================= */

function setup3DControls() {

    const launch =
        $("launchGameButton");

    const reset =
        $("resetGameButton");

    const fullscreen =
        $("fullscreenGameButton");


    if (launch) {

        launch.addEventListener(
            "click",
            toggleGame
        );

    }


    if (reset) {

        reset.addEventListener(
            "click",
            resetGame
        );

    }


    if (fullscreen) {

        fullscreen.addEventListener(
            "click",
            fullscreenGame
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            keys[event.key.toLowerCase()] =
                true;

        }
    );


    document.addEventListener(
        "keyup",
        event => {

            keys[event.key.toLowerCase()] =
                false;

        }
    );


    let dragging = false;
    let lastMouseX = 0;


    const viewport =
        $("gameViewport");


    if (viewport) {

        viewport.addEventListener(
            "mousedown",
            event => {

                dragging = true;

                lastMouseX =
                    event.clientX;

            }
        );


        window.addEventListener(
            "mouseup",
            () => {

                dragging = false;

            }
        );


        viewport.addEventListener(
            "mousemove",
            event => {

                if (!dragging) return;

                const delta =
                    event.clientX -
                    lastMouseX;

                cameraAngle -=
                    delta * 0.005;

                lastMouseX =
                    event.clientX;

            }
        );

    }

}


/* =========================================================
   GAME LOOP
========================================================= */

function render3D() {

    animationFrame =
        requestAnimationFrame(
            render3D
        );


    const now =
        performance.now();

    const delta =
        Math.min(
            (now - lastTime) / 1000,
            0.05
        );

    lastTime = now;


    if (
        gameRunning &&
        playerCar
    ) {

        updateCar(delta);

    }


    updateCamera();


    if (renderer && scene && camera) {

        renderer.render(
            scene,
            camera
        );

    }


    updateFPS();

}


/* =========================================================
   CAR UPDATE
========================================================= */

function updateCar(delta) {

    if (!playerCar) return;


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
        boost ? 25 : 14;


    const maxSpeed =
        boost ? 30 : 18;


    if (forward) {

        carSpeed +=
            acceleration * delta;

    } else if (backward) {

        carSpeed -=
            acceleration * delta;

    } else {

        carSpeed *=
            Math.pow(
                0.08,
                delta
            );

    }


    carSpeed =
        Math.max(
            -8,
            Math.min(
                maxSpeed,
                carSpeed
            )
        );


    const steering =
        (right ? 1 : 0) -
        (left ? 1 : 0);


    if (
        Math.abs(carSpeed) > 0.2
    ) {

        playerCar.rotation.y -=
            steering *
            1.5 *
            delta *
            Math.sign(carSpeed);

    }


    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    direction.applyQuaternion(
        playerCar.quaternion
    );


    playerCar.position.addScaledVector(
        direction,
        carSpeed * delta
    );


    playerCar.position.y = 0;


    /* limites du monde */

    playerCar.position.x =
        Math.max(
            -105,
            Math.min(
                105,
                playerCar.position.x
            )
        );


    playerCar.position.z =
        Math.max(
            -105,
            Math.min(
                105,
                playerCar.position.z
            )
        );

}


/* =========================================================
   CAMERA
========================================================= */

function updateCamera() {

    if (
        !camera ||
        !playerCar
    ) return;


    const offset =
        new THREE.Vector3(

            Math.sin(cameraAngle) *
                cameraDistance,

            4.2,

            Math.cos(cameraAngle) *
                cameraDistance

        );


    const target =
        playerCar.position.clone();

    target.y += 1.2;


    const desired =
        playerCar.position
            .clone()
            .add(offset);


    camera.position.lerp(
        desired,
        0.08
    );


    camera.lookAt(
        target
    );

}


/* =========================================================
   FPS
========================================================= */

function updateFPS() {

    frameCount++;

    const now =
        performance.now();


    if (
        now - fpsTimer >= 1000
    ) {

        const fps =
            frameCount;


        frameCount = 0;

        fpsTimer = now;


        const display =
            $("hudFPS");


        if (display) {

            display.textContent =
                fps + " FPS";

        }

    }

}


/* =========================================================
   RESIZE
========================================================= */

function resize3D() {

    if (
        !renderer ||
        !camera
    ) return;


    const viewport =
        $("gameViewport");


    if (!viewport) return;


    const width =
        viewport.clientWidth;


    const height =
        viewport.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) return;


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    renderer.setSize(
        width,
        height,
        false
    );

}


/* =========================================================
   LAUNCH / RESET
========================================================= */

function toggleGame() {

    if (!gameInitialized) {

        initialize3D();

    }


    gameRunning =
        !gameRunning;


    const button =
        $("launchGameButton");


    if (button) {

        button.textContent =
            gameRunning
                ? "⏸ Pause"
                : "▶ Lancer le jeu";

    }


    setRuntimeStatus(
        gameRunning
            ? "🟢 Jeu en cours"
            : "🟡 Jeu en pause"
    );

}


function resetGame() {

    if (!playerCar) return;


    playerCar.position.set(
        0,
        0,
        5
    );


    playerCar.rotation.set(
        0,
        0,
        0
    );


    carSpeed = 0;

    cameraAngle = 0;


    gameRunning = false;


    const button =
        $("launchGameButton");


    if (button) {

        button.textContent =
            "▶ Lancer le jeu";

    }


    setRuntimeStatus(
        "🟡 Jeu réinitialisé"
    );

}


/* =========================================================
   FULLSCREEN
========================================================= */

function fullscreenGame() {

    const viewport =
        $("gameViewport");

    if (!viewport) return;


    if (!document.fullscreenElement) {

        viewport.requestFullscreen?.();

    } else {

        document.exitFullscreen?.();

    }

}


/* =========================================================
   STATUS
========================================================= */

function setRuntimeStatus(text) {

    const status =
        $("gameRuntimeStatus");

    if (status) {

        status.textContent =
            text;

    }

}


/* =========================================================
   3D ERROR
========================================================= */

function show3DError() {

    const loading =
        $("gameLoading");

    if (!loading) return;


    loading.classList.remove(
        "hidden"
    );


    loading.innerHTML = `

        <div class="loading-title">
            ⚠️ Moteur 3D indisponible
        </div>

        <div class="loading-subtitle">
            Vérifie que Three.js est chargé.
        </div>

    `;

}


/* =========================================================
   MESSAGE
========================================================= */

function showTemporaryMessage(
    message
) {

    const existing =
        document.querySelector(
            ".zentro-toast"
        );


    if (existing) {
        existing.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "zentro-toast";


    toast.textContent =
        message;


    Object.assign(
        toast.style,
        {

            position: "fixed",
            right: "22px",
            bottom: "22px",
            zIndex: "99999",

            padding: "13px 17px",

            border:
                "1px solid rgba(124,92,255,.5)",

            borderRadius: "10px",

            background:
                "rgba(10,14,22,.96)",

            color: "white",

            fontSize: "12px",

            boxShadow:
                "0 10px 35px rgba(0,0,0,.35)"

        }
    );


    document.body.appendChild(
        toast
    );


    setTimeout(() => {

        toast.remove();

    }, 2500);

}


/* =========================================================
   UTILITAIRES
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function timeNow() {

    return new Date()
        .toLocaleTimeString(
            "fr-FR",
            {
                hour12: false
            }
        );

}
