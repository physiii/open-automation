// AutomationRoute.js

import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import { Route } from './Route.js';

export const AutomationRoute = (props) => {
	const {match: {url}} = props;

	return (
		<Switch>
			<Route exact path={url + '/notification/:type'} component={AutomationNotificationScreen} />
			<Route {...props} />
		</Switch>
	);
};

AutomationRoute.propTypes = {
	match: PropTypes.object.isRequired
};
