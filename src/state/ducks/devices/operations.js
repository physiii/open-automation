import * as actions from './actions';
import Api from '../../../api.js';

const fetchDevices = () => (dispatch) => {
		Api.getDevices().then((devices) => {
			dispatch(actions.loadDevices(devices));
		});
	},
	startCameraStream = (camera) => () => {
		Api.stream('start_webcam', camera.token, camera.camera_number);
	},
	stopCameraStream = (camera) => () => {
		Api.stream('stop_webcam', camera.token, camera.camera_number);
	};

export {
	fetchDevices,
	startCameraStream,
	stopCameraStream
};
