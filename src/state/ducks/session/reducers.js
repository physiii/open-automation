import * as types from './types';

const initialState = {
		user: null,
		loading: true, // Loading by default so we don't try to render the app until we know whether user is logged in or not.
		error: false
	},
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.INITIALIZE:
				return {
					...state,
					loading: false
				};
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
						xsrf_token: action.payload.xsrf_token
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
			case types.REGISTER:
				return {
					...state,
					loading: true,
					error: false
				};
			case types.REGISTER_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			default:
				return state;
		}
	};

export default reducer;
