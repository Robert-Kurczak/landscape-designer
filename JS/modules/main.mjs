import {Map} from "./valuemap.mjs";
import {UI} from "./UI.mjs";
import {mapLayer} from "./layers.mjs";

window.TERRAINMAP = new Map;
window.PREVIEW2D = document.getElementById("preview_2D");
window.currentLayer = 0;

//---Save/Load system---
window.saveSettings = function(){
    var dataToStore = [];

    //Removing matrixes (too large to store)
    for(var layer of TERRAINMAP.layers){
        var layerCopy = {...layer};

        layerCopy.valueMatrixRaw = [];
        layerCopy.valueMatrix = [];

        dataToStore.push(layerCopy);
    }

    localStorage.setItem("layersData", JSON.stringify(dataToStore));

    UI.saveStatus.innerText = "Changes saved";
}

window.loadSettings = function(){
    TERRAINMAP.layers = JSON.parse(localStorage.getItem("layersData"));

    for(let nLayer in TERRAINMAP.layers){
        TERRAINMAP.fillMatrixes(nLayer);
        TERRAINMAP.smooth(nLayer);

        UI.addLayerNode(nLayer);
    }
    
    TERRAINMAP.mergeLayers();
    TERRAINMAP.printTerrain(PREVIEW2D);
}

//window.onbeforeunload = saveSettings(TERRAINMAP.layers);
//------

//---Functions connecting modules---
window.newLayer = function(){
    TERRAINMAP.layers.push(new mapLayer);
    TERRAINMAP.fillMatrixes(TERRAINMAP.layers.length - 1);
    UI.addLayerNode();
}

window.deleteLayer = function(node){
    TERRAINMAP.layers.splice($(node).index(), 1);
    UI.removeLayerNode(node);

    currentLayer = UI.layersPanel.length - 1;
    TERRAINMAP.mergeLayers();
    TERRAINMAP.printTerrain(PREVIEW2D);
}

var lastLayerNode = null;

window.changeLayer = function(node){
    if(lastLayerNode != null){
        lastLayerNode.css("background-color", "#212121");
    }

    $(node).css("background-color", "#141414");
    lastLayerNode = $(node);
    
    var nLayer = $(node).parent().index();

    window.currentLayer = nLayer;
    UI.updateUIValues(TERRAINMAP.layers[nLayer]);
}

window.checkChanges = function(){
    if(UI.saveStatus.text() == "Changes saved"){
        UI.saveStatus.text("Changes unsaved");
    }
}
//------

function initialize(){
    localStorage.getItem("layersData") === null ? window.saveSettings(TERRAINMAP.layers) : window.loadSettings();

    UI.octaveSlider.attr("max", Math.floor(Math.log2(TERRAINMAP.width)) + 1);

    UI.updateUIValues(TERRAINMAP.layers[0]);
}

initialize();