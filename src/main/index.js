import { app, BrowserWindow, ipcMain, dialog } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webSecurity: false,
    useContentSize: false,
    frame: false,
    backgroundColor: '#001529',
    show: false
  })

  mainWindow.loadURL(winURL)

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('handle-process', (ev, val) => {
  mainWindow.setProgressBar(val < 1 ? val : -1)
  ev.returnValue = 'ok'
})

ipcMain.on('app-ctrl', (ev, val) => {
  switch (val) {
    case 0:
      mainWindow.close();
      break;
    case 1:
      mainWindow.minimize();
      break;
    case 2:
      mainWindow.maximize();
      break;
    case 3:
      mainWindow.restore();
      break;
    default:
      break;
  }
})

ipcMain.on('app-ismax', ev => {
  let isMax = mainWindow.isMaximized();
  ev.returnValue = isMax;
})

ipcMain.on('app-showMessageBox', (ev, option) => {
  dialog.showMessageBox(mainWindow, option);
  ev.returnValue = true;
})
