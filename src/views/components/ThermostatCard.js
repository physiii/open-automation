import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import {connect} from 'react-redux';
import styles from './ThermostatCard.css';

const toFahrenheit = (celsius) => (celsius * 9/5 + 32).toFixed(1);

export class ThermostatCard extends React.Component {
	constructor (props) {
		super(props);

		const state = this.props.service.state;
		
		this.state = {
			is_changing: false,
			temp: state.get('currentTemp') ? toFahrenheit(state.get('currentTemp')) : 0,
			targetTemp: state.get('target_temp') ? toFahrenheit(state.get('target_temp')) : 0,
			fanMode: state.get('fan_mode') ? state.get('fan_mode') : 'off',
			isPowerOn: state.get('power') ? state.get('power') : false,
			isHoldOn: state.get('hold_mode') === 'on',
			schedule: state.get('schedule') ? state.get('schedule') : {},
			currentHour: state.get('current_hour') ? state.get('current_hour') : 0,
			mode: state.get('mode') ? state.get('mode') : 'off',
			setpointCool: state.get('setpointCool') ? toFahrenheit(state.get('setpointCool')) : 0,
			setpointHeat: state.get('setpointHeat') ? toFahrenheit(state.get('setpointHeat')) : 0,
			currentHumidity: state.get('currentHumidity') ? state.get('currentHumidity') : 0,
			coolingEnabled: state.get('coolingEnabled') ? state.get('coolingEnabled') : false,
			heatingEnabled: state.get('heatingEnabled') ? state.get('heatingEnabled') : false,
			enableThermostat: state.get('enableThermostat') ? state.get('enableThermostat') : false,
			y1: state.get('y1') ? state.get('y1') : false,
			y2: state.get('y2') ? state.get('y2') : false,
			w1: state.get('w1') ? state.get('w1') : false,
			w2: state.get('w2') ? state.get('w2') : false,
			aux1: state.get('aux1') ? state.get('aux1') : false,
			aux2: state.get('aux2') ? state.get('aux2') : false,
		};

		console.log("currentTemp", this.props.service.state.get('currentTemp'));
	}

	getTemp () {
		return (
			this.props.service.state.get('currentTemp') ? toFahrenheit(this.props.service.state.get('currentTemp')) : '...'
		);
	}

	getTargetTemp () {
		const mode = this.getMode();
		return mode === 'cool' ? this.state.setpointCool : mode === 'heat' ? this.state.setpointHeat : '...';
	}

	getMode () {
		if (this.state.y1 || this.state.y2) {
			return 'cool';
		} else if (this.state.w1 || this.state.w2) {
			return 'heat';
		} else {
			return 'off';
		}
	}

	getStatus () {
		if (!this.state.isPowerOn) {
			return 'Off';
		}

		return (
			this.state.isHoldOn
				? 'Hold ' + this.getHoldTemp().min + ' - ' + this.getHoldTemp().max
				: 'Schedule ' + this.state.schedule[this.state.currentHour].minTemp + ' - ' + this.state.schedule[this.state.currentHour].maxTemp
		);
	}

	isOutOfRange () {
		const mode = this.getMode(),
			temp = this.getTemp(),
			targetTemp = this.getTargetTemp();

		if (mode === 'cool' && temp <= targetTemp) {
			return true;
		}

		if (mode === 'heat' && temp >= targetTemp) {
			return true;
		}

		if (targetTemp === 0) {
			return true;
		}

		return false;
	}

	render () {
		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Thermostat'}
				status={ this.getStatus() }
				isConnected={this.props.service.state.get('connected')}
				{...this.props}>
				<center>
					<span className={styles.sensorTitle}>
						{this.getTemp()} &#8457;
					</span>
					<span className={this.getMode() === styles.off || this.isOutOfRange() ? styles.hidden : styles.sensorValues}>
						<span className={styles.coolValue}>
							{this.getMode() === 'cool' ? 'Cooling' : ''}
						</span>
						<span className={styles.heatValue}>
							{this.getMode() === 'heat' ? 'Heating' : ''}
						</span>
						<span className={styles.sensorValue}>
						&nbsp;{this.getMode() === 'off' ? '' : 'to ' + this.getTargetTemp()}
						</span>
					</span>
				</center>
			</ServiceCardBase>
		);
	}
}

ThermostatCard.propTypes = {
	service: PropTypes.object
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...dispatch,
	...ownProps,
	...stateProps
});

export default connect(null, null, mapDispatchToProps)(ThermostatCard);
