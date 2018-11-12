import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import './List.css';

export const List = (props) => {
	const ListElement = props.isOrdered ? 'ol' : 'ul';

	if (!props.children.length && !props.renderIfEmpty) {
		return null;
	}

	return (
		<div styleName="list">
			{props.title && <h2 styleName="title">{props.title}</h2>}
			<ListElement>
				{props.children && Boolean(props.children.length) && props.children.map((item, index) => {
					const LinkComponent = item.link ? Link : 'a',
						itemContent = (
							<div styleName="rowContentInner">
								{item.icon && <div styleName="rowIcon">{item.icon}</div>}
								<div styleName="rowText">
									<span styleName="primaryText">
										{item.label}
										{item.meta && <span styleName="metaText">{item.meta}</span>}
									</span>
									{item.secondaryText && <span styleName="secondaryText">{item.secondaryText}</span>}
									{item.tertiaryText && <span styleName="tertiaryText">{item.tertiaryText}</span>}
								</div>
							</div>
						);

					return (
						<li styleName="row" key={item.key || index}>
							{item.link || item.onClick
								? <LinkComponent href="#" styleName="rowContent" to={item.link} onClick={(event) => {
									if (!item.link) {
										event.preventDefault();
									}

									if (typeof item.onClick === 'function') {
										item.onClick(item, event);
									}
								}}>
									{itemContent}
								</LinkComponent>
								: <div styleName="rowContent">
									{itemContent}
								</div>
							}
							{item.secondaryAction &&
								<div styleName="rowActions">{item.secondaryAction}</div>}
						</li>
					);
				})}
			</ListElement>
		</div>
	);
};

List.propTypes = {
	title: PropTypes.string,
	children: PropTypes.arrayOf(PropTypes.shape({
		label: PropTypes.node,
		secondaryText: PropTypes.node,
		tertiaryText: PropTypes.node,
		icon: PropTypes.node,
		meta: PropTypes.node,
		link: PropTypes.string,
		secondaryAction: PropTypes.node,
		onClick: PropTypes.func
	})),
	isOrdered: PropTypes.bool,
	renderIfEmpty: PropTypes.bool
};

List.defaultProps = {
	renderIfEmpty: true
};

export default List;
