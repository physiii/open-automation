import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Toolbar from '../components/Toolbar.js';
import Button from '../components/Button.js';
import ModalShelf from '../components/ModalShelf.js';
import ArmMenu from '../components/ArmMenu.js';
import UserIcon from '../icons/UserIcon.js';
import ShieldIcon from '../icons/ShieldIcon.js';
import ShieldCrossedIcon from '../icons/ShieldCrossedIcon.js';
import {withAppContext} from '../AppContext.js';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {getAppName, getLogoPath} from '../../state/ducks/config/selectors.js';
import {getCurrentScreenTitle, getCurrentScreenDepth, shouldShowCurrentScreenTitle, getPreviousScreenPath, getPreviousScreenTitle} from '../../state/ducks/navigation/selectors.js';
import {getUsername, getArmed} from '../../state/ducks/session/selectors.js';
import {setArmed} from '../../state/ducks/session/operations.js';
import './AppToolbar.css';

const ARMED_STAY = 1,
	ARMED_AWAY = 2;

export const AppToolbar = (props) => { // eslint-disable-line max-statements, complexity
	const [shelfIsShowing, setShelfIsShowing] = useState(false),
		isArmed = props.armed === ARMED_AWAY || props.armed === ARMED_STAY,
		setArmedMode = (mode) => {
			if (props.armed === mode) {
				return;
			}

			props.setArmed(mode);
			setShelfIsShowing(false);
		};

	let backLabel = props.previousScreenTitle,
		backProps,
		left;

	if (props.backAction && typeof props.backAction === 'object' && !React.isValidElement(props.backAction)) {
		backProps = {
			onClick: props.backAction.onClick,
			to: props.backAction.to || props.previousScreenUrl
		};
		backLabel = props.backAction.label;
	} else if (typeof props.backAction === 'function') {
		backProps = {onClick: props.backAction};
	} else if (typeof props.backAction === 'string') {
		backProps = {to: props.backAction};
	}

	if (backProps || (!props.backAction && !props.isRootScreen)) {
		left = (
			<Button to={props.previousScreenUrl} {...backProps}>
				&lt;
				{backLabel && ' ' + backLabel}
			</Button>
		);
	} else if (props.backAction) {
		left = props.backAction;
	} else if (props.logoPath) {
		left = (
			<div styleName="logo">
				<img src={props.logoPath} />
			</div>
		);
	} else {
		left = <h1>{props.appName}</h1>;
	}

	return (
		<div styleName="toolbar">
			<Toolbar
				leftChildren={left}
				middleChildren={props.title && props.shouldShowTitle && <h1>{props.title}</h1>}
				rightChildren={
					<React.Fragment>
						{props.screenActions}
						{props.isRootScreen ? <React.Fragment>
							<button styleName={'armedButton' + (isArmed ? ' isArmed' : '')} onClick={() => setShelfIsShowing(true)}>
								{isArmed
									? <ShieldIcon shieldChecked={true} size={24} />
									: <ShieldCrossedIcon size={24} />}
							</button>
							<button styleName="userButton" onClick={() => setShelfIsShowing(true)}>
								<UserIcon size={24} />
							</button>
						</React.Fragment> : null}
						{shelfIsShowing &&
							<ModalShelf hide={() => setShelfIsShowing(false)}>
								<section styleName="user">
									<h1 styleName="username">{props.username}</h1>
									<Button to="/logout">Logout</Button>
								</section>
								<section styleName="security">
									<h1 styleName="securityTitle">Security</h1>
									<ArmMenu mode={props.armed} setArmed={setArmedMode} />
								</section>
							</ModalShelf>}
					</React.Fragment>
				}
			/>
		</div>
	);
};

AppToolbar.propTypes = {
	appName: PropTypes.string,
	logoPath: PropTypes.string,
	title: PropTypes.string,
	isRootScreen: PropTypes.bool,
	shouldShowTitle: PropTypes.bool,
	backAction: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.object]),
	previousScreenTitle: PropTypes.string,
	previousScreenUrl: PropTypes.string,
	screenActions: PropTypes.node,
	username: PropTypes.string,
	armed: PropTypes.number,
	setArmed: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
		return {
			appName: getAppName(state.config),
			logoPath: getLogoPath(state.config),
			title: getCurrentScreenTitle(state.navigation),
			isRootScreen: getCurrentScreenDepth(state.navigation) < 1,
			shouldShowTitle: shouldShowCurrentScreenTitle(state.navigation),
			screenActions: ownProps.navigationScreenActions,
			backAction: ownProps.navigationScreenBackAction,
			previousScreenTitle: getPreviousScreenTitle(state.navigation),
			previousScreenUrl: getPreviousScreenPath(state.navigation),
			username: getUsername(state.session),
			armed: getArmed(state.session)
		};
	},
	mapDispatchToProps = (dispatch) => ({
		setArmed: (mode) => dispatch(setArmed(mode))
	});

export default compose(
	withAppContext({includeScreenActions: true}),
	connect(mapStateToProps, mapDispatchToProps)
)(AppToolbar);
