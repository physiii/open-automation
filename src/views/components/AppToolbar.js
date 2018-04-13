import React from 'react';
import Toolbar from '../components/Toolbar.js';
import '../styles/modules/_AppToolbar.scss';

const AppToolbar = (props) => {
	return (
		<div className="oa-AppToolbar">
			<Toolbar
				leftChildren={<h1>Pyfi</h1>}
				rightChildren={[
					<button key="register">Register</button>,
					<button key="login">Login</button>
				]}
			/>
		</div>
	);
};

export default AppToolbar;
