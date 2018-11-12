import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import ScreenRoute from './ScreenRoute.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import DeviceDetailsScreen from './DeviceDetailsScreen.js';
import {connect} from 'react-redux';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class DevicesListScreen extends React.Component {
	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.path} render={() => (
					<List>
						{this.props.devices.map((device) => {
							const firstService = device.services[0],
								additionalServicesCount = device.services.length - 1,
								additionalServicesNoun = 'feature' + (additionalServicesCount > 1 ? 's' : '');

							return {
								key: device.id,
								icon: firstService && <ServiceIcon service={firstService} size={24} shouldRenderBlank={true} />,
								label: device.settings.name || 'Device',
								secondaryText: firstService && (firstService.settings.name || firstService.type) +
									(additionalServicesCount > 0
										? ' and ' + additionalServicesCount + ' other ' + additionalServicesNoun
										: ''),
								link: this.props.match.url + '/' + device.id
							};
						})}
					</List>
				)} />
				<ScreenRoute path={this.props.match.path + DeviceDetailsScreen.routeParams} component={DeviceDetailsScreen} />
				<Route render={() => <Redirect to={this.props.match.path} />} />
			</Switch>
		);
	}
}

DevicesListScreen.propTypes = {
	devices: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList}) => ({
	devices: getDevices(devicesList).map((device) => ({
		...device,
		services: device.services.map(({id}) => getServiceById(servicesList, id))
	}))
});

export default connect(mapStateToProps)(DevicesListScreen);
