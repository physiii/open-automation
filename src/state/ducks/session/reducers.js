import * as types from './types';

const reducer = (state = false, action) => {
	switch (action.type) {
		case types.LOGIN:
			return {
				...state,
				isFetching: true
			};
		case types.LOGIN_SUCCESS:
			return {
				...state,
				username: action.payload.username,
				token: action.payload.token,
				isFetching: false
			};
		case types.LOGOUT:
			return {
				...state,
				username: '',
				token: ''
			};
		default:
			return state;
	}
}

export default reducer;
