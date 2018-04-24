import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute.js';
import AppToolbar from '../components/AppToolbar.js';
import Dashboard from '../components/Dashboard.js';
import Settings from '../components/Settings.js';
import LoginForm from '../components/LoginForm.js';
import Logout from '../components/Logout.js';
import TabBar from '../components/TabBar.js';
import {hot} from 'react-hot-loader';
import '../styles/layouts/_app.scss';

export const App = () => (
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

export default hot(module)(App); // Wrap component for hot module reloading.
