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
import {getDevices} from '../../state/ducks/devices-list/selectors.js';
import {getServices} from '../../state/ducks/services-list/selectors.js';
import {getAutomations, hasInitialFetchCompleted} from '../../state/ducks/automations-list/selectors.js';

export const AutomationsScreen = (props) => {
	return (
		<NavigationScreen
			title="Automations"
			url={props.match.urlWithoutOptionalParams}
			isContextRoot={true}
			toolbarActions={<Button to={props.match.url + '/add/new'}>Add</Button>}>
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
								{props.automations.map((automation) => ({
									key: automation.id,
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
	devices: PropTypes.object.isRequired, // TODO
	services: PropTypes.object.isRequired, // TODO
	automations: PropTypes.array.isRequired,
	error: PropTypes.string,
	isLoading: PropTypes.bool,
	match: PropTypes.object.isRequired
};

const mapStateToProps = ({devicesList, servicesList, automationsList}) => ({
	devices: getDevices(devicesList, false), // TODO
	services: getServices(servicesList, false), // TODO
	automations: getAutomations(automationsList, false).reverse().toList().toJS(),
	isLoading: !hasInitialFetchCompleted(automationsList)
});

export default compose(
	withRoute(),
	connect(mapStateToProps)
)(AutomationsScreen);
