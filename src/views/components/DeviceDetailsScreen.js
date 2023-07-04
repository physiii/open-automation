import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import DeviceRoomField from './DeviceRoomField.js';
import List from './List.js';
import Button from './Button.js';
import MetaList from './MetaList.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetails from './ServiceDetails.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
import ServiceSettingsScreen from './ServiceSettingsScreen.js';
import DeviceSettingsScreen from './DeviceSettingsScreen.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';
import {setDeviceSettings, deleteDevice} from '../../state/ducks/devices-list/operations.js';
import {getServiceById} from '../../state/ducks/services-list/selectors.js';
import styles from './DeviceDetailsScreen.css';
import Api from '../../api.js';

export class DeviceDetailsScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleUpdateClick = this.handleUpdateClick.bind(this);
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete ' + (this.props.device.settings.name
			? '‘' + this.props.device.settings.name + '’'
			: 'this device') + '?')) {
			this.props.deleteDevice();
		}
	}

	handleUpdateClick () {
		console.log('handleUpdateClick', this.props.device);
		Api.updateDevice(this.props.device);
	}

	render () {
		const device = this.props.device;

		if (!device) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		const firstService = device.services[0],
			hasOneService = device.services.length === 1;

		return (
			<NavigationScreen
				title={this.props.device.settings.name || 'Device'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={
					<React.Fragment>
						<Button to={this.props.match.url + '/settings'}>Device Settings</Button>
						<Button onClick={this.handleDeleteClick}>Delete</Button>
					</React.Fragment>
				}>
				<Switch>
					<DeviceSettingsScreen path={this.props.match.path + '/settings'} device={device} />
					<Route exact={!hasOneService} path={this.props.match.path} render={() => (
						<SettingsScreenContainer section={true}>
							{device.error && <p>The device settings could not be updated because of an error.</p>}
							{hasOneService
								? <ServiceDetails service={firstService} shouldShowSettingsButton={true} />
								: <React.Fragment>
									<List
										title="Features"
										renderIfEmpty={false}>
										{device.services.map((service) => ({
											key: service.id,
											label: service.settings.get('name') || service.strings.get('friendly_type'),
											icon: <ServiceIcon service={service} size={24} shouldRenderBlank={true} />,
											link: this.props.match.url + '/service/' + service.id,
											secondaryAction: <Button to={this.props.match.url + '/service-settings/' + service.id}>Settings</Button>
										}))}
									</List>
								</React.Fragment>}
							<DeviceRoomField deviceId={device.id} />
							<h1 className={styles.infoHeading}>Device Info</h1>
							<MetaList layout="vertical" alignLabels="left">
								{[
									{label: 'Manufacturer', value: device.info.manufacturer},
									{label: 'Model', value: device.info.model},
									{label: 'Local IP', value: device.info.local_ip},
									{label: 'Public IP', value: device.info.public_ip},
									{label: 'Hardware', value: device.info.hardware_version},
									{label: 'Serial', value: device.info.serial},
									{label: 'ID', value: device.id, long: true},
									{label: 'Firmware', value: device.info.firmware_version}
								].filter((item) => Boolean(item.value))}
							</MetaList>
							<Button onClick={this.handleUpdateClick}>Update Software</Button>
						</SettingsScreenContainer>
					)} />
					<ServiceSettingsScreen path={this.props.match.path + '/service-settings'} />
					<ServiceDetailsScreen path={this.props.match.path + '/service'} />
					<Route render={() => <Redirect to={this.props.match.url} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

DeviceDetailsScreen.propTypes = {
	device: PropTypes.object,
	rooms: PropTypes.array,
	areRoomsLoading: PropTypes.bool,
	match: PropTypes.object.isRequired,
	deleteDevice: PropTypes.func.isRequired,
	saveSettings: PropTypes.func.isRequired
};

const mapStateToProps = ({devicesList, servicesList}, {match}) => {
		const device = getDeviceById(devicesList, match.params.deviceId);

		if (!device) {
			return {};
		}

		return {
			device: {
				...device,
				// Hydrate services.
				services: device.services.map(({id}) => getServiceById(servicesList, id, false))
			}
		};
	},
	mergeProps = (stateProps, {dispatch}, ownProps) => ({
		...ownProps,
		...stateProps,
		deleteDevice: () => dispatch(deleteDevice(stateProps.device.id)),
		saveSettings: (settings) => dispatch(setDeviceSettings(stateProps.device.id, settings, stateProps.device.settings))
	});

export default compose(
	withRoute({params: '/:deviceId'}),
	connect(mapStateToProps, null, mergeProps)
)(DeviceDetailsScreen);
