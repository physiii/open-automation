import React, {Component} from 'react';
import {hot} from 'react-hot-loader';
import AppToolbar from '../components/AppToolbar.js';
import TabBar from '../components/TabBar.js';
import LoginForm from '../components/LoginForm.js';
import '../styles/layouts/_app.scss';

class App extends Component {
	render() {
		return (
			<div className="oa-l-app">
				<div className="oa-l-app--toolbar"><AppToolbar /></div>
				<div className="oa-l-app--content"><LoginForm /></div>
				<div className="oa-l-app--tabBar"><TabBar /></div>
			</div>
		);
	}
}

export default hot(module)(App); // Wrap component for hot module reloading.
