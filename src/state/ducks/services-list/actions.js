import * as types from './types';

export const fetchDevices = () => ({
	type: types.FETCH_DEVICES
});

export const fetchDevicesSuccess = (devices) => ({
	type: types.FETCH_DEVICES_SUCCESS,
	payload: {devices}
});

export const fetchDevicesError = (error) => ({
	type: types.FETCH_DEVICES_ERROR,
	payload: {error},
	error: true
});

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
