import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import Switch from './Switch.js';
import SliderControl from './SliderControl.js';
import ServiceCardBase from './ServiceCardBase.js';
import './LightCard.css';

export class LightCard extends React.Component {
	constructor (props) {
		super(props);

		this.onClick = this.handleClick.bind(this);

		this.state = {
			slider_value: this.getBrightness(),
			brightness: this.getBrightness(),
			power_on: this.getPower(),
			is_changing: false
		};
	}

	handleSliderInput (value) {
		this.setState({
			slider_value: value,
			is_changing: true
		});

		this.setLevel(value);
	}

	onCardClick () {
		// this.setLevel(this.props.service.state.get('brightness') > 0 ? 0 : 1);
	}

	setLevel (value) {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setBrightness',
			value
		});
	}

	setPower (value) {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setPower',
			value
		});
	}

	handleThemeOneSelect () {
		this.state.selected_theme = 1;
		this.setState(this.state);
		this.setTheme(this.state.selected_theme);
	}

	handleThemeTwoSelect () {
		this.state.selected_theme = 2;
		this.setState(this.state);
		this.setTheme(this.state.selected_theme);
	}

	handleThemeThreeSelect () {
		this.state.selected_theme = 3;
		this.setTheme(this.state.selected_theme);
	}

	handleThemeFourSelect () {
		this.state.selected_theme = 4;
		this.setTheme(this.state.selected_theme);
	}

	setTheme(theme) {
		this.props.doAction(this.props.service.id, {
			property: 'theme',
			value: theme - 1
		});
	}

	handleClick (event) {
		if (!this.props.service.state.get('connected')) return;

		this.state.power_on = event.target.checked;
		this.setState(this.state);

		this.setPower(this.state.power_on);
	}

	convertCelsiusToFahrenheit (temp) {
		return temp * 9 / 5 + 32;
	}

	currentLightLevel () {
		return this.props.service.state.get('brightness');
	}

	getAtmTemp () {
		if (this.props.service.state.get('atm_temp')) return this.props.service.state.get('atm_temp');

		return 'Unknown';
	}

	getHumidity () {
		if (this.props.service.state.get('humidity')) return this.props.service.state.get('humidity');

		return 'Unknown';
	}

	getBrightness () {
		if (this.props.service.state.get('brightness')) return this.props.service.state.get('brightness');

		return 'Unknown';
	}

	getTheme (num) {
		if (!this.props.service.state.get('themes')
			|| !this.props.service.state.get('themes')[num]) return;

		const theme = this.props.service.state.get('themes')[num]
				? this.props.service.state.get('themes')[num] : { r: 255, g: 255, b: 255},
			string = 'rgb(' + theme.r + ',' + theme.g + ',' + theme.b + ')';

		return string;
	}

	getThemes () {
		if (this.props.service.state.get('themes')) return this.props.service.state.get('themes');

		return 'Unknown';
	}

	getPower () {
		return this.props.service.state.get('power') ? true : false;
	}

	getBrightness () {
		return this.props.service.state.get('brightness') ? this.props.service.state.get('brightness') : false;
	}

	render () {
		const isConnected = this.props.service.state.get('connected'),
			currentLevel = this.state.slider_value,
			powerOn = this.state.power_on;

		return (
			<ServiceCardBase
				name={this.props.service.settings.get('name') || 'Light'}
				isConnected={isConnected}
				onCardClick={this.onCardClick.bind(this)}
				{...this.props}>
				<div styleName="switchWrapper">
					<Switch
						isOn={this.getPower()}
						onChange={this.onClick}
						showLabels={false}
						disabled={!isConnected} />
				</div>
				<span styleName="themeContainer">
					<div
						styleName="theme_1"
						style={{backgroundColor: this.getTheme(0)}}
						onClick={this.handleThemeOneSelect.bind(this)}
					/>
					<div
						styleName="theme_2"
						style={{backgroundColor: this.getTheme(1)}}
						onClick={this.handleThemeTwoSelect.bind(this)}
					/>
				</span>
				<span styleName="themeContainer">
					<div
						styleName="theme_3"
						style={{backgroundColor: this.getTheme(2)}}
						onClick={this.handleThemeThreeSelect.bind(this)}
					/>
					<div
						styleName="theme_4"
						style={{backgroundColor: this.getTheme(3)}}
						onClick={this.handleThemeFourSelect.bind(this)}
					/>
				</span>
				<div styleName="sliderWrapper">
					<SliderControl
						value={currentLevel}
						onInput={this.handleSliderInput.bind(this)}
						disabled={!isConnected} />
				</div>
			</ServiceCardBase>
		);
	}
}

LightCard.propTypes = {
	service: PropTypes.object,
	doAction: PropTypes.func
};

const mergeProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default connect(null, null, mergeProps)(LightCard);
