import * as types from './types';

export const loadContext = (path) => ({
		type: types.LOAD_CONTEXT,
		payload: {path}
	}),
	unloadContext = (path) => ({
		type: types.UNLOAD_CONTEXT,
		payload: {path}
	}),
	loadScreen = (context, path, depth, currentFullPath, title, shouldShowTitle) => ({
		type: types.LOAD_SCREEN,
		payload: {context, path, depth, currentFullPath, title, shouldShowTitle}
	}),
	unloadScreen = (context, path) => ({
		type: types.UNLOAD_SCREEN,
		payload: {context, path}
	});
