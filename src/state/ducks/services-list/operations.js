import * as actions from './actions';
import Api from '../../../api.js';

const startCameraStream = (cameraServiceId) => (dispatch) => {
		Api.streamCameraLive(cameraServiceId).then((data) => {
			dispatch(actions.streamCameraLive(cameraServiceId, data.stream_token));
		});
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
	startCameraRecordingStream = (recording) => (dispatch) => {
		Api.streamCameraRecording(recording.camera_id, recording.id).then((data) => {
			dispatch(actions.streamCameraRecording(recording.camera_id, recording.id, data.stream_token));
		});
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
