import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Form from './Form.js';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceRoom} from '../../state/ducks/devices-list/operations.js';
import {getRooms, hasInitialFetchCompleted} from '../../state/ducks/rooms-list/selectors.js';

export class DeviceRoomField extends React.Component {
	constructor (props) {
		super(props);

		this.handleRoomChange = this.handleRoomChange.bind(this);
	}

	handleRoomChange ({room}) {
		this.props.saveRoom(this.props.device.id, room, this.props.device.room_id);
	}

	getRoomValue () {
		if (this.props.areRoomsLoading || !this.props.rooms.find((room) => room.id === this.props.device.room_id)) {
			return '';
		}

		return this.props.device.room_id;
	}

	render () {
		return (
			<Form
				fields={{room: {
					type: 'one-of',
					label: 'Room',
					value_options: this.props.rooms.map((room) => ({
						value: room.id,
						label: room.name
					}))
				}}}
				values={{room: this.getRoomValue()}}
				disabled={this.props.areRoomsLoading}
				onSaveableChange={this.handleRoomChange} />
		);
	}
}

DeviceRoomField.propTypes = {
	device: PropTypes.object.isRequired,
	rooms: PropTypes.array.isRequired,
	areRoomsLoading: PropTypes.bool,
	saveRoom: PropTypes.func.isRequired
};

const mapStateToProps = ({devicesList, roomsList}, {deviceId}) => ({
		device: getDeviceById(devicesList, deviceId),
		rooms: getRooms(roomsList),
		areRoomsLoading: !hasInitialFetchCompleted(roomsList)
	}),
	mapDispatchToProps = (dispatch) => ({
		saveRoom: (deviceId, roomId, originalRoomId) => dispatch(setDeviceRoom(deviceId, roomId, originalRoomId))
	});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceRoomField);
