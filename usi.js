// - - - This file MUST be valid ES5 - otherwise the wiki won't accept it and won't render it! - - -
// - - - var instead of let, no for-of loops, semicolons after every statement, etc
var icons_svgs = new Array();
var enemy_pngs = new Array();
icons_svgs["UIVoidMatter"] =
  '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve"><g id="Resources"><circle fill="#78888C" cx="48" cy="48" r="48"/><circle fill="#A1B6BB" cx="48" cy="48" r="40.9802589"/><circle fill="#DE532C" cx="48" cy="48" r="30.6410122"/></g></svg>';
icons_svgs["UISalvage"] =
  '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 96 96" enable-background="new 0 0 96 96" xml:space="preserve"><g id="Resources"><path fill="#78888C" d="M76,96H20C9,96,0,87,0,76V20C0,9,9,0,20,0h56c11,0,20,9,20,20v56C96,87,87,96,76,96z"/><path fill="#A1B6BB" d="M74.6252365,91.4533997h-53.250473c-9.2554874,0-16.8281593-7.5726776-16.8281593-16.8281631v-53.250473c0-9.2554874,7.5726719-16.8281593,16.8281593-16.8281593h53.250473c9.2554855,0,16.8281631,7.5726719,16.8281631,16.8281593v53.250473C91.4533997,83.880722,83.880722,91.4533997,74.6252365,91.4533997z"/><rect x="13.8840675" y="13.8840675" fill="#BDD6DB" width="68.2318649" height="68.2318649"/><rect x="20.4385815" y="20.4385815" fill="#AC3939" width="55.1228371" height="55.1228371"/><line fill="none" stroke="#BDD6DB" stroke-width="11" stroke-miterlimit="10" x1="18.7990608" y1="77.200943" x2="77.200943" y2="18.7990608"/></g></svg>';
/* {ICON_PLACEHOLDER} */

/* {JS_PLACEHOLDER} */

// main usi.js
function createNodeFromHTML(htmlString) {
  var div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function renderSVGs(selector) {
  var icons = document.querySelectorAll(selector !== undefined ? selector : ".icon");
  for (var i = 0; i < icons.length; i++) {
    if (icons_svgs[icons[i].dataset.icon]) {
      var node = createNodeFromHTML(icons_svgs[icons[i].dataset.icon]);

      if (icons[i].dataset.text) {
        var texts = node.getElementsByTagName("tspan");
        for (var j = 0; j < texts.length; j++) {
          texts[j].innerHTML = icons[i].dataset.text;
        }
      }

      icons[i].appendChild(node);
    }
  }
}

function renderEnemies(selector) {
  var icons = document.querySelectorAll(selector !== undefined ? selector : ".enemy-icon");
  for (var i = 0; i < icons.length; i++) {
    var type = icons[i].dataset.type;

    if (type === undefined || type === "") {
      switch (icons[i].dataset.name) {
        case "Capital":
          type = "";
          break;
        case "Veiled":
          type = "";
          break;
        default:
          type = "_Hull";
          break;
      }
    } else {
      type = "_" + type;
    }

    var name = icons[i].dataset.name + type;
    if (enemy_pngs[name]) {
      var node = createNodeFromHTML(enemy_pngs[name]);
      icons[i].appendChild(node);
    }
  }
}

function renderImages() {
  var images = document.querySelectorAll(".lazy-image");
  for (var i = 0; i < images.length; i++) {
    var img = document.createElement("img");
    img.src = images[i].dataset.img;
    images[i].replaceWith(img);
  }
}

function scrollIntoView(element) {
  if (element) {
    var position = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: position - 100,
      behavior: "smooth",
    });
  }
}
  
function getHorizontalOffset(element) {
  var rect = element.getBoundingClientRect();
  if (rect.left < 0) return rect.left;
  if (rect.right > window.innerWidth) return rect.right - window.innerWidth;
  return 0;
}

