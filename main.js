const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

app.on('ready',function(){
    
    //Create New Window
    mainWindow = new BrowserWindow({
        //StackOverflow (for nodeIntegration)
        webPreferences: {
            nodeIntegration: true
        }
    });

    //Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Quit App when Closed (For closing all windows under main window)
    mainWindow.on('closed',function(){
        app.quit();
    });

    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle create add Window
function createAddWindow(){
    addWindow = new BrowserWindow({
        width:300,
        height:200,
        title:'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });

    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    //Garbage Collection handle
    addWindow.on('close',function(){
        addWindow = null;
    })

}

//Catch item:add
ipcMain.on('item:add', function(e, item){
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});


//Create Menu Template
const mainMenuTemplate=[
    {
        label:'File',
        submenu:[
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Exit',
                accelerator: 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If mac, add empty object to menu for space
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//Add dev tools if not in prod
if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}