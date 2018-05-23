const Service = require('./service.js'),
	CameraService = require('./camera-service.js'),
	GatewayCameraDriver = require('./drivers/camera-gateway.js');

class ServicesManager {
	constructor (services = [], device) {
		this.device = device;
		this.services = [];

		this.updateServices(services);
	}

	addService (data) {
		let service = this.getServiceById(data.id);

		if (service) {
			return service;
		}

		switch (data.type) {
			case 'camera':
				service = new CameraService(data, {class: GatewayCameraDriver, socket: this.device.socket});
				break;
			default:
				service = new Service(data);
				break;
		}

		service.device = this.device;
		this.services.push(service);

		return service;
	}

	updateServices (services) {
		services.forEach((service) => {
			this.addService(service, this.device);
		});
	}

	setSocket (socket) {
		this.services.forEach((service) => {
			service.setSocket(socket);
		});
	}

	getServiceById (serviceId) {
		return this.services.find((service) => service.id === serviceId);
	}

	getSerializedServices () {
		return this.services.map((service) => service.serialize());
	}

	getDbSerializedServices () {
		return this.services.map((service) => service.dbSerialize());
	}

	getClientSerializedServices () {
		return this.services.map((service) => service.clientSerialize());
	}
}

module.exports = ServicesManager;
