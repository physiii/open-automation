import * as actions from './actions';

const loadContext = (context) => (dispatch) => {
		dispatch(actions.loadContext(context));
	},
	loadScreen = (path, backPath, title) => (dispatch) => {
		dispatch(actions.loadScreen(path, backPath, title));
	},
	unloadScreen = (path) => (dispatch) => {
		dispatch(actions.unloadScreen(path));
	};

export {
	loadContext,
	loadScreen,
	unloadScreen
};
