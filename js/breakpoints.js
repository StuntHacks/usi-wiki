// Base 6 breakpoint calculator made by ciryll
function initBreakpointCalculator() {
    var layoutIndex = document.getElementById("layout-input");
    var boosterLevel = document.getElementById("booster-level");
    var calculate = document.getElementById("calculate");
    var output = document.getElementById("output");

    var button = createNodeFromHTML(
        '<button type="button" id="calculate">' +
        calculate.dataset.text +
        "</button>"
    );

    var layoutIndexInput = createNodeFromHTML(
      '<input type="number" id="LayoutIdx" min="0" max="9" step="1" value="9" / >'
    );
    var layoutIndexLabel = createNodeFromHTML(
      '<label for="LayoutIdx">Layout Index: </label>'
    );
    var layoutIndexPreview = createNodeFromHTML(
      '<div class="layout"></div>'
    );

    layoutIndexInput.addEventListener("change", function () {
        var index = parseInt(layoutIndexInput.value);

        if (index < 0) {
            index = 0;
            layoutIndexInput.value = "0";
        }

        if (index > 9) {
          index = 9;
          layoutIndexInput.value = "9";
        }

        layoutIndexPreview.className = "";
        layoutIndexPreview.classList.add("layout");
        layoutIndexPreview.classList.add("l" + index);
    });

    var boosterLevelInput = createNodeFromHTML(
        '<input type="number" id="CurMB" min="1" step="1" value="8" />'
    );
    var boosterLevelLabel = createNodeFromHTML(
        '<label for="CurMB">Current Mats Booster Level: </label>'
    );

    //TODO: add 10 inputs for each booster amount per tile

    button.addEventListener("click", function () {});

    calculate.appendChild(button);
    layoutIndex.appendChild(layoutIndexLabel);
    layoutIndex.appendChild(layoutIndexPreview);
    layoutIndex.appendChild(layoutIndexInput);
    boosterLevel.appendChild(boosterLevelLabel);
    boosterLevel.appendChild(boosterLevelInput);
}
