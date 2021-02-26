const mainWindow = document.getElementById("main_window");
const mainLayer = new Map();

function saveSettings(){
    localStorage.setItem("MLsettings", true);

    localStorage.setItem("MLseed", mainLayer.seed);
    localStorage.setItem("MLdimension", mainLayer.dimension);
    localStorage.setItem("MLoctavesAmount", mainLayer.octavesAmount);
    localStorage.setItem("MLscaleDivider", mainLayer.scaleDivider);
    localStorage.setItem("MLheightFactor", mainLayer.heightFactor);
    localStorage.setItem("MLheightOffset", mainLayer.heightOffset);
}

function loadSettings(){
    mainLayer.seed = localStorage.getItem("MLseed");
    mainLayer.dimension = +localStorage.getItem("MLdimension");
    mainLayer.octavesAmount = +localStorage.getItem("MLoctavesAmount");
    mainLayer.scaleDivider = +localStorage.getItem("MLscaleDivider");
    mainLayer.heightFactor = +localStorage.getItem("MLheightFactor");
    mainLayer.heightOffset = +localStorage.getItem("MLheightOffset");
}

window.onbeforeunload = saveSettings;

if(localStorage.getItem("MLsettings") === null){
    saveSettings();
}
else{
    loadSettings();
}

mainLayer.generateNoise();
mainLayer.smooth();
mainLayer.printTerrain(mainWindow);