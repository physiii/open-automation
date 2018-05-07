import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {routerReducer, routerMiddleware} from 'react-router-redux';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

export default function configureStore (history, initialState) {
	const rootReducer = combineReducers({ // Compose reducers
			...reducers,
			router: routerReducer
		}),
		composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Middleware wrapper for Redux DevTools browser extension

	return createStore(
		rootReducer,
		initialState,
		composeEnhancers(
			applyMiddleware(thunk),
			applyMiddleware(routerMiddleware(history))
		)
	);
}
