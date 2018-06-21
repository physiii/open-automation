import React from 'react';
import PropTypes from 'prop-types';
import {Route} from 'react-router-dom';
import ServiceCard from './ServiceCard.js';
import CameraRecordings from './CameraRecordings.js';
import {connect} from 'react-redux';
import {servicesWithoutGateways} from '../../state/ducks/services-list/selectors.js';
import '../styles/layouts/_cardGrid.scss';

export const Dashboard = (props) => {
	const cameraRecordingsBasePath = props.match.path + '/recordings';

	return (
		<div>
			<Route exact path={props.match.path} render={() => (
				<div className="oa-l-cardGrid">
					{props.services.map((service, index) => (
						<div key={index} className="oa-l-cardGrid--card">
							<ServiceCard service={service} parentPath={props.match.path} />
						</div>
					))}
				</div>
			)} />
			<Route path={cameraRecordingsBasePath + '/:cameraId/:year?/:month?/:date?/:recordingId?'} render={(routeProps) => (
				<CameraRecordings {...routeProps} basePath={cameraRecordingsBasePath} />
			)} />
		</div>
	);
};

Dashboard.propTypes = {
	services: PropTypes.oneOfType([
		PropTypes.array,
		PropTypes.object // TODO: Immutable List
	]),
	match: PropTypes.object
};

const mapStateToProps = (state) => ({
	services: servicesWithoutGateways(state.servicesList)
});

export default connect(mapStateToProps)(Dashboard);
