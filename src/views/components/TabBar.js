import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import '../styles/modules/_TabBar.scss';

export const TabBar = (props) => (
	<div className="oa-TabBar">
		{props.buttons.map((button, index) => <Button key={index} to={button.to}>{button.label}</Button>)}
	</div>
);

TabBar.propTypes = {
	buttons: PropTypes.array // TODO: Array of shapes.
};

export default TabBar;
