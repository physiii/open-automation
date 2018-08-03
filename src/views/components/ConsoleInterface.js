import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Api from '../../api.js';
import {getGatewayServices} from '../../state/ducks/services-list/selectors.js';
import {getDeviceById} from '../../state/ducks/devices-list/selectors.js';

const LABEL_STYLE = 'color: #888888; font-size: 0.9em;',
	SECONDARY_STYLE = 'color: #888888;',
	DEVICE_ID_STYLE = 'color: #4a7d9f;',
	SERVICE_ID_STYLE = 'color: #4a9f4a;',
	SERVICE_TYPE_STYLE = 'color: #6a9f6a;';

export class ConsoleInterface extends React.Component {
	componentDidMount () {
		// Expose some utilities for use in browser console.
		window.OpenAutomation = {
			...window.OpenAutomation,
			Api,
			listDevices: () => {
				this.props.devices.forEach((device) => {
					console.log('%c' + (device.settings.name ? device.settings.name + ' ' : '') + '%c' + device.id + '%c ' + (device.state.connected ? '(connected)' : '(not connected)'), SECONDARY_STYLE, DEVICE_ID_STYLE, SECONDARY_STYLE); // eslint-disable-line no-console

					if (device.gateway_id) {
						console.log('	%cGateway: %c' + device.gateway_id, LABEL_STYLE, SERVICE_ID_STYLE); // eslint-disable-line no-console
						console.log(''); // eslint-disable-line no-console
					}

					if (device.services.size) {
						console.log('	%cServices:', LABEL_STYLE); // eslint-disable-line no-console
						device.services.forEach((service) => console.log('	%c' + service.type + ' %c' + service.id, SERVICE_TYPE_STYLE, SERVICE_ID_STYLE)); // eslint-disable-line no-console
					}

					console.log(''); // eslint-disable-line no-console
				});
			},
			listServices: () => {
				this.props.services.forEach((service) => {
					console.log('%c' + service.type + '%c ' + service.id, SERVICE_TYPE_STYLE, SERVICE_ID_STYLE); // eslint-disable-line no-console
					console.log('	%cDevice: %c' + service.device_id + '%c ' + (service.state.connected ? '(connected)' : '(not connected)'), LABEL_STYLE, DEVICE_ID_STYLE, SECONDARY_STYLE); // eslint-disable-line no-console
					console.log(''); // eslint-disable-line no-console
				});
			},
			addDevice: (data, name) => {
				let device = data;

				if (typeof data === 'string') {
					device = {
						id: data,
						settings: {name}
					};
				}

				Api.addDevice(device);
			},
			removeDevice: (deviceId) => {
				Api.removeDevice(deviceId);
			},
			addAllConnectedDevices: () => {
				Object.keys(window.OpenAutomation.gateways).forEach((gatewayKey) => {
					const gateway = window.OpenAutomation.gateways[gatewayKey];

					Api.getGatewayDevicesToAdd(gateway.id).then((data) => {
						data.devices.forEach((device) => Api.addDevice({
							...device,
							gateway_id: gateway.id
						}));
					}).catch((error) => console.error(error)); // eslint-disable-line no-console
				});
			}
		};
	}

	render () {
		// Add gateway command utility.
		window.OpenAutomation.gateways = {};
		this.props.getGatewayServices.forEach((gateway, index) => {
			window.OpenAutomation.gateways[gateway.settings.name || gateway.device.settings.name || index] = {
				id: gateway.id,
				device_id: gateway.device.id,
				command: (token, command) => {
					Api.gatewayCommand(gateway.get('id'), command, token).then((data) => {
						if (data.stdout) {
							console.log(data.stdout + data.stderr); // eslint-disable-line no-console
						} else {
							console.log(data); // eslint-disable-line no-console
						}
					}).catch((error) => {
						console.error('Gateway command error:', error); // eslint-disable-line no-console
					});
				}
			};
		});

		return null;
	}
}

ConsoleInterface.propTypes = {
	devices: PropTypes.array,
	services: PropTypes.array,
	getGatewayServices: PropTypes.array
};

const mapStateToProps = (state) => ({
	devices: state.devicesList.devices.toArray(),
	services: state.servicesList.services.toArray(),
	getGatewayServices: getGatewayServices(state.servicesList).toJS().map((service) => ({
		...service,
		device: getDeviceById(service.device_id, state.devicesList)
	}))
});

export default connect(mapStateToProps)(ConsoleInterface);
