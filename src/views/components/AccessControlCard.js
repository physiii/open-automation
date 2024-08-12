import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withRouter} from 'react-router-dom';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import styles from './AccessControlCard.css';

export class AccessControlCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			is_changing: false
		};
	}

	pulse () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'pulseLock',
			value: true
		});
	}

	render() {
		const isConnected = this.props.service.state.get('connected');

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'AccessControl'}
				status={this.props.service.state.get('connected')
					? 'Opened 5 minutes ago' : 'Unknown'}
				isConnected={isConnected}
				secondaryAction={<Button to={`${this.props.match.url}/device-log/${this.props.service.id}`}>Access Log</Button>}
				onCardClick={() => {}}
				{...this.props}>
				<div className={styles.container}>
					<div className={styles.switchWrapper}>
						<Button onClick={this.pulse.bind(this)}>
							Pulse
						</Button>
					</div>
				</div>
			</ServiceCardBase>
		);
	}
}

AccessControlCard.propTypes = {
	match: PropTypes.object,
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default compose(
	connect(null, null, mergeProps),
	withRouter
)(AccessControlCard);
