import React from 'react';
import PropTypes from 'prop-types';
import {Route as ReactRouterRoute, matchPath, withRouter} from 'react-router-dom';

/**
 * Higher order component for Route. Adds the base url without optional
 * parameters to the match object.
 */

export const Route = (props) => {
	const route = (
		<ReactRouterRoute {...props} component={null} render={({match}) => (
			<ReactRouterRoute {...{
				...props,
				computedMatch: { // Private React Router API.
					...match,
					urlWithoutParams: getUrlWithoutParams(match.url, props.path, props),
					urlWithoutOptionalParams: getUrlWithoutParams(match.url, props.path, props, true),
					parentMatch: props.match
				}
			}} />
		)} />
	);

	return route;
};

Route.propTypes = {...Route.propTypes};

// Gets the matched URL and removes any optional segments at the end.
function getUrlWithoutParams (url = '', path = '', props, includeRequired) {
	const pattern = new RegExp(
			includeRequired
				? /(\/:[^/?*]+[?*])*$/
				: /(\/:[^/?*]+)*$/,
			props.sensitive
				? ''
				: 'i'
		), // Match all optional parameters at the end of the path.
		modifiedPath = path.replace(pattern, ''),
		modifiedMatch = matchPath(url, {...props, path: modifiedPath});

	return modifiedMatch ? modifiedMatch.url : url;
}

export const withRoute = (routeProps = {}) => (WrappedComponent) => {
	const RouteHOC = (props) => {
		const _props = {...props};

		// Prevent Route component from using computedMatch from a Switch
		// component so we can add the route parameters.
		delete _props.computedMatch;

		return (
			<Route {..._props} children={null} path={_props.path + (routeProps.params || '')} render={(_routeProps) => (
				<WrappedComponent {..._props} {..._routeProps} />
			)} />
		);
	};

	RouteHOC.propTypes = {
		path: PropTypes.string,
		match: PropTypes.object
	};

	return withRouter(RouteHOC);
};

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

export default withRouter(Route);
