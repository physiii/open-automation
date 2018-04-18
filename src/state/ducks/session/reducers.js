import * as types from './types';

const initialState = {
		isFetching: false,
		error: false
	},
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.LOGIN:
				return {
					...state,
					isFetching: true,
					error: false
				};
			case types.LOGIN_SUCCESS:
				return {
					...state,
					username: action.payload.username,
					token: action.payload.token,
					isFetching: false,
					error: false
				};
			case types.LOGIN_ERROR:
				return {
					...state,
					isFetching: false,
					error: action.payload.message
				};
			case types.LOGOUT:
				return initialState;
			default:
				return state;
		}
	};

export default reducer;
