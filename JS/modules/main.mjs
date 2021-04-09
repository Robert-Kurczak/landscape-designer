import {Map} from "./valuemap.mjs";
import {UI} from "./UI.mjs";
import {mapLayer} from "./layers.mjs";
import {defaultShader} from "./shader.mjs";

window.TERRAINMAP = new Map(512, 512, defaultShader);
window.currentLayer = 0;

window.show1DPreview = false;
window.show2DPreview = true;
window.show3DPreview = false;

//---Functions for printing generated map to previews---
window.print2D = function(){
    var canvas = UI.preview2D[0];

    var ctx = canvas.getContext("2d");
    var canvasData = ctx.createImageData(TERRAINMAP.width, TERRAINMAP.height);

    canvas.width = TERRAINMAP.width;
    canvas.height = TERRAINMAP.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    TERRAINMAP.mergeLayers();

    var yIndex = 0;
    var xIndex = 0;
    for(let i = 0; i < canvasData.data.length; i += 4){
        var pixelColor = defaultShader.color(TERRAINMAP.mergedMatrix[yIndex][xIndex]);

        canvasData.data[i + 0] = pixelColor[0];     // Red value
        canvasData.data[i + 1] = pixelColor[1];     // Green value
        canvasData.data[i + 2] = pixelColor[2];     // Blue value
        canvasData.data[i + 3] = 255;               // Alpha value

        xIndex++;

        if(xIndex == TERRAINMAP.width){
            xIndex = 0;
            yIndex++;
        }
    }

    ctx.putImageData(canvasData, 0, 0);
}

window.printTerrain = function(){
    if(show2DPreview){
        print2D();
    }
}
//------

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
        TERRAINMAP.generateNoise(nLayer)
        TERRAINMAP.smooth(nLayer);

        UI.addLayerNode(nLayer);
    }
    
    printTerrain();
}

//window.onbeforeunload = saveSettings(TERRAINMAP.layers);
//------

//---Functions connecting modules---
window.newLayer = function(){
    TERRAINMAP.layers.push(new mapLayer);
    TERRAINMAP.generateNoise(TERRAINMAP.layers.length - 1)
    TERRAINMAP.smooth(TERRAINMAP.layers.length - 1)

    UI.addLayerNode();
}

window.deleteLayer = function(node){
    TERRAINMAP.layers.splice($(node).index(), 1);
    currentLayer = UI.layersPanel.length - 1;
    printTerrain();

    UI.removeLayerNode(node);
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

//---Controlls---
var shiftPressed = false;

window.onkeydown = function(event){
    if(event.key == "Shift"){
        shiftPressed = true;
    }
}

window.onkeyup = function(event){
    if(event.key == "Shift"){
        shiftPressed = false;
    }
}

UI.preview2D.width(TERRAINMAP.width + "px")

function previewZoom(event){
    if(shiftPressed){
        if(event.deltaY < 0){
            UI.preview2D.width("+=50px");
        }
        else{
            UI.preview2D.width("-=50px");
        }
    }
}

document.onwheel = function(event){previewZoom(event);}
//------

function initialize(){
    localStorage.getItem("layersData") === null ? window.saveSettings(TERRAINMAP.layers) : window.loadSettings();

    UI.octaveSlider.attr("max", Math.floor(Math.log2(TERRAINMAP.width)) + 1);

    UI.updateUIValues(TERRAINMAP.layers[0]);
}

initialize();