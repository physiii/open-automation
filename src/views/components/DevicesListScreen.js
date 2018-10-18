import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import DeviceDetailsScreen from './DeviceDetailsScreen.js';
import {connect} from 'react-redux';
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class DevicesListScreen extends React.Component {
	render () {
		return (
			<NavigationScreen path={this.props.basePath} title="Devices">
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<List items={this.props.devices.map((device) => {
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
						})} />
					)} />
					<Route path={this.props.match.path + DeviceDetailsScreen.routeParams} component={DeviceDetailsScreen} />
					<Route render={() => <Redirect to={this.props.match.path} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

DevicesListScreen.propTypes = {
	devices: PropTypes.array.isRequired,
	basePath: PropTypes.string.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList}) => ({
		devices: getDevices(devicesList).map((device) => ({
			...device,
			services: device.services.map(({id}) => getServiceById(servicesList, id))
		}))
	}),
	mergeProps = (stateProps, dispatchProps, ownProps) => ({
		...ownProps,
		...stateProps,
		...dispatchProps,
		basePath: ownProps.match.path.replace(DeviceDetailsScreen.routeParams, '')
	});

export default connect(mapStateToProps, null, mergeProps)(DevicesListScreen);
