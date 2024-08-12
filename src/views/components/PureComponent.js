import React from 'react';
import PropTypes from 'prop-types';

/**
 * A generic wrapper component that implements React PureComponent.
 */

export class PureComponent extends React.PureComponent {
	render () {
		return this.props.children;
	}
}

PureComponent.propTypes = {
	children: PropTypes.node
};

export default PureComponent;
