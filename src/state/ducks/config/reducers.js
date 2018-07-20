import * as types from './types';

const initialState = null,
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.INITIALIZE:
				return action.payload.config;
			default:
				return state;
		}
	};

export default reducer;
