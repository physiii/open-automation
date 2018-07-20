import React from 'react';
import PropTypes from 'prop-types';
import styles from './IconBase.css';

export const IconBase = (props) => React.cloneElement(
	props.children,
	{
		className: props.children.props.className || styles.icon,
		width: props.size,
		height: props.size,
		preserveAspectRatio: 'xMidYMid meet'
	}
);

IconBase.propTypes = {
	shadowed: PropTypes.bool,
	size: PropTypes.number
};

IconBase.defaultProps = {
	size: 40
};

export default IconBase;
