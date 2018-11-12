import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import ServiceDetails from './ServiceDetails.js';
import List from './List.js';
import {connect} from 'react-redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

export class ServiceDetailsScreen extends React.Component {
	componentDidMount () {
		this.updateNavigation();
	}

	componentDidUpdate () {
		this.updateNavigation();
	}

	updateNavigation () {
		this.props.setScreenTitle(this.props.service.settings.name || this.props.service.strings.friendly_type);
	}

	render () {
		const service = this.props.service;

		if (!service) {
			return <Redirect to={this.props.baseUrl} />;
		}

		return (
			<React.Fragment>
				{!service.state.connected && (
					<List>
						{[
							{
								label: 'Device is not responding',
								secondaryText: 'Device must be reachable to update settings.'
							}
						]}
					</List>
				)}
				<ServiceDetails serviceId={service.id} />
			</React.Fragment>
		);
	}
}

ServiceDetailsScreen.routeParams = '/:serviceId';

ServiceDetailsScreen.propTypes = {
	service: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string,
	setScreenTitle: PropTypes.func
};

ServiceDetailsScreen.defaultProps = {
	setScreenTitle: () => { /* no-op */ }
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
