import * as types from './types';

const initialState = {
		user: null,
		loading: false,
		error: false
	},
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.LOGIN:
				return {
					...state,
					loading: true,
					error: false
				};
			case types.LOGIN_SUCCESS:
				return {
					...state,
					user: {
						username: action.payload.username,
						token: action.payload.token
					},
					loading: false,
					error: false
				};
			case types.LOGIN_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			case types.LOGOUT:
				return initialState;
			default:
				return state;
		}
	};

export default reducer;
