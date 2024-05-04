const { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain} = require('electron');
const path = require('node:path');
const AutoLaunch = require('auto-launch');
let tray = null;
let isAppQuitting = false;
let mainWindow = null;
let test = 1;
// Initialize AutoLaunch instance
const appAutoLauncher = new AutoLaunch({
    name: 'prayerapp', // Replace with your actual app name
});
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}


const createWindow = async () => {
  // Create the browser window.
  let appIcon = nativeImage.createFromPath('assets/icon.png')
  mainWindow = new BrowserWindow({
    icon: appIcon,
    width: 1200,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  isAppQuitting = false;



  mainWindow.on('close', (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
});

ipcMain.on('startUpChanged', (event, startUp) => {
  if (startUp) {
      appAutoLauncher.enable();
  } else {
      appAutoLauncher.disable();
  }
});

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
    const trayIcon = nativeImage.createFromPath('assets/tray_icon.ico')
    let new_tray = new Tray(trayIcon);
    const image = nativeImage.createFromPath('assets/icon.png');
  
    var now = new Date();
    let string = now.toDateString();
    let contextMenu2 = Menu.buildFromTemplate([
      {
        label: `Today's Prayer Times V${test}`,
        icon: image.resize({ width: 32, height: 32 }),
        enabled: false,
        sublabel: `${string}`,
      },
      { label: `Fajr: ${fajr}`, enabled: false},
      { label: `Dhuhr: ${dhuhr}`, enabled: false},
      { label: `Asr: ${asr}`, enabled: false},
      { label: `Maghrib: ${maghrib}`, enabled: false},
      { label: `Isha: ${isha}`, enabled: false},
      { type: 'separator' },
      {
        label: 'Show',
        click: () => {
          mainWindow.show();
        },
      },
      { label: 'Exit', type: 'normal', click: () => 
      { 
        isAppQuitting = true;
        app.quit();
      }}
    ])
  
    new_tray.setContextMenu(contextMenu2)
    new_tray.setToolTip('Prayer App')
    new_tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    });
  
    tray = new_tray;
    test++;
  }

  setTimeout(createTray, 1000);
});

