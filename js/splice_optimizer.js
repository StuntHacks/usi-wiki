// Spliced crew level optimizer made by ciryll
function getBonus(first_mult, first_level, second_mult, second_level) {
    return (1.0 + (first_level * first_mult)) * (1.0 + (second_level * second_mult))
}

function solveBestBonus(first_mult, second_mult, total_levels) {
    // Ensure the levels are between 0 and 100
    const clamped_total_levels = Math.min(100, Math.max(0, total_levels))
    let first_level = Math.min(20, clamped_total_levels)
    let second_level = 0
    let remaining_levels = Math.max(0, clamped_total_levels - first_level)

    while (remaining_levels > 0) {
        const increase_first = getBonus(first_mult, first_level + 1, second_mult, second_level)
        const increase_second = getBonus(first_mult, first_level, second_mult, second_level + 1)

        if (increase_first > increase_second && first_level < 50) {
            first_level += 1
        } else {
            second_level += 1
        }
        remaining_levels -= 1
    }

    return [first_level, second_level, getBonus(first_mult, first_level, second_mult, second_level)]
}

// handle click and add class
function calculateOptimalSpliceLevels(output, first_mult_input, second_mult_input, total_levels_input) {
    const first_mult = parseFloat(first_mult_input.value)
    const second_mult = parseFloat(second_mult_input.value)
    const total_levels = parseInt(total_levels_input.value)

    const results = solveBestBonus(first_mult, second_mult, total_levels)
    const first_level = results[0]
    const second_level = results[1]
    const final_bonus = results[2]

    output.innerHTML = "First Level: " + first_level + "<br/>Second Level: " + second_level + "<br/>Final Bonus: " + final_bonus.toFixed(5)
}


function initSpliceOptimizer() {
    const firstMult = document.getElementById("first-mult");
    const secondMult = document.getElementById("second-mult");
    const totalLevels = document.getElementById("total-levels");
    const totalLevelsWrapper = document.getElementById("total-levels-wrapper");
    const output = document.getElementById("output");

    const button = createNodeFromHTML(`
        <button type="button">
            ${calculate.dataset.text}
        </button>
    `);

    // first mult
    const firstMultInput = createNodeFromHTML(
        '<input type="number" id="FirstMult" min="0" step="0.0001" value="0.2" />'
    );
    const firstMultLabel = createNodeFromHTML(
        '<label for="FirstMult">First Multiplier: </label>'
    );

    firstMultInput.addEventListener("change", () => {
        let index = parseFloat(firstMultInput.value);
        if (isNaN(index) || index < 1) {
            index = 1;
        }
        firstMultInput.value = index;
    });

    // second mult
    const secondMultInput = createNodeFromHTML(
        '<input type="number" id="SecondMult" min="0" step="0.0001" value="0.1" />'
    );
    const secondMultLabel = createNodeFromHTML(
        '<label for="SecondMult">Second Multiplier: </label>'
    );

    secondMultInput.addEventListener("change", () => {
        let index = parseFloat(secondMultInput.value);
        if (isNaN(index) || index < 1) {
            index = 1;
        }
        secondMultInput.value = index;
    });

    // total levels
    const totalLevelsPlus = createNodeFromHTML(
        '<span class="change-button">+</span>'
    );
    const totalLevelsMinus = createNodeFromHTML(
        '<span class="change-button">-</span>'
    );
    const totalLevelsInput = createNodeFromHTML(
        '<input type="number" id="TotalLevels" min="0" max="100" step="1" value="50" />'
    );
    const totalLevelsLabel = createNodeFromHTML(
        '<label for="TotalLevels">Total Levels: </label>'
    );

    const validateLevels = () => {
        let index = parseInt(totalLevelsInput.value);
        if (isNaN(index) || index < 1) {
            index = 1;
        } else if (index > 100) {
            index = 100;
        }
        totalLevelsInput.value = index;
    }

    totalLevelsInput.addEventListener("change", validateLevels);
    totalLevelsPlus.addEventListener("click", () => {
        let index = parseInt(totalLevelsInput.value);
        totalLevelsInput.value = index + 1;
        validateLevels();
    });
    totalLevelsMinus.addEventListener("click", () => {
        let index = parseInt(totalLevelsInput.value);
        totalLevelsInput.value = index - 1;
        validateLevels();
    });

    button.addEventListener("click", function () {
        calculateOptimalSpliceLevels(output, firstMultInput, secondMultInput, totalLevelsInput);
    });

    calculate.appendChild(button);
    firstMult.appendChild(firstMultLabel);
    firstMult.appendChild(firstMultInput);
    secondMult.appendChild(secondMultLabel);
    secondMult.appendChild(secondMultInput);
    totalLevels.prepend(totalLevelsLabel);
    totalLevelsWrapper.appendChild(totalLevelsMinus);
    totalLevelsWrapper.appendChild(totalLevelsInput);
    totalLevelsWrapper.appendChild(totalLevelsPlus);

    calculateOptimalSpliceLevels(output, firstMultInput, secondMultInput, totalLevelsInput);
}
