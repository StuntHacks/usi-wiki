// Base 6 breakpoint calculator made by ciryll
function initBreakpointCalculator(element) {
    var layoutInput = document.getElementById("layout-input");
    var boosterLevel = document.getElementById("booster-level");
    var calculate = document.getElementById("calculate");
    console.log(calculate, layoutInput, boosterLevel);

    var button = createNodeFromHTML(
        '<button type="button" id="calculate">' +
        calculate.dataset.text +
        "</button>"
    );

    var boosterLevelInput = createNodeFromHTML(
        '<input type="number" id="CurMB" min="1" step="1" value="8" />'
    );
    var boosterLevelLabel = createNodeFromHTML(
      '<label for="CurMB">Current Mats Booster Level: </label>'
    );

    button.addEventListener("click", function () {});

    layoutInput.appendChild(button);
    boosterLevel.appendChild(boosterLevelLabel);
    boosterLevel.appendChild(boosterLevelInput);
}
