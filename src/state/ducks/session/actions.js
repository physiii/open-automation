import * as types from './types';

export const login = () => ({
	type: types.LOGIN
});

export const loginSuccess = (username, token) => ({
	type: types.LOGIN_SUCCESS,
	payload: {username, token}
});

export const loginError = (error) => ({
	type: types.LOGIN_ERROR,
	payload: error,
	error: true
});

export const logout = () => ({
	type: types.LOGOUT
});
