import {Map} from "./valuemap.mjs";
import {UI} from "./UI.mjs";
import {mapLayer} from "./layers.mjs";
import {defaultShader} from "./shader.mjs";

window.TERRAINMAP = new Map(512, 512, defaultShader);
window.currentLayer = 0;

//for test purpouses
window.UI = UI;

//---Functions for printing generated map to previews---
window.print2D = function(){
    var canvas = UI.previews["2D"][0];

    var ctx = canvas.getContext("2d");
    var canvasData = ctx.createImageData(TERRAINMAP.width, TERRAINMAP.height);

    canvas.width = TERRAINMAP.width;
    canvas.height = TERRAINMAP.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

window.print1D = function(y){
    var canvas = UI.previews["1D"][0];

    var ctx = canvas.getContext("2d");
    var canvasData = ctx.createImageData(TERRAINMAP.width, TERRAINMAP.height);

    canvas.width = TERRAINMAP.width;
    canvas.height = TERRAINMAP.height;

    var mapRow = TERRAINMAP.mergedMatrix[y];
    
    var maxRowValue = -Infinity;
    var minRowValue = Infinity;

    var maxColorIndex = 0;
    var minColorIndex = 0;

    for(let x = 0; x < TERRAINMAP.width; x++){
        if(mapRow[x] > maxRowValue){
            maxRowValue = mapRow[x];
            maxColorIndex = defaultShader.colorIndex(mapRow[x]);
        }

        if(mapRow[x] < minRowValue){
            minRowValue = mapRow[x];
            minColorIndex = defaultShader.colorIndex(mapRow[x]);
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var a = (TERRAINMAP.height - 1) / (minRowValue - maxRowValue);
    var b = -maxRowValue * a;

    //color interpolation
    var aColor = (minColorIndex - maxColorIndex) / TERRAINMAP.height;
    var bColor = maxColorIndex;

    var maxColorTreshold = 0;

    if(maxRowValue > 255){
        maxColorTreshold = 255 * a + b;
    }

    for(let x = 0; x < TERRAINMAP.width; x++){
        var value = Math.floor(a * mapRow[x] + b);

        for(let yIndex = value; yIndex < TERRAINMAP.height; yIndex++){
            var pixelIndex = (yIndex * TERRAINMAP.width + x) * 4;
            var color = color = [242, 242, 242];

            if(yIndex >= maxColorTreshold){
                color = defaultShader.mainGradient[Math.floor(aColor * yIndex + bColor)];
            }

            canvasData.data[pixelIndex + 0] = color[0];
            canvasData.data[pixelIndex + 1] = color[1];
            canvasData.data[pixelIndex + 2] = color[2];
            canvasData.data[pixelIndex + 3] = 255;
        }
    }

    ctx.putImageData(canvasData, 0, 0);
}

window.printTerrain = function(){
    TERRAINMAP.mergeLayers();

    if(UI.showPreview[0]){
        print1D(UI.preview1DSlider.val());
    }

    if(UI.showPreview[1]){
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

    UI.saveStatus.text("Changes saved");
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

//might move to UI.mjs
window.togglePreview = function(n){
    var index = n - 1;
    var dimension = n + "D";

    if(UI.showPreview[index]){
        UI.previewsHTMLdata[dimension] = UI.previewsHolder.children().eq(index).html();
        UI.previews[dimension].remove();

        UI.showPreview[index] = false;
    }
    else{
        UI.previewsHolder.children().eq(index).append(UI.previewsHTMLdata[dimension]);

        UI.previews[dimension] = $("#preview_" + dimension);

        UI.showPreview[index] = true;
    }

    if(n == 1){
        UI.preview1DSlider.toggle();
    }

    printTerrain();
}

var previewsSize = {width: TERRAINMAP.width, height: TERRAINMAP.height};

window.updatePreviewsSize = function(){
    for(let i = 0; i < 3; i++){
        if(UI.showPreview[i]){
            UI.previews[(i + 1) + "D"].css({width: previewsSize.width + "px", height: previewsSize.height + "px"});
        }
    }
}
//------

//---To refactor---
var keyPressed = false;

window.onkeydown = function(event){
    if(event.key == "z"){
        keyPressed = true;
    }
}

window.onkeyup = function(event){
    if(event.key == "z"){
        keyPressed = false;
    }
}

function previewZoom(event){
    if(keyPressed){
        if(event.deltaY < 0){
            previewsSize.width += 50; //px
            previewsSize.height += 50; //px
        }
        else{
            previewsSize.width -= 50; //px
            previewsSize.height -= 50; //px
        }

        updatePreviewsSize();
    }
}

document.onwheel = function(event){previewZoom(event);}
//------

function initialize(){
    localStorage.getItem("layersData") === null ? window.saveSettings(TERRAINMAP.layers) : window.loadSettings();

    UI.octaveSlider.attr("max", Math.floor(Math.log2(TERRAINMAP.width)) + 1);

    UI.preview1DSlider.attr("max", TERRAINMAP.height - 1);
    UI.preview1DSlider.hide();

    UI.updateUIValues(TERRAINMAP.layers[0]);

    UI.previews["2D"].width(TERRAINMAP.width + "px");

    //Centering div with JQuery so I can omit using transform - which would make draggable
    UI.previewsHolder.css({
        "top": (($(window).height() - UI.previewsHolder.outerHeight()) / 2 + $(window).scrollTop() + "px"),
        "left": (($(window).width() - UI.previewsHolder.outerWidth()) / 2 + $(window).scrollLeft() + "px")
    });
    
    UI.previewsHolder.draggable();
}

initialize();