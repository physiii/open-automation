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
