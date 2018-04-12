import React, {Component} from 'react';
import {hot} from 'react-hot-loader';
import LoginForm from '../components/LoginForm.js';

class App extends Component {
	render() {
		return (
			<div>
				<LoginForm />
			</div>
		);
	}
}

export default hot(module)(App); // Wrap component for hot module reloading.
