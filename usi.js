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
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const k of keysA) {
    if (!deepEqual(a[k], b[k])) return false;
  }
  return true;
}

function dedupeObjects(arr) {
  const result = [];
  for (const obj of arr) {
    if (!result.some((o) => deepEqual(o, obj))) {
      result.push(obj);
    }
  }
  return result;
}

function createNodeFromHTML(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function renderSVGs(selector) {
  const icons = document.querySelectorAll(selector !== undefined ? selector : ".icon");
  for (let icon of icons) {
    if (icons_svgs[icon.dataset.icon]) {
      const node = createNodeFromHTML(icons_svgs[icon.dataset.icon]);

      if (icon.dataset.text) {
        const texts = node.getElementsByTagName("tspan");
        for (let text of texts) {
          text.innerHTML = icon.dataset.text;
        }
      }

      icon.appendChild(node);
    }
  }
}

function renderEnemies(selector) {
  const icons = document.querySelectorAll(selector !== undefined ? selector : ".enemy-icon");
  for (let icon of icons) {
    let type = icon.dataset.type;

    if (type === undefined || type === "") {
      switch (icon.dataset.name) {
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

    const name = icon.dataset.name + type;
    if (enemy_pngs[name]) {
      var node = createNodeFromHTML(enemy_pngs[name]);
      icon.appendChild(node);
    }
  }
}

function renderImages() {
  const images = document.querySelectorAll(".lazy-image");
  for (let image of images) {
    var img = document.createElement("img");
    img.src = image.dataset.img;
    image.replaceWith(img);
  }
}

function scrollIntoView(element) {
  if (element) {
    const position = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: position - 100,
      behavior: "smooth",
    });
  }
}
  
function getHorizontalOffset(element) {
  const rect = element.getBoundingClientRect();
  if (rect.left < 0) return rect.left;
  if (rect.right > window.innerWidth) return rect.right - window.innerWidth;
  return 0;
}

function timerangeToString(date) {
  const now = new Date();
  const diff = Math.abs(now - date) / 1000;
  if (diff < 60) {
    return "a few moments";
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return minutes + " minute" + (minutes !== 1 ? "s" : "");
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return hours + " hour" + (hours !== 1 ? "s" : "");
  } else {
    const days = Math.floor(diff / 86400);
    return days + " day" + (days !== 1 ? "s" : "");
  }
}

function init() {
  // imgs
  renderImages();
  // svgs
  renderSVGs();
  // enemies
  renderEnemies();

  const breakpointCalculator = document.getElementById("base-6-breakpoints");
  if (breakpointCalculator) {
    initBreakpointCalculator();
  }

  const advisorExplorer = document.getElementById("advisor-explorer");
  if (advisorExplorer) {
    initAdvisorExplorer();
  }

  const spliceOptimizer = document.getElementById("splice-optimizer");
  if (spliceOptimizer) {
    initSpliceOptimizer();
  }

  // collapsible cores
  const cores = document.getElementsByClassName("core-name");
  for (let core of cores) {
    core.addEventListener("click", function (e) {
      e.target.closest(".core-table").classList.toggle("expanded");
    });
  }

  // remove annoying empty paragraphs
  const emptyParagraphs = document.querySelectorAll(".shard-effects .mw-empty-elt");
  for (let paragraph of emptyParagraphs) {
    paragraph.parentNode.removeChild(paragraph);
  }

  // init tabs
  const switchTab = (e) => {
    const tab = e.target;
    const content = tab.dataset.for;
    const parent = tab.closest(".js-tabs");
    const activeTab = parent.querySelector(".tab.active");
    const activeContent = parent.querySelector(".tab-content.active");
    const target = parent.querySelector(".tab-content[data-tabid='" + content + "'");
    if (activeTab !== null) activeTab.classList.remove("active");
    if (activeContent !== null) activeContent.classList.remove("active");
    if (tab !== null) tab.classList.add("active");
    if (target !== null) target.classList.add("active");
  }

  const tabs = document.querySelectorAll(".js-tabs .tab");
  for (let tab of tabs) {
    tab.addEventListener("click", switchTab);

    const expanded = window.location.hash.match(/(?:^|#)tab=([^&]+)/);
    const tabId = tab.dataset.for;
    const scrollTarget = tab.dataset.scroll;
    if (expanded && expanded[1] === tabId) {
      switchTab({ target: tab });

      if (scrollTarget) {
        const id = scrollTarget.replaceAll(" ", "_").replaceAll("+", ".2B");
        scrollIntoView(document.getElementById(id));
      } else {
        scrollIntoView(tab);
      }
    }
  }

  // spoiler sections
  const spoilers = document.querySelectorAll(".spoiler-button");
  for (let spoiler of spoilers) {
    spoiler.addEventListener("click", function (e) {
      e.target.closest(".spoiler-block").classList.add("dismissed");
    });
  }

  // move tooltips onscreen
  const adjustTooltips = () => {
    var tooltips = document.getElementsByClassName("tooltip");
    for (let tooltip of tooltips) {
      const offset = getHorizontalOffset(tooltip);
      let margin;
      if (offset > 0) margin = -(offset + 10) + "px";
      else margin = "10px";
      tooltip.style.marginLeft = margin;
    }
  }

  window.addEventListener("resize", adjustTooltips);
  adjustTooltips();

  // init copy buttons
  const setCopyText = (element) => {
    element.innerText = "Copy";
  }

  const copyToClipboard = (e) => {
    navigator.clipboard.writeText(
      e.target.parentNode.querySelector(e.target.dataset.target || "span").innerText
    );
    e.target.innerText = "Copied!";
    setTimeout(setCopyText.bind(null, e.target), 1000);
  }

  const copyButtons = document.querySelectorAll(".copy-button");
  for (let button of copyButtons) {
    button.addEventListener("click", copyToClipboard);
  }

  // save button message & confirm alert
  const saveArea = document.querySelector(".editOptions:has(#wpSaveWidget)");
  if (saveArea) {
    const saveButton = saveArea.querySelector("#wpSaveWidget input");
    saveButton.removeAttribute("title");
    saveButton.addEventListener("click", (e) => {
      if (
        localStorage.getItem("preference_confirmSave") === "true" &&
        !window.confirm("Save changes?")
      ) {
        e.preventDefault();
      }
    });

    const confirmCheckbox = createNodeFromHTML(`
      <label style="margin-left:10px;">
        <input
          type="checkbox" ${localStorage.getItem("preference_confirmSave") === "true" ? "checked" : ""}
          id="confirmSaveCheckbox"
        >
        Confirm save?
      </label>
    `);
    saveArea.appendChild(confirmCheckbox);
    document.getElementById("confirmSaveCheckbox").addEventListener("change", (e) => {
      localStorage.setItem("preference_confirmSave", e.target.checked.toString());
    });
  }

  // welcome message
  const welcomeMessage = document.getElementById("welcome-message");
  const username = document.querySelector("#pt-userpage a");
  if (welcomeMessage && username) {
    welcomeMessage.innerText = `Welcome, ${username.innerHTML}!`;
  }

  // download buttons
  const downloadButtons = document.getElementById("download-buttons");
  if (downloadButtons) {
    downloadButtons.innerHTML = `
      <a href="https://store.steampowered.com/app/2471100/Unnamed_Space_Idle/" target="_blank">
        <img src="https://img-spaceidle.game-vault.net/c/cf/Steam_Badge.png" alt="Download on Steam">
      </a>
      <a href="https://play.google.com/store/apps/details?id=com.jdogcorp.unnamedspaceidle" target="_blank">
        <img src="https://img-spaceidle.game-vault.net/7/7b/Google_Button.png" alt="Download on Steam">
      </a>
      <a href="https://apps.apple.com/us/app/unnamed-space-idle/id6483933995" target="_blank">
        <img src="https://img-spaceidle.game-vault.net/a/a4/AppStore_Button.png" alt="Download on Steam">
      </a>
    `;
  }

  // rss feed ordering
  const entries = Array.prototype.slice.call(document.getElementsByClassName("rss-element"));
  entries.sort((a, b) => {
    const dateA = new Date(a.dataset.date);
    const dateB = new Date(b.dataset.date);
    return dateB - dateA;
  });

  for (let entry of entries) {
    const date = new Date(entry.dataset.date);
    console.log({date})
    entry.querySelector(".date").innerText = `${timerangeToString(date)} ago`;
    entry.querySelector("a").target = "_blank";
    entry.parentElement.appendChild(entry);
  }
}

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
