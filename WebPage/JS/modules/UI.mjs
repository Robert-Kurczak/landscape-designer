export class UI{
    //------Previews------
    static previewsHolder = $("#previews");

    //---jQuery nodes of preview canvases---
    static previews = {"1D": $("#preview_1D"), "2D": $("#preview_2D"), "3D": $("#preview_3D")};
    static showPreview = [false, true, false];
    //------
    
    //---Default previews htmls---
    static previewsHTML = {
        "1D": "<canvas id=\"preview_1D\"></canvas>",
        "2D": "<canvas id=\"preview_2D\"></canvas>",
        "3D": "<div id=\"preview_3D\"></div>"
    };
    //------

    //Should be initialized
    static previewsSize = {width: 512, height: 512};

    static preview1DSlider = $("#preview_1D_slider");
    //------------

    //---Upper panel---
    static menuSlideTime = 150;

    static fileMenu = $("#file_menu");
    static saveMenu = $("#save_menu");
    static loadMenu = $("#load_menu");

    static saveStatus = $("#save_status");
    //------

    //------Settings------
    static settingsPanel = $("#settings");

    //---Settings inputs---
    static octavesSlider = $("#octave_slider");
    static scaleSlider = $("#scale_slider");
    static seedInput = $("#seed_input");
    static heightFactorSlider = $("#height_factor_slider");
    static heightOffsetSlider = $("#height_offset_slider");
    //------

    //---Settings displays---
    static octavesDisplay = $("#octaves_display");
    static scaleDisplay = $("#scale_display");
    static heightFactorDisplay = $("#height_factor_display");
    static heightOffsetDisplay = $("#height_offset_display");
    //------

    static layersPanel = $("#layers_panel");

    static activeColor = "rgb(20, 20, 20)";     //#141414
    static inactiveColor = "rgb(33, 33, 33)";   //#212121
    
    static updateUIValues(layer){
        UI.octavesSlider.val(layer.octavesAmount);
        UI.octavesDisplay.html(layer.octavesAmount);

        UI.scaleSlider.val(layer.scaleDivider);
        UI.scaleDisplay.html(layer.scaleDivider);

        UI.seedInput.val(layer.seed);

        UI.heightFactorSlider.val(layer.heightFactor);
        UI.heightFactorDisplay.html(layer.heightFactor);

        UI.heightOffsetSlider.val(layer.heightOffset);
        UI.heightOffsetDisplay.html(layer.heightOffset);
    }

    static layerCounter = 0;

    static addLayerNode(){
        var randomColor = "rgb("
            + (Math.floor(Math.random() * 255) + 1) +
            ", " + (Math.floor(Math.random() * 255) + 1) +
            ", " + (Math.floor(Math.random() * 255) + 1) + ")";

        var layerHTML = `
            <div class="layer_node">
                <div class="layer_selector" onclick="changeLayer(this)">
                    <span class="layer_marker" style="background-color: ` + randomColor + `;"></span><p class="layer_name">Layer ` + this.layerCounter + `</p>
                </div
                ><div class="remove_layer_button" onclick="deleteLayer(this.parentNode); checkChanges();">
                    <p>x</p>
                </div>
            </div>
        `;

        UI.layersPanel.children().last().before(layerHTML);

        UI.layerCounter++;
    }

    static removeLayerNode(node){
        node.remove();
    }

    static clearLayersNodes(){
        while(UI.layersPanel.children().length > 1){
            UI.layersPanel.children().first().remove();
        }
    }

    static toggleFileMenu(){
        UI.fileMenu.slideToggle(UI.menuSlideTime);

        if(UI.loadMenu.is(":visible")){
            UI.loadMenu.slideToggle(UI.menuSlideTime);
        }

        if(UI.saveMenu.is(":visible")){
            UI.saveMenu.slideToggle(UI.menuSlideTime);
        }
    }

    static toggleSaveMenu(){
        UI.saveMenu.slideToggle(UI.menuSlideTime);

        if(UI.loadMenu.is(":visible")){
            UI.loadMenu.hide();
        }
    }

    static toggleLoadMenu(){
        UI.loadMenu.slideToggle();

        if(UI.saveMenu.is(":visible")){
            UI.saveMenu.hide();
        }
    }

    static hideAllMenus(){
        if(UI.fileMenu.is(":visible")){
            UI.fileMenu.slideToggle(UI.menuSlideTime);
        }

        if(UI.saveMenu.is(":visible")){
            UI.saveMenu.slideToggle(UI.menuSlideTime);
        }

        if(UI.loadMenu.is(":visible")){
            UI.loadMenu.slideToggle(UI.menuSlideTime);
        }
    }
}