import React from 'react';
import PropTypes from 'prop-types';
import {withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import Button from './Button.js';

const DISARMED = 0,
	ARMED_STAY = 1,
	ARMED_AWAY = 2;

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
		return (
			<NavigationScreen
				title={(this.props.isNew ? 'Add' : 'Edit') + ' Condition'}
				url={this.props.match.urlWithoutOptionalParams}
				toolbarActions={!this.props.isNew && <Button onClick={this.handleDeleteClick}>Delete</Button>}
				toolbarBackAction={{label: 'Back'}}>
				<Button onClick={() => this.handleModeClick(ARMED_AWAY)}>Armed Away</Button>
				<Button onClick={() => this.handleModeClick(ARMED_STAY)}>Armed Stay</Button>
				<Button onClick={() => this.handleModeClick(DISARMED)}>Disarmed</Button>
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
