import React from 'react';
import PropTypes from 'prop-types';
import {Redirect, Route, Switch} from 'react-router-dom';
import LoginScreen from './LoginScreen.js';
import PrivateRoute from '../components/PrivateRoute.js';
import AppToolbar from '../components/AppToolbar.js';
import Dashboard from '../components/Dashboard.js';
import Settings from '../components/Settings.js';
import Logout from '../components/Logout.js';
import ConsoleInterface from '../components/ConsoleInterface.js';
import {connect} from 'react-redux';
import {isAuthenticated} from '../../state/ducks/session/selectors.js';
import {hasInitialFetchCompleted} from '../../state/ducks/devices-list/selectors.js';
import {hot} from 'react-hot-loader';
import './App.css';

export const App = (props) => {
	const renderLoginScreen = (routeProps) => (
		<div styleName="contentCentered">
			<LoginScreen location={routeProps.location} />
		</div>
	);

	return (
		<div styleName="app">
			<Switch>
				<Route path="/login" render={renderLoginScreen} />
				<Route path="/register" render={renderLoginScreen} />
				<PrivateRoute render={() => (
					<React.Fragment>
						<div styleName="toolbar">
							<AppToolbar />
						</div>
						<div styleName="content">
							{props.isLoading
								? <div>Loading</div>
								: <Switch>
									<Route path="/logout" component={Logout} />
									<Route path="/dashboard" component={Dashboard} />
									<Route render={() => <Redirect to="/dashboard" />} />
								</Switch>}
						</div>
						<ConsoleInterface />
					</React.Fragment>
				)} />
			</Switch>
		</div>
	);
};

App.propTypes = {
	isLoading: PropTypes.bool
};

const mapStateToProps = (state) => ({
		isLoading: state.session.loading || (isAuthenticated(state.session) && !hasInitialFetchCompleted(state.devicesList))
	}),
	connectedApp = connect(
		mapStateToProps,
		null,
		null,
		{pure: false}
	)(App);

export default hot(module)(connectedApp); // Wrap component for hot module reloading.
