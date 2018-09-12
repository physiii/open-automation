import Immutable from 'immutable';
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
					devices: orderedMapFromArray(action.payload.devices, (device) => new Device(device))
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
			case types.DELETE_DEVICE:
				return state.deleteIn(['devices', action.payload.deviceId]);
			case types.DELETE_DEVICE_ERROR:
				return state.setIn(
					['devices', action.payload.device.id],
					action.payload.device.set('error', action.payload.error.message)
				);
			case sessionTypes.LOGOUT:
				return initialState;
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
