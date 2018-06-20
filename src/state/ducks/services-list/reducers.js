import Immutable from 'immutable';
import createService from './models/service.js';
import * as types from './types';
import * as devicesListTypes from '../devices-list/types';

const initialState = {
		services: null,
		loading: false,
		error: false
	},
	recordingsInitialState = {
		recordings: null,
		loading: false,
		error: false
	},
	reducer = (state = initialState, action) => {
		let serviceIndex;

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
					error: false,
					services: Immutable.List(action.payload.devices.map((device) => {
						return Immutable.List(device.services.map((service) => {
							return createService({
								...service,
								device_id: device.id,
								recordingsList: recordingsReducer(service.recordings, action)
							});
						}));
					})).flatten(1) // Flatten the array of arrays.
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
				serviceIndex = state.services.findIndex((device) => device.id === action.payload.cameraId);

				return {
					...state,
					services: state.services.setIn([
						serviceIndex,
						'recordingsList'
					], recordingsReducer(state.services.get(serviceIndex).recordingsList, action))
				};
			case types.STREAM_CAMERA_LIVE:
				serviceIndex = state.services.findIndex((device) => device.id === action.payload.cameraId);

				return {
					...state,
					services: state.services.setIn([
						serviceIndex,
						'streaming_token'
					], action.payload.streamToken)
				};
			default:
				return state;
		}
	},
	recordingsReducer = (state = null, action) => {
		let recordingIndex, recordingToUpdate;

		switch (action.type) {
			case devicesListTypes.FETCH_DEVICES_SUCCESS:
				return {
					...recordingsInitialState,
					recordings: state ? Immutable.List(state) : recordingsInitialState.recordings
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
					recordings: Immutable.List(action.payload.recordings)
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

export default reducer;
