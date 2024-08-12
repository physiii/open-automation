import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField.js';
import Actions from './Actions.js';
import Button from './Button.js';
import {default as FormValidator, minLength, mustMatch, email} from '../form-validation.js';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

const PASSWORD_MIN_LENGTH = 8;

export class RegisterForm extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			email: '',
			password: '',
			confirm_password: '',
			validation_errors: {}
		};

		this.validator = new FormValidator(this.state)
			.field('email', 'Email', email)
			.field('password', 'Password', minLength(PASSWORD_MIN_LENGTH))
			.field('confirm_password', 'Password Confirmation', mustMatch('password', 'Password'));

		this.handleFieldChange = this.handleFieldChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidUpdate () {
		this.validator.setState(this.state);
	}

	handleFieldChange (event) {
		const newValue = event.target.value;

		this.setState({
			[event.target.name]: newValue,
			validation_errors: this.validator.validateField(event.target.name, newValue, event.type)
		});
	}

	handleSubmit (event) {
		event.preventDefault();

		const errors = this.validator.validateForm();

		if (this.validator.hasErrors()) {
			this.setState({validation_errors: errors});

			return;
		}

		this.props.register(this.state.email, this.state.password);
	}

	render () {
		return (
			<form onSubmit={this.handleSubmit}>
				<TextField
					name="email"
					label="Email"
					type="email"
					autoComplete="email"
					value={this.state.email}
					error={this.state.validation_errors.email}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldChange} />
				<TextField
					name="password"
					label="Password"
					type="password"
					autoComplete="new-password"
					value={this.state.password}
					error={this.state.validation_errors.password}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldChange} />
				<TextField
					name="confirm_password"
					label="Confirm Password"
					type="password"
					autoComplete="new-password"
					value={this.state.confirm_password}
					error={this.state.validation_errors.confirm_password}
					onChange={this.handleFieldChange}
					onBlur={this.handleFieldChange} />
				<Actions>
					<Button type="filled" submitForm={true}>Create Account</Button>
				</Actions>
			</form>
		);
	}
}

RegisterForm.propTypes = {
	register: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
	register: (username, password) => {
		dispatch(session.operations.register(username, password));
	}
});

export default connect(null, mapDispatchToProps)(RegisterForm);
