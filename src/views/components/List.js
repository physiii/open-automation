import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import './List.css';

export const List = (props) => {
	return (
		<div styleName="list">
			{props.title && <h2 styleName="title">{props.title}</h2>}
			<ol>
				{props.items && props.items.length && props.items.map((item, index) => {
					const ListLink = item.link
						? Link
						: 'a';

					return (
						<li styleName="row" key={item.id || index}>
							<ListLink href="#" styleName="link" to={item.link} onClick={(event) => {
								if (typeof item.onClick === 'function') {
									if (!item.link) {
										event.preventDefault();
									}

									item.onClick(item, event);
								}
							}}>
								<Toolbar
									leftChildren={
										<React.Fragment>
											{item.icon && <div styleName="icon">{item.icon}</div>}
											<span styleName="primaryText">{item.label}</span>
										</React.Fragment>
									}
									rightChildren={<span styleName="metaText">{item.meta}</span>} />
							</ListLink>
						</li>
					);
				})}
			</ol>
		</div>
	);
};

List.propTypes = {
	title: PropTypes.string,
	items: PropTypes.array
};

export default List;
