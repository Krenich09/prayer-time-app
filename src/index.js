const { app, BrowserWindow, Tray, Menu, nativeImage} = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = async () => {
  // Create the browser window.
  let appIcon = nativeImage.createFromPath('assets/icon.png')
  const mainWindow = new BrowserWindow({
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
  // System Tray Stuff:
  let tray = null;
  const trayIcon = nativeImage.createFromPath('assets/tray_icon.ico')
  tray = new Tray(trayIcon)
  const image = nativeImage.createFromPath('assets/icon.png');
  var now = new Date();
  let string = now.toDateString();
  var isAppQuitting = false;

  let fajr = '';
  let dhuhr = '';
  let asr = '';
  let maghrib = '';
  let isha = '';

  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const link = `http://api.aladhan.com/v1/timingsByCity?city=${data.city}&country=${data.country_name}&method=4&adjustment=1`
    const response2 = await fetch(link);
    const data2 = await response2.json();
    fajr = data2.data.timings.Fajr;
    dhuhr = data2.data.timings.Dhuhr;
    asr = data2.data.timings.Asr;
    maghrib = data2.data.timings.Maghrib;
    isha = data2.data.timings.Isha;
  } catch (error) {
    console.error('Error fetching data:', error);
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Today's Prayer Times`,
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
  tray.setToolTip('Prayer App')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  });



  mainWindow.on('close', (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
  
});
