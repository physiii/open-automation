import React from 'react';
import PropTypes from 'prop-types';
import '../styles/modules/_TabBar.scss';

export const TabBar = (props) => {
	return (
		<div className="oa-TabBar">
			{props.buttons.map((button, index) => (
				<button key={index} onClick={button.onClick}>{button.label}</button>
			))}
		</div>
	);
};

TabBar.propTypes = {
	buttons: PropTypes.array // TODO: Array of shapes.
};

export default TabBar;
