class Map{
    constructor(){
        this.width = 512;
        this.height = 512;

        this.seed = Math.floor(Math.random() * 9000 + 1) + 1000;
        this.dimension = 2;
        this.octavesAmount = 6;
        this.scaleDivider = 2;
        this.heightFactor = 672;
        this.heightOffset = -90;

        //For storing generated noise
        this.valueMatrixRaw = [];

        //Interpolated version of raw matrix
        this.valueMatrix = [];

        this.generateNoise();
    }

    //Generate pseudo random values between 0 and 1
    generateNoise(){
        Math.seedrandom(this.seed);

        this.valueMatrixRaw = [];
        this.valueMatrix = [];

        switch(this.dimension){
            case 1:
                for(let y = 0; y < this.width; y++){
                    this.valueMatrixRaw.push(Math.random());
                }

                break;
            
            case 2:
                for(let y = 0; y < this.height; y++){
                    var row = [];
        
                    for(let x = 0; x < this.width; x++){
                        row.push(Math.random());
                    }
        
                    this.valueMatrixRaw.push(row);
                    this.valueMatrix.push([...row]);
                }

                break;
        }
    }
    //

    //Interpolate or something values in valueMatrix
    smooth(){
        switch(this.dimension){

            case 1:
                for(let i = 0; i < this.width; i++){
                    var terrainValue = 0;
                    var scale = 1;
                    var scaleAcc = scale;

                    for(let j = 0; j < this.octavesAmount; j++){
                        var pitch = Math.floor(this.width / (Math.pow(2, j)));

                        //Extreme points of the octave segment in which "i" lays
                        var sample1 = Math.floor(i / pitch) * pitch;
                        var sample2 = (sample1 + pitch) % this.width;
                        //

                        var blend = (i - sample1) / pitch;
                        var interpolatedValue = (1 - blend) * this.valueMatrixRaw[sample1] + blend * this.valueMatrixRaw[sample2];
                        terrainValue += interpolatedValue * scale;

                        scale /= this.scaleDivider;
                        scaleAcc += scale;
                    }

                    this.valueMatrix[i] = terrainValue / scaleAcc;
                }

                break;

            case 2:
                for(let y = 0; y < this.height; y++){
                    for(let x = 0; x < this.width; x++){
                        var terrainValue = 0;
                        var scale = 1;
                        var scaleAcc = scale;

                        for(let j = 0; j < this.octavesAmount; j++){
                            var pitchX = Math.floor(this.width / (Math.pow(2, j)));
                            var pitchY = Math.floor(this.height / (Math.pow(2, j)));
    
                            //Extreme points of the octave segment in which "i" lays
                            var sample1X = Math.floor(x / pitchX) * pitchX;
                            var sample2X = (sample1X + pitchX) % this.width;
    
                            var sample1Y = Math.floor(y / pitchY) * pitchY;
                            var sample2Y = (sample1Y + pitchY) % this.height;

                            //
    
                            var blendX = (x - sample1X) / pitchX;
                            var blendY = (y - sample1Y) / pitchY;
    
                            var interpolatedValueX = (1 - blendX) * this.valueMatrixRaw[sample1Y][sample1X] + blendX * this.valueMatrixRaw[sample1Y][sample2X];
                            var interpolatedValueY = (1 - blendX) * this.valueMatrixRaw[sample2Y][sample1X] + blendX * this.valueMatrixRaw[sample2Y][sample2X];
                        
                            terrainValue += (blendY * (interpolatedValueY - interpolatedValueX) + interpolatedValueX) * scale;

                            scaleAcc += scale;
                            scale /= this.scaleDivider;

                            //
                        }

                        this.valueMatrix[y][x] = terrainValue / scaleAcc;
                    }
                }
        }
    }
    //
    
    //Print data from valueMatrix to given canvas
    printTerrain(canvas){
        var ctx = canvas.getContext("2d");
        var canvasData = ctx.createImageData(this.width, this.height);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        canvas.width = this.width;
        canvas.height = this.height;

        switch(this.dimension){
            case 1:
                for(let x = 0; x < this.valueMatrix.length; x++){
                    var value = Math.round(this.valueMatrix[x] * this.heightFactor + this.heightOffset);
        
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
                    var pixelColor = shader.color(this.valueMatrix[yIndex][xIndex] * this.heightFactor + this.heightOffset);

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
}