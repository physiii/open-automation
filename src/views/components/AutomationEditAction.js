import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import Button from './Button.js';

export const AutomationEditAction = (props) => {
	return (
		<React.Fragment>
			{props.isNew && <NavigationScreen
				title={'Add Action'}
				url={props.match.url}>
				<SettingsScreenContainer withPadding={true}>
					<h1>Send a Notification</h1>
					<Button to={props.match.url + '/notification/email'}>Email</Button>
					<Button to={props.match.url + '/notification/sms'}>SMS</Button>
				</SettingsScreenContainer>
			</NavigationScreen>}
			<AutomationNotificationScreen
				path={props.match.path + '/notification'}
				isNew={props.isNew}
				notifications={props.notifications}
				saveNotification={props.saveNotification}
				deleteNotification={props.deleteNotification} />
		</React.Fragment>
	);
};

AutomationEditAction.propTypes = {
	isNew: PropTypes.bool,
	notifications: PropTypes.object,
	saveNotification: PropTypes.func.isRequired,
	deleteNotification: PropTypes.func,
	match: PropTypes.object.isRequired
};

export default withRouter(AutomationEditAction);
