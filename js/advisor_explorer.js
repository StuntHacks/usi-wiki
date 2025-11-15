let galaxies = null;
let advisors = [];
let advisor_hash = "";
let selected_advisor = -1;

const modMap = {
    "CorvetteChargeLaserMod": {
        name: "Corvette Charge Laser",
        icon: "Datacore",
    },
    "ShieldMod": {
        name: "Shield (reduced damage)",
        icon: "CorvetteShieldMod",
    },
    "FrigateMissileMod": {
        name: "Frigate Missiles",
        icon: "ArmorPiercing",
    },
    "ArmorMod": {
        name: "Armor (reduced damage)",
        icon: "ShieldRegenStart",
    },
    "FighterMiniRailgunMod": {
        name: "Fighter Mini Railgun",
        icon: "ArmorDamageSynergy",
    },
    "CruiserSingleArmorTank": {
        name: "Single Armored Cruiser",
        icon: "PristineArmor",
    },
    "HeavyCruiserBeamMod": {
        name: "Heavy Cruiser Beam Laser",
        icon: "PowerMode",
    },
}

function parseAdvisor(input) {
    let v2 = false;
    if (input.startsWith("V2")) {
        v2 = true;
        input = input.substring(2, input.length);
    }
    const split = input.split("|");
    const first = split[0].split(",");
    const fr_used = parseFloat(first[0]);
    const fr_committed = parseInt(first[1]);
    split.shift();
    split.shift();
    let boss_damage = undefined;
    const ships = [];

    for (const ship of split) {
        if (!ship.includes(";")) {
            boss_damage = parseFloat(ship);
            break;
        }

        const splitShip = ship.split(";");

        if (splitShip[0] === "Null") {
            continue;
        }

        const mods = splitShip[1].split(",");
        const positions = splitShip[2].split(v2 ? "*" : ".");

        for (const p of positions) {
            const newShip = {
                name: splitShip[0],
                position: {
                    x: parseInt(p.split(",")[0]),
                    y: parseInt(p.split(",")[1]),
                },
                mods: mods,
            };

            ships.push(newShip);
        }
    }

    return { fr_used, fr_committed, boss_damage, ships };
}

function shipNameToClass(name) {
    switch (name) {
        case "Corvette":
            return "corvette";
        case "Frigate":
            return "frigate";
        case "Fighter":
            return "fighters";
        case "Cruiser":
            return "cruiser";
        case "HeavyCruiser":
            return "heavy_cruiser";
        default:
            return "";
    }
}

function shipNameToDisplayName(name) {
    switch (name) {
        case "HeavyCruiser":
            return "Heavy Cruiser";
        default:
            return name;
    }
}

function clearAdvisorLayout() {
    document.getElementById("ships-column").innerHTML = "";
    const slots = document.querySelectorAll(".fleet-grid .slot");
    for (const slot of slots) {
        slot.className = "slot";
    }
}

function displayAdvisorLayout(advisor) {
    clearAdvisorLayout();
    const ships = [];
    const shipsColumn = document.getElementById("ships-column");

    for (const ship of advisor.ships) {
        const slot = document.querySelector(`.fleet-grid .slot[data-pos="${ship.position.x};${ship.position.y}"]`);
        let name = shipNameToClass(ship.name);
        if (name === "cruiser" && ship.mods.includes("CruiserSingleArmorTank")) name = "single_cruiser";
        slot.classList.add(name);

        if (!ships.some(s => s.name === ship.name)) {
            ships.push({ name: ship.name, mods: ship.mods });
        }
    }

    const glxInput = document.getElementById("galaxy-input");
    const btlInput = document.getElementById("battle-select");
    const galaxy = glxInput.options[glxInput.selectedIndex].text;
    const battle = btlInput.options[btlInput.selectedIndex].text;
    shipsColumn.dataset.col = `${galaxy} ${battle} (${advisor.fr_used.toFixed(2)} used)`;

    let markup = "";
    for (const ship of ships) {
        let mods = "";

        if (ship.mods && ship.mods.length > 0) {
            mods = '<ul class="mods">';

            for (const mod of ship.mods) {
                const m = modMap[mod];
                if (!m) continue;
                mods += `<li><span class="icon inline" data-icon="${m.icon}"></span> ${m.name}</li>`;
            }

            mods += "</ul>"
        }

        markup += `
            <div class="ship ${shipNameToClass(ship.name)}">
                <span class="title">${shipNameToDisplayName(ship.name)}</span>
                ${mods}
            </div>
        `;
    }
    shipsColumn.innerHTML = markup;
    renderSVGs();
}

