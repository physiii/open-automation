import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import {isAuthenticated} from '../../state/ducks/session/selectors.js';

/**
 * Higher order component for Route. Implements a private route that will only
 * be rendered if the user is logged in.
 */

export class PrivateRoute extends React.Component {
	render () {
		const {isLoggedIn, component, render, ...rest} = this.props;

		return (
			<Route {...rest} render={(props) => {
				if (!isLoggedIn) {
					return (
						<Redirect to={{
							pathname: '/login',
							state: {from: props.location}
						}} />
					);
				}

				if (typeof render === 'function') {
					return render(props);
				}

				return React.createElement(component, props);
			}} />
		);
	}
}

PrivateRoute.propTypes = {
	component: PropTypes.func, // TODO: Make this actually check for React functional or class component.
	render: PropTypes.func,
	isLoggedIn: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isLoggedIn: isAuthenticated(state.session)
});

export default connect(
	mapStateToProps,
	null,
	null,

	/* Need to set pure to false so connect doesn't implement
	shouldComponentUpdate. Otherwise this component will only update on
	state/props change. That's desired for most components, but not this
	since react-router uses react context to communicate route changes. */
	{pure: false}
)(PrivateRoute);
