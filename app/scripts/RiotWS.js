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
        this.on('message', this._onMessage.bind(this));
        this.session = null;
    }

    close() {
        super.close();
        this.session = null;
    }

    terminate() {
        super.terminate();
        this.session = null;
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

    _onMessage(message) {
        const [type, ...data] = JSON.parse(message);

        switch (type) {
            case MESSAGE_TYPES.WELCOME:
                this.session = data[0];
                break;
            case MESSAGE_TYPES.CALLRESULT:
                console.error('Unknown call. Received data: ', data);
                break;
            case MESSAGE_TYPES.TYPE_ID_CALLERROR:
                console.error('Unknown call error. Received data: ', data);
                break;
            case MESSAGE_TYPES.EVENT:
                const [topic, payload] = data;
                this.emit(topic, payload);
                break;
            default:
                console.error('Unknown error. Received data: ', data);
                break;
        }
    }
}

module.exports = {
    RiotWSProtocol: RiotWSProtocol
};