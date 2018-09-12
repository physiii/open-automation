import * as actions from './actions';

const loadContext = (path) => (dispatch) => {
		dispatch(actions.loadContext(path));
	},
	unloadContext = (path) => (dispatch) => {
		dispatch(actions.unloadContext(path));
	},
	loadScreen = (context, path, depth, currentFullPath, title, shouldShowTitle) => (dispatch) => {
		dispatch(actions.loadScreen(context, path, depth, currentFullPath, title, shouldShowTitle));
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
