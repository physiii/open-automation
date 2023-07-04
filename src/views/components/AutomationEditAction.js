<<<<<<< HEAD
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
=======
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import AutomationChooseServiceActionScreen from './AutomationChooseServiceActionScreen.js';
import AutomationNotificationScreen from './AutomationNotificationScreen.js';
import ChooseDeviceScreen from './ChooseDeviceScreen.js';
import Button from './Button.js';
<<<<<<< HEAD
import {getDevicesWithAutomatorSupport} from '../../state/ducks/devices-list/selectors.js';

export const AutomationEditAction = (props) => {
	const [showAutomationNotificationScreen, setShowAutomationNotificationScreen] = useState(true),
		toggleNotificationScreen = () => {
			setShowAutomationNotificationScreen(!showAutomationNotificationScreen);
		};

	return (
		<React.Fragment>
			{props.isNew && showAutomationNotificationScreen && (
				<div>
					<NavigationScreen
						title={'Add Action'}
						url={props.match.url}>
						<SettingsScreenContainer withPadding={true}>
							<h1>Perform an Action</h1>
							<Button to={props.match.url + '/notification/email'}>Email</Button>
							<Button to={props.match.url + '/notification/sms'}>SMS</Button>
							<Button onClick={toggleNotificationScreen}>Device</Button>
						</SettingsScreenContainer>
					</NavigationScreen>
					<AutomationNotificationScreen
						path={props.match.path + '/notification'}
						isNew={props.isNew}
						notifications={props.notifications}
						saveNotification={props.saveNotification}
						deleteNotification={props.deleteNotification}/>
				</div>
			)}

			{props.isNew && !showAutomationNotificationScreen && (
				<div>
					<ChooseDeviceScreen
						// path={props.match.path + '/notification'}
						isNew={props.isNew}
						notifications={props.notifications}
						saveNotification={props.saveNotification}
						deleteNotification={props.deleteNotification}
						path={props.match.path}
						title="Add Action"
						instructions={<p>Choose Device Action.</p>}
						devices={props.devices}
						blankstateBody={'There are no devices that can trigger automations.'}/>
					<AutomationChooseServiceActionScreen
						devices={props.devices}
						isNew={props.isNew}
						path={props.match.path}
						actions={props.actions}
						saveAction={props.saveAction}
						deleteAction={props.deleteAction}/>
				</div>
			)}
		</React.Fragment>
	);
};

AutomationEditAction.propTypes = {
	isNew: PropTypes.bool,
	actions: PropTypes.object,
	devices: PropTypes.array.isRequired,
	saveAction: PropTypes.func.isRequired,
	deleteAction: PropTypes.func,
	match: PropTypes.object.isRequired,
	notifications: PropTypes.array,
	saveNotification: PropTypes.func,
	deleteNotification: PropTypes.func
=======
import { getDevicesWithAutomatorSupport } from '../../state/ducks/devices-list/selectors.js';

export const AutomationEditAction = (props) => {
  const [showAutomationNotificationScreen, setShowAutomationNotificationScreen] = useState(true);

  const toggleNotificationScreen = () => {
    setShowAutomationNotificationScreen(!showAutomationNotificationScreen);
  }

  return (
    <React.Fragment>
      {props.isNew && showAutomationNotificationScreen &&
	  	<div>
			<NavigationScreen
			title={'Add Action'}
			url={props.match.url}>
			<SettingsScreenContainer withPadding={true}>
				<h1>Perform an Action</h1>
				<Button to={props.match.url + '/notification/email'}>Email</Button>
				<Button to={props.match.url + '/notification/sms'}>SMS</Button>
				<Button onClick={toggleNotificationScreen}>Device</Button>
			</SettingsScreenContainer>
			</NavigationScreen>
			<AutomationNotificationScreen
			path={props.match.path + '/notification'}
			isNew={props.isNew}
			notifications={props.notifications}
			saveNotification={props.saveNotification}
			deleteNotification={props.deleteNotification} />
		</div>
      }

      {props.isNew && !showAutomationNotificationScreen &&
	  	<div>
			<ChooseDeviceScreen
			// path={props.match.path + '/notification'}
			isNew={props.isNew}
			notifications={props.notifications}
			saveNotification={props.saveNotification}
			deleteNotification={props.deleteNotification}
			path={props.match.path}
			title="Add Action"
			instructions={<p>Choose Device Action.</p>}
			devices={props.devices}
			blankstateBody={'There are no devices that can trigger automations.'} />
			<AutomationChooseServiceActionScreen
			devices={props.devices}
			isNew={props.isNew}
			path={props.match.path}
			actions={props.actions}
			saveAction={props.saveAction}
			deleteAction={props.deleteAction} />
		</div>
      }

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
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
};

const mapStateToProps = ({ devicesList }) => ({
  devices: getDevicesWithAutomatorSupport(devicesList)
});

export default withRouter(connect(mapStateToProps)(AutomationEditAction));
