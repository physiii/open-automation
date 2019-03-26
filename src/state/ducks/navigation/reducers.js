import Immutable from 'immutable';
import * as types from './types';
import * as sessionTypes from '../session/types';

const initialState = {
		currentContext: null,
		contexts: Immutable.OrderedMap()
	},
	reducer = (state = initialState, action) => {
		let contextPath = action.payload && action.payload.context;

		switch (action.type) {
			case types.LOAD_CONTEXT:
				contextPath = action.payload.path;

				return {
					...state,
					currentContext: action.payload.path,
					contexts: state.contexts.set(
						contextPath,
						state.contexts.get(contextPath) ||
							Immutable.Map({
								path: contextPath,
								currentFullPath: action.payload.currentFullPath,
								screens: Immutable.OrderedMap()
							})
					)
				};
			case types.UNLOAD_CONTEXT:
				contextPath = action.payload.path;

				// Only handle unloading of the active context. This maintains
				// the navigation state of contexts that aren't currently
				// mounted.
				if (state.currentContext !== contextPath) {
					return state;
				}

				return {
					...state,
					contexts: state.contexts.delete(contextPath)
				};
			case types.LOAD_SCREEN:
				return {
					...state,
					contexts: state.contexts.setIn(
						[
							contextPath,
							'screens',
							action.payload.path
						],
						Immutable.Map({
							path: action.payload.path,
							depth: action.payload.depth,
							title: action.payload.title,
							shouldShowTitle: action.payload.shouldShowTitle
						})
					).setIn(
						[
							contextPath,
							'currentFullPath'
						],
						action.payload.currentFullPath
					).updateIn(
						[
							contextPath,
							'screens'
						],
						(screens) => screens.sortBy((screen) => screen.get('depth'))
					)
				};
			case types.UNLOAD_SCREEN:
				// Only handle unloading of screens in the active context. This
				// maintains the navigation state of contexts that aren't
				// currently mounted.
				if (state.currentContext !== contextPath) {
					return state;
				}

				return {
					...state,
					contexts: state.contexts.deleteIn([
						contextPath,
						'screens',
						action.payload.path
					])
				};
			case '@@router/LOCATION_CHANGE': { // TODO: Move this into NavigationScreen component?
				const context = state.contexts.findLast((_context, _path) => new RegExp('^' + _path).test(action.payload.location.pathname));

				if (!context) {
					return state;
				}

				contextPath = context.get('path');

				return {
					...state,
					contexts: state.contexts.setIn(
						[
							contextPath,
							'currentFullPath'
						],
						action.payload.location.pathname
					)
				};
			}
			case sessionTypes.LOGOUT:
				return {...initialState};
			default:
				return state;
		}
	};

export default reducer;
