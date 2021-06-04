import {Map} from "./valuemap.mjs";
import {UI} from "./UI.mjs";
import {mapLayer} from "./layers.mjs";
import {defaultShader} from "./shader.mjs";

window.TERRAINMAP = new Map(512, 512, defaultShader);
window.UI = UI;

//---Functions for printing generated map to previews---
function print1D(y){
    //---Setting canvas node---
    var canvas = UI.previews["1D"][0];

    var ctx = canvas.getContext("2d");
    var canvasData = ctx.createImageData(TERRAINMAP.width, TERRAINMAP.height);

    canvas.width = TERRAINMAP.width;
    canvas.height = TERRAINMAP.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //------

    //---Values for color interpolation---
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
    //------

    //Height interpolation equation
    var a = (TERRAINMAP.height - 1) / (minRowValue - maxRowValue);
    var b = -maxRowValue * a;

    //Color interporation equation
    var aColor = (minColorIndex - maxColorIndex) / TERRAINMAP.height;
    var bColor = maxColorIndex;

    //Threshold after which there is white color
    var maxColorThreshold = 0;

    if(maxRowValue > 255){
        maxColorThreshold = 255 * a + b;
    }

    //---Filling canvas---
    for(let x = 0; x < TERRAINMAP.width; x++){
        var value = Math.floor(a * mapRow[x] + b);

        for(let yIndex = value; yIndex < TERRAINMAP.height; yIndex++){
            var pixelIndex = (yIndex * TERRAINMAP.width + x) * 4;
            var color = color = [242, 242, 242];

            if(yIndex >= maxColorThreshold){
                color = defaultShader.mainGradient[Math.floor(aColor * yIndex + bColor)];
            }

            canvasData.data[pixelIndex + 0] = color[0];
            canvasData.data[pixelIndex + 1] = color[1];
            canvasData.data[pixelIndex + 2] = color[2];
            canvasData.data[pixelIndex + 3] = 255;
        }
    }

    ctx.putImageData(canvasData, 0, 0);
    //------
}

window.print2D = function(canvas = UI.previews["2D"][0]){
    //---Setting canvas node---
    var ctx = canvas.getContext("2d");
    var canvasData = ctx.createImageData(TERRAINMAP.width, TERRAINMAP.height);

    canvas.width = TERRAINMAP.width;
    canvas.height = TERRAINMAP.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //------

    //---Filling canvas---
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
    //------
}

//Function for shaping plane geometry according to TERRAINMAP.mergedMatrix
function shapeObject(geometry){
    var verticles = geometry.attributes.position.array;

    var yIndex = 0;
    var xIndex = 0;

    for(let i = 0; i < verticles.length; i += 3){
        verticles[i + 2] = TERRAINMAP.mergedMatrix[yIndex][xIndex];

        xIndex++;

        if(xIndex == TERRAINMAP.width){
            xIndex = 0;
            yIndex++;
        }
    }

    geometry.attributes.position.needsUpdate = true;

    return geometry;
}

//Function for texturing material according to TERRAINMAP.mergedMatrix
function textureObject(geometryMaterial){
    //Getting texture from existing canvas for 2D preview if it's shown
    if(UI.showPreview[1]){
        geometryMaterial.map = new THREE.CanvasTexture(UI.previews["2D"][0]);
    }
    //Generating texture from raw data if 2D preview is hidden
    else{
        var colorMap = [];

        for(let y = 0; y < TERRAINMAP.height; y++){
            for(let x = 0; x < TERRAINMAP.width; x++){
                var color = defaultShader.color(TERRAINMAP.mergedMatrix[y][x]);
                colorMap.push(color[0], color[1], color[2], 255);
            }
        }

        const dataTexture = new THREE.DataTexture(
            Uint8Array.from(colorMap),
            TERRAINMAP.width,
            TERRAINMAP.height,
            THREE.RGBAFormat,
            THREE.UnsignedByteType,
            THREE.UVMapping
        );

        dataTexture.flipY = true;
        
        dataTexture.needsUpdate = true;

        geometryMaterial.map = dataTexture;
    }

    return geometryMaterial;
}

