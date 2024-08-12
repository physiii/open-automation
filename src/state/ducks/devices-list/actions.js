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

export const setSettings = (deviceId, settings) => ({
	type: types.SET_SETTINGS,
	payload: {deviceId, settings}
});

export const setSettingsError = (deviceId, originalSettings, error) => ({
	type: types.SET_SETTINGS_ERROR,
	payload: {deviceId, originalSettings, error},
	error: true
});

export const setDeviceRoom = (deviceId, roomId) => ({
	type: types.SET_DEVICE_ROOM,
	payload: {deviceId, roomId}
});

export const setDeviceRoomError = (deviceId, originalRoomId, error) => ({
	type: types.SET_DEVICE_ROOM_ERROR,
	payload: {deviceId, originalRoomId, error},
	error: true
});

export const deleteDevice = (deviceId) => ({
	type: types.DELETE_DEVICE,
	payload: {deviceId}
});

export const deleteDeviceError = (device, error) => ({
	type: types.DELETE_DEVICE_ERROR,
	payload: {device, error},
	error: true
});
