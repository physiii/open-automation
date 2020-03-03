import React from 'react';
import PropTypes from 'prop-types';
import './BlankState.css';

export const BlankState = (props) => (
	<section styleName="blankState">
		<h1 styleName="heading">{props.heading}</h1>
		<p styleName="body">{props.body}</p>
	</section>
);

BlankState.propTypes = {
	heading: PropTypes.string,
	body: PropTypes.string
};

export default BlankState;
