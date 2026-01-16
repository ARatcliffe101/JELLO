const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  saveCSV: (content) => ipcRenderer.invoke('save-csv', content),
  loadCSV: () => ipcRenderer.invoke('load-csv'),
  createFolder: (name) => ipcRenderer.invoke('create-folder', name),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  getPaths: () => ipcRenderer.invoke('get-paths'),
  openFolder: (type) => ipcRenderer.invoke('open-folder', type),
  changeDataLocation: () => ipcRenderer.invoke('change-data-location'),
  pickCsvFile: () => ipcRenderer.invoke('pick-csv-file')
});
