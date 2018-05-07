import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button.js';

export const List = (props) => {
	return (
		<ol>
			{props.items && (props.items.length || props.items.size)
				? props.items.map((item, index) => {
					return (
						<li key={item.id || index}>
							<Button to={item.link} onClick={(event) => item.onClick(item, event)}>
								{item.label}
							</Button>
						</li>
					);
				})
				: null }
		</ol>
	);
};

List.propTypes = {
	items: PropTypes.object // TODO: Immutable List proptype (also allow array)
};

export default List;
