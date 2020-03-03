import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {Switch, Redirect} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import AutomationEditScreen from './AutomationEditScreen.js';
import List from './List.js';
import Button from './Button.js';
import BlankState from './BlankState.js';
import AddIcon from '../icons/AddIcon.js';
import ShieldIcon from '../icons/ShieldIcon.js';
import {getAutomations, hasInitialFetchCompleted} from '../../state/ducks/automations-list/selectors.js';

export const AutomationsScreen = (props) => {
	return (
		<NavigationScreen
			title="Automations"
			url={props.match.urlWithoutOptionalParams}
			isContextRoot={true}
			toolbarActions={<Button to={props.match.url + '/add/new'}><AddIcon size={20} /></Button>}>
			{props.error && <p>{props.error}</p>}
			{props.isLoading
				? <span>Loading</span>
				: <Switch>
					<Route exact path={props.match.path} render={() => (
						<React.Fragment>
							{!props.automations.length &&
								<BlankState
									heading="No Automations"
									body="Use the ‘Add’ button and automations will show up here." />
							}
							<List isOrdered={true} renderIfEmpty={false}>
								{props.automations.sort((automation) => automation.type === 'security' ? -1 : 1).map((automation) => ({
									key: automation.id,
									icon: automation.type === 'security' ? <ShieldIcon size={24} /> : <span style={{width: 24}} />,
									label: automation.name || 'Automation',
									link: props.match.url + '/' + automation.id
								}))}
							</List>
						</React.Fragment>
					)} />
					<AutomationEditScreen path={props.match.path + '/add'} isNew={true} />
					<AutomationEditScreen path={props.match.path} />
					<Route render={() => <Redirect to={props.match.url} />} />
				</Switch>}
		</NavigationScreen>
	);
};

AutomationsScreen.propTypes = {
	automations: PropTypes.array.isRequired,
	error: PropTypes.string,
	isLoading: PropTypes.bool,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({automationsList}) => ({
	automations: getAutomations(automationsList, false)
		.filter((automation) => automation.user_editable)
		.reverse()
		.toList()
		.toJS(),
	isLoading: !hasInitialFetchCompleted(automationsList)
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(AutomationsScreen);
