import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {doServiceAction} from '../../state/ducks/services-list/operations.js';
import SliderControl from './SliderControl.js';
import {Route} from './Route.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import './ServiceDetails.css';

export class MediaServiceDetails extends React.Component {

	constructor (props) {
		super(props);

		const volume = this.props.service.state.get('volumeLevel') ? this.props.service.state.get('volumeLevel') : 0;

		this.state = {
			coords: [0, 0],
			diffCoords: [0, 0],
			prevCoords: [0, 0],
			startCoords: [0, 0],
			clickCoords: [0, 0],
			slider_value: volume
		};

		this.setState(this.state);
	}

	handleSliderInput (value) {
		this.setState({
			slider_value: value,
			is_changing: true
		});

		this.setLevel(value);
	}

	setLevel (value) {
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setLevel',
			value
		});
	}

	handlePress () {
		this.state.clickCoords = [this.state.clickCoords[0], this.state.clickCoords[1]];
		this.setState(this.state);
		this.sendClickCoordinates(this.state.clickCoords);
	}

	handleTouchStart (event) {
		const xCoord = event.touches[0].clientX,
			yCoord = event.touches[0].clientY;

		this.state.prevCoords = [xCoord, yCoord];
		this.state.coords = [xCoord, yCoord];
		this.setState(this.state);
	}

	handleTouchMove (event) {
		const xCoord = event.touches[0].clientX,
			yCoord = event.touches[0].clientY;

		this.state.diffCoords = [parseInt(xCoord - this.state.prevCoords[0]), parseInt(yCoord - this.state.prevCoords[1])];
		this.state.prevCoords = this.state.coords;
		this.state.coords = [xCoord, yCoord];
		this.setState(this.state);
		this.sendCoordinates(this.state.diffCoords);
	}

	handleMouseStart (event) {
		const xCoord = event.touches[0].clientX,
			yCoord = event.touches[0].clientY;

		this.state.coords = [xCoord, yCoord];
		this.state.prevCoords = [xCoord, yCoord];
		this.setState(this.state);
	}

	handleMouse (event) {
		const xCoord = event.clientX - this.state.startCoords[0],
			yCoord = event.clientY - this.state.startCoords[1];

		this.state.diffCoords = [xCoord - this.state.prevCoords[0], yCoord - this.state.prevCoords[1]];
		this.state.prevCoords = this.state.coords;
		this.state.coords = [parseInt(xCoord), parseInt(yCoord)];
		// this.sendCoordinates(this.state.coords);
		this.setState(this.state);
	}

	getCoords () {
		const xCoord = this.state.diffCoords[0],
			yCoord = this.state.diffCoords[1];

		return xCoord + ', ' + yCoord;
	}

	sendCoordinates (coords) {
		// return;
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setCoords',
			value: coords
		});
	}

	sendClickCoordinates (coords) {
		// return;
		if (!this.props.service.state.get('connected')) return;

		this.props.doAction(this.props.service.id, {
			property: 'setClickCoords',
			value: coords
		});
	}

	render () {
		const isConnected = this.props.service.state.get('connected'),
			currentLevel = this.state.slider_value;

		return (
			<Switch>
				<Route exact path={this.props.match.url} render={() => (
					<SettingsScreenContainer section={true}>
						<div
							styleName="mousePad"
							onClick={this.handlePress.bind(this)}
							onTouchMove={this.handleTouchMove.bind(this)}
							onTouchStart={this.handleTouchStart.bind(this)}
							onMouseMove={this.handleMouse.bind(this)}
						>
						Mouse Pad
						</div>
						<div styleName="sliderMediaDetailsWrapper">
							<SliderControl
								value={currentLevel}
								onInput={this.handleSliderInput.bind(this)}
								disabled={!isConnected} />
						</div>
					</SettingsScreenContainer>
				)} />
				<ServiceSettingsScreen service={this.props.service} path={this.props.match.path + MediaServiceDetails.settingsPath} />
				<Route render={() => <Redirect to={this.props.match.url} />} />
			</Switch>
		);
	}
}

MediaServiceDetails.settingsPath = '/service-settings';

MediaServiceDetails.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowSettingsButton: PropTypes.bool,
	shouldShowRoomField: PropTypes.bool,
	serviceType: PropTypes.string,
	match: PropTypes.object,
	doAction: PropTypes.func
};

const mapDispatchToProps = (stateProps, {dispatch}, ownProps) => ({
	...ownProps,
	...stateProps,
	doAction: (serviceId, action) => dispatch(doServiceAction(serviceId, action))
});

export default compose(
	connect(null, null, mapDispatchToProps),
	withRouter
)(MediaServiceDetails);
