import * as actions from './actions';

const loadContext = (path, currentFullPath, title, shouldShowTitle) => (dispatch) => {
		dispatch(actions.loadContext(path, currentFullPath, title, shouldShowTitle));
	},
	unloadContext = (path) => (dispatch) => {
		dispatch(actions.unloadContext(path));
	},
	loadScreen = (context, path, currentFullPath, title, shouldShowTitle) => (dispatch) => {
		dispatch(actions.loadScreen(context, path, currentFullPath, title, shouldShowTitle));
	},
	unloadScreen = (context, path) => (dispatch) => {
		dispatch(actions.unloadScreen(context, path));
	};

export {
	loadContext,
	unloadContext,
	loadScreen,
	unloadScreen
};