var terrainGeometry;
var geometryMaterial;
var terrainPlane;
window.print3D = function(){
    //If canvas for drawing scene doesn't exist
    if(UI.previews["3D"].children().length == 0){
        //---Setting 3D scene---
        const preview3DScene = new THREE.Scene();
        const preview3DCamera = new THREE.PerspectiveCamera(75, TERRAINMAP.width / TERRAINMAP.height, 0.1, 1000);

        const preview3DRenderer = new THREE.WebGLRenderer();
        preview3DRenderer.setSize(TERRAINMAP.width, TERRAINMAP.height);

        UI.previews["3D"][0].appendChild(preview3DRenderer.domElement);

        //Proper width and height for new scene node
        UI.previews["3D"].children().css({width: UI.previewsSize.width, height: UI.previewsSize.height});
        //------

        //---Setting 3D object---
        terrainGeometry = new THREE.PlaneBufferGeometry(TERRAINMAP.width, TERRAINMAP.height, TERRAINMAP.width - 1, TERRAINMAP.height - 1);
        geometryMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 0,
            side: THREE.DoubleSide
        });
        terrainPlane = new THREE.Mesh(terrainGeometry, geometryMaterial);
        //------

        //---Shaping object---
        terrainGeometry = shapeObject(terrainGeometry);
        geometryMaterial = textureObject(geometryMaterial);
        //terrainGeometry.attributes.position.needsUpdate = true;
        //------

        //---Setting scene light---
        const preview3DLight = new THREE.PointLight(0xffffff, 2, 0, 0);
        preview3DLight.position.set(TERRAINMAP.width / 2, TERRAINMAP.height / 2, 200);
        //------

        preview3DScene.add(preview3DLight);
        preview3DScene.add(terrainPlane);

        preview3DCamera.position.z = TERRAINMAP.height + 100;

        //---Control of generated scene---
        const controls = new THREE.OrbitControls(preview3DCamera, preview3DRenderer.domElement);
        controls.movementSpeed = 10;
        controls.lookSpeed = 0.000001;
        //------

        //---Redrawing scene---
        function animate(){
            requestAnimationFrame(animate);
        
            preview3DRenderer.render(preview3DScene, preview3DCamera);
        }
        
        animate();
        //------
    }
    //Updating existing 3D object
    else{
        terrainGeometry = shapeObject(terrainGeometry);
        geometryMaterial = textureObject(geometryMaterial);
    }
}

window.printTerrain = function(){
    TERRAINMAP.mergeLayers();

    if(UI.showPreview[0]){
        print1D(UI.preview1DSlider.val());
    }

    if(UI.showPreview[1]){
        print2D();
    }

    if(UI.showPreview[2]){
        print3D();
    }

    //To refractor
    //All previews are being updated
    //when preview is toggle
}
//------

//---Save/Load system---
function JSONfromLayers(){
    var JSONcontent = [];

    //---Removing matrixes (too large to store)---
    for(var layer of TERRAINMAP.layers){
        var layerCopy = {...layer};

        layerCopy.valueMatrixRaw = [];
        layerCopy.valueMatrix = [];

        JSONcontent.push(layerCopy);
    }
    //------

    return JSON.stringify(JSONcontent);
}

function layersFromJSON(JSONstring){
    UI.clearLayersNodes();

    TERRAINMAP.layers = JSON.parse(JSONstring);

    //---Rebuilding matrixes from layers settings---
    for(let nLayer in TERRAINMAP.layers){
        TERRAINMAP.generateNoise(nLayer)
        TERRAINMAP.smooth(nLayer);

        UI.addLayerNode(nLayer);
    }
    //------

    printTerrain();
}

