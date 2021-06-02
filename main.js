const {app, BrowserWindow} = require("electron");

function createWindow(){
    const mainWindow = new BrowserWindow({
      width: 1280,
      height: 720
    })
  
    mainWindow.setMenu(null);
    mainWindow.loadFile("WebPage/index.html");
}

app.whenReady().then(() =>{
    createWindow()
})

app.on("window-all-closed", function (){
    if(process.platform !== 'darwin') app.quit()
})