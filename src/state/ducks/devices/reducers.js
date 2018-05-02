import Immutable from 'immutable';
import Device from './models/device.js';
import * as types from './types';

const reducer = (state = null, action) => {
	let deviceIndex;

	switch (action.type) {
		case types.LOAD_DEVICES:
			return Immutable.List(action.payload.devices.map((device) => Device(device)));
		case types.LOAD_CAMERA_RECORDINGS:
			deviceIndex = state.findIndex((device) => device.id === action.payload.cameraId);

			return state.setIn([
				deviceIndex,
				'recordings'
			], Immutable.List(action.payload.recordings));
		default:
			return state;
	}
};

export default reducer;
