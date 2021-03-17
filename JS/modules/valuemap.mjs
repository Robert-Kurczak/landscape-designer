import {mapLayer} from "./layers.mjs";
import {shader} from "./shader.mjs";

export class Map{
    constructor(){
        this.width = 512;
        this.height = 512;

        this.layers = [new mapLayer];

        //For storing resultant data of all layers
        //This variable is updated with mergeLayers method
        this.mergedMatrix = [];
    }

    //Fills valueMatrixRaw and valueMatrix with pseudo random values between 0 and 1
    generateNoise(nLayer){
        var layer = this.layers[nLayer];

        var pseudoRandom = new Math.seedrandom(layer.seed);

        //Clearing previous data
        layer.valueMatrixRaw = [];
        layer.valueMatrix = [];

        for(let y = 0; y < this.height; y++){
            var row = [];

            for(let x = 0; x < this.width; x++){
                row.push(pseudoRandom());
            }

            //After generating noise valueMatrix is a copy of valueMatrixRaw
            //so both arrays are filled with pseudo random values betwen 0 and 1
            layer.valueMatrixRaw.push(row);
            layer.valueMatrix.push([...row]);
        }
    }
    //

    //Smoothing values in valueMatrixRaw and storing it in valueMatrix
    smooth(nLayer){
        var layer = this.layers[nLayer];

        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                var terrainValue = 0;
                var scale = 1;
                var scaleAcc = scale;

                for(let j = 0; j < layer.octavesAmount; j++){
                    var pitchX = Math.floor(this.width / (1 << j));
                    var pitchY = Math.floor(this.height / (1 << j));

                    //Extreme points of the octave segment in which "i" lays
                    var sample1X = Math.floor(x / pitchX) * pitchX;
                    var sample2X = (sample1X + pitchX) % this.width;

                    var sample1Y = Math.floor(y / pitchY) * pitchY;
                    var sample2Y = (sample1Y + pitchY) % this.height;
                    //

                    var blendX = (x - sample1X) / pitchX;
                    var blendY = (y - sample1Y) / pitchY;

                    var interpolatedValueX = (1 - blendX) * layer.valueMatrixRaw[sample1Y][sample1X] + blendX * layer.valueMatrixRaw[sample1Y][sample2X];
                    var interpolatedValueY = (1 - blendX) * layer.valueMatrixRaw[sample2Y][sample1X] + blendX * layer.valueMatrixRaw[sample2Y][sample2X];
                
                    terrainValue += (blendY * (interpolatedValueY - interpolatedValueX) + interpolatedValueX) * scale;

                    scaleAcc += scale;
                    scale /= layer.scaleDivider;
                }

                //Dividing by scaleAcc to keeps values in range (0, 1)
                layer.valueMatrix[y][x] = terrainValue / scaleAcc;
            }
        }
    }
    //

    //Generate valueMatrixRaw and valueMatrix, based on layer settings
    //Used for loading data from localStorage
    fillMatrixes(){
        for(let nLayer in this.layers){
            this.generateNoise(nLayer);
            this.smooth(nLayer);
        }
    }

    //Merging all layers into 1, for printing.
    //Should be called before printTerrain() to update mergedMatrix
    mergeLayers(){
        //Copy of main layer
        this.mergedMatrix = [];

        for(let y = 0; y < this.height; y++){
            var row = [];

            for(let x = 0; x < this.width; x++){
                row.push(0);
            }

            this.mergedMatrix.push(row);
        }

        for(var layer of this.layers){
            for(let y = 0; y < this.height; y++){
                for(let x = 0; x < this.width; x++){
                    this.mergedMatrix[y][x] += layer.valueMatrix[y][x] * layer.heightFactor + layer.heightOffset;
                }
            }
        }
    }
    
    //Print data from mergedMatrix to given canvas.
    printTerrain(canvas, dimension = 2, yProfile = 0){
        var ctx = canvas.getContext("2d");
        var canvasData = ctx.createImageData(this.width, this.height);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = this.width;
        canvas.height = this.height;

        switch(dimension){
            //To rework
            //Axis should be somewhere in the middle
            //Add support for negative values
            case 1:
                for(let x = 0; x < this.width; x++){
                    var value = Math.round(this.mergedMatrix[yProfile][x]);
        
                    for(let y = this.height - 1 - value; y < this.height; y++){
                        var pixelIndex = (y * this.width + x) * 4;
        
                        canvasData.data[pixelIndex + 0] = 0;    // Red value
                        canvasData.data[pixelIndex + 1] = 255;  // Green value
                        canvasData.data[pixelIndex + 2] = 0;    // Blue value
                        canvasData.data[pixelIndex + 3] = 255;  // Alpha value
                    }
                }

                break;

            case 2:
                var yIndex = 0;
                var xIndex = 0;
                for(let i = 0; i < canvasData.data.length; i += 4){
                    var pixelColor = shader.color(this.mergedMatrix[yIndex][xIndex]);

                    canvasData.data[i + 0] = pixelColor[0];     // Red value
                    canvasData.data[i + 1] = pixelColor[1];     // Green value
                    canvasData.data[i + 2] = pixelColor[2];     // Blue value
                    canvasData.data[i + 3] = 255;               // Alpha value

                    xIndex++;

                    if(xIndex == this.width){
                        xIndex = 0;
                        yIndex++;
                    }
                }

                break;
        }

        ctx.putImageData(canvasData, 0, 0);
    }
    //
    
    //Updating layer based on user settings,
    //if canvas is given, printing updated terrain
    updateLayer(nLayer, property, value, canvas = null){
        var layer = this.layers[nLayer];

        switch(property){
            case "seed":
                layer.seed = value;
                break;

            case "octavesAmount":
                layer.octavesAmount = value;
                break;

            case "scaleDivider":
                layer.scaleDivider = value;
                break;

            case "heightFactor":
                layer.heightFactor = value;
                break;
            
            case "heightOffset":
                layer.heightOffset = value;
                break;
        }

        if(canvas){
            this.smooth(nLayer);
            this.mergeLayers();
            this.printTerrain(canvas);
        }
    }
}