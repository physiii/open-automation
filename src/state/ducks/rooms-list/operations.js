import * as actions from './actions';
import Api from '../../../api.js';
import uuidV4 from 'uuid/v4';

const listenForRoomChanges = () => (dispatch) => {
		Api.on('rooms', (data) => dispatch(actions.fetchRoomsSuccess(data.rooms)));
	},
	fetchRooms = () => (dispatch) => {
		dispatch(actions.fetchRooms());

		Api.getRooms().then((data) => {
			dispatch(actions.fetchRoomsSuccess(data.rooms));
		}).catch((error) => {
			dispatch(actions.fetchRoomsError(error));
		});
	},
	sortRooms = (order) => (dispatch) => {
		dispatch(actions.sortRooms(order));

		Api.sortRooms(order).catch((error) => {
			dispatch(actions.sortRoomsError(error));
		});
	},
	addRoom = (name) => (dispatch) => {
		const tempId = uuidV4();

		dispatch(actions.addRoom(tempId, {name}));

		Api.addRoom(name).then((data) => {
			dispatch(actions.addRoomSuccess(tempId, data.room));
		}).catch((error) => {
			dispatch(actions.addRoomError(tempId, error));
		});
	},
	setRoomName = (roomId, name, originalName) => (dispatch) => {
		dispatch(actions.setRoomName(roomId, name));

		Api.nameRoom(roomId, name).catch((error) => {
			dispatch(actions.setRoomNameError(roomId, originalName, error));
		});
	},
	deleteRoom = (room) => (dispatch) => {
		dispatch(actions.deleteRoom(room.id));

		Api.deleteRoom(room.id).catch((error) => {
			dispatch(actions.deleteRoomError(room, error));
		});
	};

export {
	listenForRoomChanges,
	fetchRooms,
	sortRooms,
	addRoom,
	setRoomName,
	deleteRoom
};
