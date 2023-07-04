import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import moment from 'moment';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById, getDeviceLog, isServiceLogLoading} from '../../state/ducks/services-list/selectors.js';
import {fetchDeviceLog} from '../../state/ducks/services-list/operations.js';
import styles from './ServiceLogScreen.css';

export class ServiceLogScreen extends React.Component {
	componentDidMount () {
		this.props.fetchLog();
	}

	render () {
		const service = this.props.service;

		let error, content;

		if (!service) {
			error = 'There was a problem loading the logs.';
		}

		if (this.props.isLoading) {
			content = <span>Loading</span>;
		} else {
			content = (
				<table className={styles.table}>
					<tr className={styles.headerRow}>
						<th className={styles.headerCell}>Date</th>
						<th className={styles.headerCell}>Description</th>
					</tr>
					{this.props.logs.map((item) => (
						<tr className={styles.row}>
							<td className={styles.cell}>{moment(item.date).format('M-D-YYYY h:mm a')}</td>
							<td className={styles.cell}>{item.description}</td>
						</tr>
					))}
				</table>
			);
		}

		return (
			<NavigationScreen
				title={((service ? service.settings.get('name') : '') || (service ? service.strings.get('friendly_type') : '')) + ' Log'}
				url={this.props.match.urlWithoutOptionalParams}>
				{error
					? <p>{error}</p>
					: content}
			</NavigationScreen>
		);
	}
}

ServiceLogScreen.propTypes = {
	service: PropTypes.object,
	isLoading: PropTypes.bool,
	match: PropTypes.object,
	logs: PropTypes.array.isRequired,
	fetchLog: PropTypes.func
};

ServiceLogScreen.defaultProps = {
	logs: [],
	fetchLog: () => { /* no-op */ }
};

const mapStateToProps = ({servicesList}, {match}) => {
		const service = getServiceById(servicesList, match.params.serviceId, false);

		return {
			service,
			isLoading: isServiceLogLoading(servicesList, service && service.id),
			logs: getDeviceLog(servicesList, service && service.id)
		};
	},
	mergeProps = ({service, ...stateProps}, {dispatch, ...dispatchProps}, ownProps) => {
		return {
			...ownProps,
			...stateProps,
			...dispatchProps,
			service,
			fetchLog: () => service && dispatch(fetchDeviceLog(service.id))
		};
	};

export default compose(
	withRoute({params: '/:serviceId'}),
	connect(mapStateToProps, null, mergeProps)
)(ServiceLogScreen);
