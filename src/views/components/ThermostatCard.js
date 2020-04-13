import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';
import {thermostatSetHoldTemp, thermostatSetMode, thermostatSetHold, thermostatFanOn, thermostatFanAuto} from '../../state/ducks/services-list/operations.js';
import './ThermostatCard.css';
import downCarrotIcon from '../icons/downCarrotIcon.js';

export class ThermostatCard extends React.Component {
	constructor (props) {
		super(props);

		let temp = this.props.service.state.get('current_temp') ? this.props.service.state.get('current_temp') : 0,
			targetTemp = this.props.service.state.get('target_temp') ? this.props.service.state.get('target_temp') : 0,
			fanMode = this.props.service.state.get('fan_mode') ? this.props.service.state.get('fan_mode') : 'off',
			mode = this.props.service.state.get('mode') ? this.props.service.state.get('mode') : 'off';

		this.state = {
			is_changing: false,
			temp,
			targetTemp,
			fanMode,
			mode
		};

		this.setState(this.state);
	}

	getTemp () {
		return (
			this.props.service.state.get('current_temp') ? this.props.service.state.get('current_temp') : 'Loading'
		);
	}

	getTargetTemp () {
		return (
			this.props.service.state.get('target_temp') ? this.props.service.state.get('target_temp') : 'Loading'
		);
	}

	getFanMode () {
		return (
			this.props.service.state.get('fan_mode') ? this.props.service.state.get('fan_mode') : 'Loading'
		);
	}

	getMode () {
		return (
			this.props.service.state.get('mode') ? this.props.service.state.get('mode') : 'Loading'
		);
	}

	isOutOfRange () {
		let mode = this.getMode(),
			temp = this.getTemp(),
			targetTemp = this.getTargetTemp();

			if (mode == 'cool' && temp <= targetTemp) {
				return true;
			}

			if (mode == 'heat' && temp >= targetTemp) {
				return true;
			}

			if (targetTemp == 0) {
				return true;
			}

			return false;
	}

render () {
	return (
		<ServiceCardBase
			name={this.props.service.settings.get('name') || 'Thermostat'}
			status={ 'Fan ' + this.getFanMode() }
			isConnected={this.props.service.state.get('connected')}
			{...this.props}>
			<center>
				<span styleName="sensorTitle">
					{this.getTemp()} &#8457;
				</span>
				<span styleName={this.getMode() == 'off' || this.isOutOfRange() ? 'hidden' : 'sensorValues'}>
					<span styleName="coolValue">
					{this.getMode() == 'cool' ? 'Cooling' : ''}
					</span>
					<span styleName="heatValue">
						{this.getMode() == 'heat' ? 'Heating' : ''}
					</span>
					<span styleName="sensorValue">
						&nbsp;to {this.getTargetTemp()}
					</span>
				</span>
			</center>
		</ServiceCardBase>
	);
};
}

ThermostatCard.propTypes = {
	service: PropTypes.object
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps
});

export default connect(null, null, mapDispatchToProps)(ThermostatCard);
