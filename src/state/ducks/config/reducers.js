import * as types from './types';

const initialState = null,
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.INITIALIZE:
				return {
					...action.payload.config,
					stream_port: action.payload.config.stream_port || window.location.port
				};
			default:
				return state;
		}
	};

export default reducer;
