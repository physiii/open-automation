import * as types from './types';

export const fetchAutomations = () => ({
	type: types.FETCH_AUTOMATIONS
});

export const fetchAutomationsSuccess = (automations) => ({
	type: types.FETCH_AUTOMATIONS_SUCCESS,
	payload: {automations}
});

export const fetchAutomationsError = (error) => ({
	type: types.FETCH_AUTOMATIONS_ERROR,
	payload: {error},
	error: true
});

export const addAutomation = (tempAutomationId, automation) => ({
	type: types.ADD_AUTOMATION,
	payload: {tempAutomationId, automation}
});

export const addAutomationSuccess = (tempAutomationId, automation) => ({
	type: types.ADD_AUTOMATION_SUCCESS,
	payload: {tempAutomationId, automation}
});

export const addAutomationError = (tempAutomationId, error) => ({
	type: types.ADD_AUTOMATION_ERROR,
	payload: {tempAutomationId, error},
	error: true
});

export const saveAutomation = (automation) => ({
	type: types.SAVE_AUTOMATION,
	payload: {automation}
});

export const saveAutomationError = (automation, originalAutomation, error) => ({
	type: types.SAVE_AUTOMATION_ERROR,
	payload: {automation, originalAutomation, error},
	error: true
});

export const deleteAutomation = (automationId) => ({
	type: types.DELETE_AUTOMATION,
	payload: {automationId}
});

export const deleteAutomationError = (automation, error) => ({
	type: types.DELETE_AUTOMATION_ERROR,
	payload: {automation, error},
	error: true
});
