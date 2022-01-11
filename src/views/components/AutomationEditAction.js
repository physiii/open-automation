import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import AutomationChooseServiceActionScreen from './AutomationChooseServiceActionScreen.js';
import ChooseDeviceScreen from './ChooseDeviceScreen.js';
import {getDevicesWithAutomatorSupport} from '../../state/ducks/devices-list/selectors.js';

export const AutomationEditAction = (props) => {
	return (
		<React.Fragment>
			{props.isNew && <ChooseDeviceScreen
				path={props.match.path}
				title="Add Action"
				instructions={<p>Choose Device Action.</p>}
				devices={props.devices}
				blankstateBody={'There are no devices that can trigger automations.'} />}
			<AutomationChooseServiceActionScreen
				isNew={props.isNew}
				path={props.match.path}
				actions={props.actions}
				saveAction={props.saveAction}
				deleteAction={props.deleteAction} />
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
