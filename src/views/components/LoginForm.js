import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Redirect} from 'react-router-dom';
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

	render () {
		// TODO: Break up this component.
		if (this.props.isLoggedIn) {
			return <Redirect to="/" />;
		}

		if (this.props.isLoading) {
			return <div>Loading</div>;
		}

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

const mapStateToProps = (state) => ({
	isLoggedIn: session.selectors.isAuthenticated(state.session),
	isLoading: state.session.isFetching,
	error: state.session.error
});

const mapDispatchToProps = (dispatch) => ({
	login: (username, password) => {
		dispatch(session.operations.login(username, password));
	}
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
