import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import AutomationChooseServiceActionScreen from './AutomationChooseServiceActionScreen.js';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import ChooseDeviceScreen from './ChooseDeviceScreen.js';
import Button from './Button.js';
import {getDevicesWithAutomatorSupport} from '../../state/ducks/devices-list/selectors.js';

export const AutomationEditAction = (props) => {
	return (
		<React.Fragment>
			{props.isNew && <ChooseDeviceScreen
				// path={props.match.path + '/notification'}
				isNew={props.isNew}
				notifications={props.notifications}
				saveNotification={props.saveNotification}
				deleteNotification={props.deleteNotification}

				path={props.match.path}
				title="Add Action"
				instructions={<p>Choose Device Action.</p>}
				devices={props.devices}
				blankstateBody={'There are no devices that can trigger automations.'} />}
			<AutomationChooseServiceActionScreen
				devices={props.devices}
				isNew={props.isNew}
				path={props.match.path}
				actions={props.actions}
				saveAction={props.saveAction}
				deleteAction={props.deleteAction} />
				<div>
					<h1>Send a !! Notification</h1>
					<Button to={props.match.url + '/notification/email'}>Email</Button>
					<Button to={props.match.url + '/notification/sms'}>SMS</Button>
					<AutomationNotificationScreen
						path={props.match.path + '/notification'}
						isNew={props.isNew}
						notifications={props.notifications}
						saveNotification={props.saveNotification}
						deleteNotification={props.deleteNotification} />
				</div>
		</React.Fragment>
	);
};

AutomationEditAction.propTypes = {
	isNew: PropTypes.bool,
	actions: PropTypes.object,
	devices: PropTypes.array.isRequired,
	saveAction: PropTypes.func.isRequired,
	deleteAction: PropTypes.func,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList}) => ({
	devices: getDevicesWithAutomatorSupport(devicesList)
});

export default withRouter(connect(mapStateToProps)(AutomationEditAction));
