import {createStore, combineReducers, applyMiddleware, compose} from 'redux';
import {connectRouter, routerMiddleware} from 'connected-react-router';
import thunk from 'redux-thunk';
import * as reducers from './ducks';

function generateRootReducer (reducersToCombine, history) {
	return connectRouter(history)(combineReducers({...reducersToCombine}));
}

export default function configureStore (history, initialState) {
	const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // Middleware wrapper for Redux DevTools browser extension

	// Enable hot-reloading reducers.
	if (module.hot) {
		module.hot.accept('./ducks', () => {
			const newReducers = require('./ducks/index.js'); // eslint-disable-line global-require

			store.replaceReducer(generateRootReducer(newReducers, history));
		});
	}

	const store = createStore(
		generateRootReducer(reducers, history),
		initialState,
		composeEnhancers(applyMiddleware(
			thunk,
			routerMiddleware(history)
		))
	);

	return store;
}
