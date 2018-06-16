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
					user: {username: action.payload.user.username},
					loading: false,
					error: false
				};
			case types.LOGOUT:
				return {
					...state,
					loading: true,
					error: false
				};
			case types.LOGOUT_SUCCESS:
				return {
					...initialState,
					loading: false
				};
			case types.REGISTER:
				return {
					...state,
					loading: true,
					error: false
				};
			case types.LOGIN_ERROR:
			case types.LOGOUT_ERROR:
			case types.REGISTER_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			case '@@router/LOCATION_CHANGE':
				return {
					...state,
					error: false
				};
			default:
				return state;
		}
	};

export default reducer;