window.saveToBrowser = function(){
    localStorage.setItem("layersData", JSONfromLayers());

    UI.saveStatus.text("Changes saved");
}

window.saveToJSON = function(){
    //---Creating virtual anchor---
    var a = document.createElement("a");
    var file = new Blob([JSONfromLayers()], {type: "application/json"});
    
    a.href = URL.createObjectURL(file);
    a.download = "TerrainJSON.json";
    //------

    a.click();

    URL.revokeObjectURL(a.href);
}

window.saveHeightMap = function(){
    //---Creating virtual anchor---
    var a = document.createElement("a");
    var content = JSON.stringify(TERRAINMAP.mergedMatrix);

    //---Refractoring matrix---
    //Removing comas, brackets
    //Adding \n after every row
    content = content.slice(2, content.length - 2).replaceAll("],[", "\n").replaceAll(",", " ");

    var file = new Blob([content], {type: "txt"});
    
    a.href = URL.createObjectURL(file);
    a.download = "TerrainHeightMap.txt";
    //------

    a.click();
    
    URL.revokeObjectURL(a.href);
}

window.saveImage = function(){
    //---Creating virtual canvas and filling it with 2D preview---
    var canvas = document.createElement("canvas");
    print2D(canvas);
    //------
    
    //---Creating virtual anchor---
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "TerrainPNG.png";
    //------

    a.click();

    URL.revokeObjectURL(a.href);
}

window.saveOBJ = function(){
    //---Setting 3D object---
    var terrainGeometry = new THREE.PlaneBufferGeometry(TERRAINMAP.width, TERRAINMAP.height, TERRAINMAP.width - 1, TERRAINMAP.height - 1);
    var geometryMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 0,
        side: THREE.DoubleSide
    });
    //------

    terrainGeometry = shapeObject(terrainGeometry);
    //geometryMaterial = textureObject(geometryMaterial);

    var terrainPlane = new THREE.Mesh(terrainGeometry, geometryMaterial);

    var exporter = new THREE.OBJExporter();

    //---Creating virtual anchor---
    var a = document.createElement("a");
    var file = new Blob([exporter.parse(terrainPlane)], {type: "obj"});

    a.href = URL.createObjectURL(file);
    a.download = "TerrainOBJ.obj";
    //------

    a.click();

    URL.revokeObjectURL(a.href);
}

window.loadFromBrowser = function(){
    layersFromJSON(localStorage.getItem("layersData"));
}

window.loadFromJSON = function(){
    //---Creating virtual input---
    var uploader = document.createElement("input");
    uploader.setAttribute("type", "file");
    uploader.setAttribute("accept", ".json");
    //------

    uploader.onchange = function(){
        var fileName = uploader.files[0].name;

        if(fileName.slice(fileName.indexOf(".") + 1) == "json"){
            var reader = new FileReader();

            reader.onload = function(file){
                layersFromJSON(file.target.result);
            };
    
            reader.readAsText(uploader.files[0]);
        }
        else{
            window.alert("Incorrect file format");
        }
    };

    uploader.click();
}

//------

window.currentLayer = 0;
var lastLayerNode = null;

window.changeLayer = function(node){
    //---Changing layers nodes colors---
    //Active layer -> active color
    //Previously active layer -> inactive color
    if(lastLayerNode != null){
        lastLayerNode.css("background-color", UI.inactiveColor);
    }

    $(node).css("background-color", UI.activeColor);
    lastLayerNode = $(node);
    //------
    
    var nLayer = $(node).parent().index();

    window.currentLayer = nLayer;
    UI.updateUIValues(TERRAINMAP.layers[nLayer]);
}

