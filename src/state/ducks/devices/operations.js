import * as actions from './actions';
import Api from '../../../api.js';

const fetchDevices = () => (dispatch) => {
	Api.getDevices().then((devices) => {
		dispatch(actions.loadDevices(devices));
	});
};

export {
	fetchDevices
};