function renderAdvisorList() {
    if (advisors.length === 0) {
        document.getElementById("no-results").classList.remove("hidden");
        document.getElementById("results").innerHTML = "";
        return;
    }
    let i = 0;
    let markup = "";
    for (const parsed of advisors) {
        const leftover = (parsed.fr_committed - parsed.fr_used).toFixed(2);
        let ships = "";
        const renderedShips = [];
        const boss = parsed.boss_damage && !isNaN(parsed.boss_damage) ? `<span class="boss-damage">${parsed.boss_damage.toFixed(2)} damage to boss</span>` : "";

        for (const ship of parsed.ships) {
            if (!renderedShips.includes(ship.name)) {
                renderedShips.push(ship.name);
                ships += `<span class="ship ${shipNameToClass(ship.name)}"></span>`;
            }
        }

        markup += `
            <div class="advisor ${selected_advisor === i ? "selected" : ""}" data-index="${i}">
                <span>${leftover}/${parsed.fr_committed} FR</span>
                <span class="boss-damage">(${parsed.fr_used.toFixed(2)} used)</span>
                ${boss}
                <div>${ships}</div>
            </div>
        `;

        if (i === 4 && advisors.length > 5) {
            markup += `<div class="collapsible collapsed"><div class="toggle" id="advisor-toggle">Expand to show ${advisors.length - 5} more</div>`;
        }

        i++;
    }
    if (advisors.length > 5) {
        markup += "</div>";
    }
    const results = document.getElementById("results");
    results.innerHTML = markup;
    const toggle = document.getElementById("advisor-toggle");
    if (toggle) {
        toggle.addEventListener("click", (e) => {
            e.target.parentElement.classList.toggle("collapsed");
            e.target.innerHTML = `${
            e.target.parentElement.classList.contains("collapsed")
                ? "Expand to show"
                : "Collapse to hide"
            } ${advisors.length - 5} more`;
        });
    }
    const elements = results.getElementsByClassName("advisor");
    for (const e of elements) {
        e.addEventListener("click", (e) => {
            const target = e.target.closest(".advisor");
            const all = target.parentElement.getElementsByClassName("advisor");
            for (const advisor of all) {
                advisor.classList.remove("selected")
            }
            target.classList.add("selected");
            const index = parseInt(target.dataset.index);
            displayAdvisorLayout(advisors[index]);
        });
    }
}

