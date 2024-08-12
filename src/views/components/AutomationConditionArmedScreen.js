import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import ArmMenu from './ArmMenu.js';
import Button from './Button.js';

export class AutomationConditionArmedScreen extends React.Component {
	constructor (props) {
		super(props);

		this.handleModeClick = this.handleModeClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
	}

	handleModeClick (mode) {
		this.props.saveCondition(
			{
				type: 'armed',
				mode
			},
			Number.parseInt(this.props.match.params.conditionIndex)
		);
	}

	handleDeleteClick () {
		this.props.deleteCondition(Number.parseInt(this.props.match.params.conditionIndex));
	}

	render () {
		const condition = this.props.conditions && this.props.conditions.get(Number.parseInt(this.props.match.params.conditionIndex)),
			armedMode = condition ? condition.mode : null;

		return (
			<NavigationScreen
				title={(this.props.isNew ? 'Add' : 'Edit') + ' Condition'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
				toolbarBackAction={{label: 'Back'}}>
				<SettingsScreenContainer withPadding={true}>
					<p>Choose the armed status that must be active for this automation to run.</p>
					<ArmMenu mode={armedMode} labelsAllOn={true} setArmed={this.handleModeClick} />
				</SettingsScreenContainer>
			</NavigationScreen>
		);
	}
}

AutomationConditionArmedScreen.propTypes = {
	conditions: PropTypes.object,
	conditionIndex: PropTypes.number,
	isNew: PropTypes.bool,
	saveCondition: PropTypes.func.isRequired,
	deleteCondition: PropTypes.func,
	match: PropTypes.object.isRequired
};

export default withRoute({params: '/:conditionIndex?'})(AutomationConditionArmedScreen);
