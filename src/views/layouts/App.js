import React from 'react';
import PropTypes from 'prop-types';
import {Redirect, Route, Switch} from 'react-router-dom';
import LoginScreen from './LoginScreen.js';
import PrivateRoute from '../components/PrivateRoute.js';
import AppToolbar, {AppToolbarContextProvider} from '../components/AppToolbar.js';
import DashboardScreen from '../components/DashboardScreen.js';
import SettingsScreen from '../components/SettingsScreen.js';
import TabBar from '../components/TabBar.js';
import DashboardIcon from '../icons/DashboardIcon.js';
import SettingsIcon from '../icons/SettingsIcon.js';
import Logout from '../components/Logout.js';
import ConsoleInterface from '../components/ConsoleInterface.js';
import {connect} from 'react-redux';
import {isAuthenticated, isLoading} from '../../state/ducks/session/selectors.js';
import {hasInitialFetchCompleted} from '../../state/ducks/devices-list/selectors.js';
import {getCurrentContextPath, getContextCurrentFullPath} from '../../state/ducks/navigation/selectors.js';
import {hot} from 'react-hot-loader';
import './App.css';

export const App = (props) => {
	const renderLoginScreen = (routeProps) => (
		<div styleName="content">
			<LoginScreen location={routeProps.location} />
		</div>
	);

	return (
		<div styleName="app">
			<Switch>
				<Route path="/login" render={renderLoginScreen} />
				<Route path="/register" render={renderLoginScreen} />
				<PrivateRoute render={() => (
					<AppToolbarContextProvider>
						<div styleName="toolbar">
							<AppToolbar />
						</div>
						<div styleName="content">
							{props.isLoading
								? <div>Loading</div>
								: <Switch>
									<Route path="/logout" component={Logout} />
									<Route path="/dashboard" component={DashboardScreen} />
									<Route path="/settings" component={SettingsScreen} />
									<Route render={() => <Redirect to="/dashboard" />} />
								</Switch>}
						</div>
						{!props.isLoading && <div styleName="tabBar">
							<TabBar buttons={[
								{
									label: 'Dashboard',
									icon: <DashboardIcon size={24} />,
									to: props.getTabPath('/dashboard'),
									isActive: props.activeTabPath === '/dashboard'
								},
								{
									label: 'Settings',
									icon: <SettingsIcon size={24} />,
									to: props.getTabPath('/settings'),
									isActive: props.activeTabPath === '/settings'
								}
							]} />
						</div>}
						<ConsoleInterface />
					</AppToolbarContextProvider>
				)} />
			</Switch>
		</div>
	);
};

App.propTypes = {
	isLoading: PropTypes.bool,
	activeTabPath: PropTypes.string,
	getTabPath: PropTypes.func.isRequired
};

const mapStateToProps = ({session, navigation, devicesList}) => ({
		isLoading: isLoading(session) || (isAuthenticated(session) && !hasInitialFetchCompleted(devicesList)),
		activeTabPath: getCurrentContextPath(navigation),
		getTabPath: (defaultTabPath) => getContextCurrentFullPath(navigation, defaultTabPath) || defaultTabPath
	}),
	connectedApp = connect(mapStateToProps, null, null, {pure: false})(App);

export default hot(module)(connectedApp); // Wrap component for hot module reloading.
