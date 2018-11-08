import * as actions from './actions';
import Api from '../../../api.js';

const setServiceSettings = (serviceId, settings, originalSettings) => (dispatch) => {
		dispatch(actions.setSettings(serviceId, settings));

		Api.setServiceSettings(serviceId, settings).catch((error) => {
			dispatch(actions.setSettingsError(serviceId, originalSettings, error));
		});
	},
	fetchServiceLog = (serviceId) => (dispatch) => {
		dispatch(actions.fetchServiceLog(serviceId));

		Api.getServiceLog(serviceId).then((data) => {
			dispatch(actions.fetchServiceLogSuccess(serviceId, data.log));
		}).catch((error) => {
			dispatch(actions.fetchServiceLogError(serviceId, error));
		});
	},
	cameraStartStream = (cameraServiceId) => (dispatch) => {
		Api.cameraStartLiveStream(cameraServiceId).then((data) => {
			dispatch(actions.cameraStreamLive(cameraServiceId, data.stream_token));
		});
	},
	cameraStopStream = (cameraServiceId) => () => {
		Api.cameraStopLiveStream(cameraServiceId);
	},
	cameraFetchRecordings = (cameraServiceId) => (dispatch) => {
		dispatch(actions.cameraFetchRecordings(cameraServiceId));

		Api.cameraGetRecordings(cameraServiceId).then((data) => {
			dispatch(actions.cameraFetchRecordingsSuccess(cameraServiceId, data.recordings));
		}).catch((error) => {
			dispatch(actions.cameraFetchRecordingsError(cameraServiceId, error));
		});
	},
	cameraStartRecordingStream = (recording) => (dispatch) => {
		Api.cameraStartRecordingStream(recording.camera_id, recording.id).then((data) => {
			dispatch(actions.cameraStreamRecording(recording.camera_id, recording.id, data.stream_token));
		});
	},
	cameraStopRecordingStream = (recording) => () => {
		Api.cameraStopRecordingStream(recording.camera_id, recording.id);
	},
	lockLock = (lockServiceId) => () => {
		Api.lockSetLocked(lockServiceId, true);
	},
	lockUnlock = (lockServiceId) => () => {
		Api.lockSetLocked(lockServiceId, false);
	},
	thermostatSetTemp = (thermostatServiceId, temp) => () => {
		Api.thermostatSetTemp(thermostatServiceId, temp);
	},
	thermostatSetMode = (thermostatServiceId, mode) => () => {
		Api.thermostatSetMode(thermostatServiceId, mode);
	},
	thermostatSetHold = (thermostatServiceId, mode) => () => {
		Api.thermostatSetHold(thermostatServiceId, mode);
	},
	thermostatFanOn = (thermostatServiceId) => () => {
		Api.thermostatSetFan(thermostatServiceId, 'on');
	},
	thermostatFanAuto = (thermostatServiceId) => () => {
		Api.thermostatSetFan(thermostatServiceId, 'auto');
	},
	armServices = (data) => () => {
		Api.armServices(data);
	};


export {
	setServiceSettings,
	fetchServiceLog,
	cameraStartStream,
	cameraStopStream,
	cameraFetchRecordings,
	cameraStartRecordingStream,
	cameraStopRecordingStream,
	lockLock,
	lockUnlock,
	thermostatSetTemp,
	thermostatSetMode,
	thermostatSetHold,
	thermostatFanOn,
	thermostatFanAuto,
	armServices
};
