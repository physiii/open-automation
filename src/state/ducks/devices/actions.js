import * as types from './types';

export const loadDevices = (devices) => ({
	type: types.LOAD_DEVICES,
	payload: {devices}
});

export const loadCameraRecordings = (cameraId, recordings) => ({
	type: types.LOAD_CAMERA_RECORDINGS,
	payload: {cameraId, recordings}
});
