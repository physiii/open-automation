import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

export class LoginForm extends Component {
	propTypes: {
		login: PropTypes.func
	}

	constructor(props) {
		super(props);

		this.state = {
			username: '',
			password: ''
		};

		this.handleUsernameChange = this.handleUsernameChange.bind(this);
		this.handlePasswordChange = this.handlePasswordChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleLogoutClick = this.handleLogoutClick.bind(this);
	}

	handleUsernameChange (event) {
		this.setState({username: event.target.value});
	}

	handlePasswordChange (event) {
		this.setState({password: event.target.value});
	}

	handleSubmit (event) {
		event.preventDefault();
		this.props.login(this.state.username, this.state.password);
	}

	handleLogoutClick (event) {
		event.preventDefault();
		this.props.logout();
	}

	render () {
		// TODO: Break up this component.
		if (this.props.isLoading) {
			return <div>Loading</div>;
		}

		if (this.props.isLoggedIn) {
			return <div onClick={this.handleLogoutClick}>Logout</div>;
		} else {
			return (
				<form onSubmit={this.handleSubmit}>
					{this.props.error}
					<input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
					<input type="password" value={this.state.password} onChange={this.handlePasswordChange} />
					<input type="submit" value="Login" />
				</form>
			);
		}
	}
}

export default connect(
	(state) => ({
		isLoggedIn: session.selectors.isAuthenticated(state.session),
		isLoading: state.session.isFetching,
		error: state.session.error
	}),
	(dispatch) => ({
		login: (username, password) => {
			dispatch(session.operations.login(username, password));
		},
		logout: () => {
			dispatch(session.operations.logout());
		}
	})
)(LoginForm);
