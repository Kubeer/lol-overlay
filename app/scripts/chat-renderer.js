const electron = require('electron');
const {ipcRenderer} = electron;

ipcRenderer.on('init', (e, friend) => {
    document.getElementById('title').innerHTML = friend.name
})