import React from 'react';
import PropTypes from 'prop-types';
import {Route, Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

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
					return <Redirect to="/login" />;
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
	component: PropTypes.node,
	render: PropTypes.func,
	isLoggedIn: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isLoggedIn: session.selectors.isAuthenticated(state.session)
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
