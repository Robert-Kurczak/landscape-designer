export class UI{
    static layerCounter = 1;

    //Input
    static octaveSlider = document.querySelector("#octave_slider");
    static scaleSlider = document.querySelector("#scale_slider");
    static seedInput = document.querySelector("#seed_input");
    static heightFactorSlider = document.querySelector("#height_factor_slider");
    static heightOffsetSlider = document.querySelector("#height_offset_slider");

    static layerPanel = document.querySelector("#layer_panel tbody");
    
    static updateUIValues(layer){
        UI.octaveSlider.setAttribute("value", layer.octavesAmount);
        UI.scaleSlider.setAttribute("value", layer.scaleDivider);
        UI.seedInput.setAttribute("value", layer.seed);
        UI.heightFactorSlider.setAttribute("value", layer.heightFactor);
        UI.heightOffsetSlider.setAttribute("value", layer.heightOffset);
    }

    static addLayerNode(){
        var layerHTML = "<td><span class='layer_marker'></span></td><td class='layer_name'><p>Layer" + UI.layerCounter + "</p></td><td>X</td>";
        
        var layerNode = document.createElement("tr");
        layerNode.innerHTML = layerHTML;

        UI.layerPanel.insertBefore(layerNode, UI.layerPanel.childNodes[UI.layerCounter + 1]);

        UI.layerCounter++;
    }
}