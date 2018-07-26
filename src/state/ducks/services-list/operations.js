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
	},
	setLock = (lockServiceId) => () => {
		Api.setLock(lockServiceId);
	},
	setUnlock = (lockServiceId) => () => {
		Api.setUnlock(lockServiceId);
	},
	setRelockDelay = (lockServiceId, relockDelay) => () => {
		Api.setRelockDelay(lockServiceId, relockDelay);
	};

export {
	startCameraStream,
	stopCameraStream,
	fetchCameraRecordings,
	startCameraRecordingStream,
	stopCameraRecordingStream,
	setLock,
	setUnlock,
	setRelockDelay
};
