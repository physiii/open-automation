import React from 'react';
import PropTypes from 'prop-types';
import {getUniqueId} from '../../utilities.js';
import './TextField.css';

export class TextField extends React.Component {
	constructor (props) {
		super(props);

		this.state = {is_focused: false};

		this.handleFocus = this.handleFocus.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
	}

	handleFocus (event) {
		this.setState({is_focused: true});

		if (typeof this.props.onFocus === 'function') {
			this.props.onFocus(event);
		}
	}

	handleBlur (event) {
		this.setState({is_focused: false});

		if (typeof this.props.onBlur === 'function') {
			this.props.onBlur(event);
		}
	}

	render () {
		const inputId = getUniqueId(),
			value = this.props.value !== null && this.props.value.toString
				? this.props.value.toString()
				: '',
			mask = this.props.mask !== null && this.props.mask.toString
				? this.props.mask.toString()
				: '';

		return (
			<div styleName="container">
				<div styleName={'field' + (this.state.is_focused ? ' isFocused' : '') + (this.props.error ? ' hasError' : '') + (value.length > 0 || mask ? ' isPopulated' : '')}>
					<label htmlFor={inputId} styleName="label">{this.props.label}</label>
					{mask && <span styleName="mask">{mask}</span>}
					<input
						styleName={mask ? 'inputMasked' : 'input'}
						id={inputId}
						type={this.props.type}
						name={this.props.name}
						value={value}
						onChange={this.props.onChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
				</div>
				<div styleName="bottom">
					{this.props.error &&
						<span styleName="errorMessage">{this.props.error}</span>}
				</div>
			</div>
		);
	}
}

TextField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	mask: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	error: PropTypes.string,
	type: PropTypes.oneOf([
		'text',
		'password'
	]),
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

TextField.defaultProps = {
	value: '',
	mask: '',
	type: 'text'
};

export default TextField;
