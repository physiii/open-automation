import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import SettingsField from './SettingsField.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import withSettingsSaver from './withSettingsSaver.js';
import {connect} from 'react-redux';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings, deleteDevice} from '../../state/ducks/devices-list/operations.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

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

	render () {
		const device = this.props.device;

		if (!device) {
			return <Redirect to={this.props.baseUrl} />;
		}

		return (
			<NavigationScreen path={this.props.match.url} title={this.props.settings.name || 'Device'} toolbarActions={<span onClick={this.handleDeleteClick}>Delete</span>}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<React.Fragment>
							{device.error && <p>{device.error}</p>}
							<SettingsField
								property="name"
								label="Device Name"
								definition={device.settings_definitions.name}
								value={this.props.settings.name}
								originalValue={this.props.originalSettings.name}
								onChange={this.props.onSettingChange} />
							{Boolean(device.services.length) && <List
								title="Features"
								items={device.services.map((service) => ({
									key: service.id,
									label: service.settings.name,
									icon: <ServiceIcon service={service} size={24} shouldRenderBlank={true} />,
									link: this.props.match.url + '/' + service.id
								}))}
							/>}
							<h2>Info</h2>
							{device.info.manufacturer && 'Manufacturer: ' + device.info.manufacturer}
							{device.info.model && 'Model: ' + device.info.model}
							{device.info.firmware_version && 'Firmware: ' + device.info.firmware_version}
							{device.info.hardware_version && 'Hardware: ' + device.info.hardware_version}
							{device.info.serial && 'Serial Number: ' + device.info.serial}
							ID: {device.id}
						</React.Fragment>
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
	// Props from withSettingsSaver.
	settings: PropTypes.object.isRequired,
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
			settings_definitions: device.settings_definitions
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
