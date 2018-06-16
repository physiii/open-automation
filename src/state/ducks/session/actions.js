import * as types from './types';

export const initialize = () => ({
	type: types.INITIALIZE
});

export const login = () => ({
	type: types.LOGIN
});

export const loginSuccess = (user) => ({
	type: types.LOGIN_SUCCESS,
	payload: {user}
});

export const loginError = (error) => ({
	type: types.LOGIN_ERROR,
	payload: {error},
	error: true
});

export const logout = () => ({
	type: types.LOGOUT
});

export const logoutSuccess = () => ({
	type: types.LOGOUT_SUCCESS
});

export const logoutError = (error) => ({
	type: types.LOGOUT_ERROR,
	payload: {error},
	error: true
});

export const register = () => ({
	type: types.REGISTER
});

export const registerError = (error) => ({
	type: types.REGISTER_ERROR,
	payload: {error},
	error: true
});
