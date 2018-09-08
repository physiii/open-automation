import React from 'react';
import PropTypes from 'prop-types';
import {getUniqueId} from '../../utilities.js';
import './SelectField.css';

export class SelectField extends React.Component {
	constructor (props) {
		super(props);

		this.inputId = getUniqueId();
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
		return (
			<div styleName="container">
				<div styleName={'field' + (this.state.is_focused ? ' isFocused' : '')}>
					<label htmlFor={this.inputId} styleName="label">{this.props.label}</label>
					<select
						styleName="input"
						id={this.inputId}
						name={this.props.name}
						value={this.props.value}
						disabled={this.props.disabled}
						onChange={this.props.onChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur}>
						{this.props.options.map((option, index) => {
							return (
								<option value={option.value} key={index}>
									{option.label || option.value}
								</option>
							);
						})}
					</select>
				</div>
			</div>
		);
	}
}

SelectField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number
	]),
	disabled: PropTypes.bool,
	options: PropTypes.array,
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

export default SelectField;
