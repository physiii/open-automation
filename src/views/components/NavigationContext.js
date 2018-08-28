import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {loadContext, unloadContext} from '../../state/ducks/navigation/operations.js';

const Context = React.createContext();

export class NavigationContext extends React.Component {
	constructor (props) {
		super(props);

		// Side effects should be avoided in component constructors, but this
		// must be called before the sub-tree renders.
		this.props.handleContextLoad(this.props.path, this.props.location.pathname, this.props.title, this.props.shouldShowTitle);
	}

	componentWillUnmount () {
		this.props.handleContextUnload(this.props.path);
	}

	render () {
		return (
			<Context.Provider value={this.props.path}>
				{this.props.children}
			</Context.Provider>
		);
	}
}

NavigationContext.propTypes = {
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	shouldShowTitle: PropTypes.bool,
	children: PropTypes.node,
	location: PropTypes.object.isRequired,
	handleContextLoad: PropTypes.func.isRequired,
	handleContextUnload: PropTypes.func.isRequired
};

NavigationContext.defaultProps = {
	shouldShowTitle: true
};

export const withContextPath = (Component) => (props) => (
	<Context.Consumer>
		{(context) => <Component contextPath={context} {...props} />}
	</Context.Consumer>
);

const mapDispatchToProps = (dispatch) => ({
	handleContextLoad: (path, title, shouldShowTitle) => dispatch(loadContext(path, title, shouldShowTitle)),
	handleContextUnload: (path) => dispatch(unloadContext(path))
});

export default withRouter(connect(null, mapDispatchToProps)(NavigationContext));
