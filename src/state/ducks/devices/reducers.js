import * as types from './types';

const reducer = (state = null, action) => {
	switch (action.type) {
		case types.LOAD_DEVICES:
			return action.payload.devices;
		default:
			return state;
	}
};

export default reducer;
