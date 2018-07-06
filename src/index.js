import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import createHistory from 'history/createBrowserHistory';
import Api from './api.js';
import App from './views/layouts/App';
import moment from 'moment';
import configureStore from './state/store';
import {initialize as initializeConfig} from './state/ducks/config/operations.js';
import {initialize as initializeSession} from './state/ducks/session/operations.js';
import {listenForDeviceChanges} from './state/ducks/devices-list/operations.js';
import {gatewayServices as getGatewayServices} from './state/ducks/services-list/selectors.js';
import {deviceById} from './state/ducks/devices-list/selectors.js';
import './views/styles/main.scss';

const history = createHistory(), // History object to share between router and store.
	reduxStore = configureStore(history), // Create store.
	THREE_SECONDS = 3,
	ONE_MINUTE_IN_SECONDS = 60,
	ONE_HOUR_IN_MINUTES = 60;

// Configure moment relative dates thresholds.
moment.relativeTimeThreshold('s', ONE_MINUTE_IN_SECONDS);
moment.relativeTimeThreshold('ss', THREE_SECONDS);
moment.relativeTimeThreshold('m', ONE_HOUR_IN_MINUTES);

// Save configuration to store.
reduxStore.dispatch(initializeConfig(window.OpenAutomation.config));

// Set up user if already logged in.
reduxStore.dispatch(initializeSession());

// Listen for changes to devices pushed from server.
reduxStore.dispatch(listenForDeviceChanges());

ReactDOM.render(
	<ReduxProvider store={reduxStore}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</ReduxProvider>,
	document.getElementById('open-automation')
);

// Expose some utilities for use in browser console.
window.OpenAutomation = {
	...window.OpenAutomation,
	Api,
	listGateways: () => {
		console.log(Object.keys(window.OpenAutomation.gateways));
	},
	addGateway: (deviceId, name) => {
		Api.addDevice({
			id: deviceId,
			settings: {name}
		});
	},
	addAllConnectedDevices: () => {
		Object.keys(window.OpenAutomation.gateways).forEach((gateway) => {
			Api.getGatewayDevicesToAdd(window.OpenAutomation.gateways[gateway].id).then((data) => {
				data.devices.forEach((device) => Api.addDevice(device));
			});
		});
	}
};

// Add gateway command utility.
reduxStore.subscribe(() => {
	const state = reduxStore.getState(),
		gateways = getGatewayServices(state.servicesList);

	window.OpenAutomation.gateways = {};

	gateways.forEach((gateway, index) => {
		const device = deviceById(gateway.device_id, state.devicesList);

		window.OpenAutomation.gateways[gateway.settings.name || device.settings.name || index] = {
			id: gateway.id,
			command: (token, command) => {
				Api.gatewayCommand(gateway.get('id'), command, token).then((data) => {
					if (data.stdout) {
						console.log(data.stdout + data.stderr);
					} else {
						console.log(data);
					}
				}).catch((error) => {
					console.error('Gateway command error:', error);
				});
			}
		};
	});
});
