//Only for storing data
export class mapLayer{
    constructor(){
        this.seed = "0000";
        this.octavesAmount = 1;
        this.scaleDivider = 1;
        this.heightFactor = 1;
        this.heightOffset = 0;

        //Stores raw, not interpolated data
        this.valueMatrixRaw = [];
        //Stores interpolated data from valueMatrixRaw
        this.valueMatrix = [];
    }
}