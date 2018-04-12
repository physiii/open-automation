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
		dispatch(actions.loginSuccess(username, token));
	}
};

const login = (username, password) => (dispatch) => {
	// Dispatch basic login action (see loginSuccess call below for the action that actually saves user to store)
	dispatch(actions.login());

	// Post credentials to login endpoint on server.
	axios.post('/login', {username, password}).then((response) => {
		let username = response.data.username,
			token = response.data.token;

		Api.linkUser(username, token);
		dispatch(actions.loginSuccess(username, token));

		Cookies.set('user', username);
		Cookies.set('token', token);
	}).catch((error) => {
		if (error.response && error.response.status === 401) {
			console.log('Username or password not correct', error);
		} else if (error.request) {
			console.log('No response received', error.request);
		} else {
			console.log('Error', error.message);
		}
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
