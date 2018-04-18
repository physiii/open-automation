import React from 'react';
import {Route, Redirect} from 'react-router-dom';
import PropTypes from 'prop-types';
import PrivateRoute from '../components/PrivateRoute.js';
import AppToolbar from '../components/AppToolbar.js';
import LoginForm from '../components/LoginForm.js';
import Logout from '../components/Logout.js';
import TabBar from '../components/TabBar.js';
import {connect} from 'react-redux';
import {hot} from 'react-hot-loader';
import * as devices from '../../state/ducks/devices';
import '../styles/layouts/_app.scss';

export const App = (props) => (
	<div className="oa-l-app">
		<div className="oa-l-app--toolbar">
			<AppToolbar />
		</div>
		<div className="oa-l-app--content">
			<PrivateRoute exact path="/" render={() => <Redirect to="/dashboard" />} />
			<PrivateRoute path="/dashboard" render={() => (
				<div>
					Dashboard
					{props.devices ? props.devices.map((device, index) => <div key={index}>{device.type}</div>) : null}
				</div>
			)} />
			<Route path="/login" component={LoginForm} />
			<Route path="/logout" component={Logout} />
		</div>
		<div className="oa-l-app--tabBar">
			<TabBar buttons={[
				{label: 'Dashboard'},
				{label: 'Rooms'},
				{label: 'Settings'}
			]} />
		</div>
	</div>
);

App.propTypes = {
	devices: PropTypes.array
};

const mapStateToProps = (state) => ({
	devices: devices.selectors.getDashboardDevices(state.devices)
});

export default hot(module)(connect(mapStateToProps)(App)); // Wrap component for hot module reloading.