window.newLayer = function(){
    //---Creating new layer object and filling it with matrixes---
    TERRAINMAP.layers.push(new mapLayer);
    TERRAINMAP.generateNoise(TERRAINMAP.layers.length - 1)
    TERRAINMAP.smooth(TERRAINMAP.layers.length - 1)
    //------

    UI.addLayerNode();

    //First layer case
    if(UI.layersPanel.children().length == 2){
        UI.settingsPanel.show();

        changeLayer($(".layer_selector").first());
    }
}

window.deleteLayer = function(node){
    if(confirm("Do you want to remove this layer?")){
        TERRAINMAP.layers.splice($(node).index(), 1);
        currentLayer = UI.layersPanel.length - 1;
        printTerrain();

        UI.removeLayerNode(node);
    }
}

//Function for changing changes status in upper panel
window.checkChanges = function(){
    if(UI.saveStatus.text() == "Changes saved"){
        UI.saveStatus.text("Changes unsaved");
    }
}

window.togglePreview = function(n){
    var index = n - 1;
    var dimension = n + "D";

    if(UI.showPreview[index]){
        UI.previews[dimension].remove();

        UI.showPreview[index] = false;
    }
    else{
        //---Rebuilding preview node based on initial HTML code---
        UI.previewsHolder.children().eq(index).append(UI.previewsHTML[dimension]);

        UI.previews[dimension] = $("#preview_" + dimension);
        UI.previews[dimension].css({width: UI.previewsSize.width, height: UI.previewsSize.height});
        //------

        UI.showPreview[index] = true;
    }

    if(n == 1){
        UI.preview1DSlider.toggle();
    }

    printTerrain();
}

window.updatePreviewsSize = function(){
    for(let i = 0; i < 3; i++){
        
        if(UI.showPreview[i]){
            //Changing scene size for preview 3D (outer div and inner canvas)
            if(i == 2){
                UI.previews["3D"].children().css({width: UI.previewsSize.width + "px", height: UI.previewsSize.height + "px"});
            }
            
            UI.previews[(i + 1) + "D"].css({width: UI.previewsSize.width + "px", height: UI.previewsSize.height + "px"});

        }
    }
}

//------Listeners------

//---Zooming---
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
            UI.previewsSize.width += 50; //px
            UI.previewsSize.height += 50; //px
        }
        else{
            UI.previewsSize.width -= 50; //px
            UI.previewsSize.height -= 50; //px
        }

        updatePreviewsSize();
    }
}

document.onwheel = function(event){previewZoom(event);}
//---

//---Hiding menus when user clicked outside of them---
$(document).click(function(event){
    const target = $(event.target);

    window.target = target;

    if(!((target.hasClass("menu")) || (target.hasClass("menu_item")))){
        UI.hideAllMenus();
    }
});
//------

function initialize(){
    UI.fileMenu.hide();
    UI.saveMenu.hide();
    UI.loadMenu.hide();

    if(localStorage.getItem("layersData") != null){
        window.loadFromBrowser();

        if(TERRAINMAP.layers.length > 0){
            window.changeLayer($(".layer_selector").first());
        }

    }
    else{
        UI.settingsPanel.hide();
    }

    window.printTerrain();

    //---Setting UI---
    UI.octaveSlider.attr("max", Math.floor(Math.log2(TERRAINMAP.width)) + 1);

    UI.previewsSize.width = TERRAINMAP.width;
    UI.previewsSize.height = TERRAINMAP.height;

    UI.preview1DSlider.attr("max", TERRAINMAP.height - 1);
    UI.preview1DSlider.hide();

    UI.previews["2D"].width(TERRAINMAP.width + "px");
    //------

    //---Centering div with JQuery so I can omit using transform - which would make draggable behave strangely---
    UI.previewsHolder.css({
        "top": (($(window).height() - UI.previewsHolder.outerHeight()) / 2 + $(window).scrollTop() + "px"),
        "left": (($(window).width() - UI.previewsHolder.outerWidth()) / 2 + $(window).scrollLeft() + "px")
    });
    //------
    
    UI.previewsHolder.draggable();
}

initialize();