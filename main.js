const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

function buildAppMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{
      label: 'JELLO',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        ...(isMac ? [] : [{ role: 'quit' }])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [{ role: 'pasteAndMatchStyle' }, { role: 'delete' }, { role: 'selectAll' }] : [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }])
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [])
      ]
    }
    // Intentionally no "Help" menu
  ];
  return Menu.buildFromTemplate(template);
}


let mainWindow;
let currentDataPath;

const appPath = app.isPackaged ? path.dirname(app.getPath('exe')) : __dirname;
const defaultDataPath = path.join(appPath, 'jello_data');
const configFile = path.join(appPath, 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(configFile)) {
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      currentDataPath = config.dataPath || defaultDataPath;
    } else {
      currentDataPath = defaultDataPath;
    }
  } catch (error) {
    console.error('Error loading config:', error);
    currentDataPath = defaultDataPath;
  }

  const projectsPath = path.join(currentDataPath, 'projects');
  if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath, { recursive: true });
  }

  console.log('App folder:', appPath);
  console.log('Data folder:', currentDataPath);
}

function saveConfig() {
  try {
    fs.writeFileSync(configFile, JSON.stringify({ dataPath: currentDataPath }, null, 2));
  } catch (error) {
    console.error('Error saving config:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'JELLO',
    icon: path.join(__dirname, 'jello-logo.png')
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(buildAppMenu());
  loadConfig();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-paths', async () => {
  return {
    appPath,
    dataPath: currentDataPath,
    projectsPath: path.join(currentDataPath, 'projects'),
    csvFile: path.join(currentDataPath, 'jello_data.csv')
  };
});

ipcMain.handle('change-data-location', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'JELLO',
      defaultPath: currentDataPath
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const newPath = result.filePaths[0];

      const moveData = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Move Data', 'Start Fresh', 'Cancel'],
        defaultId: 0,
        title: 'JELLO',
        message: 'Would you like to move your existing data to the new location?',
        detail: `Current: ${currentDataPath}\nNew: ${newPath}`
      });

      if (moveData.response === 2) {
        return { success: false, cancelled: true };
      }

      if (moveData.response === 0) {
        const oldProjectsPath = path.join(currentDataPath, 'projects');
        const oldCsvPath = path.join(currentDataPath, 'jello_data.csv');
        const newProjectsPath = path.join(newPath, 'projects');
        const newCsvPath = path.join(newPath, 'jello_data.csv');

        if (fs.existsSync(oldProjectsPath)) {
          fs.cpSync(oldProjectsPath, newProjectsPath, { recursive: true });
        }

        if (fs.existsSync(oldCsvPath)) {
          fs.copyFileSync(oldCsvPath, newCsvPath);
        }
      }

      currentDataPath = newPath;
      saveConfig();

      const projectsPath = path.join(currentDataPath, 'projects');
      if (!fs.existsSync(projectsPath)) {
        fs.mkdirSync(projectsPath, { recursive: true });
      }

      return { success: true, newPath: currentDataPath };
    }

    return { success: false, cancelled: true };
  } catch (error) {
    console.error('Error changing location:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-csv', async (event, csvContent) => {
  try {
    const csvFile = path.join(currentDataPath, 'jello_data.csv');
    fs.writeFileSync(csvFile, csvContent, 'utf8');
    console.log('CSV saved to:', csvFile);
    return { success: true, path: csvFile };
  } catch (error) {
    console.error('Error saving CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-csv', async () => {
  try {
    const csvFile = path.join(currentDataPath, 'jello_data.csv');
    if (fs.existsSync(csvFile)) {
      const content = fs.readFileSync(csvFile, 'utf8');
      console.log('CSV loaded from:', csvFile);
      return { success: true, content };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Error loading CSV:', error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle('pick-csv-file', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'JELLO',
      properties: ['openFile'],
      filters: [{ name: 'CSV', extensions: ['csv'] }, { name: 'All Files', extensions: ['*'] }]
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, error: 'No CSV selected' };
    }

    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content, path: filePath };
  } catch (error) {
    console.error('Error picking CSV:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-folder', async (event, folderName) => {
  try {
    const safeName = folderName.replace(/[\\/:*?"<>|]/g, '_');
    const projectsPath = path.join(currentDataPath, 'projects');
    const folderPath = path.join(projectsPath, safeName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log('Folder created:', folderPath);
    }
    return { success: true, path: folderPath };
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-file', async (event, { folderName, fileName, dataBase64 }) => {
  try {
    const safeFolderName = folderName.replace(/[\\/:*?"<>|]/g, '_');
    const projectsPath = path.join(currentDataPath, 'projects');
    const folderPath = path.join(projectsPath, safeFolderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    const buffer = Buffer.from(dataBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    console.log('File saved:', filePath);

    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-folder', async (event, folderType) => {
  try {
    const { shell } = require('electron');
    let folderPath;

    if (folderType === 'data') {
      folderPath = currentDataPath;
    } else if (folderType === 'projects') {
      folderPath = path.join(currentDataPath, 'projects');
    } else if (folderType === 'app') {
      folderPath = appPath;
    }

    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
