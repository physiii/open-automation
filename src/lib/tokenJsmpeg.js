import JSMpeg from './jsmpeg/jsmpeg.min.js';

const originalOnOpen = JSMpeg.Source.WebSocket.prototype.onOpen;

class WSSource extends JSMpeg.Source.WebSocket {
	constructor (url, options) {
		super(url, options);
		this.oa_stream_token = options.oa_stream_token;
		this.oa_stream_id = options.oa_stream_id;
		this.onOpen = this.onOpen.bind(this);
	}
	onOpen () {
		originalOnOpen.apply(this, arguments);
		this.socket.send(JSON.stringify({
			stream_token: this.oa_stream_token,
			stream_id: this.oa_stream_id
		}));
	}
}

JSMpeg.Source.WebSocket = WSSource;

export default JSMpeg;
