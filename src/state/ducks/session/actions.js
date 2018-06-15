import * as types from './types';

export const initialize = () => ({
	type: types.INITIALIZE
});

export const login = () => ({
	type: types.LOGIN
});

export const loginSuccess = (username, xsrfToken) => ({
	type: types.LOGIN_SUCCESS,
	payload: {username, xsrf_token: xsrfToken}
});

export const loginError = (error) => ({
	type: types.LOGIN_ERROR,
	payload: {error},
	error: true
});

export const logout = () => ({
	type: types.LOGOUT
});

export const register = () => ({
	type: types.REGISTER
});

export const registerError = (error) => ({
	type: types.REGISTER_ERROR,
	payload: {error},
	error: true
});
