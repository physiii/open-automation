import * as actions from './actions';
import Api from '../../../api.js';

const listenForDeviceChanges = () => (dispatch) => {
		Api.on('devices', (data) => {
			dispatch(actions.fetchDevicesSuccess(data.devices));
		});
	},
	fetchDevices = () => (dispatch) => {
		dispatch(actions.fetchDevices());

		Api.getDevices().then((data) => {
			dispatch(actions.fetchDevicesSuccess(data.devices));
		}).catch((error) => {
			dispatch(actions.fetchDevicesError(error));
		});
	};

export {
	listenForDeviceChanges,
	fetchDevices
};
