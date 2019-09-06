import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {withAppContext} from '../AppContext.js';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'redux';
import {loadContext, loadScreen, unloadContext, unloadScreen} from '../../state/ducks/navigation/operations.js';
import './NavigationScreen.css';

const Context = React.createContext();

export class NavigationScreen extends React.Component {
	constructor (props) {
		super(props);

		this.childScreenContainer = React.createRef();

		// Side effects should be avoided in component constructors, but this
		// must be called before the sub-tree renders.
		if (props.isContextRoot) {
			this.props.handleContextLoad(this.props.url);
		}

		this.handleScreenUpdate();
	}

	componentDidMount () {
		this.handleScreenUpdate();
	}

	componentDidUpdate (previousProps) {
		this.handleScreenUpdate(previousProps.title !== this.props.title);
	}

	componentWillUnmount () {
		this.props.handleScreenUnload(this.props.contextUrl, this.props.url);
		this.props.clearScreenActions(this.props.url);
		this.props.clearScreenBackActions(this.props.url);

		if (this.props.isContextRoot) {
			this.props.handleContextUnload(this.props.url);
		}
	}

	handleScreenUpdate (shouldUpdateTitle = true) {
		if (shouldUpdateTitle) {
			this.props.handleScreenLoad(this.props.contextUrl, this.props.url, this.props.contextDepth, this.props.location.pathname, this.props.title, !this.props.isContextRoot);
		}

		this.props.setScreenActions(this.props.url, this.props.toolbarActions);
		this.props.setScreenBackActions(this.props.url, this.props.toolbarBackAction);
	}

	render () {
		const content = (
			<Context.Provider value={{
				url: this.props.isContextRoot ? this.props.url : this.props.contextUrl,
				depth: this.props.contextDepth + 1,
				childContainer: this.childScreenContainer
			}}>
				<div styleName="screen">
					{this.props.children}
				</div>
				<div ref={this.childScreenContainer} />
			</Context.Provider>
		);

		if (this.props.contextChildContainer && this.props.contextChildContainer.current) {
			return ReactDOM.createPortal(content, this.props.contextChildContainer.current);
		}

		return content;
	}
}

NavigationScreen.propTypes = {
	contextUrl: PropTypes.string.isRequired,
	contextDepth: PropTypes.number.isRequired,
	contextChildContainer: PropTypes.object,
	isContextRoot: PropTypes.bool,
	url: PropTypes.string.isRequired,
	title: PropTypes.string,
	toolbarActions: PropTypes.node,
	toolbarBackAction: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.object]),
	children: PropTypes.node,
	location: PropTypes.object.isRequired,
	handleContextLoad: PropTypes.func.isRequired,
	handleContextUnload: PropTypes.func.isRequired,
	handleScreenLoad: PropTypes.func.isRequired,
	handleScreenUnload: PropTypes.func.isRequired,
	setScreenActions: PropTypes.func.isRequired,
	clearScreenActions: PropTypes.func.isRequired,
	setScreenBackActions: PropTypes.func.isRequired,
	clearScreenBackActions: PropTypes.func.isRequired
};

NavigationScreen.defaultProps = {
	contextDepth: 0
};

const mapDispatchToProps = (dispatch) => ({
		handleContextLoad: (url) => dispatch(loadContext(url)),
		handleContextUnload: (url) => dispatch(unloadContext(url)),
		handleScreenLoad: (context, url, depth, currentFullUrl, title, shouldShowTitle) => dispatch(loadScreen(context, url, depth, currentFullUrl, title, shouldShowTitle)),
		handleScreenUnload: (context, url) => dispatch(unloadScreen(context, url))
	}),
	withNavigationContext = (Component) => (_props) => {
		if (_props.isContextRoot) {
			return <Component contextUrl={_props.url} {..._props} />;
		}

		return (
			<Context.Consumer>
				{(context) => <Component contextUrl={context.url} contextDepth={context.depth} contextChildContainer={context.childContainer} {..._props} />}
			</Context.Consumer>
		);
	};

export default compose(
	connect(null, mapDispatchToProps, null, {pure: false}),
	withRouter,
	withAppContext(),
	withNavigationContext
)(NavigationScreen);
