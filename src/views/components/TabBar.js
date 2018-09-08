import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import './TabBar.css';

export const TabBar = (props) => (
	<div styleName="bar">
		<ul styleName="tabs">
			{props.buttons.map((button, index) => (
				<li styleName={'tab' + (button.isActive ? ' active' : '')} key={index}>
					<Button type="tab" to={button.to} icon={button.icon} onClick={(event) => event.target.blur()}>{button.label}</Button>
				</li>
			))}
		</ul>
	</div>
);

TabBar.propTypes = {
	buttons: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.string,
		icon: PropTypes.node,
		to: PropTypes.string,
		isActive: PropTypes.bool
	}))
};

TabBar.defaultProps = {
	buttons: []
};

export default TabBar;
