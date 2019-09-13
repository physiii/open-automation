const SECOND_TO_LAST = -2,
	getContext = (navigation, contextPath, toJs = true) => {
		const context = navigation.contexts.get(contextPath || navigation.currentContext);

		if (!context) {
			return;
		}

		return toJs ? context.toJS() : context;
	},
	getCurrentContext = (navigation, toJs = true) => {
		return getContext(navigation, navigation.currentContext, toJs);
	},
	getCurrentContextPath = (navigation) => {
		const context = getContext(navigation, navigation.currentContext, false);

		if (!context) {
			return;
		}

		return context.get('path');
	},
	getContextScreens = (navigation, contextPath, toJs = true) => {
		const screens = navigation.contexts.getIn([
			contextPath || navigation.currentContext,
			'screens'
		]);

		if (!screens) {
			return;
		}

		return toJs ? screens.toList().toJS() : screens;
	},
	getContextCurrentFullPath = (navigation, contextPath) => {
		const context = getContext(navigation, contextPath || navigation.currentContext, false);

		return context && context.get('currentFullPath');
	},
	getCurrentScreenInfo = (navigation, toJs = true) => {
		const screens = getContextScreens(navigation, navigation.currentContext, false),
			screen = screens && screens.last();

		if (!screen) {
			return;
		}

		return toJs ? screen.toJS() : screen;
	},
	getCurrentScreenPath = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return currentScreen && currentScreen.get('path');
	},
	getCurrentScreenTitle = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return currentScreen && currentScreen.get('title');
	},
	getCurrentScreenDepth = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return (currentScreen || 0) && currentScreen.get('depth');
	},
	shouldShowCurrentScreenTitle = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return currentScreen && currentScreen.get('shouldShowTitle');
	},
	getPreviousScreenInfo = (navigation, toJs = true) => {
		const screens = getContextScreens(navigation, navigation.currentContext, false),
			screen = screens && screens.toList().get(SECOND_TO_LAST);

		if (!screen) {
			return;
		}

		return toJs ? screen.toJS() : screen;
	},
	getPreviousScreenPath = (navigation) => {
		const previousScreen = getPreviousScreenInfo(navigation, false);

		return previousScreen && previousScreen.get('path');
	},
	getPreviousScreenTitle = (navigation) => {
		const previousScreen = getPreviousScreenInfo(navigation, false);

		return previousScreen && previousScreen.get('title');
	};

export {
	getContext,
	getCurrentContext,
	getCurrentContextPath,
	getContextScreens,
	getContextCurrentFullPath,
	getCurrentScreenInfo,
	getCurrentScreenPath,
	getCurrentScreenTitle,
	getCurrentScreenDepth,
	shouldShowCurrentScreenTitle,
	getPreviousScreenInfo,
	getPreviousScreenPath,
	getPreviousScreenTitle
};
