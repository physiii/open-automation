import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import Button from './Button.js';
import Form from './Form.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getRooms, getRoomById} from '../../state/ducks/rooms-list/selectors.js';
import Api from '../../api.js';

export class DeviceAddScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);

		this.state = {
			device: {},
			room: {},
			isSaveable: true,
			shouldGoBack: false
		};
	}

	handleSettingsChange ({name}) {
		this.setState({
			device: {id: name, settings: {}},
			room: {name},
			isSaveable: true
		});
	}

	handleSettingsErrors () {
		this.setState({isSaveable: false});
	}

	handleNoSettingsErrors () {
		this.setState({isSaveable: true});
	}

	handleSaveClick () {

		const device = this.state.device;

		console.log('!! adding divice !!', device);

		Api.addDevice(device);

		this.setState({shouldGoBack: true});
	}

	render () {
		if (this.state.shouldGoBack || (!this.props.isNew && !this.props.room)) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		return (
			<NavigationScreen
				title={this.props.isNew ? 'Add Device' : this.props.room.name}
				url={this.props.match.url}
				toolbarActions={this.props.isNew ? <Button onClick={this.handleSaveClick} disabled={!this.state.isSaveable}>Save</Button> : null}
				toolbarBackAction={this.props.isNew ? <Button to={this.props.match.parentMatch.url}>Cancel</Button> : null}>
				<Form
					fields={{name: {
						type: 'string',
						label: 'Enter Device ID.',
						validation: {
							is_required: true,
							max_length: 40,
							unique: {
								message: 'A room already exists with that name.'
							}
						}
					}}}
					values={{id: this.state.device.id}}
					onSaveableChange={this.handleSettingsChange}
					onError={this.handleSettingsErrors}
					onNoError={this.handleNoSettingsErrors} />
			</NavigationScreen>
		);
	}
}

DeviceAddScreen.propTypes = {
	rooms: PropTypes.array,
	room: PropTypes.object,
	isNew: PropTypes.bool,
	match: PropTypes.object
};

const mapStateToProps = ({roomsList}, {match}) => {
	return {
		rooms: getRooms(roomsList),
		room: getRoomById(roomsList, match.params.roomId)
	};
};

export default compose(
	withRoute({params: '/:roomId?'}),
	connect(mapStateToProps, null)
)(DeviceAddScreen);
