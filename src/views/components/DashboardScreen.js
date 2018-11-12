import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import ScreenRoute from './ScreenRoute.js';
import Grid from '../layouts/Grid.js';
import GridColumn from '../layouts/GridColumn.js';
import ServiceCard from './ServiceCard.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import ServiceLogScreen from './ServiceLogScreen.js';
import CameraRecordingsScreen from './CameraRecordingsScreen.js';
import {connect} from 'react-redux';
import {getServices} from '../../state/ducks/services-list/selectors.js';

export const Dashboard = (props) => {
	const serviceCards = props.services.filter(ServiceCard.willCardRender).map((service) => <ServiceCard service={service} />);

	return (
		<Switch>
			<Route exact path={props.match.path} render={() => (
				<Grid>
					{serviceCards.map((card, index) => (
						<GridColumn columns={4} key={index}>{card}</GridColumn>
					))}
				</Grid>
			)} />
			<ScreenRoute path={props.match.path + '/service' + ServiceDetailsScreen.routeParams} component={ServiceDetailsScreen} />
			<ScreenRoute path={props.match.path + '/service-log' + ServiceLogScreen.routeParams} component={ServiceLogScreen} />
			<ScreenRoute path={props.match.path + '/recordings' + CameraRecordingsScreen.routeParams} component={CameraRecordingsScreen} />
			<Route render={() => <Redirect to={props.match.path} />} />
		</Switch>
	);
};

Dashboard.propTypes = {
	services: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({servicesList}) => ({
	services: getServices(servicesList)
});

export default connect(mapStateToProps)(Dashboard);
