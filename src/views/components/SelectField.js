import React from 'react';
import PropTypes from 'prop-types';
import TextField from './TextField.js';
import MenuIndicatorIcon from '../icons/MenuIndicatorIcon.js';
import {getUniqueId} from '../../utilities.js';
import './SelectField.css';

export class SelectField extends React.Component {
	constructor (props) {
		super(props);

		this.inputId = getUniqueId();
	}

	render () {
		const {label, name, options, ...inputProps} = this.props,
			currentOption = options.find((option) => option.value === inputProps.value);

		return (
			<TextField
				{...inputProps}
				altInputId={this.inputId}
				label={label}
				value={(currentOption && currentOption.label) || inputProps.value}
				readOnly="{false}">
				<div styleName="select">
					<select
						{...inputProps}
						styleName="input"
						value={inputProps.value || ''}
						id={this.inputId}
						name={name}>
						{options.map((option, index) => {
							return (
								<option value={option.value} key={index}>
									{option.label || option.value}
								</option>
							);
						})}
					</select>
					<span styleName="icon">
						<MenuIndicatorIcon size={10} />
					</span>
				</div>
			</TextField>
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
	options: PropTypes.array
};

export default SelectField;
