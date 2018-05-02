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
	fetchCameraRecordings = (camera) => (dispatch) => {
		Api.getRecordings(camera.token, camera.camera_number).then((recordings) => {
			dispatch(actions.loadCameraRecordings(camera.id, recordings));
		});
	},
	startCameraStream = (camera) => () => {
		Api.stream('start_webcam', camera.token, camera.camera_number);
	},
	stopCameraStream = (camera) => () => {
		Api.stream('stop', camera.token, camera.camera_number);
	};

export {
	fetchDevices,
	fetchCameraRecordings,
	startCameraStream,
	stopCameraStream
};
