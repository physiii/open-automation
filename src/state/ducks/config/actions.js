import * as types from './types';

export const initialize = (config) => ({
	type: types.INITIALIZE,
	payload: {config}
});
