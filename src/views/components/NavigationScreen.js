import React from 'react';
import PropTypes from 'prop-types';
import {withContextPath} from './NavigationContext.js';
import {withSetScreenActions} from '../components/AppToolbar.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {loadScreen, unloadScreen} from '../../state/ducks/navigation/operations.js';

export class NavigationScreen extends React.Component {
	constructor (props) {
		super(props);

		// Side effects should be avoided in component constructors, but this
		// must be called before the sub-tree renders.
		this.handleScreenRender();
	}

	componentDidUpdate (previousProps) {
		this.handleScreenRender(previousProps.title !== this.props.title || previousProps.shouldShowTitle !== this.props.shouldShowTitle);
	}

	componentWillUnmount () {
		this.props.handleScreenUnload(this.props.contextPath, this.props.path);
		this.props.setScreenActions(this.props.path, null);
	}

	handleScreenRender (shouldUpdateTitle = true) {
		if (shouldUpdateTitle) {
			this.props.handleScreenLoad(this.props.contextPath, this.props.path, this.props.location.pathname, this.props.title, this.props.shouldShowTitle);
		}

		this.props.setScreenActions(this.props.path, this.props.toolbarActions);
	}

	render () {
		return this.props.children;
	}
}

NavigationScreen.propTypes = {
	contextPath: PropTypes.string.isRequired,
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	shouldShowTitle: PropTypes.bool,
	toolbarActions: PropTypes.node,
	children: PropTypes.node,
	location: PropTypes.object.isRequired,
	handleScreenLoad: PropTypes.func.isRequired,
	handleScreenUnload: PropTypes.func.isRequired,
	setScreenActions: PropTypes.func.isRequired
};

NavigationScreen.defaultProps = {
	shouldShowTitle: true
};

const mapDispatchToProps = (dispatch) => ({
	handleScreenLoad: (context, path, currentFullPath, title, shouldShowTitle) => dispatch(loadScreen(context, path, currentFullPath, title, shouldShowTitle)),
	handleScreenUnload: (context, path) => dispatch(unloadScreen(context, path))
});

export default withRouter(connect(null, mapDispatchToProps)(withSetScreenActions(withContextPath(NavigationScreen))));
