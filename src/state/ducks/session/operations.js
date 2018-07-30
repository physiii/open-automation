import * as actions from './actions';
import * as devices from '../devices-list';
import Api from '../../../api.js';

const initialize = () => (dispatch) => {
		const isLoggedIn = Boolean(localStorage.getItem('is_logged_in'));

		dispatch(actions.initialize(isLoggedIn));

		if (isLoggedIn) {
			// Try to refresh the access token to make sure it's still valid.
			Api.getAccessToken().then((user) => {
				// User's access token is valid. Connect to API.
				Api.connect().then(() => {
					dispatch(loginSuccess(user));
				});
			}).catch(() => {
				// User's access token is invalid. User is not logged in.
				dispatch(logout());
			});
		}

		// When an API authentication error happens, log out.
		Api.on('authentication', (data) => {
			if (data.error) {
				dispatch(logout());
			}
		});
	},
	login = (username, password) => (dispatch) => {
		dispatch(actions.login());

		Api.login(username, password).then((user) => {
			dispatch(loginSuccess(user));
		}).catch((error) => {
			dispatch(actions.loginError(error));
		});
	},
	loginSuccess = (user) => (dispatch) => {
		localStorage.setItem('is_logged_in', true);

		dispatch(actions.loginSuccess(user));
		dispatch(devices.operations.fetchDevices());
	},
	logout = () => (dispatch) => {
		dispatch(actions.logout());

		localStorage.removeItem('is_logged_in');

		Api.logout().then(() => {
			dispatch(actions.logoutSuccess());
		}).catch((error) => {
			dispatch(actions.logoutError(error));
		});
	},
	register = (username, password) => (dispatch) => {
		dispatch(actions.register());

		Api.createAccount({username, password}).then(() => {
			dispatch(login(username, password));
		}).catch((error) => {
			dispatch(actions.registerError(error));
		});
	};

export {
	initialize,
	login,
	logout,
	register
};
