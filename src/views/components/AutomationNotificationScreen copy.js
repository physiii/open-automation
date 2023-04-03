import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import Form from './Form.js';
import Button from './Button.js';

export class AutomationNotificationScreen extends React.Component {
	constructor (props) {
		super(props);

		const notification = this.props.notifications.get(this.props.match.params.notificationIndex);

		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);

		this.state = {
			email: '',
			phone_number: '',
			phone_provider: '',
			message: '',
			...notification,
			notification_content: notification && notification.message ? 'custom' : 'trigger',
			forms_with_errors_count: 0,
			is_saveable: false
		};


		console.log("!!! ------- HIT ------------ !!! AutomationNotificationScreen")
	}

	handleSettingsErrors () {
		this.setState((state) => ({forms_with_errors_count: state.forms_with_errors_count + 1}));
	}

	handleNoSettingsErrors () {
		this.setState((state) => ({forms_with_errors_count: state.forms_with_errors_count - 1}));
	}

	handleSaveClick () {
		const type = this.props.match.params.type,
			notification = {type};

		if (type === 'email') {
			notification.email = this.state.email;
		} else if (type === 'sms') {
			notification.phone_number = this.state.phone_number;
			notification.phone_provider = this.state.phone_provider;
		}

		if (this.state.notification_content === 'custom') {
			notification.message = this.state.message;
		}

		this.props.saveNotification(notification, Number.parseInt(this.props.match.params.notificationIndex));
	}

	handleDeleteClick () {
		this.props.deleteNotification(Number.parseInt(this.props.match.params.notificationIndex));
	}

	render () {
		return (
			<NavigationScreen
				title={(this.props.isNew ? 'Add' : 'Edit') + ' Notification'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={
					<React.Fragment>
						{!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
						<Button disabled={this.state.forms_with_errors_count > 0} onClick={this.handleSaveClick}>Done</Button>
					</React.Fragment>}
				toolbarBackAction={{label: 'Back'}}>
				<SettingsScreenContainer>
					{this.props.match.params.type === 'email' &&
						<Form
							fields={{
								email: {
									type: 'string',
									label: 'Email Address',
									validation: {
										is_required: true,
										is_email: true
									}
								}
							}}
							values={{email: this.state.email}}
							onError={this.handleSettingsErrors}
							onNoError={this.handleNoSettingsErrors}
							onSaveableChange={({email}) => this.setState({email})} />}
					{this.props.match.params.type === 'sms' &&
						<Form
							fields={{
								phone_number: {
									type: 'string',
									label: 'Phone Number',
									validation: {
										is_required: true
									}
								},
								phone_provider: {
									type: 'one-of',
									label: 'Phone Provider',
									value_options: [
										{value: 'AT&T'},
										{value: 'T-Mobile'},
										{value: 'Verizon'},
										{value: 'Sprint'},
										{value: 'Virgin Mobile'},
										{value: 'Tracfone'},
										{value: 'MetroPCS'},
										{value: 'Boost'},
										{value: 'Cricket'},
										{value: 'US Cellular'}
									],
									validation: {
										is_required: true
									}
								}
							}}
							values={{
								phone_number: this.state.phone_number,
								phone_provider: this.state.phone_provider
							}}
							onError={this.handleSettingsErrors}
							onNoError={this.handleNoSettingsErrors}
							onSaveableChange={(values) => this.setState({
								phone_number: values.phone_number,
								phone_provider: values.phone_provider
							})} />}
					<Form
						fields={{
							notification_content: {
								type: 'one-of',
								label: 'Message',
								value_options: [
									{
										value: 'trigger',
										label: 'A description of what triggered the automation'
									},
									{
										value: 'custom',
										label: 'A custom message'
									}
								]
							}
						}}
						values={{notification_content: this.state.notification_content}}
						onError={this.handleSettingsErrors}
						onNoError={this.handleNoSettingsErrors}
						onSaveableChange={(values) => this.setState({notification_content: values.notification_content})} />
					{this.state.notification_content === 'trigger' &&
						<SettingsScreenContainer withPadding={true}>
							<p>The notification content will be based on what triggers the automation.</p>
							<p>Example: "Movement was detected on Front Door Camera at 6:50 am on Tuesday, September 3rd."</p>
						</SettingsScreenContainer>}
					{this.state.notification_content === 'custom' &&
						<Form
							fields={{
								message: {
									type: 'long-string',
									label: 'Custom Message',
									validation: {
										is_required: true,
										max_length: 140
									}
								}
							}}
							values={{message: this.state.message}}
							onError={this.handleSettingsErrors}
							onNoError={this.handleNoSettingsErrors}
							onSaveableChange={(values) => this.setState({message: values.message})} />}
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

AutomationNotificationScreen.propTypes = {
	notifications: PropTypes.object,
	notificationIndex: PropTypes.number,
	isNew: PropTypes.bool,
	saveNotification: PropTypes.func.isRequired,
	deleteNotification: PropTypes.func,
	match: PropTypes.object.isRequired
};

// export default withRoute({params: '/notification/email'})(AutomationNotificationScreen);
export default withRoute({params: '/:type/:notificationIndex?'})(AutomationNotificationScreen);

