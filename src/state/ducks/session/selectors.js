const isAuthenticated = (session) => Boolean(session.user),
	isLoading = (session) => session.loading,
	getUsername = (session) => session.user && session.user.username;

export {
	isAuthenticated,
	isLoading,
	getUsername
};
