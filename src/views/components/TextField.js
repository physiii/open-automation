import React from 'react';
import PropTypes from 'prop-types';

export class TextField extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			value: ''
		};

		this.handleChange = this.handleChange.bind(this);
	}

	static getDerivedStateFromProps (nextProps, previousState) {
		const nextState = {...previousState};

		if (nextProps.value) {
			nextState.value = nextProps.value;
		}

		return nextState;
	}

	handleChange (event) {
		this.setState({value: event.target.value});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(event);
		}
	}

	render () {
		return (
			<input type={this.props.type} value={this.state.value} onChange={this.handleChange} />
		);
	}
}

TextField.propTypes = {
	value: PropTypes.string,
	type: PropTypes.oneOf([
		'text',
		'password'
	]),
	onChange: PropTypes.func
};

TextField.defaultProps = {
	type: 'text'
};

export default TextField;
