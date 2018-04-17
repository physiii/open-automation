import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
// import './index.css';
import App from './views/layouts/App';
import configureStore from './state/store';
import * as session from './state/ducks/session';
import './views/styles/main.scss';

// Create store.
const reduxStore = configureStore();

// Set up user if already logged in.
reduxStore.dispatch(session.operations.initialize());

ReactDOM.render(
	<Router>
		<ReduxProvider store={reduxStore}>
			<App />
		</ReduxProvider>
	</Router>,
	document.getElementById('open-automation')
);
