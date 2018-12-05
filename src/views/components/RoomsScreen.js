import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import List from './List.js';
import BlankState from './BlankState.js';
import ServiceCardGrid from './ServiceCardGrid.js';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServices} from '../../state/ducks/services-list/selectors.js';
import {getRooms, hasInitialFetchCompleted} from '../../state/ducks/rooms-list/selectors.js';

export const RoomsScreen = (props) => {
	return (
		<NavigationScreen title="Rooms" url={props.match.urlWithoutOptionalParams} isContextRoot={true}>
			{props.isLoading
				? <span>Loading</span>
				: <Switch>
					<Route exact path={props.match.url} render={() => (
						<React.Fragment>
							{!props.rooms.length &&
								<BlankState
									heading="No Rooms"
									body="Use ‘Settings’ to add rooms and they will show up here." />
							}
							<List isOrdered={true} renderIfEmpty={false}>
								{props.rooms.map((room) => ({
									key: room.id,
									label: room.name,
									link: props.match.url + '/' + room.id
								}))}
							</List>
						</React.Fragment>
					)} />
					<Route path={props.match.url + '/:roomId'} render={(routeProps) => {
						const room = props.rooms.find((_room) => _room.id === routeProps.match.params.roomId);

						if (!room) {
							return <Redirect to={props.match.url} />;
						}

						const roomDevices = props.devices.filter((device) => device.room_id === routeProps.match.params.roomId),
							roomServices = props.services.filter((service) => roomDevices.find((device) => device.id === service.device_id));

						return (
							<NavigationScreen title={room.name} url={routeProps.match.url}>
								{!roomServices.length &&
									<BlankState
										heading="No Devices"
										body="Use a device’s settings to add it to this room." />}
								<ServiceCardGrid services={roomServices} />
							</NavigationScreen>
						);
					}} />
					<Route render={() => <Redirect to={props.match.url} />} />
				</Switch>}
		</NavigationScreen>
	);
};

RoomsScreen.propTypes = {
	devices: PropTypes.array.isRequired,
	services: PropTypes.array.isRequired,
	rooms: PropTypes.array.isRequired,
	isLoading: PropTypes.bool,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList, roomsList}) => ({
	devices: getDevices(devicesList),
	services: getServices(servicesList),
	rooms: getRooms(roomsList),
	isLoading: !hasInitialFetchCompleted(roomsList)
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(RoomsScreen);
