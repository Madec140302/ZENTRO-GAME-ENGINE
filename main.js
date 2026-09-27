/* =========================================================
   ZENTRO GAME ENGINE V3
   AI Game Creator + 3D Game Preview
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIG
    // =====================================================

    const STORAGE_KEY = "zentroProjects";

    let currentSpec = null;
    let isBuilding = false;

    // =====================================================
    // DOM
    // =====================================================

    const bootScreen = document.getElementById("bootScreen");
    const bootProgress = document.getElementById("bootProgress");
    const bootMessage = document.getElementById("bootMessage");
    const app = document.getElementById("app");

    const navButtons = document.querySelectorAll(".nav-button");
    const pages = document.querySelectorAll(".page");

    const newProjectButton =
        document.getElementById("newProjectButton");

    const gamePrompt =
        document.getElementById("gamePrompt");

    const quickButtons =
        document.querySelectorAll(".quick-button");

    const platform =
        document.getElementById("platform");

    const dimension =
        document.getElementById("dimension");

    const priority =
        document.getElementById("priority");

    const realism =
        document.getElementById("realism");

    const realismValue =
        document.getElementById("realismValue");

    const analyzeButton =
        document.getElementById("analyzeButton");

    const understandingStatus =
        document.getElementById("understandingStatus");

    const understandingContent =
        document.getElementById("understandingContent");

    const approvalPanel =
        document.getElementById("approvalPanel");

    const projectSpecification =
        document.getElementById("projectSpecification");

    const editButton =
        document.getElementById("editButton");

    const generateButton =
        document.getElementById("generateButton");

    const generationPanel =
        document.getElementById("generationPanel");

    const buildStatus =
        document.getElementById("buildStatus");

    const agentPipeline =
        document.getElementById("agentPipeline");

    const buildProgress =
        document.getElementById("buildProgress");

    const buildLog =
        document.getElementById("buildLog");

    const projectsList =
        document.getElementById("projectsList");

    const agentCards =
        document.getElementById("agentCards");

    const realismDashboard =
        document.getElementById("realismDashboard");

    // =====================================================
    // GAME PREVIEW DOM
    // =====================================================

    const gameViewport =
        document.getElementById("gameViewport");

    const gameCanvas =
        document.getElementById("gameCanvas");

    const gameLoading =
        document.getElementById("gameLoading");

    const gameHUD =
        document.getElementById("gameHUD");

    const launchGameButton =
        document.getElementById("launchGameButton");

    const resetGameButton =
        document.getElementById("resetGameButton");

    const fullscreenGameButton =
        document.getElementById("fullscreenGameButton");

    const gameRuntimeStatus =
        document.getElementById("gameRuntimeStatus");

    const hudFPS =
        document.getElementById("hudFPS");


    // =====================================================
    // UTILITAIRES
    // =====================================================

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    function getProjects() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];
        } catch {
            return [];
        }
    }


    function saveProjects(projects) {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(projects)
        );
    }


    function addLog(message, type = "") {

        if (!buildLog) return;

        const line =
            document.createElement("div");

        line.className =
            `log-line ${type}`;

        const time =
            new Date().toLocaleTimeString(
                "fr-FR",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

        line.innerHTML =
            `<span class="log-time">[${time}]</span> ${escapeHTML(message)}`;

        buildLog.appendChild(line);

        buildLog.scrollTop =
            buildLog.scrollHeight;
    }


    // =====================================================
    // BOOT
    // =====================================================

    async function bootSequence() {

        if (!bootScreen || !app) {
            return;
        }

        const messages = [
            "Initialisation de Zentro AI OS...",
            "Chargement du Game Engine...",
            "Initialisation des agents IA...",
            "Chargement du Realism Engine...",
            "Initialisation du runtime 3D...",
            "Vérification des systèmes...",
            "Zentro est prêt."
        ];

        for (
            let i = 0;
            i <= 100;
            i += 4
        ) {

            if (bootProgress) {
                bootProgress.style.width =
                    `${i}%`;
            }

            const index =
                Math.min(
                    messages.length - 1,
                    Math.floor(i / 16)
                );

            if (bootMessage) {
                bootMessage.textContent =
                    messages[index];
            }

            await sleep(35);
        }

        await sleep(300);

        bootScreen.classList.add("hidden");
        app.classList.add("visible");
    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    function showPage(pageName) {

        pages.forEach(page => {
            page.classList.remove("active");
        });

        navButtons.forEach(button => {
            button.classList.remove("active");
        });

        const target =
            document.getElementById(
                `page-${pageName}`
            );

        const button =
            document.querySelector(
                `.nav-button[data-page="${pageName}"]`
            );

        if (target) {
            target.classList.add("active");
        }

        if (button) {
            button.classList.add("active");
        }

        if (
            pageName === "preview" &&
            typeof init3DGame === "function"
        ) {
            setTimeout(() => {
                init3DGame();
            }, 100);
        }
    }


    navButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                if (page) {
                    showPage(page);
                }
            }
        );

    });


    // =====================================================
    // NOUVEAU PROJET
    // =====================================================

    if (newProjectButton) {

        newProjectButton.addEventListener(
            "click",
            () => {

                showPage("create");

                setTimeout(() => {

                    if (gamePrompt) {
                        gamePrompt.focus();
                    }

                }, 100);

            }
        );

    }


    // =====================================================
    // QUICK PROMPTS
    // =====================================================

    const quickTexts = {

        openworld:
            "Je veux un monde ouvert réaliste avec une grande ville, des quartiers résidentiels, des routes, des autoroutes, une campagne et beaucoup de bâtiments explorables.",

        driving:
            "Je veux un système de conduite réaliste avec voitures détaillées, physique crédible, trafic dynamique, météo, jour et nuit et personnalisation des véhicules.",

        npc:
            "Je veux une population vivante avec des PNJ ayant des comportements différents, des voitures autonomes, des piétons, des commerces et une circulation dynamique.",

        weather:
            "Je veux un système météo dynamique avec soleil, nuages, pluie, brouillard, changements de lumière, flaques d'eau et ambiance réaliste."
    };


    quickButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const key =
                    button.dataset.fill;

                if (
                    !gamePrompt ||
                    !quickTexts[key]
                ) {
                    return;
                }

                if (gamePrompt.value.trim()) {

                    gamePrompt.value +=
                        "\n\n" +
                        quickTexts[key];

                } else {

                    gamePrompt.value =
                        quickTexts[key];

                }

                gamePrompt.focus();

            }
        );

    });


    // =====================================================
    // REALISME
    // =====================================================

    if (realism && realismValue) {

        realism.addEventListener(
            "input",
            () => {

                realismValue.textContent =
                    `${realism.value}%`;

            }
        );

    }


    // =====================================================
    // DÉTECTION DES SYSTÈMES
    // =====================================================

    function detectSystems(prompt) {

        const text =
            prompt.toLowerCase();

        const systems = [];

        const rules = [

            {
                names: [
                    "Monde ouvert",
                    "World Builder"
                ],
                keywords: [
                    "monde ouvert",
                    "open world",
                    "ville",
                    "map",
                    "quartier",
                    "campagne"
                ]
            },

            {
                names: [
                    "Conduite & véhicules",
                    "Vehicle AI"
                ],
                keywords: [
                    "voiture",
                    "voitures",
                    "véhicule",
                    "véhicules",
                    "conduite",
                    "course",
                    "racing",
                    "trafic"
                ]
            },

            {
                names: [
                    "PNJ intelligents",
                    "NPC AI"
                ],
                keywords: [
                    "pnj",
                    "npc",
                    "piéton",
                    "population",
                    "personnage",
                    "habitants"
                ]
            },

            {
                names: [
                    "Météo & environnement",
                    "Weather"
                ],
                keywords: [
                    "météo",
                    "pluie",
                    "soleil",
                    "nuage",
                    "brouillard",
                    "orage",
                    "jour",
                    "nuit"
                ]
            },

            {
                names: [
                    "Missions & gameplay",
                    "Gameplay"
                ],
                keywords: [
                    "mission",
                    "missions",
                    "objectif",
                    "livraison",
                    "garage",
                    "argent",
                    "économie"
                ]
            },

            {
                names: [
                    "Personnalisation",
                    "Customization"
                ],
                keywords: [
                    "tuning",
                    "personnalisation",
                    "customisation",
                    "jantes",
                    "moteur",
                    "carrosserie"
                ]
            },

            {
                names: [
                    "Graphismes réalistes",
                    "Visuals"
                ],
                keywords: [
                    "réaliste",
                    "réalisme",
                    "graphisme",
                    "graphismes",
                    "ultra",
                    "photorealiste",
                    "cinématique"
                ]
            },

            {
                names: [
                    "Audio immersif",
                    "Audio"
                ],
                keywords: [
                    "son",
                    "sons",
                    "audio",
                    "musique",
                    "moteur",
                    "échappement"
                ]
            }

        ];


        rules.forEach(rule => {

            const found =
                rule.keywords.some(
                    keyword =>
                        text.includes(keyword)
                );

            if (found) {
                systems.push(rule.names);
            }

        });


        if (systems.length === 0) {

            systems.push(
                [
                    "Gameplay général",
                    "Core Gameplay"
                ],
                [
                    "Monde",
                    "World Builder"
                ],
                [
                    "Interface",
                    "UI"
                ]
            );

        }

        return systems;
    }


    // =====================================================
    // TITRE
    // =====================================================

    function generateTitle(prompt) {

        const text =
            prompt.toLowerCase();

        if (
            text.includes("voiture") ||
            text.includes("conduite") ||
            text.includes("racing")
        ) {
            return "Zentro Drive";
        }

        if (
            text.includes("monde ouvert") ||
            text.includes("open world")
        ) {
            return "Zentro Open World";
        }

        if (
            text.includes("espace") ||
            text.includes("space")
        ) {
            return "Zentro Galaxy";
        }

        return "Zentro Game";
    }


    // =====================================================
    // ANALYSE
    // =====================================================

    function analyzePrompt() {

        if (!gamePrompt) {
            return;
        }

        const prompt =
            gamePrompt.value.trim();

        if (!prompt) {

            if (understandingStatus) {
                understandingStatus.textContent =
                    "Écrivez votre idée";
            }

            if (understandingContent) {

                understandingContent.innerHTML = `
                    <p>
                        Décrivez le jeu que vous voulez créer.
                        Zentro analysera ensuite votre vision.
                    </p>
                `;

            }

            return;
        }


        const systems =
            detectSystems(prompt);


        currentSpec = {

            id: Date.now(),

            title:
                generateTitle(prompt),

            prompt,

            platform:
                platform
                    ? platform.value
                    : "PC",

            dimension:
                dimension
                    ? dimension.value
                    : "3D",

            priority:
                priority
                    ? priority.value
                    : "Réalisme",

            realism:
                realism
                    ? Number(realism.value)
                    : 90,

            systems,

            createdAt:
                new Date().toISOString()

        };


        if (understandingStatus) {

            understandingStatus.textContent =
                "Vision comprise ✓";

        }


        if (understandingContent) {

            understandingContent.innerHTML = `

                <div class="understanding-grid">

                    <div>
                        <strong>
                            Vision détectée
                        </strong>

                        <p>
                            Zentro a analysé ta description
                            et va construire le jeu autour
                            de tes priorités.
                        </p>
                    </div>

                    <div>
                        <strong>
                            Systèmes détectés
                        </strong>

                        <p>
                            ${systems.length}
                            systèmes principaux
                        </p>
                    </div>

                    <div>
                        <strong>
                            Niveau de réalisme
                        </strong>

                        <p>
                            ${currentSpec.realism}%
                        </p>
                    </div>

                </div>

            `;

        }


        renderSpecification();


        if (approvalPanel) {
            approvalPanel.classList.add("visible");
        }

        if (generationPanel) {
            generationPanel.classList.remove("visible");
        }


        setTimeout(() => {

            approvalPanel?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 150);

    }


    if (analyzeButton) {

        analyzeButton.addEventListener(
            "click",
            analyzePrompt
        );

    }


    // =====================================================
    // SPECIFICATION
    // =====================================================

    function renderSpecification() {

        if (
            !projectSpecification ||
            !currentSpec
        ) {
            return;
        }

        const systemHTML =
            currentSpec.systems
                .map(system => `

                    <div class="spec">

                        <span>
                            ${escapeHTML(system[0])}
                        </span>

                        <small>
                            ${escapeHTML(system[1])}
                        </small>

                    </div>

                `)
                .join("");


        projectSpecification.innerHTML = `

            <div class="specification-grid">

                <div class="spec">
                    <span>Nom du projet</span>
                    <strong>
                        ${escapeHTML(currentSpec.title)}
                    </strong>
                </div>

                <div class="spec">
                    <span>Plateforme</span>
                    <strong>
                        ${escapeHTML(currentSpec.platform)}
                    </strong>
                </div>

                <div class="spec">
                    <span>Dimension</span>
                    <strong>
                        ${escapeHTML(currentSpec.dimension)}
                    </strong>
                </div>

                <div class="spec">
                    <span>Priorité</span>
                    <strong>
                        ${escapeHTML(currentSpec.priority)}
                    </strong>
                </div>

                <div class="spec">
                    <span>Realism Engine</span>
                    <strong>
                        ${currentSpec.realism}%
                    </strong>
                </div>

            </div>

            <div class="specification-systems">

                <h4>
                    Systèmes prévus
                </h4>

                <div class="specification-grid">

                    ${systemHTML}

                </div>

            </div>
        `;

    }


    // =====================================================
    // MODIFIER
    // =====================================================

    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                approvalPanel?.classList.remove(
                    "visible"
                );

                gamePrompt?.focus();

                gamePrompt?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );

    }


    // =====================================================
    // AGENTS
    // =====================================================

    const agents = [

        {
            icon: "🧠",
            name: "Zentro Director",
            description:
                "Comprend la vision du joueur et orchestre la génération."
        },

        {
            icon: "🌍",
            name: "World Builder",
            description:
                "Construit le monde, les villes, routes et environnements."
        },

        {
            icon: "🚗",
            name: "Vehicle AI",
            description:
                "Gère les véhicules, la conduite, le trafic et la physique."
        },

        {
            icon: "👤",
            name: "NPC AI",
            description:
                "Crée les PNJ et leurs comportements."
        },

        {
            icon: "🎨",
            name: "Visual Engine",
            description:
                "Gère les matériaux, éclairages et environnement."
        },

        {
            icon: "⚙️",
            name: "Systems Agent",
            description:
                "Programme missions, économie et gameplay."
        },

        {
            icon: "🎵",
            name: "Audio Agent",
            description:
                "Organise les sons et l'ambiance."
        },

        {
            icon: "🧪",
            name: "QA Agent",
            description:
                "Recherche les bugs et teste le jeu."
        },

        {
            icon: "🚀",
            name: "Optimizer",
            description:
                "Optimise les performances."
        }

    ];


    // =====================================================
    // AGENTS UI
    // =====================================================

    function renderAgents() {

        if (!agentCards) {
            return;
        }

        agentCards.innerHTML =
            agents.map(agent => `

                <div class="agent-card">

                    <div class="agent-card-icon">
                        ${agent.icon}
                    </div>

                    <div>

                        <h3>
                            ${escapeHTML(agent.name)}
                        </h3>

                        <p>
                            ${escapeHTML(agent.description)}
                        </p>

                    </div>

                </div>

            `).join("");

    }


    // =====================================================
    // PIPELINE
    // =====================================================

    function renderPipeline() {

        if (!agentPipeline) {
            return;
        }

        agentPipeline.innerHTML =
            agents.map(
                (agent, index) => `

                    <div
                        class="agent-step"
                        id="agent-step-${index}"
                    >

                        <div class="agent-icon">
                            ${agent.icon}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(agent.name)}
                            </strong>

                            <span>
                                En attente...
                            </span>

                        </div>

                    </div>

                `
            ).join("");

    }


    // =====================================================
    // GÉNÉRATION SIMULÉE
    // =====================================================

    async function generateGame() {

        if (
            isBuilding ||
            !currentSpec
        ) {
            return;
        }

        isBuilding = true;


        approvalPanel?.classList.remove(
            "visible"
        );

        generationPanel?.classList.add(
            "visible"
        );


        if (buildLog) {
            buildLog.innerHTML = "";
        }

        if (buildProgress) {
            buildProgress.style.width = "0%";
        }

        if (buildStatus) {
            buildStatus.textContent =
                "INITIALISATION";
        }


        renderPipeline();


        addLog(
            "Nouvelle génération Zentro démarrée.",
            "info"
        );

        addLog(
            `Projet : ${currentSpec.title}`,
            "info"
        );

        addLog(
            `Realism Engine : ${currentSpec.realism}%`,
            "info"
        );


        await sleep(500);


        for (
            let i = 0;
            i < agents.length;
            i++
        ) {

            const agent =
                agents[i];

            const step =
                document.getElementById(
                    `agent-step-${i}`
                );


            if (buildStatus) {
                buildStatus.textContent =
                    `${agent.name.toUpperCase()}...`;
            }


            if (buildProgress) {

                buildProgress.style.width =
                    `${Math.round(
                        (i / agents.length) * 100
                    )}%`;

            }


            if (step) {

                step.classList.add(
                    "working"
                );

                const state =
                    step.querySelector("span");

                if (state) {
                    state.textContent =
                        "Travail en cours...";
                }

            }


            addLog(
                `${agent.name} : démarrage.`,
                "info"
            );


            await sleep(
                400 +
                Math.random() * 350
            );


            if (step) {

                step.classList.remove(
                    "working"
                );

                step.classList.add(
                    "completed"
                );

                const state =
                    step.querySelector("span");

                if (state) {
                    state.textContent =
                        "Terminé ✓";
                }

            }


            addLog(
                `${agent.name} : terminé ✓`,
                "success"
            );

        }


        if (buildProgress) {
            buildProgress.style.width = "100%";
        }

        if (buildStatus) {
            buildStatus.textContent =
                "READY ✓";
        }


        addLog(
            "Build terminé avec succès.",
            "success"
        );


        saveProject(currentSpec);

        renderProjects();

        isBuilding = false;

    }


    if (generateButton) {

        generateButton.addEventListener(
            "click",
            generateGame
        );

    }


    // =====================================================
    // PROJETS
    // =====================================================

    function saveProject(project) {

        const projects =
            getProjects();

        const saved = {
            ...project,
            status: "READY",
            updatedAt:
                new Date().toISOString()
        };

        projects.unshift(saved);

        saveProjects(
            projects.slice(0, 20)
        );

    }


    function renderProjects() {

        if (!projectsList) {
            return;
        }

        const projects =
            getProjects();


        if (projects.length === 0) {

            projectsList.innerHTML = `

                <div class="empty-content">

                    <div class="empty-icon">
                        🎮
                    </div>

                    <h3>
                        Aucun projet
                    </h3>

                    <p>
                        Créez votre premier jeu
                        avec Zentro Game Engine.
                    </p>

                </div>

            `;

            return;
        }


        projectsList.innerHTML =
            projects.map(
                project => `

                    <div class="project-card">

                        <div class="project-card-main">

                            <div class="project-icon">
                                🎮
                            </div>

                            <div>

                                <h3>
                                    ${escapeHTML(
                                        project.title
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        project.prompt
                                            .substring(
                                                0,
                                                150
                                            )
                                    )}
                                </p>

                            </div>

                        </div>

                        <div class="project-card-meta">

                            <span>
                                ${escapeHTML(
                                    project.platform
                                )}
                            </span>

                            <span>
                                ${project.realism}%
                            </span>

                            <span>
                                READY
                            </span>

                        </div>

                    </div>

                `
            ).join("");

    }


    // =====================================================
    // REALISM ENGINE
    // =====================================================

    const realismModules = [

        {
            icon: "🌍",
            title: "Monde & environnement",
            value: "95%",
            description:
                "Densité du monde, bâtiments, routes et environnement."
        },

        {
            icon: "🚗",
            title: "Physique véhicules",
            value: "92%",
            description:
                "Suspension, accélération, freinage et adhérence."
        },

        {
            icon: "👤",
            title: "PNJ & population",
            value: "90%",
            description:
                "Comportements et population dynamique."
        },

        {
            icon: "🌦️",
            title: "Météo & lumière",
            value: "96%",
            description:
                "Cycle jour/nuit, météo et éclairage."
        },

        {
            icon: "🎧",
            title: "Audio immersif",
            value: "88%",
            description:
                "Moteurs, environnement et ambiance."
        },

        {
            icon: "🎬",
            title: "Animation",
            value: "91%",
            description:
                "Animations des personnages et véhicules."
        }

    ];


    function renderRealismDashboard() {

        if (!realismDashboard) {
            return;
        }

        realismDashboard.innerHTML =
            realismModules.map(
                module => `

                    <div class="realism-card">

                        <div class="realism-card-icon">
                            ${module.icon}
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(
                                    module.title
                                )}
                            </h3>

                            <strong>
                                ${module.value}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    module.description
                                )}
                            </p>

                        </div>

                    </div>

                `
            ).join("");

    }


    // =====================================================
    // =====================================================
    // ZENTRO 3D GAME RUNTIME
    // =====================================================
    // =====================================================

    let renderer = null;
    let scene = null;
    let camera = null;

    let player = null;
    let playerBody = null;

    let gameStarted = false;
    let gameInitialized = false;

    let clock = null;

    const keys = {};

    let cameraYaw = 0;
    let cameraPitch = 0.22;

    let mouseDown = false;

    let fpsFrames = 0;
    let fpsLastTime = performance.now();


    // -----------------------------------------------------
    // 3D WORLD
    // -----------------------------------------------------

    function init3DGame() {

        if (
            gameInitialized ||
            !gameCanvas ||
            !gameViewport
        ) {
            return;
        }


        if (
            typeof THREE === "undefined"
        ) {

            console.error(
                "Three.js n'est pas chargé."
            );

            if (gameLoading) {
                gameLoading.innerHTML = `
                    <strong>
                        Three.js indisponible
                    </strong>

                    <span>
                        Impossible d'initialiser le moteur 3D.
                    </span>
                `;
            }

            return;
        }


        gameInitialized = true;


        // -------------------------------------------------
        // SCENE
        // -------------------------------------------------

        scene =
            new THREE.Scene();

        scene.background =
            new THREE.Color(
                0x8db7d9
            );


        // -------------------------------------------------
        // CAMERA
        // -------------------------------------------------

        camera =
            new THREE.PerspectiveCamera(
                65,
                1,
                0.1,
                1000
            );

        camera.position.set(
            0,
            5,
            8
        );


        // -------------------------------------------------
        // RENDERER
        // -------------------------------------------------

        renderer =
            new THREE.WebGLRenderer({
                canvas: gameCanvas,
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


        renderer.shadowMap.enabled = true;

        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        if (
            "outputColorSpace" in renderer
        ) {

            renderer.outputColorSpace =
                THREE.SRGBColorSpace;

        }


        if (
            "toneMapping" in renderer
        ) {

            renderer.toneMapping =
                THREE.ACESFilmicToneMapping;

            renderer.toneMappingExposure =
                1.1;

        }


        // -------------------------------------------------
        // LIGHTS
        // -------------------------------------------------

        const hemi =
            new THREE.HemisphereLight(
                0xbfdcff,
                0x52604d,
                2.0
            );

        scene.add(hemi);


        const sun =
            new THREE.DirectionalLight(
                0xffffff,
                3.2
            );

        sun.position.set(
            80,
            100,
            40
        );

        sun.castShadow = true;

        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;

        sun.shadow.camera.left = -120;
        sun.shadow.camera.right = 120;
        sun.shadow.camera.top = 120;
        sun.shadow.camera.bottom = -120;

        scene.add(sun);


        // -------------------------------------------------
        // WORLD
        // -------------------------------------------------

        createGround();
        createRoadNetwork();
        createBuildings();
        createTrees();
        createStreetLights();
        createPlayerCar();


        // -------------------------------------------------
        // RESIZE
        // -------------------------------------------------

        resize3D();


        window.addEventListener(
            "resize",
            resize3D
        );


        // -------------------------------------------------
        // INPUT
        // -------------------------------------------------

        window.addEventListener(
            "keydown",
            event => {

                keys[
                    event.key.toLowerCase()
                ] = true;

                if (
                    event.key === " "
                ) {
                    keys.space = true;
                }

            }
        );


        window.addEventListener(
            "keyup",
            event => {

                keys[
                    event.key.toLowerCase()
                ] = false;

                if (
                    event.key === " "
                ) {
                    keys.space = false;
                }

            }
        );


        gameViewport.addEventListener(
            "mousedown",
            event => {

                if (!gameStarted) {
                    return;
                }

                mouseDown = true;

            }
        );


        window.addEventListener(
            "mouseup",
            () => {
                mouseDown = false;
            }
        );


        gameViewport.addEventListener(
            "mousemove",
            event => {

                if (
                    !gameStarted ||
                    !mouseDown ||
                    !player
                ) {
                    return;
                }

                cameraYaw -=
                    event.movementX *
                    0.003;

                cameraPitch -=
                    event.movementY *
                    0.002;

                cameraPitch =
                    Math.max(
                        -0.05,
                        Math.min(
                            0.65,
                            cameraPitch
                        )
                    );

            }
        );


        if (gameLoading) {
            gameLoading.style.display =
                "none";
        }


        if (gameHUD) {
            gameHUD.style.display =
                "block";
        }


        if (gameRuntimeStatus) {
            gameRuntimeStatus.textContent =
                "● READY";
        }


        clock =
            new THREE.Clock();


        animate3D();

    }


    // -----------------------------------------------------
    // GROUND
    // -----------------------------------------------------

    function createGround() {

        const geometry =
            new THREE.PlaneGeometry(
                500,
                500
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x40553e,
                roughness: 1
            });

        const ground =
            new THREE.Mesh(
                geometry,
                material
            );

        ground.rotation.x =
            -Math.PI / 2;

        ground.receiveShadow = true;

        scene.add(ground);

    }


    // -----------------------------------------------------
    // ROAD
    // -----------------------------------------------------

    function createRoad(
        x,
        z,
        width,
        length,
        rotation = 0
    ) {

        const geometry =
            new THREE.BoxGeometry(
                width,
                0.08,
                length
            );

        const material =
            new THREE.MeshStandardMaterial({
                color: 0x25282c,
                roughness: 0.95
            });

        const road =
            new THREE.Mesh(
                geometry,
                material
            );

        road.position.set(
            x,
            0.04,
            z
        );

        road.rotation.y =
            rotation;

        road.receiveShadow = true;

        scene.add(road);


        // Ligne centrale

        const lineMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xf2f2d0
            });


        const lineGeometry =
            new THREE.BoxGeometry(
                0.12,
                0.03,
                length
            );


        const line =
            new THREE.Mesh(
                lineGeometry,
                lineMaterial
            );


        line.position.set(
            x,
            0.10,
            z
        );

        line.rotation.y =
            rotation;

        scene.add(line);

    }


    function createRoadNetwork() {

        createRoad(
            0,
            0,
            16,
            420,
            0
        );

        createRoad(
            0,
            0,
            420,
            16,
            0
        );


        createRoad(
            90,
            0,
            12,
            420,
            0
        );


        createRoad(
            -90,
            0,
            12,
            420,
            0
        );


        createRoad(
            0,
            90,
            420,
            12,
            0
        );


        createRoad(
            0,
            -90,
            420,
            12,
            0
        );

    }


    // -----------------------------------------------------
    // BUILDINGS
    // -----------------------------------------------------

    function createBuildings() {

        const colors = [
            0x69717a,
            0x7c858e,
            0x59636d,
            0x8b8f91,
            0x4e5963
        ];


        const positions = [

            [-45, -45],
            [-25, -50],
            [25, -50],
            [45, -45],

            [-50, -20],
            [50, -20],

            [-50, 20],
            [50, 20],

            [-45, 45],
            [-25, 50],
            [25, 50],
            [45, 45],

            [-120, -80],
            [120, -80],
            [-120, 80],
            [120, 80],

            [-155, -30],
            [155, 30]

        ];


        positions.forEach(
            ([x, z], index) => {

                const width =
                    10 +
                    Math.random() * 12;

                const depth =
                    10 +
                    Math.random() * 12;

                const height =
                    8 +
                    Math.random() * 28;


                const geometry =
                    new THREE.BoxGeometry(
                        width,
                        height,
                        depth
                    );


                const material =
                    new THREE.MeshStandardMaterial({
                        color:
                            colors[
                                index %
                                colors.length
                            ],
                        roughness: 0.8
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


                building.castShadow = true;
                building.receiveShadow = true;


                scene.add(building);


                // fenêtres

                createWindows(
                    building,
                    width,
                    height,
                    depth
                );

            }
        );

    }


    function createWindows(
        building,
        width,
        height,
        depth
    ) {

        const rows =
            Math.max(
                2,
                Math.floor(
                    height / 4
                )
            );

        const cols =
            Math.max(
                2,
                Math.floor(
                    width / 3
                )
            );


        const material =
            new THREE.MeshBasicMaterial({
                color: 0x8ed5ff
            });


        for (
            let row = 0;
            row < rows;
            row++
        ) {

            for (
                let col = 0;
                col < cols;
                col++
            ) {

                const windowGeometry =
                    new THREE.BoxGeometry(
                        0.8,
                        1.2,
                        0.08
                    );


                const windowMesh =
                    new THREE.Mesh(
                        windowGeometry,
                        material
                    );


                const x =
                    -width / 2 +
                    1.7 +
                    col * 3;


                const y =
                    2.2 +
                    row * 3.5;


                windowMesh.position.set(
                    x,
                    y,
                    depth / 2 + 0.05
                );


                building.add(
                    windowMesh
                );

            }

        }

    }


    // -----------------------------------------------------
    // TREES
    // -----------------------------------------------------

    function createTrees() {

        const positions = [

            [-70, -70],
            [-80, -50],
            [-75, 45],
            [-60, 70],

            [70, -70],
            [80, -50],
            [75, 45],
            [60, 70],

            [-140, 0],
            [140, 0],

            [0, -140],
            [0, 140]

        ];


        positions.forEach(
            ([x, z]) => {

                const group =
                    new THREE.Group();


                const trunk =
                    new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.5,
                            0.7,
                            5,
                            8
                        ),
                        new THREE.MeshStandardMaterial({
                            color: 0x60452e
                        })
                    );


                trunk.position.y =
                    2.5;

                trunk.castShadow = true;

                group.add(trunk);


                const crown =
                    new THREE.Mesh(
                        new THREE.SphereGeometry(
                            3.2,
                            12,
                            10
                        ),
                        new THREE.MeshStandardMaterial({
                            color: 0x2e6735,
                            roughness: 1
                        })
                    );


                crown.position.y =
                    6;

                crown.castShadow = true;

                group.add(crown);


                group.position.set(
                    x,
                    0,
                    z
                );


                scene.add(group);

            }
        );

    }


    // -----------------------------------------------------
    // STREET LIGHTS
    // -----------------------------------------------------

    function createStreetLights() {

        const positions = [];

        for (
            let i = -180;
            i <= 180;
            i += 30
        ) {

            positions.push(
                [7, i],
                [-7, i],
                [i, 7],
                [i, -7]
            );

        }


        positions.forEach(
            ([x, z]) => {

                const pole =
                    new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.12,
                            0.15,
                            5,
                            8
                        ),
                        new THREE.MeshStandardMaterial({
                            color: 0x33383d
                        })
                    );


                pole.position.set(
                    x,
                    2.5,
                    z
                );


                scene.add(pole);


                const lamp =
                    new THREE.Mesh(
                        new THREE.SphereGeometry(
                            0.3,
                            8,
                            8
                        ),
                        new THREE.MeshBasicMaterial({
                            color: 0xffe7a3
                        })
                    );


                lamp.position.set(
                    x,
                    5.1,
                    z
                );


                scene.add(lamp);

            }
        );

    }


    // -----------------------------------------------------
    // PLAYER CAR
    // -----------------------------------------------------

    function createPlayerCar() {

        player =
            new THREE.Group();


        playerBody =
            new THREE.Group();


        // carrosserie

        const body =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    2.5,
                    0.55,
                    4.5
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x111217,
                    metalness: 0.8,
                    roughness: 0.25
                })
            );


        body.position.y =
            0.75;

        body.castShadow = true;

        playerBody.add(body);


        // toit

        const roof =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.9,
                    0.5,
                    2.0
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x15171c,
                    metalness: 0.7,
                    roughness: 0.2
                })
            );


        roof.position.set(
            0,
            1.2,
            -0.15
        );


        roof.castShadow = true;

        playerBody.add(roof);


        // vitres

        const glass =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.75,
                    0.38,
                    1.5
                ),
                new THREE.MeshStandardMaterial({
                    color: 0x152738,
                    metalness: 0.2,
                    roughness: 0.1,
                    transparent: true,
                    opacity: 0.85
                })
            );


        glass.position.set(
            0,
            1.38,
            -0.15
        );


        playerBody.add(glass);


        // roues

        const wheelGeometry =
            new THREE.CylinderGeometry(
                0.45,
                0.45,
                0.32,
                20
            );


        const wheelMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x080808,
                roughness: 0.8
            });


        const wheelPositions = [

            [-1.25, 0.48, -1.45],
            [1.25, 0.48, -1.45],
            [-1.25, 0.48, 1.45],
            [1.25, 0.48, 1.45]

        ];


        wheelPositions.forEach(
            position => {

                const wheel =
                    new THREE.Mesh(
                        wheelGeometry,
                        wheelMaterial
                    );


                wheel.rotation.z =
                    Math.PI / 2;


                wheel.position.set(
                    ...position
                );


                wheel.castShadow = true;

                playerBody.add(wheel);

            }
        );


        // phares

        const headlightMaterial =
            new THREE.MeshBasicMaterial({
                color: 0xffffff
            });


        const leftLight =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.45,
                    0.18,
                    0.08
                ),
                headlightMaterial
            );


        leftLight.position.set(
            -0.75,
            0.82,
            -2.27
        );


        const rightLight =
            leftLight.clone();


        rightLight.position.x =
            0.75;


        playerBody.add(leftLight);
        playerBody.add(rightLight);


        player.add(playerBody);


        player.position.set(
            0,
            0,
            15
        );


        scene.add(player);

    }


    // -----------------------------------------------------
    // GAME UPDATE
    // -----------------------------------------------------

    function updatePlayer(delta) {

        if (
            !player ||
            !gameStarted
        ) {
            return;
        }


        let forward = 0;
        let side = 0;


        if (
            keys.w ||
            keys.z ||
            keys.arrowup
        ) {
            forward += 1;
        }


        if (
            keys.s ||
            keys.arrowdown
        ) {
            forward -= 1;
        }


        if (
            keys.a ||
            keys.q ||
            keys.arrowleft
        ) {
            side -= 1;
        }


        if (
            keys.d ||
            keys.arrowright
        ) {
            side += 1;
        }


        const speed =
            keys.shift
                ? 22
                : 12;


        if (
            forward !== 0 ||
            side !== 0
        ) {

            const direction =
                new THREE.Vector3(
                    side,
                    0,
                    -forward
                );


            direction.normalize();


            direction.applyAxisAngle(
                new THREE.Vector3(
                    0,
                    1,
                    0
                ),
                cameraYaw
            );


            player.position.x +=
                direction.x *
                speed *
                delta;


            player.position.z +=
                direction.z *
                speed *
                delta;


            player.rotation.y =
                Math.atan2(
                    direction.x,
                    direction.z
                );

        }

    }


    // -----------------------------------------------------
    // CAMERA
    // -----------------------------------------------------

    function updateCamera() {

        if (!player || !camera) {
            return;
        }


        const distance = 9;
        const height = 4.2;


        const offset =
            new THREE.Vector3(
                Math.sin(cameraYaw) * distance,
                height +
                    cameraPitch * 3,
                Math.cos(cameraYaw) * distance
            );


        const target =
            player.position.clone();


        target.y += 1;


        const desired =
            target.clone()
                .add(offset);


        camera.position.lerp(
            desired,
            0.12
        );


        camera.lookAt(
            target
        );

    }


    // -----------------------------------------------------
    // ANIMATION
    // -----------------------------------------------------

    function animate3D() {

        requestAnimationFrame(
            animate3D
        );


        if (!renderer || !scene || !camera) {
            return;
        }


        const delta =
            Math.min(
                clock
                    ? clock.getDelta()
                    : 0.016,
                0.05
            );


        updatePlayer(delta);

        updateCamera();


        renderer.render(
            scene,
            camera
        );


        // FPS

        fpsFrames++;

        const now =
            performance.now();


        if (
            now - fpsLastTime >= 1000
        ) {

            const fps =
                fpsFrames;


            if (hudFPS) {
                hudFPS.textContent =
                    `${fps} FPS`;
            }


            fpsFrames = 0;

            fpsLastTime =
                now;

        }

    }


    // -----------------------------------------------------
    // RESIZE
    // -----------------------------------------------------

    function resize3D() {

        if (
            !renderer ||
            !camera ||
            !gameViewport
        ) {
            return;
        }


        const width =
            gameViewport.clientWidth;

        const height =
            gameViewport.clientHeight;


        if (
            width <= 0 ||
            height <= 0
        ) {
            return;
        }


        camera.aspect =
            width / height;

        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );

    }


    // -----------------------------------------------------
    // LANCER
    // -----------------------------------------------------

    if (launchGameButton) {

        launchGameButton.addEventListener(
            "click",
            () => {

                init3DGame();

                gameStarted =
                    !gameStarted;


                if (gameStarted) {

                    launchGameButton.textContent =
                        "⏸ Pause";

                    if (gameRuntimeStatus) {
                        gameRuntimeStatus.textContent =
                            "● RUNNING";
                    }

                } else {

                    launchGameButton.textContent =
                        "▶ Lancer";

                    if (gameRuntimeStatus) {
                        gameRuntimeStatus.textContent =
                            "● PAUSED";
                    }

                }

            }
        );

    }


    // =====================================================
    // RESET
    // =====================================================

    if (resetGameButton) {

        resetGameButton.addEventListener(
            "click",
            () => {

                init3DGame();

                gameStarted = false;

                cameraYaw = 0;
                cameraPitch = 0.22;


                if (player) {

                    player.position.set(
                        0,
                        0,
                        15
                    );

                    player.rotation.set(
                        0,
                        0,
                        0
                    );

                }


                if (launchGameButton) {
                    launchGameButton.textContent =
                        "▶ Lancer";
                }


                if (gameRuntimeStatus) {
                    gameRuntimeStatus.textContent =
                        "● READY";
                }

            }
        );

    }


    // =====================================================
    // PLEIN ÉCRAN
    // =====================================================

    if (fullscreenGameButton) {

        fullscreenGameButton.addEventListener(
            "click",
            async () => {

                if (!gameViewport) {
                    return;
                }


                try {

                    if (
                        !document.fullscreenElement
                    ) {

                        await gameViewport
                            .requestFullscreen();

                    } else {

                        await document.exitFullscreen();

                    }

                } catch (error) {

                    console.warn(
                        "Fullscreen indisponible",
                        error
                    );

                }

            }
        );

    }


    // =====================================================
    // CLAVIER GLOBAL
    // =====================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                showPage("create");

                setTimeout(() => {
                    gamePrompt?.focus();
                }, 100);

            }


            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                if (
                    document.activeElement ===
                    gamePrompt
                ) {
                    analyzePrompt();
                }

            }

        }
    );


    // =====================================================
    // INITIALISATION
    // =====================================================

    renderAgents();

    renderProjects();

    renderRealismDashboard();

    bootSequence();

});
