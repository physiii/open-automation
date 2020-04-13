import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRoute} from './Route.js';
import {thermostatSetHoldTemp, thermostatSetMode, thermostatSetHold, thermostatFanOn, thermostatFanAuto} from '../../state/ducks/services-list/operations.js';
import Toggle from './Switch.js';
import {Route} from './Route.js';
import Button from './Button.js';
import Form from './Form.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceHeader from './ServiceHeader.js';
import DeviceRoomField from './DeviceRoomField.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import './ServiceDetails.css';

export class ThermostatServiceDetails extends React.Component {

	constructor (props) {
		super(props);

		console.log('!!! hold_mode !!! ', props.service.state.get('hold_mode'));
		const mode = props.service.state.get('mode') ? props.service.state.get('mode') : 'off',
			isPowerOn = props.service.state.get('mode') == 'off' ? false : true,
			isHoldOn = props.service.state.get('hold_mode') == 'on' ? true : false,
			temp = props.service.state.get('current_temp') ? props.service.state.get('current_temp') : 0,
			targetTemp = props.service.state.get('target_temp') ? props.service.state.get('target_temp') : 0,
			holdTemp = props.service.state.get('hold_temp') ? props.service.state.get('hold_temp') : {min: 0, max: 0},
			schedule = props.service.state.get('schedule') ? props.service.state.get('schedule') : {},
			tempValues = this.props.service.state.get('temp_values') ? this.props.service.state.get('temp_values') : [],
			hours = this.props.service.state.get('hours') ? this.props.service.state.get('hours') : [];

		this.state = {
			is_changing: false,
			shouldShowSchedule: false,
			isPowerOn,
			isHoldOn,
			temp,
			targetTemp,
			mode,
			holdTemp,
			schedule,
			tempValues,
			hours
		};

		console.log('ThermostatServiceDetails', props.service.state);
		this.setState(this.state);
	}

	showSchedule () {
		this.state.shouldShowSchedule = true;
		this.setState({shouldShowSchedule: true});
	}

	toggleHold () {
		this.state.isHoldOn = !this.state.isHoldOn;
		this.setState({isHoldOn: this.state.isHoldOn});
		this.props.setHold(this.props.service.id, this.state.isHoldOn ? 'on' : 'off');
	}

	togglePower () {
		let onMode = this.state.temp >= this.state.targetTemp ? 'cool' : 'heat';
		this.state.isPowerOn = !this.state.isPowerOn;
		this.setState({isPowerOn: this.state.isPowerOn});
		this.props.setMode(this.props.service.id, this.state.isPowerOn ? onMode : 'off');
	}

	setHoldTemp (data) {

		console.log('!! setHoldTemp !!', this.state);
		if (data.maxTemp) this.state.holdTemp.max = data.maxTemp;
		if (data.minTemp) this.state.holdTemp.min = data.minTemp;

		this.setState({holdTemp: this.state.holdTemp});
		this.props.setHoldTemp(this.props.service.id, this.state.holdTemp);
	}

	setScheduleHour (data) {
		console.log('!! setScheduleHour !!', data);
	}

	setScheduleMinTemp (data) {
		console.log('!! setScheduleMinTemp !!', data);
	}

	setScheduleMaxTemp (data) {
		console.log('!! setScheduleMaxTemp !!', data);
	}

	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<SettingsScreenContainer section={true}>
						<span styleName="field">
							<label styleName="label">Power</label>
							<Toggle
									isOn={this.state.isPowerOn}
									onClick={this.togglePower.bind(this)}
									showLabels={true}
									disabled={false} />
						</span>

						{!this.state.isPowerOn
							? <div styleName="field">Thermostat is currently powered off.</div> :
						<div>
						<span styleName="field">
							<label styleName="label">Hold</label>
							<Toggle
									isOn={this.state.isHoldOn}
									showLabels={true}
									onClick={this.toggleHold.bind(this)}
									disabled={false} />
						</span>

						<span styleName={this.state.isHoldOn ? 'sensorValues' : 'hidden'}>
							<Form
								onSaveableChange={this.setHoldTemp.bind(this)}
								fields={{minTemp: {
									type: 'one-of',
									label: 'Minimum',
									value_options: this.state.tempValues.map((temp) => ({
										value: temp.value,
										label: temp.id
									}))
								}}}
								values={{minTemp: this.state.holdTemp.min}}
								disabled={false} />
							<Form
								fields={{maxTemp: {
									type: 'one-of',
									label: 'Maximum',
									value_options: this.state.tempValues.map((temp) => ({
										value: temp.value,
										label: temp.name
									}))
								}}}
								onSaveableChange={this.setHoldTemp.bind(this)}
								values={{maxTemp: this.state.holdTemp.max}}
								disabled={false} />
						</span>

						<span styleName="divider" />

						<span styleName={this.state.isHoldOn ? 'field' : 'hidden'}>
							Schedule is not active because hold is on.
						</span>

						<div styleName={!this.state.isHoldOn  ? '' : 'hidden'}>
							<span styleName='scheduleTitle'>
								Schedule
							</span>
							<span styleName='sensorValues'>
								<Form
									fields={{room: {
										type: 'one-of',
										label: 'Hour',
										value_options: this.state.hours.map((hour) => ({
											value: hour.value,
											label: hour.label
										}))
									}}}
									values={{room: '1 AM'}}
									disabled={false} />
							</span>
							<span styleName='sensorValues'>
								<Form
									fields={{room: {
										type: 'one-of',
										label: 'Minimum',
										value_options: this.state.tempValues.map((temp) => ({
											value: temp.value,
											label: temp.id
										}))
									}}}
									values={{room: '65'}}
									disabled={false} />
								<Form
									fields={{room: {
										type: 'one-of',
										label: 'Maximum',
										value_options: this.state.tempValues.map((temp) => ({
											value: temp.value,
											label: temp.name
										}))
									}}}
									values={{room: '72'}}
									disabled={false} />
							</span>
						</div>
						</div>
						}
					</SettingsScreenContainer>
				)} />
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + ThermostatServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

ThermostatServiceDetails.settingsPath = '/service-settings';

ThermostatServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	setHoldTemp: PropTypes.func,
	setHold: PropTypes.func,
	fanOn: PropTypes.func,
	fanAuto: PropTypes.func,
	setMode: PropTypes.func,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	serviceType: PropTypes.string,
	match: PropTypes.object
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	setHoldTemp: (serviceId, temp) => dispatch(thermostatSetHoldTemp(serviceId, temp)),
	setHold: (serviceId, mode) => dispatch(thermostatSetHold(serviceId, mode)),
	fanOn: (serviceId) => dispatch(thermostatFanOn(serviceId)),
	fanAuto: (serviceId) => dispatch(thermostatFanAuto(serviceId)),
	setMode: (serviceId, mode) => dispatch(thermostatSetMode(serviceId, mode))
});

export default compose(
	connect(null, null, mapDispatchToProps),
	withRouter
)(ThermostatServiceDetails);
