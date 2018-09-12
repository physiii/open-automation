import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import ServiceDetails from './ServiceDetails.js';
import List from './List.js';
import {connect} from 'react-redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class ServiceDetailsScreen extends React.Component {
	render () {
		const service = this.props.service;

		if (!service) {
			return <Redirect to={this.props.baseUrl} />;
		}

		return (
			<NavigationScreen path={this.props.match.url} title={service.settings.name || service.strings.friendly_type}>
				{!service.state.connected && (
					<List items={[
						{
							label: 'Device is not responding',
							secondaryText: 'Device must be reachable to update settings.'
						}
					]} />
				)}
				<ServiceDetails serviceId={service.id} />
			</NavigationScreen>
		);
	}
}

ServiceDetailsScreen.routeParams = '/:serviceId';

ServiceDetailsScreen.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string
};

const mapStateToProps = ({servicesList}, {match}) => {
	const service = getServiceById(servicesList, match.params.serviceId),
		urlParts = match.url.split('/');

	if (!service) {
		// Remove the service ID from the URL.
		urlParts.pop();

		return {baseUrl: urlParts.join('/')};
	}

	return {service};
};

export default connect(mapStateToProps)(ServiceDetailsScreen);
