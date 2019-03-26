import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction, setServiceSettings} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import './AlarmCard.css';

export class GlobalAlarmCard extends React.Component {
	constructor (props) {
		super(props);

		this.handleSettingsChange = this.handleSettingsChange.bind(this);

		this.settings = {...props.service.settings};
		this.state = {
			slider_value: this.getPercentage100(props.service.settings.get('current_mode')),
			is_changing: false
		};
	}

	handleSettingsChange () {
		this.settings = {
			...this.settings
		};

		this.props.doAction(this.props.service.id, {
			property: 'mode',
			value: this.settings.current_mode
		});

		this.props.saveSettings(this.settings);
	}

	toggleMode () {
		if (this.settings.current_mode > 0) {
			this.settings.current_mode = 0;
		} else {
			this.settings.current_mode = 1;
		}

		this.handleSettingsChange();
	}

	onCardClick () {
		this.toggleMode();
	}

	handleInput (value) {
		this.settings.current_mode = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	handleChange (value) {
		this.settings.current_mode = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	getPercentage1 (value) {
		return Math.round(value) / 100;
	}

	getPercentage100 (value) {
		return Math.round(value * 100);
	}

	render () {
		const isConnected = true,
			currentMode = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.settings.current_mode);

		return (
			<ServiceCardBase
				name={this.settings.name || 'Global Alarm'}
				status={isConnected && Number.isFinite(currentMode)
					? currentMode + '%'
					: 'Unknown'}
				isConnected={true}
				onCardClick={this.toggleMode.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.settings.current_mode > 0}
						showLabels={true} />
					<div styleName="sliderWrapper" onClick={(event) => event.stopPropagation()}>
						<SliderControl
							value={currentMode}
							onInput={this.handleInput.bind(this)}
							onChange={this.handleChange.bind(this)} />
					</div>
				</div>
			</ServiceCardBase>
		);
	}
}

GlobalAlarmCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings.toObject()))
});

export default connect(null, null, mergeProps)(GlobalAlarmCard);
