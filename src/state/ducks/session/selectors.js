const isAuthenticated = (session) => Boolean(session.user.token);

export {
	isAuthenticated
};
