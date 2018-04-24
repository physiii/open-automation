import JSMpeg from './jsmpeg/jsmpeg.min.js';

const originalOnOpen = JSMpeg.Source.WebSocket.prototype.onOpen;

class WSSource extends JSMpeg.Source.WebSocket {
	constructor (url, options) {
		super(url, options);
		this.token = options.token;
		this.camera = options.camera;
		this.onOpen = this.onOpen.bind(this);
	}
	onOpen () {
		originalOnOpen.call(this);
		this.socket.send(JSON.stringify({
			token: this.token,
			camera: this.camera
		}));
	}
}

JSMpeg.Source.WebSocket = WSSource;

export default JSMpeg;
