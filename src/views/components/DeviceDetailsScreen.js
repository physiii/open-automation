import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import TextField from './TextField.js';
import List from './List.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import {connect} from 'react-redux';
import {debounce} from 'debounce';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings, deleteDevice} from '../../state/ducks/devices-list/operations.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';

const FIELD_DEBOUNCE_DELAY = 500;

export class DeviceDetailsScreen extends React.Component {
	constructor (props) {
		super(props);

		if (!props.device) {
			return;
		}

		this.originalSettings = props.device.settings;

		this.state = {
			settings: {...props.device.settings}
		};

		this.handleFieldChange = this.handleFieldChange.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.setSettings = debounce(this.setSettings, FIELD_DEBOUNCE_DELAY);
	}

	handleFieldChange (event, field) {
		const settings = {
			...this.state.settings,
			[field]: event.target.value
		};

		let shouldSaveSettings = event.type === 'change';

		// If name is empty, use the original name.
		if (field === 'name' && !settings.name) {
			if (event.type === 'blur') {
				settings.name = this.originalSettings.name;
				shouldSaveSettings = settings.name !== this.props.device.settings.name;
			} else if (event.type === 'change') {
				shouldSaveSettings = false;
			}
		}

		this.setState({settings});

		if (shouldSaveSettings) {
			this.setSettings(settings);
		}
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete this device?')) {
			this.props.deleteDevice();
		}
	}

	setSettings (settings) {
		this.props.setSettings(settings);
	}

	render () {
		if (!this.props.device) {
			return <Redirect to={this.props.baseUrl} />;
		}

		const device = this.props.device,
			services = device.services.filter(({type}) => type === 'button' ||
				type === 'camera' ||
				type === 'light' ||
				type === 'lock' ||
				type === 'thermostat');

		return (
			<NavigationScreen path={this.props.match.url} title={device.settings.name || 'Device'} toolbarActions={<span onClick={this.handleDeleteClick}>Delete</span>}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => (
						<React.Fragment>
							{device.error && <p>{device.error}</p>}
							<TextField
								name="name"
								label="Device Name"
								value={this.state.settings.name}
								onChange={this.handleFieldChange}
								onBlur={this.handleFieldChange} />
							{Boolean(services.length) && <List
								title="Features"
								items={services.map((service) => ({
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
	setSettings: PropTypes.func.isRequired,
	deleteDevice: PropTypes.func.isRequired
};

const mapStateToProps = (state, {match}) => {
		const device = getDeviceById(state, match.params.deviceId),
			urlParts = match.url.split('/');

		urlParts.pop(); // Remove the device ID from the URL.

		const baseUrl = urlParts.join('/');

		if (!device) {
			return {baseUrl};
		}

		return {
			device: {
				...device,
				services: device.services.map(({id}) => getServiceById(id, state.servicesList))
			},
			baseUrl
		};
	},
	mapDispatchToProps = (dispatch) => ({dispatch}),
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		setSettings: (settings) => dispatch(setDeviceSettings(stateProps.device.id, settings, stateProps.device.settings)),
		deleteDevice: () => dispatch(deleteDevice(stateProps.device))
	});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(DeviceDetailsScreen);
