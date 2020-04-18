import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import ServiceDetails from './ServiceDetails.js';
import ThermostatServiceDetails from './ThermostatServiceDetails.js';
import Button from './Button.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export const ServiceDetailsScreen = (props) => {
	const service = props.service;

	if (!service) {
		return <Redirect to={props.match.parentMatch.url} />;
	}

	return (
		<NavigationScreen
			title={props.service.settings.get('name') || props.service.strings.get('friendly_type')}
			url={props.match.urlWithoutOptionalParams}
			toolbarActions={<Button to={props.match.url + ServiceDetails.settingsPath}>Settings</Button>}>
			{props.service.get('type') === 'thermostat' ? <ThermostatServiceDetails service={service} /> : ''}
			<ServiceDetails
				service={service}
				shouldShowRoomField={props.shouldShowRoomField} />
		</NavigationScreen>
	);
};

ServiceDetailsScreen.propTypes = {
	service: PropTypes.object,
	shouldShowRoomField: PropTypes.bool,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({servicesList}, {match}) => {
	const service = getServiceById(servicesList, match.params.serviceId, false);

	if (!service) {
		return {};
	}

	return {service};
};

export default compose(
	withRoute({params: '/:serviceId'}),
	connect(mapStateToProps)
)(ServiceDetailsScreen);
