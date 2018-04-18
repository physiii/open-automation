import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

export default function configureStore (initialState) {
	const rootReducer = combineReducers(reducers), // Compose reducers
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Middleware wrapper for Redux DevTools browser extension

	return createStore(
		rootReducer,
		initialState,
		composeEnhancers(applyMiddleware(thunk))
	);
}
