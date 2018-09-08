import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import './TabBar.css';

export const TabBar = (props) => (
	<div styleName="tabBar">
		{props.buttons.map((button, index) => (
			<span styleName="tab" key={index}>
				<Button type="tab" to={button.to} icon={button.icon}>{button.label}</Button>
			</span>
		))}
	</div>
);

TabBar.propTypes = {
	buttons: PropTypes.array // TODO: Array of shapes.
};

TabBar.defaultProps = {
	buttons: []
};

export default TabBar;
