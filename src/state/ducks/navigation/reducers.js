import Immutable from 'immutable';
import * as types from './types';
import * as sessionTypes from '../session/types';

const initialState = {
		currentContext: null,
		screenHistory: Immutable.Map()
	},
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.LOAD_CONTEXT:
				return {
					...state,
					currentContext: action.payload.context
				};
			case types.LOAD_SCREEN:
				return {
					...state,
					screenHistory: state.screenHistory.setIn(
						[
							state.currentContext,
							action.payload.path
						],
						Immutable.Map(action.payload)
					)
				};
			case types.UNLOAD_SCREEN:
				return {
					...state,
					screenHistory: state.screenHistory.deleteIn([
						state.currentContext,
						action.payload.path
					])
				};
			case sessionTypes.LOGOUT:
				return {...initialState};
			default:
				return state;
		}
	};

export default reducer;
