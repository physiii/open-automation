import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import ScreenRoute from './ScreenRoute.js';
import SettingsForm from './SettingsForm.js';
import List from './List.js';
import Button from './Button.js';
import MetaList from './MetaList.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetails from './ServiceDetails.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import withSettingsSaver from './withSettingsSaver.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings, deleteDevice} from '../../state/ducks/devices-list/operations.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import './DeviceDetailsScreen.css';

export class DeviceDetailsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

	componentDidMount () {
		this.updateNavigation();
	}

	componentDidUpdate () {
		this.updateNavigation();
	}

	updateNavigation () {
		this.props.setScreenTitle(this.getScreenTitle());
		this.props.setToolbarActions(<Button onClick={this.handleDeleteClick}>Delete</Button>);
	}

	getScreenTitle () {
		const firstService = this.props.device.services[0],
			hasOneService = this.props.device.services.length === 1;

		return hasOneService
			? firstService.settings.name || firstService.strings.friendly_type
			: this.props.settings.name || 'Device';
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete this device?')) {
			this.props.deleteDevice();
		}
	}

	render () {
		const device = this.props.device;

		if (!device) {
			return <Redirect to={this.props.baseUrl} />;
		}

		const firstService = device.services[0],
			settingsProperties = Object.keys(device.settings_definitions),
			hasOneService = device.services.length === 1,
			serviceDetailsScreenPath = this.props.match.path + ServiceDetailsScreen.routeParams;

		return (
			<Switch>
				<Route exact path={this.props.match.path} render={() => (
					<section styleName="container">
						{!device.state.connected && (
							<List>
								{[
									{
										label: 'Device is not responding',
										secondaryText: 'Device must be reachable to update settings.'
									}
								]}
							</List>
						)}
						{device.error && <p>The device settings could not be updated because of an error.</p>}
						{hasOneService
							? <ServiceDetails serviceId={firstService.id} />
							: <List
								title="Features"
								renderIfEmpty={false}>
								{device.services.map((service) => ({
									key: service.id,
									label: service.settings.name,
									icon: <ServiceIcon service={service} size={24} shouldRenderBlank={true} />,
									link: this.props.match.url + '/' + service.id
								}))}
							</List>}
						{Boolean(settingsProperties.length) && (
							<React.Fragment>
								<h1 styleName="settingsHeading">Device Settings</h1>
								<SettingsForm
									disabled={!device.state.connected}
									onFieldChange={this.props.onSettingChange}>
									{settingsProperties.map((property) => {
										return {
											property,
											definition: device.settings_definitions[property],
											value: this.props.settings[property],
											error: this.props.settingsErrors[property],
											originalValue: this.props.originalSettings[property]
										};
									})}
								</SettingsForm>
							</React.Fragment>
						)}
						<h1 styleName="infoHeading">Info</h1>
						<MetaList layout="vertical" alignLabels="left">
							{[
								{label: 'Manufacturer', value: device.info.manufacturer},
								{label: 'Model', value: device.info.model},
								{label: 'Firmware', value: device.info.firmware_version},
								{label: 'Hardware', value: device.info.hardware_version},
								{label: 'Serial', value: device.info.serial},
								{label: 'ID', value: device.id, long: true}
							].filter((item) => Boolean(item.value))}
						</MetaList>
					</section>
				)} />
				<ScreenRoute path={serviceDetailsScreenPath} component={ServiceDetailsScreen} />
				<Route render={() => <Redirect to={this.props.match.path} />} />
			</Switch>
		);
	}
}

DeviceDetailsScreen.routeParams = '/:deviceId';

DeviceDetailsScreen.propTypes = {
	device: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string,
	deleteDevice: PropTypes.func.isRequired,
	setScreenTitle: PropTypes.func,
	setToolbarActions: PropTypes.func,
	// Props from settings saver HOC.
	settings: PropTypes.object.isRequired,
	settingsErrors: PropTypes.object,
	originalSettings: PropTypes.object.isRequired,
	onSettingChange: PropTypes.func.isRequired
};

DeviceDetailsScreen.defaultProps = {
	setScreenTitle: () => { /* no-op */ },
	setToolbarActions: () => { /* no-op */ }
};

const mapStateToProps = ({devicesList, servicesList}, {match}) => {
		const device = getDeviceById(devicesList, match.params.deviceId),
			urlParts = match.url.split('/');

		if (!device) {
			// Remove the device ID from the URL.
			urlParts.pop();

			return {baseUrl: urlParts.join('/')};
		}

		return {
			device: {
				...device,
				// Hydrate services.
				services: device.services.map(({id}) => getServiceById(servicesList, id))
			},
			// Props for settings saver HOC.
			settings: device.settings,
			settingsDefinitions: device.settings_definitions,
			key: device.error // Re-create component when there's an error to make sure the latest device settings state is rendered.
		};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		deleteDevice: () => dispatch(deleteDevice(stateProps.device)),
		// Props for settings saver HOC.
		saveSettings: (settings) => dispatch(setDeviceSettings(stateProps.device.id, settings, stateProps.device.settings))
	});

export default compose(
	connect(mapStateToProps, null, mergeProps),
	withSettingsSaver
)(DeviceDetailsScreen);
