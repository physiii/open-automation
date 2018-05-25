import * as actions from './actions';
import Api from '../../../api.js';

const startCameraStream = (cameraServiceId) => () => {
		Api.streamCameraLive(cameraServiceId);
	},
	stopCameraStream = (cameraServiceId) => () => {
		Api.stopCameraLiveStream(cameraServiceId);
	},
	fetchCameraRecordings = (cameraServiceId) => (dispatch) => {
		dispatch(actions.fetchCameraRecordings(cameraServiceId));

		Api.getRecordings(cameraServiceId).then((data) => {
			dispatch(actions.fetchCameraRecordingsSuccess(cameraServiceId, data.recordings));
		}).catch((error) => {
			dispatch(actions.fetchCameraRecordingsError(cameraServiceId, error));
		});
	},
	startCameraRecordingStream = (recording) => () => {
		Api.streamCameraRecording(recording.camera_id, recording.id);
	},
	stopCameraRecordingStream = (recording) => () => {
		Api.stopCameraRecordingStream(recording.camera_id, recording.id);
	};

export {
	startCameraStream,
	stopCameraStream,
	fetchCameraRecordings,
	startCameraRecordingStream,
	stopCameraRecordingStream
};
