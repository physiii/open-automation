import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router-dom';
import ServiceCard from './ServiceCard.js';
import CameraRecordings from './CameraRecordings.js';
import {connect} from 'react-redux';
import {servicesWithoutGateways} from '../../state/ducks/services-list/selectors.js';
import {loadContext} from '../../state/ducks/navigation/operations.js';
import '../styles/layouts/_cardGrid.scss';

export class Dashboard extends React.Component {
	constructor (props) {
		super(props);

		// Side effects should be avoided in component constructors, but this
		// needs to be here because it must be called before rendering.
		this.props.navigationLoadContext();
	}

	render () {
		const cameraRecordingsBasePath = this.props.match.path + '/recordings',
			serviceCards = this.props.services.map((service) => <ServiceCard service={service} parentPath={this.props.match.path} />).filter(({props}) => ServiceCard.willRenderCard(props));

		return (
			<Switch>
				<Route exact path={this.props.match.path} render={() => (
					<div className="oa-l-cardGrid">
						{serviceCards.map((card, index) => (
							<div key={index} className="oa-l-cardGrid--card">{card}</div>
						))}
					</div>
				)} />
				<Route path={cameraRecordingsBasePath + '/:cameraId/:year?/:month?/:date?/:recordingId?'} render={(routeProps) => (
					<CameraRecordings {...routeProps} basePath={cameraRecordingsBasePath} parentPath={this.props.match.path} />
				)} />
			</Switch>
		);
	}
}

Dashboard.propTypes = {
	services: PropTypes.array,
	match: PropTypes.object,
	navigationLoadContext: PropTypes.func
};

const mapStateToProps = (state) => ({
		services: servicesWithoutGateways(state.servicesList).toJS()
	}),
	mapDispatchToProps = (dispatch) => ({
		navigationLoadContext: () => dispatch(loadContext('dashboard'))
	});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
