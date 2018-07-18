import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField.js';
import Actions from './Actions.js';
import Button from './Button.js';
import {default as FormValidator, required} from '../form-validation.js';
import {Redirect} from 'react-router-dom';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';
import './LoginForm.css';

export class LoginForm extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			validation_errors: {}
		};

		this.validator = new FormValidator(this.state)
			.field('email', 'Email', required)
			.field('password', 'Password', required);

		this.handleFieldChange = this.handleFieldChange.bind(this);
		this.handleFieldBlur = this.handleFieldBlur.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidUpdate () {
		this.validator.setState(this.state);
	}

	handleFieldChange (event, field) {
		const newValue = event.target.value;

		this.setState({
			[field]: newValue,
			validation_errors: this.validator.validateField(field, 'change', newValue)
		});
	}

	handleFieldBlur (event, field) {
		const newValue = event.target.value;

		this.setState({
			[field]: newValue,
			validation_errors: this.validator.validateField(field, 'blur', newValue)
		});
	}

	handleSubmit (event) {
		event.preventDefault();

		const errors = this.validator.validateForm();

		if (this.validator.hasErrors()) {
			this.setState({validation_errors: errors});

			return;
		}

		this.props.login(this.state.email, this.state.password);
	}

	render () {
		if (this.props.isLoggedIn) {
			return <Redirect to="/" />;
		}

		if (this.props.isLoading) {
			return <div>Loading</div>;
		}

		return (
			<form onSubmit={this.handleSubmit}>
				<TextField
					name="email"
					label="Email"
					value={this.state.email}
					error={this.state.validation_errors.email}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldBlur} />
				<TextField
					name="password"
					label="Password"
					type="password"
					value={this.state.password}
					error={this.state.validation_errors.password}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldBlur} />
				<Actions>
					<Button type="filled" submitForm={true}>Login</Button>
				</Actions>
			</form>
		);
	}
}

LoginForm.propTypes = {
	isLoggedIn: PropTypes.bool,
	isLoading: PropTypes.bool,
	login: PropTypes.func
};

const mapStateToProps = (state) => ({
		isLoggedIn: session.selectors.isAuthenticated(state.session),
		isLoading: state.session.isFetching
	}),
	mapDispatchToProps = (dispatch) => ({
		login: (username, password) => {
			dispatch(session.operations.login(username, password));
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
