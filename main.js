/* =========================================================
   ZENTRO AI OS — GAME ENGINE V2
   Frontend prototype
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // VARIABLES
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

    const newProjectButton = document.getElementById("newProjectButton");

    const gamePrompt = document.getElementById("gamePrompt");
    const quickButtons = document.querySelectorAll(".quick-button");

    const platform = document.getElementById("platform");
    const dimension = document.getElementById("dimension");
    const priority = document.getElementById("priority");

    const realism = document.getElementById("realism");
    const realismValue = document.getElementById("realismValue");

    const analyzeButton = document.getElementById("analyzeButton");

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

        const line = document.createElement("div");

        line.className = `log-line ${type}`;

        const time = new Date().toLocaleTimeString(
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

        buildLog.scrollTop = buildLog.scrollHeight;
    }


    // =====================================================
    // BOOT
    // =====================================================

    async function bootSequence() {

        if (!bootScreen || !app) return;

        const messages = [
            "Initialisation de Zentro AI OS...",
            "Chargement du Game Engine...",
            "Initialisation des agents IA...",
            "Chargement du Realism Engine...",
            "Vérification des systèmes...",
            "Préparation de l'environnement...",
            "Zentro est prêt."
        ];

        for (let i = 0; i <= 100; i += 4) {

            if (bootProgress) {
                bootProgress.style.width = `${i}%`;
            }

            const index = Math.min(
                messages.length - 1,
                Math.floor(i / 16)
            );

            if (bootMessage) {
                bootMessage.textContent = messages[index];
            }

            await sleep(45);
        }

        await sleep(350);

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
            document.getElementById(`page-${pageName}`);

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
    }


    navButtons.forEach(button => {

        button.addEventListener("click", () => {

            const page =
                button.dataset.page;

            if (page) {
                showPage(page);
            }

        });

    });


    // =====================================================
    // NOUVEAU PROJET
    // =====================================================

    if (newProjectButton) {

        newProjectButton.addEventListener("click", () => {

            showPage("create");

            setTimeout(() => {
                if (gamePrompt) {
                    gamePrompt.focus();
                }
            }, 100);

        });

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

        button.addEventListener("click", () => {

            const key = button.dataset.fill;

            if (!gamePrompt || !quickTexts[key]) {
                return;
            }

            const text = quickTexts[key];

            if (gamePrompt.value.trim()) {
                gamePrompt.value +=
                    "\n\n" + text;
            } else {
                gamePrompt.value = text;
            }

            gamePrompt.focus();

        });

    });


    // =====================================================
    // REALISME
    // =====================================================

    if (realism && realismValue) {

        realism.addEventListener("input", () => {

            realismValue.textContent =
                `${realism.value}%`;

        });

    }


    // =====================================================
    // DETECTION DES SYSTEMES
    // =====================================================

    function detectSystems(prompt) {

        const text = prompt.toLowerCase();

        const systems = [];

        const rules = [

            {
                names: ["Monde ouvert", "World Builder"],
                keywords: [
                    "monde ouvert",
                    "open world",
                    "ville",
                    "ville ouverte",
                    "map",
                    "quartier",
                    "campagne"
                ]
            },

            {
                names: ["Conduite & véhicules", "Vehicle AI"],
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
                names: ["PNJ intelligents", "NPC AI"],
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
                names: ["Météo & environnement", "Weather"],
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
                names: ["Missions & gameplay", "Gameplay"],
                keywords: [
                    "mission",
                    "missions",
                    "objectif",
                    "livraison",
                    "course",
                    "garage",
                    "argent",
                    "économie"
                ]
            },

            {
                names: ["Personnalisation", "Customization"],
                keywords: [
                    "tuning",
                    "personnalisation",
                    "customisation",
                    "modifier",
                    "jantes",
                    "moteur",
                    "carrosserie"
                ]
            },

            {
                names: ["Graphismes réalistes", "Visuals"],
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
                names: ["Audio immersif", "Audio"],
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
                rule.keywords.some(keyword =>
                    text.includes(keyword)
                );

            if (found) {
                systems.push(rule.names);
            }

        });


        if (systems.length === 0) {

            systems.push(
                ["Gameplay général", "Core Gameplay"],
                ["Monde", "World Builder"],
                ["Interface", "UI"]
            );

        }


        return systems;
    }


    // =====================================================
    // TITRE AUTOMATIQUE
    // =====================================================

    function generateTitle(prompt) {

        const text = prompt.toLowerCase();

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
            text.includes("horreur") ||
            text.includes("horror")
        ) {
            return "Zentro Dark";
        }

        if (
            text.includes("space") ||
            text.includes("espace")
        ) {
            return "Zentro Galaxy";
        }

        return "Zentro Game";
    }


    // =====================================================
    // ANALYSE DE L'IDÉE
    // =====================================================

    function analyzePrompt() {

        if (!gamePrompt) return;

        const prompt =
            gamePrompt.value.trim();

        if (!prompt) {

            understandingStatus.textContent =
                "Écrivez votre idée";

            understandingStatus.classList.add("warning");

            understandingContent.innerHTML = `
                <p>
                    Décrivez le jeu que vous voulez créer.
                    Zentro analysera ensuite votre vision.
                </p>
            `;

            if (approvalPanel) {
                approvalPanel.classList.remove("visible");
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
                platform ? platform.value : "PC",

            dimension:
                dimension ? dimension.value : "3D",

            priority:
                priority ? priority.value : "Réalisme",

            realism:
                realism ? Number(realism.value) : 90,

            systems,

            createdAt:
                new Date().toISOString()

        };


        if (understandingStatus) {

            understandingStatus.textContent =
                "Vision comprise ✓";

            understandingStatus.classList.remove(
                "warning"
            );

        }


        if (understandingContent) {

            understandingContent.innerHTML = `

                <div class="understanding-grid">

                    <div>
                        <strong>Vision détectée</strong>
                        <p>
                            Zentro a analysé votre description
                            et va construire le jeu autour
                            de vos priorités.
                        </p>
                    </div>

                    <div>
                        <strong>Systèmes détectés</strong>
                        <p>
                            ${systems.length}
                            systèmes principaux
                        </p>
                    </div>

                    <div>
                        <strong>Niveau de réalisme</strong>
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

        if (!projectSpecification || !currentSpec) {
            return;
        }

        const systemHTML =
            currentSpec.systems
                .map(system => `
                    <div class="spec">
                        <span>${escapeHTML(system[0])}</span>
                        <small>${escapeHTML(system[1])}</small>
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

                <h4>Systèmes prévus</h4>

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

        editButton.addEventListener("click", () => {

            if (approvalPanel) {
                approvalPanel.classList.remove("visible");
            }

            if (gamePrompt) {

                gamePrompt.focus();

                gamePrompt.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }

        });

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
                "Construit le monde, les villes, routes, bâtiments et environnements."
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
                "Crée les PNJ, comportements, routines et population dynamique."
        },

        {
            icon: "🎨",
            name: "Visual Engine",
            description:
                "Gère les matériaux, éclairage, environnement et rendu."
        },

        {
            icon: "⚙️",
            name: "Systems Agent",
            description:
                "Programme les missions, économies, gameplay et interactions."
        },

        {
            icon: "🎵",
            name: "Audio Agent",
            description:
                "Crée et organise l'ambiance sonore et les effets."
        },

        {
            icon: "🧪",
            name: "QA Agent",
            description:
                "Teste le jeu et recherche les bugs."
        },

        {
            icon: "🚀",
            name: "Optimizer",
            description:
                "Optimise les performances et la stabilité."
        }

    ];


    // =====================================================
    // AFFICHAGE DES AGENTS
    // =====================================================

    function renderAgents() {

        if (!agentCards) return;

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

        if (!agentPipeline) return;

        agentPipeline.innerHTML =
            agents.map((agent, index) => `

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

            `).join("");

    }


    // =====================================================
    // GÉNÉRATION DU JEU
    // =====================================================

    async function generateGame() {

        if (isBuilding || !currentSpec) {
            return;
        }

        isBuilding = true;


        if (approvalPanel) {
            approvalPanel.classList.remove("visible");
        }

        if (generationPanel) {
            generationPanel.classList.add("visible");
        }

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

        addLog(
            "Analyse de la vision utilisateur...",
            "info"
        );


        await sleep(700);


        for (let i = 0; i < agents.length; i++) {

            const agent =
                agents[i];

            const step =
                document.getElementById(
                    `agent-step-${i}`
                );

            const percentage =
                Math.round(
                    (i / agents.length) * 100
                );


            if (buildProgress) {
                buildProgress.style.width =
                    `${percentage}%`;
            }

            if (buildStatus) {
                buildStatus.textContent =
                    `${agent.name.toUpperCase()}...`;
            }


            if (step) {

                step.classList.add("working");

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
                650 + Math.random() * 500
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


        // =================================================
        // QA
        // =================================================

        if (buildStatus) {
            buildStatus.textContent =
                "TESTS & OPTIMISATION...";
        }

        if (buildProgress) {
            buildProgress.style.width =
                "92%";
        }


        addLog(
            "QA Agent : lancement des tests automatiques...",
            "info"
        );

        await sleep(900);

        addLog(
            "QA Agent : analyse des systèmes terminée.",
            "success"
        );


        addLog(
            "Optimizer : optimisation du projet...",
            "info"
        );

        await sleep(900);

        addLog(
            "Optimizer : optimisation terminée ✓",
            "success"
        );


        // =================================================
        // FINALISATION
        // =================================================

        if (buildProgress) {
            buildProgress.style.width =
                "100%";
        }

        if (buildStatus) {
            buildStatus.textContent =
                "READY ✓";
        }


        addLog(
            "Compilation du prototype...",
            "info"
        );

        await sleep(700);

        addLog(
            "Projet généré avec succès ✓",
            "success"
        );

        addLog(
            "Zentro Game Engine : BUILD COMPLETE.",
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

        const existingIndex =
            projects.findIndex(
                item => item.id === project.id
            );

        const savedProject = {
            ...project,
            status: "READY",
            updatedAt:
                new Date().toISOString()
        };


        if (existingIndex >= 0) {

            projects[existingIndex] =
                savedProject;

        } else {

            projects.unshift(
                savedProject
            );

        }


        saveProjects(
            projects.slice(0, 20)
        );

    }


    function renderProjects() {

        if (!projectsList) return;

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
            projects.map(project => `

                <div class="project-card">

                    <div class="project-card-main">

                        <div class="project-icon">
                            🎮
                        </div>

                        <div>

                            <h3>
                                ${escapeHTML(project.title)}
                            </h3>

                            <p>
                                ${escapeHTML(
                                    project.prompt.substring(
                                        0,
                                        150
                                    )
                                )}${project.prompt.length > 150 ? "..." : ""}
                            </p>

                        </div>

                    </div>

                    <div class="project-card-meta">

                        <span>
                            ${escapeHTML(project.platform)}
                        </span>

                        <span>
                            ${project.realism}%
                        </span>

                        <span class="status-ready">
                            READY
                        </span>

                    </div>

                </div>

            `).join("");

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
                "Densité du monde, végétation, bâtiments, routes et environnement."
        },

        {
            icon: "🚗",
            title: "Physique véhicules",
            value: "92%",
            description:
                "Suspension, accélération, freinage, adhérence et comportement."
        },

        {
            icon: "👤",
            title: "PNJ & population",
            value: "90%",
            description:
                "Comportements, circulation, routines et interactions."
        },

        {
            icon: "🌦️",
            title: "Météo & lumière",
            value: "96%",
            description:
                "Cycle jour/nuit, météo dynamique, éclairage et atmosphère."
        },

        {
            icon: "🎧",
            title: "Audio immersif",
            value: "88%",
            description:
                "Moteurs, pneus, environnement, ville et ambiance."
        },

        {
            icon: "🎬",
            title: "Animation",
            value: "91%",
            description:
                "Animations des personnages, véhicules et interactions."
        }

    ];


    function renderRealismDashboard() {

        if (!realismDashboard) return;

        realismDashboard.innerHTML =
            realismModules.map(module => `

                <div class="realism-card">

                    <div class="realism-card-icon">
                        ${module.icon}
                    </div>

                    <div class="realism-card-content">

                        <div class="realism-card-header">

                            <h3>
                                ${escapeHTML(module.title)}
                            </h3>

                            <strong>
                                ${module.value}
                            </strong>

                        </div>

                        <p>
                            ${escapeHTML(module.description)}
                        </p>

                        <div class="realism-bar">

                            <div
                                class="realism-bar-fill"
                                style="width:${module.value}"
                            ></div>

                        </div>

                    </div>

                </div>

            `).join("");

    }


    // =====================================================
    // CLAVIER
    // =====================================================

    document.addEventListener(
        "keydown",
        event => {

            // Ctrl + K = créer rapidement
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


            // Ctrl + Enter = analyser
            if (
                event.ctrlKey &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                if (
                    document.activeElement === gamePrompt
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
