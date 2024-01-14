// index.js
import 'normalize.css';
import './views/styles/base.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import createHistory from 'history/createBrowserHistory';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import configureStore from './state/store';
import {initialize as initializeConfig} from './state/ducks/config/operations.js';
import {initialize as initializeSession} from './state/ducks/session/operations.js';
import {listenForDeviceChanges} from './state/ducks/devices-list/operations.js';
import {listenForRoomChanges} from './state/ducks/rooms-list/operations.js';
import {listenForAutomationChanges} from './state/ducks/automations-list/operations.js';
import AppContext from './views/AppContext.js';
import App from './views/layouts/App';

const history = createHistory(), // History object to share between router and store.
	reduxStore = configureStore(history), // Create store.
	THREE_SECONDS = 3,
	ONE_MINUTE_IN_SECONDS = 60,
	ONE_HOUR_IN_MINUTES = 60;

// Configure moment.
moment.relativeTimeThreshold('s', ONE_MINUTE_IN_SECONDS);
moment.relativeTimeThreshold('ss', THREE_SECONDS);
moment.relativeTimeThreshold('m', ONE_HOUR_IN_MINUTES);
momentDurationFormatSetup(moment);

// Save configuration to store.
reduxStore.dispatch(initializeConfig(window.OpenAutomation.config));

// Set up user if already logged in.
reduxStore.dispatch(initializeSession());

// Listen for changes pushed from server.
reduxStore.dispatch(listenForDeviceChanges());
reduxStore.dispatch(listenForRoomChanges());
reduxStore.dispatch(listenForAutomationChanges());

ReactDOM.render(
	<ReduxProvider store={reduxStore}>
		<ConnectedRouter history={history}>
			<AppContext>
				<App />
			</AppContext>
		</ConnectedRouter>
	</ReduxProvider>,
	document.getElementById('open-automation')
);
