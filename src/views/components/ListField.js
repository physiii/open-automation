import React from 'react';
import PropTypes from 'prop-types';
import Route from './Route.js';
import NavigationScreen from './NavigationScreen.js';
import Button from './Button.js';
import List from './List.js';
import SettingsForm from './SettingsForm.js';
import BlankState from './BlankState.js';
import SettingValue from './SettingValue.js';
import {withRouter} from 'react-router-dom';

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
			editingItemSaveable: true,
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
		if (confirm('Do you want to delete this ‘' + this.props.label + '’ item?')) {
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

	renderForm () {
		return (
			<NavigationScreen
				url={this.props.match.url + '/field/' + this.props.name + '/edit'}
				title={(this.state.editingItemNew ? 'Add ' : 'Edit ') + '‘' + this.props.label + '’ Item'}
				toolbarActions={<Button onClick={this.handleSaveClick} disabled={!this.state.editingItemSaveable}>Save</Button>}
				toolbarBackAction={<Button onClick={this.handleCancelClick}>Cancel</Button>}>
				<SettingsForm
					fields={this.props.itemFields}
					values={this.state.editingItemValues}
					disabled={this.props.disabled}
					onSaveableChange={this.handleFormChange}
					onError={this.handleFormErrors}
					onNoError={this.handleFormNoErrors} />
			</NavigationScreen>
		);
	}

	render () {
		const items = this.getItems(),
			listUrl = this.props.match.url + '/field/' + encodeURIComponent(this.props.name);

		return (
			<div>
				<Button
					type="outlined"
					disabled={this.props.disabled}
					to={listUrl}>
					{this.props.label}
				</Button>
				<Route
					path={listUrl}
					render={(routeProps) => {
						return (
							<NavigationScreen
								title={this.props.label}
								url={routeProps.match.urlWithoutOptionalParams}
								toolbarActions={<Button onClick={this.handleAddClick}>Add</Button>}>
								{!items.length &&
									<BlankState
										heading={'No ‘' + this.props.label + '’ Items'}
										body="Use the ‘Add’ button and items will show up here." />
								}
								<List isOrdered={true} renderIfEmpty={false}>
									{items.map((item = {}, index) => ({ // TODO: sort_by
										label: <SettingValue type={this.props.itemFields[this.props.mainProperty].type}>
											{item[this.props.mainProperty]}
										</SettingValue>,
										secondaryText: <React.Fragment>
											{this.props.itemFields[this.props.secondaryProperty].label}:&nbsp;
											<SettingValue type={this.props.itemFields[this.props.secondaryProperty].type}>
												{item[this.props.secondaryProperty]}
											</SettingValue>
										</React.Fragment>,
										secondaryAction: <Button onClick={() => this.deleteItem(index)}>Delete</Button>,
										onClick: () => this.handleListItemClick(index)
									}))}
								</List>
								{this.state.showEditScreen
									? this.renderForm()
									: null}
							</NavigationScreen>
						);
					}} />
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
