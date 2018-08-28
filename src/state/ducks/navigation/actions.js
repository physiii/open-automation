import * as types from './types';

export const loadContext = (path, currentFullPath, title, shouldShowTitle) => ({
		type: types.LOAD_CONTEXT,
		payload: {path, currentFullPath, title, shouldShowTitle}
	}),
	unloadContext = (path) => ({
		type: types.UNLOAD_CONTEXT,
		payload: {path}
	}),
	loadScreen = (context, path, currentFullPath, title, shouldShowTitle) => ({
		type: types.LOAD_SCREEN,
		payload: {context, path, currentFullPath, title, shouldShowTitle}
	}),
	unloadScreen = (context, path) => ({
		type: types.UNLOAD_SCREEN,
		payload: {context, path}
	});
