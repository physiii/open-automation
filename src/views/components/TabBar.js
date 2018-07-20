import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import './TabBar.css';

export const TabBar = (props) => (
	<div styleName="tabBar">
		{props.buttons.map((button, index) => <Button key={index} to={button.to}>{button.label}</Button>)}
	</div>
);

TabBar.propTypes = {
	buttons: PropTypes.array // TODO: Array of shapes.
};

TabBar.defaultProps = {
	buttons: []
};

export default TabBar;
