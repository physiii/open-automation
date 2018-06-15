import * as actions from './actions';
import * as devices from '../devices-list';
import Api from '../../../api.js';
import axios from 'axios';
import Cookies from 'js-cookie';

const GENERIC_LOGIN_ERROR = 'An error occurred while logging in',
	initialize = (username = Cookies.get('user')) => (dispatch) => {
		// User is not logged in.
		if (!username) {
			dispatch(actions.initialize());

			return;
		}

		// User is logged in.
		dispatch(loginSuccess(username));
	},
	login = (username, password) => (dispatch) => {
		// Dispatch login action (see loginSuccess call below for the action that actually saves user to store)
		dispatch(actions.login());

		// Post credentials to login endpoint on server.
		axios.post('/api/login', {username, password}).then(() => {
			dispatch(loginSuccess(username));
		}).catch((error) => {
			const unauthorizedErrorCode = 401;
			let errorMessage = GENERIC_LOGIN_ERROR;

			if (error.response && error.response.status === unauthorizedErrorCode) {
				errorMessage = 'Username or password was incorrect';
			}

			dispatch(actions.loginError(new Error(errorMessage)));
			throw error;
		});
	},
	loginSuccess = (username) => (dispatch) => {
		const xsrfToken = Cookies.get('xsrf_token');

		Cookies.set('user', username);

		Api.initialize(xsrfToken).then(() => {
			dispatch(actions.loginSuccess(username, xsrfToken));
			dispatch(devices.operations.fetchDevices());
		}).catch(() => {
			Cookies.remove('user');

			dispatch(actions.loginError(new Error(GENERIC_LOGIN_ERROR)));
		});
	},
	logout = () => (dispatch) => {
		dispatch(actions.logout());

		Cookies.remove('user');
	},
	register = (username, password) => (dispatch) => {
		dispatch(actions.register());

		axios.post('/api/register', {username, password}).then((response) => {
			dispatch(loginSuccess(username));
		}).catch((error) => {
			const usernameConflictErrorCode = 409;
			let errorMessage = 'An error occurred when registering';

			if (error.response && error.response.status === usernameConflictErrorCode) {
				errorMessage = 'An account already exists with that username';
			}

			dispatch(actions.registerError(new Error(errorMessage)));
			throw error;
		});
	};

export {
	initialize,
	login,
	logout,
	register
};
