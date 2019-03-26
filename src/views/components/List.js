import React from 'react';
import PropTypes from 'prop-types';
import {SortableContainer} from 'react-sortable-hoc';
import {default as ListItem, SortableListItem} from './ListItem.js';
import {AutoSizer, List as VirtualizedList} from 'react-virtualized';
import styles from './List.css';

export class List extends React.Component {
	constructor (props) {
		super(props);

		this.renderStandardList = this.renderStandardList.bind(this);
		this.renderSortableList = SortableContainer(this.renderStandardList);

		this.state = {itemBeingDragged: false};
	}

	renderStandardList () {
		const ListElement = this.props.isOrdered ? 'ol' : 'ul',
			ListItemComponent = this.props.isSortable ? SortableListItem : ListItem;

		return (
			<ListElement className={styles.list}>
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

	renderVirtualizedList () {
		return (
			<AutoSizer>
				{({width, height}) => (
					<VirtualizedList
						className={styles.list}
						rowCount={this.props.children ? this.props.children.length : 0}
						rowHeight={48}
						rowRenderer={({index, key, style}) => (
							<ListItem
								{...this.props.children[index]}
								element="div"
								key={key}
								style={style} />
						)}
						width={width}
						height={height} />
				)}
			</AutoSizer>
		);
	}

	renderList () {
		if (this.props.shouldVirtualize) {
			return this.renderVirtualizedList();
		} else if (this.props.isSortable) {
			const SortableList = this.renderSortableList;

			return (
				<SortableList
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
			);
		}

		return this.renderStandardList();
	}

	render () {
		if (!this.props.children.length && !this.props.renderIfEmpty) {
			return null;
		}

		return (
			<div className={styles.container}>
				{this.props.title && <h2 className={styles.title}>{this.props.title}</h2>}
				<div className={styles.listWrapper}>
					{this.renderList()}
				</div>
			</div>
		);
	}
}

List.propTypes = {
	title: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.shape(ListItem.propTypes)),
	isOrdered: PropTypes.bool,
	isSortable: PropTypes.bool,
	shouldVirtualize: PropTypes.bool,
	renderIfEmpty: PropTypes.bool,
	onSortStart: PropTypes.func,
	onSortEnd: PropTypes.func
};

List.defaultProps = {
	renderIfEmpty: true
};

export default List;
