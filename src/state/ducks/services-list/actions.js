import * as types from './types';

export const cameraFetchRecordings = (cameraId) => ({
	type: types.FETCH_CAMERA_RECORDINGS,
	payload: {cameraId}
});

export const cameraFetchRecordingsSuccess = (cameraId, recordings) => ({
	type: types.FETCH_CAMERA_RECORDINGS_SUCCESS,
	payload: {cameraId, recordings}
});

export const cameraFetchRecordingsError = (cameraId, error) => ({
	type: types.FETCH_CAMERA_RECORDINGS_ERROR,
	payload: {cameraId, error},
	error: true
});

export const cameraStreamLive = (cameraId, streamToken) => ({
	type: types.STREAM_CAMERA_LIVE,
	payload: {cameraId, streamToken}
});

export const cameraStreamRecording = (cameraId, recordingId, streamToken) => ({
	type: types.STREAM_CAMERA_RECORDING,
	payload: {cameraId, recordingId, streamToken}
});
