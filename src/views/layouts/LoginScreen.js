import React from 'react';
import PropTypes from 'prop-types';
import {Link, Route, Redirect, Switch} from 'react-router-dom';
import LoginForm from '../components/LoginForm.js';
import RegisterForm from '../components/RegisterForm.js';
import {connect} from 'react-redux';
import './LoginScreen.css';

export const LoginScreen = (props) => {
	return (
		<div styleName="root">
			<div styleName="container">
				<Switch>
					<Route path="/login" component={LoginForm} />
					<Route path="/register" component={RegisterForm} />
					<Route path="/" render={() => <Redirect to="/login" />} />
				</Switch>
				{props.isLoading &&
					<div styleName="loading">Loading</div>}
			</div>
			<div styleName="footer">
				<Route path="/login" render={() => <Link to="/register">Create Account</Link>} />
				<Route path="/register" render={() => <Link to="/login">Login</Link>} />
			</div>
		</div>
	);
};

LoginScreen.propTypes = {
	isLoading: PropTypes.bool
};

const mapStateToProps = (state) => ({
	isLoading: state.session.loading
});

export default connect(mapStateToProps, null, null, {pure: false})(LoginScreen);
