import React from 'react';
import styles from './IconBase.css';

export const IconBase = (props) => React.cloneElement(
	props.children,
	{className: props.children.props.className || styles.icon}
);

export default IconBase;
