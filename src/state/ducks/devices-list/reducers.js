import Immutable from 'immutable';
import Device from './models/device.js';
import * as types from './types';

const initialState = {
		devices: null,
		loading: false,
		error: false
	},
	recordingsInitialState = {
		recordings: null,
		loading: false,
		error: false
	},
	reducer = (state = initialState, action) => {
		let deviceIndex;

		switch (action.type) {
			case types.FETCH_DEVICES:
				return {
					...state,
					loading: true
				};
			case types.FETCH_DEVICES_SUCCESS:
				return {
					...state,
					loading: false,
					error: false,
					devices: Immutable.List(action.payload.devices.map((device) => {
						return new Device({
							...device,
							recordingsList: recordingsReducer(device.recordings, action)
						});
					}))
				};
			case types.FETCH_DEVICES_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.message
				};
			case types.FETCH_CAMERA_RECORDINGS:
			case types.FETCH_CAMERA_RECORDINGS_SUCCESS:
			case types.FETCH_CAMERA_RECORDINGS_ERROR:
				deviceIndex = state.devices.findIndex((device) => device.id === action.payload.cameraId);

				return {
					...state,
					devices: state.devices.setIn([
						deviceIndex,
						'recordingsList'
					], recordingsReducer(state.devices.get(deviceIndex).recordingsList, action))
				};
			default:
				return state;
		}
	},
	recordingsReducer = (state = null, action) => {
		switch (action.type) {
			case types.FETCH_DEVICES_SUCCESS:
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
					error: action.payload.message
				};
			default:
				return state;
		}
	};

export default reducer;
