import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import ServiceCardGrid from './ServiceCardGrid.js';
import BlankState from './BlankState.js';
import {getServices} from '../../state/ducks/services-list/selectors.js';

export const DashboardScreen = (props) => {
	const dashboardServices = props.services.filter((service) => service.settings.show_on_dashboard === true);

	return (
		<NavigationScreen title="Dashboard" url={props.match.urlWithoutOptionalParams} isContextRoot={true}>
			{!props.services.length &&
				<BlankState
					heading="No Devices"
					body="Use ‘Settings’ to add devices and they will show up here." />
			}
			<ServiceCardGrid services={dashboardServices} />
		</NavigationScreen>
	);
};

DashboardScreen.propTypes = {
	services: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({servicesList}) => ({
	services: getServices(servicesList)
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(DashboardScreen);
