import Immutable from 'immutable';
import Device from './models/device-record.js';
import * as types from './types';
import * as sessionTypes from '../session/types';

const initialState = {
		devices: Immutable.Map(),
		loading: false,
		fetched: false, // Whether first fetch has completed.
		error: false
	},
	reducer = (state = initialState, action) => {
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
					fetched: true,
					error: false,
					devices: mapFromArray(action.payload.devices, (device) => {
						return new Device({
							...device,
							services: mapFromArray(device.services, (service) => ({
								id: service.id,
								type: service.type
							}))
						});
					})
				};
			case types.FETCH_DEVICES_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			case sessionTypes.LOGOUT:
				return {...initialState};
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

export default reducer;
