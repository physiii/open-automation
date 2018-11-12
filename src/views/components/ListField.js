import React from 'react';
import PropTypes from 'prop-types';
import NavigationScreen from './NavigationScreen.js';
import Button from './Button.js';
import List from './List.js';
import ListFieldItemForm from './ListFieldItemForm.js';
import SettingValue from './SettingValue.js';
import {withRouter} from 'react-router-dom';
import './ListField.css';

// TODO: Display device not connected message.

export class ListField extends React.Component {
	constructor (props) {
		super(props);

		this.handleAddClick = this.handleAddClick.bind(this);
		this.handleListItemClick = this.handleListItemClick.bind(this);
		this.handleListScreenButtonClick = this.handleListScreenButtonClick.bind(this);
		this.handleBackClick = this.handleBackClick.bind(this);
		this.handleCancelClick = this.handleCancelClick.bind(this);
		this.handleSaveClick = this.handleSaveClick.bind(this);
		this.handleFormChange = this.handleFormChange.bind(this);
		this.handleFormErrors = this.handleFormErrors.bind(this);
		this.handleFormNoErrors = this.handleFormNoErrors.bind(this);

		this.state = {
			showListScreen: false,
			showEditScreen: false,
			editingItem: null,
			editingItemValues: null,
			editingItemSaveable: false,
			editingItemNew: false
		};
	}

	handleAddClick () {
		const itemValues = {};

		// Set default values for new item.
		Object.keys(this.props.itemFields).forEach((property) => {
			itemValues[property] = this.props.itemFields[property].default_value;
		});

		this.setState({
			showEditScreen: true,
			editingItem: null,
			editingItemValues: itemValues,
			editingItemNew: true
		});
	}

	handleListItemClick (itemIndex) {
		this.setState({
			showEditScreen: true,
			editingItem: itemIndex,
			editingItemValues: this.getItems()[itemIndex],
			editingItemNew: false
		});
	}

	handleListScreenButtonClick () {
		this.setState({showListScreen: true});
	}

	handleBackClick () {
		this.setState({showListScreen: false});
	}

	handleCancelClick () {
		this.setState({
			showEditScreen: false,
			editingItem: null
		});
	}

	handleSaveClick () {
		if (typeof this.props.onChange !== 'function') {
			return;
		}

		if (!this.state.editingItemSaveable) {
			return;
		}

		const items = [...this.props.value];

		if (items[this.state.editingItem]) {
			items[this.state.editingItem] = this.state.editingItemValues;
		} else {
			items.push(this.state.editingItemValues);
		}

		this.saveChanges(items);

		this.setState({
			showEditScreen: false,
			editingItem: null,
			editingItemValues: null
		});
	}

	handleFormChange (itemValues) {
		this.setState({editingItemValues: itemValues});
	}

	handleFormErrors () {
		if (this.state.editingItemSaveable !== false) {
			this.setState({editingItemSaveable: false});
		}
	}

	handleFormNoErrors () {
		if (this.state.editingItemSaveable !== true) {
			this.setState({editingItemSaveable: true});
		}
	}

	getItems () {
		return Array.isArray(this.props.value)
			? this.props.value
			: [];
	}

	deleteItem (itemIndex = 0) {
		if (confirm('Do you want to delete this ' + this.props.label + ' item?')) {
			const newItems = [...this.getItems()];

			newItems.splice(itemIndex, 1);

			this.saveChanges(newItems);
		}
	}

	saveChanges (items = this.value) {
		this.props.onChange({
			type: 'change',
			target: {
				name: this.props.name,
				value: items
			}
		});
	}

	renderList () {
		const items = this.getItems();

		return (
			<NavigationScreen
				path={this.props.match.url + '/field/' + this.props.name}
				title={this.props.label}
				toolbarActions={<Button onClick={this.handleAddClick}>Add</Button>}
				toolbarBackAction={this.handleBackClick}>
				<List isOrdered={true} renderIfEmpty={true}>
					{items.map((item = {}, index) => ({ // TODO: sort_by
						label: <SettingValue type={this.props.itemFields[this.props.mainProperty].type}>
							{item[this.props.mainProperty]}
						</SettingValue>,
						secondaryText: <SettingValue type={this.props.itemFields[this.props.secondaryProperty].type}>
							{item[this.props.secondaryProperty]}
						</SettingValue>,
						secondaryAction: <Button onClick={() => this.deleteItem(index)}>Delete</Button>,
						onClick: () => this.handleListItemClick(index)
					}))}
				</List>
				{this.state.showEditScreen
					? this.renderForm()
					: null}
			</NavigationScreen>
		);
	}

	renderForm () {
		return (
			<NavigationScreen
				path={this.props.match.url + '/field/' + this.props.name + '/edit'}
				title={(this.state.editingItemNew ? 'Add ' : 'Edit ') + this.props.label}
				toolbarActions={<Button onClick={this.handleSaveClick} disabled={!this.state.editingItemSaveable}>Save</Button>}
				toolbarBackAction={<Button onClick={this.handleCancelClick}>Cancel</Button>}>
				<ListFieldItemForm
					settingsDefinitions={this.props.itemFields}
					settings={this.state.editingItemValues}
					disabled={this.props.disabled}
					onSaveableChange={this.handleFormChange}
					onHasErrors={this.handleFormErrors}
					onHasNoErrors={this.handleFormNoErrors} />
			</NavigationScreen>
		);
	}

	render () {
		return (
			<div>
				<Button onClick={this.handleListScreenButtonClick}>{this.props.label}</Button>
				{this.state.showListScreen
					? this.renderList()
					: null}
			</div>
		);
	}
}

ListField.propTypes = {
	label: PropTypes.string,
	name: PropTypes.string,
	type: PropTypes.string,
	value: PropTypes.array,
	itemFields: PropTypes.object,
	mainProperty: PropTypes.string,
	secondaryProperty: PropTypes.string,
	disabled: PropTypes.bool,
	error: PropTypes.object,
	match: PropTypes.object,
	onChange: PropTypes.func
};

ListField.defaultProps = {
	value: [],
	error: {}
};

export default withRouter(ListField);
