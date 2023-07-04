import React from 'react';
import PropTypes from 'prop-types';
import styles from './IconBase.css';

export const IconBase = ({size, onClick, onMouseOver, onMouseOut, children, ...props}) => (
	<span
		className={styles.wrapper}
		onMouseOver={onMouseOver}
		onMouseOut={onMouseOut}
		onClick={onClick}>
		<svg
			className={styles.icon}
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
