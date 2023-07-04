import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
// import Form from './Form.js';
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

		this.props.saveNotification(notification, Number.parseInt(this.props.match.params.notificationIndex, 10));
	}

	handleDeleteClick () {
		this.props.deleteNotification(Number.parseInt(this.props.match.params.notificationIndex, 10));
	}

	render () {
		return (
			<NavigationScreen
				title={`${this.props.isNew ? 'Add' : 'Edit'} Notification`}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={
					<React.Fragment>
						{!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
						<Button disabled={this.state.forms_with_errors_count > 0} onClick={this.handleSaveClick}>Done</Button>
					</React.Fragment>
				}
				toolbarBackAction={{label: 'Back'}}>
				<SettingsScreenContainer>
					{/* Content of the SettingsScreenContainer goes here */}
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

export default withRoute({params: '/:type/:notificationIndex?'})(AutomationNotificationScreen);
