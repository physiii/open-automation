import DeviceRecord from './device-record.js';
import Gateway from './gateway.js';
import Camera from './camera.js';

const Device = (device) => {
	const GenericDevice = DeviceRecord();

	switch (device.type) {
		case 'camera':
			return new Camera(device);
		case 'gateway':
			return new Gateway(device);
		default:
			return new GenericDevice(device);
	}
};

export default Device;
