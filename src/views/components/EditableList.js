import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';
import SettingsField from './SettingsField.js';
import './EditableList.css';

export class EditableList extends React.Component {
	handleAddClick (event) {
		event.preventDefault();
	}

	handleChange (event, item, itemIndex, fieldName) {
		if (typeof this.props.onChange !== 'function') {
			return;
		}

		const value = [...this.props.value];

		value[itemIndex] = {
			...item,
			[fieldName]: event.target.value
		};

		this.props.onChange({
			type: event.type,
			target: {
				...event.target,
				name: this.props.name,
				value
			}
		});
	}

	render () {
		const values = Array.isArray(this.props.value)
			? this.props.value
			: [];

		return (
			<div>
				{this.props.label}
				<div>
					<Button onClick={this.handleAddClick.bind(this)}>Add</Button>
					<ul>
						{values.map((item = {}, index) => {
							return (
								<li key={index}>
									{Object.keys(this.props.itemFields).map((fieldName) => {
										// TODO: Ignore list-of fields.

										return (
											<SettingsField
												property={fieldName}
												definition={this.props.itemFields[fieldName]}
												value={values[index][fieldName]}
												disabled={this.props.disabled}
												error={this.props.error[fieldName]}
												key={fieldName}
												onChange={(event) => this.handleChange(event, item, index, fieldName)} />
										);
									})}
								</li>
							);
						})}
					</ul>
				</div>
			</div>
		);
	}
}

EditableList.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	value: PropTypes.array,
	itemFields: PropTypes.object,
	disabled: PropTypes.bool,
	error: PropTypes.object,
	onChange: PropTypes.func
};

EditableList.defaultProps = {
	error: {}
};

export default EditableList;
