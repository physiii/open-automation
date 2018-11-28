import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import Button from './Button.js';
import SettingsForm from './SettingsForm.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {addRoom, setRoomName} from '../../state/ducks/rooms-list/operations.js';
import {getRooms, getRoomById} from '../../state/ducks/rooms-list/selectors.js';

export class RoomEditScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);

		this.state = {
			room: {},
			isSaveable: false,
			shouldGoBack: false
		};
	}

	handleSettingsChange ({name}) {
		if (this.props.isNew) {
			this.setState({
				room: {name},
				isSaveable: true
			});
		} else {
			this.props.setRoomName(this.props.room.id, name, this.props.room.name);
		}
	}

	handleSettingsErrors () {
		this.setState({isSaveable: false});
	}

	handleNoSettingsErrors () {
		this.setState({isSaveable: true});
	}

	handleSaveClick () {
		this.props.addRoom(this.state.room.name);
		this.setState({shouldGoBack: true});
	}

	render () {
		if (this.state.shouldGoBack || (!this.props.isNew && !this.props.room)) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		return (
			<NavigationScreen
				title={this.props.isNew ? 'Add Room' : this.props.room.name}
				url={this.props.match.url}
				toolbarActions={this.props.isNew ? <Button onClick={this.handleSaveClick} disabled={!this.state.isSaveable}>Save</Button> : null}
				toolbarBackAction={this.props.isNew ? <Button to={this.props.match.parentMatch.url}>Cancel</Button> : null}>
				<SettingsForm
					fields={{name: {
						type: 'string',
						label: 'Name',
						validation: {
							is_required: true,
							max_length: 24,
							unique: {
								values: this.props.rooms
									.filter((room) => room.id !== this.props.room.id)
									.map((room) => room.name),
								message: 'A room already exists with that name.'
							}
						}
					}}}
					values={{name: this.props.isNew
						? this.state.room.name
						: this.props.room && this.props.room.name}}
					onSaveableChange={this.handleSettingsChange}
					onError={this.handleSettingsErrors}
					onNoError={this.handleNoSettingsErrors} />
			</NavigationScreen>
		);
	}
}

RoomEditScreen.propTypes = {
	rooms: PropTypes.array,
	room: PropTypes.object,
	isNew: PropTypes.bool,
	match: PropTypes.object,
	addRoom: PropTypes.func,
	setRoomName: PropTypes.func
};

const mapStateToProps = ({roomsList}, {match}) => {
		return {
			rooms: getRooms(roomsList),
			room: getRoomById(roomsList, match.params.roomId)
		};
	},
	mapDispatchToProps = (dispatch) => ({
		addRoom: (name) => dispatch(addRoom(name)),
		setRoomName: (roomId, name, originalName) => dispatch(setRoomName(roomId, name, originalName))
	});

export default compose(
	withRoute({params: '/:roomId?'}),
	connect(mapStateToProps, mapDispatchToProps)
)(RoomEditScreen);
