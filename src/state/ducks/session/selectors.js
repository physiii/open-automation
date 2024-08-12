const isAuthenticated = (session) => Boolean(session.user),
	isLoading = (session) => session.loading,
	getUsername = (session) => session.user && session.user.username,
	getArmed = (session) => session.armed;

export {
	isAuthenticated,
	isLoading,
	getUsername,
	getArmed
};
