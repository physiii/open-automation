import * as actions from './actions';
import Api from '../../../api.js';

const listenForDeviceChanges = () => (dispatch) => {
		Api.on('devices', (data) => dispatch(actions.fetchDevicesSuccess(data.devices)));
	},
	fetchDevices = () => (dispatch) => {
		dispatch(actions.fetchDevices());

		Api.getDevices().then((data) => {
			dispatch(actions.fetchDevicesSuccess(data.devices));
		}).catch((error) => {
			dispatch(actions.fetchDevicesError(error));
		});
	},
	setDeviceSettings = (deviceId, settings, originalSettings) => (dispatch) => {
		dispatch(actions.setSettings(deviceId, settings));

		Api.setDeviceSettings(deviceId, settings).catch((error) => {
			dispatch(actions.setSettingsError(deviceId, originalSettings, error));
		});
	},
	deleteDevice = (device) => (dispatch) => {
		dispatch(actions.deleteDevice(device.id));

		Api.deleteDevice(device.id).catch((error) => {
			dispatch(actions.deleteDeviceError(device, error));
		});
	};

export {
	listenForDeviceChanges,
	fetchDevices,
	setDeviceSettings,
	deleteDevice
};
