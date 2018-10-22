import React from 'react';
import PropTypes from 'prop-types';
import styles from './MetaList.css';

export const MetaList = (props) => {
	const areLabelsLeft = props.alignLabels === 'left',
		layout = areLabelsLeft ? 'vertical' : props.layout,
		ItemElement = !areLabelsLeft ? 'div' : React.Fragment,
		getItemElementProps = (item) => {
			return ItemElement !== React.Fragment
				? {className: item.long ? styles['item-long'] : styles.item}
				: {};
		};

	return (
		<dl className={styles['list-' + layout]}>
			{props.children.map((item, index) => (
				<ItemElement {...getItemElementProps(item)} key={index}>
					<dt className={styles['label' + (areLabelsLeft ? '-left' : '-top')]}>{item.label}</dt>
					<dd className={styles['value' + (props.alignValuesRight ? '-right' : '')]}>{item.value}</dd>
				</ItemElement>
			))}
		</dl>
	);
};

MetaList.defaultProps = {
	children: [],
	layout: 'horizontal',
	alignLabels: 'top'
};

MetaList.propTypes = {
	children: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.string,
		value: PropTypes.string
	})),
	layout: PropTypes.oneOf(['horizontal', 'vertical']),
	alignLabels: PropTypes.oneOf(['top', 'left']),
	alignValuesRight: PropTypes.bool
};

export default MetaList;
