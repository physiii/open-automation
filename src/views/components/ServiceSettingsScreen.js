import React from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import Button from './Button.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import Form from './Form.js';
import DeviceRoomField from './DeviceRoomField.js';
import ServiceCardBase from './ServiceCardBase.js';
import VideoPlayer from './VideoPlayer.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import {setServiceSettings} from '../../state/ducks/services-list/operations.js';
import './ServiceSettingsScreen.css';
import moment from 'moment';

export class ServiceSettingsScreen extends React.Component {

	getOffsetX (event) {
		return event.nativeEvent.offsetX / this.videoWidth;
	}

	getOffsetY (event) {
		return event.nativeEvent.offsetY / this.videoHeight;
	}

	constructor (props) {
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);
		this.videoPlayer = React.createRef();

		this.onStreamStart = this.onStreamStart.bind(this);
		this.onStreamStop = this.onStreamStop.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onCardClick = this.onCardClick.bind(this);

		const motionAreaX1 = this.props.service.settings.get('motionArea_x1'),
			motionAreaY1 = this.props.service.settings.get('motionArea_y1'),
			motionAreaX2 = this.props.service.settings.get('motionArea_x2'),
			motionAreaY2 = this.props.service.settings.get('motionArea_y2');

		this.state = {
			firstPointSet: false,
			secondPointSet: false,
			firstLoad: true,
			motionArea: {
				p1: [motionAreaX1, motionAreaY1],
				p2: [motionAreaX2, motionAreaY2]
			},
			formsWithErrorsCount: 0,
			shouldGoBack: false,
			isStreaming: false
		};

		if (!props.service) {
			return;
		}

