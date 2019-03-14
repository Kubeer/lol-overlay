'use strict';

const electron = require('electron');
const url = require('url');
const path = require('path');
const LCUConnector = require('lcu-connector');
const fetch = require('node-fetch');
const Base64 = require('js-base64').Base64;
const {RiotWSProtocol} = require('./RiotWS');

const {app, BrowserWindow, globalShortcut, ipcMain} = electron;
const LCU = {
	url: '',
	wsURL: '',
	auth: ''
}

let mainWindow;
let friendsWindow;
let connector;
let riotWS;
let friends = {};
let chats = {};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

app.on('ready', function(){
	//Main window init
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
		minWidth: 330,
		height: 700,
		frame: false,
		parent: mainWindow
	});
	friendsWindow.loadURL(url.format({
		pathname: path.join(__dirname, '../html/friends.html'),
		protocol: 'file:',
		slashes: true
	}));

	friendsWindow.webContents.on('did-finish-load', onFriendsLoad);

	//Global shortcuts
	globalShortcut.register('Shift+Tab', () => {
		if (mainWindow.isVisible()) {
			mainWindow.hide()
			friendsWindow.hide()
			for (var chat in chats) {
				chats[chat].hide()
			}
		} else {
			mainWindow.show()
			friendsWindow.show()
			for (var chat in chats) {
				chats[chat].show()
			}
		}
	})

	globalShortcut.register('CmdOrCtrl+Q', () => {
		app.quit()
	})
})

function friendUpdate(data) {
	console.log(data)
}

//Getting friends data
function onFriendsLoad() {
	connector = new LCUConnector();
	connector.on('connect', (data) => {
		LCU.url = data.protocol+'://'+data.address+':'+data.port
		LCU.wsURL = 'wss://'+data.username+':'+data.password+'@'+data.address+':'+data.port
		LCU.auth = Base64.encode(data.username+':'+data.password)
		console.log('Connected. URL: '+LCU.url+' Auth Key: '+LCU.auth)

		riotWS = new RiotWSProtocol(LCU.wsURL)
		riotWS.on('open', () => {
			console.log('Connected to Riot WS.')
			riotWS.subscribe('OnJsonApiEvent_lol-chat_v1_friends', friendUpdate);
		})

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
				//friendsWindow.webContents.send('onData')
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
}

//Opening chat window
ipcMain.on('openChat', (e, friend) => {
	console.log(friend)
	chats[friend.id] = new BrowserWindow({
		width: 500,
		height: 300,
		frame: false,
		parent: mainWindow
	})
	chats[friend.id].loadURL(url.format({
		pathname: path.join(__dirname, '../html/chat.html'),
		protocol: 'file:',
		slashes: true
	}));
	chats[friend.id].webContents.on('did-finish-load', () => {
		chats[friend.id].webContents.send('init', friend)
	})
})