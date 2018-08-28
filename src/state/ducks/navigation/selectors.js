const SECOND_TO_LAST = -2,
	getContext = (navigation, contextPath, toJs = true) => {
		const context = navigation.contexts.get(contextPath || navigation.currentContext);

		if (!context) {
			return;
		}

		return toJs ? context.toJS() : context;
	},
	getCurrentContext = (navigation, toJs = true) => {
		const context = getContext(navigation, navigation.currentContext, toJs);

		if (!context) {
			return;
		}

		return toJs ? context.toJS() : context;
	},
	getContextScreens = (navigation, contextPath, toJs = true) => {
		const screens = navigation.contexts.getIn([
			contextPath || navigation.currentContext,
			'screens'
		]);

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
	getCurrentScreenTitle = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return currentScreen && currentScreen.get('title');
	},
	getCurrentScreenPath = (navigation) => {
		const currentScreen = getCurrentScreenInfo(navigation, false);

		return currentScreen && currentScreen.get('path');
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
	getCurrentContext,
	getContextScreens,
	getContextCurrentFullPath,
	getCurrentScreenInfo,
	getCurrentScreenPath,
	getCurrentScreenTitle,
	shouldShowCurrentScreenTitle,
	getPreviousScreenInfo,
	getPreviousScreenPath,
	getPreviousScreenTitle
};
