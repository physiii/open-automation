import Immutable from 'immutable';
import {immutableOrderedMapFromArray} from '../../../utilities.js';
import Device from './models/device-record.js';
import * as types from './types';
import * as sessionTypes from '../session/types';

const initialState = Immutable.Map({
		devices: Immutable.OrderedMap(),
		loading: false,
		fetched: false, // Whether first fetch has completed.
		error: false
	}),
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.FETCH_DEVICES:
				return state.set('loading', true);
			case types.FETCH_DEVICES_SUCCESS:
				return state.merge({
					loading: false,
					fetched: true,
					error: false,
					devices: immutableOrderedMapFromArray(action.payload.devices, (device) => new Device(device))
				});
			case types.FETCH_DEVICES_ERROR:
				return state.merge({
					loading: false,
					error: action.payload.error.message
				});
			case types.SET_SETTINGS:
				return state.mergeIn(
					['devices', action.payload.deviceId],
					{
						settings: action.payload.settings,
						error: null
					}
				);
			case types.SET_SETTINGS_ERROR:
				return state.mergeIn(
					['devices', action.payload.deviceId],
					{
						settings: action.payload.originalSettings,
						error: action.payload.error.message
					}
				);
			case types.SET_DEVICE_ROOM:
				return state.mergeIn(
					['devices', action.payload.deviceId],
					{
						room_id: action.payload.roomId,
						error: null
					}
				);
			case types.SET_DEVICE_ROOM_ERROR:
				return state.mergeIn(
					['devices', action.payload.deviceId],
					{
						room_id: action.payload.originalRoomId,
						error: action.payload.error.message
					}
				);
			case types.DELETE_DEVICE:
				return state.deleteIn(['devices', action.payload.deviceId]);
			case types.DELETE_DEVICE_ERROR:
				return state.setIn(
					['devices', action.payload.device.id],
					new Device(action.payload.device)
				).set('error', action.payload.error.message);
			case sessionTypes.LOGOUT:
				return initialState;
			default:
				return state;
		}
	};

export default reducer;
