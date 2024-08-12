const Service = require('./service.js');

class BillAcceptorService extends Service {
	subscribeToDevice () {
		Service.prototype.subscribeToDevice.apply(this, arguments);

		this.deviceOn('accepted', ({denomination}) => this._emit('accepted', {denomination}));
	}
}

BillAcceptorService.type = 'bill-acceptor';
BillAcceptorService.friendly_type = 'Bill Acceptor';
BillAcceptorService.indefinite_article = 'A';

module.exports = BillAcceptorService;
