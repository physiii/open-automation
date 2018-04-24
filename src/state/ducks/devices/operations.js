import * as actions from './actions';
import Api from '../../../api.js';

const fetchDevices = () => (dispatch) => {
		Api.getDevices().then((devices) => {
			dispatch(actions.loadDevices(mockDevices(devices)));
		});
	},
	mockDevices = (devices) => {
		devices.push({
			id: 'asdf1234',
			type: 'thermostat',
			token: 'asdf12344321fdsa',
			temp: 74,
			target_temp: 70,
			mode: 0,
			fan: false
		});

		return devices;
	},
	startCameraStream = (camera) => () => {
		Api.stream('start_webcam', camera.token, camera.camera_number);
	},
	stopCameraStream = (camera) => () => {
		Api.stream('stop', camera.token, camera.camera_number);
	};

export {
	fetchDevices,
	startCameraStream,
	stopCameraStream
};
