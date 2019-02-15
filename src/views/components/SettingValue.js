import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export const SettingValue = (props) => {
	let formatted;

	switch (props.type) {
		case 'percentage':
			formatted = Math.round(props.children * 100) + '%';
			break;
		case 'time-of-day':
			formatted = moment.utc(props.children).format('h:mm A');
			break;
		default:
			formatted = props.children;
			break;
	}

	return <React.Fragment>{formatted}</React.Fragment>;
};

SettingValue.propTypes = {
	type: PropTypes.string,
	children: PropTypes.any
};

export default SettingValue;
