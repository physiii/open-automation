import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import ServiceCardBase from './ServiceCardBase.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import './AlarmCard.css';

export class AlarmCard extends React.Component {
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

		// this.props.saveSettings(this.settings);
	}

	toggleMode () {
		let mode;

		if (this.props.service.state.get('mode') > 0) {
			mode = 0;
		} else {
			mode = 1;
		}

		this.setMode(mode);
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

	setMode (value) {
		if (!this.props.service.state.get('connected')) {
			return;
		}

		this.props.doAction(this.props.service.id, {
			property: 'mode',
			value
		});
	}

	render () {
		const isConnected = this.props.service.state.get('connected'),
			currentMode = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.props.service.state.get('mode'));

		return (
			<ServiceCardBase
				name={this.settings.name || 'Alarm'}
				status={isConnected && Number.isFinite(currentMode)
					? currentMode + '%'
					: 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.toggleMode.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.props.service.state.get('mode') > 0}
						showLabels={true}
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

AlarmCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(AlarmCard);
