import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction, setServiceSettings} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import './ButtonCard.css';

export class ButtonCard extends React.Component {
	constructor (props) {
		super(props);

		this.handleSettingsChange = this.handleSettingsChange.bind(this);

		this.settings = {...props.service.settings};
		console.log('Loading settings...', this.settings);
		this.state = {
			slider_value: this.getPercentage100(props.service.settings.sensitivity),
			is_changing: false
		};
	}

	handleSettingsChange () {
		this.settings = {
			...this.settings
		};

		console.log('Saving settings...', this.settings);
		this.props.saveSettings(this.settings);
	}

	toggleMode () {
		if (this.settings.sensitivity > 0) {
			this.settings.sensitivity = 0;
		} else {
			this.settings.sensitivity = 1;
		}
		this.handleSettingsChange();
	}

	toggleSwitch () {
		// disabled to not interfer with onCardClick
		// this.toggleMode();
		// this.handleSettingsChange();
	}

	onCardClick () {
		this.toggleMode();
	}

	handleInput (value) {
		this.settings.sensitivity = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	handleChange (value) {
		this.settings.sensitivity = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	getPercentage1 (value) {
		return Math.round(value) / 100;
	}

	getPercentage100 (value) {
		return Math.round(value * 100);
	}

	render () {
		const isConnected = this.props.service.state.connected,
			currentMode = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.settings.sensitivity);

		return (
			<ServiceCardBase
				name={this.settings.name || 'Button'}
				status={isConnected && Number.isFinite(currentMode)
					? currentMode + '%'
					: 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.toggleMode.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.settings.sensitivity > 0}
						showLabels={true}
						onChange={this.toggleSwitch.bind(this)}
						disabled={!isConnected} />
					<div styleName="sliderWrapper" onClick={(event) => event.stopPropagation()}>
						<SliderControl
							value={currentMode}
							onInput={this.handleInput.bind(this)}
							onChange={this.handleChange.bind(this)}
							disabled={!isConnected} />
					</div>
				</div>
			</ServiceCardBase>
		);
	}
}

ButtonCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings))
});

export default connect(null, null, mergeProps)(ButtonCard);
