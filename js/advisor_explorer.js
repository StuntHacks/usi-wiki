let galaxies = null;

function initAdvisorExplorer() {
    const init = () => {
        const selectContainer = document.getElementById("galaxy-select");

        const initSelect = () => {
            // battle selector
            const getBattleSelect = (galaxy) => {
                const battleSelect = document.createElement("select");
                for (const battle of galaxies.find(g => g.id === galaxy).battles) {
                    const option = document.createElement("option");
                    option.value = battle.id;
                    option.textContent = battle.name;
                    option.classList.add(battle.color)
                    battleSelect.querySelector("select").appendChild(option);
                }
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
                const selectedGalaxyId = galaxySelect.querySelector("select").value;
                getBattleSelect(selectedGalaxyId);
            });

            selectContainer.appendChild(galaxySelect);
        }
    }

    fetch("https://raw.githubusercontent.com/StuntHacks/usi-wiki/refs/heads/master/js/galaxies.json").then((response) => {
        return response.json()
    }).then(data => { galaxies = data; init(); });
}
