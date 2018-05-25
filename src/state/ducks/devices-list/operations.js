import * as actions from './actions';
import Api from '../../../api.js';

const fetchDevices = () => (dispatch) => {
	dispatch(actions.fetchDevices());

	Api.getDevices().then((data) => {
		dispatch(actions.fetchDevicesSuccess(data.devices));
	}).catch((error) => {
		dispatch(actions.fetchDevicesError(error));
	});
};

export {
	fetchDevices
};
