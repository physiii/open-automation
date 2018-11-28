import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {SortableElement} from 'react-sortable-hoc';
import styles from './ListItem.css';

export const ListItem = (props) => {
	const LinkComponent = props.link ? Link : 'a',
		itemContent = (
			<div className={styles.rowContentInner}>
				{props.icon && <div className={styles.rowIcon}>{props.icon}</div>}
				<div className={styles.rowText}>
					<span className={styles.primaryText}>
						{props.label}
						{props.meta && <span className={styles.metaText}>{props.meta}</span>}
					</span>
					{props.secondaryText && <span className={styles.secondaryText}>{props.secondaryText}</span>}
					{props.tertiaryText && <span className={styles.tertiaryText}>{props.tertiaryText}</span>}
				</div>
			</div>
		);

	return (
		<li className={styles.row + (props.isDraggable ? ' ' + styles.isDraggable : '') + (props.isBeingDragged ? ' ' + styles.isBeingDragged : '')}>
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
				<div className={styles.rowActions}>{props.secondaryAction}</div>}
		</li>
	);
};

ListItem.beingDraggedClass = styles.isBeingDragged;

ListItem.propTypes = {
	label: PropTypes.node,
	secondaryText: PropTypes.node,
	tertiaryText: PropTypes.node,
	icon: PropTypes.node,
	meta: PropTypes.node,
	link: PropTypes.string,
	secondaryAction: PropTypes.node,
	isDraggable: PropTypes.bool,
	isBeingDragged: PropTypes.bool,
	onClick: PropTypes.func
};

export const SortableListItem = SortableElement(ListItem);
export default ListItem;
