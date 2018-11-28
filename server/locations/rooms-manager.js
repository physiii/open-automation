const EventEmitter = require('events'),
	TAG = '[RoomsManager]';

class RoomsManager extends EventEmitter {
	constructor (rooms = [], saveRooms) {
		super();

		this.rooms = [...rooms];
		this.saveRooms = saveRooms;
	}

	addRoom (name) {
		return new Promise((resolve, reject) => {
			if (!this.isNameAvailable(name)) {
				reject('A room with the name "' + name + '" already exists.');
				return;
			}

			const new_rooms = [...this.rooms];

			new_rooms.push({name});

			this.save(new_rooms).then((saved_rooms) => {
				const saved_room = saved_rooms.find((room) => room.name === name);

				resolve(saved_room);
			}).catch(reject);
		});
	}

	deleteRoom (room_id) {
		return new Promise((resolve, reject) => {
			const new_rooms = [...this.rooms],
				room_index = this.rooms.findIndex((room) => room.id === room_id);

			if (room_index < 0) {
				reject('No room found with that ID.');
				return;
			}

			new_rooms.splice(room_index, 1);

			this.save(new_rooms).then(resolve).catch(reject);
		});
	}

	setRoomName (room_id, name) {
		return new Promise((resolve, reject) => {
			if (!this.isNameAvailable(name)) {
				reject('A room with the name "' + name + '" already exists.');
				return;
			}

			if (typeof name !== 'string') {
				reject('Name must be a string.');
				return;
			}

			const new_rooms = [...this.rooms],
				room = this.rooms.find((room) => room.id === room_id),
				room_index = this.rooms.indexOf(room);

			if (room_index < 0) {
				reject('No room found with that ID.');
				return;
			}

			new_rooms.splice(room_index, 1, {...room, name});

			this.save(new_rooms).then((saved_rooms) => {
				const saved_room = saved_rooms.find((room) => room.id === room_id);

				resolve(saved_room);
			}).catch(reject);
		});
	}

	sortRooms (order) {
		return new Promise((resolve, reject) => {
			const new_rooms = [...this.rooms];

			new_rooms.sort((a, b) => {
				const a_index = order.indexOf(a.id),
					b_index = order.indexOf(b.id);

				if (a_index < b_index) {
					return -1;
				} else if (a_index > b_index) {
					return 1;
				} else {
					return 0;
				}
			});

			this.save(new_rooms).then(resolve).catch(reject);
		});
	}

	getRoomById (room_id) {
		return this.rooms.find((room) => room.id === room_id);
	}

	isNameAvailable (name) {
		return !this.rooms.some((room) => room.name === name);
	}

	save (rooms = []) {
		return new Promise((resolve, reject) => {
			this.saveRooms(this.dbSerialize(rooms)).then((saved_rooms) => {
				this.rooms = [...saved_rooms];

				resolve([...saved_rooms]);

				this.emit('rooms-updated', {
					rooms: [...this.rooms],
					clientSerializedRooms: this.clientSerialize()
				});
			}).catch(reject);
		});
	}

	_serialize (rooms = this.rooms) {
		return [...rooms];
	}

	dbSerialize (rooms = this.rooms) {
		return this._serialize(rooms);
	}

	clientSerialize () {
		return this._serialize();
	}
}

module.exports = RoomsManager;
