import Immutable from 'immutable';
import Device from './models/device-record.js';
import * as types from './types';

const initialState = {
		devices: null,
		loading: false,
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
					error: false,
					devices: Immutable.List(action.payload.devices.map((device) => {
						return new Device({
							...device,
							services: Immutable.List(device.services.map((service) => service.id))
						});
					}))
				};
			case types.FETCH_DEVICES_ERROR:
				return {
					...state,
					loading: false,
					error: action.payload.error.message
				};
			default:
				return state;
		}
	};

export default reducer;
