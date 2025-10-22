// Base 6 breakpoint calculator made by ciryll
function initBreakpointCalculator(element) {
    var layoutInput = element.querySelector("#layout-input");
    var boosterLevel = element.querySelector("#booster-level");
    var calculate = element.querySelector("#calculate");

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

    layoutInput.parentNode.appendChild(button);
    boosterLevel.parentNode.appendChild(boosterLevelLabel);
    boosterLevel.parentNode.appendChild(boosterLevelInput);
}