function init() {
  // imgs
  renderImages();
  // svgs
  renderSVGs();
  // enemies
  renderEnemies();

  var breakpointCalculator = document.getElementById("base-6-breakpoints");
  if (breakpointCalculator) {
    initBreakpointCalculator();
  }

  // collapsible cores
  var cores = document.getElementsByClassName("core-name");
  for (var i = 0; i < cores.length; i++) {
    cores[i].addEventListener("click", function (e) {
      e.target.closest(".core-table").classList.toggle("expanded");
    });
  }

  // remove annoying empty paragraphs
  var emptyParagraphs = document.querySelectorAll(".shard-effects .mw-empty-elt");
  for (var i = 0; i < emptyParagraphs.length; i++) {
    emptyParagraphs[i].parentNode.removeChild(emptyParagraphs[i]);
  }

  // init tabs
  function switchTab(e) {
    var tab = e.target;
    var content = tab.dataset.for;
    var parent = tab.closest(".js-tabs");
    var activeTab = parent.querySelector(".tab.active");
    var activeContent = parent.querySelector(".tab-content.active");
    var target = parent.querySelector(".tab-content[data-tabid='" + content + "'");
    if (activeTab !== null) activeTab.classList.remove("active");
    if (activeContent !== null) activeContent.classList.remove("active");
    if (tab !== null) tab.classList.add("active");
    if (target !== null) target.classList.add("active");
  }

  var tabs = document.querySelectorAll(".js-tabs .tab");
  for (var i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener("click", switchTab);

    var expanded = window.location.hash.match(/(?:^|#)tab=([^&]+)/);
    var tabId = tabs[i].dataset.for;
    var scrollTarget = tabs[i].dataset.scroll;
    if (expanded && expanded[1] === tabId) {
      switchTab({ target: tabs[i] });

      if (scrollTarget) {
        var id = scrollTarget.replaceAll(" ", "_").replaceAll("+", ".2B");
        scrollIntoView(document.getElementById(id));
      } else {
        scrollIntoView(tabs[i]);
      }
    }
  }

  // spoiler sections
  var spoilers = document.querySelectorAll(".spoiler-button");
  for (var i = 0; i < spoilers.length; i++) {
    spoilers[i].addEventListener("click", function (e) {
      e.target.closest(".spoiler-block").classList.add("dismissed");
    });
  }

  // move tooltips onscreen
  function adjustTooltips() {
    var tooltips = document.getElementsByClassName("tooltip");
    for (var i = 0; i < tooltips.length; i++) {
      var offset = getHorizontalOffset(tooltips[i]);
      if (offset > 0) tooltips[i].style.marginLeft = -(offset + 10) + "px";
    }
  }

  window.addEventListener("resize", adjustTooltips);
  adjustTooltips();

  // init copy buttons
  function setCopyText(element) {
    element.innerText = "Copy";
  }

  function copyToClipboard(e) {
    navigator.clipboard.writeText(
      e.target.parentNode.querySelector("span").innerText
    );
    e.target.innerText = "Copied!";
    setTimeout(setCopyText.bind(null, e.target), 1000);
  }

  var copyButtons = document.querySelectorAll(".copy-button");
  for (var i = 0; i < copyButtons.length; i++) {
    copyButtons[i].addEventListener("click", copyToClipboard);
  }

  // save button message & confirm alert
  var saveArea = document.querySelector(".editOptions:has(#wpSaveWidget)");
  if (saveArea) {
    var saveButton = saveArea.querySelector("#wpSaveWidget input");
    saveButton.removeAttribute("title");
    saveButton.addEventListener("click", function (e) {
      if (
        localStorage.getItem("preference_confirmSave") === "true" &&
        !window.confirm("Save changes?")
      ) {
        e.preventDefault();
      }
    });

    var confirmCheckbox = createNodeFromHTML(
      '<label style="margin-left:10px;"><input type="checkbox" \
      ' + (localStorage.getItem("preference_confirmSave") === "true" ? "checked" : "") + ' \
      id="confirmSaveCheckbox">Confirm save?</label>'
    );
    saveArea.appendChild(confirmCheckbox);
    document.getElementById("confirmSaveCheckbox").addEventListener("change", function (e) {
      localStorage.setItem("preference_confirmSave", e.target.checked.toString());
    });
  }
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
