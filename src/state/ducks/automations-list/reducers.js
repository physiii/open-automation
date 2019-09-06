import Immutable from 'immutable';
import {immutableMapFromArray} from '../../../utilities.js';
import Automation from './models/automation-record.js';
import * as types from './types';
import * as sessionTypes from '../session/types';

const initialState = Immutable.Map({
		automations: Immutable.Map(),
		loading: false,
		fetched: false, // Whether first fetch has completed.
		error: false
	}),
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.FETCH_AUTOMATIONS:
				return state.set('loading', true);
			case types.FETCH_AUTOMATIONS_SUCCESS:
				return state.merge({
					loading: false,
					fetched: true,
					error: false,
					automations: immutableMapFromArray(action.payload.automations, (automation) => new Automation(automation))
				});
			case types.FETCH_AUTOMATIONS_ERROR:
				return state.merge({
					loading: false,
					error: action.payload.error.message
				});
			case types.ADD_AUTOMATION:
				return state.setIn(
					['automations', action.payload.tempAutomationId],
					new Automation({
						...action.payload.automation,
						id: action.payload.tempAutomationId,
						isUnsaved: true
					})
				);
			case types.ADD_AUTOMATION_SUCCESS:
				return state.setIn(
					['automations', action.payload.automation.id],
					new Automation(action.payload.automation)
				).deleteIn(['automations', action.payload.tempAutomationId]);
			case types.ADD_AUTOMATION_ERROR:
				return state.merge({
					error: action.payload.error.message
				}).deleteIn(['automations', action.payload.tempAutomationId]);
			case types.SAVE_AUTOMATION:
				return state.mergeIn(
					['automations', action.payload.automation.id],
					{
						...action.payload.automation,
						error: null
					}
				);
			case types.SAVE_AUTOMATION_ERROR:
				return state.mergeIn(
					['automations', action.payload.automation.id],
					{
						...action.payload.originalAutomation,
						error: action.payload.error.message
					}
				);
			case types.DELETE_AUTOMATION:
				return state.deleteIn(['automations', action.payload.automationId]);
			case types.DELETE_AUTOMATION_ERROR:
				return state.setIn(
					['automations', action.payload.automation.id],
					new Automation(action.payload.automation)
				).set('error', action.payload.error.message);
			case sessionTypes.LOGOUT:
				return initialState;
			default:
				return state;
		}
	};

export default reducer;
