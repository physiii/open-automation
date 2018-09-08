import React from 'react';
import PropTypes from 'prop-types';
import {withSetScreenActions} from '../components/AppToolbar.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import {loadContext, loadScreen, unloadContext, unloadScreen} from '../../state/ducks/navigation/operations.js';

const Context = React.createContext();

export class NavigationScreen extends React.Component {
	constructor (props) {
		super(props);

		// Side effects should be avoided in component constructors, but this
		// must be called before the sub-tree renders.
		if (props.isContextRoot) {
			this.props.handleContextLoad(this.props.path);
		}
	}

	componentDidMount () {
		this.handleScreenRender();
	}

	componentDidUpdate (previousProps) {
		this.handleScreenRender(previousProps.title !== this.props.title || previousProps.shouldShowTitle !== this.props.shouldShowTitle);
	}

	componentWillUnmount () {
		this.props.handleScreenUnload(this.props.contextPath, this.props.path);
		this.props.setScreenActions(this.props.path, null);

		if (this.props.isContextRoot) {
			this.props.handleContextUnload(this.props.path);
		}
	}

	handleScreenRender (shouldUpdateTitle = true) {
		if (shouldUpdateTitle) {
			this.props.handleScreenLoad(this.props.contextPath, this.props.path, this.props.contextDepth, this.props.location.pathname, this.props.title, this.props.shouldShowTitle);
		}

		this.props.setScreenActions(this.props.path, this.props.toolbarActions);
	}

	render () {
		return (
			<Context.Provider value={{
				path: this.props.isContextRoot ? this.props.path : this.props.contextPath,
				depth: this.props.contextDepth + 1
			}}>
				{this.props.children}
			</Context.Provider>
		);
	}
}

NavigationScreen.propTypes = {
	contextPath: PropTypes.string.isRequired,
	contextDepth: PropTypes.number.isRequired,
	isContextRoot: PropTypes.bool,
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	shouldShowTitle: PropTypes.bool,
	toolbarActions: PropTypes.node,
	children: PropTypes.node,
	location: PropTypes.object.isRequired,
	handleContextLoad: PropTypes.func.isRequired,
	handleContextUnload: PropTypes.func.isRequired,
	handleScreenLoad: PropTypes.func.isRequired,
	handleScreenUnload: PropTypes.func.isRequired,
	setScreenActions: PropTypes.func.isRequired
};

NavigationScreen.defaultProps = {
	contextDepth: 0,
	shouldShowTitle: true
};

const mapDispatchToProps = (dispatch) => ({
		handleContextLoad: (path) => dispatch(loadContext(path)),
		handleContextUnload: (path) => dispatch(unloadContext(path)),
		handleScreenLoad: (context, path, depth, currentFullPath, title, shouldShowTitle) => dispatch(loadScreen(context, path, depth, currentFullPath, title, shouldShowTitle)),
		handleScreenUnload: (context, path) => dispatch(unloadScreen(context, path))
	}),
	withNavigationContext = (Component) => (_props) => {
		if (_props.isContextRoot) {
			return <Component contextPath={_props.path} {..._props} />;
		}

		return (
			<Context.Consumer>
				{(context) => <Component contextPath={context.path} contextDepth={context.depth} {..._props} />}
			</Context.Consumer>
		);
	};

export default withRouter(connect(null, mapDispatchToProps)(withSetScreenActions(withNavigationContext(NavigationScreen))));
