import {Map} from "./modules/valuemap.mjs";
import {UI} from "./modules/UI.mjs";

window.TERRAINMAP = new Map;
window.PREVIEW2D = document.getElementById("preview_2D");

//---Save/Load system---
window.saveSettings = function saveSettings(){
    var dataToStore = [];

    //Removing matrixes (too large to store)
    for(var layer of TERRAINMAP.layers){
        var layerCopy = {...layer};

        layerCopy.valueMatrixRaw = [];
        layerCopy.valueMatrix = [];

        dataToStore.push(layerCopy);
    }

    localStorage.setItem("layersData", JSON.stringify(dataToStore));
}

window.loadSettings = function loadSettings(){
    TERRAINMAP.layers = JSON.parse(localStorage.getItem("layersData"));
}

//window.onbeforeunload = saveSettings(TERRAINMAP.layers);

localStorage.getItem("layersData") === null ? window.saveSettings(TERRAINMAP.layers) : window.loadSettings();
//------

//---Functions connecting modules---
window.newLayer = function newLayer(){
    TERRAINMAP.layers.push(new mapLayer);
    UI.addLayerNode();
}
//------

function initialize(){
    UI.octaveSlider.setAttribute("max", Math.floor(Math.log2(TERRAINMAP.width)) + 1);

    UI.updateUIValues(TERRAINMAP.layers[0]);
    
    TERRAINMAP.fillMatrixes();
    TERRAINMAP.smooth(0);
    TERRAINMAP.mergeLayers();
    TERRAINMAP.printTerrain(PREVIEW2D);
}

initialize();