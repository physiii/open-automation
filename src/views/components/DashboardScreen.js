import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import Grid from '../layouts/Grid.js';
import GridColumn from '../layouts/GridColumn.js';
import ServiceCard from './ServiceCard.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import CameraRecordingsScreen from './CameraRecordingsScreen.js';
import {connect} from 'react-redux';
import {getServices} from '../../state/ducks/services-list/selectors.js';

export const Dashboard = (props) => {
	const serviceCards = props.services.filter(ServiceCard.willRenderCard).map((service) => <ServiceCard service={service} parentPath={props.match.path} />);

	return (
		<NavigationScreen isContextRoot={true} path={props.match.url} title="Dashboard" shouldShowTitle={false}>
			<Switch>
				<Route exact path={props.match.path} render={() => (
					<Grid>
						{serviceCards.map((card, index) => (
							<GridColumn columns={4} key={index}>{card}</GridColumn>
						))}
					</Grid>
				)} />
				<Route path={props.match.path + '/service' + ServiceDetailsScreen.routeParams} component={ServiceDetailsScreen} />
				<Route path={props.match.path + '/recordings' + CameraRecordingsScreen.routeParams} component={CameraRecordingsScreen} />
				<Route render={() => <Redirect to={props.match.path} />} />
			</Switch>
		</NavigationScreen>
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
