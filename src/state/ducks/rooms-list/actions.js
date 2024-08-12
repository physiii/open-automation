import * as types from './types';

export const fetchRooms = () => ({
	type: types.FETCH_ROOMS
});

export const fetchRoomsSuccess = (rooms) => ({
	type: types.FETCH_ROOMS_SUCCESS,
	payload: {rooms}
});

export const fetchRoomsError = (error) => ({
	type: types.FETCH_ROOMS_ERROR,
	payload: {error},
	error: true
});

export const sortRooms = (order) => ({
	type: types.SORT_ROOMS,
	payload: {order}
});

export const sortRoomsError = (roomId, originalName, error) => ({
	type: types.SORT_ROOMS_ERROR,
	payload: {error},
	error: true
});

export const addRoom = (tempRoomId, room) => ({
	type: types.ADD_ROOM,
	payload: {tempRoomId, room}
});

export const addRoomSuccess = (tempRoomId, room) => ({
	type: types.ADD_ROOM_SUCCESS,
	payload: {tempRoomId, room}
});

export const addRoomError = (tempRoomId, error) => ({
	type: types.ADD_ROOM_ERROR,
	payload: {tempRoomId, error},
	error: true
});

export const setRoomName = (roomId, name) => ({
	type: types.SET_ROOM_NAME,
	payload: {roomId, name}
});

export const setRoomNameError = (roomId, originalName, error) => ({
	type: types.SET_ROOM_NAME_ERROR,
	payload: {roomId, originalName, error},
	error: true
});

export const deleteRoom = (roomId) => ({
	type: types.DELETE_ROOM,
	payload: {roomId}
});

export const deleteRoomError = (room, error) => ({
	type: types.DELETE_ROOM_ERROR,
	payload: {room, error},
	error: true
});
