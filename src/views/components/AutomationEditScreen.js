import React from 'react';
import PropTypes from 'prop-types';
import {Switch, Redirect, Link} from 'react-router-dom';
import {Route, withRoute} from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import SettingsScreenContainer from './SettingsScreenContainer.js';
import Button from './Button.js';
import Form from './Form.js';
import AutomationEditTrigger from './AutomationEditTrigger.js';
import AutomationEditCondition from './AutomationEditCondition.js';
import AutomationEditAction from './AutomationEditAction.js';
import AddIcon from '../icons/AddIcon.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {addAutomation, saveAutomation, deleteAutomation} from '../../state/ducks/automations-list/operations.js';
import {getAutomationById, getEmptyAutomation} from '../../state/ducks/automations-list/selectors.js';
import {getServices} from '../../state/ducks/services-list/selectors.js';
import styles from './AutomationEditScreen.css';

const ARMED_LABELS = [
	'Disarmed',
	'Armed – Stay',
	'Armed – Away'
];

export class AutomationEditScreen extends React.Component {
	constructor (props) { // eslint-disable-line max-statements
		super(props);

		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleDeleteClick = this.handleDeleteClick.bind(this);
		this.handleSettingsChange = this.handleSettingsChange.bind(this);
		this.handleSettingsErrors = this.handleSettingsErrors.bind(this);
		this.handleNoSettingsErrors = this.handleNoSettingsErrors.bind(this);
		this.saveTrigger = this.saveElement.bind(this, 'triggers');
		this.saveAction = this.saveElement.bind(this, 'actions');
		this.saveCondition = this.saveElement.bind(this, 'conditions');
		this.saveNotification = this.saveElement.bind(this, 'notifications');
		this.deleteTrigger = this.deleteElement.bind(this, 'triggers');
		this.deleteAction = this.deleteElement.bind(this, 'actions');
		this.deleteCondition = this.deleteElement.bind(this, 'conditions');
		this.deleteNotification = this.deleteElement.bind(this, 'notifications');

		this.state = {
			automation: this.props.isNew
				? getEmptyAutomation()
				: this.props.automation,
			isSaveable: !this.props.isNew,
			shouldRedirectBack: false
		};
	}

	handleSettingsChange ({name, is_enabled: isEnabled}) {
		this.setState({
			automation: this.state.automation
				.set('name', name)
				.set('is_enabled', this.props.isNew ? true : isEnabled),
			isSaveable: true
		});
	}

	handleSettingsErrors () {
		this.setState({isSaveable: false});
	}

	handleNoSettingsErrors () {
		this.setState({isSaveable: true});
	}

	handleSaveClick () {
		if (this.props.isNew) {
			this.props.addAutomation(this.state.automation);
		} else {
			this.props.saveAutomation(this.state.automation, this.props.automation);
		}

		this.setState({shouldRedirectBack: true});
	}

	handleDeleteClick () {
		if (confirm('Do you want to delete ' + (this.state.automation.name
			? '‘' + this.state.automation.name + '’'
			: 'this automation') + '?')) {
			this.props.deleteAutomation(this.props.automation);
		}
	}

	saveElement (type, element, index) {
		if (Number.isInteger(index)) {
			this.setState({automation: this.state.automation.setIn([type, index], element)});
		} else {
			this.setState({automation: this.state.automation.updateIn([type], (elements) => elements.push(element))});
		}

		this.props.history.push(this.props.match.url);
	}

	deleteElement (type, index) {
		this.setState({automation: this.state.automation.deleteIn([type, index])});
		this.props.history.push(this.props.match.url);
	}

