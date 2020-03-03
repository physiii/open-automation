import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import ChooseDeviceScreen from './ChooseDeviceScreen.js';
import AutomationChooseServiceTriggerScreen from './AutomationChooseServiceTriggerScreen.js';
import {getDevicesWithAutomatorSupport} from '../../state/ducks/devices-list/selectors.js';

export const AutomationEditTrigger = (props) => {
	return (
		<React.Fragment>
			{props.isNew && <ChooseDeviceScreen
				path={props.match.path}
				title="Add Trigger"
				instructions={<p>Choose which device should trigger this automation.</p>}
				devices={props.devices}
				blankstateBody={'There are no devices that can trigger automations.'} />}
			<AutomationChooseServiceTriggerScreen
				isNew={props.isNew}
				path={props.match.path}
				triggers={props.triggers}
				saveTrigger={props.saveTrigger}
				deleteTrigger={props.deleteTrigger} />
		</React.Fragment>
	);
};

AutomationEditTrigger.propTypes = {
	isNew: PropTypes.bool,
	triggers: PropTypes.object,
	devices: PropTypes.array.isRequired,
	saveTrigger: PropTypes.func.isRequired,
	deleteTrigger: PropTypes.func,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList}) => ({
	devices: getDevicesWithAutomatorSupport(devicesList)
});

export default withRouter(connect(mapStateToProps)(AutomationEditTrigger));
