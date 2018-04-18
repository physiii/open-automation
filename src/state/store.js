import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

export default function configureStore (initialState) {
	// Compose reducers
	const rootReducer = combineReducers(reducers);

	// Middleware wrapper for Redux DevTools browser extension
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

	return createStore(
		rootReducer,
		initialState,
		composeEnhancers(applyMiddleware(thunk))
	);
}
