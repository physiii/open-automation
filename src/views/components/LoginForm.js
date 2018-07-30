import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField.js';
import Actions from './Actions.js';
import Button from './Button.js';
import {default as FormValidator, required} from '../form-validation.js';
import {connect} from 'react-redux';
import * as session from '../../state/ducks/session';

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
	login: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
	login: (username, password) => {
		dispatch(session.operations.login(username, password));
	}
});

export default connect(null, mapDispatchToProps)(LoginForm);
