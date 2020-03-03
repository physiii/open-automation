import React from 'react';
import PropTypes from 'prop-types';
import {Link, Route, Redirect} from 'react-router-dom';
import LoginForm from '../components/LoginForm.js';
import RegisterForm from '../components/RegisterForm.js';
import {connect} from 'react-redux';
import {isAuthenticated, isLoading} from '../../state/ducks/session/selectors.js';
import './LoginScreen.css';

export class LoginScreen extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			from: (props.location.state && props.location.state.from) || {pathname: '/'}
		};
	}

	render () {
		if (this.props.isLoggedIn) {
			return <Redirect to={this.state.from} />;
		}

		return (
			<div styleName="screen">
				<div styleName="container">
					<div styleName="branding">
						{this.props.logoPath
							? <img src={this.props.logoPath} />
							: <h1>{this.props.appName}</h1>}
					</div>
					{this.props.error &&
						<p styleName="errorMessage">{this.props.error}</p>}
					<Route path="/login" component={LoginForm} />
					<Route path="/register" component={RegisterForm} />
					{this.props.isLoading &&
						<div styleName="loading">Loading</div>}
				</div>
				<div styleName="footer">
					<Route path="/login" render={() => <Link to="/register">Create Account</Link>} />
					<Route path="/register" render={() => <Link to="/login">Login</Link>} />
				</div>
			</div>
		);
	}
}

LoginScreen.propTypes = {
	isLoggedIn: PropTypes.bool,
	isLoading: PropTypes.bool,
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	location: PropTypes.object,
	error: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.bool
	])
};

LoginScreen.defaultProps = {
	location: {
		state: {pathname: '/'}
	}
};

const mapStateToProps = (state) => ({
	isLoggedIn: isAuthenticated(state.session),
	isLoading: isLoading(state.session),
	appName: state.config.app_name,
	logoPath: state.config.logo_path,
	error: state.session.error
});

export default connect(mapStateToProps, null, null, {pure: false})(LoginScreen);
