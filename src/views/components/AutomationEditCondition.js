import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import AutomationConditionArmedScreen from './AutomationConditionArmedScreen.js';
import Button from './Button.js';

export const AutomationEditCondition = (props) => {
	return (
		<React.Fragment>
			{props.isNew && <NavigationScreen
				title={'Add Condition'}
				url={props.match.url}>
				<SettingsScreenContainer withPadding={true}>
					<p>Choose which type of condition to add.</p>
					<Button to={props.match.url + '/armed'}>Armed Status</Button>
				</SettingsScreenContainer>
			</NavigationScreen>}
			<AutomationConditionArmedScreen
				path={props.match.path + '/armed'}
				isNew={props.isNew}
				conditions={props.conditions}
				saveCondition={props.saveCondition}
				deleteCondition={props.deleteCondition} />
		</React.Fragment>
	);
};

AutomationEditCondition.propTypes = {
	isNew: PropTypes.bool,
	conditions: PropTypes.object,
	saveCondition: PropTypes.func.isRequired,
	deleteCondition: PropTypes.func,
	match: PropTypes.object.isRequired
};

export default withRouter(AutomationEditCondition);
