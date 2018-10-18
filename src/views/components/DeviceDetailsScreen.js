import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import SettingsForm from './SettingsForm.js';
import List from './List.js';
import Button from './Button.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetails from './ServiceDetails.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import withSettingsSaver from './withSettingsSaver.js';
import {connect} from 'react-redux';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings, deleteDevice} from '../../state/ducks/devices-list/operations.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import './DeviceDetailsScreen.css';

export class DeviceDetailsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete this device?')) {
			this.props.deleteDevice();
		}
	}

	getScreenTitle (firstService, hasMoreThanOneService) {
		return hasMoreThanOneService
			? this.props.settings.name || 'Device'
			: firstService.settings.name || firstService.strings.friendly_type;
	}

	render () {
		const device = this.props.device;

		if (!device) {
			return <Redirect to={this.props.baseUrl} />;
		}

		const firstService = device.services[0],
			settingsProperties = Object.keys(device.settings_definitions),
			hasMoreThanOneService = device.services.length > 1;

		return (
			<NavigationScreen
				path={this.props.match.url}
				title={this.getScreenTitle(firstService, hasMoreThanOneService)}
				toolbarActions={<Button onClick={this.handleDeleteClick}>Delete</Button>}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<div styleName="container">
							{!device.state.connected && (
								<List items={[
									{
										label: 'Device is not responding',
										secondaryText: 'Device must be reachable to update settings.'
									}
								]} />
							)}
							{device.error && <p>The device settings could not be updated because of an error.</p>}
							{hasMoreThanOneService
								? <List
									title="Features"
									items={device.services.map((service) => ({
										key: service.id,
										label: service.settings.name,
										icon: <ServiceIcon service={service} size={24} shouldRenderBlank={true} />,
										link: this.props.match.url + '/' + service.id
									}))}
								/>
								: <ServiceDetails serviceId={device.services[0].id} />}
							{Boolean(settingsProperties.length) && (
								<React.Fragment>
									<h2 styleName="settingsHeading">Device Settings</h2>
									<SettingsForm
										fields={settingsProperties.map((property) => {
											return {
												property,
												definition: device.settings_definitions[property],
												value: this.props.settings[property],
												error: this.props.settingsErrors[property],
												originalValue: this.props.originalSettings[property]
											};
										})}
										disabled={!device.state.connected}
										onFieldChange={this.props.onSettingChange} />
								</React.Fragment>
							)}
							<h2 styleName="infoHeading">Info</h2>
							<ul styleName="info">
								{device.info.manufacturer &&
									<li>Manufacturer: {device.info.manufacturer}</li>}
								{device.info.model &&
									<li>Model: {device.info.model}</li>}
								{device.info.firmware_version &&
									<li>Firmware: {device.info.firmware_version}</li>}
								{device.info.hardware_version &&
									<li>Hardware: {device.info.hardware_version}</li>}
								{device.info.serial &&
									<li>Serial Number: {device.info.serial}</li>}
								<li>ID: {device.id}</li>
							</ul>
						</div>
					)} />
					<Route path={this.props.match.path + ServiceDetailsScreen.routeParams} component={ServiceDetailsScreen} />
					<Route render={() => <Redirect to={this.props.match.path} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

DeviceDetailsScreen.routeParams = '/:deviceId';

DeviceDetailsScreen.propTypes = {
	device: PropTypes.object,
	match: PropTypes.object.isRequired,
	baseUrl: PropTypes.string,
	deleteDevice: PropTypes.func.isRequired,
	// Props from settings saver HOC.
	settings: PropTypes.object.isRequired,
	settingsErrors: PropTypes.object,
	originalSettings: PropTypes.object.isRequired,
	onSettingChange: PropTypes.func.isRequired
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

export default connect(mapStateToProps, null, mergeProps)(withSettingsSaver(DeviceDetailsScreen));
