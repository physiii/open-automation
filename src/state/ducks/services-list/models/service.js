import ServiceRecord from './service-record.js';
import Gateway from './gateway.js';
import Camera from './camera.js';

const Service = ServiceRecord({}), // Generic service
	// Service factory
	createService = (service) => {
		switch (service.type) {
			case 'camera':
				return new Camera(service);
			case 'network-camera':
				return new Camera(service);
			case 'gateway':
				return new Gateway(service);
			default:
				return new Service(service);
		}
	};

export default createService;
