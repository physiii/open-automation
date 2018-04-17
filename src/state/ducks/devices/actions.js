import * as types from './types';

export const loadDevices = (devices) => ({
	type: types.LOAD_DEVICES,
	payload: {devices}
});
