// Base 6 breakpoint calculator made by ciryll
/** Constants */
var MP_Cost_Mult = 3000.0;
var MP_Cost_Pow = 1.24;
var MB_Cost_Mult = 100000.0;
var MB_Cost_Pow = 50.0;
var Mat_Income_Pow = 1.1;
var Mat_Boost_Pow = 1.1;

function roundToN(number, numDecimalPlaces) {
  var numDecimalPlaces_Clamped = Math.min(Math.max(numDecimalPlaces, 0), 10);
  var multiplier = Math.pow(10, numDecimalPlaces_Clamped);
  return Math.round(number * multiplier) / multiplier;
}

function getMPCost(levelMP, buildingCostDivider) {
  buildingCostDivider = buildingCostDivider !== undefined ? buildingCostDivider : 1.0;
  var curLevel = Math.max(levelMP, 1);
  return (
    (MP_Cost_Mult * Math.pow(MP_Cost_Pow, curLevel - 1)) / buildingCostDivider
  );
}

function getMBCost(levelMB, buildingCostDivider) {
  buildingCostDivider = buildingCostDivider !== undefined ? buildingCostDivider : 1.0;
  var curLevel = Math.max(levelMB, 1);
  return (
    (MB_Cost_Mult * Math.pow(MB_Cost_Pow, curLevel - 1)) / buildingCostDivider
  );
}

function getMatIncome(levelMP, matMult, prodMult) {
  matMult = matMult !== undefined ? matMult : 1.0;
  prodMult = prodMult !== undefined ? prodMult : 1.0;
  var curLevel = Math.max(levelMP, 1);
  return (
    matMult * prodMult * roundToN(1 + Math.pow(Mat_Income_Pow, curLevel - 1), 2)
  );
}

function getMatBoost(levelMB) {
  var curLevel = Math.max(levelMB, 1);
  return 1.0 + Math.pow(Mat_Boost_Pow, curLevel - 1);
}

function getTotalBoost(levelMB, baseDescription) {
  var singleBoost = getMatBoost(levelMB);
  var totalBoost = 0;
  for (var i = 0; i < baseDescription.length; i++) {
    var basePair = baseDescription[i];
    var numCells = basePair[0];
    var numBoosts = basePair[1];
    totalBoost += numCells * Math.pow(singleBoost, numBoosts);
  }
  return totalBoost;
}

function getTimeToBuyMats(levelMP, levelMB, baseLayout) {
  var itemCost = getMPCost(levelMP);
  var producerIncome = getMatIncome(levelMP);
  var totalBoost = getTotalBoost(levelMB, baseLayout);
  return itemCost / (producerIncome * totalBoost);
}

function getTimeToBuyBooster(levelMP, levelMB, baseLayout) {
  var itemCost = getMBCost(levelMB);
  var producerIncome = getMatIncome(levelMP);
  var totalBoost = getTotalBoost(levelMB, baseLayout);
  return itemCost / (producerIncome * totalBoost);
}

function should_buy_booster(levelMP, levelMB, baseLayout) {
  var matsTime =
    getTimeToBuyMats(levelMP, levelMB, baseLayout) +
    getTimeToBuyBooster(levelMP + 1, levelMB, baseLayout);
  var boosterTime =
    getTimeToBuyBooster(levelMP, levelMB, baseLayout) +
    getTimeToBuyMats(levelMP, levelMB + 1, baseLayout);
  return boosterTime < matsTime;
}

// handle click and add class
function calculateBreakpoints(output, layoutIdx, curMB) {
  var numberOfBreakpoints = 5;
  var maxPossibleLevel = 99999;

  var layoutIdxVal = parseInt(layoutIdx.value);
  var curMBVal = parseInt(curMB.value);

  // Stored as pairs [NumberOfBoostedCells, AmountOfBoosts]
  // i.e. [2, 5] means two cells that are boosted 5 times
  var base6Grids = [
    [
      [2, 2],
      [2, 5],
      [4, 6],
      [2, 8],
    ],
    [
      [2, 4],
      [1, 5],
      [4, 6],
      [1, 7],
      [1, 8],
      [1, 9],
    ],
    [
      [2, 4],
      [4, 6],
      [2, 7],
      [2, 9],
    ],
    [
      [2, 4],
      [2, 5],
      [2, 7],
      [2, 8],
      [2, 9],
    ],
    [
      [3, 4],
      [1, 5],
      [1, 6],
      [2, 7],
      [1, 8],
      [3, 9],
    ],
    [
      [2, 4],
      [2, 5],
      [2, 7],
      [4, 9],
    ],
    [
      [1, 4],
      [3, 5],
      [1, 7],
      [1, 8],
      [3, 9],
      [1, 10],
    ],
    [
      [2, 4],
      [1, 5],
      [2, 6],
      [1, 7],
      [2, 8],
      [2, 9],
      [2, 10],
    ],
    [
      [1, 4],
      [2, 5],
      [2, 6],
      [3, 8],
      [1, 9],
      [3, 10],
    ],
    [
      [2, 5],
      [2, 6],
      [2, 8],
      [4, 10],
    ],
  ];

  var curGrid = base6Grids[layoutIdxVal];

  var tempMP = 1;
  var tempMB = curMBVal;

  output.innerHTML = "";
  for (var i = 0; i < numberOfBreakpoints; ++i) {
    while (
      !should_buy_booster(tempMP, tempMB, curGrid) &&
      tempMP < maxPossibleLevel
    ) {
      tempMP += 1;
    }
    tempMB += 1;
    var resultsStr =
      "Mats " +
      String(tempMP).padStart(3, "0") +
      "  ->  Booster " +
      String(tempMB).padStart(2, "0") +
      "<br/>";
    output.innerHTML += resultsStr;
  }
}

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
  var layoutIndexPreview = createNodeFromHTML('<div class="layout"></div>');

  function updateLayout() {
    var index = parseFloat(layoutIndexInput.value);

    if (isNaN(index) || index < 0 || !Number.isInteger(index)) {
        layoutIndexInput.value = "0";
        index = 0;
    } else if (index > 9) {
        layoutIndexInput.value = "9";
        index = 9;
    }

    layoutIndexPreview.className = "";
    layoutIndexPreview.classList.add("layout");
    layoutIndexPreview.classList.add("l" + parseInt(index));
  }

  // layout index
  layoutIndexInput.addEventListener("change", updateLayout);

  // booster levels
  var boosterLevelInput = createNodeFromHTML(
    '<input type="number" id="CurMB" min="1" step="1" value="8" />'
  );
  var boosterLevelLabel = createNodeFromHTML(
    '<label for="CurMB">Current Mats Booster Level: </label>'
  );

  boosterLevelInput.addEventListener("change", function () {
    var index = parseInt(boosterLevelInput.value);

    if (index < 1) {
      boosterLevelInput.value = "1";
    }
  });

  button.addEventListener("click", function () {
    calculateBreakpoints(output, layoutIndexInput, boosterLevelInput);
  });

  calculate.appendChild(button);
  layoutIndex.appendChild(layoutIndexLabel);
  layoutIndex.appendChild(layoutIndexPreview);
  layoutIndex.appendChild(layoutIndexInput);
  boosterLevel.appendChild(boosterLevelLabel);
  boosterLevel.appendChild(boosterLevelInput);

  updateLayout();
  calculateBreakpoints(output, layoutIndexInput, boosterLevelInput);
}
