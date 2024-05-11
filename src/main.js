const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('node:path');
const nativeImage = require('electron').nativeImage;

var AutoLaunch = require('auto-launch');
var appAutoLauncher = new AutoLaunch({
    name: "PrayerApp Times",
    path: process.execPath,
    isHidden: true,
});

const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../assets');
const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
};

let tray = null;
let isAppQuitting = false;
let mainWindow = null;

// Ensure single instance of the app
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}


const createWindow = () => {
    mainWindow = new BrowserWindow({
        show: false,
        icon:  getAssetPath('icon.png'),
        width: 1200,
        height: 728,
        minWidth: 900,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('./src/index.html');
    isAppQuitting = false;
    mainWindow.on('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('close', (event) => {
        if (!isAppQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.webContents.executeJavaScript('localStorage.getItem("startUp1");', true).then(result => {
        if(result === null || result === undefined)
        {
            appAutoLauncher.enable();
            mainWindow.webContents.executeJavaScript('localStorage.setItem("startUp1", true);', true);
            console.log("startUp is null, so is enabled");
        }
    });
};

app.on('ready', () => {
    
    if (process.platform === 'win32') {      
        app.setAppUserModelId("com.kren1ch.app")
    }


    
    setInterval(checkTime, 5000);

    
    createWindow();
});

let nextTime = "";
let nextPrayerName = "";
let canDoNotification = true;
function checkTime()
{
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    let time = `${hours}:${minutes}`;
    if(nextTime === time)
    {
        if(canDoNotification)
        {
            if(nextPrayerName == "")
            {
                newNotification("Prayer Time", "It's time to pray!");
            }
            else
            {
                newNotification("Prayer Time", `It's time to pray ${nextPrayerName}!`);
            }
            console.log("Time to pray");
            canDoNotification = false;
        }
    }
    else
    {
        canDoNotification = true;
    }
}

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


// IPC STUFF
ipcMain.on('nextPrayer', (event, time, name) => {
    nextTime = time;
    nextPrayerName = name;
});

ipcMain.on('startUpChanged', (event, startUp) => {
    if (startUp) {
        appAutoLauncher.enable();
    } else {
        appAutoLauncher.disable();
    }    

    newNotification("StartUp Changed", `StartUp is now ${startUp}`);
});

function newNotification(title, body)
{
    let canShow = true;
    mainWindow.webContents.executeJavaScript('localStorage.getItem("notifications");', true).then(result => {
        if(result === 'false' || result === false)
        {
            canShow = false;
        }
        else if(result === 'true' || result === true)
        {
            canShow = true;
        }
    });
    
    setTimeout(show, 2000);
    function show()
    {
        if(canShow == false) return;
        new Notification({
            title: title,
            body: body,
            icon: getAssetPath('icon.png'),
        }).show()
        console.log("Notification sent");
    }        
}

ipcMain.on('locationChanged', (event) => {
    if(tray)
    {
      tray.destroy();
    }
  
    let fajr = "";
    let dhuhr = "";
    let asr = "";
    let maghrib = "";
    let isha = "";
    mainWindow.webContents.executeJavaScript('localStorage.getItem("fajr");', true).then(result => {
      fajr = result;
    });
    mainWindow.webContents.executeJavaScript('localStorage.getItem("dhuhr");', true).then(result => {
      dhuhr = `${result}`;
    });
    mainWindow.webContents.executeJavaScript('localStorage.getItem("asr");', true).then(result => {
      asr = `${result}`;
    });
    mainWindow.webContents.executeJavaScript('localStorage.getItem("maghrib");', true).then(result => {
      maghrib = `${result}`;
    });
    mainWindow.webContents.executeJavaScript('localStorage.getItem("isha");', true).then(result => {
      isha = `${result}`;
    });
      
    function createTray()
    {
      
        let image = nativeImage.createFromPath(getAssetPath('icon.ico'));
        
        let new_tray = new Tray(image);
        var now = new Date();
        let string = now.toDateString();
        let contextMenu2 = Menu.buildFromTemplate([
            {
                label: `Today's Prayer Times:`,
                icon: image.resize({ width: 32, height: 32 }),
                enabled: false,
                sublabel: `${string}`,
            },
            {   label: `Fajr: ${fajr}`, enabled: false},
            {   label: `Dhuhr: ${dhuhr}`, enabled: false},
            {   label: `Asr: ${asr}`, enabled: false},
            {   label: `Maghrib: ${maghrib}`, enabled: false},
            {   label: `Isha: ${isha}`, enabled: false},
            {   type: 'separator' },
            {
                label: 'Show',
                click: () => {
                    mainWindow.show();
                },
            },
            {   label: 'Exit', type: 'normal', click: () => { 
                isAppQuitting = true;
                app.quit();
            }}
        ])
        
        new_tray.setContextMenu(contextMenu2)
        new_tray.setToolTip('Prayer App Times')
        new_tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        });
        
        tray = new_tray;
    }
    setTimeout(createTray, 1000);
});