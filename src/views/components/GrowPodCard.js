import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import styles from './GrowPodCard.css';

export class GrowPodCard extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			is_changing: false
		};
	}

	onCardClick () {
		this.setLevel(this.props.service.state.get('light_level') > 0 ? 0 : 1);
	}

	getPercentage1 (value) {
		return Math.round(value) / 100;
	}

	getPercentage100 (value) {
		return Math.round(value * 100);
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

	minTwoDigits (number) {
		return (number < 10 ? '0' : '') + number;
	}

	getAtmTemp () {
		if (this.props.service.state.get('atm_temp')) return this.props.service.state.get('atm_temp');

		return 'Unknown';
	}

	getHumidity () {
		if (this.props.service.state.get('humidity')) return this.props.service.state.get('humidity');

		return 'Unknown';
	}

	getWaterTemp () {
		if (this.props.service.state.get('water_temp')) return this.props.service.state.get('water_temp');

		return 'Unknown';
	}

	getWaterEc () {
		if (this.props.service.state.get('ec')) return this.props.service.state.get('ec');

		return 'Unknown';
	}

	getWaterPh () {
		if (this.props.service.state.get('ph')) return this.props.service.state.get('ph');

		return 'Unknown';
	}

	render () {
		const isConnected = this.props.service.state.get('connected');

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'GrowPod'}
				status={this.props.service.state.get('connected')
					? Math.trunc(this.props.service.state.get('cycletime') / 604800) + 'w ' +
						Math.trunc((this.props.service.state.get('cycletime') % 604800) / 86400) + 'd ' +
						this.minTwoDigits(Math.trunc((this.props.service.state.get('cycletime') % 86400) / 3600)) + ':' +
						this.minTwoDigits(Math.trunc((this.props.service.state.get('cycletime') % 3600) / 60)) + ':' +
						this.minTwoDigits(this.props.service.state.get('cycletime') % 60)
					:	'Unknown'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div className={styles.container}>
					<section className={styles.sensorPanelA}>
						<span className={styles.sensorTitle}>
							Atmosphere
						</span>
						<br />
						<span className={styles.sensorValues}>
							<span className={styles.sensorValue}>
								{this.getAtmTemp()} &#8457;
							</span>
							<span className={styles.sensorValue}>
								{this.getHumidity()} RH
							</span>
						</span>
					</section>
					<section className={styles.sensorPanelB}>
						<span className={styles.sensorTitle}>
							Water
						</span>
						<br />
						<span className={styles.sensorValues}>
							<span className={styles.sensorValue}>
								{this.getWaterTemp()} &#8457;
							</span>
							<span className={styles.sensorValue}>
								{this.getWaterPh()} pH
							</span>
							<span className={styles.sensorValue}>
								{this.getWaterEc()} uS/cm
							</span>
						</span>
					</section>
				</div>
			</ServiceCardBase>
		);
	}
}

GrowPodCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(GrowPodCard);
