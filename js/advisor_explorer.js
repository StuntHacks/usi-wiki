function initAdvisorExplorer() {
    fetch("https://gist.githubusercontent.com/StuntHacks/af20d3a4a78b5059ae4a0400600423ad/raw/8cec698a4f42f926eb48210c19925c78a9376920/gistfile1.txt").then((response) => {
        return response.json()
    }).then(data => {console.log(data)})
}
