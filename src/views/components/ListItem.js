import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {SortableElement} from 'react-sortable-hoc';
import styles from './ListItem.css';

export const ListItem = (props) => {
	const ItemElement = props.isVirtualized ? 'div' : 'li',
		LinkComponent = props.link ? Link : 'a',
		itemContent = (
			<div className={styles.rowContentInner}>
				{props.icon && <div className={styles.rowIcon}>{typeof props.icon === 'function'
					? props.icon()
					: props.icon}</div>}
				<div className={styles.rowText}>
					<span className={styles.primaryText}>
						{typeof props.label === 'function'
							? props.label()
							: props.label}
						{props.meta && <span className={styles.metaText}>{typeof props.meta === 'function'
							? props.meta()
							: props.meta}</span>}
					</span>
					{props.secondaryText && <span className={styles.secondaryText}>{typeof props.secondaryText === 'function'
						? props.secondaryText()
						: props.secondaryText}</span>}
					{props.tertiaryText && <span className={styles.tertiaryText}>{typeof props.tertiaryText === 'function'
						? props.tertiaryText()
						: props.tertiaryText}</span>}
				</div>
			</div>
		);

	return (
		<ItemElement
			className={styles.row + (props.isDraggable ? ' ' + styles.isDraggable : '') + (props.isBeingDragged ? ' ' + styles.isBeingDragged : '')}
			style={props.style}>
			{props.link || props.onClick
				? <LinkComponent href="#" className={styles.rowContent} to={props.link} onClick={(event) => {
					if (!props.link) {
						event.preventDefault();
					}

					if (typeof props.onClick === 'function') {
						props.onClick(event);
					}
				}}>
					{itemContent}
				</LinkComponent>
				: <div className={styles.rowContent}>
					{itemContent}
				</div>
			}
			{props.secondaryAction &&
				<div className={styles.rowActions}>{typeof props.secondaryAction === 'function'
					? props.secondaryAction()
					: props.secondaryAction}</div>}
		</ItemElement>
	);
};

ListItem.beingDraggedClass = styles.isBeingDragged;

ListItem.propTypes = {
	label: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	secondaryText: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	tertiaryText: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	meta: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	link: PropTypes.string,
	secondaryAction: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
	isDraggable: PropTypes.bool,
	isBeingDragged: PropTypes.bool,
	isVirtualized: PropTypes.bool,
	style: PropTypes.object,
	onClick: PropTypes.func
};

export const SortableListItem = SortableElement(ListItem);
export default ListItem;
