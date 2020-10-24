import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import {connect} from 'react-redux';
import './ThermostatCard.css';

export class ThermostatCard extends React.Component {
	constructor (props) {
		super(props);

		const temp = this.props.service.state.get('current_temp') ? this.props.service.state.get('current_temp') : 0,
			targetTemp = this.props.service.state.get('target_temp') ? this.props.service.state.get('target_temp') : 0,
			fanMode = this.props.service.state.get('fan_mode') ? this.props.service.state.get('fan_mode') : 'off',
			schedule = this.props.service.state.get('schedule') ? this.props.service.state.get('schedule') : {},
			isPowerOn = this.props.service.state.get('power') ? this.props.service.state.get('power') : false,
			isHoldOn = this.props.service.state.get('hold_mode') === 'on',
			currentHour = this.props.service.state.get('current_hour') ? this.props.service.state.get('current_hour') : 0,
			mode = this.props.service.state.get('mode') ? this.props.service.state.get('mode') : 'off';

		this.state = {
			is_changing: false,
			temp,
			targetTemp,
			fanMode,
			isPowerOn,
			isHoldOn,
			schedule,
			currentHour,
			mode
		};
	}

	getTemp () {
		return (
			this.props.service.state.get('current_temp') ? this.props.service.state.get('current_temp') : '...'
		);
	}

	getTargetTemp () {
		return (
			this.props.service.state.get('target_temp') ? this.props.service.state.get('target_temp') : '...'
		);
	}

	getFanMode () {
		return (
			this.props.service.state.get('fan_mode') ? this.props.service.state.get('fan_mode') : '...'
		);
	}

	getMode () {
		return (
			this.props.service.state.get('mode') ? this.props.service.state.get('mode') : '...'
		);
	}

	getHoldMode () {
		return (
			this.props.service.state.get('hold_mode') ? this.props.service.state.get('hold_mode') : '...'
		);
	}

	getHoldTemp () {

		return (
			this.props.service.state.get('hold_temp') ? this.props.service.state.get('hold_temp') : {min: 0, max: 0}
		);
	}

	getHoldTempMin () {
		return (
			this.props.service.state.get('hold_temp') ? this.props.service.state.get('hold_temp') : {min: 0, max: 0}
		);
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
					<span styleName="sensorTitle">
						{this.getTemp()} &#8457;
					</span>
					<span styleName={this.getMode() === 'off' || this.isOutOfRange() ? 'hidden' : 'sensorValues'}>
						<span styleName="coolValue">
							{this.getMode() === 'cool' ? 'Cooling' : ''}
						</span>
						<span styleName="heatValue">
							{this.getMode() === 'heat' ? 'Heating' : ''}
						</span>
						<span styleName="sensorValue">
							&nbsp;to {this.getTargetTemp()}
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
