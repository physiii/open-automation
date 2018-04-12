import React from 'react';
import ReactDOM from 'react-dom';
import {Provider as ReduxProvider} from 'react-redux';
// import './index.css';
import App from './views/layouts/App';
import configureStore from './state/store';
import * as session from './state/ducks/session';

// Create store.
const reduxStore = configureStore();

// Set up user if already logged in.
reduxStore.dispatch(session.operations.initialize());

ReactDOM.render(<ReduxProvider store={reduxStore}><App /></ReduxProvider>, document.getElementById('root'));
