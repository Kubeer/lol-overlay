'use strict';

const electron = require('electron');
const url = require('url');
const path = require('path');
const LCUConnector = require('lcu-connector');
const fetch = require('node-fetch');
const Base64 = require('js-base64').Base64;

const connector = new LCUConnector();

const {app, BrowserWindow, globalShortcut} = electron;
const LCU = {
	url: '',
	auth: ''
}

let mainWindow;
let friendsWindow;
var friends = {};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.on('ready', function(){
	mainWindow = new BrowserWindow({
		transparent: true,
		frame: false,
		skipTaskbar: true,
		resizable: false
	});
	mainWindow.setAlwaysOnTop(true, 'screen-saver', 1)
	mainWindow.setVisibleOnAllWorkspaces(true);

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../html/main.html'),
		protocol: 'file:',
		slashes: true
	}));
	mainWindow.maximize()
	mainWindow.setFullScreen(true)

	//Friends window init
	friendsWindow = new BrowserWindow({
		width: 330,
		height: 700,
		frame: false,
		parent: mainWindow
	});
	friendsWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../html/friends.html'),
		protocol: 'file:',
		slashes: true
	}));

	globalShortcut.register('Shift+Tab', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
			friendsWindow.hide()
		} else {
			mainWindow.show()
			friendsWindow.show()
		}
	})
})

connector.on('connect', (data) => {
    LCU.url = data.protocol+'://'+data.address+':'+data.port
    LCU.auth = Base64.encode(data.username+':'+data.password)

	fetch(LCU.url+'/lol-chat/v1/friends', {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Authorization': 'Basic '+LCU.auth
		}
	}).then(res => res.json())
	.then(function(response) {
		var ids = '%5B'
		for (var friend in response) {
			friends[response[friend].id] = response[friend]
			ids += response[friend].id + '%2C'
		}
		ids = ids.substring(0, ids.length - 3) + '%5D'
		fetch(LCU.url+'/lol-summoner/v2/summoner-icons?ids='+ids, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Authorization': 'Basic '+LCU.auth
			}
		}).then(res => res.json())
		.then(function(iconResponse) {
			friendsWindow.webContents.send('onData')
			for (var icon in iconResponse) {
				friends[iconResponse[icon].summonerId.toString()].icon = iconResponse[icon].profileIconId
				friendsWindow.webContents.send('addFriend', friends[iconResponse[icon].summonerId.toString()])
			}
		})
		.catch(error => console.error('Error:', error));
	})
	.catch(error => console.error('Error:', error));
});

connector.start();