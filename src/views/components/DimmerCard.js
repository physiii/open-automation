import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction, setServiceSettings} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import './DimmerCard.css';

export class DimmerCard extends React.Component {
	constructor (props) {
		super(props);

		this.handleSettingsChange = this.handleSettingsChange.bind(this);

		this.settings = {...props.service.settings};
		console.log('Loading settings...', this.settings);
		this.state = {
			slider_value: this.getPercentage100(props.service.settings.current_level),
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

	toggleLevel () {
		if (this.settings.current_level > 0) {
			this.settings.current_level = 0;
		} else {
			this.settings.current_level = 1;
		}
		this.handleSettingsChange();
	}

	toggleSwitch () {
		// disabled to not interfer with onCardClick
		// this.toggleLevel();
		// this.handleSettingsChange();
	}

	onCardClick () {
		this.toggleLevel();
	}

	handleInput (value) {
		this.settings.current_level = this.getPercentage1(value);
		this.handleSettingsChange();
	}

	handleChange (value) {
		this.settings.current_level = this.getPercentage1(value);
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
			currentLevel = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.settings.current_level);

		return (
			<ServiceCardBase
				name={this.settings.name || 'Dimmer'}
				status={isConnected && Number.isFinite(currentLevel)
					? currentLevel + '%'
					: 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.toggleLevel.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.settings.current_level > 0}
						showLabels={true}
						onChange={this.toggleSwitch.bind(this)}
						disabled={!isConnected} />
					<div styleName="sliderWrapper" onClick={(event) => event.stopPropagation()}>
						<SliderControl
							value={currentLevel}
							onInput={this.handleInput.bind(this)}
							onChange={this.handleChange.bind(this)}
							disabled={!isConnected} />
					</div>
				</div>
			</ServiceCardBase>
		);
	}
}

DimmerCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action)),
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings))
});

export default connect(null, null, mergeProps)(DimmerCard);
