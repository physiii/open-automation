import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {ChromePicker} from 'react-color';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
// import Toggle from './Switch.js';
import {Route} from './Route.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import './LightServiceDetails.css';

export class LightServiceDetails extends React.Component {

	constructor (props) {
		super(props);

		// const brightness = props.service.state.get('brightness') ? props.service.state.get('brightness') : 50,
		// 	isPowerOn = props.service.state.get('power') ? props.service.state.get('power') : false;
		// 	isHoldOn = props.service.state.get('hold_mode') === 'on',
		// 	temp = props.service.state.get('current_temp') ? props.service.state.get('current_temp') : 0,
		// 	targetTemp = props.service.state.get('target_temp') ? props.service.state.get('target_temp') : 0,
		// 	holdTemp = props.service.state.get('hold_temp') ? props.service.state.get('hold_temp') : {min: 0, max: 0},
		// 	schedule = props.service.state.get('schedule') ? props.service.state.get('schedule') : {},
		// 	tempValues = this.props.service.state.get('temp_values') ? this.props.service.state.get('temp_values') : [];

		this.state = {
			selected_theme: 0,
			is_changing: false,
			themes: [],
			background: '#fff'
		};

		this.setState(this.state);
	}

	handleChange (color) {
		this.setState({background: color.hex});
	}

	handleChangeComplete (color) {
		this.setState({background: color.hex});
		this.setTheme({theme: this.state.selected_theme - 1, color: color.rgb});
	}

	setTheme(theme) {
		console.log("setTheme:", theme);
		this.props.doAction(this.props.service.id, {
			property: 'setTheme',
			value: theme
		});
	}

	handleThemeOneSelect () {
		this.state.selected_theme = 1;
		this.setState(this.state);
	}

	handleThemeTwoSelect () {
		this.state.selected_theme = 2;
		this.setState(this.state);
	}

	handleThemeThreeSelect () {
		this.state.selected_theme = 3;
		this.setState(this.state);
	}

	handleThemeFourSelect () {
		this.state.selected_theme = 4;
		this.setState(this.state);
	}

	getTheme (num) {
		if (!this.props.service.state.get('themes')) return;

		let theme = this.props.service.state.get('themes')[num];
		let string = 'rgb(' + theme.r + ',' + theme.g + ',' + theme.b + ')';

		return string;
	}

	render () {
		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<SettingsScreenContainer section={true}>
						<br />

						{this.state.selected_theme == 0
							?	<span styleName="sensorTitle">
									Select a theme to change
								</span>
							: <span styleName="sensorTitle">
									Theme {this.state.selected_theme}
								</span>
						}

						<br />
						<span styleName="setThemeContainer">
							<div styleName="setTheme_1" style={{backgroundColor: this.getTheme(0)}} onClick={this.handleThemeOneSelect.bind(this)} />
							<div styleName="setTheme_2" style={{backgroundColor: this.getTheme(1)}} onClick={this.handleThemeTwoSelect.bind(this)} />
						</span>
						<span styleName="setThemeContainer">
							<div styleName="setTheme_3" style={{backgroundColor: this.getTheme(2)}} onClick={this.handleThemeThreeSelect.bind(this)} />
							<div styleName="setTheme_4" style={{backgroundColor: this.getTheme(3)}} onClick={this.handleThemeFourSelect.bind(this)} />
						</span>
						<br />
						{this.state.selected_theme
							?	<div styleName="pickerContainer">
									<ChromePicker
										width="94%"
										color={ this.state.background }
										onChange={ this.handleChange.bind(this) }
										onChangeComplete={ this.handleChangeComplete.bind(this) }
									/>
								</div>
							: ''}

					</SettingsScreenContainer>
				)} />
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + LightServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

LightServiceDetails.settingsPath = '/service-settings';

LightServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	doAction: PropTypes.func,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	serviceType: PropTypes.string,
	match: PropTypes.object
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default compose(
	connect(null, null, mapDispatchToProps),
	withRouter
)(LightServiceDetails);
