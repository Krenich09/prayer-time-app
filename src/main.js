const { app, BrowserWindow, ipcMain, Tray, Menu, Notification } = require('electron');
const path = require('node:path');
const nativeImage = require('electron').nativeImage;
const fs = require('fs');
var AutoLaunch = require('auto-launch');
const { start } = require('node:repl');
const { autoUpdater } = require("electron-updater")

const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

var appAutoLauncher = new AutoLaunch({
    name: "PrayerTimes",
    path: process.execPath,
    isHidden: true,
});
function sendStatusToWindow(text) {
    log.info(text);
    mainWindow.webContents.send('message', text);
}
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

function createHiddenWindow() {
    hiddenWindow = new BrowserWindow({
        width: 500,
        height: 600,
        show: false, // Hide the window initially
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,

        }
    });

    hiddenWindow.loadFile('./src/audio.html');
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
            devTools: false  ,
        },
    });

    mainWindow.setMenuBarVisibility(false);
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
        app.setAppUserModelId("com.kren1ch.prayertimes")
    } 
    setInterval(checkTime, 5000);  
    createWindow();
    createHiddenWindow();
});

app.on('ready', function()  {
    autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
let log_message = "Download speed: " + progressObj.bytesPerSecond;
log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
sendStatusToWindow('Update downloaded');
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

            
            playAdhan();

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


function playAdhan()
{
    
    let doAdhan = false;
    mainWindow.webContents.executeJavaScript('localStorage.getItem("adhan");', true).then(result => {
        if(result === 'false' || result === false)
        {
            doAdhan = false;
        }
        else if(result === 'true' || result === true)
        {
            doAdhan = true;
        }
    });
    
    setTimeout(() => {
        if(doAdhan == true)
        {
            hiddenWindow.webContents.send('playSound', getAssetPath('algerian_adhan.mp3'));
        }
    }, 1000);

}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


// IPC STUFF
ipcMain.on('nextPrayer', (event, time, name) => {
    nextTime = time;
    nextPrayerName = name;
});

ipcMain.on('startUpChanged', (event, startUp) => {
    startUp ? appAutoLauncher.enable() : appAutoLauncher.disable();
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
        let noti = new Notification({
            title: title,
            body: body,
            icon: getAssetPath('icon.png'),
        });
        noti.show();

        noti.on('click', (event, arg)=>{
            hiddenWindow.webContents.send('stopSound');
            console.log("clicked")
        });

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
        
        let image = nativeImage.createFromPath(getAssetPath('empty_icon.png'));
        let tray_icon = nativeImage.createFromPath(getAssetPath('tray.ico'));
        let new_tray = new Tray(tray_icon);
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
            {   
                label: 'Stop Adhan (if playing)',
                click: () => {
                    hiddenWindow.webContents.send('stopSound');
                }
            },
            {   label: 'Exit', type: 'normal', click: () => { 
                isAppQuitting = true;
                app.quit();
            }}
        ])
        
        new_tray.setContextMenu(contextMenu2)
        new_tray.setToolTip('PrayerTimes')
        new_tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
        });
        
        tray = new_tray;
    }
    setTimeout(createTray, 1000);
});


ipcMain.on('openDiscord', (event) => {
    require('electron').shell.openExternal('https://discord.gg/hNGv75WmYA');
});

ipcMain.on('openGithub', (event) => {
    require('electron').shell.openExternal('https://github.com/Krenich09');
});

ipcMain.handle('get-QoD', async (event) => {
    try
    {
        let filePath = getAssetPath('quotes.txt');
        const data = await fs.readFileSync(filePath, 'utf8');
        const lines = data.split('\n');
    
        let line = lines[Math.floor(Math.random() * lines.length)];
        return line
    }
    catch(err)
    {
        console.error(err);
        return "Error: Could not get QoD";
    }

});