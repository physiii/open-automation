const getRooms = (roomsList, toJs = true) => {
		const rooms = roomsList.get('rooms');

		return toJs ? rooms.toList().toJS() : rooms;
	},
	getRoomById = (roomsList, roomId, toJs = true) => {
		const room = roomsList.getIn(['rooms', roomId]);

		if (!room) {
			return;
		}

		return toJs ? room.toJS() : room;
	},
	hasInitialFetchCompleted = (roomsList) => {
		return roomsList.get('fetched');
	},
	getRoomsError = (roomsList) => {
		const error = roomsList.get('error');

		if (error) {
			return error;
		}
	};

export {
	getRooms,
	getRoomById,
	hasInitialFetchCompleted,
	getRoomsError
};
