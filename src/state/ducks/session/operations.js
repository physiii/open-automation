import * as actions from './actions';
import axios from 'axios';
import Cookies from 'js-cookie';
import Api from '../../../api.js';
import * as devices from '../devices-list';

const initialize = (username = Cookies.get('user'), token = Cookies.get('token')) => (dispatch) => {
		if (!token) {
			return;
		}

		Api.setApiToken(token);
		Api.linkUser(username).then(() => {
			dispatch(actions.loginSuccess(username, token));
			dispatch(devices.operations.fetchDevices());
		});
	},
	login = (username, password) => (dispatch) => {
		// Dispatch login action (see initialize call below for the action that actually saves user to store)
		dispatch(actions.login());

		// Post credentials to login endpoint on server.
		axios.post('/api/login', {username, password}).then((response) => {
			const {token} = response.data;

			dispatch(initialize(username, token));

			Cookies.set('user', username);
			Cookies.set('token', token);
		}).catch((error) => {
			const unauthorizedErrorCode = 401;
			let errorMessage;

			if (error.response) {
				if (error.response.status === unauthorizedErrorCode) {
					errorMessage = 'Username or password not correct';
				} else {
					errorMessage = 'An error occurred when logging in';
				}
			} else if (error.request) {
				errorMessage = 'No response received when logging in';
			} else {
				errorMessage = 'An error occurred when logging in';
			}

			dispatch(actions.loginError({error: new Error(errorMessage)}));
			throw error;
		});
	},
	logout = () => (dispatch) => {
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
