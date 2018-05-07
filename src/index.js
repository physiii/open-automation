import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import Api from './api.js';
import App from './views/layouts/App';
import configureStore from './state/store';
import {initialize as initializeSession} from './state/ducks/session/operations.js';
import './views/styles/main.scss';

const history = createHistory(), // History object to share between router and store.
	reduxStore = configureStore(history); // Create store.

// Set up user if already logged in.
reduxStore.dispatch(initializeSession());

// Expose some utilities for use in browser console.
window.OpenAutomation = {Api};

ReactDOM.render(
	<ReduxProvider store={reduxStore}>
		<ConnectedRouter history={history}>
			<App />
		</ConnectedRouter>
	</ReduxProvider>,
	document.getElementById('open-automation')
);
