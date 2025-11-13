let galaxies = null;
let advisors = [];
function initAdvisorExplorer() {
    document.getElementById("find-advisors").innerHTML = "";
    const displayAdvisors = (data) => {
        advisors = [];
        console.log("Found Advisors: ", data);
    }
    const init = () => {
        const selectContainer = document.getElementById("galaxy-select");
        const hazardContainer = document.getElementById("hazard-select");
        selectContainer.innerHTML = "";
        hazardContainer.innerHTML = "";

        const findAdvisors = () => {
            const button = document.getElementById("find-advisors-button");
            document.getElementById("no-results").classList.add("hidden");
            button.disabled = true;
            const body = {
                combat_stat_level: parseFloat(document.getElementById("stat-input").value),
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
                        document.getElementById("no-results").classList.remove("hidden");
                    }
                }));
            } catch (e) {
                button.disabled = false;
                document.getElementById("no-results").classList.remove("hidden");
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
