import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import Grid from '../layouts/Grid.js';
import GridColumn from '../layouts/GridColumn.js';
import ServiceCard from './ServiceCard.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import ServiceLogScreen from './ServiceLogScreen.js';
import CameraRecordingsScreen from './CameraRecordingsScreen.js';
import {connect} from 'react-redux';
import {getServices} from '../../state/ducks/services-list/selectors.js';
import {armServices} from '../../state/ducks/services-list/operations.js';
import Button from './Button.js';

export const Dashboard = (props) => {
	const serviceCards = props.services.filter(ServiceCard.willRenderCard).map((service) => <ServiceCard service={service} parentPath={props.match.path} history={props.history} />);

	return (
		<NavigationScreen isContextRoot={true} path={props.match.url} title="Dashboard" shouldShowTitle={false}>
			<Switch>
				<Route exact path={props.match.path} render={() => (
					<React.Fragment>
						<Button onClick={props.armServices(true)}>Arm Account Services</Button><br/>
						<Button onClick={props.armServices(false)}>Disarm Account Services</Button><br/>
						<Grid>
							{serviceCards.map((card, index) => (
								<GridColumn columns={4} key={index}>{card}</GridColumn>
							))}
						</Grid>
					</React.Fragment>
				)} />
				<Route path={props.match.path + '/service' + ServiceLogScreen.routeParams + '/log'} component={ServiceLogScreen} />
				<Route path={props.match.path + '/service' + ServiceDetailsScreen.routeParams} component={ServiceDetailsScreen} />
				<Route path={props.match.path + '/recordings' + CameraRecordingsScreen.routeParams} component={CameraRecordingsScreen} />
				<Route render={() => <Redirect to={props.match.path} />} />
			</Switch>
		</NavigationScreen>
	);
};

Dashboard.propTypes = {
	services: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
	armServices: PropTypes.func
};

const mapStateToProps = ({servicesList}) => ({
		services: getServices(servicesList)
	}),
	mapDispatchToProps = (dispatch) => {
		return {
			armServices: (data) => dispatch(armServices(data))
		};
	};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
