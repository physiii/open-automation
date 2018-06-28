import * as types from './types';

export const loadContext = (context) => ({
		type: types.LOAD_CONTEXT,
		payload: {context}
	}),
	loadScreen = (path, backPath, title) => ({
		type: types.LOAD_SCREEN,
		payload: {
			path,
			backPath,
			title
		}
	}),
	unloadScreen = (path) => ({
		type: types.UNLOAD_SCREEN,
		payload: {path}
	});
