let galaxies = null;

function initAdvisorExplorer() {
    const init = () => {
        console.log("init!");
    }

    fetch("https://raw.githubusercontent.com/StuntHacks/usi-wiki/refs/heads/master/js/galaxies.json").then((response) => {
        return response.json()
    }).then(data => { galaxies = data; init(); });
}
