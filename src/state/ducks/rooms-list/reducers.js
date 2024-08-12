import Immutable from 'immutable';
import {immutableOrderedMapFromArray} from '../../../utilities.js';
import Room from './models/room-record.js';
import * as types from './types';
import * as sessionTypes from '../session/types';

const SORT_UP = -1,
	SORT_DOWN = 1,
	SORT_SAME = 0,
	initialState = Immutable.Map({
		rooms: Immutable.OrderedMap(),
		loading: false,
		fetched: false, // Whether first fetch has completed.
		error: false
	}),
	reducer = (state = initialState, action) => {
		switch (action.type) {
			case types.FETCH_ROOMS:
				return state.set('loading', true);
			case types.FETCH_ROOMS_SUCCESS:
				return state.merge({
					loading: false,
					fetched: true,
					error: false,
					rooms: immutableOrderedMapFromArray(action.payload.rooms, (room) => new Room(room))
				});
			case types.FETCH_ROOMS_ERROR:
				return state.merge({
					loading: false,
					error: action.payload.error.message
				});
			case types.SORT_ROOMS:
				return state.update('rooms', (rooms) => rooms.sort((a, b) => { // eslint-disable-line id-length
					const aIndex = action.payload.order.indexOf(a.id),
						bIndex = action.payload.order.indexOf(b.id);

					if (aIndex < bIndex) {
						return SORT_UP;
					} else if (aIndex > bIndex) {
						return SORT_DOWN;
					}

					return SORT_SAME;
				}));
			case types.SORT_ROOMS_ERROR:
				return state.set('error', action.payload.error.message);
			case types.ADD_ROOM:
				return state.setIn(
					['rooms', action.payload.tempRoomId],
					new Room({
						...action.payload.room,
						id: action.payload.tempRoomId,
						isUnsaved: true
					})
				);
			case types.ADD_ROOM_SUCCESS:
				return state.setIn(
					['rooms', action.payload.room.id],
					new Room(action.payload.room)
				).deleteIn(['rooms', action.payload.tempRoomId]);
			case types.ADD_ROOM_ERROR:
				return state.merge({
					error: action.payload.error.message
				}).deleteIn(['rooms', action.payload.tempRoomId]);
			case types.SET_ROOM_NAME:
				return state.mergeIn(
					['rooms', action.payload.roomId],
					{
						name: action.payload.name,
						error: null
					}
				);
			case types.SET_ROOM_NAME_ERROR:
				return state.mergeIn(
					['rooms', action.payload.roomId],
					{
						name: action.payload.originalName,
						error: action.payload.error.message
					}
				);
			case types.DELETE_ROOM:
				return state.deleteIn(['rooms', action.payload.roomId]);
			case types.DELETE_ROOM_ERROR:
				return state.setIn(
					['rooms', action.payload.room.id],
					new Room(action.payload.room)
				).set('error', action.payload.error.message);
			case sessionTypes.LOGOUT:
				return initialState;
			default:
				return state;
		}
	};

export default reducer;
