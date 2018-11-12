import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import createHistory from 'history/createBrowserHistory';
import AppContext from './views/AppContext.js';
import App from './views/layouts/App';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import configureStore from './state/store';
import {initialize as initializeConfig} from './state/ducks/config/operations.js';
import {initialize as initializeSession} from './state/ducks/session/operations.js';
import {listenForDeviceChanges} from './state/ducks/devices-list/operations.js';
import './views/styles/main.scss';

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

// Listen for changes to devices pushed from server.
reduxStore.dispatch(listenForDeviceChanges());

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
