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
	setDeviceRoom = (deviceId, roomId, originalRoomId) => (dispatch) => {
		dispatch(actions.setDeviceRoom(deviceId, roomId));

		Api.setDeviceRoom(deviceId, roomId).catch((error) => {
			dispatch(actions.setDeviceRoomError(deviceId, originalRoomId, error));
		});
	},
	deleteDevice = (deviceId) => (dispatch) => {
		dispatch(actions.deleteDevice(deviceId));

		Api.deleteDevice(deviceId).catch((error) => {
			dispatch(actions.deleteDeviceError(deviceId, error));
		});
	};

export {
	listenForDeviceChanges,
	fetchDevices,
	setDeviceSettings,
	setDeviceRoom,
	deleteDevice
};
