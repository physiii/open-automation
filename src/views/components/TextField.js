import React from 'react';
import PropTypes from 'prop-types';
import './TextField.css';

export class TextField extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			value: '',
			is_focused: false
		};

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	static getDerivedStateFromProps (nextProps, previousState) {
		const nextState = {...previousState};

		if (nextProps.value) {
			nextState.value = nextProps.value;
		}

		return nextState;
	}

	handleFocus () {
		this.setState({is_focused: true});
	}

	handleBlur () {
		this.setState({is_focused: false});
	}

	handleChange (event) {
		this.setState({value: event.target.value});

		if (typeof this.props.onChange === 'function') {
			this.props.onChange(event);
		}
	}

	render () {
		return (
			<div styleName={this.state.is_focused ? 'fieldFocused' : 'field'}>
				{this.state.value.length > 0
					? null
					: <label styleName="label">{this.props.label}</label>}
				<input
					styleName="input"
					type={this.props.type}
					value={this.state.value}
					onChange={this.handleChange}
					onFocus={this.handleFocus}
					onBlur={this.handleBlur} />
			</div>
		);
	}
}

TextField.propTypes = {
	label: PropTypes.string,
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
