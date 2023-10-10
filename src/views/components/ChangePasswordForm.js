import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import TextField from './TextField.js';
import Actions from './Actions.js';
import Button from './Button.js';
import { default as FormValidator, minLength, mustMatch } from '../form-validation.js';
import { connect } from 'react-redux';
import * as session from '../../state/ducks/session';

const PASSWORD_MIN_LENGTH = 8;

export class ChangePasswordForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
            validation_errors: {},
            redirect: false
        };

        this.validator = new FormValidator(this.state)
            .field('username', 'Username')
            .field('currentPassword', 'Current Password', minLength(PASSWORD_MIN_LENGTH))
            .field('newPassword', 'New Password', minLength(PASSWORD_MIN_LENGTH))
            .field('confirmPassword', 'Password Confirmation', mustMatch('newPassword', 'New Password'));

        this.handleFieldChange = this.handleFieldChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate() {
        this.validator.setState(this.state);
    }

    handleFieldChange(event) {
        const newValue = event.target.value;

        this.setState({
            [event.target.name]: newValue,
            validation_errors: this.validator.validateField(event.target.name, newValue, event.type)
        });
    }

    handleSubmit(event) {
        event.preventDefault();

        const errors = this.validator.validateForm();

        if (this.validator.hasErrors()) {
            this.setState({ validation_errors: errors });
            return;
        }

        this.props.changePassword(this.state.username, this.state.currentPassword, this.state.newPassword);
        this.setState({ redirect: true });
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to="/login" />;
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <TextField
                    name="username"
                    label="Username"
                    autoComplete="username"
                    value={this.state.username}
                    error={this.state.validation_errors.username}
                    onChange={this.handleFieldChange}
                    onBlur={this.handleFieldChange}
                />
                <TextField
                    name="currentPassword"
                    label="Current Password"
                    type="password"
                    autoComplete="current-password"
                    value={this.state.currentPassword}
                    error={this.state.validation_errors.currentPassword}
                    onChange={this.handleFieldChange}
                    onBlur={this.handleFieldChange}
                />
                <TextField
                    name="newPassword"
                    label="New Password"
                    type="password"
                    autoComplete="new-password"
                    value={this.state.newPassword}
                    error={this.state.validation_errors.newPassword}
                    onChange={this.handleFieldChange}
                    onBlur={this.handleFieldChange}
                />
                <TextField
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    autoComplete="new-password"
                    value={this.state.confirmPassword}
                    error={this.state.validation_errors.confirmPassword}
                    onChange={this.handleFieldChange}
                    onBlur={this.handleFieldChange}
                />
                <Actions>
                    <Button type="filled" submitForm={true}>Change Password</Button>
                </Actions>
            </form>
        );
    }
}

ChangePasswordForm.propTypes = {
    changePassword: PropTypes.func
};

const mapDispatchToProps = (dispatch) => ({
    changePassword: (username, currentPassword, newPassword) => {
        dispatch(session.operations.changePassword(username, currentPassword, newPassword));
    }
});

export default connect(null, mapDispatchToProps)(ChangePasswordForm);
