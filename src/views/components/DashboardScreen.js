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
	return (
		<NavigationScreen title="Dashboard" url={props.match.urlWithoutOptionalParams} isContextRoot={true}>
			{!props.services.size &&
				<BlankState
					heading="No Devices"
					body="Use ‘Settings’ to add devices and they will show up here." />
			}
			<ServiceCardGrid services={props.services} />
		</NavigationScreen>
	);
};

DashboardScreen.propTypes = {
	services: PropTypes.object.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({servicesList}) => ({
	services: getServices(servicesList, false)
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(DashboardScreen);
