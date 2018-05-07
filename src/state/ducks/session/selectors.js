const isAuthenticated = (session) => Boolean(session.user && session.user.token);

export {
	isAuthenticated
};
