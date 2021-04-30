export class UI{
    static previewsHolder = $("#previews");

    //jQuery nodes of preview canvases
    static previews = {"1D": $("#preview_1D"), "2D": $("#preview_2D"), "3D": $("#preview_3D")};
    static showPreview = [false, true, false];
    
    //HTML of previews nodes.
    //HTML code is being saved here when preview is being hidden
    //and read when preview is being shown.
    //This allow to save such data as canvas dimensions,
    static previewsHTMLdata = {
        "1D": "<canvas id=\"preview_1D\"></canvas>",
        "2D": "<canvas id=\"preview_2D\></canvas>",
        "3D": "<canvas id=\"preview_3D\"></canvas>"
    };

    static preview1DSlider = $("#preview_1D_slider");

    //Settings inputs
    static octaveSlider = $("#octave_slider");
    static scaleSlider = $("#scale_slider");
    static seedInput = $("#seed_input");
    static heightFactorSlider = $("#height_factor_slider");
    static heightOffsetSlider = $("#height_offset_slider");

    static saveStatus = $("#save_status");

    static layersPanel = $("#layers_panel");
    
    static updateUIValues(layer){
        UI.octaveSlider.val(layer.octavesAmount);
        UI.scaleSlider.val(layer.scaleDivider);
        UI.seedInput.val(layer.seed);
        UI.heightFactorSlider.val(layer.heightFactor);
        UI.heightOffsetSlider.val(layer.heightOffset);
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

        this.layersPanel.children().last().before(layerHTML);

        UI.layerCounter++;
    }

    static removeLayerNode(node){
        if(confirm("Do you want to remove this layer?")){
            node.remove();
        }
    }
}