function initAdvisorExplorer() {
    document.getElementById("find-advisors").innerHTML = "";
    document.getElementById("results").innerHTML = "";
    clearAdvisorLayout();
    const displayAdvisors = (data) => {
        advisors = [];
        for (const advisor of data) {
            const parsed = parseAdvisor(advisor);
            if (parsed.boss_damage && parsed.boss_damage < 0) continue;
            advisors.push(parsed);
        }
        advisors = dedupeObjects(advisors);
        advisors.sort((a, b) => a.fr_used - b.fr_used);
        selected_advisor = -1;
        renderAdvisorList();
    }
    const init = () => {
        const selectContainer = document.getElementById("galaxy-select");
        const hazardContainer = document.getElementById("hazard-select");
        selectContainer.innerHTML = "";
        hazardContainer.innerHTML = "";

        const findAdvisors = () => {
            const button = document.getElementById("find-advisors-button");
            const statInput = document.getElementById("stat-input"); 
            document.getElementById("no-results").classList.add("hidden");
            button.disabled = true;
            statInput.value = parseFloat(statInput.value).toFixed(3);
            advisor_hash = hash;
            const body = {
                combat_stat_level: parseFloat(statInput.value),
                fleet_event_id: document.getElementById("battle-select").value,
                version: 99999999,
                has_boss: false,
                hazard_node_list: "",
            };

            const hazards = document.querySelectorAll("input[id^=hazard-]");
            for (const hazard of hazards) {
                if (hazard.checked) {
                    body.hazard_node_list += hazard.value;
                }
            }
            const boss = document.getElementById("boss-active");
            if (boss && boss.checked) {
                body.has_boss = true;
            }
            const hash = `${document.getElementById("battle-select").value}_${statInput.value}_${body.has_boss}_${body.hazard_node_list}`;
            if (hash === advisor_hash) {
                button.disabled = false;
                return;
            }
            try {
                fetch("https://api.spaceidle.xyz/suggest_fleet_battle/", {
                    method: "POST",
                    body: JSON.stringify(body),
                }).then((response => {
                    if (response.status === 404) return false;
                    return response.json();
                })).then((data => {
                    button.disabled = false;
                    if (data) {
                        displayAdvisors(data);
                    } else {
                        clearAdvisorLayout();
                        document.getElementById("no-results").classList.remove("hidden");
                        document.getElementById("results").innerHTML = "";
                    }
                }));
            } catch (e) {
                button.disabled = false;
                clearAdvisorLayout();
                document.getElementById("no-results").classList.remove("hidden");
                document.getElementById("results").innerHTML = "";
                console.log(e.message);
            }
        }

        const initSelect = () => {
            // hazard selector
            const generateHazardSelect = () => {
                const galaxy = document.getElementById("galaxy-input").value;
                const battle = document.getElementById("battle-select").value;
                const hazardContainer = document.getElementById("hazard-select");
                hazardContainer.innerHTML = "";
                if (!battle || !galaxy) {
                    return;
                }

                const battleData = galaxies.find(g => g.id === galaxy).battles.find(b => b.id === battle);
                if (battleData.hazard && battleData.hazard.length > 0) {
                    for (const hazard of battleData.hazard) {
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.id = `hazard-${hazard.id}`;
                        checkbox.value = hazard.id;
                        const label = document.createElement("label");
                        label.htmlFor = `hazard-${hazard.id}`;
                        label.innerHTML = `<span class="hazard">${hazard.node}<span>(${hazard.type})</span></span>`;
                        label.appendChild(checkbox);
                        hazardContainer.appendChild(label);
                    }
                }

                if (battleData.boss) {
                    const bossCheckbox = document.createElement("input");
                    bossCheckbox.type = "checkbox";
                    bossCheckbox.id = `boss-active`;
                    bossCheckbox.value = "boss";
                    const bossLabel = document.createElement("label");
                    bossLabel.htmlFor = `boss-active`;
                    bossLabel.innerHTML = `<span class="boss">Boss active</span>`;
                    bossLabel.appendChild(bossCheckbox);
                    hazardContainer.appendChild(bossLabel);
                }
            }
            // battle selector
            const getBattleSelect = (galaxy) => {
                const battleSelect = document.createElement("select");
                battleSelect.id = "battle-select";
                if (!galaxy) battleSelect.disabled = true;
                for (const battle of galaxies.find(g => g.id === (galaxy || "g1")).battles) {
                    const option = document.createElement("option");
                    option.value = battle.id;
                    option.textContent = battle.name;
                    option.classList.add(battle.color)
                    battleSelect.appendChild(option);
                }
                battleSelect.addEventListener("change", generateHazardSelect);
                return battleSelect;
            }

            // combat stat selector
            const getCombatStatInput = (galaxy) => {
                const wrapper = document.createElement("div");
                wrapper.id = "combat-stats";
                const combatStatInput = document.createElement("input");
                combatStatInput.id = "stat-input";
                const glx = galaxies.find((g) => g.id === (galaxy || "g1"));
                combatStatInput.type = "number";
                combatStatInput.value = glx.minStats;
                combatStatInput.step = glx.step;
                if (!galaxy) combatStatInput.disabled = true;
                const validateStats = () => {
                    if (isNaN(combatStatInput.value)) combatStatInput.value = glx.minStats;
                    if (combatStatInput.value < glx.minStats) combatStatInput.value = glx.minStats.toFixed(3);
                    if (combatStatInput.value > glx.maxStats) combatStatInput.value = glx.maxStats.toFixed(3);
                }
                combatStatInput.addEventListener("change", validateStats);
                const addStats = createNodeFromHTML(`<span class="change-button ${!galaxy ? "disabled" : ""}">+</span>`);
                const subStats = createNodeFromHTML(`<span class="change-button ${!galaxy ? "disabled" : ""}">-</span>`);
                addStats.addEventListener("click", () => {
                    combatStatInput.value = (
                      parseFloat(combatStatInput.value) +
                      parseFloat(combatStatInput.step)
                    ).toFixed(3);
                    validateStats();
                });
                subStats.addEventListener("click", () => {
                    combatStatInput.value = (
                      parseFloat(combatStatInput.value) -
                      parseFloat(combatStatInput.step)
                    ).toFixed(3);
                    validateStats();
                });
                wrapper.appendChild(subStats);
                wrapper.appendChild(combatStatInput);
                wrapper.appendChild(addStats);
                return wrapper;
            }

            // galaxy selector
            const galaxySelect = document.createElement("select");
            galaxySelect.id = "galaxy-input";
            galaxySelect.innerHTML = '<option value="" disabled selected hidden>Select galaxy</option>';
            for (const galaxy of galaxies) {
                const option = document.createElement("option");
                option.value = galaxy.id;
                option.textContent = galaxy.name;
                galaxySelect.appendChild(option);
                galaxySelect.addEventListener("change", updateUI);
            }

            function updateUI() {
                const selectedGalaxyId = galaxySelect.value;
                document.getElementById("battle-select").replaceWith(getBattleSelect(selectedGalaxyId));
                document.getElementById("combat-stats").replaceWith(getCombatStatInput(selectedGalaxyId));
                generateHazardSelect();
                document.getElementById("find-advisors-button").disabled = selectedGalaxyId.length === 0;
            }

            selectContainer.appendChild(galaxySelect);
            selectContainer.appendChild(getCombatStatInput(galaxySelect.value));
            selectContainer.appendChild(getBattleSelect(galaxySelect.value));
            generateHazardSelect();
            const button = document.createElement("button");
            button.type = "button";
            button.disabled = true;
            button.textContent = "Find Advisors";
            button.id = "find-advisors-button";
            button.addEventListener("click", findAdvisors);
            document.getElementById("find-advisors").appendChild(button);
        }

        initSelect();
    }

    fetch("https://raw.githubusercontent.com/StuntHacks/usi-wiki/refs/heads/master/js/galaxies.json").then((response) => {
        return response.json()
    }).then(data => { galaxies = data; init(); });
}
