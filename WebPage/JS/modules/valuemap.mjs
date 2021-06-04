export class Map{
    constructor(width, height, shader){
        this.width = width;
        this.height = height;
        this.shader = shader;

        this.layers = [];

        //For storing resultant data of all layers
        //This variable is updated with mergeLayers method
        this.mergedMatrix = [];

        this.maxValue;
        this.minValue;
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

    //Merging all layers into 1, for printing.
    //Should be called before printTerrain() to update mergedMatrix
    mergeLayers(){
        this.mergedMatrix = [];

        //Filling matrix with zeros
        for(let y = 0; y < this.height; y++){
            var row = [];

            for(let x = 0; x < this.width; x++){
                row.push(0);
            }

            this.mergedMatrix.push(row);
        }
        //

        for(var layer of this.layers){
            for(let y = 0; y < this.height; y++){
                for(let x = 0; x < this.width; x++){
                    this.mergedMatrix[y][x] += layer.valueMatrix[y][x] * layer.heightFactor + layer.heightOffset;
                }
            }
        }
    }
    
    //Updating layer based on user settings,
    //if canvas is given, printing updated terrain
    updateLayer(nLayer, property, value){
        var layer = this.layers[nLayer];

        switch(property){
            case "seed":
                layer.seed = value;
                this.generateNoise(nLayer);
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

        this.smooth(nLayer);
            // this.mergeLayers();
            // this.printTerrain(canvas);
    }
}