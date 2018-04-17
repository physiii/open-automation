import * as actions from './actions';
import axios from 'axios';
import Cookies from 'js-cookie';
import Api from '../../../api.js';

const initialize = () => (dispatch) => {
	let username = Cookies.get('user');
	let token = Cookies.get('token');

	// User token cookie found?
	if (token) {
		Api.linkUser(username, token);
		Api.getDevices(token);
		dispatch(actions.loginSuccess(username, token));
	}
};

const login = (username, password) => (dispatch) => {
	// Dispatch login action (see loginSuccess call below for the action that actually saves user to store)
	dispatch(actions.login());

	// Post credentials to login endpoint on server.
	axios.post('/api/login', {username, password}).then((response) => {
		let username = response.data.username,
			token = response.data.token;

		Api.linkUser(username, token);
		dispatch(actions.loginSuccess(username, token));

		Cookies.set('user', username);
		Cookies.set('token', token);
	}).catch((error) => {
		let error_message;

		if (error.response) {
			if (error.response.status === 401) {
				error_message = 'Username or password not correct';
			} else {
				error_message = 'An error occurred';
			}
		} else if (error.request) {
			error_message = 'No response received';
		} else {
			error_message = 'Error';
		}

		dispatch(actions.loginError(new Error(error_message)));
		throw error;
	});
};

const logout = () => (dispatch) => {
	dispatch(actions.logout());

	Cookies.remove('user');
	Cookies.remove('token');
};

export {
	initialize,
	login,
	logout
};
