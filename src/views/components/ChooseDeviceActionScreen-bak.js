import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import DevicesList from './DevicesList.js';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import AutomationChooseServiceActionScreen from './AutomationChooseServiceActionScreen.js';
import Button from './Button.js';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getRooms, getRoomById} from '../../state/ducks/rooms-list/selectors.js';

export const ChooseDeviceActionsScreen = (props) => {
	let roomsWithDevices = 0;

	return (
		<NavigationScreen
			title={props.title}
			url={props.match.urlWithoutOptionalParams}
			toolbarActions={props.toolbarActions}
			toolbarBackAction={props.toolbarBackAction}>

			<AutomationNotificationScreen
				path={props.match.path + '/notification'}
				isNew={props.isNew}
				notifications={props.notifications}
				saveNotification={props.saveNotification}
				deleteNotification={props.deleteNotification} />


			<AutomationChooseServiceActionScreen
				isNew={props.isNew}
				path={props.match.path}
				actions={props.actions}
				saveAction={props.saveAction}
				deleteAction={props.deleteAction} />

			{props.children}
			{!props.devices.length
				? <div>
					<h1>Send a Notification</h1>
					<Button to={props.match.url + '/notification/email'}>Email</Button>
					<Button to={props.match.url + '/notification/sms'}>SMS</Button>
				</div>
				: <SettingsScreenContainer withPadding={true}>
					<div>
						<h1>Send a Notification</h1>
						<Button to={props.match.url + '/notification/email'}>Email</Button>
						<Button to={props.match.url + '/notification/sms'}>SMS</Button>
					</div>
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
				</SettingsScreenContainer>}
		</NavigationScreen>
	);
};

ChooseDeviceActionsScreen.propTypes = {
	isNew: PropTypes.bool,
	actions: PropTypes.object,
	saveAction: PropTypes.func.isRequired,
	deleteAction: PropTypes.func,
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

ChooseDeviceActionsScreen.defaultProps = {
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
)(ChooseDeviceActionsScreen);
