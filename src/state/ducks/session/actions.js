import * as types from './types';

export const login = (username, token) => ({
	type: types.LOGIN
});

export const loginSuccess = (username, token) => ({
	type: types.LOGIN_SUCCESS,
	payload: {username, token}
});

export const logout = () => ({
	type: types.LOGOUT
});
