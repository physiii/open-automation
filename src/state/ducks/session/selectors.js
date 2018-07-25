const isAuthenticated = (session) => Boolean(session.user),
	isLoading = (session) => session.loading;

export {
	isAuthenticated,
	isLoading
};
