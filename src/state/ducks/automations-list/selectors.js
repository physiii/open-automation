import Automation from './models/automation-record.js';

const getAutomations = (automationsList, toJs = true) => {
		const automations = automationsList.get('automations');

		return toJs ? automations.toList().toJS() : automations;
	},
	getAutomationById = (automationsList, automationId, toJs = true) => {
		const automation = automationsList.getIn(['automations', automationId]);

		if (!automation) {
			return;
		}

		return toJs ? automation.toJS() : automation;
	},
	getEmptyAutomation = () => new Automation(),
	hasInitialFetchCompleted = (automationsList) => {
		return automationsList.get('fetched');
	},
	getAutomationsError = (automationsList) => {
		const error = automationsList.get('error');

		if (error) {
			return error;
		}
	};

export {
	getAutomations,
	getAutomationById,
	getEmptyAutomation,
	hasInitialFetchCompleted,
	getAutomationsError
};