	render () {
		if (this.state.shouldRedirectBack || (!this.props.isNew && !this.props.automation)) {
			return <Redirect to={this.props.match.parentMatch.url} />;
		}

		const triggers = this.state.automation.triggers.toArray(),
			actions = this.state.automation.actions.toArray(),
			conditions = this.state.automation.conditions.toArray(),
			notifications = this.state.automation.notifications.toArray(),
			userEditable = this.state.automation.user_editable,
			areTriggersEditable = userEditable && (userEditable.triggers !== false),
			areConditionsEditable = userEditable && (userEditable.conditions !== false),
			areNotificationsEditable = userEditable && (userEditable.notifications !== false),
			areActionsEditable = userEditable && (userEditable.actions !== false);

		return (
			<NavigationScreen
				title={this.props.isNew ? 'Add Automation' : this.state.automation.name}
				url={this.props.match.url}
				toolbarActions={
					<React.Fragment>
						{!this.props.isNew ? <Button onClick={this.handleDeleteClick} disabled={!userEditable || (userEditable.delete === false)}>Delete</Button> : null}
						<Button onClick={this.handleSaveClick} disabled={!this.state.isSaveable}>Save</Button>
					</React.Fragment>}
				toolbarBackAction={<Button to={this.props.match.parentMatch.url}>Cancel</Button>}>
				<Switch>
					<Route exact path={this.props.match.path} render={() => ( // eslint-disable-line complexity
						<SettingsScreenContainer>
							<Form
								fields={{
									name: {
										type: 'string',
										label: 'Name',
										validation: {
											is_required: true,
											max_length: 24
										},
										disabled: userEditable && (userEditable.name === false)
									},
									is_enabled: this.props.isNew ? null : {
										type: 'boolean',
										label: 'Enable this automation',
										disabled: userEditable && (userEditable.is_enabled === false)
									}
								}}
								values={this.state.automation}
								onSaveableChange={this.handleSettingsChange}
								onError={this.handleSettingsErrors}
								onNoError={this.handleNoSettingsErrors} />
							<div className={styles.sections}>
								<section className={styles.section}>
									<h1 className={styles.sectionHeading}>When this happens</h1>
									<div className={styles.sectionContent}>
										{triggers.length ? <ul className={styles.elementList}>
											{triggers.map((trigger, index) => {
<<<<<<< HEAD
												console.log('trigger:', trigger);
												console.log('services:', this.props.services);
=======
												console.log("trigger:", trigger);
												console.log("services:", this.props.services);
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
												const service = this.props.services.get(trigger.service_id);

												if (!service) {
													return null;
												}

												return (
													<li className={styles.elementListItem} key={index}>
														<Link className={styles.elementListLink} to={areTriggersEditable ? this.props.match.url + '/edit-trigger/' + service.device_id + '/' + index : '#'}>
															{service.getEventLabel(trigger.event) + ' on ' + service.settings.get('name')}
														</Link>
													</li>
												);
											})}
										</ul> : null}
										{areTriggersEditable
<<<<<<< HEAD
											? <span className={triggers.length ? styles.addButton : styles.primaryAddButton}>
												<span className={triggers.length ? styles.addButtonLink : styles.primaryAddButtonLink}>
=======
											? <span styleName={triggers.length ? 'addButton' : 'primaryAddButton'}>
												<span styleName={triggers.length ? 'addButtonLink' : 'primaryAddButtonLink'}>
>>>>>>> 70ee17dbff37ffd959c7a656e7fa5a71e9deefa5
													<Button to={this.props.match.url + '/add-trigger'}>
														<span className={triggers.length ? styles.addButtonIcon : styles.primaryAddButtonIcon}><AddIcon size={12} /></span>
														<span className={triggers.length ? styles.addButtonLabel : styles.primaryAddButtonLabel}>Add Trigger</span>
													</Button>
												</span>
											</span>
											: !triggers.length && <span className={styles.addButtonPlaceholder}><span className={styles.addButtonPlaceholderInner} /></span>}
									</div>
								</section>
								<section className={styles.section}>
									<h1 className={styles.sectionHeading}>Under the condition</h1>
									<div className={styles.sectionContent}>
										{conditions.length ? <ul className={styles.elementList}>
											{conditions.map((condition, index) => (
												<li className={styles.elementListItem} key={index}>
													<Link className={styles.elementListLink} to={areConditionsEditable ? this.props.match.url + '/edit-condition/' + condition.type + '/' + index : '#'}>
														{ARMED_LABELS[condition.mode]}
													</Link>
												</li>
											))}
										</ul> : null}
										{triggers.length && areConditionsEditable
											? <span className={styles.addButton}>
												<span className={styles.addButtonLink}>
													<Button to={this.props.match.url + '/add-condition'}>
														<span className={styles.addButtonIcon}><AddIcon size={12} /></span>
														<span className={styles.addButtonLabel}>Add Condition</span>
													</Button>
												</span>
											</span>
											: !conditions.length && <span className={styles.addButtonPlaceholder}><span className={styles.addButtonPlaceholderInner} /></span>}
									</div>
								</section>
								<section className={styles.section}>
									<h1 className={styles.sectionHeading}>Perform these actions</h1>
									<div className={styles.sectionContent}>
										{notifications.length || actions.length ? <ul className={styles.elementList}>
											{notifications.map((notification, index) => (
												<li className={styles.elementListItem} key={index}>
													<Link className={styles.elementListLink} to={areNotificationsEditable ? this.props.match.url + '/edit-action/notification/' + notification.type + '/' + index : '#'}>
														{notification.type === 'email'
															? 'Email ' + notification.email
															: 'Send text to ' + notification.phone_number}
													</Link>
												</li>
											))}
											{actions.map((action, index) => {
												const service = this.props.services.get(action.service_id);

												if (!service) {
													return null;
												}

												// {service.action_definitions.toArray().map(([action, definition]) => (
												// 	<Button key={action} onClick={() => this.handleActionClick(action, service)}>
												// 		{definition.label}
												// 	</Button>
												// ))}

												return (
													<li className={styles.elementListItem} key={index}>
														<Link className={styles.elementListLink} to={areActionsEditable ? this.props.match.url + '/edit-action/' + service.device_id + '/' + index : '#'}>
															{service.settings.get('name') + ' ' + action.action}
														</Link>
													</li>
												);
											})}
										</ul> : null}
										{triggers.length && (areNotificationsEditable || areActionsEditable)
											? <span className={notifications.length ? styles.addButton : styles.primaryAddButton}>
												<span className={notifications.length ? styles.addButtonLink : styles.primaryAddButtonLink}>
													<Button to={this.props.match.url + '/add-action'}>
														<span className={notifications.length ? styles.addButtonIcon : styles.primaryAddButtonIcon}><AddIcon size={12} /></span>
														<span className={notifications.length ? styles.addButtonLabel : styles.primaryAddButtonLabel}>Add Action</span>
													</Button>
												</span>
											</span>
											: !notifications.length && <span className={styles.addButtonPlaceholder}><span className={styles.addButtonPlaceholderInner} /></span>}
									</div>
								</section>
							</div>
						</SettingsScreenContainer>
					)} />
					<Route path={this.props.match.path + '/add-trigger'} render={() => (
						<AutomationEditTrigger
							isNew={true}
							saveTrigger={this.saveTrigger} />
					)} />
					<Route path={this.props.match.path + '/edit-trigger'} render={() => (
						<AutomationEditTrigger
							triggers={this.state.automation.triggers}
							saveTrigger={this.saveTrigger}
							deleteTrigger={this.deleteTrigger} />
					)} />
					<Route path={this.props.match.path + '/add-condition'} render={() => (
						<AutomationEditCondition
							isNew={true}
							saveCondition={this.saveCondition} />
					)} />
					<Route path={this.props.match.path + '/edit-condition'} render={() => (
						<AutomationEditCondition
							conditions={this.state.automation.conditions}
							saveCondition={this.saveCondition}
							deleteCondition={this.deleteCondition} />
					)} />
					<Route path={this.props.match.path + '/add-action'} render={() => (
						<AutomationEditAction
							isNew={true}
							notifications={this.state.automation.notifications}
							saveAction={this.saveAction}
							saveNotification={this.saveNotification} />
					)} />
					<Route path={this.props.match.path + '/edit-action'} render={() => (
						<AutomationEditAction
							actions={this.state.automation.actions}
							saveAction={this.saveAction}
							deleteAction={this.deleteAction}
							notifications={this.state.automation.notifications}
							saveNotification={this.saveNotification}
							deleteNotification={this.deleteNotification} />
					)} />
					<Route render={() => <Redirect to={this.props.match.url} />} />
				</Switch>
			</NavigationScreen>
		);
	}
}

AutomationEditScreen.propTypes = {
	automation: PropTypes.object,
	services: PropTypes.object,
	isNew: PropTypes.bool,
	match: PropTypes.object,
	history: PropTypes.object,
	addAutomation: PropTypes.func,
	saveAutomation: PropTypes.func,
	deleteAutomation: PropTypes.func
};

const mapStateToProps = ({automationsList, servicesList}, {match}) => {
		const automation = getAutomationById(automationsList, match.params.automationId, false);

		return {
			automation,
			services: getServices(servicesList, false)
		};
	},
	mapDispatchToProps = (dispatch) => ({
		addAutomation: (automation) => dispatch(addAutomation(automation)),
		saveAutomation: (automation, originalAutomation) => dispatch(saveAutomation(automation, originalAutomation)),
		deleteAutomation: (automation) => dispatch(deleteAutomation(automation))
	});

export default compose(
	withRoute({params: '/:automationId?'}),
	connect(mapStateToProps, mapDispatchToProps)
)(AutomationEditScreen);
