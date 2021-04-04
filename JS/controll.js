var shiftPressed = false;

window.onkeydown = function(event){
    if(event.key == "Shift"){
        shiftPressed = true;
    }
}

window.onkeyup = function(event){
    if(event.key == "Shift"){
        shiftPressed = false;
    }
}

function previewZoom(event){
    var canvasWidth = PREVIEW2D.style.width != "" ? parseInt(PREVIEW2D.style.width) : 60;

    if(shiftPressed){
        if(event.deltaY < 0){
            PREVIEW2D.style.width = canvasWidth + 2 + "%";
        }
        else{
            PREVIEW2D.style.width = canvasWidth - 2 + "%";
        }
    }
}

document.onwheel = function(event){previewZoom(event, PREVIEW2D);}