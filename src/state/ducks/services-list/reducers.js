import Immutable from 'immutable';
import createService from './models/service.js';
import * as types from './types';
import * as devicesListTypes from '../devices-list/types';
import * as sessionTypes from '../session/types';

const initialState = {
		services: Immutable.Map(),
		loading: false,
		fetched: false, // Whether first fetch has completed.
		error: false
	},
	recordingsInitialState = {
		recordings: Immutable.OrderedMap(),
		loading: false,
		error: false
	},
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case devicesListTypes.FETCH_DEVICES:
				return {
					...state,
					loading: true
				};
			case devicesListTypes.FETCH_DEVICES_SUCCESS:
				return {
					...state,
					loading: false,
					fetched: true,
					error: false,
					services: mapFromArray(action.payload.devices, (device) => {
						return mapFromArray(device.services, (service) => {
							const currentServiceState = state.services.get(service.id);

							return createService({
								...(currentServiceState && currentServiceState.toObject()) || {},
								...service,
								state: {
									...service.state,
									connected: device.state.connected &&
										(Object.prototype.hasOwnProperty.call(service.state, 'connected')
											? service.state.connected
											: true)
								},
								device_id: device.id,
								recordingsList: recordingsReducer(currentServiceState && currentServiceState.recordingsList, {
									...action,
									payload: {recordings: service.recordings}
								})
							});
						});
					}).flatten(1) // Flatten the devices collection to get a list of just services.
				};
			case devicesListTypes.FETCH_DEVICES_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			case types.FETCH_CAMERA_RECORDINGS:
			case types.FETCH_CAMERA_RECORDINGS_SUCCESS:
			case types.FETCH_CAMERA_RECORDINGS_ERROR:
			case types.STREAM_CAMERA_RECORDING:
				return {
					...state,
					services: state.services.setIn([
						action.payload.cameraId,
						'recordingsList'
					], recordingsReducer(state.services.get(action.payload.cameraId).recordingsList, action))
				};
			case types.STREAM_CAMERA_LIVE:
				return {
					...state,
					services: state.services.setIn([
						action.payload.cameraId,
						'streaming_token'
					], action.payload.streamToken)
				};
			case sessionTypes.LOGOUT:
				return {...initialState};
			default:
				return state;
		}
	},
	recordingsReducer = (state = recordingsInitialState, action) => {
		let recordingIndex, recordingToUpdate;

		switch (action.type) {
			case devicesListTypes.FETCH_DEVICES_SUCCESS:
				return {
					...recordingsInitialState,
					recordings: action.payload.recordings
						? orderedMapFromArray(action.payload.recordings)
						: state.recordings
				};
			case types.FETCH_CAMERA_RECORDINGS:
				return {
					...state,
					loading: true
				};
			case types.FETCH_CAMERA_RECORDINGS_SUCCESS:
				return {
					...state,
					loading: false,
					error: false,
					recordings: orderedMapFromArray(action.payload.recordings)
				};
			case types.FETCH_CAMERA_RECORDINGS_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			case types.STREAM_CAMERA_RECORDING:
				recordingIndex = state.recordings.findIndex((recording) => recording.id === action.payload.recordingId);
				recordingToUpdate = state.recordings.get(recordingIndex);

				return {
					...state,
					recordings: state.recordings.set(
						recordingIndex,
						{
							...recordingToUpdate,
							streaming_token: action.payload.streamToken
						}
					)
				};
			default:
				return state;
		}
	};

function mapFromArray (array = [], mapper, mapClass = Immutable.Map) {
	return mapClass(array.map((item) => [
		item.id,
		typeof mapper === 'function' ? mapper(item) : item
	]));
}

function orderedMapFromArray (array, mapper) {
	return mapFromArray(array, mapper, Immutable.OrderedMap);
}

export default reducer;