		this.settings = {...props.service.settings.toObject()};
	}

	onStreamStart () {
		this.setState({isStreaming: true});
	}

	onStreamStop () {
		this.setState({isStreaming: false});
	}

	onCardClick (event) {
		let state = {};

		this.state.firstLoad = false;

		if (this.state.firstPointSet && this.state.secondPointSet) {
			this.state.firstPointSet = false;
			this.state.secondPointSet = false;
		}

		if (!this.state.isStreaming) {
			if (!this.state.firstPointSet) {
				state = {
					firstPointSet: true,
					secondPointSet: false,
					motionArea: { // first click coordinates
						p1: [this.getOffsetX(event), this.getOffsetY(event)],
						p2: [this.getOffsetX(event), this.getOffsetY(event)]
					}
				};
			}
		} else if (this.state.firstPointSet) {
			state = {
				firstPointSet: true,
				secondPointSet: true,
				motionArea: { // second click coordinates
					p1: [this.state.motionArea.p1[0], this.state.motionArea.p1[1]],
					p2: [this.getOffsetX(event), this.getOffsetY(event)]
				}
			};
		}

		this.settings.motionArea_x1 = this.state.motionArea.p1[0];
		this.settings.motionArea_y1 = this.state.motionArea.p1[1];

		this.settings.motionArea_x2 = this.state.motionArea.p2[0];
		this.settings.motionArea_y2 = this.state.motionArea.p2[1];

		this.setState(state);
	}

	onMouseMove (event) {
		this.videoWidth = this.videoPlayer.current.element.current.clientWidth;
		this.videoHeight = this.videoPlayer.current.element.current.clientHeight;

		if (this.state.firstLoad) {
			return;
		}

		let state = {
			motionArea: {
				p1: [this.getOffsetX(event), this.getOffsetY(event)],
				p2: [this.state.motionArea.p1[0], this.state.motionArea.p1[1]]
			}
		};

		if (this.state.isStreaming) {
			state = {
				motionArea: {
					p1: [this.state.motionArea.p1[0], this.state.motionArea.p1[1]],
					p2: [this.getOffsetX(event), this.getOffsetY(event)]
				}
			};
		}

		if (!this.state.secondPointSet) {
			this.setState(state);
		}
	}

	handleSettingsChange (settings) {
		this.settings = {
			...this.settings,
			...settings
		};
	}

	handleSettingsErrors () {
		this.setState((state) => ({formsWithErrorsCount: state.formsWithErrorsCount + 1}));
	}

	handleNoSettingsErrors () {
		this.setState((state) => ({formsWithErrorsCount: state.formsWithErrorsCount - 1}));
	}

	handleSaveClick () {
		this.props.saveSettings(this.settings);
		this.setState({shouldGoBack: true});
	}

	render () {
		const motionDetectedDate = this.props.service.state.get('motion_detected_date');

		if (this.state.shouldGoBack || !this.props.service) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		const service = this.props.service,
			{name: nameField, show_on_dashboard: dashboardField, ...restOfSettingsFields} = {...service.settings_definitions.toObject()};

		return (
			<NavigationScreen
				title={(service.settings.get('name') || service.strings.get('friendly_type')) + ' Settings'}
				url={this.props.match.url}
				toolbarActions={<Button onClick={this.handleSaveClick} disabled={this.state.formsWithErrorsCount > 0 || !service.state.get('connected')}>Save</Button>}
				toolbarBackAction={<Button to={this.props.match.parentMatch.url}>Cancel</Button>}>
				<SettingsScreenContainer section={true}>
					{service.error && <p>The device settings could not be updated because of an error.</p>}
					{!service.state.get('connected') && (
						<List>
							{[
								{
									label: 'Device is not responding',
									secondaryText: 'Device must be reachable to update settings.'
								}
							]}
						</List>
					)}
					<header styleName="header">
						{ServiceIcon.willRenderIcon(service) &&
							<div styleName="iconContainer">
								<ServiceIcon service={service} size={32} />
							</div>}
						<div styleName="nameContainer">
							<Form
								fields={{name: nameField}}
								values={{name: service.settings.get('name')}}
								disabled={!service.state.get('connected')}
								onSaveableChange={this.handleSettingsChange}
								onError={this.handleSettingsErrors}
								onNoError={this.handleNoSettingsErrors}
								key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
						</div>
					</header>

					{<DeviceRoomField deviceId={service.device_id} />}
					<Form
						fields={{show_on_dashboard: dashboardField}}
						values={{show_on_dashboard: service.settings.get('show_on_dashboard')}}
						disabled={!service.state.get('connected')}
						onSaveableChange={this.handleSettingsChange}
						onError={this.handleSettingsErrors}
						onNoError={this.handleNoSettingsErrors}
						key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
					{this.props.children}
					{Form.willAnyFieldsRender(restOfSettingsFields) && (
						<React.Fragment>
							<h1 styleName="settingsHeading">{service.strings.get('friendly_type')} Settings</h1>
							<Form
								fields={restOfSettingsFields}
								values={service.settings.toObject()}
								disabled={!service.state.get('connected')}
								onSaveableChange={this.handleSettingsChange}
								onError={this.handleSettingsErrors}
								onNoError={this.handleNoSettingsErrors}
								key={service.error} /> {/* Re-create component when there's an error to make sure the latest service settings state is rendered. */}
						</React.Fragment>
					)}
					<div style={
						{margin: '20px 20px 40px 20px',
							display: this.props.service.settings.get('motion_detection_enabled') ? 'show' : 'none'}}
					onMouseMove={this.onMouseMove}>
						<h1 styleName="">Click to set motion detection region.</h1>
						<ServiceCardBase
							service={this.props.service}
							name={this.props.service.settings.get('name') || 'Camera'}
							status={motionDetectedDate && 'Movement detected ' + moment(motionDetectedDate).fromNow()}
							isConnected={this.props.service.state.get('connected')}
							onCardClick={this.onCardClick}
							toolbarsOverlayContent={false}
							secondaryAction={<Button to={`${this.props.match.url}/recordings/${this.props.service.id}`}>View Recordings</Button>}
							hideToolbars={true}
							removePadding={true}
							{...this.props}>
							<VideoPlayer
								key={this.props.service.id}
								cameraServiceId={this.props.service.id}
								streamingToken={this.props.service.streaming_token}
								shouldShowControls={false}
								firstLoad={this.state.firstLoad}
								motionArea={this.state.motionArea}
								firstPointSet={this.state.firstPointSet}
								secondPointSet={this.state.secondPointSet}
								posterUrl={'/service-content/camera-preview?service_id=' + this.props.service.id + '&date=' + motionDetectedDate}
								width={this.props.service.settings.get('resolution_w')}
								height={this.props.service.settings.get('resolution_h')}
								onPlay={this.onStreamStart}
								onStop={this.onStreamStop}
								ref={this.videoPlayer} />
						</ServiceCardBase>
					</div>
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

ServiceSettingsScreen.propTypes = {
	service: PropTypes.object.isRequired,
	children: PropTypes.node,
	shouldShowRoomField: PropTypes.bool,
	match: PropTypes.object,
	saveSettings: PropTypes.func.isRequired
};

const mapStateToProps = ({servicesList}, {service: ownPropsService, match}) => {
		if (ownPropsService) {
			return {service: ownPropsService};
		}

		const service = getServiceById(servicesList, match.params.serviceId, false);

		if (!service) {
			return {};
		}

		return {service};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		saveSettings: (settings) => dispatch(setServiceSettings(stateProps.service.id, settings, stateProps.service.settings.toObject()))
	});

export default compose(
	withRoute({params: '/:serviceId?'}),
	connect(mapStateToProps, null, mergeProps, {pure: false})
)(ServiceSettingsScreen);
