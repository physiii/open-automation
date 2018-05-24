import * as actions from './actions';
import Api from '../../../api.js';

const fetchCameraRecordings = (camera) => (dispatch) => {
		dispatch(actions.fetchCameraRecordings(camera.id));

		Api.getRecordings(camera.token, camera.camera_number).then((recordings) => {
			dispatch(actions.fetchCameraRecordingsSuccess(camera.id, recordings));
		}).catch((error) => {
			dispatch(actions.fetchCameraRecordingsError(camera.id, error));
		});
	},
	playCameraRecording = (camera, file) => () => {
		Api.stream('play_file', camera.id, file);
	},
	startCameraStream = (camera) => () => {
		Api.stream('start_webcam', camera.id);
	},
	stopCameraStream = (camera) => () => {
		Api.stream('stop', camera.id);
	};

export {
	fetchCameraRecordings,
	playCameraRecording,
	startCameraStream,
	stopCameraStream
};
