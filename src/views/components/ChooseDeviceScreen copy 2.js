import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRoute} from './Route.js';
import Button from './Button.js';
import {Link} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import DevicesList from './DevicesList.js';
import BlankState from './BlankState.js';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getRooms, getRoomById} from '../../state/ducks/rooms-list/selectors.js';

export const ChooseDeviceScreen = (props) => {
	let roomsWithDevices = 0;

	return (
		<NavigationScreen
			title={props.title}
			url={props.match.urlWithoutOptionalParams}
			toolbarActions={props.toolbarActions}
			toolbarBackAction={props.toolbarBackAction}>
			{props.children}
			{!props.devices.length
				? <BlankState
					heading="No Devices"
					body={props.blankstateBody} />
				: <SettingsScreenContainer withPadding={true}>
					{props.instructions}
					{props.rooms.map((room) => {
						const roomDevices = props.devices.filter((device) => device.room_id === room.id);

						if (!roomDevices.length) {
							return null;
						}

						roomsWithDevices += 1;

						return (
							<React.Fragment key={room.id}>
								<h1>{room.name}</h1>
								<DevicesList devices={roomDevices} deviceLinkBase={props.match.url} />
							</React.Fragment>
						);
					}).filter((content) => content)}
					{props.devicesWithoutRoom.length && roomsWithDevices > 0
						? <h1>Other Devices</h1>
						: null}
					{props.devicesWithoutRoom.length
						? <DevicesList devices={props.devicesWithoutRoom} deviceLinkBase={props.match.url} />
						: null}

					<React.Fragment>
					<div>
						
						<h1>Send a Notification</h1>
						<Link to={props.match.url + '/notification/email'}>
							About LINK
						</Link>
						<Button to={props.match.url + '/notification/email'}>Email</Button>
						<Button to={props.match.url + '/notification/sms'}>SMS</Button>
						<AutomationNotificationScreen
							path={props.match.path + '/notification'}
							isNew={props.isNew}
							notifications={props.notifications}
							saveNotification={props.saveNotification}
							deleteNotification={props.deleteNotification} />
					</div>
					</React.Fragment>
				</SettingsScreenContainer>
			}
		</NavigationScreen>
	);
};

ChooseDeviceScreen.propTypes = {
	isNew: PropTypes.bool,
	notifications: PropTypes.object,
	saveNotification: PropTypes.func.isRequired,
	deleteNotification: PropTypes.func,
	title: PropTypes.string,
	toolbarActions: PropTypes.node,
	toolbarBackAction: PropTypes.node,
	instructions: PropTypes.node,
	blankstateBody: PropTypes.string,
	children: PropTypes.node,
	devices: PropTypes.array.isRequired,
	devicesWithoutRoom: PropTypes.array.isRequired,
	rooms: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired
};

ChooseDeviceScreen.defaultProps = {
	instructions: <p>Choose a device.</p>,
	blankstateBody: 'Use the ‘Settings’ tab to add devices.'
};

const mapStateToProps = ({devicesList, roomsList}, ownProps) => {
	const devices = ownProps.devices || getDevices(devicesList);

	return {
		devices,
		devicesWithoutRoom: devices.filter((device) => !getRoomById(roomsList, device.room_id)),
		rooms: getRooms(roomsList)
	};
};

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(ChooseDeviceScreen);
