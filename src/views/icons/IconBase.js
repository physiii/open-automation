import React from 'react';
import PropTypes from 'prop-types';
import './IconBase.css';

export const IconBase = ({size, onClick, onMouseOver, onMouseOut, children, ...props}) => (
	<span
		styleName="wrapper"
		onMouseOver={onMouseOver}
		onMouseOut={onMouseOut}
		onClick={onClick}>
		<svg
			styleName="icon"
			width={size}
			height={size}
			preserveAspectRatio="xMidYMid meet"
			xmlns="http://www.w3.org/2000/svg"
			{...props}>
			{children}
		</svg>
	</span>
);

IconBase.propTypes = {
	size: PropTypes.number.isRequired,
	onClick: PropTypes.func,
	onMouseOver: PropTypes.func,
	onMouseOut: PropTypes.func,
	children: PropTypes.node
};

IconBase.defaultProps = {
	size: 40
};

export default IconBase;
