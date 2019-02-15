import React from 'react';
import PropTypes from 'prop-types';
import {SortableContainer} from 'react-sortable-hoc';
import {default as ListItem, SortableListItem} from './ListItem.js';
import './List.css';

export class List extends React.Component {
	constructor (props) {
		super(props);

		this.renderList = this.renderList.bind(this);
		this.renderSortableList = SortableContainer(this.renderList);

		this.state = {itemBeingDragged: false};
	}

	renderList () {
		const ListElement = this.props.isOrdered ? 'ol' : 'ul',
			ListItemComponent = this.props.isSortable ? SortableListItem : ListItem;

		return (
			<ListElement>
				{this.props.children && Boolean(this.props.children.length) && this.props.children.map((item, index) => (
					<ListItemComponent
						{...item}
						isDraggable={this.props.isSortable}
						isBeingDragged={this.state.itemBeingDragged === index}
						index={index}
						key={item.key || index} />
				))}
			</ListElement>
		);
	}

	render () {
		if (!this.props.children.length && !this.props.renderIfEmpty) {
			return null;
		}

		const ListComponent = this.props.isSortable ? this.renderSortableList : this.renderList;

		return (
			<div styleName="list">
				{this.props.title && <h2 styleName="title">{this.props.title}</h2>}
				<ListComponent
					lockAxis="y"
					lockToContainerEdges={true}
					lockOffset={0}
					helperClass={ListItem.beingDraggedClass}
					onSortStart={(data, ...rest) => {
						if (typeof this.props.onSortStart === 'function') {
							this.props.onSortStart(data, ...rest);
						}

						this.setState({itemBeingDragged: data.index});
					}}
					onSortEnd={(...rest) => {
						if (typeof this.props.onSortEnd === 'function') {
							this.props.onSortEnd(...rest);
						}

						this.setState({itemBeingDragged: false});
					}} />
			</div>
		);
	}
}

List.propTypes = {
	title: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.shape(ListItem.propTypes)),
	isOrdered: PropTypes.bool,
	isSortable: PropTypes.bool,
	renderIfEmpty: PropTypes.bool,
	onSortStart: PropTypes.func,
	onSortEnd: PropTypes.func
};

List.defaultProps = {
	renderIfEmpty: true
};

export default List;
