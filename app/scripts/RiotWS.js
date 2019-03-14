const WebSocket = require('ws');

//Message types for Riot WS Protocol
const MESSAGE_TYPES = {
    WELCOME: 0,
    PREFIX: 1,
    CALL: 2,
    CALLRESULT: 3,
    CALLERROR: 4,
    SUBSCRIBE: 5,
    UNSUBSCRIBE: 6,
    PUBLISH: 7,
    EVENT: 8
};

//Riot WS Protocol class init
class RiotWSProtocol extends WebSocket {
    constructor(url) {
        super(url, 'wamp');
    }

    close() {
        super.close();
    }

    terminate() {
        super.terminate();
    }

    subscribe(event, callback) {
        super.addListener(event, callback);
        this.send(MESSAGE_TYPES.SUBSCRIBE, event)
    }

    unsubscribe(event, callback) {
        super.removeListener(event, callback);
        this.send(MESSAGE_TYPES.UNSUBSCRIBE, event);
    }

    send(type, mess) {
        super.send(JSON.stringify([type, mess]));
    }
}

module.exports = {
    RiotWSProtocol: RiotWSProtocol
};