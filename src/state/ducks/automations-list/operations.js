import * as actions from './actions';
import Api from '../../../api.js';
const {v4: uuidV4} = require('uuid'),
	listenForAutomationChanges = () => (dispatch) => {
		Api.on('automations', (data) => dispatch(actions.fetchAutomationsSuccess(data.automations)));
	},
	fetchAutomations = () => (dispatch) => {
		dispatch(actions.fetchAutomations());
		Api.getAutomations()
			.then((data) => {
				dispatch(actions.fetchAutomationsSuccess(data.automations));
			})
			.catch((error) => {
				dispatch(actions.fetchAutomationsError(error));
			});
	},
	addAutomation = (automation) => (dispatch) => {
		const tempId = uuidV4();

		dispatch(actions.addAutomation(tempId, automation));
		Api.addAutomation(automation)
			.then((data) => {
				dispatch(actions.addAutomationSuccess(tempId, data.automation));
			})
			.catch((error) => {
				dispatch(actions.addAutomationError(tempId, error));
			});
	},
	saveAutomation = (automation, originalAutomation) => (dispatch) => {
		dispatch(actions.saveAutomation(automation));
		Api.saveAutomation(automation)
			.catch((error) => {
				dispatch(actions.saveAutomationError(automation, originalAutomation, error));
			});
	},
	deleteAutomation = (automation) => (dispatch) => {
		dispatch(actions.deleteAutomation(automation.id));
		Api.deleteAutomation(automation.id)
			.catch((error) => {
				dispatch(actions.deleteAutomationError(automation, error));
			});
	};

export {
	listenForAutomationChanges,
	fetchAutomations,
	addAutomation,
	saveAutomation,
	deleteAutomation
};
