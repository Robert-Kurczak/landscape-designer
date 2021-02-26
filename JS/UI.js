const octaveSlider = document.querySelector("#octave_slider");
const scaleSlider = document.querySelector("#scale_slider");
const seedInput = document.querySelector("#seed_input");
const dimensionInput = document.querySelector("#dimension_input");
const heightFactorSlider = document.querySelector("#height_factor_slider");
const heightOffsetSlider = document.querySelector("#height_offset_slider");

updateSlider("octave", ["max"]);
updateUIValues();

//Might change work of those function to be based on eval()
//Damn thats, ugly. Definitly to rework
//Updates given property/properties of given slider
function updateSlider(slider, properties){
    switch(slider){
        case "octave":
            for(property of properties){
                switch(property){
                    case "max":
                        octaveSlider.setAttribute("max", Math.floor(Math.log2(mainWindow.width)) + 1);

                        break;
                }
            }

            break;
    }

    //eval(slider + "Slider." + property + " = " calculatedValue);
}
//

//updateSlider() is too cursed so it's easier to write new function
function updateUIValues(){
    octaveSlider.setAttribute("value", mainLayer.octavesAmount);
    scaleSlider.setAttribute("value", mainLayer.scaleDivider);
    seedInput.setAttribute("value", mainLayer.seed);
    dimensionInput.setAttribute("value", mainLayer.dimension);
    heightFactorSlider.setAttribute("value", mainLayer.heightFactor);
    heightOffsetSlider.setAttribute("value", mainLayer.heightOffset);
}

function updateTerrain(layer, property, value, generateNoise = false){
    eval(layer + "." + property + " = " + value);
    // switch(property){
    //     case "octavesAmount":
    //         layer.octavesAmount = value;

    //         break;

    //     case "scaleDivider":
    //         layer.scaleDivider = value;

    //         break;

    //     case "seed":
    //         layer.scaleDivider = value;

    //     case "heightFactor":
    //         layer.heightFactor = value;

    //         break;

    //     case "heightOffset":
    //         layer.heightOffset = value;

    //         break;
    // }

    if(generateNoise){
        eval(layer + ".generateNoise()");
    }

    eval(layer + ".smooth()");
    
    //GL with adding many layer support with that kind of rendering...
    //Probably gonna make 2 new arrays and store all layer noises (raw and smoothed) there.
    //Then in printTerrain Im gonna create ultimate array which would be sum of smoothed arrays of all layers.
    eval(layer + ".printTerrain(mainWindow)");
}