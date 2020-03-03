import React from 'react';
import PropTypes from 'prop-types';
import IconBase from './IconBase.js';

export const ShieldIcon = ({shieldChecked, ...props}) => (
	<IconBase {...props} viewBox="0 0 20 20">
		{shieldChecked
			? <path d="M10.2 20h-.4-.1C.9 16.3 1.8 11 2.2 3.1c0-.3.2-.5.5-.5 2.6-.1 4.9-1 7-2.5.2-.1.4-.1.6 0 2.1 1.5 4.4 2.4 7 2.4.3 0 .5.2.5.5.4 8 1.3 13.2-7.5 17 0-.1-.1 0-.1 0zM6 10.6c-.3-.3-.3-.7 0-1 .3-.3.7-.3 1 0l1.8 1.8 4.3-4.3c.3-.3.7-.3 1 0 .3.3.3.7 0 1L9.4 13c-.3.3-.7.3-1 0L6 10.6z" fillRule="evenodd" />
			: <path d="M10.2 20h-.4-.1C.9 16.3 1.8 11 2.2 3.1c0-.3.2-.5.5-.5 2.6-.1 4.9-1 7-2.5.2-.1.4-.1.6 0 2.1 1.5 4.4 2.4 7 2.4.3 0 .5.2.5.5.4 8 1.3 13.2-7.5 17 0-.1-.1 0-.1 0z" />
		}
	</IconBase>
);

ShieldIcon.propTypes = {
	shieldChecked: PropTypes.bool
};

export default ShieldIcon;
