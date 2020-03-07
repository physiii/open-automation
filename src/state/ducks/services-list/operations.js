import * as actions from './actions';
import Api from '../../../api.js';
import RecordingsWorker from './recordings.worker.js';

const recordingsWorker = new RecordingsWorker(),
	doServiceAction = (serviceId, serviceAction, originalValue) => (dispatch) => {
		dispatch(actions.doServiceAction(serviceId, serviceAction));

		Api.doServiceAction(serviceId, serviceAction).catch((error) => {
			dispatch(actions.doServiceActionError(serviceId, originalValue, error));
		});
	},
	setServiceSettings = (serviceId, settings, originalSettings) => (dispatch) => {
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
	fetchDeviceLog = (serviceId) => (dispatch) => {
		dispatch(actions.fetchServiceLog(serviceId));

		Api.getDeviceLog(serviceId).then((data) => {
			dispatch(actions.fetchServiceLogSuccess(serviceId, data.log));
		}).catch((error) => {
			dispatch(actions.fetchServiceLogError(serviceId, error));
		});
	},
	audioStartStream = (audioServiceId) => (dispatch) => {
		Api.audioStartLiveStream(audioServiceId).then((data) => {
			dispatch(actions.audioStreamLive(audioServiceId, data.stream_token));
		});
	},
	audioStopStream = (audioServiceId) => () => {
		Api.audioStopLiveStream(audioServiceId);
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
			recordingsWorker.onmessage = (message) => {
				if (message.data.error) {
					dispatch(actions.cameraFetchRecordingsError(cameraServiceId, message.data.error));

					return;
				}

				dispatch(actions.cameraFetchRecordingsSuccess(cameraServiceId, data.recordings, message.data.dateIndex, message.data.dates));
			};

			recordingsWorker.postMessage({recordings: data.recordings});
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
	gameMachineAddCredit = (gameMachineServiceId, dollarValue) => () => {
		Api.gameMachineAddCredit(gameMachineServiceId, dollarValue);
	};

export {
	doServiceAction,
	setServiceSettings,
	fetchServiceLog,
	fetchDeviceLog,
	audioStartStream,
	audioStopStream,
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
	gameMachineAddCredit
};
