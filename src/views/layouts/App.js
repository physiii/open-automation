import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute.js';
import AppToolbar from '../components/AppToolbar.js';
import Dashboard from '../components/Dashboard.js';
import Settings from '../components/Settings.js';
import LoginForm from '../components/LoginForm.js';
import Logout from '../components/Logout.js';
import TabBar from '../components/TabBar.js';
import {connect} from 'react-redux';
import {hasInitialFetchCompleted} from '../../state/ducks/devices-list/selectors.js';
import {hot} from 'react-hot-loader';
import '../styles/layouts/_app.scss';

export const App = (props) => {
	if (props.isLoading) {
		return <div>Loading</div>;
	}

	return (
		<div className="oa-l-app">
			<div className="oa-l-app--toolbar">
				<AppToolbar />
			</div>
			<div className="oa-l-app--content">
				<PrivateRoute exact path="/" render={() => <Redirect to="/dashboard" />} />
				<PrivateRoute path="/dashboard" component={Dashboard} />
				<PrivateRoute path="/settings" component={Settings} />
				<Route path="/login" component={LoginForm} />
				<Route path="/logout" component={Logout} />
			</div>
			<div className="oa-l-app--tabBar">
				<TabBar buttons={[
					{
						label: 'Dashboard',
						to: '/dashboard'
					},
					{
						label: 'Rooms',
						to: '/room'
					},
					{
						label: 'Settings',
						to: '/settings'
					}
				]} />
			</div>
		</div>
	);
};

App.propTypes = {
	isLoading: PropTypes.bool
};

const mapStateToProps = (state) => ({
		isLoading: !hasInitialFetchCompleted(state.devicesList)
	}),
	connectedApp = connect(
		mapStateToProps,
		null,
		null,
		{pure: false}
	)(App);

export default hot(module)(connectedApp); // Wrap component for hot module reloading.
