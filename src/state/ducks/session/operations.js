import * as actions from './actions';
import * as devices from '../devices-list';
import Api from '../../../api.js';

const initialize = () => (dispatch) => {
		Api.getAccessToken().then((user) => {
			// User is logged in. Connect to API.
			Api.connect().then(() => {
				dispatch(loginSuccess(user));
			});
		}).catch(() => {
			// User is not logged in.
			dispatch(actions.initialize());
		});

		// When an API authentication error happens, log out.
		Api.on('session', (data) => {
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
		dispatch(actions.loginSuccess(user));
		dispatch(devices.operations.fetchDevices());
	},
	logout = () => (dispatch) => {
		dispatch(actions.logout());

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
