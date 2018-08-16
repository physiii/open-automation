import React from 'react';
import PropTypes from 'prop-types';
import iconBase from './iconBase.js';

export const CameraIcon = ({className, ...props}) => (
	<svg
		className={className}
		viewBox="0 0 40 24"
		xmlns="http://www.w3.org/2000/svg"
		{...props}>
		<path d="M0 5.002A4.997 4.997 0 0 1 5.004 0h19.992A4.998 4.998 0 0 1 30 4.994V7l6.717-4.247C37.629 2.423 40 2.16 40 5.25v13.5c0 3.08-2.337 2.897-3.283 2.36L30 17v2.006A4.993 4.993 0 0 1 24.996 24H5.004A5.001 5.001 0 0 1 0 18.998V5.002z" fillRule="evenodd" />
	</svg>
);

CameraIcon.propTypes = {
	className: PropTypes.string
};

export default iconBase(CameraIcon);
