const electron = require('electron');
const {ipcRenderer} = electron;

const ul = document.getElementById('friends')

ipcRenderer.on('addFriend', function(e, friend){
    var li = document.createElement('li');
    var icon = friend.icon == 37 ? 0 : friend.icon;
    var friendTemplate = `
    <img src="http://raw.communitydragon.org/latest/game/assets/ux/summonericons/profileicon${icon}.png" class="summoner-icon" />
    <div class="user-data">
        <span class="username">${friend.name}</span>
        <span class="state">${friend.availability}</span>
    </div>`
    li.innerHTML = friendTemplate
    li.addEventListener('click', function() {
        openChat(friend)
    })
    ul.appendChild(li)
})

function openChat(friend) {
    ipcRenderer.send('openChat', friend)
}

ipcRenderer.on('onData', function(e) {
    document.getElementById('status').innerHTML = ''
})