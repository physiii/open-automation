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
				<div styleName="branding">
					{props.logoPath
						? <img src={props.logoPath} />
						: <h1>props.appName</h1>}
				</div>
				{props.error &&
					<p styleName="errorMessage">{props.error}</p>}
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
	isLoading: PropTypes.bool,
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	error: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.bool
	])
};

const mapStateToProps = (state) => ({
	isLoading: state.session.loading,
	appName: state.config.app_name,
	logoPath: state.config.logo_path,
	error: state.session.error
});

export default connect(mapStateToProps, null, null, {pure: false})(LoginScreen);
