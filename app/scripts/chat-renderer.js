'use strict';
const electron = require('electron');
const {ipcRenderer} = electron;

var id;

ipcRenderer.on('init', (e, friend, messages) => {
    document.getElementById('title').innerHTML = friend.name
    id = friend.id;
    var ul = document.getElementById('messages-container');
    for (var message in messages) {
        var li = document.createElement('li');
        li.innerHTML = messages[message].body;
        li.classList.add('message');
        if (friend.id != messages[message].fromId) {
            li.classList.add('me');
        }
        ul.appendChild(li);
    }
    ul.scrollTop = ul.scrollHeight;
});

ipcRenderer.on('addMessage', (e, data) => {
    var li = document.createElement('li');
    var ul = document.getElementById('messages-container');
    li.innerHTML = data.body;
    li.classList.add('message');
    if (id != data.fromId) {
        li.classList.add('me');
    }
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
})

function sendMessage(e) {
    if (event.which == 13 || event.keyCode == 13) {
        var textInput = document.getElementById('message-in');
        ipcRenderer.send('sendMessage', id, textInput.value)
        return false;
    }
    return true;
}