import React from 'react';
import PropTypes from 'prop-types';
import NavigationScreen from './NavigationScreen.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {getServiceById, getServiceLog, isServiceLogLoading} from '../../state/ducks/services-list/selectors.js';
import {fetchServiceLog} from '../../state/ducks/services-list/operations.js';
import './ServiceLogScreen.css';

export class ServiceLogScreen extends React.Component {
	componentDidMount () {
		this.props.fetchLog();
	}

	render () {
		const service = this.props.service;

		let error, content;

		if (!service) {
			error = 'There was a problem loading the logs.';
		} else if (!service.state.connected) {
			error = 'Device is not responding. Device must be reachable to view logs.';
		}

		if (this.props.isLoading) {
			content = <span>Loading</span>;
		} else {
			content = (
				<table styleName="table">
					<tr styleName="headerRow">
						<th styleName="headerCell">Date</th>
						<th styleName="headerCell">Description</th>
					</tr>
					{this.props.logs.map((item) => (
						<tr styleName="row">
							<td styleName="cell">{moment(item.date).format('M-D-YYYY h:mm a')}</td>
							<td styleName="cell">{item.description}</td>
						</tr>
					))}
				</table>
			);
		}

		return (
			<NavigationScreen path={this.props.match.url} title={((service ? service.settings.name : '') || (service ? service.strings.friendly_type : '')) + ' Log'}>
				{error
					? <p>{error}</p>
					: content}
			</NavigationScreen>
		);
	}
}

ServiceLogScreen.routeParams = '/:serviceId';

ServiceLogScreen.propTypes = {
	service: PropTypes.object,
	isLoading: PropTypes.bool,
	logs: PropTypes.array.isRequired,
	match: PropTypes.object.isRequired,
	fetchLog: PropTypes.func
};

ServiceLogScreen.defaultProps = {
	logs: [],
	fetchLog: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId);

		return {
			service,
			isLoading: isServiceLogLoading(servicesList, service && service.id),
			logs: getServiceLog(servicesList, service && service.id)
		};
	},
	mergeProps = ({service, ...stateProps}, {dispatch, ...dispatchProps}, ownProps) => {
		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			service,
			fetchLog: () => service && service.state.connected && dispatch(fetchServiceLog(service.id))
		};
	};

export default connect(mapStateToProps, null, mergeProps)(ServiceLogScreen);
