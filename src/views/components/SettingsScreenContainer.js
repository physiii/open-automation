import React from 'react';
import PropTypes from 'prop-types';
import styles from './SettingsScreenContainer.css';

export const SettingsScreenContainer = ({section, children, withPadding}) => React.createElement(
	section ? 'section' : 'div',
	{
		className: withPadding ? styles.containerWithPadding : styles.container,
		children
	}
);

SettingsScreenContainer.propTypes = {
	section: PropTypes.bool,
	children: PropTypes.node,
	withPadding: PropTypes.bool
};

export default SettingsScreenContainer;
