import * as types from './types';

export const doServiceAction = (serviceId, serviceAction) => ({
	type: types.DO_SERVICE_ACTION,
	payload: {serviceId, serviceAction}
});

export const doServiceActionError = (serviceId, originalValue, error) => ({
	type: types.DO_SERVICE_ACTION_ERROR,
	payload: {serviceId, originalValue, error}
});

export const doDeviceAction = (deviceId, deviceAction) => ({
	type: types.DO_SERVICE_ACTION,
	payload: {deviceId, deviceAction}
});

export const doDeviceActionError = (deviceId, originalValue, error) => ({
	type: types.DO_SERVICE_ACTION_ERROR,
	payload: {deviceId, originalValue, error}
});

export const setSettings = (serviceId, settings) => ({
	type: types.SET_SETTINGS,
	payload: {serviceId, settings}
});

export const setSettingsError = (serviceId, originalSettings, error) => ({
	type: types.SET_SETTINGS_ERROR,
	payload: {serviceId, originalSettings, error},
	error: true
});

export const fetchServiceLog = (serviceId) => ({
	type: types.FETCH_SERVICE_LOG,
	payload: {serviceId}
});

export const fetchServiceLogSuccess = (serviceId, log) => ({
	type: types.FETCH_SERVICE_LOG_SUCCESS,
	payload: {serviceId, log}
});

export const fetchServiceLogError = (serviceId, error) => ({
	type: types.FETCH_SERVICE_LOG_ERROR,
	payload: {serviceId, error},
	error: true
});

export const fetchDeviceLog = (serviceId) => ({
	type: types.FETCH_SERVICE_LOG,
	payload: {serviceId}
});

export const fetchDeviceLogSuccess = (deviceId, log) => ({
	type: types.FETCH_SERVICE_LOG_SUCCESS,
	payload: {deviceId, log}
});

export const fetchDeviceLogError = (deviceId, error) => ({
	type: types.FETCH_SERVICE_LOG_ERROR,
	payload: {deviceId, error},
	error: true
});

export const cameraFetchRecordings = (cameraId) => ({
	type: types.FETCH_CAMERA_RECORDINGS,
	payload: {cameraId}
});

export const cameraFetchRecordingsSuccess = (cameraId, recordings, dateIndex, dates) => ({
	type: types.FETCH_CAMERA_RECORDINGS_SUCCESS,
	payload: {cameraId, recordings, dateIndex, dates}
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

export const audioStreamLive = (audioId, streamToken) => ({
	type: types.STREAM_AUDIO_LIVE,
	payload: {audioId, streamToken}
});

export const cameraStreamAudioRecording = (cameraId, recordingId, streamToken) => ({
	type: types.STREAM_CAMERA_AUDIO_RECORDING,
	payload: {cameraId, recordingId, streamToken}
});

export const cameraStreamRecording = (cameraId, recordingId, streamToken) => ({
	type: types.STREAM_CAMERA_RECORDING,
	payload: {cameraId, recordingId, streamToken}
});
