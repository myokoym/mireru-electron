"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
const electron_1 = require("electron");
const electronHandler = {
    ipcRenderer: {
        sendMessage(channel, ...args) {
            electron_1.ipcRenderer.send(channel, ...args);
        },
        on(channel, func) {
            const subscription = (_event, ...args) => func(...args);
            electron_1.ipcRenderer.on(channel, subscription);
            return () => {
                electron_1.ipcRenderer.removeListener(channel, subscription);
            };
        },
        once(channel, func) {
            electron_1.ipcRenderer.once(channel, (_event, ...args) => func(...args));
        },
    },
};
// API for image explorer
const electronAPI = {
    getDirectoryContents: (dirPath) => electron_1.ipcRenderer.invoke('get-directory-contents', dirPath),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    getHomeDirectory: () => electron_1.ipcRenderer.invoke('get-home-directory'),
    getParentDirectory: (currentPath) => electron_1.ipcRenderer.invoke('get-parent-directory', currentPath),
};
electron_1.contextBridge.exposeInMainWorld('electron', electronHandler);
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
//# sourceMappingURL=preload.js.map