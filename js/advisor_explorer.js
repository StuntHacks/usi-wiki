let galaxies = null;

function initAdvisorExplorer() {
    const init = () => {
        const selectContainer = document.getElementById("galaxy-select");

        const initSelect = () => {
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
                return battleSelect;
            }

            // combat stat selector
            const getCombatStatInput = (galaxy) => {
                const wrapper = document.createElement("div");
                const combatStatInput = document.createElement("input");
                const glx = galaxies.find((g) => g.id === (galaxy || "g1"));
                combatStatInput.type = "number";
                combatStatInput.id = "combat-stats";
                combatStatInput.value = glx.minStats;
                combatStatInput.step = glx.step;
                if (!galaxy) combatStatInput.disabled = true;
                const validateStats = () => {
                    if (isNaN(combatStatInput.value)) combatStatInput.value = glx.minStats;
                    if (combatStatInput.value < glx.minStats) combatStatInput.value = glx.minStats;
                    if (combatStatInput.value > glx.maxStats) combatStatInput.value = glx.maxStats;
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
            galaxySelect.innerHTML = '<option value="" disabled selected>Select galaxy</option>';
            for (const galaxy of galaxies) {
                const option = document.createElement("option");
                option.value = galaxy.id;
                option.textContent = galaxy.name;
                galaxySelect.appendChild(option);
            }

            galaxySelect.addEventListener("change", () => {
                const selectedGalaxyId = galaxySelect.value;
                document.getElementById("battle-select").replaceWith(getBattleSelect(selectedGalaxyId));
                document.getElementById("combat-stats").replaceWith(getCombatStatInput(selectedGalaxyId));
            });

            selectContainer.appendChild(galaxySelect);
            selectContainer.appendChild(getCombatStatInput(galaxySelect.value));
            selectContainer.appendChild(getBattleSelect(galaxySelect.value));
        }

        initSelect();
    }

    fetch("https://raw.githubusercontent.com/StuntHacks/usi-wiki/refs/heads/master/js/galaxies.json").then((response) => {
        return response.json()
    }).then(data => { galaxies = data; init(); });
}
