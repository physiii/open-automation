import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import Route from './Route.js';
import ServiceCard from './ServiceCard.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import ServiceLogScreen from './ServiceLogScreen.js';
import CameraRecordingsScreen from './CameraRecordingsScreen.js';
import Grid from '../layouts/Grid.js';
import GridColumn from '../layouts/GridColumn.js';

export const ServiceCardGrid = (props) => {
	const serviceCards = props.services
		.filter(ServiceCard.willCardRender)
		.toArray()
		.map(([, service]) => <ServiceCard service={service} />);

	return (
		<Switch>
			<Route exact path={props.match.path} render={() => (
				<Grid>
					{serviceCards.map((card, index) => (
						<GridColumn columns={4} key={index}>{card}</GridColumn>
					))}
				</Grid>
			)} />
			<ServiceDetailsScreen path={props.match.path + '/service'} shouldShowRoomField={true} />
			<ServiceLogScreen path={props.match.path + '/service-log'} />
			<CameraRecordingsScreen path={props.match.path + '/recordings'} />
			<Route render={() => <Redirect to={props.match.path} />} />
		</Switch>
	);
};

ServiceCardGrid.propTypes = {
	services: PropTypes.object.isRequired,
	match: PropTypes.object
};

export default withRouter(ServiceCardGrid);
