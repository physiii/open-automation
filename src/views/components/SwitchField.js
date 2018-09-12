import React from 'react';
import PropTypes from 'prop-types';
import Switch from './Switch.js';
import {getUniqueId} from '../../utilities.js';
import './SwitchField.css';

export class SwitchField extends React.Component {
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
					<Switch
						id={this.inputId}
						name={this.props.name}
						isOn={this.props.isOn}
						disabled={this.props.disabled}
						onChange={this.props.onChange}
						onFocus={this.handleFocus}
						onBlur={this.handleBlur} />
				</div>
			</div>
		);
	}
}

SwitchField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	isOn: PropTypes.bool,
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	onFocus: PropTypes.func,
	onBlur: PropTypes.func
};

export default SwitchField;
