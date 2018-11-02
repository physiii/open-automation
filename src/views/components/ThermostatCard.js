import React from 'react';
import PropTypes from 'prop-types';
import ServiceCardBase from './ServiceCardBase.js';
import Button from './Button.js';
import {connect} from 'react-redux';
import {thermostatSetTemp, thermostatSetMode, thermostatSetHold, thermostatFanOn, thermostatFanAuto} from '../../state/ducks/services-list/operations.js';

export const ThermostatCard = (props) => {
	const currentMode = props.service.state.mode,
		currentTemp = props.service.state.current_temp,
		targetTemp = props.service.state.target_temp,
		fanMode = props.service.state.fan_mode,
		holdMode = props.service.state.hold_mode,
		toggleMode = () => {
			if (currentMode === 'off') {
				props.setMode(props.service.id, 'cool');
			} else if (currentMode === 'cool') {
				props.setMode(props.service.id, 'heat');
			} else if (currentMode === 'heat') {
				props.setMode(props.service.id, 'auto');
			} else if (currentMode === 'auto') {
				props.setMode(props.service.id, 'off');
			} else {
				console.log('Mode is not defined as off, heat, cool, auto...');
			}
		},
		toggleFan = () => {
			if (fanMode === 'on') {
				props.fanAuto(props.service.id);
			} else if (fanMode === 'auto') {
				props.fanOn(props.service.id);
			} else {
				console.log('Fan is not defined as on or auto...');
			}
		},
		toggleHold = () => {
			if (holdMode === 'off') {
				props.setHold(props.service.id, 'on');
			} else {
				props.setHold(props.service.id, 'off');
			}
		},
		tempUp = () => {
			props.setTemp(props.service.id, targetTemp + 1);
		},
		tempDown = () => {
			props.setTemp(props.service.id, targetTemp - 1);
		};

	return (
		<ServiceCardBase
			name={props.service.settings.name || 'Thermostat'}
			status={'Thermostat mode: ' + currentMode + ' ||| Current Temp: ' + currentTemp + ' ||| Target Temp: ' + targetTemp + ' ||| Fan mode: ' + fanMode + ' ||| Hold Mode: ' + holdMode}
			isConnected={props.service.state.connected}
			{...props}>
			<center>
				<Button onClick={toggleMode}>{'Thermostat Mode => ' + props.service.state.mode}</Button>
				<br />
				<Button onClick={tempUp}>{'Temp Up'}</Button>
				<br />
				<Button onClick={tempDown}>{'Temp down'}</Button>
				<br />
				<Button onClick={toggleFan}>{'Fan Mode => ' + props.service.state.fan_mode}</Button>
				<br />
				<Button onClick={toggleHold}>{'Hold Mode => ' + props.service.state.hold_mode}</Button>
			</center>
		</ServiceCardBase>
	);
};

ThermostatCard.propTypes = {
	service: PropTypes.object,
	setTemp: PropTypes.func,
	setHold: PropTypes.func,
	fanOn: PropTypes.func,
	fanAuto: PropTypes.func,
	setMode: PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
	return {
		setTemp: (serviceId, temp) => dispatch(thermostatSetTemp(serviceId, temp)),
		setHold: (serviceId, mode) => dispatch(thermostatSetHold(serviceId, mode)),
		fanOn: (serviceId) => dispatch(thermostatFanOn(serviceId)),
		fanAuto: (serviceId) => dispatch(thermostatFanAuto(serviceId)),
		setMode: (serviceId, mode) => dispatch(thermostatSetMode(serviceId, mode))
	};
};

export default connect(null, mapDispatchToProps)(ThermostatCard);
