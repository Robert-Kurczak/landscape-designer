class shader{
    //For now max height is hardcoded to be 255
    //It can be changed to use dynamic value based on user input
    //but it will make same results as increasing heightOffset
    static mainGradient = [
        [47, 77, 84],
        [60, 139, 156],
        [71, 188, 213],
        [170, 209, 135],
        [250, 225, 72],
        [221, 222, 70],
        [192, 219, 68],
        [169, 217, 67],
        [150, 197, 50],
        [131, 176, 33],
        [112, 156, 16],
        [97, 140, 3],
        [100, 136, 19],
        [103, 133, 36],
        [106, 129, 52],
        [109, 126, 68],
        [112, 122, 85],
        [115, 119, 101],
        [117, 116, 114],
        [180, 179, 178],
        [242, 242, 242]
    ];
    
    //Returns array of 3 color components [red, green, blue]
    static color(value){
        if(value < 0){
            value = 0;
        }
        else if(value > 255){
            value = 255;
        }

        return this.mainGradient[Math.floor((this.mainGradient.length - 1) * (value / 255))];
    }
}