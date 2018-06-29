import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Toolbar from './Toolbar.js';
import './List.css';

export const List = (props) => {
	return (
		<ol styleName="list">
			{props.items && props.items.length && props.items.map((item, index) => (
				<li styleName="row" key={item.id || index}>
					<Link styleName="link" to={item.link} onClick={(event) => {

						if (typeof item.onClick === 'function') {
							item.onClick(item, event);
						}
					}}>
						<Toolbar
							leftChildren={<span styleName="primaryText">{item.label}</span>}
							rightChildren={<span styleName="metaText">{item.meta}</span>} />
					</Link>
				</li>
			))}
		</ol>
	);
};

List.propTypes = {
	items: PropTypes.array
};

export default List;
