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

		this.state = {
			slider_value: this.getPercentage100(props.service.settings.get('current_level')),
			is_changing: false
		};
	}

	onCardClick () {
		this.setLevel(this.props.service.settings.get('current_level') > 0 ? 0 : 1);
	}

	handleSliderInput (value) {
		this.setState({
			slider_value: value,
			is_changing: true
		});
	}

	handleSliderChange (value) {
		this.setState({
			slider_value: value,
			is_changing: false
		});

		this.setLevel(this.getPercentage1(value));
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
			property: 'level',
			value
		});

		// Workaround for state bug
		this.props.saveSettings({
			...this.props.service.settings.toObject(),
			current_level: value
		});
	}

	render () {
		const isConnected = this.props.service.state.get('connected'),
			currentLevel = this.state.is_changing
				? this.state.slider_value
				: this.getPercentage100(this.props.service.settings.get('current_level'));

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Dimmer'}
				status={isConnected && Number.isFinite(currentLevel)
					? currentLevel + '%'
					: 'Unknown'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="container">
					<Switch
						isOn={this.props.service.settings.get('current_level') > 0}
						showLabels={true}
						disabled={!isConnected} />
					<div styleName="sliderWrapper" onClick={(event) => event.stopPropagation()}>
						<SliderControl
							value={currentLevel}
							onInput={this.handleSliderInput.bind(this)}
							onChange={this.handleSliderChange.bind(this)}
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
	saveSettings: (settings) => dispatch(setServiceSettings(ownProps.service.id, settings, ownProps.service.settings.toObject()))
});

export default connect(null, null, mergeProps)(DimmerCard);
