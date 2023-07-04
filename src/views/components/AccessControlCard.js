import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
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

	onCardClick () {
		this.setLevel(this.props.service.state.get('light_level') > 0 ? 0 : 1);
	}

	setLevel (value) {
		if (!this.props.service.state.get('connected')) {
			return;
		}

		this.props.doAction(this.props.service.id, {
			property: 'light_level',
			value
		});
	}

	pulse () {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'pulseLock',
			value: true
		});
	}

	render () {
		const isConnected = this.props.service.state.get('connected');

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'AccessControl'}
				status={this.props.service.state.get('connected')
					? 'Opened 5 minutes ago' : 'Unknown'}
				isConnected={isConnected}
				// secondaryAction={<Button to={`${this.props.match.url}/device-log/${this.props.service.id}`}>Device Log</Button>}
				onCardClick={this.pulse.bind(this)}
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

export default connect(null, null, mergeProps)(AccessControlCard);
