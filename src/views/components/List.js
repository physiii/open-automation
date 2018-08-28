import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import './List.css';

export const List = (props) => {
	const ListElement = props.isOrdered ? 'ol' : 'ul';

	return (
		<div styleName="list">
			{props.title && <h2 styleName="title">{props.title}</h2>}
			<ListElement>
				{props.items && Boolean(props.items.length) && props.items.map((item, index) => {
					const ListLink = item.link
						? Link
						: 'a';

					return (
						<li styleName="row" key={item.key || index}>
							<ListLink href="#" styleName="link" to={item.link} onClick={(event) => {
								if (!item.link) {
									event.preventDefault();
								}

								if (typeof item.onClick === 'function') {
									item.onClick(item, event);
								}
							}}>
								<Toolbar
									leftChildren={
										<React.Fragment>
											{item.icon && <div styleName="icon">{item.icon}</div>}
											<div styleName="rowText">
												<span styleName="primaryText">{item.label}</span>
												{item.secondaryText && <span styleName="secondaryText">{item.secondaryText}</span>}
												{item.tertiaryText && <span styleName="tertiaryText">{item.tertiaryText}</span>}
											</div>
										</React.Fragment>
									}
									rightChildren={<span styleName="metaText">{item.meta}</span>} />
							</ListLink>
						</li>
					);
				})}
			</ListElement>
		</div>
	);
};

List.propTypes = {
	title: PropTypes.string,
	items: PropTypes.array,
	isOrdered: PropTypes.bool
};

export default List;
