import * as types from './types';

export const fetchCameraRecordings = (cameraId) => ({
	type: types.FETCH_CAMERA_RECORDINGS,
	payload: {cameraId}
});

export const fetchCameraRecordingsSuccess = (cameraId, recordings) => ({
	type: types.FETCH_CAMERA_RECORDINGS_SUCCESS,
	payload: {cameraId, recordings}
});

export const fetchCameraRecordingsError = (cameraId, error) => ({
	type: types.FETCH_CAMERA_RECORDINGS_ERROR,
	payload: {cameraId, error},
	error: true
});

export const streamCameraLive = (cameraId, streamToken) => ({
	type: types.STREAM_CAMERA_LIVE,
	payload: {cameraId, streamToken}
});

export const streamCameraRecording = (recordingId, streamToken) => ({
	type: types.STREAM_CAMERA_RECORDING,
	payload: {recordingId, streamToken}
});
