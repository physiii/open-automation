import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withAppContext} from '../AppContext.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {loadContext, loadScreen, unloadContext, unloadScreen} from '../../state/ducks/navigation/operations.js';
import './NavigationScreen.css';

const NavigationContext = React.createContext();

export class NavigationScreen extends React.Component {
	constructor (props) {
		super(props);

		this.childScreenContainer = React.createRef();

		// Side effects should be avoided in component constructors, but this
		// must be called before the sub-tree renders.
		if (props.isContextRoot) {
			this.props.handleContextLoad(this.props.path);
		}
	}

	componentDidMount () {
		this.handleScreenUpdate();
	}

	componentDidUpdate (previousProps) {
		this.handleScreenUpdate(previousProps.title !== this.props.title);
	}

	componentWillUnmount () {
		this.props.handleScreenUnload(this.props.contextPath, this.props.path);
		this.props.setScreenActions(this.props.path, null);
		this.props.setScreenBackActions(this.props.path, null);

		if (this.props.isContextRoot) {
			this.props.handleContextUnload(this.props.path);
		}
	}

	handleScreenUpdate (shouldUpdateTitle = true) {
		if (shouldUpdateTitle) {
			this.props.handleScreenLoad(this.props.contextPath, this.props.path, this.props.contextDepth, this.props.location.pathname, this.props.title, !this.props.isContextRoot);
		}

		this.props.setScreenActions(this.props.path, this.props.toolbarActions);
		this.props.setScreenBackActions(this.props.path, this.props.toolbarBackAction);
	}

	render () {
		const content = (
			<NavigationContext.Provider value={{
				path: this.props.isContextRoot ? this.props.path : this.props.contextPath,
				depth: this.props.contextDepth + 1,
				childContainer: this.childScreenContainer
			}}>
				<div styleName="screen">
					{this.props.children}
					<div ref={this.childScreenContainer} />
				</div>
			</NavigationContext.Provider>
		);

		if (this.props.contextChildContainer && this.props.contextChildContainer.current) {
			return ReactDOM.createPortal(content, this.props.contextChildContainer.current);
		}

		return content;
	}
}

NavigationScreen.propTypes = {
	contextPath: PropTypes.string.isRequired,
	contextDepth: PropTypes.number.isRequired,
	contextChildContainer: PropTypes.object,
	isContextRoot: PropTypes.bool,
	path: PropTypes.string.isRequired,
	title: PropTypes.string,
	toolbarActions: PropTypes.node,
	toolbarBackAction: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
	children: PropTypes.node,
	location: PropTypes.object.isRequired,
	handleContextLoad: PropTypes.func.isRequired,
	handleContextUnload: PropTypes.func.isRequired,
	handleScreenLoad: PropTypes.func.isRequired,
	handleScreenUnload: PropTypes.func.isRequired,
	setScreenActions: PropTypes.func.isRequired,
	setScreenBackActions: PropTypes.func.isRequired
};

NavigationScreen.defaultProps = {
	contextDepth: 0
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
			<NavigationContext.Consumer>
				{(context) => <Component contextPath={context.path} contextDepth={context.depth} contextChildContainer={context.childContainer} {..._props} />}
			</NavigationContext.Consumer>
		);
	};

export default compose(
	connect(null, mapDispatchToProps, null, {pure: false}),
	withRouter,
	withAppContext,
	withNavigationContext
)(NavigationScreen);
