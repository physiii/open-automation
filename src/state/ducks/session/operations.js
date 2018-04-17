import * as actions from './actions';
import axios from 'axios';
import Cookies from 'js-cookie';
import Api from '../../../api.js';

const initialize = (username, token) => (dispatch) => {
	if (!username) {
		username = Cookies.get('user');
	}
	if (!token) {
		token = Cookies.get('token');
	}

	if (token) {
		Api.setApiToken(token);
		Api.linkUser(username, token);
		Api.getDevices(token).then((devices) => {
			console.log('got devices', devices)
			dispatch(actions.loginSuccess(username, token));
		});
	}
};

const login = (username, password) => (dispatch) => {
	// Dispatch login action (see loginSuccess call below for the action that actually saves user to store)
	dispatch(actions.login());

	// Post credentials to login endpoint on server.
	axios.post('/api/login', {username, password}).then((response) => {
		const {username, token} = response.data;

		dispatch(initialize(username, token));

		Cookies.set('user', username);
		Cookies.set('token', token);
	}).catch((error) => {
		let errorMessage;

		if (error.response) {
			if (error.response.status === 401) {
				errorMessage = 'Username or password not correct';
			} else {
				errorMessage = 'An error occurred';
			}
		} else if (error.request) {
			errorMessage = 'No response received';
		} else {
			errorMessage = 'Error';
		}

		dispatch(actions.loginError(new Error(errorMessage)));
		throw error;
	});
};

const logout = () => (dispatch) => {
	Api.setApiToken(null);

	dispatch(actions.logout());

	Cookies.remove('user');
	Cookies.remove('token');
};

export {
	initialize,
	login,
	logout
};
