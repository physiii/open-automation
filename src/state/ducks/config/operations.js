import * as actions from './actions';

const initialize = (config) => (dispatch) => {
	dispatch(actions.initialize(config));
};

export {
	initialize
};
