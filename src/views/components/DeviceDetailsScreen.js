import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsForm from './SettingsForm.js';
import DeviceRoomField from './DeviceRoomField.js';
import List from './List.js';
import Button from './Button.js';
import MetaList from './MetaList.js';
import ServiceIcon from '../icons/ServiceIcon.js';
import ServiceDetails from './ServiceDetails.js';
import ServiceDetailsScreen from './ServiceDetailsScreen.js';
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

	getScreenTitle (hasOneService, firstService) {
		return hasOneService
			? firstService.settings.get('name') || firstService.strings.get('friendly_type')
			: this.props.device.settings.name || 'Device';
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete ' + (this.props.device.settings.name
			? '‘' + this.props.device.settings.name + '’'
			: 'this device') + '?')) {
			this.props.deleteDevice();
		}
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
				title={this.getScreenTitle(hasOneService, firstService)}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={<Button onClick={this.handleDeleteClick}>Delete</Button>}>
				<Switch>
					<Route exact={!hasOneService} path={this.props.match.path} render={() => (
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
								? <ServiceDetails service={firstService} shouldShowRoomField={true} />
								: <React.Fragment>
									<DeviceRoomField deviceId={device.id} />
									<List
										title="Features"
										renderIfEmpty={false}>
										{device.services.map((service) => ({
											key: service.id,
											label: service.settings.get('name') || service.strings.get('friendly_type'),
											icon: <ServiceIcon service={service} size={24} shouldRenderBlank={true} />,
											link: this.props.match.url + '/service/' + service.id
										}))}
									</List>
								</React.Fragment>}
							{SettingsForm.willAnyFieldsRender(device.settings_definitions) && (
								<React.Fragment>
									<h1 styleName="settingsHeading">Device Settings</h1>
									<SettingsForm
										fields={device.settings_definitions}
										values={device.settings}
										disabled={!device.state.connected}
										saveSettings={this.props.saveSettings}
										key={device.error} /> {/* Re-create component when there's an error to make sure the latest device settings state is rendered. */}
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
