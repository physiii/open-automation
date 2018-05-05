import * as actions from './actions';
import Api from '../../../api.js';

const fetchDevices = () => (dispatch) => {
		dispatch(actions.fetchDevices());

		Api.getDevices().then((devices) => {
			dispatch(actions.fetchDevicesSuccess(mockDevices(devices)));
		}).catch((error) => {
			dispatch(actions.fetchDevicesError(error));
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
		dispatch(actions.fetchCameraRecordings(camera.id));

		Api.getRecordings(camera.token, camera.camera_number).then((recordings) => {
			dispatch(actions.fetchCameraRecordingsSuccess(camera.id, recordings));
		}).catch((error) => {
			dispatch(actions.fetchCameraRecordingsError(camera.id, error));
		});
	},
	playCameraRecording = (camera, file) => () => {
		Api.stream('play_file', camera.token, camera.camera_number, file);
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
	playCameraRecording,
	startCameraStream,
	stopCameraStream
};
